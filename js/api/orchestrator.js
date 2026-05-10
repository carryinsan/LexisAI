// js/api/orchestrator.js
import { PipelineEngine } from '../pipelines/multiPassEngine.js';

export async function processUserRequest(userText, modelType, mode, customInputs, history) {
    try {
        let response = "";

        switch(mode) {
            case 'general':
                response = await PipelineEngine.runNormal(userText, modelType, history);
                break;
            case 'learn':
            case 'quiz':
            case 'test':
            case 'mock_test':
                response = await PipelineEngine.runLearn(userText, modelType, mode, customInputs, history);
                break;
            case 'deep_research':
                response = await PipelineEngine.runDeepResearch(userText, modelType, history);
                break;
            case 'coding':
                response = await PipelineEngine.runCoding(userText, modelType, history);
                break;
            case 'plan':
                response = await PipelineEngine.runPlanning(userText, modelType, history);
                break;
            default:
                response = await PipelineEngine.runNormal(userText, modelType, history);
        }

        return response;

    } catch (error) {
        console.error("Critical Engine Failure:", error);
        return "LexisAI encountered a pipeline error. Please try regenerating.";
    }
}
