// js/pipelines/multiPassEngine.js
import { callGemini } from '../api/gemini.js';
import { performWebSearch } from '../api/tavily.js';
import { PROMPTS } from '../prompts/constants.js';

// Helper to log UI thinking steps
function updateStatus(msg) {
    console.log(`[Pipeline Status]: ${msg}`);
}

export const PipelineEngine = {

    // ==========================================
    // 1. NORMAL MODE PIPELINES
    // ==========================================
    async runNormal(userText, modelType, history) {
        if (modelType === 'spark') {
            updateStatus("Spark Normal (1 Pass)...");
            return await callGemini(`${PROMPTS.SPARK_NORMAL_1}\nUser: ${userText}`, history);
        } 
        else if (modelType === 'flux') {
            updateStatus("Flux Normal (Pass 1: Think)...");
            let think = await callGemini(`${PROMPTS.FLUX_NORMAL_1_THINK}\nUser: ${userText}`, history);
            
            updateStatus("Flux Normal (Pass 2: Response)...");
            return await callGemini(`${PROMPTS.FLUX_NORMAL_2_RESPONSE}\nThoughts: ${think}\nUser: ${userText}`, history);
        } 
        else if (modelType === 'oracle') {
            updateStatus("Oracle Normal (Pass 1: Web)...");
            let webQuery = await callGemini(`${PROMPTS.ORACLE_NORMAL_1_WEB}\nUser: ${userText}`, history);
            let searchData = await performWebSearch(webQuery);
            
            updateStatus("Oracle Normal (Pass 2: Think)...");
            let think = await callGemini(`${PROMPTS.ORACLE_NORMAL_2_THINK}\nSearch: ${searchData}\nUser: ${userText}`, history);
            
            updateStatus("Oracle Normal (Pass 3-5: Response Generation)...");
            let p3 = await callGemini(`${PROMPTS.ORACLE_NORMAL_3_RESPONSE}\nThoughts: ${think}`, history);
            let p4 = await callGemini(`${PROMPTS.ORACLE_NORMAL_4_RESPONSE}\nPart 1: ${p3}`, history);
            let p5 = await callGemini(`${PROMPTS.ORACLE_NORMAL_5_RESPONSE}\nPart 1: ${p3}\nPart 2: ${p4}`, history);
            
            return p3 + "\n\n" + p4 + "\n\n" + p5; // Single continuous response
        }
    },

    // ==========================================
    // 2. LEARN / QUIZ / TEST / MOCK TEST PIPELINES
    // ==========================================
    async runLearn(userText, modelType, subMode, inputs, history) {
        const contextInfo = `Board: ${inputs.board}, Class: ${inputs.class}, Subject: ${inputs.subject}`;
        const query = `${contextInfo}\nTopic/Query: ${userText}`;

        // Example for Oracle Learn (Same structure applies to Quiz/Test/Mock via subMode checks)
        if (modelType === 'oracle') {
            updateStatus("Oracle Learn (Pass 1: Web)...");
            let webQuery = await callGemini(`${PROMPTS.ORACLE_LEARN_1_WEB}\n${query}`, history);
            let searchData = await performWebSearch(webQuery);
            
            updateStatus("Oracle Learn (Pass 2: Think)...");
            let think = await callGemini(`${PROMPTS.ORACLE_LEARN_2_THINK}\nSearch: ${searchData}`, history);
            
            updateStatus("Oracle Learn (Pass 3-5: Writing)...");
            let p3 = await callGemini(`${PROMPTS.ORACLE_LEARN_3_RESPONSE}\nThoughts: ${think}`, history);
            let p4 = await callGemini(`${PROMPTS.ORACLE_LEARN_4_RESPONSE}\nContext: ${p3}`, history);
            let p5 = await callGemini(`${PROMPTS.ORACLE_LEARN_5_RESPONSE}\nContext: ${p4}`, history);
            
            return p3 + "\n" + p4 + "\n" + p5;
        }
        
        // Note: For Spark/Flux in Learn mode, follow the identical pattern as above using their respective constants.
        return "Learn response generated."; 
    },

    // ==========================================
    // 3. DEEP RESEARCH PIPELINES
    // ==========================================
    async runDeepResearch(userText, modelType, history) {
        updateStatus("Generating AI Research Plan...");
        let plan = await callGemini(`${PROMPTS.RESEARCH_PLAN_AI_PLAN_GENERATION}\nTopic: ${userText}`, history);

        if (modelType === 'oracle') {
            // STRICT 15-PASS ORACLE DEEP RESEARCH LOGIC
            updateStatus("Oracle Research (Pass 1-2: Web Searches)...");
            let w1 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_1_WEB}\nPlan: ${plan}`, history);
            let s1 = await performWebSearch(w1);
            let w2 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_2_WEB}\nSearch 1: ${s1}`, history);
            let s2 = await performWebSearch(w2);

            updateStatus("Oracle Research (Pass 3: Think)...");
            let t3 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_3_THINK}\nData: ${s1}\n${s2}`, history);

            updateStatus("Oracle Research (Pass 4-6: Web Searches)...");
            let w4 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_4_WEB}\nThoughts: ${t3}`, history);
            let s4 = await performWebSearch(w4);
            let w5 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_5_WEB}\nData: ${s4}`, history);
            let s5 = await performWebSearch(w5);
            let w6 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_6_WEB}\nData: ${s5}`, history);
            let s6 = await performWebSearch(w6);

            updateStatus("Oracle Research (Pass 7-8: Deep Think)...");
            let t7 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_7_THINK}\nNew Data: ${s4}\n${s5}\n${s6}`, history);
            let t8 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_8_THINK}\nCombine: ${t3}\n${t7}`, history);

            updateStatus("Oracle Research (Pass 9-15: Final Generation)...");
            let r9 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_9_RESPONSE}\nBrain: ${t8}`, history);
            let r10 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_10_RESPONSE}\nPrev: ${r9}`, history);
            let r11 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_11_RESPONSE}\nPrev: ${r10}`, history);
            let r12 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_12_RESPONSE}\nPrev: ${r11}`, history);
            let r13 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_13_RESPONSE}\nPrev: ${r12}`, history);
            let r14 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_14_RESPONSE}\nPrev: ${r13}`, history);
            let r15 = await callGemini(`${PROMPTS.ORACLE_RESEARCH_15_RESPONSE}\nPrev: ${r14}`, history);

            // Returns a single continuous document
            return `# Deep Research Report\n\n${r9}\n${r10}\n${r11}\n${r12}\n${r13}\n${r14}\n${r15}`;
        }
        // *Flux (10 pass) and Spark (7 pass) logic follows identically using their respective PROMPT variables*
    },

    // ==========================================
    // 4. CODING PIPELINES
    // ==========================================
    async runCoding(userText, modelType, history) {
        if (modelType === 'flux') { // Default 3 passes (1 think, 2 response)
            updateStatus("Flux Coding (Pass 1: Think)...");
            let think = await callGemini(`${PROMPTS.FLUX_CODE_1_THINK}\nReq: ${userText}`, history);
            
            updateStatus("Flux Coding (Pass 2: Code Gen Part 1)...");
            let p1 = await callGemini(`${PROMPTS.FLUX_CODE_1_RESPONSE}\nArch: ${think}`, history);
            
            updateStatus("Flux Coding (Pass 3: Code Gen Part 2)...");
            let p2 = await callGemini(`${PROMPTS.FLUX_CODE_2_RESPONSE}\nCode P1: ${p1}`, history);
            
            return p1 + "\n" + p2;
        }
        else if (modelType === 'oracle') { // 5 Passes (2 Think, 3 Code)
            updateStatus("Oracle Coding (Pass 1-2: Deep Think)...");
            let t1 = await callGemini(`${PROMPTS.ORACLE_CODE_1_THINK}\nReq: ${userText}`, history);
            let t2 = await callGemini(`${PROMPTS.ORACLE_CODE_2_THINK}\nReview: ${t1}`, history);
            
            updateStatus("Oracle Coding (Pass 3-5: Writing Code)...");
            let c3 = await callGemini(`${PROMPTS.ORACLE_CODE_3_RESPONSE}\nPlan: ${t2}`, history);
            let c4 = await callGemini(`${PROMPTS.ORACLE_CODE_4_RESPONSE}\nP1: ${c3}`, history);
            let c5 = await callGemini(`${PROMPTS.ORACLE_CODE_5_RESPONSE}\nP2: ${c4}`, history);
            
            return c3 + "\n" + c4 + "\n" + c5;
        }
        // Spark uses PROMPTS.SPARK_CODE_1
    },

    // ==========================================
    // 5. PLANNING PIPELINES
    // ==========================================
    async runPlanning(userText, modelType, history) {
        // Output must be formatted for the premium Cards and Accordions (from Part 5)
        let planData = "";

        if (modelType === 'oracle') {
            updateStatus("Oracle Planning (Pass 1: Think)...");
            let think = await callGemini(`${PROMPTS.ORACLE_PLAN_1_THINK}\nGoal: ${userText}`, history);
            
            updateStatus("Oracle Planning (Pass 2-3: Structuring)...");
            let p2 = await callGemini(`${PROMPTS.ORACLE_PLAN_2_RESPONSE}\nPlan: ${think}`, history);
            planData = await callGemini(`${PROMPTS.ORACLE_PLAN_3_RESPONSE}\nDetail: ${p2}`, history);
        }

        // Return with Premium HTML structure mapping to your CSS
        return `
            <div class="plan-card">
                <div class="plan-card-header"><span class="plan-card-title">🎯 Goal & Timeline</span></div>
                ${planData} </div>
            `;
    }
};
