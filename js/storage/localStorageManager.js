// js/storage/localStorageManager.js

const STORAGE_KEY = 'lexisai_chats';

export const storageManager = {
    
    getAllChats() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error("Error reading from LocalStorage:", e);
            return {};
        }
    },

    saveChat(chatId, messages, title = "New Chat") {
        let chats = this.getAllChats();
        
        // Update or create the chat entry
        chats[chatId] = {
            id: chatId,
            title: title,
            updatedAt: Date.now(),
            messages: messages
        };

        this._safeSave(chats);
    },

    deleteChat(chatId) {
        let chats = this.getAllChats();
        delete chats[chatId];
        this._safeSave(chats);
    },

    // Internal method to handle the 5MB browser storage limit
    _safeSave(chatsObject) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(chatsObject));
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                console.warn("LocalStorage 5MB limit reached. Evicting oldest chat...");
                
                // Find the oldest chat by updatedAt timestamp
                let oldestChatId = null;
                let oldestTime = Infinity;
                
                for (const [id, chatData] of Object.entries(chatsObject)) {
                    if (chatData.updatedAt < oldestTime) {
                        oldestTime = chatData.updatedAt;
                        oldestChatId = id;
                    }
                }

                // Delete the oldest chat and try saving again
                if (oldestChatId) {
                    delete chatsObject[oldestChatId];
                    this._safeSave(chatsObject); // Recursive retry
                } else {
                    alert("LexisAI Memory is completely full. Please clear some chats.");
                }
            } else {
                console.error("Unknown LocalStorage error:", e);
            }
        }
    }
};
