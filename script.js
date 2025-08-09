/* --------------- MAIN SCRIPT --------------- */
/*
 * Improved & robust version:
 * - safe guards for missing DOM elements
 * - localStorage fallback for entries if scriptURL not configured
 * - cleaned flow for navigation + emotion cards
 */

const scriptURL = ''; // Add your Google Apps Script web app URL here if you want server sync

// Keys
const USER_KEY = 'hetu_app_user';
const FEELINGS_KEY = 'hetu_local_feelings';
const DIARY_KEY = 'hetu_local_diary';

// App state
let currentUser = '';
let currentEmotion = '';
let calendarCurrentDate = new Date();
let diaryEntries = {}; // keyed by YYYY-MM-DD

// ----- Utility helpers -----
function el(id){ return document.getElementById(id); }
function bySel(sel, root=document){ return Array.from((root||document).querySelectorAll(sel)); }
function show(elm){ if(elm) elm.classList.remove('hidden'); }
function hide(elm){ if(elm) elm.classList.add('hidden'); }
function safeText(s){ return (s||'').toString().trim(); }
function todayKey(date = new Date()){
  const y = date.getFullYear(), m = String(date.getMonth()+1).padStart(2,'0'), d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}

/* ------------- LOGIN -------------- */
function login(name){
  if(!name) return;
  currentUser = name;
  localStorage.setItem(USER_KEY, currentUser);
  updateUserDisplay();
  document.getElementById('loginContainer').style.display = 'none';
  const app = document.getElementById('appContainer');
  if(app){ app.style.display = 'block'; app.setAttribute('aria-hidden','false'); }
  navigateToApp('homeScreen');
}

function logout(){
  currentUser = '';
  localStorage.removeItem(USER_KEY);
  updateUserDisplay();
  document.getElementById('loginContainer').style.display = 'flex';
  const app = document.getElementById('appContainer');
  if(app){ app.style.display = 'none'; app.setAttribute('aria-hidden','true'); }
}

function updateUserDisplay(){
  const disp = el('loggedInUserDisplay');
  if(disp) disp.textContent = currentUser ? `User: ${currentUser}` : 'User: Not logged in';
  bySel('.dynamicUserName').forEach(x => x.textContent = currentUser || 'User');
}

/* ------------- INIT -------------- */
function checkLoginStatus(){
  const stored = localStorage.getItem(USER_KEY);
  if(stored){
    currentUser = stored;
    updateUserDisplay();
    document.getElementById('loginContainer').style.display = 'none';
    const app = document.getElementById('appContainer');
    if(app){ app.style.display = 'block'; app.setAttribute('aria-hidden','false'); }
  } else {
    document.getElementById('loginContainer').style.display = 'flex';
    const app = document.getElementById('appContainer');
    if(app){ app.style.display = 'none'; app.setAttribute('aria-hidden','true'); }
  }
}

/* ------------- NAVIGATION ------------- */
function screensAll(){ return bySel('.screen'); }
function hideAllScreens(){ screensAll().forEach(s => s.classList.remove('active')); }
function navigateToApp(screenId){
  // Require login for app screens
  if(!currentUser && screenId !== 'homeScreen'){ logout(); return; }
  hideAllScreens();
  const target = document.getElementById(screenId);
  if(target) target.classList.add('active');
  // Ensure feelings page1 visible state
  if(screenId === 'feelingsPortalScreen'){
    showFeelingsMain();
  } else if(screenId === 'diaryScreen'){
    loadDiaryEntries().then(() => renderCalendar(calendarCurrentDate));
  } else if(screenId === 'homeScreen'){
    // nothing else
  }
}

/* ------------- FEELINGS FLOW ------------- */
function showFeelingsMain(){
  // show main cards, hide write/view pages
  const main = document.querySelector('#feelingsPortalScreen .feelings-grid');
  const page2 = el('feelingsPage2');
  const view = el('feelingsViewEntriesPage');
  if(main) main.style.display = 'grid';
  if(page2) hide(page2);
  if(view) hide(view);
  // show container screen if not visible
  navigateToApp('feelingsPortalScreen');
}

function navigateToFeelingsPage(pageId, emotion){
  // hide the cards area
  const main = document.querySelector('#feelingsPortalScreen .feelings-grid');
  if(main) main.style.display = 'none';

  const page = document.getElementById(pageId);
  if(page){
    // hide other pages
    bySel('#feelingsPortalScreen .page').forEach(p => p.classList.add('hidden'));
    page.classList.remove('hidden');
  }
  if(emotion) {
    currentEmotion = emotion;
    const title = el('feelingsPage2Title');
    if(title) title.textContent = `You selected: ${emotion} — ${currentUser}, share below.`;
  }
}

function submitFeelingsEntry(){
  if(!currentUser){ alert('Please log in first.'); return; }
  const msg = safeText(el('feelingsMessage')?.value);
  if(!currentEmotion){ alert('Please select an emotion first.'); return; }
  if(!msg){ alert('Please enter your thoughts.'); return; }

  const entry = {
    id: Date.now().toString(36),
    timestamp: new Date().toISOString(),
    emotion: currentEmotion,
    message: msg,
    submittedBy: currentUser
  };

  // If scriptURL provided, attempt server POST, else fallback to local
  if(scriptURL && scriptURL.trim().length>5){
    const fd = new FormData();
    fd.append('formType','feelingsEntry');
    fd.append('emotion', entry.emotion);
    fd.append('message', entry.message);
    fd.append('submittedBy', entry.submittedBy);
    fetch(scriptURL, {method:'POST', body: fd, mode:'cors'})
      .then(r => r.json().catch(()=>({status:'ok'})))
      .then(() => {
        el('feelingsMessage').value = '';
        navigateToFeelingsPage('feelingsPage2'); // minimal feedback
        alert('Feelings saved to server.');
      }).catch(err=>{
        console.warn('Server save failed, storing locally.', err);
        saveFeelingLocal(entry);
      });
  } else {
    saveFeelingLocal(entry);
  }
}

function saveFeelingLocal(entry){
  const arr = JSON.parse(localStorage.getItem(FEELINGS_KEY) || '[]');
  arr.unshift(entry);
  localStorage.setItem(FEELINGS_KEY, JSON.stringify(arr));
  el('feelingsMessage').value = '';
  alert('Saved locally (offline). Use server URL to sync.');
  // show view list
  fetchAndDisplayFeelingsEntries();
}

async function fetchAndDisplayFeelingsEntries(){
  if(!currentUser){ alert('Please log in to view entries.'); return; }
  const list = el('feelingsEntriesList');
  if(!list) return;
  list.innerHTML = '<p>Loading entries...</p>';

  if(scriptURL && scriptURL.trim().length>5){
    try{
      const resp = await fetch(`${scriptURL}?action=getFeelingsEntries`, {mode:'cors'});
      const data = await resp.json();
      if(data && data.status === 'success' && Array.isArray(data.data)){
        renderFeelingsTable(data.data, list);
        navigateToFeelingsPage('feelingsViewEntriesPage');
        return;
      }
    } catch(e){
      console.warn('Server fetch failed - falling back to local.', e);
    }
  }
  // fallback local
  const local = JSON.parse(localStorage.getItem(FEELINGS_KEY) || '[]');
  renderFeelingsTable(local, list);
  navigateToFeelingsPage('feelingsViewEntriesPage');
}

function renderFeelingsTable(entries, container){
  if(!container) return;
  if(!entries || entries.length===0){
    container.innerHTML = '<p>No feelings recorded yet.</p>';
    return;
  }
  const table = document.createElement('table');
  table.className = 'feelings-table';
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr><th>Date & Time</th><th>By</th><th>Emotion</th><th>Message</th></tr>`;
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  entries.forEach(e=>{
    const tr = document.createElement('tr');
    const dt = new Date(e.timestamp || Date.now()).toLocaleString();
    const by = e.submittedBy || 'Unknown';
    const emo = e.emotion || 'N/A';
    const msg = e.message || '';
    tr.innerHTML = `<td>${dt}</td><td><strong>${by}</strong></td><td><span class="emotion-tag ${emo.toLowerCase()}">${emo}</span></td><td>${escapeHtml(msg)}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.innerHTML = '';
  container.appendChild(table);
}

/* ------------- DIARY ------------- */
async function loadDiaryEntries(){
  // Attempt server fetch (if configured), else load local
  diaryEntries = {};
  if(scriptURL && scriptURL.trim().length>5){
    try{
      const resp = await fetch(`${scriptURL}?action=getDiaryEntries`, {mode:'cors'});
      const data = await resp.json();
      if(data && data.status === 'success' && Array.isArray(data.data)){
        data.data.forEach(entry=>{
          diaryEntries[entry.date] = entry;
        });
        return;
      }
    } catch(e){
      console.warn('Diary server fetch failed - using local', e);
    }
  }
  // local fallback
  const local = JSON.parse(localStorage.getItem(DIARY_KEY) || '{}');
  diaryEntries = local;
}

