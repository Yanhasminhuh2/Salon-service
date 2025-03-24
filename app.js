const CONFIG = {
    scriptURL: 'https://script.google.com/macros/s/AKfycbxgQRQqOlhzmcGvKQyJgeB7mF8e-M3Bs2TeYrgq8OvJjsTlEqCQxB1fN3dBYYjerO6h/exec',
    groups: ['Cat', 'Uon', 'Nhuom', 'Phu', 'Overall']
};

let surveyData = {};

async function init() {
    // Load questions từ Google Sheets
    const questions = await fetch(CONFIG.scriptURL + '?action=getQuestions')
        .then(res => res.json());
    
    // Parse URL parameters
    const params = new URLSearchParams(location.search);
    
    CONFIG.groups.forEach(group => {
        const suffix = params.get(group);
        const questionIds = params.get(`${group}_questions`)?.split(',') || [];
        
        if(suffix && questionIds.length) {
            surveyData[group] = {
                suffix: suffix,
                questions: questionIds.map(qId => ({
                    id: qId,
                    text: questions.find(q => q.id === qId)?.text || 'Câu hỏi không xác định'
                })),
                responses: {}
            };
        }
    });
    
    renderQuestions();
}

function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    
    Object.entries(surveyData).forEach(([group, data]) => {
        data.questions.forEach(q => {
            container.innerHTML += `
                <div class="question-card" data-group="${group}" data-qid="${q.id}">
                    <div>${q.text}</div>
                    ${q.type === 'text' ? 
                        '<textarea class="text-input"></textarea>' : 
                        `<div class="stars-container">
                            ${[1,2,3,4,5].map(score => `
                                <span class="star" data-score="${score}" 
                                      onclick="selectScore(this, '${group}', '${q.id}')">★</span>
                            `).join('')}
                        </div>`
                    }
                </div>
            `;
        });
    });
}

function selectScore(element, group, qId) {
    const stars = element.parentElement.children;
    Array.from(stars).forEach(star => {
        star.classList.toggle('active', star.dataset.score <= element.dataset.score);
    });
    surveyData[group].responses[qId] = parseInt(element.dataset.score);
}

async function submitSurvey() {
    const payload = Object.entries(surveyData).reduce((acc, [group, data]) => {
        acc[group] = {
            suffix: data.suffix,
            responses: data.responses
        };
        return acc;
    }, {});

    try {
        await fetch(CONFIG.scriptURL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        alert('Cảm ơn đánh giá của bạn!');
        window.location.reload();
    } catch (error) {
        console.error('Lỗi:', error);
    }
}

window.onload = init;
