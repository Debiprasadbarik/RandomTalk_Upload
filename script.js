const connectBtn = document.getElementById('connectBtn');
        const loadingScreen = document.getElementById('loadingScreen');
        const initialScreen = document.getElementById('initialScreen');
        const chatContainer = document.getElementById('chatContainer');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const endChatBtn = document.getElementById('endChatBtn');
        const messagesContainer = document.getElementById('messages');
        const statusDisplay = document.getElementById('status');

        let ws = null;
        let connectionId = null;

        // Generate a random connection ID
        function generateConnectionId() {
            return 'user-' + Math.random().toString(36).substr(2, 9);
        }

        // Add a message to the chat
        function addMessage(message, isSent) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.classList.add(isSent ? 'sent' : 'received');
            messageElement.textContent = message;
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Connect to WebSocket and start chat
        async function connect() {
            connectionId = generateConnectionId();
            
            // Connect to WebSocket
            ws = new WebSocket(`ws://127.0.0.1:8000/establish_connection?connection_id=${connectionId}`);
            
            ws.onopen = async () => {
                initialScreen.style.display = 'none';
                loadingScreen.style.display = 'block';
                
                // Start searching for a chat partner
                const response = await fetch('http://127.0.0.1:8000/start_chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ connection_id: connectionId })
                });
                
                const status = await response.text();
                statusDisplay.textContent = status;
                
                if (status.includes("Connected")) {
                    loadingScreen.style.display = 'none';
                    chatContainer.style.display = 'flex';
                }
            };

            ws.onmessage = (event) => {
                addMessage(event.data, false);
            };

            ws.onclose = () => {
                statusDisplay.textContent = 'Connection closed';
                chatContainer.style.display = 'none';
                initialScreen.style.display = 'block';
            };
        }

        // Send a message
        function sendMessage() {
            const message = messageInput.value.trim();
            if (message && ws) {
                ws.send(message);
                addMessage(message, true);
                messageInput.value = '';
            }
        }

        // End the chat
        async function endChat() {
            if (connectionId) {
                await fetch('http://127.0.0.1:8000/end_chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ connection_id: connectionId })
                });
                
                if (ws) {
                    ws.close();
                }
                
                chatContainer.style.display = 'none';
                initialScreen.style.display = 'block';
                messagesContainer.innerHTML = '';
            }
        }

        // Event listeners
        connectBtn.addEventListener('click', connect);
        sendBtn.addEventListener('click', sendMessage);
        endChatBtn.addEventListener('click', endChat);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });