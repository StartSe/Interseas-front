
// auth.js
const validateToken = async (token) => {
    try {
        const response = await fetch('https://interseas-n8n.paas.startse.com/webhook/auth/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
        const data = await response.json();
        return data.isValid;
    } catch (error) {
        console.error('Error validating token:', error);
        return false;
    }
};

export const checkAuth = async () => {
    const AUTH_TOKEN_KEY = 'auth_token';

    const getAuthToken = () => {
        const encryptedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        return encryptedToken ? atob(encryptedToken) : null;
    };

    const isAuthenticated = async () => {
        const token = getAuthToken();


        return validateToken(token);
    };

    // Redirect to login if not authenticated
    if (!await isAuthenticated()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
};
