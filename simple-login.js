(() => {
  "use strict";

  const USER_HASH = "12749146f02b40aa456848e6cd78d5d08c502d9da84761cd8c2936869e9376fd";
  const PASSWORD_HASH = "d6cd340d97238ce8ad5fd4c9a6af8e2fea43c46845da6f76e06486c47c77226c";

  async function sha256(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function showLogin() {
    document.documentElement.classList.add("login-locked");
    const gate = document.getElementById("loginGate");
    if (gate) gate.hidden = false;
  }

  function showDashboard() {
    document.documentElement.classList.remove("login-locked");
    const gate = document.getElementById("loginGate");
    if (gate) gate.hidden = true;
  }

  async function handleLogin(event) {
    event.preventDefault();

    const userBox = document.getElementById("loginUser");
    const passwordBox = document.getElementById("loginPassword");
    const message = document.getElementById("loginMessage");
    const button = event.currentTarget.querySelector('button[type="submit"]');

    if (!userBox || !passwordBox || !message) {
      alert("Login form is incomplete. Reload the page.");
      return;
    }

    if (button) button.disabled = true;
    message.textContent = "Checking credentials...";

    try {
      const enteredUserHash = await sha256(userBox.value.trim().toLowerCase());
      const enteredPasswordHash = await sha256(passwordBox.value);

      if (enteredUserHash === USER_HASH && enteredPasswordHash === PASSWORD_HASH) {
        passwordBox.value = "";
        message.textContent = "";
        showDashboard();
      } else {
        message.textContent = "Invalid user ID or password.";
      }
    } catch (error) {
      console.error(error);
      message.textContent = "Login error. Reload the page and try again.";
    } finally {
      if (button) button.disabled = false;
    }
  }

  function initializeLogin() {
    localStorage.removeItem("somani_stock_login");
    localStorage.removeItem("somani_stock_dashboard_login");
    sessionStorage.removeItem("somani_stock_login");
    sessionStorage.removeItem("somani_stock_dashboard_login");

    const form = document.getElementById("loginForm");
    const logout = document.getElementById("dashboardLogout");

    if (!form) {
      console.error("loginForm was not found");
      return;
    }

    form.addEventListener("submit", handleLogin);
    if (logout) logout.addEventListener("click", showLogin);
    showLogin();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeLogin, { once: true });
  } else {
    initializeLogin();
  }
})();
