// ============================================
// F1 BLOG - Sistema Completo com Proteção Admin
// ============================================

// ============================================
// VERIFICAÇÃO DE ACESSO ADMIN
// ============================================

function checkAdminAccess(showMessage = true) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.role !== 'admin') {
        if (showMessage) {
            showMessage('Acesso negado! Apenas administradores podem realizar esta ação.', 'error');
        }
        return false;
    }
    return true;
}

function isAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.role === 'admin';
}

// ============================================
// AUTENTICAÇÃO
// ============================================

function isFirstUser() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.length === 0;
}

document.getElementById('btn-register').addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const msg = document.getElementById('register-msg');
    
    if (!name || !email || !password) {
        msg.textContent = 'Preencha todos os campos!';
        msg.className = 'error';
        return;
    }
    
    if (password.length < 6) {
        msg.textContent = 'Senha deve ter pelo menos 6 caracteres!';
        msg.className = 'error';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.some(u => u.email === email)) {
        msg.textContent = 'Email já cadastrado!';
        msg.className = 'error';
        return;
    }
    
    const role = isFirstUser() ? 'admin' : 'user';
    const user = {
        id: Date.now().toString(),
        name,
        email,
        password: btoa(password),
        role,
        createdAt: new Date().toISOString()
    };
    
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    
    msg.textContent = `Cadastro realizado! Você é ${role === 'admin' ? 'ADMINISTRADOR 👑' : 'usuário'}.`;
    msg.className = 'success';
    
    document.getElementById('name').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-password').value = '';
    setTimeout(() => {
        document.getElementById('tab-login').click();
        msg.style.display = 'none';
    }, 2000);
});

document.getElementById('btn-login').addEventListener('click', () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const msg = document.getElementById('login-msg');
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === btoa(password));
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMainContent(user);
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        loadAllData();
        
        // Mostrar botão admin APENAS se for admin
        const btnAdmin = document.getElementById('btn-admin');
        if (btnAdmin) {
            btnAdmin.style.display = user.role === 'admin' ? 'block' : 'none';
        }
        
        // Esconder painel admin se não for admin
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel && user.role !== 'admin') {
            adminPanel.style.display = 'none';
        }
    } else {
        msg.textContent = 'Email ou senha inválidos!';
        msg.className = 'error';
        msg.style.display = 'block';
    }
});

document.getElementById('tab-login').addEventListener('click', () => {
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-register').classList.remove('active');
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-msg').style.display = 'none';
    document.getElementById('register-msg').style.display = 'none';
});

document.getElementById('tab-register').addEventListener('click', () => {
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('register-form').style.display = 'flex';
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('login-msg').style.display = 'none';
    document.getElementById('register-msg').style.display = 'none';
});

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('news-list').innerHTML = '';
    document.getElementById('calendar-list').innerHTML = '';
    document.getElementById('drivers-list').innerHTML = '';
    document.getElementById('teams-list').innerHTML = '';
});

function showMainContent(user) {
    document.getElementById('user-display').textContent = user.name;
    
    const badge = document.getElementById('role-badge');
    badge.textContent = user.role === 'admin' ? 'Admin' : 'Usuário';
    badge.className = user.role === 'admin' ? 'admin' : 'user';
}

// ============================================
// PAINEL ADMIN - TABS
// ============================================

document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Verificar se é admin antes de permitir acesso
        if (!isAdmin()) {
            showMessage('Acesso negado ao painel admin!', 'error');
            return;
        }
        
        const tab = btn.dataset.tab;
        
        // Ativar botão clicado
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Mostrar conteúdo correspondente
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById('admin-' + tab).classList.add('active');
        
        // Carregar dados específicos se necessário
        if (tab === 'users' && isAdmin()) {
            loadUsers();
        }
    });
});

// Toggle modo admin
document.getElementById('btn-admin').addEventListener('click', () => {
    if (!isAdmin()) {
        showMessage('Acesso negado!', 'error');
        return;
    }
    
    const panel = document.getElementById('admin-panel');
    const isVisible = panel.style.display === 'block';
    panel.style.display = isVisible ? 'none' : 'block';
});

// ============================================
// NOTÍCIAS
// ============================================

