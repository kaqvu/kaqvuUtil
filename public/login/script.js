const loginForm = document.getElementById('loginForm');
const loginInput = document.getElementById('loginInput');
const passwordInput = document.getElementById('passwordInput');
const errorMessage = document.getElementById('errorMessage');

const CREDENTIALS = {
    login: 'kaqvu',
    password: 'password'
};

function checkExistingSession() {
    const token = localStorage.getItem('kaqvuToken');
    if (token) {
        try {
            const decoded = atob(token);
            const [login] = decoded.split(':');
            if (login === CREDENTIALS.login) {
                window.location.href = '/panel';
            }
        } catch (e) {
            localStorage.removeItem('kaqvuToken');
        }
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const login = loginInput.value.trim();
    const password = passwordInput.value;
    
    if (!login || !password) {
        showError('Wszystkie pola są wymagane');
        return;
    }
    
    if (login === CREDENTIALS.login && password === CREDENTIALS.password) {
        const token = btoa(`${login}:${password}`);
        localStorage.setItem('kaqvuToken', token);
        
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
        
        setTimeout(() => {
            window.location.href = '/panel';
        }, 100);
    } else {
        showError('Nieprawidłowy login lub hasło');
        passwordInput.value = '';
        passwordInput.focus();
    }
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

loginInput.addEventListener('input', () => {
    errorMessage.classList.remove('show');
});

passwordInput.addEventListener('input', () => {
    errorMessage.classList.remove('show');
});

checkExistingSession();