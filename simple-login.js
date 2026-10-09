(() => {
  "use strict";

  const EXPECTED_USER_HASH =
    "77d3ef3c99674cc101136bb23870fb36f5452646315477364b65f91aa22e64fa";

  const EXPECTED_PASSWORD_HASH =
    "2db900efc1dbfc129984337cc7b6e3db82f0021568213120406255584893f003";

  let authenticated = false;

  async function sha256(value) {
    const bytes = new TextEncoder().encode(value);

    const digest = await crypto.subtle.digest(
      "SHA-256",
      bytes
    );

    return Array.from(new Uint8Array(digest))
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function showLogin() {
    authenticated = false;

    document.documentElement.classList.add("login-locked");

    const loginGate =
      document.getElementById("loginGate");

    const loginForm =
      document.getElementById("loginForm");

    const loginMessage =
      document.getElementById("loginMessage");

    if (loginGate) {
      loginGate.hidden = false;
    }

    if (loginForm) {
      loginForm.reset();
    }

    if (loginMessage) {
      loginMessage.textContent = "";
    }

    setTimeout(() => {
      document.getElementById("loginUser")?.focus();
    }, 50);
  }

  function showDashboard() {
    authenticated = true;

    document.documentElement.classList.remove(
      "login-locked"
    );

    const loginGate =
      document.getElementById("loginGate");

    if (loginGate) {
      loginGate.hidden = true;
    }
  }

  async function handleLogin(event) {
    event.preventDefault();

    const loginButton =
      document.getElementById("loginButton");

    const loginMessage =
      document.getElementById("loginMessage");

    const userId =
      document
        .getElementById("loginUser")
        .value
        .trim()
        .toLowerCase();

    const password =
      document.getElementById("loginPassword").value;

    loginButton.disabled = true;
    loginMessage.textContent = "Checking credentials...";

    try {
      const userHash = await sha256(userId);
      const passwordHash = await sha256(password);

      if (
        userHash === EXPECTED_USER_HASH &&
        passwordHash === EXPECTED_PASSWORD_HASH
      ) {
        document.getElementById(
          "loginPassword"
        ).value = "";

        loginMessage.textContent = "";

        showDashboard();
      } else {
        loginMessage.textContent =
          "Invalid user ID or password.";
      }
    } catch (error) {
      loginMessage.textContent =
        "Login could not be checked in this browser.";
    } finally {
      loginButton.disabled = false;
    }
  }

  function handleLogout() {
    showLogin();
  }

  function initializeLogin() {
    /*
      Remove login data created by previous versions.
    */
    localStorage.removeItem(
      "somani_stock_dashboard_login"
    );

    localStorage.removeItem(
      "somani_stock_login"
    );

    sessionStorage.removeItem(
      "somani_stock_dashboard_login"
    );

    sessionStorage.removeItem(
      "somani_stock_login"
    );

    const loginForm =
      document.getElementById("loginForm");

    const logoutButton =
      document.getElementById("dashboardLogout");

    if (loginForm) {
      loginForm.addEventListener(
        "submit",
        handleLogin
      );
    }

    if (logoutButton) {
      logoutButton.addEventListener(
        "click",
        handleLogout
      );
    }

    /*
      Always begin with the login screen.
      No login session is stored.
    */
    showLogin();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeLogin,
      { once: true }
    );
  } else {
    initializeLogin();
  }

  /*
    Hide the dashboard again when the page is restored
    from the browser back-forward cache.
  */
  window.addEventListener("pageshow", event => {
    if (event.persisted || !authenticated) {
      showLogin();
    }
  });
})();