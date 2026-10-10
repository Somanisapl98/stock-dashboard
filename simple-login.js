(() => {
  "use strict";

  const AUTHORIZED_CREDENTIALS = new Map([
  [
    "12749146f02b40aa456848e6cd78d5d08c502d9da84761cd8c2936869e9376fd",
    "69fc2da79ccd66568ed741f3dead7fd86af505a9fbc1d1c5a3e91530862543cb"
  ],
  [
    "caa60c412d0f4f4acd09352ad1bec06afd404bc312bb6c7c1d2ebeb477c3505b",
    "dfb8037f08c9c60ac26570df6ccd300ca3e0597e4b7b725d5b2a05fea58d74d9"
  ],
  [
    "e0e5f61638c98fee975b0246df38de936755d7a9b9e0bd2249418898dfb723fe",
    "e97af41333710c8b4d9a720cc76a7d128164a09f4c1336ff2a67877901430e10"
  ],
  [
    "6c853eaa4084ceb64abcab0fffb5e97f5ebb8fc0512d046ff57efe93713e4015",
    "6644e3280bd20a5a7dd3e62a5915e792dfd12d3a274333b47be94d2fa6193f9c"
  ],
  [
    "57590ee5a6c51f5d0d1c8a3c90fffe3eeeeb5ffc23118b3e7a6e461edef44e81",
    "2947939bca200345463182f4a450a547dee260bc2c9f9ebc62a7f9f6973936a1"
  ],
  [
    "39dceef7354c60f0baddf3d651747e9393e56698fb1aa8eccdd2f2b67b7ead40",
    "e59c34d07b2eeee6d105e9adb2984f8621278c4524393579144fc6d232defc4c"
  ],
  [
    "22d55865b55f9de00af0584c95c3ce476e4c6c38d3107fe6ac3ed7d307fc0d75",
    "bd6753cb8e4ce282ae83036f64e1c0abe7909a29108d79acc6ee95e08211dc19"
  ],
  [
    "2caaf71257d15ff967b9e9fd0aaef4a489ae7c46e233904b4ad20b8382b23d9a",
    "ba2e6b7afd38a9ffa63625d4788ac541c9a827feab242eb8377b51ebf4e506d2"
  ],
  [
    "74887b54abc63e755a463ec4ff012b5d7c5dc56a176eb1cf33a2a236732603a6",
    "1bf7da184583d5ff35bc68ff76b080fdb17c9ed568cda7adca8d5260360aefe8"
  ],
  [
    "df426fe846e8a69d83d6c6b305e41383f1102b0bdad403448e75f67874d209ae",
    "909a8fafde00034a815a157605a19240e01043037d1fef9765164b435716f57b"
  ],
  [
    "817166145b5ad0f1350b7a32328a5edbd059525f302199b16cfd4f303616455d",
    "3b9c982bbedede5046c729d7487a655e6ba95badf60adb54249a1d92c30a7214"
  ],
  [
    "f8beb0ed2ee1e43095a864d521a19f413d4f6b7c5278792a94c809f4c48b3b75",
    "f7249d0d945bbe5267793b296b6fac92de266db7c974b75ef062618754746c7d"
  ],
  [
    "d79ecde9926d47442b38009de3fbb9cc11687720cce297e013dc3ce073ad2b9e",
    "58fe5808a602849805a5792bf5a8827b79d54a5460ffa64c753bcb1dd8c5057c"
  ],
  [
    "d68c6c311efcfde0a16924376ea102fe2baf69c9630c63771de030f92fe50e30",
    "06270b7772891eb8dfcb11dfd8214d54ea51253c3d21d735fd6561f6b0bea692"
  ],
  [
    "25b55cf30608c701ebb2658dee50571dee740c8f8ea4238195ca666b888b16ab",
    "7ae09a6270e1bb20cfba8c4d2990732ee57d16b57bc736f73fbe01532a636330"
  ],
  [
    "14513d32f7b46649239b498b292d5a457699b1e831e362464f23d4d9656c8815",
    "3bdc1907f6bb710d79e4bd42b6bd7b37746eb9ba2a8afde7bce14443b6a4ba21"
  ],
  [
    "1b0d014e543438bb3cc7c5056041408c8d618b0e925e521f0de2317fca2571f5",
    "93753fd6aa62a37a5b9da6746934ccfd50e56e65b01b9404ce4257e3bf689178"
  ],
  [
    "bfec3f76eb649f3ff4d7cb62d5219cf468e23cbcae5d7ea19188f16aa94310fc",
    "2c4877073be3221d19562c84c3a87c0857ff3d076b0cddd50046b600b8b2510b"
  ],
  [
    "04d5dec6741986fce14f1dc9926d2eaeff2a673732a8b3d90cbb7e0dcf1714dc",
    "3a00997efbf5c3ec94aa7b47009021ef6ae67335caafb970e628d41cd6efe947"
  ],
  [
    "f8141d82f409e80b4fb96cbac01443396edd067d94685af241a6d252aef593a5",
    "25d1ae5baa774e4c6de439ac984a7d7354d0f93d19b44fbc3a109bcb653bc04d"
  ]
]);

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
    const form = document.getElementById("loginForm");
    const message = document.getElementById("loginMessage");
    if (gate) gate.hidden = false;
    if (form) form.reset();
    if (message) message.textContent = "";
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
    if (!userBox || !passwordBox || !message) return;
    if (button) button.disabled = true;
    message.textContent = "Checking credentials...";

    try {
      const userHash = await sha256(userBox.value.trim().toLowerCase());
      const passwordHash = await sha256(passwordBox.value);
      if (AUTHORIZED_CREDENTIALS.get(userHash) === passwordHash) {
        passwordBox.value = "";
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

  function initializeLogin() {
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
    document.addEventListener("DOMContentLoaded", initializeLogin, { once: true });
  } else {
    initializeLogin();
  }
})();
