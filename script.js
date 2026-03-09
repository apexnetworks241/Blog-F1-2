// ============================================
// F1 BLOG — script.js
// Seções: Tema · Menu · Admin Auth · Painel ·
//         Circuitos · Equipes · Usuários ·
//         Utilitários · Dados · Init
// ============================================


// ============================================
// TEMA (MODO ESCURO / CLARO)
// ============================================

function updateLogos(isDark) {
    const src = isDark ? 'logo4_0.svg' : 'logo3_0.svg';
    ['main-logo', 'mobile-logo', 'footer-logo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.src = src;
    });
}

document.getElementById('modo-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    document.getElementById('modo-toggle').textContent = isDark ? '☀️' : '🌓';
    updateLogos(isDark);
});


// ============================================
// MENU HAMBÚRGUER
// ============================================

const hamburger   = document.getElementById('hamburger-menu');
const mobileMenu  = document.getElementById('mobile-menu');
const closeMenuBtn = document.getElementById('close-menu');
const menuOverlay  = document.getElementById('menu-overlay');

function openMobileMenu() {
    mobileMenu.classList.add('active');
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (hamburger)    hamburger.addEventListener('click', openMobileMenu);
if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);
if (menuOverlay)  menuOverlay.addEventListener('click', closeMobileMenu);

document.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileMenu();
    });
});

document.getElementById('mobile-admin-btn').addEventListener('click', () => {
    closeMobileMenu();
    openAdminModal();
});


// ============================================
// AUTENTICAÇÃO ADMIN
// ============================================

function isAdmin() {
    return !!localStorage.getItem('adminUser');
}

function openAdminModal() {
    if (isAdmin()) {
        toggleAdminPanel(true);
        return;
    }
    const hasUsers = JSON.parse(localStorage.getItem('users') || '[]').length > 0;
    if (!hasUsers) {
        document.getElementById('admin-login-modal').style.display = 'none';
        document.getElementById('register-modal').style.display   = 'flex';
    } else {
        document.getElementById('admin-login-modal').style.display = 'flex';
        document.getElementById('register-modal').style.display   = 'none';
    }
}

// Abrir modal admin via botões
document.getElementById('btn-admin-header').addEventListener('click', openAdminModal);

// Fechar modais
document.getElementById('close-admin-modal').addEventListener('click', () => {
    document.getElementById('admin-login-modal').style.display = 'none';
});
document.getElementById('close-register-modal').addEventListener('click', () => {
    document.getElementById('register-modal').style.display = 'none';
});
// Fechar clicando fora
['admin-login-modal', 'register-modal'].forEach(id => {
    document.getElementById(id).addEventListener('click', (e) => {
        if (e.target.id === id) document.getElementById(id).style.display = 'none';
    });
});

// Mostrar cadastro
document.getElementById('show-register').addEventListener('click', () => {
    document.getElementById('admin-login-modal').style.display = 'none';
    document.getElementById('register-modal').style.display   = 'flex';
});

// — Login Admin
document.getElementById('btn-admin-login').addEventListener('click', () => {
    const email    = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const msg      = document.getElementById('admin-login-msg');

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user  = users.find(u => u.email === email && u.password === btoa(password) && u.role === 'admin');

    if (user) {
        localStorage.setItem('adminUser', JSON.stringify(user));
        document.getElementById('admin-login-modal').style.display = 'none';
        document.getElementById('admin-email').value    = '';
        document.getElementById('admin-password').value = '';
        msg.className = 'form-msg';
        toggleAdminPanel(true);
        showMessage('Bem-vindo, ' + user.name + '!', 'success');
    } else {
        msg.textContent = 'Email ou senha inválidos!';
        msg.className   = 'form-msg error';
    }
});

// — Cadastro Admin
document.getElementById('btn-register').addEventListener('click', () => {
    const name     = document.getElementById('reg-name').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const msg      = document.getElementById('register-msg');

    if (!name || !email || !password) {
        msg.textContent = 'Preencha todos os campos!';
        msg.className   = 'form-msg error'; return;
    }
    if (password.length < 6) {
        msg.textContent = 'Senha deve ter pelo menos 6 caracteres!';
        msg.className   = 'form-msg error'; return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.email === email)) {
        msg.textContent = 'Email já cadastrado!';
        msg.className   = 'form-msg error'; return;
    }

    const user = { id: Date.now().toString(), name, email, password: btoa(password), role: 'admin', createdAt: new Date().toISOString() };
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));

    msg.textContent = 'Conta criada! Faça login.';
    msg.className   = 'form-msg success';
    setTimeout(() => {
        document.getElementById('register-modal').style.display   = 'none';
        document.getElementById('admin-login-modal').style.display = 'flex';
        msg.className = 'form-msg';
    }, 1500);
});

// — Logout Admin
document.getElementById('btn-logout-admin').addEventListener('click', () => {
    localStorage.removeItem('adminUser');
    toggleAdminPanel(false);
    showMessage('Logout realizado!', 'success');
});