function renderCalendar(date){
  const grid = el('calendarGrid');
  const monthYear = el('currentMonthYear');
  if(!grid || !monthYear) return;
  grid.innerHTML = '';
  const month = date.getMonth(), year = date.getFullYear();
  monthYear.textContent = date.toLocaleString('default',{month:'long',year:'numeric'});
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  days.forEach(d=>{
    const hd = document.createElement('div'); hd.className='calendar-day-header'; hd.textContent = d; grid.appendChild(hd);
  });

  for(let i=0;i<firstDay;i++){
    const empty = document.createElement('div'); empty.className='calendar-day empty'; grid.appendChild(empty);
  }

  const today = new Date();
  for(let d=1; d<=daysInMonth; d++){
    const cell = document.createElement('div'); cell.className='calendar-day';
    cell.textContent = d;
    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cell.dataset.date = key;
    if(key === todayKey(today)) cell.classList.add('today');
    if(diaryEntries[key]) cell.classList.add('has-entry');
    cell.addEventListener('click', ()=> {
      if(diaryEntries[key]) viewDiaryEntry(key);
      else openDiaryEntry(key);
    });
    grid.appendChild(cell);
  }
}

function openDiaryEntry(dateString){
  el('selectedDate').value = dateString;
  const parts = dateString.split('-');
  const dateObj = new Date(parts[0], Number(parts[1])-1, parts[2]);
  el('diaryDateDisplay').textContent = dateObj.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  el('diaryEntryTitle').textContent = `Diary for ${dateObj.toLocaleDateString(undefined,{month:'long',day:'numeric'})}`;
  el('diaryThoughts').value = '';
  navigateToDiaryPage('diaryEntryPage');
}

function viewDiaryEntry(dateString){
  const entry = diaryEntries[dateString];
  if(!entry){ openDiaryEntry(dateString); return; }
  const parts = dateString.split('-');
  const dateObj = new Date(parts[0], Number(parts[1])-1, parts[2]);
  el('diaryDateDisplay').textContent = dateObj.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  el('diaryEntryTitle').textContent = `Diary for ${dateObj.toLocaleDateString(undefined,{month:'long',day:'numeric'})}`;
  // show view area by reusing the all entries page (simple)
  el('allDiaryEntriesList').innerHTML = `<div class="diary-entry-list-item"><h3>${dateObj.toLocaleDateString()}</h3><p class="entry-content">${escapeHtml(entry.thoughts||'')}</p><p class="entry-attribution"><em>${entry.submittedBy || 'Unknown'}</em></p></div>`;
  navigateToDiaryPage('allDiaryEntriesPage');
}

function navigateToDiaryPage(pageId){
  bySel('#diaryScreen .page').forEach(p => p.classList.add('hidden'));
  const page = el(pageId);
  if(page) page.classList.remove('hidden');
}

/* Submit diary entry */
function submitDiaryEntry(){
  if(!currentUser){ alert('Please log in first.'); return; }
  const thoughts = safeText(el('diaryThoughts')?.value);
  const date = el('selectedDate')?.value;
  if(!date) { alert('No date selected.'); return; }
  if(!thoughts){ alert('Please write your thoughts.'); return; }
  const entry = { date, thoughts, submittedBy: currentUser, timestamp: new Date().toISOString() };

  // server if configured
  if(scriptURL && scriptURL.trim().length>5){
    const fd = new FormData();
    fd.append('formType','diaryEntry');
    fd.append('date', date);
    fd.append('thoughts', thoughts);
    fd.append('submittedBy', currentUser);
    fetch(scriptURL,{method:'POST', body:fd, mode:'cors'})
      .then(r => r.json().catch(()=>({status:'ok'})))
      .then(()=> {
        loadDiaryEntries().then(()=> renderCalendar(calendarCurrentDate));
        alert('Saved to server');
      }).catch(err=>{
        console.warn('Server save failed, saving local', err);
        saveDiaryLocal(entry);
      });
  } else {
    saveDiaryLocal(entry);
  }
}

