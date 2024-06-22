

const sessionList = document.getElementById('session-list');
function createDeleteConfirmationModal() {
    // Modal background with Tailwind classes for fixed positioning, background color, and more
    const modalBackground = document.createElement('div');
    modalBackground.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full flex items-center justify-center z-50 hidden';
    modalBackground.id = 'deleteConfirmationModal';

    // Modal content container with Tailwind classes for background, padding, and shadow
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white p-6 rounded-lg shadow-lg';

    // Text within the modal, styled with Tailwind
    const modalText = document.createElement('p');
    modalText.textContent = 'Are you sure you want to delete this chat?';
    modalText.className = 'text-lg mb-4';

    // Confirm button with Tailwind classes for background color, hover effects, and spacing
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
    confirmButton.className = 'bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2';

    // Cancel button with Tailwind classes for background color, hover effects, and spacing
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded';

    // Append elements to the modal content and then to the modal background
    modalContent.appendChild(modalText);
    modalContent.appendChild(confirmButton);
    modalContent.appendChild(cancelButton);
    modalBackground.appendChild(modalContent);

    // Append the modal background to the body
    document.body.appendChild(modalBackground);

    // Variable to hold the current session to be deleted
    let currentSessionToDelete = null;

    // Confirm button event listener
    confirmButton.onclick = function() {
        if (currentSessionToDelete) {
            const sessionId = currentSessionToDelete.dataset.sessionId;
            // Send a DELETE request to the server
            fetch(`/delete_session/${sessionId}`, { method: 'DELETE' })
            .then(response => response.json().then(data => ({ isOk: response.ok, data })))
            .then(result => {
                if (result.isOk) {
                    sessionList.removeChild(currentSessionToDelete); // Remove the session UI if the server confirms deletion
                    modalBackground.classList.add('hidden'); // Hide the modal
                    currentSessionToDelete = null; // Reset reference
                    createNewChat(); // Optionally create a new chat session
                } else {
                    console.error('Failed to delete session:', result.data.error);
                }
            })
            .catch(error => {
                console.error('Error deleting session:', error);
            });
        }
    };

    // Cancel button event listener to hide the modal
    cancelButton.onclick = function() {
        modalBackground.classList.add('hidden');
        currentSessionToDelete = null; // Reset the session to be deleted
    };

    // Function to show the modal
    return {
        showModal: function(session) {
            currentSessionToDelete = session; // Set the current session to be deleted
            modalBackground.classList.remove('hidden'); // Show the modal
        }
    };
}


let deleteModalController = createDeleteConfirmationModal(); // Create modal controller

window.onload = function() {
    
    loadAllSessions();  // Load all sessions when the page is initially loaded
    createNewChat();
     // Initial call to create a new chat
     // Listen for resize events
    window.addEventListener('resize', handleResize);

    // Initial check
   

document.getElementById('sidebar').addEventListener('transitionend', function() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('sidebar-hidden')) {
        sidebar.style.display = 'none';
    }
});

};
let activeChatSessionId = null; // Variable to store the ID of the active chat session

// Function to create a new chat session
// Function to create a new chat session
// Function to create a new chat session

function createNewChat() {
    fetch('/new_session', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        const sessionId = data.session_id;  
        const defaultSessionName = 'New Chat ';
        createSessionUI(sessionId, defaultSessionName); // Use a default name when creating a new session
        switchSession(sessionId); // Automatically switch to the new session
    });
}function createSessionUI(sessionId, session_name) {
    const sessionItem = document.createElement('div');
    // Apply Tailwind classes directly here
    sessionItem.className = 'session-item rounded-lg border border-gray-300 p-3 mb-2 flex items-center justify-between';
    sessionItem.dataset.sessionId = sessionId;

    const sessionText = document.createElement('span');
    sessionText.textContent = session_name || 'New Chat'; // Use provided name or default
    sessionText.className= 'session-name';
    // Tailwind classes for text
    makeEditable(sessionText, sessionId); // Make the text editable

    // Create the delete button using Tailwind for initial visibility and style
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = `<img src="${window.deleteIconUrl}" alt="Delete">`;
    deleteBtn.className = 'delete-btn bg-red-500 text-white font-bold py-1 px-2 rounded-full transition-opacity duration-300 opacity-0 hover:opacity-100';
    deleteBtn.onclick = function(event) {
        event.stopPropagation();
        deleteModalController.showModal(sessionItem); // Show modal for deletion
    };

    // Append elements to the session item
    sessionItem.appendChild(sessionText);
    sessionItem.appendChild(deleteBtn);
    sessionList.prepend(sessionItem); // Add the new session to the top of the list

    // Listener to handle session switching
    sessionItem.addEventListener('click', function(event) {
        if (document.activeElement !== sessionText) {
            switchSession(sessionId);
        }
    });

    updateDeleteButtonVisibility(); // Call to manage the visibility of delete buttons
}


