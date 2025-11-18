// server.js - Nilo-Chat-App Backend (MongoDB devre dışı, Dosya tabanlı Kayıt)

const express = require('express');
const cors = require('cors');
const fs = require('fs'); // Dosya okuma/yazma kütüphanesi
const bcrypt = require('bcrypt');
const http = require('http'); 
const { Server } = require("socket.io"); 

const app = express(); 
const PORT = 3000;
const USERS_FILE = 'users.json'; // Kullanıcı verilerini saklamak için dosya adı

// Express uygulamasını HTTP sunucusuna bağla ve Socket.IO'yu kur
const server = http.createServer(app); 
const io = new Server(server, { 
    cors: { 
        origin: "null" 
    } 
});

// Middleware'ler
app.use(cors()); 
app.use(express.json()); 


// --- Dosya Tabanlı Kullanıcı İşlevleri ---

// Kullanıcı verilerini dosyadan okur
const getUsers = () => {
    try {
        const data = fs.readFileSync(USERS_FILE);
        return JSON.parse(data);
    } catch (error) {
        // Dosya yoksa veya bozuksa boş bir dizi döner
        return [];
    }
};

// Kullanıcı verilerini dosyaya yazar
const saveUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// --- API ROTASI: Kullanıcı Kayıt (Dosya Tabanlı) ---
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Tüm alanlar zorunludur.' });
    }
    
    const users = getUsers();
    
    if (users.find(user => user.email === email)) {
        return res.status(409).json({ success: false, message: 'Bu e-posta zaten kayıtlı.' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10); 
        const newUser = { id: Date.now(), name, email, password: hashedPassword };
        users.push(newUser);
        saveUsers(users);
        
        res.status(201).json({ success: true, message: 'Kayıt başarılı!', user: { id: newUser.id, name, email } });
    } catch (error) {
        console.error('Kayıt sırasında hata:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});

// --- API ROTASI: Kullanıcı Girişi (LOGIN) (Dosya Tabanlı) ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'E-posta ve şifre gereklidir.' });
    }
    
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
        return res.status(401).json({ success: false, message: 'E-posta veya şifre hatalı.' }); 
    }
    
    try {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            res.status(200).json({ 
                success: true, 
                message: 'Giriş başarılı!', 
                user: { id: user.id, name: user.name, email: user.email } 
            });
        } else {
            res.status(401).json({ success: false, message: 'E-posta veya şifre hatalı.' });
        }
    } catch (error) {
        console.error('Giriş sırasında sunucu hatası:', error); 
        res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
});


// --- Online Kullanıcı Takibi (Socket.IO) ---
const onlineUsers = {}; 

// Tüm kullanıcılara güncel çevrimiçi listesini gönderen fonksiyon
function updateOnlineUsers() {
    const userList = Object.keys(onlineUsers);
    io.emit('online users', userList);
    console.log(`[ONLINE] Şu anki kullanıcılar: ${userList.join(', ')}`);
}


// --- Socket.IO ve Express için Bağlantı Yönetimi (Canlı Sohbet) ---
io.on('connection', async (socket) => { 
    console.log(`Yeni kullanıcı bağlandı: ${socket.id}`);
    
    // 1. Kullanıcı Bağlanınca Adını Kaydet ve Listeyi Güncelle
    socket.on('register user', (userName) => {
        socket.userName = userName;
        onlineUsers[userName] = socket.id;
        updateOnlineUsers();
    });

    socket.emit('welcome', { message: 'Nilo-Chat-App sunucusuna hoş geldiniz!' });

    socket.on('chat message', (msg) => { 
        const username = msg.name || 'Misafir';
        const messageTime = new Date().toLocaleTimeString('tr-TR');
        
        // Mesajı tüm istemcilere yayınla
        io.emit('chat message', { 
            name: username, 
            text: msg.message, 
            time: messageTime 
        }); 
        console.log(`[MESAJ] ${username}: ${msg.message}`);
    });

    socket.on('disconnect', () => {
        if (socket.userName) {
            delete onlineUsers[socket.userName];
            updateOnlineUsers();
            console.log(`Kullanıcı bağlantıyı kesti: ${socket.userName}`);
        }
    });
});


// Sunucuyu Başlat
server.listen(PORT, () => { 
    console.log(`Nilo-Chat-App Backend sunucusu http://localhost:${PORT} adresinde çalışıyor...`);
    console.log(`Kayıtlar bu klasördeki ${USERS_FILE} dosyasına yazılacaktır. (MongoDB devre dışıdır)`);
});