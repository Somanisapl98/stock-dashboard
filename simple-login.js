(() => {
  "use strict";

  const USER_HASH = "12749146f02b40aa456848e6cd78d5d08c502d9da84761cd8c2936869e9376fd";
  const PASSWORD_HASH = "d6cd340d97238ce8ad5fd4c9a6af8e2fea43c46845da6f76e06486c47c77226c";
  let authenticated = false;

  async function sha256(value) {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
  }

  function showLogin() {
    authenticated = false;
    document.documentElement.classList.add("login-locked");
    const gate = document.getElementById("loginGate");
    if (gate) gate.hidden = false;
  }

  function showDashboard() {
    authenticated = true;
    document.documentElement.classList.remove("login-locked");
    const gate = document.getElementById("loginGate");
    if (gate) gate.hidden = true;
  }

  async function handleLogin(event) {
    event.preventDefault();

    const userInput = document.getElementById("loginUser");
    const passwordInput = document.getElementById("loginPassword");
    const message = document.getElementById("loginMessage");
    const button = event.submitter || event.currentTarget.querySelector('button[type="submit"]');

    if (!userInput || !passwordInput || !message) return;

    if (button) button.disabled = true;
    message.textContent = "Checking credentials...";

    try {
      const user = userInput.value.trim().toLowerCase();
      const password = passwordInput.value;
      const [userHash, passwordHash] = await Promise.all([
        sha256(user),
        sha256(password)
      ]);

      if (userHash === USER_HASH && passwordHash === PASSWORD_HASH) {
        passwordInput.value = "";
        message.textContent = "";
        showDashboard();
      } else {
        message.textContent = "Invalid user ID or password.";
      }
    } catch (error) {
      console.error("Login error", error);
      message.textContent = "Login check failed. Reload and try again.";
    } finally {
      if (button) button.disabled = false;
    }
  }

  function initialize() {
    localStorage.removeItem("somani_stock_login");
    localStorage.removeItem("somani_stock_dashboard_login");
    sessionStorage.removeItem("somani_stock_login");
    sessionStorage.removeItem("somani_stock_dashboard_login");

    const form = document.getElementById("loginForm");
    const logout = document.getElementById("dashboardLogout");

    if (form) form.addEventListener("submit", handleLogin);
    if (logout) logout.addEventListener("click", showLogin);

    showLogin();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }

  window.addEventListener("pageshow", event => {
    if (event.persisted && !authenticated) showLogin();
  });
})();