// Helper function to make text elements editable and update session names
function makeEditable(element, sessionId) {
    element.onclick = function() {
        element.contentEditable = true;
        element.focus();
        element.dataset.originalText = element.textContent; // Store original text to check for changes
    };

    element.onblur = function() {
        element.contentEditable = false;
        if (element.textContent !== element.dataset.originalText) {
            updateSessionNameOnServer(sessionId, element.textContent);
        }
    };

    element.onkeypress = function(e) {
        if (e.key === 'Enter') {
            element.blur(); // Lose focus on Enter key to stop editing and trigger update
            e.preventDefault(); // Prevent default to avoid new line
        }
    };
}

function updateSessionNameOnServer(sessionId, newSessionName) {
    fetch('/update_session_name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            session_id: sessionId,
            new_session_name: newSessionName
        })
    })
    .then(response => response.json())
    .then(data => {
       
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating the session name.');
    });
}
// Function to switch chat sessions
function switchSession(sessionId) {
    activeChatSessionId = sessionId; // Set the active chat session ID
    console.log('Switching to session:', sessionId);
    loadChatHistory(sessionId);  // Load the history for the new session

    const sessionItems = document.querySelectorAll('.session-item');
    sessionItems.forEach(sessionItem => {
        const deleteBtn = sessionItem.querySelector('.delete-btn');
        if (sessionItem.dataset.sessionId === sessionId) {
            sessionItem.classList.add('active');
            sessionItem.classList.remove('opacity-60');
            sessionItem.classList.add('opacity-100');
            deleteBtn.classList.remove('disabled:opacity-0');
            deleteBtn.classList.add('enabled:opacity-100');
        } else {
            sessionItem.classList.remove('active');
            sessionItem.classList.remove('opacity-100');
            sessionItem.classList.add('opacity-60');
            deleteBtn.classList.remove('enabled:opacity-100');
            deleteBtn.classList.add('disabled:opacity-0');
        }
    });
}

// Function to update the visibility of delete buttons
// This function might not be necessary if the switchSession handles all cases
function updateDeleteButtonVisibility() {
    const sessionItems = document.querySelectorAll('.session-item');
    sessionItems.forEach(sessionItem => {
        const deleteBtn = sessionItem.querySelector('.delete-btn');
        if (sessionItem.dataset.sessionId === activeChatSessionId) {
            deleteBtn.classList.remove('disabled:opacity-0');
            deleteBtn.classList.add('enabled:opacity-100');
            sessionItem.classList.add('opacity-100');
        } else {
            deleteBtn.classList.remove('enabled:opacity-100');
            deleteBtn.classList.add('disabled:opacity-0');
            sessionItem.classList.add('opacity-60');
        }
    });
}

// Existing switchSession, updateDeleteButtonVisibility, and other necessary functions remain the same


// Function to switch chat sessions


function loadAllSessions() {
    fetch("/session_ids")
        .then(response => response.json())
        .then(sessions => {
            sessions.forEach(session => {
                createSessionUI(session.session_id, session.session_name);
            });
        })
        .catch(error => {
            console.error('Error loading session IDs:', error);
        });
}


function switchChat(chatName) {
    console.log('Switching to:', chatName); // Replace with actual switching logic
}

