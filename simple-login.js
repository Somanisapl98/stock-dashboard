(() => {
"use strict";
const UH="12749146f02b40aa456848e6cd78d5d08c502d9da84761cd8c2936869e9376fd";
const PH="d6cd340d97238ce8ad5fd4c9a6af8e2fea43c46845da6f76e06486c47c77226c";
const KEY="somani_stock_login";
async function h(v){const b=new TextEncoder().encode(v);const d=await crypto.subtle.digest("SHA-256",b);return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,"0")).join("");}
function valid(){try{const s=JSON.parse(sessionStorage.getItem(KEY)||"null");return !!(s&&Date.now()<s.exp);}catch{return false;}}
function unlock(){document.documentElement.classList.remove("login-locked");const g=document.getElementById("loginGate");if(g)g.hidden=true;}
function lock(){document.documentElement.classList.add("login-locked");const g=document.getElementById("loginGate");if(g)g.hidden=false;}
async function login(e){e.preventDefault();const m=document.getElementById("loginMessage");const u=document.getElementById("loginUser").value.trim().toLowerCase();const p=document.getElementById("loginPassword").value;m.textContent="Checking credentials...";if(await h(u)===UH&&await h(p)===PH){sessionStorage.setItem(KEY,JSON.stringify({exp:Date.now()+12*60*60*1000}));m.textContent="";document.getElementById("loginPassword").value="";unlock();}else{m.textContent="Invalid user ID or password.";}}
function logout(){sessionStorage.removeItem(KEY);lock();}
function init(){document.getElementById("loginForm")?.addEventListener("submit",login);document.getElementById("dashboardLogout")?.addEventListener("click",logout);valid()?unlock():lock();}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init,{once:true}):init();
})();
