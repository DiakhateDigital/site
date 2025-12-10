// Configuration Supabase
const SUPABASE_URL = 'https://jerhixfzkivhkzfwchzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcmhpeGZ6a2l2aGt6ZndjaHpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MDQ1MTgsImV4cCI6MjA0Nzk4MDUxOH0.TwQ6T9p3Hr6nH9G4V4lV4w4z4p4Z4lV4w4z4p4Z4lV4';

// Initialiser Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fonction d'authentification
async function authenticateUser(username, password) {
    try {
        // Essayer d'abord avec Supabase
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (error || !data) {
            // Si erreur, utiliser la vérification simple
            console.log('Supabase échoue, utilisation de la vérification simple');
            if ((username === 'elhadji' && password === 'elhadji123') || 
                (username === 'fatou' && password === 'fatou123')) {
                
                const user = {
                    username: username,
                    name: username === 'elhadji' ? 'Elhadji' : 'Fatou',
                    avatar: username === 'elhadji' ? 'E' : 'F',
                    partner: username === 'elhadji' ? 'fatou' : 'elhadji'
                };
                
                return { user: user, error: null };
            } else {
                return { user: null, error: 'Identifiants incorrects' };
            }
        }

        // Si on a trouvé l'utilisateur dans la base de données
        const user = {
            username: data.username,
            name: data.name,
            avatar: data.avatar,
            partner: data.partner
        };
        
        return { user: user, error: null };

    } catch (error) {
        console.error('Exception lors de l\'authentification:', error);
        // En cas d'exception, utiliser la vérification simple
        if ((username === 'elhadji' && password === 'elhadji123') || 
            (username === 'fatou' && password === 'fatou123')) {
            
            const user = {
                username: username,
                name: username === 'elhadji' ? 'Elhadji' : 'Fatou',
                avatar: username === 'elhadji' ? 'E' : 'F',
                partner: username === 'elhadji' ? 'fatou' : 'elhadji'
            };
            
            return { user: user, error: null };
        } else {
            return { user: null, error: 'Identifiants incorrects' };
        }
    }
}

// Fonctions pour les humeurs
async function getMoods() {
    try {
        const { data, error } = await supabase
            .from('moods')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (!error && data) {
            return { data, error: null };
        }
        
        // Fallback vers localStorage
        const localMoods = JSON.parse(localStorage.getItem('couple_moods') || '[]');
        return { data: localMoods, error: null };
        
    } catch (error) {
        console.log('Fallback vers localStorage pour les humeurs');
        const localMoods = JSON.parse(localStorage.getItem('couple_moods') || '[]');
        return { data: localMoods, error: null };
    }
}

async function addMood(moodData) {
    try {
        const mood = {
            user_id: moodData.user,  // Note: la colonne s'appelle user_id dans la table
            mood: moodData.mood,
            note: moodData.note || '',
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('moods')
            .insert([mood]);
        
        if (!error) {
            // Mettre à jour le localStorage comme backup
            const localMoods = JSON.parse(localStorage.getItem('couple_moods') || '[]');
            localMoods.unshift(mood);
            localStorage.setItem('couple_moods', JSON.stringify(localMoods));
            
            return { data, error: null };
        }
        
        // Fallback vers localStorage
        console.log('Supabase échoue, utilisation de localStorage');
        const localMoods = JSON.parse(localStorage.getItem('couple_moods') || '[]');
        localMoods.unshift(mood);
        localStorage.setItem('couple_moods', JSON.stringify(localMoods));
        
        return { data: mood, error: null };
        
    } catch (error) {
        console.error('Erreur addMood:', error);
        // Utiliser localStorage en dernier recours
        const mood = {
            user_id: moodData.user,
            mood: moodData.mood,
            note: moodData.note || '',
            created_at: new Date().toISOString()
        };
        
        const localMoods = JSON.parse(localStorage.getItem('couple_moods') || '[]');
        localMoods.unshift(mood);
        localStorage.setItem('couple_moods', JSON.stringify(localMoods));
        
        return { data: mood, error: null };
    }
}

// Fonctions pour les messages
async function getMessages() {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(50);
        
        if (!error && data) {
            return { data, error: null };
        }
        
        // Fallback vers localStorage
        const localMessages = JSON.parse(localStorage.getItem('couple_messages') || '[]');
        return { data: localMessages, error: null };
        
    } catch (error) {
        console.log('Fallback vers localStorage pour les messages');
        const localMessages = JSON.parse(localStorage.getItem('couple_messages') || '[]');
        return { data: localMessages, error: null };
    }
}

async function addMessage(messageData) {
    try {
        const message = {
            sender_id: messageData.sender,
            receiver_id: messageData.receiver,
            content: messageData.text,
            is_secret: messageData.is_secret || false,
            is_read: false,
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('messages')
            .insert([message]);
        
        if (!error) {
            // Mettre à jour le localStorage comme backup
            const localMessages = JSON.parse(localStorage.getItem('couple_messages') || '[]');
            localMessages.push(message);
            localStorage.setItem('couple_messages', JSON.stringify(localMessages));
            
            return { data, error: null };
        }
        
        // Fallback vers localStorage
        console.log('Supabase échoue, utilisation de localStorage');
        const localMessages = JSON.parse(localStorage.getItem('couple_messages') || '[]');
        localMessages.push(message);
        localStorage.setItem('couple_messages', JSON.stringify(localMessages));
        
        return { data: message, error: null };
        
    } catch (error) {
        console.error('Erreur addMessage:', error);
        // Utiliser localStorage
        const message = {
            sender_id: messageData.sender,
            receiver_id: messageData.receiver,
            content: messageData.text,
            is_secret: messageData.is_secret || false,
            is_read: false,
            created_at: new Date().toISOString()
        };
        
        const localMessages = JSON.parse(localStorage.getItem('couple_messages') || '[]');
        localMessages.push(message);
        localStorage.setItem('couple_messages', JSON.stringify(localMessages));
        
        return { data: message, error: null };
    }
}

// Fonctions pour les événements
async function getEvents() {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });
        
        if (!error && data) {
            return { data, error: null };
        }
        
        // Fallback vers des événements statiques
        const staticEvents = [
            {
                title: 'Anniversaire de Fatou',
                description: 'Célébration de l\'anniversaire',
                date: '2024-07-15'
            },
            {
                title: 'Notre premier rendez-vous',
                description: 'Anniversaire de notre première rencontre',
                date: '2024-08-22'
            }
        ];
        
        return { data: staticEvents, error: null };
        
    } catch (error) {
        console.log('Fallback vers les événements statiques');
        const staticEvents = [
            {
                title: 'Anniversaire de Fatou',
                description: 'Célébration de l\'anniversaire',
                date: '2024-07-15'
            },
            {
                title: 'Notre premier rendez-vous',
                description: 'Anniversaire de notre première rencontre',
                date: '2024-08-22'
            }
        ];
        return { data: staticEvents, error: null };
    }
}

// Exporter les fonctions
window.supabaseFunctions = {
    authenticateUser,
    getMoods,
    addMood,
    getMessages,
    addMessage,
    getEvents
};

console.log('Supabase configuré avec fallback vers localStorage');