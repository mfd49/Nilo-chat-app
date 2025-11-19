const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const socketio = require('socket.io');
const http = require('http'); 
const cors = require('cors');

const app = express();
const server = http.createServer(app); 

// Middleware
app.use(express.json());
app.use(cors()); 

// Socket.IO Kurulumu
// YENİ VE KESİN CORS DÜZELTMESİ BURADA!
const io = socketio(server, {
    cors: {
        // Yeni Netlify URL'leri ve eskileri, bağlantıya izin verilen kaynaklar.
        origin: [
            "https://melodious-capybara-603ee8.netlify.app", 
            "https://teal-pony-3104ac.netlify.app" 
        ],
        methods: ["GET", "POST"]
    }
});

// MongoDB Bağlantısı
// Bağlantı dizeniz Render ortam değişkenlerinden alınacak
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB\'ye başarıyla bağlandı.'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Kullanıcı Şeması
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// Aktif Kullanıcıları Takip Etmek İçin
let activeUsers = {}; // { id: username }

// Socket.IO Bağlantıları
io.on('connection', (socket) => {
    console.log('Yeni bir kullanıcı bağlandı:', socket.id);

    socket.on('login', ({ username }) => {
        // Kullanıcıyı aktif listeye ekle
        activeUsers[socket.id] = username;
        // Tüm kullanıcılara listeyi güncelleme emri gönder
        io.emit('update users', Object.values(activeUsers));
        console.log(`${username} giriş yaptı. Aktif kullanıcılar: ${Object.values(activeUsers).length}`);
    });

    socket.on('chat message', (msg) => {
        // Gelen mesajı tüm kullanıcılara geri gönder
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        const disconnectedUsername = activeUsers[socket.id];
        delete activeUsers[socket.id];
        // Kullanıcı listesini güncelle
        io.emit('update users', Object.values(activeUsers));
        console.log(`Kullanıcı ayrıldı: ${disconnectedUsername}. Aktif kullanıcılar: ${Object.values(activeUsers).length}`);
    });
});

// Kayıt Yolu
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Şifreyi şifrele
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: 'Kayıt başarıyla tamamlandı.' });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ message: 'Bu e-posta veya kullanıcı adı zaten kullanımda.' });
        } else {
            console.error('Kayıt Hatası:', err);
            res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu.' });
        }
    }
});

// Giriş Yolu
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'E-posta veya şifre hatalı.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'E-posta veya şifre hatalı.' });
        }

        // Token oluşturma (Gerekli değilse kaldırılabilir, ama oturum için faydalı)
        const token = jwt.sign({ userId: user._id }, 'gizli-anahtar', { expiresIn: '1h' });

        res.status(200).json({ 
            message: 'Giriş başarılı!', 
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Giriş Hatası:', err);
        res.status(500).json({ message: 'Giriş sırasında bir hata oluştu.' });
    }
});

// Sunucuyu Başlatma
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});