deleteBtn.onclick = function(event) {
    event.stopPropagation(); // Stop the event from bubbling up to the parent elements
    if (confirm('Are you sure you want to delete this chat?')) {
        sessionList.removeChild(newSession);
    }
};

function toggleSidebar(show) {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar-btn');

    if (show === true) {
        sidebar.style.display = 'block';
        requestAnimationFrame(() => {
            sidebar.classList.remove('sidebar-hidden');
        });
        toggleBtn.classList.remove('rotate-180');
    } else if (show === false) {
        sidebar.classList.add('sidebar-hidden');
        toggleBtn.classList.add('rotate-180');
    } else {
        // Toggle sidebar visibility
        if (sidebar.classList.contains('sidebar-hidden')) {
            sidebar.style.display = 'block';
            requestAnimationFrame(() => {
                sidebar.classList.remove('sidebar-hidden');
            });
            toggleBtn.classList.remove('rotate-180');
        } else {
            sidebar.classList.add('sidebar-hidden');
            toggleBtn.classList.add('rotate-180');
        }
    }
}

function handleResize() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth >= 720) {
        if (sidebar.classList.contains('sidebar-hidden')) {
            toggleSidebar(true);
        }
    } else {
        if (!sidebar.classList.contains('sidebar-hidden')) {
            toggleSidebar(false);
        }
    }
}

document.getElementById('toggle-sidebar-btn').addEventListener('click', toggleSidebar);

document.getElementById('sidebar').addEventListener('transitionend', function() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('sidebar-hidden')) {
        sidebar.style.display = 'none';
    }
});

window.addEventListener('resize', handleResize);
window.addEventListener('load', handleResize);







function clearHistory() {
    const listHistory = document.getElementById('list-history');
    listHistory.innerHTML = ''; // Clear chat history
}


function sendMessage(event) {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.querySelector('#chat-form button[type="submit"]');
    const message = chatInput.value.trim();
    let sessionName = "";
    const sessionItems = document.querySelectorAll('.session-item');
    sessionItems.forEach(item => {
        if (item.dataset.sessionId === activeChatSessionId) {
            const sessionText = item.querySelector('.session-name');
            sessionName = sessionText.textContent; // Get the text content which is the session name
        }
    });

    // Disable the input and button to prevent multiple sends
    chatInput.disabled = true;
    sendButton.disabled = true;

    if (message) {
        // Add user's message to the chat history immediately
        addMessage('user', message);

        // Send message along with the session ID and session name
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                msg: message,
                session_id: activeChatSessionId,
                session_name: sessionName  // Include the session name in the request
            })  
        })
        .then(response => response.json())
        .then(data => {
            if (data.response) {
                addMessage('bot', data.response); // Add bot's response to the chat history
            } else if (data.error) {
                addMessage('bot', 'Error: ' + data.error); // Handle errors in bot response
            }
            chatInput.disabled = false;
            sendButton.disabled = false;
            chatInput.value = ''; // Clear the input after successful sending
        })
        .catch(error => {
            console.error('Error:', error);
            addMessage('bot', 'An error occurred while trying to send the message.');
            chatInput.disabled = false;
            sendButton.disabled = false;
        });
    } else {
        chatInput.disabled = false;
        sendButton.disabled = false;
    }
}



function addMessage(sender, message) {
    const chatHistory = document.getElementById('chat-history');
    const messageElement = document.createElement('div');

    // Apply different background colors and alignment based on the sender
    const baseClasses = 'p-2 rounded-lg w-full my-1 whitespace-pre-wrap';
    const userClasses = 'bg-blue-100 ml-auto ' + baseClasses;
    const botClasses = 'bg-green-100 mr-auto ' + baseClasses;

    // Setting classes based on the sender
    messageElement.className = sender === 'user' ? userClasses : botClasses;

    // Inserting the text content
    messageElement.textContent = message;

    // Appending the new message element to the chat history
    chatHistory.appendChild(messageElement);

    // Auto-scroll to the latest message
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