function toggleAdminPanel(show) {
    document.getElementById('admin-panel').style.display = show ? 'block' : 'none';
    if (show) {
        loadAllData();
        document.getElementById('admin-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}


// ============================================
// PAINEL ADMIN — ABAS
// ============================================

document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById('admin-' + tab).classList.add('active');
        if (tab === 'users') loadUsers();
    });
});


// ============================================
// CIRCUITOS
// ============================================

document.getElementById('btn-add-circuit').addEventListener('click', () => {
    if (!isAdmin()) { showMessage('Acesso negado!', 'error'); return; }

    const name    = document.getElementById('circuit-name').value.trim();
    const country = document.getElementById('circuit-country').value.trim();
    const city    = document.getElementById('circuit-city').value.trim();

    if (!name || !country || !city) { showMessage('Preencha os campos obrigatórios!', 'error'); return; }

    const circuit = {
        id:      Date.now().toString(),
        name,
        country,
        city,
        length:  document.getElementById('circuit-length').value.trim(),
        laps:    document.getElementById('circuit-laps').value.trim(),
        year:    document.getElementById('circuit-year').value.trim(),
        region:  document.getElementById('circuit-region').value.trim(),
        desc:    document.getElementById('circuit-desc').value.trim(),
        custom:  true
    };

    const circuits = JSON.parse(localStorage.getItem('circuits') || '[]');
    circuits.push(circuit);
    localStorage.setItem('circuits', JSON.stringify(circuits));

    ['circuit-name','circuit-country','circuit-city','circuit-length',
     'circuit-laps','circuit-year','circuit-region','circuit-desc']
        .forEach(id => document.getElementById(id).value = '');

    loadCircuits();
    showMessage('Circuito adicionado!', 'success');
});

function loadCircuits(filterRegion = 'all', search = '') {
    const container = document.getElementById('circuits-list');
    container.innerHTML = '';

    const stored  = JSON.parse(localStorage.getItem('circuits') || '[]');
    const all     = [...DEFAULT_CIRCUITS, ...stored.filter(c => c.custom)];
    const admin   = isAdmin();

    const filtered = all.filter(c => {
        const matchFilter = filterRegion === 'all' || (c.region || '').includes(filterRegion);
        const matchSearch = !search ||
            c.name.toLowerCase().includes(search) ||
            c.country.toLowerCase().includes(search) ||
            (c.city || '').toLowerCase().includes(search);
        return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Nenhum circuito encontrado</p></div>';
        return;
    }

    filtered.forEach(circuit => {
        const div = document.createElement('div');
        div.className = 'card';

        // Extrai apenas o emoji do campo country
        const flagMatch = circuit.country.match(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
        const flag = flagMatch ? flagMatch[0] : '🏁';

        let html = `
            <div class="card-flag">${flag}</div>
            <div class="card-title">${circuit.name}</div>
            <div class="card-subtitle">${circuit.city ? circuit.city + ' · ' : ''}${circuit.country.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '').trim()}</div>
            <div class="card-meta">`;

        if (circuit.length) html += `<span class="card-badge">📏 ${circuit.length}</span>`;
        if (circuit.laps)   html += `<span class="card-badge">🔄 ${circuit.laps} voltas</span>`;
        if (circuit.year)   html += `<span class="card-badge">📅 1º GP: ${circuit.year}</span>`;
        if (circuit.region) html += `<span class="card-badge">🌍 ${circuit.region}</span>`;

        html += `</div>`;
        if (circuit.desc) html += `<p class="card-desc">${circuit.desc}</p>`;

        if (admin && circuit.custom) {
            html += `<button class="btn-delete-card" data-id="${circuit.id}" title="Excluir">×</button>`;
        }

        div.innerHTML = html;
        container.appendChild(div);

        if (admin && circuit.custom) {
            div.querySelector('.btn-delete-card').addEventListener('click', () => {
                if (confirm('Excluir este circuito?')) deleteCircuit(circuit.id);
            });
        }
    });
}

function deleteCircuit(id) {
    if (!isAdmin()) return;
    let circuits = JSON.parse(localStorage.getItem('circuits') || '[]');
    localStorage.setItem('circuits', JSON.stringify(circuits.filter(c => c.id !== id)));
    loadCircuits();
    showMessage('Circuito excluído!', 'success');
}

// Filtros e busca de circuitos
document.querySelectorAll('#circuits-section .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#circuits-section .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyCircuitFilters();
    });
});
document.getElementById('circuit-search').addEventListener('input', applyCircuitFilters);

function applyCircuitFilters() {
    const active = document.querySelector('#circuits-section .filter-btn.active');
    const region = active ? active.dataset.filter : 'all';
    const search = document.getElementById('circuit-search').value.toLowerCase().trim();
    loadCircuits(region, search);
}


