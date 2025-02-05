const N8N_AUTH_BASE_URL =
  "https://ca-n8n-interseas-prod-eastus2-01.ambitiouscliff-2460d16d.eastus2.azurecontainerapps.io";
const AUTH_TOKEN_KEY = "auth_token";
const AUTH_TOKEN_DUURATION_MINUTES = 60;

const isDevEnv = () => {
  const currentUrl = window.location.href;
  return currentUrl.includes("localhost") || currentUrl.includes("127.0.0.1");
};

const getN8nWebhookUrl = (flowId) => {
  const envParam = isDevEnv() ? "Dev" : "";
  return `${N8N_AUTH_BASE_URL}/webhook/${flowId}${envParam}`;
};

const HOME_PAGE = "home.html";
const LOGIN_PAGE = isDevEnv() ? "/" : "/Interseas-front/";

const showErrorMessage = (message = "Credenciais inválidas") => {
  const errorMessageElement = document.getElementById("error-message");
  errorMessageElement.innerHTML = message;
  errorMessageElement.style.display = "block";
};

const hideErrorMessage = () => {
  const errorMessageElement = document.getElementById("error-message");
  errorMessageElement.style.display = "none";
  errorMessageElement.innerHTML = "";
};

const disableLoginButton = () => {
  const loginButton = document.getElementById("login-button");
  loginButton.disabled = true;
};

const enableLoginButton = () => {
  const loginButton = document.getElementById("login-button");
  loginButton.disabled = false;
};

const validateToken = async (token) => {
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(getN8nWebhookUrl("auth/v2/validate"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    const data = await response.json();

    return data.isValid;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
};

export const authenticate = async (username, password) => {
  hideErrorMessage();
  disableLoginButton();

  try {
    const response = await fetch(getN8nWebhookUrl("auth/v2"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      setAuthToken(data.token);
      window.location.href = HOME_PAGE;
      return true;
    } else {
      showErrorMessage();
      enableLoginButton();
      return false;
    }
  } catch (error) {
    console.error("Login error:", error);
    enableLoginButton();
    return false;
  }
};

const getAuthToken = () => {
  const name = AUTH_TOKEN_KEY + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
};

const setAuthToken = (token) => {
  const date = new Date();
  const millisecondsInSecond = 1000;
  const oneMinuteInMilliseconds = 60 * millisecondsInSecond;
  const duration = AUTH_TOKEN_DUURATION_MINUTES * oneMinuteInMilliseconds;

  date.setTime(date.getTime() + duration);
  const expires = "expires=" + date.toUTCString();

  document.cookie = AUTH_TOKEN_KEY + "=" + token + ";" + expires + ";path=/";
};

const isAuthenticated = async () => {
  const token = getAuthToken();
  const isValid = await validateToken(token);

  return isValid;
};

export const checkAuth = async ({
  redirectNotAuthenticated = false,
  notAuthenticatedDestinationPage = LOGIN_PAGE,
  redirectAuthenticated = false,
  authenticatedDestinationPage = null,
} = {}) => {
  const hideBody = () =>
    (document.getElementsByTagName("body")[0].style.display = "none");
  const showBody = (isRedirecting) => {
    !isRedirecting
      ? (document.getElementsByTagName("body")[0].style.display = "block")
      : "";
  };

  hideBody();

  let isRedirecting = false;
  const authenticated = await isAuthenticated();

  if (authenticated) {
    if (redirectAuthenticated && authenticatedDestinationPage) {
      window.location.href = authenticatedDestinationPage;
      isRedirecting = true;
    }

    showBody(isRedirecting);
    return true;
  }

  if (redirectNotAuthenticated) {
    window.location.href = notAuthenticatedDestinationPage;
    isRedirecting = true;
  }

  showBody(isRedirecting);
  return false;
};
