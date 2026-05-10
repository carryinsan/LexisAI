// js/api/gemini.js
import { CONFIG } from '../config.js';

export async function callGemini(promptText, history = []) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODEL_NAME}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

    // Format history for Gemini API
    const formattedHistory = history.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    // Add the current prompt
    formattedHistory.push({
        role: 'user',
        parts: [{ text: promptText }]
    });

    const payload = {
        system_instruction: {
            parts: [{ text: CONFIG.SYSTEM_INSTRUCTION }]
        },
        contents: formattedHistory,
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
        
    } catch (error) {
        console.error("Error calling Gemini:", error);
        return "LexisAI encountered an error while processing your request. Please try again.";
    }
}
