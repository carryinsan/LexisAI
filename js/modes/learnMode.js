// js/modes/learnMode.js

export function renderLearnUI(container, subMode) {
    container.innerHTML = ''; // Clear previous
    container.classList.add("active");

    let html = `
        <select id="learn-board" class="custom-input">
            <option value="" disabled selected>Select Board/Exam</option>
            <option value="cbse">CBSE</option>
            <option value="icse">ICSE</option>
            <option value="nios">NIOS</option>
            <option value="state">State Board (Write below)</option>
            <option value="competitive">Competitive Exam</option>
        </select>
        <input type="text" id="custom-board" class="custom-input" placeholder="Enter State Board/Exam Name" style="display:none;">
    `;

    // Class & Subject logic (Hidden for Competitive)
    html += `
        <select id="learn-class" class="custom-input">
            <option value="" disabled selected>Select Class</option>
            <option value="1-10">Class 1st to 10th</option>
            <option value="11-12-sci">Class 11/12 (Science)</option>
            <option value="11-12-com">Class 11/12 (Commerce)</option>
            <option value="11-12-hum">Class 11/12 (Humanities)</option>
            <option value="college">College</option>
        </select>
        <select id="learn-subject" class="custom-input">
            <option value="" disabled selected>Select Subject</option>
            </select>
    `;

    // Only Mock Test skips Book/Chapter/Topic
    if (subMode !== 'mock_test') {
        html += `
            <input type="text" id="learn-book" class="custom-input" placeholder="Book Name">
            <input type="text" id="learn-chapter" class="custom-input" placeholder="Chapter Name">
            <input type="text" id="learn-topic" class="custom-input full-width" placeholder="Topic (or write 'Full Chapter')">
        `;
    }

    // Test specific inputs (Strict Limits applied)
    if (subMode === 'test') {
        html += `
            <select id="test-type" class="custom-input">
                <option value="objective">Objective (1-100 Qs)</option>
                <option value="subjective">Subjective (1-50 Qs)</option>
                <option value="combined">Combined (1-60 Qs)</option>
            </select>
            <input type="number" id="test-q-count" class="custom-input" placeholder="Number of Questions" min="1" max="100">
        `;
    }

    // Mock Test specific inputs
    if (subMode === 'mock_test') {
        html += `
            <select id="mock-difficulty" class="custom-input full-width">
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="moderate-hard">Moderate to Hard</option>
                <option value="hard">Hard</option>
            </select>
            <div class="full-width" style="color: var(--accent-color); font-size: 0.8rem;">
                *LexisAI will search Tavily to generate the latest Blueprint & Timer for this Mock Test.
            </div>
        `;
    }

    container.innerHTML = html;
    attachLearnEventListeners();
}

function attachLearnEventListeners() {
    const boardSelect = document.getElementById('learn-board');
    const customBoard = document.getElementById('custom-board');
    const classSelect = document.getElementById('learn-class');
    const subjectSelect = document.getElementById('learn-subject');
    const testType = document.getElementById('test-type');
    const testCount = document.getElementById('test-q-count');

    // Handle Custom Board / Competitive Exam
    boardSelect?.addEventListener('change', (e) => {
        if (e.target.value === 'state' || e.target.value === 'competitive') {
            customBoard.style.display = 'block';
            if(e.target.value === 'competitive') {
                customBoard.placeholder = "Exam Name (e.g., CLAT, NEET, JEE Main, UPSC)";
                classSelect.style.display = 'none'; // Hide class for competitive
            } else {
                customBoard.placeholder = "Enter State Board Name";
                classSelect.style.display = 'block';
            }
        } else {
            customBoard.style.display = 'none';
            classSelect.style.display = 'block';
        }
    });

    // Handle Dynamic Subjects based on Class [Strictly per Import Doc]
    classSelect?.addEventListener('change', (e) => {
        let subjects = [];
        if (e.target.value === '1-10') {
            subjects = ['Hindi', 'English', 'G.K.', 'Computer', 'Maths', 'Social Science', 'Sanskrit', 'Science'];
        } else if (e.target.value === '11-12-sci') {
            subjects = ['Physics', 'Chemistry', 'Biology', 'Maths', 'English', 'Computer Science'];
        } else if (e.target.value === '11-12-com') {
            subjects = ['Accountancy', 'Economics', 'Business Studies', 'English', 'Maths'];
        } else if (e.target.value === '11-12-hum') {
            subjects = ['History', 'Geography', 'Political Science', 'Sociology', 'English'];
        } else {
            subjects = ['General College Subject (Specify in Topic)'];
        }

        subjectSelect.innerHTML = '<option value="" disabled selected>Select Subject</option>' + 
            subjects.map(sub => `<option value="${sub.toLowerCase()}">${sub}</option>`).join('');
    });

    // Enforce Test Question Limits
    testType?.addEventListener('change', (e) => {
        if (e.target.value === 'objective') testCount.max = 100;
        else if (e.target.value === 'subjective') testCount.max = 50;
        else if (e.target.value === 'combined') testCount.max = 60;
        
        if(parseInt(testCount.value) > testCount.max) {
            testCount.value = testCount.max;
        }
    });
}
