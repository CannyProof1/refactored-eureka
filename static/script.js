const API_BASE = '/api';

// Загрузка пациентов
async function loadPatients() {
    try {
        const response = await fetch(`${API_BASE}/patients`);
        const patients = await response.json();
        renderPatients(patients);
        updateStats(patients);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        document.getElementById('patientsList').innerHTML = 
            '<p class="empty-message">❌ Ошибка загрузки данных</p>';
    }
}

// Отображение пациентов
function renderPatients(patients) {
    const container = document.getElementById('patientsList');
    
    if (patients.length === 0) {
        container.innerHTML = '<p class="empty-message">👨‍⚕️ Нет зарегистрированных пациентов</p>';
        return;
    }
    
    container.innerHTML = patients.map(patient => `
        <div class="patient-card" data-id="${patient.id}">
            <div class="patient-info">
                <div class="patient-name">${patient.name}</div>
                <div class="patient-details">
                    <span>🎂 ${patient.age} лет</span>
                    <span>🏷️ ${patient.diagnosis || 'Без диагноза'}</span>
                    <span>📱 ${patient.phone || 'Не указан'}</span>
                    <span class="status-badge status-${patient.status}">${getStatusText(patient.status)}</span>
                </div>
            </div>
            <div class="patient-actions">
                <button class="btn-edit" onclick="editPatient(${patient.id})">✏️</button>
                <button class="btn-delete" onclick="deletePatient(${patient.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Статусы
function getStatusText(status) {
    const statuses = {
        'active': 'Активный',
        'completed': 'Завершен',
        'waiting': 'В очереди'
    };
    return statuses[status] || status;
}

// Обновление статистики
function updateStats(patients) {
    document.getElementById('totalPatients').textContent = patients.length;
    document.getElementById('activePatients').textContent = 
        patients.filter(p => p.status === 'active').length;
    document.getElementById('completedPatients').textContent = 
        patients.filter(p => p.status === 'completed').length;
}

// Добавление пациента
document.getElementById('patientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        diagnosis: document.getElementById('diagnosis').value,
        phone: document.getElementById('phone').value,
        status: document.getElementById('status').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/patient`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            document.getElementById('patientForm').reset();
            loadPatients();
            showNotification('✅ Пациент успешно добавлен!');
        } else {
            showNotification('❌ Ошибка при добавлении пациента');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка сервера');
    }
});

// Удаление пациента
async function deletePatient(id) {
    if (!confirm('Вы уверены, что хотите удалить этого пациента?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/patient/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadPatients();
            showNotification('🗑️ Пациент удален');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка при удалении');
    }
}

// Редактирование пациента (упрощенная версия)
async function editPatient(id) {
    try {
        const response = await fetch(`${API_BASE}/patient/${id}`);
        const patient = await response.json();
        
        // Заполняем форму данными пациента
        document.getElementById('name').value = patient.name;
        document.getElementById('age').value = patient.age;
        document.getElementById('diagnosis').value = patient.diagnosis || '';
        document.getElementById('phone').value = patient.phone || '';
        document.getElementById('status').value = patient.status;
        
        // Меняем текст кнопки
        const btn = document.querySelector('.btn-primary');
        btn.textContent = '💾 Обновить данные';
        
        // Отменяем предыдущую обработку
        const form = document.getElementById('patientForm');
        const oldSubmit = form.onsubmit;
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                age: parseInt(document.getElementById('age').value),
                diagnosis: document.getElementById('diagnosis').value,
                phone: document.getElementById('phone').value,
                status: document.getElementById('status').value
            };
            
            try {
                const updateResponse = await fetch(`${API_BASE}/patient/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                if (updateResponse.ok) {
                    form.reset();
                    btn.textContent = '➕ Добавить пациента';
                    form.onsubmit = oldSubmit;
                    loadPatients();
                    showNotification('✅ Данные обновлены!');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                showNotification('❌ Ошибка при обновлении');
            }
        };
        
        // Прокручиваем к форме
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('❌ Ошибка при загрузке данных пациента');
    }
}

// Поиск
document.getElementById('searchInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.patient-card');
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
});

// Уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        font-weight: 600;
        color: #2d3748;
        z-index: 1000;
        animation: slideIn 0.5s ease;
        border-left: 5px solid #667eea;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Добавляем анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Инициализация
loadPatients();