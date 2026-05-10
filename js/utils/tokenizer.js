// js/utils/tokenizer.js

// Safe limit for Gemini 2.5 Flash (well below the 1M limit to leave room for multi-pass prompts)
const MAX_SAFE_TOKENS = 800000; 

export function estimateTokens(text) {
    if (!text) return 0;
    // Approximation: 4 characters per token
    return Math.ceil(text.length / 4);
}

export function isHistoryWithinLimits(messages) {
    let totalTokens = 0;
    for (const msg of messages) {
        totalTokens += estimateTokens(msg.text);
    }
    return totalTokens < MAX_SAFE_TOKENS;
}
