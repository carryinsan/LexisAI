// js/app.js
import { processUserRequest } from './api/orchestrator.js';
import { chatState } from './state/chatState.js';
import { storageManager } from './storage/localStorageManager.js';
import { renderLearnUI } from './modes/learnMode.js';

document.addEventListener("DOMContentLoaded", () => {
    const sendBtn = document.getElementById('send-btn');
    const promptInput = document.getElementById('prompt-input');
    const modeSelector = document.getElementById('mode-selector');
    const modelSelector = document.getElementById('model-selector');
    const chatContainer = document.getElementById('messages-wrapper');
    const welcomeScreen = document.getElementById('welcome-screen');
    const modeContainer = document.querySelector('.mode-inputs-container');

    // Initialize New Chat
    let currentChatId = chatState.startNewChat();

    // Mode Selector Logic
    modeSelector.addEventListener('change', (e) => {
        const mode = e.target.value;
        if (['learn', 'quiz', 'test', 'mock_test'].includes(mode)) {
            welcomeScreen.style.display = 'none'; // Hide welcome screen per instructions
            renderLearnUI(modeContainer, mode);
        } else if (mode === 'template') {
            window.open('https://templates-psi-six.vercel.app', '_blank');
            modeSelector.value = 'general'; // reset
        } else {
            // Handle General, Coding, Planning, Deep Research UI logic
            modeContainer.innerHTML = '';
            modeContainer.classList.remove('active');
        }
    });

    // Send Button Logic
    sendBtn.addEventListener('click', async () => {
        const userText = promptInput.value.trim();
        if (!userText) return;

        // 1. Clear input & hide welcome screen
        promptInput.value = '';
        welcomeScreen.style.display = 'none';

        // 2. Display User Message
        appendMessage('user', userText);

        // 3. Add to state memory
        chatState.addMessage('user', userText);

        // 4. Gather specific mode inputs if they exist (e.g., Board, Class)
        const customInputs = getCustomInputs(modeSelector.value);

        // 5. Call LexisAI Orchestrator
        const aiResponse = await processUserRequest(
            userText, 
            modelSelector.value, 
            modeSelector.value, 
            customInputs, 
            chatState.getHistoryForAPI()
        );

        // 6. Display AI Message & Add to memory
        appendMessage('ai', aiResponse);
        chatState.addMessage('ai', aiResponse);

        // 7. Save to Local Storage immediately
        storageManager.saveChat(currentChatId, chatState.messages, userText.substring(0, 20) + "...");
    });

    function appendMessage(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        msgDiv.innerHTML = `<div class="message-content">${text}</div>`;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function getCustomInputs(mode) {
        // Collects data from the dynamic fields created by renderLearnUI
        if (['learn', 'quiz', 'test', 'mock_test'].includes(mode)) {
            return {
                board: document.getElementById('learn-board')?.value,
                class: document.getElementById('learn-class')?.value,
                subject: document.getElementById('learn-subject')?.value,
                qCount: document.getElementById('test-q-count')?.value
            };
        }
        return {};
    }
});
