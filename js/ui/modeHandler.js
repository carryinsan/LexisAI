// js/ui/modeHandler.js

document.addEventListener("DOMContentLoaded", () => {
    const modeSelector = document.getElementById("mode-selector");
    const bottomBar = document.getElementById("bottombar");
    
    // Create the dynamic input container
    const modeContainer = document.createElement("div");
    modeContainer.className = "mode-inputs-container";
    bottomBar.insertBefore(modeContainer, bottomBar.firstChild);

    modeSelector.addEventListener("change", (e) => {
        const mode = e.target.value;
        modeContainer.innerHTML = ""; // Clear previous inputs
        
        if (mode === "learn") {
            modeContainer.classList.add("active");
            modeContainer.innerHTML = `
                <input type="text" id="learn-board" class="custom-input" placeholder="Board (e.g., CBSE)">
                <input type="text" id="learn-class" class="custom-input" placeholder="Class/Grade">
                <input type="text" id="learn-subject" class="custom-input" placeholder="Subject">
                <input type="text" id="learn-goal" class="custom-input" placeholder="Goal (e.g., Exam Prep)">
            `;
        } else if (mode === "coding") {
            modeContainer.classList.add("active");
            modeContainer.innerHTML = `
                <input type="text" id="code-language" class="custom-input full-width" placeholder="Programming Language / Framework">
            `;
        } else {
            modeContainer.classList.remove("active");
        }
    });
});
