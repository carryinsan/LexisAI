// js/app.js
import { processUserRequest } from './api/orchestrator.js';
import { chatState } from './state/chatState.js';
import { storageManager } from './storage/localStorageManager.js';
import { renderLearnUI } from './modes/learnMode.js';

// Magically import a Markdown Parser from the web to give it the Gemini look!
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

// Inject Code-Highlighting CSS directly from JS so you don't have to edit any CSS files
const markdownStyle = document.createElement('style');
markdownStyle.innerHTML = `
    .message-content pre {
        background-color: #171718;
        padding: 15px;
        border-radius: 12px;
        overflow-x: auto;
        border: 1px solid var(--border-color);
        margin: 10px 0;
    }
    .message-content code {
        font-family: Consolas, Monaco, monospace;
        background-color: rgba(164, 140, 255, 0.15);
        color: var(--accent-hover);
        padding: 3px 6px;
        border-radius: 6px;
        font-size: 0.9em;
    }
    .message-content pre code {
        background-color: transparent;
        color: #e3e3e3;
        padding: 0;
    }
    .message-content p { margin-bottom: 12px; }
    .message-content ul, .message-content ol { margin-left: 20px; margin-bottom: 12px; }
    .message-content li { margin-bottom: 5px; }
    .message-content strong { color: #fff; font-weight: bold; }
    .message-content h1, .message-content h2, .message-content h3 { color: var(--accent-color); margin: 15px 0 10px 0; }
`;
document.head.appendChild(markdownStyle);

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
            welcomeScreen.style.display = 'none'; 
            renderLearnUI(modeContainer, mode);
        } else if (mode === 'template') {
            window.open('https://templates-psi-six.vercel.app', '_blank');
            modeSelector.value = 'general'; 
        } else {
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

        // 4. Gather specific mode inputs
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

        // 7. Save to Local Storage
        storageManager.saveChat(currentChatId, chatState.messages, userText.substring(0, 20) + "...");
    });

    // The Magic Append Function with Markdown Support
    function appendMessage(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        
        let displayHtml = text;
        if (role === 'ai') {
            // Apply Markdown formatting only to AI responses
            displayHtml = marked.parse(text);
        } else {
            // Prevent HTML injection from user input but keep line breaks
            displayHtml = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
        }

        msgDiv.innerHTML = `<div class="message-content">${displayHtml}</div>`;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function getCustomInputs(mode) {
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