document.getElementById('btn-publish').addEventListener('click', () => {
    const title = document.getElementById('news-title').value.trim();
    const content = document.getElementById('news-content').value.trim();
    
    if (!title || !content) {
        showMessage('Preencha todos os campos!', 'error');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const news = {
        id: Date.now().toString(),
        title,
        content,
        date: new Date().toLocaleDateString('pt-BR'),
        authorId: user.id,
        authorName: user.name
    };
    
    const newsList = JSON.parse(localStorage.getItem('news') || '[]');
    newsList.unshift(news);
    localStorage.setItem('news', JSON.stringify(newsList));
    
    document.getElementById('news-title').value = '';
    document.getElementById('news-content').value = '';
    
    loadNews();
    showMessage('Notícia publicada com sucesso!', 'success');
});

function loadNews() {
    const newsList = document.getElementById('news-list');
    newsList.innerHTML = '';
    
    const news = JSON.parse(localStorage.getItem('news') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    news.forEach(item => {
        const div = document.createElement('div');
        div.className = 'news-item';
        div.dataset.id = item.id;
        
        let html = `
            <h3>${item.title}</h3>
            <p>${item.content}</p>
            <span class="date">Publicado em: ${item.date}`;
        
        if (currentUser.role === 'admin') {
            html += ` | Autor: ${item.authorName}`;
        }
        
        html += `</span>`;
        
        if (currentUser.role === 'admin') {
            html += `<button class="btn-delete" data-id="${item.id}">×</button>`;
        }
        
        div.innerHTML = html;
        newsList.appendChild(div);
        
        if (currentUser.role === 'admin') {
            div.querySelector('.btn-delete').addEventListener('click', () => {
                if (confirm('Excluir esta notícia?')) {
                    deleteNews(item.id);
                }
            });
        }
    });
}

function deleteNews(newsId) {
    if (!checkAdminAccess()) return;
    
    let news = JSON.parse(localStorage.getItem('news') || '[]');
    news = news.filter(item => item.id !== newsId);
    localStorage.setItem('news', JSON.stringify(news));
    loadNews();
    showMessage('Notícia excluída!', 'success');
}

// ============================================
// CALENDÁRIO DE CORRIDAS
// ============================================

document.getElementById('btn-add-race').addEventListener('click', () => {
    if (!checkAdminAccess()) return;
    
    const name = document.getElementById('race-name').value.trim();
    const circuit = document.getElementById('race-circuit').value.trim();
    const date = document.getElementById('race-date').value;
    const country = document.getElementById('race-country').value.trim();
    
    if (!name || !circuit || !date || !country) {
        showMessage('Preencha todos os campos!', 'error');
        return;
    }
    
    const raceDate = new Date(date);
    const day = String(raceDate.getDate()).padStart(2, '0');
    const month = String(raceDate.getMonth() + 1).padStart(2, '0');
    const formattedDate = `${day}/${month}`;
    
    const race = {
        id: Date.now().toString(),
        name,
        circuit,
        date: formattedDate,
        country,
        fullDate: date
    };
    
    const races = JSON.parse(localStorage.getItem('races') || '[]');
    races.push(race);
    
    // Ordenar por data
    races.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
    
    localStorage.setItem('races', JSON.stringify(races));
    
    // Limpar formulário
    document.getElementById('race-name').value = '';
    document.getElementById('race-circuit').value = '';
    document.getElementById('race-date').value = '';
    document.getElementById('race-country').value = '';
    
    loadCalendar();
    showMessage('Corrida adicionada com sucesso!', 'success');
});

function loadCalendar() {
    const calendarList = document.getElementById('calendar-list');
    calendarList.innerHTML = '';
    
    const races = JSON.parse(localStorage.getItem('races') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    races.forEach(race => {
        const div = document.createElement('div');
        div.className = 'race-item';
        div.dataset.id = race.id;
        
        let html = `
            <div class="race-date">${race.date}</div>
            <div class="race-info">
                <h3>🏁 ${race.name}</h3>
                <p>${race.circuit} – ${race.country}</p>
            </div>
        `;
        
        if (currentUser.role === 'admin') {
            html += `<button class="btn-delete" data-id="${race.id}">×</button>`;
        }
        
        div.innerHTML = html;
        calendarList.appendChild(div);
        
        if (currentUser.role === 'admin') {
            div.querySelector('.btn-delete').addEventListener('click', () => {
                if (confirm('Excluir esta corrida?')) {
                    deleteRace(race.id);
                }
            });
        }
    });
}

function deleteRace(raceId) {
    if (!checkAdminAccess()) return;
    
    let races = JSON.parse(localStorage.getItem('races') || '[]');
    races = races.filter(race => race.id !== raceId);
    localStorage.setItem('races', JSON.stringify(races));
    loadCalendar();
    showMessage('Corrida excluída!', 'success');
}

// ============================================
// PILOTOS
// ============================================

document.getElementById('btn-add-driver').addEventListener('click', () => {
    if (!checkAdminAccess()) return;
    
    const name = document.getElementById('driver-name').value.trim();
    const number = document.getElementById('driver-number').value.trim();
    const country = document.getElementById('driver-country').value.trim();
    const team = document.getElementById('driver-team').value.trim();
    const bio = document.getElementById('driver-bio').value.trim();
    
    if (!name || !number || !country || !team) {
        showMessage('Preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    const driver = {
        id: Date.now().toString(),
        name,
        number,
        country,
        team,
        bio
    };
    
    const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    drivers.push(driver);
    localStorage.setItem('drivers', JSON.stringify(drivers));
    
    // Limpar formulário
    document.getElementById('driver-name').value = '';
    document.getElementById('driver-number').value = '';
    document.getElementById('driver-country').value = '';
    document.getElementById('driver-team').value = '';
    document.getElementById('driver-bio').value = '';
    
    loadDrivers();
    showMessage('Piloto adicionado com sucesso!', 'success');
});

function loadDrivers() {
    const driversList = document.getElementById('drivers-list');
    driversList.innerHTML = '';
    
    const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    drivers.forEach(driver => {
        const div = document.createElement('div');
        div.className = 'card';
        div.dataset.id = driver.id;
        
        let html = `
            <h3>${driver.country} ${driver.name} #${driver.number}</h3>
            <p>${driver.team}</p>
        `;
        
        if (driver.bio) {
            html += `<p style="margin-top:15px; font-size:15px; color:#777">${driver.bio}</p>`;
        }
        
        if (currentUser.role === 'admin') {
            html += `<button class="btn-delete" data-id="${driver.id}" style="margin-top:15px">Excluir</button>`;
        }
        
        div.innerHTML = html;
        driversList.appendChild(div);
        
        if (currentUser.role === 'admin') {
            div.querySelector('.btn-delete').addEventListener('click', () => {
                if (confirm('Excluir este piloto?')) {
                    deleteDriver(driver.id);
                }
            });
        }
    });
}

function deleteDriver(driverId) {
    if (!checkAdminAccess()) return;
    
    let drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    drivers = drivers.filter(driver => driver.id !== driverId);
    localStorage.setItem('drivers', JSON.stringify(drivers));
    loadDrivers();
    showMessage('Piloto excluído!', 'success');
}

// ============================================
// EQUIPES
// ============================================

document.getElementById('btn-add-team').addEventListener('click', () => {
    if (!checkAdminAccess()) return;
    
    const name = document.getElementById('team-name').value.trim();
    const country = document.getElementById('team-country').value.trim();
    const base = document.getElementById('team-base').value.trim();
    const description = document.getElementById('team-description').value.trim();
    
    if (!name || !country || !base) {
        showMessage('Preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    const team = {
        id: Date.now().toString(),
        name,
        country,
        base,
        description
    };
    
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    teams.push(team);
    localStorage.setItem('teams', JSON.stringify(teams));
    
    // Limpar formulário
    document.getElementById('team-name').value = '';
    document.getElementById('team-country').value = '';
    document.getElementById('team-base').value = '';
    document.getElementById('team-description').value = '';
    
    loadTeams();
    showMessage('Equipe adicionada com sucesso!', 'success');
});

function loadTeams() {
    const teamsList = document.getElementById('teams-list');
    teamsList.innerHTML = '';
    
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    teams.forEach(team => {
        const div = document.createElement('div');
        div.className = 'card';
        div.dataset.id = team.id;
        
        let html = `
            <h3>${team.country} ${team.name}</h3>
            <p>Base: ${team.base}</p>
        `;
        
        if (team.description) {
            html += `<p style="margin-top:15px; font-size:15px; color:#777">${team.description}</p>`;
        }
        
        if (currentUser.role === 'admin') {
            html += `<button class="btn-delete" data-id="${team.id}" style="margin-top:15px">Excluir</button>`;
        }
        
        div.innerHTML = html;
        teamsList.appendChild(div);
        
        if (currentUser.role === 'admin') {
            div.querySelector('.btn-delete').addEventListener('click', () => {
                if (confirm('Excluir esta equipe?')) {
                    deleteTeam(team.id);
                }
            });
        }
    });
}

function deleteTeam(teamId) {
    if (!checkAdminAccess()) return;
    
    let teams = JSON.parse(localStorage.getItem('teams') || '[]');
    teams = teams.filter(team => team.id !== teamId);
    localStorage.setItem('teams', JSON.stringify(teams));
    loadTeams();
    showMessage('Equipe excluída!', 'success');
}

// ============================================
// USUÁRIOS (apenas admin)
// ============================================

function loadUsers() {
    if (!isAdmin()) return;
    
    const container = document.getElementById('users-container');
    container.innerHTML = '';
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    users.forEach(user => {
        const div = document.createElement('div');
        div.className = 'user-card';
        
        const isAdminUser = user.role === 'admin';
        const adminCount = users.filter(u => u.role === 'admin').length;
        const isOnlyAdmin = isAdminUser && adminCount === 1;
        const isCurrentUser = user.id === currentUser.id;
        
        div.innerHTML = `
            <div class="user-info">
                <span><strong>${user.name}</strong> ${isAdminUser ? '👑' : ''}</span>
                <span>${user.email}</span>
                <span style="font-size:14px; color:#888">Cadastro: ${new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="user-actions">
                <button class="btn-delete-user" data-id="${user.id}" ${isOnlyAdmin || isCurrentUser ? 'disabled' : ''}>
                    ${isOnlyAdmin ? 'Único Admin' : isCurrentUser ? 'Você' : 'Excluir'}
                </button>
            </div>
        `;
        
        container.appendChild(div);
        
        if (!isOnlyAdmin && !isCurrentUser) {
            div.querySelector('.btn-delete-user').addEventListener('click', () => {
                if (confirm(`Excluir usuário "${user.name}"?`)) {
                    deleteUser(user.id);
                }
            });
        }
    });
}

function deleteUser(userId) {
    if (!checkAdminAccess()) return;
    
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userName = users.find(u => u.id === userId)?.name || 'Usuário';
    
    users = users.filter(user => user.id !== userId);
    localStorage.setItem('users', JSON.stringify(users));
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.id === userId) {
        localStorage.removeItem('currentUser');
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
    }
    
    loadUsers();
    showMessage(`Usuário "${userName}" excluído!`, 'success');
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function loadAllData() {
    loadNews();
    loadCalendar();
    loadDrivers();
    loadTeams();
}

document.getElementById('modo-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    document.getElementById('modo-toggle').textContent = isDark ? '☀️' : '🌓';
});

function showMessage(text, type) {
    const msg = document.getElementById('message');
    msg.textContent = text;
    msg.className = `show ${type}`;
    
    setTimeout(() => {
        msg.classList.remove('show');
    }, 3000);
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        showMainContent(user);
        loadAllData();
        
        // Garantir que o botão admin esteja correto
        const btnAdmin = document.getElementById('btn-admin');
        if (btnAdmin) {
            btnAdmin.style.display = user.role === 'admin' ? 'block' : 'none';
        }
        
        // Esconder o painel admin se não for admin
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel && user.role !== 'admin') {
            adminPanel.style.display = 'none';
        }
    }
    
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('modo-toggle').textContent = '☀️';
    }
    
    // Inicializar dados de exemplo se não existirem
    if (!localStorage.getItem('news')) {
        localStorage.setItem('news', JSON.stringify([{
            id: '1',
            title: 'Hamilton vence GP do Brasil!',
            content: 'Em uma corrida emocionante sob chuva em Interlagos, Lewis Hamilton conquistou sua primeira vitória com a Ferrari.',
            date: '01/12/2025',
            authorId: '0',
            authorName: 'Sistema'
        }, {
            id: '2',
            title: 'McLaren anuncia atualizações para Abu Dhabi',
            content: 'A equipe britânica revelou um pacote aerodinâmico inovador para a última corrida da temporada.',
            date: '30/11/2025',
            authorId: '0',
            authorName: 'Sistema'
        }]));
    }
    
    if (!localStorage.getItem('races')) {
        localStorage.setItem('races', JSON.stringify([{
            id: '1',
            name: 'GP do Brasil',
            circuit: 'Interlagos',
            date: '01/12',
            country: '🇧🇷 Brasil',
            fullDate: '2025-12-01'
        }, {
            id: '2',
            name: 'GP de Abu Dhabi',
            circuit: 'Yas Marina Circuit',
            date: '14/12',
            country: '🇦🇪 Abu Dhabi',
            fullDate: '2025-12-14'
        }]));
    }
    
    if (!localStorage.getItem('drivers')) {
        localStorage.setItem('drivers', JSON.stringify([{
            id: '1',
            name: 'Max Verstappen',
            number: '1',
            country: '🇳🇱',
            team: 'Red Bull Racing',
            bio: 'Campeão mundial pela 5ª vez em 2025'
        }, {
            id: '2',
            name: 'Lewis Hamilton',
            number: '44',
            country: '🇬🇧',
            team: 'Ferrari',
            bio: '7 vezes campeão mundial, agora na Ferrari'
        }, {
            id: '3',
            name: 'Oscar Piastri',
            number: '81',
            country: '🇦🇺',
            team: 'McLaren',
            bio: 'Jovem talento australiano em ascensão'
        }]));
    }
    
    if (!localStorage.getItem('teams')) {
        localStorage.setItem('teams', JSON.stringify([{
            id: '1',
            name: 'Red Bull Racing',
            country: '🇦🇹',
            base: 'Milton Keynes, Reino Unido',
            description: 'Campeã de construtores pelo 4º ano consecutivo'
        }, {
            id: '2',
            name: 'Ferrari',
            country: '🇮🇹',
            base: 'Maranello, Itália',
            description: 'Renovada com Hamilton, voltou a brigar por títulos'
        }, {
            id: '3',
            name: 'McLaren',
            country: '🇬🇧',
            base: 'Woking, Reino Unido',
            description: 'Desempenho consistente e inovações aerodinâmicas'
        }]));
    }
});