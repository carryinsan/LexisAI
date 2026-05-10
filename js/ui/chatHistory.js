// js/ui/chatHistory.js
import { storageManager } from '../storage/localStorageManager.js';
import { chatState } from '../state/chatState.js';

export function renderSidebarHistory() {
    const historyList = document.getElementById('chat-history-list');
    historyList.innerHTML = ''; // Clear current list

    const chats = storageManager.getAllChats();
    
    // Sort by newest first
    const sortedChats = Object.values(chats).sort((a, b) => b.updatedAt - a.updatedAt);

    sortedChats.forEach(chat => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerText = chat.title;
        
        li.addEventListener('click', () => {
            // Load chat into state
            chatState.loadChat(chat.id, chat.messages);
            // We will trigger a UI render function here in Part 5
            console.log(`Loaded chat: ${chat.id}`);
        });

        historyList.appendChild(li);
    });
}