// ============================================
// EQUIPES
// ============================================

document.getElementById('btn-add-team').addEventListener('click', () => {
    if (!isAdmin()) { showMessage('Acesso negado!', 'error'); return; }

    const name    = document.getElementById('team-name').value.trim();
    const country = document.getElementById('team-country').value.trim();

    if (!name || !country) { showMessage('Preencha os campos obrigatórios!', 'error'); return; }

    const team = {
        id:      Date.now().toString(),
        name,
        country,
        base:    document.getElementById('team-base').value.trim(),
        years:   document.getElementById('team-years').value.trim(),
        titles:  document.getElementById('team-titles').value.trim(),
        status:  document.getElementById('team-status').value.trim() || 'ativa',
        desc:    document.getElementById('team-desc').value.trim(),
        custom:  true
    };

    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    teams.push(team);
    localStorage.setItem('teams', JSON.stringify(teams));

    ['team-name','team-country','team-base','team-years','team-titles','team-status','team-desc']
        .forEach(id => document.getElementById(id).value = '');

    loadTeams();
    showMessage('Equipe adicionada!', 'success');
});

function loadTeams(filterStatus = 'all', search = '') {
    const container = document.getElementById('teams-list');
    container.innerHTML = '';

    const stored  = JSON.parse(localStorage.getItem('teams') || '[]');
    const all     = [...DEFAULT_TEAMS, ...stored.filter(t => t.custom)];
    const admin   = isAdmin();

    const filtered = all.filter(t => {
        const matchFilter = filterStatus === 'all' || (t.status || 'ativa').toLowerCase().includes(filterStatus);
        const matchSearch = !search ||
            t.name.toLowerCase().includes(search) ||
            t.country.toLowerCase().includes(search) ||
            (t.base || '').toLowerCase().includes(search);
        return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Nenhuma equipe encontrada</p></div>';
        return;
    }

    filtered.forEach(team => {
        const div = document.createElement('div');
        div.className = 'card';

        const flagMatch = team.country.match(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
        const flag = flagMatch ? flagMatch[0] : '🏁';
        const isActive = (team.status || 'ativa').toLowerCase() === 'ativa';

        let html = `
            <div class="card-flag">${flag}</div>
            <div class="card-title">${team.name}</div>
            <div class="card-subtitle">${team.country.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '').trim()}</div>
            <div class="card-meta">`;

        if (team.years)  html += `<span class="card-badge">📆 ${team.years}</span>`;
        if (team.titles) html += `<span class="card-badge">🏆 ${team.titles} título${Number(team.titles) !== 1 ? 's' : ''}</span>`;
        if (team.base)   html += `<span class="card-badge">📍 ${team.base}</span>`;
        html += `<span class="card-badge" style="background:${isActive ? 'rgba(40,167,69,0.15)' : 'rgba(150,150,150,0.12)'}; color:${isActive ? '#28a745' : '#888'}">${isActive ? '✅ Ativa' : '🏛️ Histórica'}</span>`;

        html += `</div>`;
        if (team.desc) html += `<p class="card-desc">${team.desc}</p>`;

        if (admin && team.custom) {
            html += `<button class="btn-delete-card" data-id="${team.id}" title="Excluir">×</button>`;
        }

        div.innerHTML = html;
        container.appendChild(div);

        if (admin && team.custom) {
            div.querySelector('.btn-delete-card').addEventListener('click', () => {
                if (confirm('Excluir esta equipe?')) deleteTeam(team.id);
            });
        }
    });
}

function deleteTeam(id) {
    if (!isAdmin()) return;
    let teams = JSON.parse(localStorage.getItem('teams') || '[]');
    localStorage.setItem('teams', JSON.stringify(teams.filter(t => t.id !== id)));
    loadTeams();
    showMessage('Equipe excluída!', 'success');
}

// Filtros e busca de equipes
document.querySelectorAll('#teams-section .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#teams-section .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyTeamFilters();
    });
});
document.getElementById('team-search').addEventListener('input', applyTeamFilters);

function applyTeamFilters() {
    const active = document.querySelector('#teams-section .filter-btn.active');
    const status = active ? active.dataset.filter : 'all';
    const search = document.getElementById('team-search').value.toLowerCase().trim();
    loadTeams(status, search);
}


// ============================================
// USUÁRIOS
// ============================================

