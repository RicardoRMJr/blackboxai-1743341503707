// Risk calculation weights and factors
const RISK_WEIGHTS = {
    material: {
        'quimico': 1.5,
        'residuo': 1.8,
        'oleo': 1.3,
        'outro': 1.0
    },
    proximity: {
        '1': 1.8,  // <1km
        '2': 1.3,  // 1-5km
        '3': 1.0   // >5km
    },
    mitigation: {
        'plano': 0.8,
        'contensao': 0.7,
        'monitoramento': 0.9
    }
};

// Risk level thresholds
const RISK_THRESHOLDS = {
    LOW: 30,
    MEDIUM: 60
};

// Initialize form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('riskForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        companyName: document.getElementById('companyName').value,
        companyAddress: document.getElementById('companyAddress').value,
        materialType: document.getElementById('materialType').value,
        quantity: parseFloat(document.getElementById('quantity').value),
        proximity: document.querySelector('input[name="proximity"]:checked')?.value,
        mitigation: Array.from(document.querySelectorAll('input[name="mitigation"]:checked')).map(el => el.value)
    };

    // Basic validation
    if (!formData.companyName || !formData.materialType || isNaN(formData.quantity) || !formData.proximity) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Save data to localStorage
    localStorage.setItem('riskFormData', JSON.stringify(formData));
    
    // Redirect to calculation page
    window.location.href = 'calculate.html';
}

// Calculate risk score based on form data
function calculateRiskScore(formData) {
    // Base score from material type and quantity
    let score = RISK_WEIGHTS.material[formData.materialType] * formData.quantity;
    
    // Multiply by proximity factor
    score *= RISK_WEIGHTS.proximity[formData.proximity];
    
    // Apply mitigation factors
    if (formData.mitigation && formData.mitigation.length > 0) {
        const mitigationFactor = formData.mitigation
            .map(m => RISK_WEIGHTS.mitigation[m])
            .reduce((a, b) => a * b, 1);
        score *= mitigationFactor;
    }
    
    // Normalize score to 0-100 range
    score = Math.min(100, Math.max(0, Math.round(score / 2)));
    
    return score;
}

// Determine risk level based on score
function getRiskLevel(score) {
    if (score < RISK_THRESHOLDS.LOW) return 'low';
    if (score < RISK_THRESHOLDS.MEDIUM) return 'medium';
    return 'high';
}

// Get description for risk level
function getRiskDescription(level) {
    const descriptions = {
        'low': 'Risco Baixo - Operação dentro dos parâmetros aceitáveis',
        'medium': 'Risco Médio - Recomendado implementar medidas adicionais',
        'high': 'Risco Alto - Necessário implementar medidas de controle imediatas'
    };
    return descriptions[level] || 'Nível de risco não determinado';
}

// Get icon for risk level
function getRiskIcon(level) {
    const icons = {
        'low': '<i class="fas fa-check-circle"></i>',
        'medium': '<i class="fas fa-exclamation-triangle"></i>',
        'high': '<i class="fas fa-exclamation-circle"></i>'
    };
    return icons[level] || '';
}

// Get recommendations based on risk level and existing mitigations
function getRecommendations(level, existingMitigations = []) {
    const baseRecommendations = {
        'low': [
            'Manter os procedimentos atuais de segurança',
            'Revisar periodicamente as medidas de controle'
        ],
        'medium': [
            'Implementar plano de inspeções periódicas',
            'Treinar equipe em procedimentos de emergência',
            'Considerar sistemas adicionais de contenção'
        ],
        'high': [
            'Implementar medidas de controle imediatas',
            'Elaborar plano de ação emergencial',
            'Realizar vistoria técnica detalhada',
            'Notificar órgãos ambientais se necessário'
        ]
    };

    // Additional recommendations based on missing mitigations
    const missingMitigationRecs = [];
    if (!existingMitigations.includes('plano')) {
        missingMitigationRecs.push('Desenvolver Plano de Emergência para situações de risco');
    }
    if (!existingMitigations.includes('contensao')) {
        missingMitigationRecs.push('Implementar Sistema de Contenção secundária');
    }
    if (!existingMitigations.includes('monitoramento') && level !== 'low') {
        missingMitigationRecs.push('Instalar sistema de monitoramento contínuo');
    }

    return [...baseRecommendations[level], ...missingMitigationRecs]
        .map(rec => `<li>${rec}</li>`)
        .join('');
}