function saveDiaryLocal(entry){
  const store = JSON.parse(localStorage.getItem(DIARY_KEY) || '{}');
  store[entry.date] = entry;
  localStorage.setItem(DIARY_KEY, JSON.stringify(store));
  diaryEntries = store;
  alert('Diary saved locally.');
  renderCalendar(calendarCurrentDate);
  navigateToDiaryPage('diaryCalendarPage');
}

async function fetchAndDisplayAllDiaryEntries(){
  await loadDiaryEntries();
  const list = el('allDiaryEntriesList');
  list.innerHTML = '';
  const keys = Object.keys(diaryEntries).sort((a,b)=> b.localeCompare(a));
  if(!keys.length){ list.innerHTML = '<p>No diary entries yet.</p>'; return; }
  keys.forEach(k=>{
    const e = diaryEntries[k];
    const node = document.createElement('div');
    node.className = 'diary-entry-list-item';
    const dt = new Date(k + 'T00:00:00').toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    node.innerHTML = `<h3>${dt}</h3><p class="entry-content">${escapeHtml(e.thoughts || '')}</p><p class="entry-attribution"><em>${e.submittedBy || 'Unknown'}</em></p>`;
    list.appendChild(node);
  });
  navigateToDiaryPage('allDiaryEntriesPage');
}

/* ------------- DARE GAME ------------- */
const coupleDares = [
  "Give your partner a slow, sensual massage on their neck and shoulders for 5 minutes.",
  "Whisper three things you find sexiest about your partner into their ear.",
  "Blindfold your partner and tease them with light touches for 2 minutes. Then, they do it to you.",
  "Choose a song and give your partner a private slow dance.",
  "Write a short, steamy compliment on a piece of paper and have your partner read it aloud.",
  "Choose a spot to kiss your partner slowly and linger for a few seconds.",
  "Share a secret fantasy you've had about your partner.",
  "Feed your partner a piece of fruit (like a strawberry) in a playful way.",
  "Kiss your partner passionately for at least 60 seconds.",
  "Take turns tracing words of affection on each other's backs with fingertips.",
  "Take a relaxing shower or bath together, focusing on caring touches.",
  "Give your partner a gentle, affectionate back rub."
];
let usedDares = [];

function generateDare(){
  if(usedDares.length === coupleDares.length) usedDares = [];
  const avail = coupleDares.filter((_,i)=> !usedDares.includes(i));
  const idx = Math.floor(Math.random()*avail.length);
  // find actual index in original
  let realIndex = coupleDares.indexOf(avail[idx]);
  if(realIndex === -1) realIndex = 0;
  usedDares.push(realIndex);
  const dare = coupleDares[realIndex];
  const elD = el('dareText');
  if(elD) elD.textContent = dare;
}

/* ------------- POPUPS ------------- */
const missYouMessages = [
  "I love you my chikoo! 🥰",
  "Sending virtual huggies 🤗 to my darling!",
  "Sending virtual kissy 😘 to my darling!",
  "Thinking of you, always! ✨",
  "You're the best! 💖"
];

function showMissYouPopup(){
  const bunny = document.querySelector('.bunny-face');
  if(bunny) bunny.classList.add('spinning');
  setTimeout(()=>{
    if(bunny) bunny.classList.remove('spinning');
    let message = missYouMessages[Math.floor(Math.random()*missYouMessages.length)];
    if(currentUser === 'Chikoo' && message.includes('Pratham')) {} // keep if OK
    if(currentUser === 'Prath' && message.includes('Pratham')) { message = "Chikoo misses you too! ❤️"; }
    el('missYouMessage').textContent = message;
    show(el('overlay')); show(el('missYouPopup'));
  }, 350);
}

function closeMissYouPopup(){
  hide(el('missYouPopup')); hide(el('overlay'));
}

/* ------------- SMALL HELPERS ------------- */
function escapeHtml(unsafe){
  if(!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ------------- BOOT ------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  checkLoginStatus();

  // hook prev/next month
  const prev = el('prevMonthBtn'), next = el('nextMonthBtn');
  if(prev) prev.addEventListener('click', ()=>{
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth()-1);
    loadDiaryEntries().then(()=> renderCalendar(calendarCurrentDate));
  });
  if(next) next.addEventListener('click', ()=>{
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth()+1);
    loadDiaryEntries().then(()=> renderCalendar(calendarCurrentDate));
  });

  // ensure the home screen is visible if logged in
  if(currentUser) navigateToApp('homeScreen');
});