function loadUsers() {
    if (!isAdmin()) return;
    const container   = document.getElementById('users-container');
    container.innerHTML = '';
    const users       = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

    if (users.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted)">Nenhum usuário cadastrado.</p>';
        return;
    }

    users.forEach(user => {
        const isCurrentUser = user.id === currentUser.id;
        const isOnlyAdmin   = users.filter(u => u.role === 'admin').length === 1 && user.role === 'admin';

        const div = document.createElement('div');
        div.className = 'user-card';
        div.innerHTML = `
            <div class="user-card-info">
                <strong>${user.name} ${user.role === 'admin' ? '👑' : ''}</strong>
                <span>${user.email}</span>
                <span>Cadastro: ${new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <button class="btn-delete-user" data-id="${user.id}"
                ${isOnlyAdmin || isCurrentUser ? 'disabled' : ''}>
                ${isOnlyAdmin ? 'Único Admin' : isCurrentUser ? 'Você' : 'Excluir'}
            </button>`;
        container.appendChild(div);

        if (!isOnlyAdmin && !isCurrentUser) {
            div.querySelector('.btn-delete-user').addEventListener('click', () => {
                if (confirm(`Excluir "${user.name}"?`)) {
                    let users = JSON.parse(localStorage.getItem('users') || '[]');
                    localStorage.setItem('users', JSON.stringify(users.filter(u => u.id !== user.id)));
                    loadUsers();
                    showMessage('Usuário excluído!', 'success');
                }
            });
        }
    });
}


// ============================================
// UTILITÁRIOS
// ============================================

function loadAllData() {
    loadCircuits();
    loadTeams();
}

function showMessage(text, type) {
    const msg = document.getElementById('message');
    msg.textContent = text;
    msg.className   = `show ${type}`;
    clearTimeout(msg._timeout);
    msg._timeout = setTimeout(() => msg.classList.remove('show'), 3000);
}


// ============================================
// DADOS PADRÃO — CIRCUITOS DE TODOS OS TEMPOS
// ============================================

