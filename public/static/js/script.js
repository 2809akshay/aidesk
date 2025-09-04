document.addEventListener('DOMContentLoaded', function() {
            const assistantButton = document.querySelector('.assistant-button');
            const chatWindow = document.querySelector('.chat-window');
            const closeChat = document.querySelector('.close-chat');
            const sendButton = document.querySelector('.send-button');
            const chatInput = document.querySelector('.chat-input input');
            const chatMessages = document.querySelector('.chat-messages');
            const draggableHandle = document.querySelector('.draggable-handle');
            
            // Toggle chat window
            assistantButton.addEventListener('click', function() {
                chatWindow.classList.toggle('active');
                if (chatWindow.classList.contains('active')) {
                    chatInput.focus();
                }
            });
            
            // Close chat window
            closeChat.addEventListener('click', function() {
                chatWindow.classList.remove('active');
            });
            
            // Send message
            function sendMessage() {
                const message = chatInput.value.trim();
                if (message) {
                    // Add user message
                    addMessage(message, 'user');
                    chatInput.value = '';
                    
                    // Simulate bot response after a short delay
                    setTimeout(() => {
                        let botResponse = "I'm sorry, I didn't understand that. Can you please rephrase or ask something about Pimcore?";
                        
                        if (message.toLowerCase().includes('page') || message.toLowerCase().includes('create')) {
                            botResponse = "To create a new page, navigate to Documents in the main menu, click 'Add Document', and select 'Page'. You can then choose a template and start adding content.";
                        } else if (message.toLowerCase().includes('help')) {
                            botResponse = "I can help with various Pimcore tasks including content management, digital assets, data objects, and more. What specifically do you need help with?";
                        } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
                            botResponse = "Hello! How can I assist you with your Pimcore project today?";
                        } else if (message.toLowerCase().includes('asset') || message.toLowerCase().includes('image')) {
                            botResponse = "To manage digital assets, go to the Assets section. You can upload, organize, and edit your files there. Use the drag and drop interface to easily add new assets.";
                        } else if (message.toLowerCase().includes('object') || message.toLowerCase().includes('data')) {
                            botResponse = "Data Objects are managed in the Objects section. You can create custom data structures and manage their instances. Would you like help with a specific object type?";
                        } else if (message.toLowerCase().includes('document') || message.toLowerCase().includes('content')) {
                            botResponse = "Documents are managed in the Documents section. You can create and edit pages, emails, and other content types. You can also manage the site tree from there.";
                        } else if (message.toLowerCase().includes('user') || message.toLowerCase().includes('permission')) {
                            botResponse = "User management is handled in the Settings area under Users & Roles. There you can create users, assign roles, and set permissions for different parts of the system.";
                        }
                        
                        addMessage(botResponse, 'bot');
                    }, 1000);
                }
            }
            
            sendButton.addEventListener('click', sendMessage);
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
            
            // Add message to chat
            function addMessage(text, sender) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message');
                messageElement.classList.add(sender + '-message');
                messageElement.textContent = text;
                
                chatMessages.appendChild(messageElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            // Make chat window draggable
            let isDragging = false;
            let currentX;
            let currentY;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;
            
            draggableHandle.addEventListener('mousedown', dragStart);
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('mousemove', drag);
            
            function dragStart(e) {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
                
                if (e.target === draggableHandle) {
                    isDragging = true;
                }
            }
            
            function dragEnd(e) {
                initialX = currentX;
                initialY = currentY;
                
                isDragging = false;
            }
            
            function drag(e) {
                if (isDragging) {
                    e.preventDefault();
                    
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                    
                    xOffset = currentX;
                    yOffset = currentY;
                    
                    setTranslate(currentX, currentY, chatWindow);
                }
            }
            
            function setTranslate(xPos, yPos, el) {
                el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
            }
        });