const CONFIG = {
    questionPrefix: 'q',
    defaultSuffix: 'general'
};

let surveyData = {};
let currentSuffix = '';

function initializeSurvey() {
    const urlParams = new URLSearchParams(window.location.search);
    const suffixConfig = urlParams.get('suffix_config') || `${CONFIG.defaultSuffix}:1`;
    
    // Parse suffix config
    const suffixGroups = suffixConfig.split('|').reduce((acc, group) => {
        const [suffix, questions] = group.split(':');
        acc[suffix] = questions.split(',').map(q => `${CONFIG.questionPrefix}${q.trim()}`);
        return acc;
    }, {});
    
    // Initialize data structure
    surveyData = Object.fromEntries(
        Object.entries(suffixGroups).map(([suffix, questions]) => [
            suffix,
            Object.fromEntries(questions.map(q => [q, null]))
        )
    );
    
    renderSuffixTabs(Object.keys(suffixGroups));
    switchSuffix(Object.keys(suffixGroups)[0]);
}

function renderSuffixTabs(suffixes) {
    const container = document.getElementById('suffix-tabs');
    container.innerHTML = suffixes.map(suffix => `
        <div class="suffix-tab" onclick="switchSuffix('${suffix}')">${suffix}</div>
    `).join('');
}

function switchSuffix(suffix) {
    currentSuffix = suffix;
    document.querySelectorAll('.suffix-tab').forEach(tab => {
        tab.classList.toggle('active', tab.textContent === suffix);
    });
    renderQuestions(suffix);
}

function renderQuestions(suffix) {
    const container = document.getElementById('questions-container');
    const questions = Object.keys(surveyData[suffix]);
    
    container.innerHTML = questions.map(qId => `
        <div class="question-bubble" data-id="${qId}">
            <div class="question-text">${qId.replace('q', 'Câu hỏi ')}</div>
            <div class="stars-container">
                ${Array(5).fill().map((_, i) => `
                    <span class="star" 
                           data-value="${i+1}" 
                           onclick="selectStar(this, '${qId}', '${suffix}')">★</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function selectStar(starElement, qId, suffix) {
    const value = parseInt(starElement.dataset.value);
    const stars = starElement.parentElement.children;
    
    Array.from(stars).forEach((s, index) => {
        s.classList.toggle('active', index < value);
    });
    
    surveyData[suffix][qId] = value;
}

async function submitSurvey() {
    try {
        const response = await fetch('YOUR_APPS_SCRIPT_URL', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(surveyData)
        });

        if(response.ok) {
            alert('Đánh giá thành công!');
            window.location.reload();
        }
    } catch (error) {
        console.error('Lỗi:', error);
    }
}

window.onload = initializeSurvey;
