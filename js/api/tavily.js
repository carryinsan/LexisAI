// js/api/tavily.js
import { CONFIG } from '../config.js';

export async function performWebSearch(query) {
    const url = "https://api.tavily.com/search";
    
    const payload = {
        api_key: CONFIG.TAVILY_API_KEY,
        query: query,
        search_depth: "advanced",
        include_answer: false,
        include_raw_content: false,
        max_results: 30 // STRICT LIMIT AS REQUESTED
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Tavily API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Format the search results into a readable string for Gemini to process
        let searchContext = "Web Search Results:\n";
        data.results.forEach((result, index) => {
            searchContext += `\n[Result ${index + 1}] Title: ${result.title}\nURL: ${result.url}\nContent: ${result.content}\n`;
        });
        
        return searchContext;
        
    } catch (error) {
        console.error("Error performing web search:", error);
        return "Search failed or no relevant results found.";
    }
}
