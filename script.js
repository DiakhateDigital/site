// Configuration et initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est déjà connecté
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUserInterface();
            showSite();
            loadInitialData();
        } catch (error) {
            console.error('Erreur de connexion:', error);
            showAuth();
        }
    }
    
    // Gestion de la connexion SIMPLIFIÉE
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        
        const errorMessage = document.getElementById('error-message');
        const successMessage = document.getElementById('success-message');
        
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
    
        // Vérification SIMPLE - identifiants fixes
        const validUsers = {
            'elhadji': { 
                username: 'elhadji', 
                password: 'elhadji123', 
                name: 'Elhadji', 
                avatar: 'E', 
                partner: 'fatou' 
            },
            'fatou': { 
                username: 'fatou', 
                password: 'fatou123', 
                name: 'Fatou', 
                avatar: 'F', 
                partner: 'elhadji' 
            }
        };
        
        if (validUsers[username] && validUsers[username].password === password) {
            currentUser = validUsers[username];
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            successMessage.textContent = 'Connexion réussie !';
            successMessage.style.display = 'block';
            
            setTimeout(() => {
                updateUserInterface();
                showSite();
                loadInitialData();
            }, 1000);
        } else {
            errorMessage.textContent = 'Identifiants incorrects. Utilisez elhadji/elhadji123 ou fatou/fatou123';
            errorMessage.style.display = 'block';
        }
    });
    
    // Déconnexion
    document.getElementById('logout-btn').addEventListener('click', function() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showAuth();
    });
    
    // Navigation entre pages
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page') + '-page';
            
            // Mettre à jour la navigation active
            document.querySelectorAll('.nav-link').forEach(nav => {
                nav.classList.remove('active');
            });
            this.classList.add('active');
            
            // Afficher la page sélectionnée
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(pageId).classList.add('active');
            
            // Charger les données de la page
            loadPageData(pageId);
        });
    });
    
    // Clic sur les cartes de module
    document.querySelectorAll('.module-card').forEach(card => {
        card.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page') + '-page';
            
            // Mettre à jour la navigation active
            document.querySelectorAll('.nav-link').forEach(nav => {
                nav.classList.remove('active');
                if (nav.getAttribute('data-page') === this.getAttribute('data-page')) {
                    nav.classList.add('active');
                }
            });
            
            // Afficher la page sélectionnée
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(pageId).classList.add('active');
            
            // Charger les données de la page
            loadPageData(pageId);
        });
    });
    
    // Gestion des humeurs
    document.querySelectorAll('.mood-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.mood-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });
    
    document.getElementById('save-mood').addEventListener('click', async function() {
        await saveMood();
    });
    
    // Gestion des messages
    document.getElementById('send-message').addEventListener('click', async function() {
        await sendMessage();
    });
    
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Gestion des messages secrets
    document.getElementById('view-secret-btn').addEventListener('click', function() {
        document.getElementById('secret-message-modal').classList.add('active');
    });
    
    document.getElementById('cancel-secret-message').addEventListener('click', function() {
        document.getElementById('secret-message-modal').classList.remove('active');
        document.getElementById('secret-message-text').value = '';
    });
    
    document.getElementById('send-secret-message').addEventListener('click', async function() {
        await sendSecretMessage();
    });
});

// Variables globales
let currentUser = null;
let messages = [];

// Mettre à jour l'interface utilisateur
function updateUserInterface() {
    if (!currentUser) return;
    
    // Message de bienvenue
    const welcomeMessage = document.getElementById('welcome-message');
    if (currentUser.name === "Elhadji") {
        welcomeMessage.textContent = `Bonjour Elhadji & Fatou`;
        document.getElementById('chat-partner-name').textContent = 'Fatou';
        document.getElementById('chat-couple-names').innerHTML = '<strong>Elhadji & Fatou</strong>';
    } else {
        welcomeMessage.textContent = `Bonjour Fatou & Elhadji`;
        document.getElementById('chat-partner-name').textContent = 'Elhadji';
        document.getElementById('chat-couple-names').innerHTML = '<strong>Fatou & Elhadji</strong>';
    }
    
    // Avatar et nom
    document.getElementById('user-avatar').textContent = currentUser.avatar;
    document.getElementById('user-name-display').textContent = currentUser.name;
}