const DEFAULT_CIRCUITS = [
    // EUROPA
    { id:'c01', name:'Autodromo Nazionale di Monza',     country:'🇮🇹 Itália',        city:'Monza',           length:'5,793 km', laps:'53', year:'1950', region:'Europa',         desc:'O templo da velocidade. Maior velocidade média do calendário. Pátio da torcida Ferrari desde 1950.' },
    { id:'c02', name:'Circuit de Spa-Francorchamps',     country:'🇧🇪 Bélgica',        city:'Spa',             length:'7,004 km', laps:'44', year:'1950', region:'Europa',         desc:'O maior e mais desafiante. Eau Rouge/Raidillon, clima imprevisível e história em cada curva.' },
    { id:'c03', name:'Silverstone Circuit',              country:'🇬🇧 Reino Unido',    city:'Silverstone',     length:'5,891 km', laps:'52', year:'1950', region:'Europa',         desc:'Berço da Fórmula 1. O primeiro GP da história foi aqui em 1950. Copse e Maggots são lendárias.' },
    { id:'c04', name:'Circuit de Monaco',                country:'🇲🇨 Mônaco',         city:'Monte Carlo',     length:'3,337 km', laps:'78', year:'1950', region:'Europa',         desc:'O mais lento e mais famoso. Ruas estreitas, muros cerrados e glamour únicos no esporte motor.' },
    { id:'c05', name:'Circuit de Barcelona-Catalunya',   country:'🇪🇸 Espanha',        city:'Barcelona',       length:'4,657 km', laps:'66', year:'1991', region:'Europa',         desc:'Clássico circuito de testes. Exige equilíbrio aerodinâmico perfeito. Favorito dos engenheiros.' },
    { id:'c06', name:'Hungaroring',                      country:'🇭🇺 Hungria',        city:'Budapeste',       length:'4,381 km', laps:'70', year:'1986', region:'Europa',         desc:'Muito técnico, poucas ultrapassagens. Calor intenso e asfalto complicado exigem muito dos pneus.' },
    { id:'c07', name:'Red Bull Ring',                    country:'🇦🇹 Áustria',        city:'Spielberg',       length:'4,318 km', laps:'71', year:'1970', region:'Europa',         desc:'Pista compacta nas montanhas estirias. Reta principal curta e curvas de alta velocidade.' },
    { id:'c08', name:'Circuit Zandvoort',                country:'🇳🇱 Holanda',        city:'Zandvoort',       length:'4,259 km', laps:'72', year:'1952', region:'Europa',         desc:'Entre dunas holandesas, com curvas banqueadas únicas. Grande casa de Max Verstappen.' },
    { id:'c09', name:'Autodromo Enzo e Dino Ferrari',    country:'🇮🇹 Itália',        city:'Imola',           length:'4,909 km', laps:'63', year:'1980', region:'Europa',         desc:'Um dos traçados mais históricos. Palco de trágicos acidentes e grandes batalhas ao longo das décadas.' },
    { id:'c10', name:'Nürburgring (GP-Strecke)',         country:'🇩🇪 Alemanha',       city:'Nürburg',         length:'5,148 km', laps:'60', year:'1951', region:'Europa',         desc:'A moderna pista alemã. A antiga Nordschleife, com 22 km, era considerada a mais perigosa da história.' },
    { id:'c11', name:'Hockenheimring',                   country:'🇩🇪 Alemanha',       city:'Hockenheim',      length:'4,574 km', laps:'67', year:'1970', region:'Europa',         desc:'Alternava com o Nürburgring como sede do GP da Alemanha. Pista técnica com estádio icônico.' },
    { id:'c12', name:'Circuit Paul Ricard',              country:'🇫🇷 França',         city:'Le Castellet',    length:'5,842 km', laps:'53', year:'1971', region:'Europa',         desc:'Pista no sul da França com múltiplas configurações possíveis. Retornou ao calendário em 2018.' },
    { id:'c13', name:'Circuit Gilles Villeneuve',        country:'🇨🇦 Canadá',        city:'Montreal',        length:'4,361 km', laps:'70', year:'1978', region:'Américas',       desc:'Circuito em ilha no Rio São Lourenço. O "Muro dos Campeões" elimina favoritos toda temporada.' },
    { id:'c14', name:'Autodromo Hermanos Rodríguez',     country:'🇲🇽 México',         city:'Cidade do México',length:'4,304 km', laps:'71', year:'1963', region:'Américas',       desc:'A altitude de 2.285 m afeta motores e aerodinâmica. O estádio Foro Sol cria uma atmosfera única.' },
    { id:'c15', name:'Autódromo José Carlos Pace',       country:'🇧🇷 Brasil',         city:'São Paulo',       length:'4,309 km', laps:'71', year:'1973', region:'Américas',       desc:'Interlagos é palco de corridas históricas e chuvas que mudam tudo. Curva do Lago é sua marca.' },
    { id:'c16', name:'Circuit of the Americas',          country:'🇺🇸 EUA',            city:'Austin',          length:'5,513 km', laps:'56', year:'2012', region:'Américas',       desc:'Projetado para ser o circuito perfeito da F1 nos EUA. A subida até a curva 1 é espetacular.' },
    { id:'c17', name:'Autódromo do Miami',               country:'🇺🇸 EUA',            city:'Miami Gardens',   length:'5,412 km', laps:'57', year:'2022', region:'Américas',       desc:'Circuito de rua ao redor do Hard Rock Stadium. Estreou em 2022 com grande festa.' },
    { id:'c18', name:'Las Vegas Strip Circuit',          country:'🇺🇸 EUA',            city:'Las Vegas',       length:'6,201 km', laps:'50', year:'2023', region:'Américas',       desc:'Pela Strip de Las Vegas. Instalações luxuosas e o espetáculo da cidade que nunca dorme.' },
    { id:'c19', name:'Watkins Glen International',       country:'🇺🇸 EUA',            city:'Watkins Glen',    length:'5,435 km', laps:'59', year:'1961', region:'Américas',       desc:'Clássico americano que sediou o GP dos EUA de 1961 a 1980. Traçado técnico em Nova York.' },
    { id:'c20', name:'Indianapolis Motor Speedway',      country:'🇺🇸 EUA',            city:'Indianápolis',    length:'4,192 km', laps:'73', year:'1950', region:'Américas',       desc:'O histórico oval que fez parte do campeonato em 1950. Retornou como GP dos EUA de 2000 a 2007.' },
    { id:'c21', name:'Albert Park Circuit',              country:'🇦🇺 Austrália',      city:'Melbourne',       length:'5,278 km', laps:'58', year:'1996', region:'Ásia & Oceania', desc:'Circuito semipermanente num parque de Melbourne. Abre a temporada desde 1996 com grande festa.' },
    { id:'c22', name:'Suzuka International Racing Course',country:'🇯🇵 Japão',          city:'Suzuka',          length:'5,807 km', laps:'53', year:'1987', region:'Ásia & Oceania', desc:'Único circuito em forma de "8" do calendário. A "S" de Suzuka é o trecho favorito dos pilotos.' },
    { id:'c23', name:'Autódromo Internacional de Xangai',country:'🇨🇳 China',          city:'Xangai',          length:'5,451 km', laps:'56', year:'2004', region:'Ásia & Oceania', desc:'Projetado por Hermann Tilke com curvas de alta velocidade únicas. Uma das retas mais longas da F1.' },
    { id:'c24', name:'Marina Bay Street Circuit',        country:'🇸🇬 Singapura',      city:'Singapura',       length:'4,940 km', laps:'61', year:'2008', region:'Ásia & Oceania', desc:'Única corrida 100% noturna da F1. Calor e umidade extremos tornam Singapura a mais exigente.' },
    { id:'c25', name:'Sepang International Circuit',     country:'🇲🇾 Malásia',        city:'Sepang',          length:'5,543 km', laps:'56', year:'1999', region:'Ásia & Oceania', desc:'Pista técnica com chuvas tropicais frequentes. Sediou o GP da Malásia de 1999 a 2017.' },
    { id:'c26', name:'Korea International Circuit',      country:'🇰🇷 Coreia do Sul',  city:'Yeongam',         length:'5,615 km', laps:'55', year:'2010', region:'Ásia & Oceania', desc:'Pista mista com seção de rua e permanente. Sediou o GP da Coreia de 2010 a 2013.' },
    { id:'c27', name:'Buddh International Circuit',      country:'🇮🇳 Índia',          city:'Nova Delhi',      length:'5,125 km', laps:'60', year:'2011', region:'Ásia & Oceania', desc:'Pista moderna que sediou o GP da Índia entre 2011 e 2013 antes de ser retirada do calendário.' },
    { id:'c28', name:'Circuito Internacional do Bahrein',country:'🇧🇭 Bahrein',        city:'Sakhir',          length:'5,412 km', laps:'57', year:'2004', region:'Oriente Médio',  desc:'Primeiro GP noturno da F1 em 2014. Pista no deserto com trechos técnicos e de alta velocidade.' },
    { id:'c29', name:'Circuito de Jeddah',               country:'🇸🇦 Arábia Saudita', city:'Jeddah',          length:'6,174 km', laps:'50', year:'2021', region:'Oriente Médio',  desc:'O segundo circuito de rua mais rápido da F1. Alta velocidade média e muros muito próximos.' },
    { id:'c30', name:'Yas Marina Circuit',               country:'🇦🇪 Abu Dhabi',      city:'Abu Dhabi',       length:'5,281 km', laps:'55', year:'2009', region:'Oriente Médio',  desc:'Fecha a temporada desde 2009. Reformulado em 2021 para mais ultrapassagens. Pôr do sol no cenário.' },
    { id:'c31', name:'Lusail International Circuit',     country:'🇶🇦 Catar',          city:'Lusail',          length:'5,380 km', laps:'57', year:'2021', region:'Oriente Médio',  desc:'Circuito noturno de alta velocidade no Catar. Contrato de longo prazo no calendário atual.' },
    { id:'c32', name:'Baku City Circuit',                country:'🇦🇿 Azerbaijão',     city:'Baku',            length:'6,003 km', laps:'51', year:'2016', region:'Europa',         desc:'Reta mais longa do calendário (2,2 km) e o trecho histórico junto ao castelo medieval de Baku.' },
];


