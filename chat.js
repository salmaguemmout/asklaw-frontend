document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('chat-input').addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            document.getElementById('chat-form').dispatchEvent(new Event('submit', { cancelable: true }));
        }
    });
});
function loadChatHistory(sessionId) {
    fetch(`/load_chat_history/${sessionId}`)
        .then(response => {
            if (!response.ok) {
                // If the server responded with a non-200 status, throw an error
                return response.json().then(err => { throw new Error(err.error); });
            }
            return response.json();
        })
        .then(chatHistory => {
            if (chatHistory.error) {
                console.error('Error:', chatHistory.error);
                displayErrorMessage(chatHistory.error); // Display an error message if provided by the server
            } else {
                displayChatHistory(chatHistory); // Update the chat UI with the fetched history
            }
        })
        .catch(error => {
            console.error('Failed to fetch chat history:', error.message);
            displayErrorMessage(error.message); // Optionally display error message to the user
        });
}

function displayChatHistory(chatHistory) {
    const chatHistoryDiv = document.getElementById('chat-history');
    chatHistoryDiv.innerHTML = ''; // Clear previous history

    chatHistory.forEach(msg => {
        // Display user's question
        if (msg.question) {
            addMessage('user', msg.question);
        }
        // Display bot's answer
        if (msg.answer) {
            addMessage('bot', msg.answer);
        }
    });

    // Ensure the latest message is visible by scrolling to the bottom
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
}