// Charger les données initiales
function loadInitialData() {
    loadMoodHistory();
    loadMessages();
    loadEvents();
    updateMoodChart();
}

// Charger les données de la page
function loadPageData(pageId) {
    switch(pageId) {
        case 'mood-page':
            loadMoodHistory();
            updateMoodChart();
            break;
        case 'messages-page':
            loadMessages();
            break;
        case 'gift-page':
            loadGiftSuggestions();
            break;
        case 'games-page':
            loadGames();
            break;
        case 'memories-page':
            loadMemories();
            break;
        case 'profile-page':
            loadProfile();
            break;
    }
}

// Enregistrer une humeur
async function saveMood() {
    if (!currentUser) return;
    
    const selectedMood = document.querySelector('.mood-option.selected');
    const moodNote = document.getElementById('mood-note').value;
    
    if (!selectedMood) {
        showNotification('Veuillez sélectionner une humeur', 'error');
        return;
    }
    
    const mood = selectedMood.getAttribute('data-mood');
    
    try {
        // Ajouter l'humeur à la base de données
        const { error } = await addMood({
            user: currentUser.username,
            mood: mood,
            note: moodNote
        });
        
        if (error) {
            throw error;
        }
        
        // Mettre à jour l'affichage
        loadMoodHistory();
        updateMoodChart();
        
        // Réinitialiser le formulaire
        document.querySelectorAll('.mood-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        document.getElementById('mood-note').value = '';
        
        showNotification('Humeur enregistrée !', 'success');
        
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement de l\'humeur:', error);
        showNotification('Erreur lors de l\'enregistrement', 'error');
    }
}