// ============================================
// DADOS PADRÃO — EQUIPES DE TODOS OS TEMPOS
// ============================================

const DEFAULT_TEAMS = [
    // ATIVAS
    { id:'t01', name:'Scuderia Ferrari',          country:'🇮🇹 Itália',        base:'Maranello, Itália',           years:'1950–presente', titles:'16', status:'ativa',     desc:'A equipe mais histórica da F1. 16 títulos de construtores, 15 de pilotos. Pilotos: Leclerc e Hamilton.' },
    { id:'t02', name:'Mercedes-AMG Petronas',     country:'🇩🇪 Alemanha',      base:'Brackley, Reino Unido',        years:'2010–presente', titles:'8',  status:'ativa',     desc:'Dominadora entre 2014 e 2021 com 8 títulos consecutivos. Pilotos: George Russell e Kimi Antonelli.' },
    { id:'t03', name:'Red Bull Racing',           country:'🇦🇹 Áustria',       base:'Milton Keynes, Reino Unido',   years:'2005–presente', titles:'6',  status:'ativa',     desc:'Campeã de construtores em 2010–13 e 2022–24. Motor Honda RBPT. Pilotos: Verstappen e Lawson.' },
    { id:'t04', name:'McLaren F1 Team',           country:'🇬🇧 Reino Unido',   base:'Woking, Reino Unido',          years:'1966–presente', titles:'8',  status:'ativa',     desc:'Campeã de construtores em 2025 após décadas. Motor Mercedes. Pilotos: Lando Norris e Oscar Piastri.' },
    { id:'t05', name:'Aston Martin Aramco',       country:'🇬🇧 Reino Unido',   base:'Silverstone, Reino Unido',     years:'2021–presente', titles:'0',  status:'ativa',     desc:'Equipe em crescimento com forte investimento. Motor Mercedes. Pilotos: Fernando Alonso e Lance Stroll.' },
    { id:'t06', name:'Alpine F1 Team',            country:'🇫🇷 França',        base:'Enstone, Reino Unido',         years:'2021–presente', titles:'0',  status:'ativa',     desc:'Braço esportivo da Renault. Motor Renault. Pilotos: Pierre Gasly e Jack Doohan.' },
    { id:'t07', name:'Williams Racing',           country:'🇬🇧 Reino Unido',   base:'Grove, Reino Unido',           years:'1978–presente', titles:'9',  status:'ativa',     desc:'Lenda da F1 com 9 títulos de construtores (7 seguidos, 1992–97). Motor Mercedes. Pilotos: Albon e Sainz.' },
    { id:'t08', name:'Visa Cash App RB',          country:'🇮🇹 Itália',        base:'Faenza, Itália',               years:'1985–presente', titles:'0',  status:'ativa',     desc:'Equipe satélite da Red Bull, ex-AlphaTauri, ex-Minardi. Motor Honda RBPT. Pilotos: Tsunoda e Hadjar.' },
    { id:'t09', name:'Haas F1 Team',              country:'🇺🇸 EUA',           base:'Kannapolis, EUA',              years:'2016–presente', titles:'0',  status:'ativa',     desc:'Única equipe americana na F1 moderna. Motor Ferrari. Pilotos: Esteban Ocon e Oliver Bearman.' },
    { id:'t10', name:'Sauber (Stake F1)',          country:'🇨🇭 Suíça',         base:'Hinwil, Suíça',                years:'1993–presente', titles:'0',  status:'ativa',     desc:'Em transição para equipe de fábrica Audi em 2026. Motor Ferrari. Pilotos: Hülkenberg e Bortoleto.' },
    // HISTÓRICAS
    { id:'t11', name:'Lotus Cars',                country:'🇬🇧 Reino Unido',   base:'Norfolk, Reino Unido',         years:'1958–1994',     titles:'7',  status:'historica',  desc:'A equipe inovadora de Colin Chapman. 7 títulos de construtores, pioneira em asas, efeito solo e turbo.' },
    { id:'t12', name:'Brabham',                   country:'🇬🇧 Reino Unido',   base:'Surrey, Reino Unido',          years:'1962–1992',     titles:'2',  status:'historica',  desc:'Equipe de Jack Brabham, único piloto a vencer com carro próprio. 2 títulos de construtores.' },
    { id:'t13', name:'Tyrrell Racing',            country:'🇬🇧 Reino Unido',   base:'Surrey, Reino Unido',          years:'1970–1998',     titles:'1',  status:'historica',  desc:'Equipe de Ken Tyrrell, campeã com Jackie Stewart em 1971. Famosa pelo P34 de 6 rodas em 1976.' },
    { id:'t14', name:'BRM (British Racing Motors)',country:'🇬🇧 Reino Unido',   base:'Bourne, Reino Unido',         years:'1951–1977',     titles:'1',  status:'historica',  desc:'Projeto britânico de grande ambição. Campeã com Graham Hill em 1962.' },
    { id:'t15', name:'Cooper Car Company',        country:'🇬🇧 Reino Unido',   base:'Surrey, Reino Unido',          years:'1950–1969',     titles:'2',  status:'historica',  desc:'Pioneira do motor traseiro na F1. Campeã de construtores em 1959 e 1960 com Jack Brabham.' },
    { id:'t16', name:'Matra',                     country:'🇫🇷 França',        base:'Velizy-Villacoublay, França',  years:'1966–1972',     titles:'1',  status:'historica',  desc:'Fabricante aeronáutico francês que venceu o título de construtores em 1969 com Jackie Stewart.' },
    { id:'t17', name:'Team Lotus (Camel)',         country:'🇬🇧 Reino Unido',   base:'Norfolk, Reino Unido',         years:'1987–1994',     titles:'0',  status:'historica',  desc:'Continuação da tradição Lotus nos anos 80 e 90, com Ayrton Senna antes de ir para a McLaren.' },
    { id:'t18', name:'Renault F1 Team',           country:'🇫🇷 França',        base:'Enstone, Reino Unido',         years:'2001–2020',     titles:'2',  status:'historica',  desc:'Campeã com Fernando Alonso em 2005 e 2006. Renasceu como equipe de fábrica antes de virar Alpine.' },
    { id:'t19', name:'Honda Racing F1',           country:'🇯🇵 Japão',         base:'Brackley, Reino Unido',        years:'2006–2008',     titles:'0',  status:'historica',  desc:'Equipe de fábrica Honda que se tornou a Brawn GP após a saída da Honda em 2008.' },
    { id:'t20', name:'Brawn GP',                  country:'🇬🇧 Reino Unido',   base:'Brackley, Reino Unido',        years:'2009',          titles:'1',  status:'historica',  desc:'Fenômeno de uma temporada: campeã de construtores e pilotos em 2009, depois vendida à Mercedes.' },
    { id:'t21', name:'Jordan Grand Prix',         country:'🇮🇪 Irlanda',       base:'Silverstone, Reino Unido',     years:'1991–2005',     titles:'0',  status:'historica',  desc:'Equipe carismática de Eddie Jordan. Descobriu Schumacher e venceu 4 corridas na era V10.' },
    { id:'t22', name:'Benetton Formula',          country:'🇬🇧 Reino Unido',   base:'Enstone, Reino Unido',         years:'1986–2001',     titles:'2',  status:'historica',  desc:'Campeã com Michael Schumacher em 1994 e 1995. Depois foi adquirida pela Renault.' },
    { id:'t23', name:'BAR (British American Racing)',country:'🇬🇧 Reino Unido', base:'Brackley, Reino Unido',        years:'1999–2005',     titles:'0',  status:'historica',  desc:'Equipe competitiva que nunca venceu uma corrida. Base que deu origem à Honda F1 e depois à Brawn/Mercedes.' },
    { id:'t24', name:'Toyota Motorsport GmbH',    country:'🇯🇵 Japão',         base:'Colônia, Alemanha',            years:'2002–2009',     titles:'0',  status:'historica',  desc:'Maior investimento sem vitória na história da F1. 8 anos, nenhuma vitória, saiu em 2009.' },
    { id:'t25', name:'BMW Sauber F1 Team',        country:'🇩🇪 Alemanha',      base:'Hinwil, Suíça',                years:'2006–2009',     titles:'0',  status:'historica',  desc:'Parceria BMW com a Sauber. Robert Kubica venceu o GP do Canadá de 2008, única vitória.' },
    { id:'t26', name:'Force India / Racing Point', country:'🇮🇳 Índia',        base:'Silverstone, Reino Unido',     years:'2008–2020',     titles:'0',  status:'historica',  desc:'Ex-Spyker, Force India e Racing Point. Equipe de orçamento médio com muitos pódios. Virou Aston Martin.' },
    { id:'t27', name:'Toro Rosso',                country:'🇮🇹 Itália',        base:'Faenza, Itália',               years:'2006–2019',     titles:'0',  status:'historica',  desc:'Equipe satélite da Red Bull que revelou Vettel, Verstappen e outros. Renomeada para AlphaTauri em 2020.' },
    { id:'t28', name:'Super Aguri F1',            country:'🇯🇵 Japão',         base:'Leafield, Reino Unido',        years:'2006–2008',     titles:'0',  status:'historica',  desc:'Equipe japonesa fundada por Aguri Suzuki para dar oportunidades a pilotos japoneses. Fechou em 2008.' },
    { id:'t29', name:'Arrows Grand Prix',         country:'🇬🇧 Reino Unido',   base:'Leafield, Reino Unido',        years:'1978–2002',     titles:'0',  status:'historica',  desc:'25 anos sem vencer uma corrida, recorde negativo da F1. Dariusz Wurz ficou muito perto em 1997.' },
    { id:'t30', name:'Stewart Grand Prix',        country:'🇬🇧 Reino Unido',   base:'Milton Keynes, Reino Unido',   years:'1997–1999',     titles:'0',  status:'historica',  desc:'Equipe de Jackie Stewart. Rubens Barrichello venceu o GP da Malásia de 1999. Vendida à Ford/Jaguar.' },
    { id:'t31', name:'Jaguar Racing',             country:'🇬🇧 Reino Unido',   base:'Milton Keynes, Reino Unido',   years:'2000–2004',     titles:'0',  status:'historica',  desc:'Projeto milionário da Ford que não vingou. Vendida à Red Bull em 2004, virando a atual Red Bull Racing.' },
    { id:'t32', name:'Minardi',                   country:'🇮🇹 Itália',        base:'Faenza, Itália',               years:'1985–2005',     titles:'0',  status:'historica',  desc:'Equipe italiana amada pelos fãs por revelar talentos. Nunca venceu. Comprada pela Red Bull em 2005.' },
    { id:'t33', name:'Ligier',                    country:'🇫🇷 França',        base:'Vichy, França',                years:'1976–1996',     titles:'0',  status:'historica',  desc:'Equipe francesa com 9 vitórias na história. Jacques Laffite venceu 6 GPs pelos carros azuis de Ligier.' },
    { id:'t34', name:'March Engineering',         country:'🇬🇧 Reino Unido',   base:'Bicester, Reino Unido',        years:'1970–1992',     titles:'0',  status:'historica',  desc:'Construtor britânico que produziu carros para várias equipes e fórmulas. Niki Lauda usou um March no início.' },
    { id:'t35', name:'Wolf Racing',               country:'🇨🇦 Canadá',        base:'Reading, Reino Unido',         years:'1977–1979',     titles:'0',  status:'historica',  desc:'Jody Scheckter venceu na primeira corrida da equipe em 1977 (Argentina). Carreira curta mas marcante.' },
    { id:'t36', name:'Alfa Romeo Racing (histórica)',country:'🇮🇹 Itália',     base:'Milão, Itália',                years:'1950–1985',     titles:'2',  status:'historica',  desc:'Dominou os primeiros dois anos da F1 (1950–51) com Farina e Fangio. Retornou pontualmente em décadas seguintes.' },
    { id:'t37', name:'Vanwall',                   country:'🇬🇧 Reino Unido',   base:'Acton, Reino Unido',           years:'1956–1960',     titles:'1',  status:'historica',  desc:'Primeiro campeão de construtores da história (1958). Stirling Moss e Tony Brooks eram seus pilotos.' },
];


// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Restaurar modo escuro
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('modo-toggle').textContent = '☀️';
        updateLogos(true);
    }

    // Restaurar sessão admin
    if (isAdmin()) {
        toggleAdminPanel(true);
    }

    loadAllData();
});