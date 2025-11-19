<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nilo-Chat-App - Sohbet Odası (Kalıcı ve Online)</title>
    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script> 
    <style>
        /* CSS stilleri aynı kalır */
        body { font-family: Arial, sans-serif; background-color: #f4f7f6; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .main-wrapper { display: flex; width: 100%; max-width: 900px; height: 80vh; gap: 20px; }
        .online-sidebar { background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); width: 200px; display: flex; flex-direction: column; }
        .chat-container { background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); flex-grow: 1; display: flex; flex-direction: column; }
        h1 { text-align: center; color: #3b5998; margin-top: 0; }
        h3 { color: #008000; margin-top: 0; }
        #messages { flex-grow: 1; border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; overflow-y: scroll; background: #fafafa; border-radius: 5px; }
        #messages li { list-style: none; padding: 5px 0; border-bottom: 1px dotted #eee; }
        .online-list li { color: #008000; font-weight: bold; list-style: disc; margin-left: 20px; }
        .message-form { display: flex; }
        #m { flex-grow: 1; padding: 10px; border: 1px solid #ccc; border-radius: 5px 0 0 5px; }
        button { padding: 10px 15px; background-color: #3b5998; color: white; border: none; border-radius: 0 5px 5px 0; cursor: pointer; }
        .username { font-weight: bold; color: #4682b4; }
        .time { font-size: 0.7em; color: #999; margin-left: 10px; }
        .logout-btn { margin-top: 10px; padding: 5px 10px; background-color: #dc3545; border-radius: 5px; font-size: 0.9em; align-self: flex-end;}
    </style>
</head>
<body>
    <div class="main-wrapper">
        <div class="online-sidebar">
            <h3>🟢 Çevrimiçi Kullanıcılar</h3>
            <ul id="online-users" class="online-list">
                </ul>
        </div>
        
        <div class="chat-container">
            <button class="logout-btn" onclick="logout()">Çıkış Yap (<span id="user-name"></span>)</button>
            <h1>Nilo-Chat-App Sohbet Odası</h1>
            <ul id="messages"></ul>
            <form class="message-form" id="chat-form">
                <input id="m" autocomplete="off" placeholder="Mesajınızı buraya yazın..." />
                <button>Gönder</button>
            </form>
        </div>
    </div>

    <script>
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const messages = document.getElementById('messages');
        const form = document.getElementById('chat-form');
        const input = document.getElementById('m');
        const userNameDisplay = document.getElementById('user-name');
        const onlineUsersList = document.getElementById('online-users');

        if (!storedUser || !storedUser.name) {
            window.location.href = 'login.html'; 
        } else {
            userNameDisplay.textContent = storedUser.name;
        }

        // BURASI DÜZELTİLDİ! RENDER URL'Sİ KESİN OLARAK EKLENDİ!
        const socket = io('https://nilo-chat-app.onrender.com'); 

        // 1. Kullanıcı Bağlanınca Adını Sunucuya Gönder (Gerekli!)
        socket.on('connect', () => {
             socket.emit('register user', storedUser.name);
        });
        
        // 2. Çevrimiçi Kullanıcı Listesini Al ve Güncelle
        socket.on('online users', (userList) => {
            onlineUsersList.innerHTML = '';
            userList.forEach(user => {
                const item = document.createElement('li');
                item.textContent = user;
                onlineUsersList.appendChild(item);
            });
        });


        // 3. Sohbet Geçmişini Yükle
        socket.on('history', (historyMessages) => {
            messages.innerHTML = '';
            historyMessages.forEach(msg => {
                addMessage(msg.name, msg.text, false, msg.time);
            });
        });


        socket.on('welcome', (data) => {
             addMessage('SİSTEM', data.message, true);
        });

        // Backend'den gelen yeni mesajı al
        socket.on('chat message', (msg) => {
            addMessage(msg.name, msg.text, false, msg.time); 
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (input.value) {
                socket.emit('chat message', { 
                    name: storedUser.name, 
                    message: input.value
                });
                input.value = '';
            }
        });

        function addMessage(user, text, isSystem = false, time = '') {
            const item = document.createElement('li');
            let content = '';
            
            if (isSystem) {
                content = `<span style="color: red;">[${user}]</span> ${text}`;
            } else {
                content = `<span class="username">${user}:</span> ${text}<span class="time">${time}</span>`;
            }

            item.innerHTML = content;
            messages.appendChild(item);
            
            messages.scrollTop = messages.scrollHeight;
        }

        function logout() {
            localStorage.removeItem('user'); 
            window.location.href = 'login.html'; 
        }
    </script>
</body>
</html>