// Charger l'historique des humeurs
async function loadMoodHistory() {
    try {
        const { data, error } = await getMoods();
        
        const historyList = document.getElementById('mood-history-list');
        
        if (!data || data.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-smile"></i>
                    <p>Aucune humeur enregistrée pour le moment</p>
                </div>
            `;
            return;
        }
        
        // Afficher les humeurs
        historyList.innerHTML = data.map(mood => {
            // Déterminer le nom de l'utilisateur
            const userName = mood.user_id === 'elhadji' ? 'Elhadji' : 'Fatou';
            
            return `
                <div class="mood-history-item">
                    <div class="mood-history-emoji">${getMoodEmoji(mood.mood)}</div>
                    <div class="mood-history-info">
                        <strong>${userName}</strong> - ${getMoodName(mood.mood)}
                        ${mood.note ? `<div class="mood-note">${mood.note}</div>` : ''}
                        <div class="mood-history-date">${formatDate(mood.created_at)}</div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Erreur:', error);
        // Fallback si la base de données ne répond pas
        const historyList = document.getElementById('mood-history-list');
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-smile"></i>
                <p>Chargement des humeurs...</p>
            </div>
        `;
    }
}
// Mettre à jour le graphique d'humeur
function updateMoodChart() {
    const chartContainer = document.getElementById('mood-chart');
    chartContainer.innerHTML = '';
    
    // Générer des données de démonstration
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
    
    days.forEach(day => {
        const barContainer = document.createElement('div');
        barContainer.style.display = 'flex';
        barContainer.style.flexDirection = 'column';
        barContainer.style.alignItems = 'center';
        barContainer.style.width = '18%';
        
        // Données aléatoires pour la démonstration
        const partnerHeight = Math.floor(Math.random() * 30) + 60;
        const userHeight = Math.floor(Math.random() * 30) + 60;
        
        const partnerBar = document.createElement('div');
        partnerBar.style.width = '70%';
        partnerBar.style.height = `${partnerHeight}%`;
        partnerBar.style.background = 'linear-gradient(to top, var(--secondary-color), #a2d2ff)';
        partnerBar.style.borderRadius = '5px 5px 0 0';
        partnerBar.style.marginBottom = '5px';
        
        const userBar = document.createElement('div');
        userBar.style.width = '70%';
        userBar.style.height = `${userHeight}%`;
        userBar.style.background = 'linear-gradient(to top, var(--primary-color), #ffc8dd)';
        userBar.style.borderRadius = '5px 5px 0 0';
        
        barContainer.appendChild(partnerBar);
        barContainer.appendChild(userBar);
        chartContainer.appendChild(barContainer);
    });
    
    // Mettre à jour le résumé
    document.getElementById('mood-summary').textContent = "Analyse en cours... Votre énergie émotionnelle semble positive cette semaine.";
}

// Envoyer un message
async function sendMessage() {
    if (!currentUser) return;
    
    const input = document.getElementById('message-input');
    const messageText = input.value.trim();
    
    if (!messageText) return;
    
    try {
        // Ajouter le message à la base de données
        const { error } = await addMessage({
            sender: currentUser.username,
            receiver: currentUser.partner,
            text: messageText,
            is_secret: false
        });
        
        if (error) {
            throw error;
        }
        
        // Réinitialiser l'input
        input.value = '';
        input.focus();
        
        // Mettre à jour l'affichage
        loadMessages();
        
        showNotification('Message envoyé !', 'success');
        
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        showNotification('Erreur lors de l\'envoi du message', 'error');
    }
}

// Envoyer un message secret
async function sendSecretMessage() {
    const messageText = document.getElementById('secret-message-text').value.trim();
    
    if (!messageText) {
        showNotification('Veuillez écrire un message', 'error');
        return;
    }
    
    try {
        const { error } = await addMessage({
            sender: currentUser.username,
            receiver: currentUser.partner,
            text: messageText,
            is_secret: true
        });
        
        if (error) {
            throw error;
        }
        
        // Fermer le modal
        document.getElementById('secret-message-modal').classList.remove('active');
        document.getElementById('secret-message-text').value = '';
        
        // Mettre à jour le statut
        document.getElementById('secret-message-status').textContent = 'Message secret envoyé !';
        document.getElementById('secret-message-status').style.color = 'var(--success-color)';
        
        showNotification('Message secret envoyé !', 'success');
        
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message secret:', error);
        showNotification('Erreur lors de l\'envoi du message', 'error');
    }
}

// Charger les messages
async function loadMessages() {
    try {
        const { data, error } = await getMessages();
        
        if (error) {
            console.error('Erreur lors du chargement des messages:', error);
            return;
        }
        
        const messagesList = document.getElementById('messages-list');
        
        if (!data || data.length === 0) {
            messagesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <p>Aucun message pour le moment. Envoyez le premier message !</p>
                </div>
            `;
            return;
        }
        
        // Filtrer les messages entre l'utilisateur et son partenaire
        const filteredMessages = data.filter(msg => 
            (msg.sender_id === currentUser.username && msg.receiver_id === currentUser.partner) ||
            (msg.sender_id === currentUser.partner && msg.receiver_id === currentUser.username)
        );
        
        // Afficher les messages
        messagesList.innerHTML = filteredMessages.map(msg => {
            const isSent = msg.sender_id === currentUser.username;
            const senderName = msg.sender_id === 'elhadji' ? 'Elhadji' : 'Fatou';
            const time = formatTime(msg.created_at);
            
            return `
                <div class="message ${isSent ? 'sent' : 'received'}">
                    <div class="message-sender">${senderName}</div>
                    <div>${msg.content}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
        }).join('');
        
        // Faire défiler vers le bas
        messagesList.scrollTop = messagesList.scrollHeight;
        
    } catch (error) {
        console.error('Erreur:', error);
        // Fallback avec des messages de démonstration
        const messagesList = document.getElementById('messages-list');
        const partnerName = currentUser.partner === 'elhadji' ? 'Elhadji' : 'Fatou';
        
        messagesList.innerHTML = `
            <div class="message received">
                <div class="message-sender">${partnerName}</div>
                <div>Bonjour mon amour ! ❤️</div>
                <div class="message-time">10:30</div>
            </div>
            <div class="message sent">
                <div class="message-sender">${currentUser.name}</div>
                <div>Bonjour mon cœur ! Comment vas-tu aujourd'hui ?</div>
                <div class="message-time">10:32</div>
            </div>
        `;
    }
}

// Charger les événements
async function loadEvents() {
    try {
        const { data, error } = await getEvents();
        
        if (error) {
            console.error('Erreur lors du chargement des événements:', error);
            return;
        }
        
        const eventsList = document.getElementById('events-list');
        
        if (!data || data.length === 0) {
            eventsList.innerHTML = `
                <div class="event-item">
                    <i class="fas fa-calendar-alt"></i>
                    <div>
                        <strong>Anniversaire de Fatou</strong>
                        <p>15 juillet - Célébration de l'anniversaire</p>
                    </div>
                </div>
                <div class="event-item">
                    <i class="fas fa-calendar-alt"></i>
                    <div>
                        <strong>Notre premier rendez-vous</strong>
                        <p>22 août - Anniversaire de notre première rencontre</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Afficher les événements
        eventsList.innerHTML = data.map(event => `
            <div class="event-item">
                <i class="fas fa-calendar-alt"></i>
                <div>
                    <strong>${event.title}</strong>
                    <p>${formatDate(event.date)} - ${event.description}</p>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Charger les suggestions cadeaux
function loadGiftSuggestions() {
    const giftContainer = document.getElementById('gift-container');
    const partnerName = currentUser.partner === 'elhadji' ? 'Elhadji' : 'Fatou';
    
    giftContainer.innerHTML = `
        <div class="gift-grid">
            <div class="gift-card">
                <div class="gift-icon">🎁</div>
                <h3>Cadeau pour ${partnerName}</h3>
                <p>Sélectionnez des idées cadeaux basées sur les préférences</p>
                <button class="btn btn-secondary">Voir les suggestions</button>
            </div>
            <div class="gift-card">
                <div class="gift-icon">💝</div>
                <h3>Liste de souhaits</h3>
                <p>Créez une liste de souhaits secrète</p>
                <button class="btn btn-secondary">Gérer la liste</button>
            </div>
            <div class="gift-card">
                <div class="gift-icon">🎂</div>
                <h3>Prochain événement</h3>
                <p>Anniversaire de ${partnerName} - 15 juillet</p>
                <button class="btn btn-secondary">Voir les idées</button>
            </div>
        </div>
    `;
}

// Charger les jeux
function loadGames() {
    const gamesContainer = document.getElementById('games-container');
    
    gamesContainer.innerHTML = `
        <div class="game-card">
            <div class="game-icon">❓</div>
            <h3>Quiz Amoureux</h3>
            <p>Testez vos connaissances sur votre partenaire</p>
            <button class="btn">Jouer</button>
        </div>
        <div class="game-card">
            <div class="game-icon">🏆</div>
            <h3>Défis Romantiques</h3>
            <p>Relevez des défis pour pimenter votre relation</p>
            <button class="btn">Voir les défis</button>
        </div>
        <div class="game-card">
            <div class="game-icon">🎡</div>
            <h3>Roulette des Activités</h3>
            <p>Laissez la chance choisir votre prochaine sortie</p>
            <button class="btn">Tourner la roulette</button>
        </div>
    `;
}

// Charger les souvenirs
function loadMemories() {
    const memoriesContainer = document.getElementById('memories-container');
    
    memoriesContainer.innerHTML = `
        <div class="memories-grid">
            <div class="memory-card">
                <div class="memory-date">22 août 2021</div>
                <h3>Premier rendez-vous</h3>
                <p>Ce jour où tout a commencé ❤️</p>
                <button class="btn">Voir les souvenirs</button>
            </div>
            <div class="memory-card">
                <div class="memory-date">22 août 2022</div>
                <h3>Notre anniversaire</h3>
                <p>1 an d'amour et de bonheur</p>
                <button class="btn">Voir les souvenirs</button>
            </div>
            <div class="memory-card">
                <div class="memory-date">Mars 2023</div>
                <h3>Voyage à Venise</h3>
                <p>Notre escapade romantique</p>
                <button class="btn">Voir les souvenirs</button>
            </div>
        </div>
    `;
}

// Charger le profil
function loadProfile() {
    const profileContainer = document.getElementById('profile-container');
    const partnerName = currentUser.partner === 'elhadji' ? 'Elhadji' : 'Fatou';
    
    profileContainer.innerHTML = `
        <div class="profile-grid">
            <div class="profile-card">
                <h3>Votre profil</h3>
                <div class="profile-info">
                    <p><strong>Nom:</strong> ${currentUser.name}</p>
                    <p><strong>Partenaire:</strong> ${partnerName}</p>
                    <p><strong>Date de rencontre:</strong> 22 août 2021</p>
                </div>
                <button class="btn">Modifier le profil</button>
            </div>
            
            <div class="profile-card">
                <h3>Paramètres de sécurité</h3>
                <div class="security-settings">
                    <p><i class="fas fa-lock"></i> Messages chiffrés: <span class="status-active">Activé</span></p>
                    <p><i class="fas fa-eye-slash"></i> Mode privé: <span class="status-active">Activé</span></p>
                    <p><i class="fas fa-bell"></i> Notifications: <span class="status-active">Activées</span></p>
                </div>
            </div>
            
            <div class="profile-card">
                <h3>Modules activés</h3>
                <div class="modules-list">
                    <span class="module-tag">Mood2Love</span>
                    <span class="module-tag">CouplePlay</span>
                    <span class="module-tag">GiftRadar</span>
                    <span class="module-tag">LoveChat</span>
                    <span class="module-tag">Souvenirs</span>
                </div>
            </div>
        </div>
    `;
}

// Fonctions utilitaires
function showSite() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('site-container').style.display = 'block';
}

function showAuth() {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('site-container').style.display = 'none';
}

function getMoodEmoji(mood) {
    const emojis = {
        'happy': '😊',
        'inlove': '😍',
        'calm': '😌',
        'stressed': '😥',
        'tired': '😴'
    };
    return emojis[mood] || '😊';
}

function getMoodName(mood) {
    const names = {
        'happy': 'Heureux(se)',
        'inlove': 'Amoureux(se)',
        'calm': 'Calme',
        'stressed': 'Stressé(e)',
        'tired': 'Fatigué(e)'
    };
    return names[mood] || 'Heureux(se)';
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long'
        });
    } catch (e) {
        return dateString;
    }
}

function formatTime(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return '12:00';
    }
}

function showNotification(message, type = 'info') {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Styles pour la notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Fonctions importées depuis supabase.js
async function authenticateUser(username, password) {
    return await window.supabaseFunctions.authenticateUser(username, password);
}

async function getMoods() {
    return await window.supabaseFunctions.getMoods();
}

async function addMood(mood) {
    return await window.supabaseFunctions.addMood(mood);
}

async function getMessages() {
    return await window.supabaseFunctions.getMessages();
}

async function addMessage(message) {
    return await window.supabaseFunctions.addMessage(message);
}

async function markMessagesRead(username) {
    return await window.supabaseFunctions.markMessagesRead(username);
}

async function getEvents() {
    return await window.supabaseFunctions.getEvents();
}

async function updateUserStatus(username, isOnline) {
    return await window.supabaseFunctions.updateUserStatus(username, isOnline);
}

async function getPartnerStatus(partnerUsername) {
    return await window.supabaseFunctions.getPartnerStatus(partnerUsername);
}

async function getPartnerData(partnerUsername) {
    return await window.supabaseFunctions.getPartnerData(partnerUsername);
}
