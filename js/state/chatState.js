// js/state/chatState.js
import { isHistoryWithinLimits } from '../utils/tokenizer.js';

class ChatState {
    constructor() {
        this.currentChatId = null;
        this.messages = [];
        this.maxMessages = 50; // STRCIT LIMIT FROM YOUR DOC
    }

    startNewChat() {
        this.currentChatId = `chat_${Date.now()}`;
        this.messages = [];
        return this.currentChatId;
    }

    loadChat(chatId, messages) {
        this.currentChatId = chatId;
        this.messages = messages;
    }

    addMessage(role, text) {
        this.messages.push({ role, text, timestamp: Date.now() });

        // Enforce the 50-message context limit
        if (this.messages.length > this.maxMessages) {
            // Remove the oldest message (index 0) to maintain sliding window
            this.messages.shift();
        }

        // Additional safeguard: If token size is somehow monstrously huge
        while (!isHistoryWithinLimits(this.messages) && this.messages.length > 1) {
            this.messages.shift(); // Evict oldest until safe
        }
        
        return this.messages;
    }

    getHistoryForAPI() {
        // Return only the messages formatted for the API request
        return this.messages.map(msg => ({
            role: msg.role,
            text: msg.text
        }));
    }
}

export const chatState = new ChatState();
