// js/api/orchestrator.js
import { callGemini } from './gemini.js';
import { performWebSearch } from './tavily.js';
import { PROMPTS } from '../prompts/constants.js';

export async function processUserRequest(userText, modelType, mode, customInputs, history) {
    // Helper function to update UI with thinking status
    updateUIStatus("LexisAI is thinking...");

    let finalResponse = "";

    try {
        // --- SPARK MODE (Fast: 1 Pass) ---
        if (modelType === "spark") {
            // In Part 6, we will inject PROMPTS.SPARK_NORMAL_1 here
            finalResponse = await callGemini(userText, history);
        } 
        
        // --- FLUX MODE (Thinking: 2 Passes) ---
        else if (modelType === "flux") {
            updateUIStatus("LexisAI is analyzing architecture (Pass 1)...");
            // Pass 1: Thinking Pass
            const thinkResult = await callGemini(`[THINKING PASS] ${userText}`, history);
            
            updateUIStatus("LexisAI is generating response (Pass 2)...");
            // Pass 2: Final Response Pass using the thoughts
            finalResponse = await callGemini(`[RESPONSE PASS] User: ${userText}\nThoughts: ${thinkResult}`, history);
        } 
        
        // --- ORACLE MODE (Deep Think: Web + 5 Passes) ---
        else if (modelType === "oracle") {
            updateUIStatus("LexisAI is searching Google (Web Pass)...");
            // Pass 1: Web Search (Tavily masked as Google)
            const searchData = await performWebSearch(userText);
            
            updateUIStatus("LexisAI is deeply analyzing (Thinking Pass 1)...");
            // Pass 2: First Think Pass
            const think1 = await callGemini(`[THINK 1] Analyze this search data: ${searchData} for query: ${userText}`, history);
            
            updateUIStatus("LexisAI is deeply analyzing (Thinking Pass 2)...");
            // Pass 3: Second Think Pass
            const think2 = await callGemini(`[THINK 2] Refine these thoughts: ${think1}`, history);
            
            updateUIStatus("LexisAI is compiling final response (Generation Passes)...");
            // Pass 4, 5, 6: We will chain the writing passes together in Part 6
            // For now, generating the final based on the deep thoughts
            finalResponse = await callGemini(`[FINAL RESPONSE] User: ${userText}\nSearch Data: ${searchData}\nDeep Thoughts: ${think2}`, history);
        }

        return finalResponse;

    } catch (error) {
        console.error("Orchestrator Error:", error);
        return "An error occurred in the processing pipeline.";
    }
}

function updateUIStatus(statusText) {
    // This will hook into the chat.css thinking-indicator we made in Part 2
    console.log(statusText); 
}
