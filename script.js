document.addEventListener('DOMContentLoaded', function() {
    // Selecting elements
    const sendMessageButton = document.getElementById('send-button');
    const userInputField = document.getElementById('user-input');
    const chatMessagesContainer = document.getElementById('chat-messages');
    const restartButton = document.querySelector('.new-chat-button');
    const showSlotsButton = document.querySelector('.slots-button');

    // Event listeners
    sendMessageButton.addEventListener('click', sendMessage);
    userInputField.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
    restartButton.addEventListener('click', restartConversation);
    showSlotsButton.addEventListener('click', showSlots);

    // Function to send user message
    async function sendMessage() {
        const userInput = userInputField.value.trim();
        if (userInput === '') return;

        appendMessage('user', userInput);
        userInputField.value = '';
        showDotsAnimation();

        try {
            const response = await fetch('https://profound-randomly-gator.ngrok-free.app/webhooks/rest/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sender: 'user', message: userInput })
            });

            const data = await response.json();
            removeDotsAnimation();
            handleBotResponse(data);
        } catch (error) {
            console.error('Error:', error);
            removeDotsAnimation();
            appendMessage('bot', 'Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu.');
        }
    }

    // Function to handle bot response
    function handleBotResponse(messages) {
        messages.forEach(message => {
            if (message.text) {
                if (message.text.includes('image in process')) {
                    const parts = message.text.split('image in process');
                    const textPart = parts[0].trim();
                    const base64String = parts[1].trim();

                    if (textPart) {
                        appendMessage('bot', textPart);
                    }
                    appendImage(base64String);
                } else {
                    appendMessage('bot', message.text);
                }
            }
        });
    }

    // Function to append messages to the chat interface
    function appendMessage(sender, message, isHtml = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);

        if (isHtml) {
            messageElement.innerHTML = message;
        } else {
            message = message.replace(/\n/g, '<br>');
            messageElement.innerHTML = message;
        }

        chatMessagesContainer.appendChild(messageElement);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    // Function to append images to the chat interface
    function appendImage(base64String) {
        const imgElement = document.createElement('img');
        imgElement.src = `data:image/png;base64,${base64String}`;
        imgElement.alt = 'Image';

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'bot');
        messageElement.appendChild(imgElement);

        chatMessagesContainer.appendChild(messageElement);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    // Function to restart the conversation (clear messages and send /restart command)
    async function restartConversation() {
        // Clear chat messages
        chatMessagesContainer.innerHTML = '';

        try {
            // Send /restart command to Rasa server
            const response = await fetch('https://profound-randomly-gator.ngrok-free.app/webhooks/rest/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sender: 'user', message: '/restart' })
            });

            const data = await response.json();
            // Handle bot response if needed
            handleBotResponse(data);
        } catch (error) {
            console.error('Error:', error);
            appendMessage('bot', 'Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu.');
        }
    }

    // function to show slots
    async function showSlots() {
        try {
            const response = await fetch('http://localhost:5005/conversations/default/tracker', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            const slots = data.slots;
            let slotsHtml = '<h3>Slots:</h3><ul>';

            for (const slot in slots) {
                slotsHtml += `<li><strong>${slot}:</strong> ${slots[slot]}</li>`;
            }

            slotsHtml += '</ul>';
            appendMessage('bot', slotsHtml, true);
        } catch (error) {
            console.error('Error:', error);
            appendMessage('bot', 'Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu.');
        }
    }

    // Function to show dots animation
    function showDotsAnimation() {
        const dotsElement = document.createElement('div');
        dotsElement.classList.add('dots', 'bot');
        dotsElement.innerHTML = '<span></span><span></span><span></span>';
        chatMessagesContainer.appendChild(dotsElement);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    // Function to remove dots animation
    function removeDotsAnimation() {
        const dotsElement = document.querySelector('.dots');
        if (dotsElement) {
            dotsElement.remove();
        }
    }
});
