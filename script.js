// --- FULLY UPDATED script.js with User Login, Attribution, Reply & Dare Game Functionality ---
// IMPORTANT: REPLACE THIS WITH YOUR ACTUAL DEPLOYED WEB APP URL from Google Apps Script
const scriptURL = 'https://script.google.com/macros/s/AKfycbxMsH6HVLcv0yGQBKZCdOwdAUi9k_Jv4JeIOotqicQlef0mP_mIADlEVbUuzS8pPsZ27g/exec'; // <<< REPLACE WITH YOUR URL

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const appContainer = document.getElementById('appContainer');
const loggedInUserDisplay = document.getElementById('loggedInUserDisplay');
const dynamicUserNameElements = document.querySelectorAll('.dynamicUserName');

const screens = document.querySelectorAll('.screen');
const feelingsPages = document.querySelectorAll('#feelingsPortalScreen .page');
const diaryPages = document.querySelectorAll('#diaryScreen .page');

// Dare Game Elements
const dareTextElement = document.getElementById('dareText');

// Global variables for application state
let currentUser = ''; 
const SCRIPT_USER_KEY = 'hetuAppCurrentUser';
let currentEmotion = '';
let calendarCurrentDate = new Date();
let diaryEntries = {}; 

// --- Dares List ---
// Dares are designed for couples, aiming for playful, intimate, and sexy interactions.
// "Upper body nudity" is permitted as per request.
// The term "partner" is used to refer to the other person in the couple.
const coupleDares = [
    "Give your partner a slow, sensual massage on their neck and shoulders for 5 minutes.",
    "Whisper three things you find sexiest about your partner into their ear.",
    "Blindfold your partner and tease them with light touches for 2 minutes. Then, they do it to you.",
    "Choose a song and give your partner a private slow dance.",
    "Write a short, steamy compliment on a piece of paper and have your partner read it aloud.",
    "Let your partner slowly unbutton or remove one item of your upper clothing. Then, you do the same for them.",
    "Describe your favorite memory of a passionate moment with your partner in detail.",
    "Feed your partner a piece of fruit (like a strawberry or grape) in the most seductive way you can.",
    "Kiss your partner passionately for at least 60 seconds, as if it's your first time.",
    "Take turns tracing words of affection on each other's backs with your fingertips. Guess the words.",
    "Share a secret fantasy you've had about your partner.",
    "Let your partner choose a spot on your upper body to kiss. Then, you choose a spot on theirs.",
    "Remove your top. Let your partner admire you for a minute. Then, they remove their top for you to admire.",
    "Sit facing each other, knees touching. Maintain eye contact for 2 minutes while caressing hands.",
    "Give your partner a lingering kiss on their collarbone or shoulder blade.",
    "Tell your partner, in a sultry voice, what you want to do with them later tonight.",
    "Gently bite your partner's earlobe or lip while whispering something naughty.",
    "Take turns applying a small amount of lotion or oil to each other's arms or chest.",
    "Lie down together and cuddle, sharing soft kisses and whispers for 5 minutes, no talking above a whisper.",
    "Blindfold your partner. Kiss them in three different places on their upper body. They guess where.",
    "Slowly lick a drop of honey or chocolate syrup off your partner's finger or lips.",
    "Let your partner take a 'body shot' (non-alcoholic, like whipped cream) off your chest or stomach (if comfortable, otherwise shoulder).",
    "Recreate your very first kiss with your partner.",
    "Give your partner a foot massage, focusing on sensual touches.",
    "Both of you remove your shirts. Take turns complimenting each other's physique.",
    "Write 'I want you' with lipstick on your partner's chest or shoulder.",
    "Playfully spank your partner (lightly!) and tell them they've been naughty.",
    "Share a shower or bath together, focusing on washing each other.",
    "Let your partner choose one item of your clothing (upper body) for you to remove. You cannot say no.",
    "Kiss your partner from their lips, down their neck, to their chest, very slowly.",
    "Tell your partner a secret desire you have for your relationship's intimacy.",
    "Blindfold yourself and let your partner guide your hands over their upper body.",
    "Take turns giving each other eskimo kisses, then butterfly kisses.",
    "Whisper your partner's name seductively while looking deep into their eyes.",
    "Set a timer for 3 minutes. You can only communicate with kisses and caresses.",
    "Let your partner draw a temporary tattoo on your upper arm or shoulder blade with a body-safe marker.",
    "Both remove your tops. Dance together to a sexy song, skin to skin.",
    "Give your partner a sensual 'once-over' look, from head to toe, and tell them what you see.",
    "Tease your partner by almost kissing them several times before finally giving in.",
    "Take turns reading a short, erotic poem or story snippet to each other.",
    "If you're Chikoo, remove your top. If you're Prath, give Chikoo a sensual back rub.",
    "If you're Prath, remove your top. If you're Chikoo, gently kiss Prath's chest.",
    "Describe your partner's sexiest feature and why you love it.",
    "Let your partner pick a dare for you from this list (excluding this one!).",
    "Give your partner a lap dance (can be fully clothed or upper body bare).",
    "Role-play: One of you is a famous movie star, the other is an adoring fan meeting them backstage.",
    "Take a sexy selfie together (upper body focus).",
    "Spend 5 minutes only complimenting each other's bodies (upper body focus if preferred).",
    "Kiss each of your partner's fingertips, one by one, very slowly.",
    "Dare your partner to make you blush with just words.",
    "Both of you get comfortable. Close your eyes and describe your ideal romantic and passionate evening together."
];
let usedDares = [];


// --- User Authentication and Session ---
function login(userName) {
    if (userName === 'Chikoo' || userName === 'Prath') {
        currentUser = userName;
        localStorage.setItem(SCRIPT_USER_KEY, currentUser);
        updateUserDisplay();
        loginContainer.style.display = 'none';
        appContainer.style.display = 'block';
        document.body.style.alignItems = 'flex-start'; 
        navigateToApp('homeScreen');
        console.log(`${currentUser} logged in.`);
    } else {
        // Using custom modal/message box instead of alert
        showCustomMessage('Invalid user selection.');
    }
}

function logout() {
    currentUser = '';
    localStorage.removeItem(SCRIPT_USER_KEY);
    updateUserDisplay(); 
    appContainer.style.display = 'none';
    loginContainer.style.display = 'flex';
    document.body.style.alignItems = 'center'; 
    screens.forEach(screen => screen.classList.remove('active'));
    console.log('User logged out.');
}

function updateUserDisplay() {
    if (loggedInUserDisplay) {
        loggedInUserDisplay.textContent = currentUser ? `User: ${currentUser}` : 'User: Not logged in';
    }
    dynamicUserNameElements.forEach(el => {
        el.textContent = currentUser || 'User';
    });
}

function checkLoginStatus() {
    const storedUser = localStorage.getItem(SCRIPT_USER_KEY);
    if (storedUser) {
        currentUser = storedUser;
        updateUserDisplay();
        loginContainer.style.display = 'none';
        appContainer.style.display = 'block';
        document.body.style.alignItems = 'flex-start';
        navigateToApp('homeScreen'); 
    } else {
        appContainer.style.display = 'none';
        loginContainer.style.display = 'flex';
        document.body.style.alignItems = 'center';
    }
}


// --- Main Navigation and Core Functions ---
function navigateToApp(screenId) {
    if (!currentUser && screenId !== 'loginScreen') { 
        console.warn('No user logged in. Redirecting to login.');
        logout(); 
        return;
    }
    screens.forEach(screen => screen.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        // ensure hidden property for accessibility is toggled
        screens.forEach(s => s.hidden = !s.classList.contains('active'));
    } else {
        console.error("Screen not found:", screenId);
        if (currentUser) navigateToApp('homeScreen'); 
        else logout(); 
        return;
    }

    if (screenId === 'feelingsPortalScreen') {
        navigateToFeelingsPage('feelingsPage1');
    } else if (screenId === 'diaryScreen') {
        fetchDiaryEntries().then(() => {
            renderCalendar(calendarCurrentDate);
            navigateToDiaryPage('diaryCalendarPage');
        });
    } else if (screenId === 'dareGameScreen') {
        // Reset dares if all have been used, or on first load of the game screen
        if (usedDares.length === coupleDares.length) {
            usedDares = [];
        }
        if (dareTextElement) { // Initial message for dare game
             dareTextElement.textContent = "Click the button below to get your first dare!";
        }
    }
}

// --- Hetu's Feelings Portal Functions ---
function navigateToFeelingsPage(pageId, emotion = '') {
    feelingsPages.forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        console.error('Feelings page not found:', pageId);
        return;
    }

    if (emotion) { 
        currentEmotion = emotion;
    }

    if (pageId === 'feelingsPage2' && currentEmotion) {
        const heading = document.querySelector('#feelingsPage2 h2');
        if (heading) heading.textContent = `You selected: ${currentEmotion}. ${currentUser}, please let me know your thoughts.`;
    }
    if (pageId === 'feelingsPage3') {
        const messageBox = document.getElementById('feelings-message-box');
        const messageTextarea = document.getElementById('feelingsMessage');
        if (messageBox && messageTextarea && messageTextarea.value) {
            messageBox.textContent = messageTextarea.value.substring(0, 20) + '...';
        } else if (messageBox) {
            messageBox.textContent = "Thoughts recorded!";
        }
    }
}

function submitFeelingsEntry() {
    if (!currentUser) { showCustomMessage('Please log in first.'); logout(); return; }
    const messageInput = document.getElementById('feelingsMessage');
    const message = messageInput.value.trim();

    if (!currentEmotion) { showCustomMessage('Please select an emotion first!'); return; }
    if (!message) { showCustomMessage('Please enter your thoughts.'); return; }
    if (scriptURL.includes('YOUR_SCRIPT_ID_HERE') || scriptURL === '') {
        showCustomMessage('Please update the scriptURL in script.js.'); return;
    }

    const formData = new FormData();
    formData.append('formType', 'feelingsEntry');
    formData.append('emotion', currentEmotion);
    formData.append('message', message);
    formData.append('submittedBy', currentUser); 

    const submitBtn = document.getElementById('submitFeelingsBtn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    console.log(`Submitting feelings entry by ${currentUser}:`, { emotion: currentEmotion, message: message.substring(0, 50) + '...' });

    fetch(scriptURL, { method: 'POST', body: formData, mode: 'cors' })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(`HTTP error! ${response.status}: ${text}`); });
        }
        return response.json();
    })
    .then(data => {
        console.log('Feelings Entry Success!', data);
        if (data.status === 'error') throw new Error(data.message || 'Server error saving feeling.');
        navigateToFeelingsPage('feelingsPage3');
        if (messageInput) messageInput.value = '';
    })
    .catch(error => {
        console.error('Feelings Entry Error!', error);
        showCustomMessage('Error submitting feelings entry: ' + error.message);
    })
    .finally(() => {
        if (submitBtn) {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

async function fetchAndDisplayFeelingsEntries() {
    if (!currentUser) { showCustomMessage('Please log in to view entries.'); logout(); return; }
    console.log('Fetching feelings entries...');
    const listContainer = document.getElementById('feelingsEntriesList');
    if (!listContainer) {
        console.error('"feelingsEntriesList" not found.');
        navigateToFeelingsPage('feelingsPage1'); return;
    }
    listContainer.innerHTML = '<p>Loading entries...</p>';

    try {
        const response = await fetch(`${scriptURL}?action=getFeelingsEntries`, { method: 'GET', mode: 'cors' });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! ${response.status}: ${errorText}`);
        }
        const serverData = await response.json();
        console.log('Received feelings data:', serverData);
        listContainer.innerHTML = '';

        if (serverData.status === 'success' && serverData.data && serverData.data.length > 0) {
            const table = document.createElement('table');
            table.classList.add('feelings-table');
            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            const headers = ['Date & Time', 'Entry By', 'Emotion', 'Message', 'Response'];
            headers.forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                headerRow.appendChild(th);
            });

            const tbody = table.createTBody();
            serverData.data.forEach(entry => {
                const row = tbody.insertRow();
                
                const cellTimestamp = row.insertCell();
                cellTimestamp.textContent = entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

                const cellSubmittedBy = row.insertCell();
                cellSubmittedBy.innerHTML = `<strong>${entry.submittedBy || 'Unknown'}</strong>`;

                const cellEmotion = row.insertCell();
                const emotionSpan = document.createElement('span');
                emotionSpan.classList.add('emotion-tag', entry.emotion ? entry.emotion.toLowerCase() : 'unknown');
                emotionSpan.textContent = entry.emotion || 'N/A';
                cellEmotion.appendChild(emotionSpan);

                const cellMessage = row.insertCell();
                cellMessage.textContent = entry.message || 'No message';

                const cellResponse = row.insertCell();
                cellResponse.style.verticalAlign = 'top';

                if (entry.repliedBy && entry.replyMessage) {
                    const replyContainer = document.createElement('div');
                    replyContainer.classList.add('reply-display', `${entry.repliedBy.toLowerCase()}-reply`);
                    const replyTextP = document.createElement('p');
                    replyTextP.innerHTML = `<strong>${entry.repliedBy} Replied:</strong> ${entry.replyMessage}`;
                    replyContainer.appendChild(replyTextP);
                    if (entry.replyTimestamp) {
                        const replyTimeP = document.createElement('p');
                        replyTimeP.classList.add('reply-timestamp');
                        replyTimeP.textContent = `Replied: ${new Date(entry.replyTimestamp).toLocaleString('en-US', {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}`;
                        replyContainer.appendChild(replyTimeP);
                    }
                    cellResponse.appendChild(replyContainer);
                } else {
                    const replyButton = document.createElement('button');
                    replyButton.textContent = 'Reply 💌';
                    replyButton.classList.add('reply-btn', 'small-reply-btn');
                    replyButton.onclick = function() {
                        replyButton.disabled = true;
                        const entryDateStr = entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : "this feeling";
                        // Using custom prompt
                        showCustomPrompt(`Replying to ${entry.submittedBy || 'User'}'s feeling on ${entryDateStr}:\n"${(entry.message || '').substring(0, 100)}${(entry.message || '').length > 100 ? "..." : ""}"\n\n${currentUser}, your reply:`, (replyText) => {
                            if (replyText !== null) { // Check if user provided input (not cancelled)
                                submitReply('feeling', entry.timestamp, replyText, replyButton);
                            } else {
                                replyButton.disabled = false; // Re-enable if cancelled
                            }
                        });
                    };
                    cellResponse.appendChild(replyButton);
                }
            });
            listContainer.appendChild(table);
        } else if (serverData.status === 'success' && (!serverData.data || serverData.data.length === 0)) {
            listContainer.innerHTML = '<p>No feelings entries recorded yet.</p>';
        } else {
            listContainer.innerHTML = `<p>Could not load entries: ${serverData.message || 'Unknown server response'}</p>`;
        }
        navigateToFeelingsPage('feelingsViewEntriesPage');
    } catch (error) {
        console.error('Failed to fetch feelings entries:', error);
        if (listContainer) listContainer.innerHTML = `<p>Error loading entries: ${error.message}</p>`;
    }
}


// --- Diary Functions ---
function navigateToDiaryPage(pageId) {
    diaryPages.forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        console.error('Diary page not found:', pageId);
    }
}

async function fetchDiaryEntries() {
    if (!currentUser) { console.warn('User not logged in. Diary fetch aborted.'); return; }
    console.log('Fetching diary entries...');
    if (scriptURL.includes('YOUR_SCRIPT_ID_HERE') || scriptURL === '') {
        console.warn('scriptURL not configured. Diary entries cannot be fetched.');
        diaryEntries = {}; return; 
    }
    try {
        const response = await fetch(`${scriptURL}?action=getDiaryEntries`, { method: 'GET', mode: 'cors' });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        console.log('Diary entries response:', data);
        if (data.status === 'success') {
            diaryEntries = {}; 
            if (data.data) {
                data.data.forEach(entry => {
                    diaryEntries[entry.date] = entry;
                });
            }
            console.log('Diary entries loaded into memory:', Object.keys(diaryEntries).length);
        } else {
            console.error('Error fetching diary entries from server:', data.message);
            diaryEntries = {};
        }
    } catch (error) {
        console.error('Failed to fetch diary entries (network/fetch error):', error);
        diaryEntries = {};
    }
}

function renderCalendar(date) {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearDisplay = document.getElementById('currentMonthYear');
    if (!calendarGrid || !monthYearDisplay) {
        console.error("Calendar elements not found."); return;
    }

    calendarGrid.innerHTML = '';
    const month = date.getMonth();
    const year = date.getFullYear();
    monthYearDisplay.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const dayHeaderEl = document.createElement('div');
        dayHeaderEl.classList.add('calendar-day-header');
        dayHeaderEl.textContent = day;
        calendarGrid.appendChild(dayHeaderEl);
    });

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day', 'empty');
        calendarGrid.appendChild(emptyCell);
    }

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        dayCell.textContent = day;
        
        const cellDate = new Date(year, month, day);
        const formattedCellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dayCell.dataset.date = formattedCellDate;

        if (year === todayYear && month === todayMonth && day === todayDate) {
            dayCell.classList.add('today');
        }

        if (diaryEntries[formattedCellDate]) {
            dayCell.classList.add('has-entry');
            dayCell.title = `${diaryEntries[formattedCellDate].submittedBy || 'Someone'} made an entry.`;
            if (diaryEntries[formattedCellDate].submittedBy) {
                dayCell.classList.add(`${diaryEntries[formattedCellDate].submittedBy.toLowerCase()}-entry-marker`);
            }
        }


        dayCell.addEventListener('click', () => {
            console.log('Clicked calendar day with date:', dayCell.dataset.date);
            if (diaryEntries[dayCell.dataset.date]) {
                viewDiaryEntry(dayCell.dataset.date);
            } else {
                openDiaryEntry(dayCell.dataset.date);
            }
        });
        calendarGrid.appendChild(dayCell);
    }
}

function openDiaryEntry(dateString) {
    document.getElementById('selectedDate').value = dateString;
    console.log('openDiaryEntry received dateString:', dateString);

    const dateParts = dateString.split('-');
    if (dateParts.length !== 3) { showCustomMessage('Invalid date format for opening diary: ' + dateString); return; }
    const yearNum = parseInt(dateParts[0], 10);
    const monthNum = parseInt(dateParts[1], 10) - 1;
    const dayNum = parseInt(dateParts[2], 10);
    const dateObj = new Date(yearNum, monthNum, dayNum);

    if (isNaN(dateObj.getTime())) { showCustomMessage('Could not create valid date from: ' + dateString); return; }
    
    const displayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('diaryDateDisplay').textContent = dateObj.toLocaleDateString('en-US', displayOptions);
    document.getElementById('diaryEntryTitle').textContent = `Diary for ${dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    document.getElementById('diaryThoughts').value = '';
    document.getElementById('diaryThoughts').placeholder = `${currentUser}, write your diary entry here...`;
    navigateToDiaryPage('diaryEntryPage');
}

function viewDiaryEntry(dateString) {
    const entry = diaryEntries[dateString];
    if (!entry) {
        console.warn('viewDiaryEntry called for a date with no cached entry:', dateString);
        showCustomMessage('Could not load details for ' + dateString + '. Entry not found. Try going back.');
        openDiaryEntry(dateString); 
        return;
    }

    const dateParts = dateString.split('-');
    if (dateParts.length !== 3) { showCustomMessage('Invalid date format for view: ' + dateString); return; }
    const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    if (isNaN(dateObj.getTime())) { showCustomMessage('Invalid date object for view: ' + dateString); return; }

    const displayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('viewDiaryDateDisplay').textContent = dateObj.toLocaleDateString('en-US', displayOptions);
    document.getElementById('viewDiaryThoughts').textContent = entry.thoughts || 'No thoughts.';

    const attributionElement = document.getElementById('diaryEntryAttribution');
    if (attributionElement) {
        attributionElement.innerHTML = `<em>${entry.submittedBy || 'Unknown User'} Made a New entry</em>`;
        attributionElement.className = 'entry-attribution'; 
        if (entry.submittedBy) {
            attributionElement.classList.add(`${entry.submittedBy.toLowerCase()}-entry`);
        }
    }


    const singleViewReplyContainer = document.getElementById('diaryViewPageReplySection');
    if (singleViewReplyContainer) {
        singleViewReplyContainer.innerHTML = ''; 

        if (entry.repliedBy && entry.replyMessage) {
            const replyDisplay = document.createElement('div');
            replyDisplay.classList.add('reply-display', `${entry.repliedBy.toLowerCase()}-reply`);
            const replyTextP = document.createElement('p');
            replyTextP.innerHTML = `<strong>${entry.repliedBy} Replied:</strong> ${entry.replyMessage}`;
            replyDisplay.appendChild(replyTextP);
            if (entry.replyTimestamp) {
                const replyTimeP = document.createElement('p');
                replyTimeP.classList.add('reply-timestamp');
                replyTimeP.textContent = `Replied: ${new Date(entry.replyTimestamp).toLocaleString('en-US', {year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true})}`;
                replyDisplay.appendChild(replyTimeP);
            }
            singleViewReplyContainer.appendChild(replyDisplay);
        } else {
            const replyButton = document.createElement('button');
            replyButton.textContent = 'Reply 💌';
            replyButton.classList.add('reply-btn');
            replyButton.onclick = function() {
                replyButton.disabled = true;
                const currentDisplayDate = document.getElementById('viewDiaryDateDisplay').textContent || entry.date;
                showCustomPrompt(`Replying to ${entry.submittedBy || 'User'}'s diary entry for ${currentDisplayDate}:\n"${(entry.thoughts || '').substring(0, 100)}${(entry.thoughts || '').length > 100 ? "..." : ""}"\n\n${currentUser}, your reply:`, (replyText) => {
                     if (replyText !== null) {
                        submitReply('diary', dateString, replyText, replyButton);
                    } else {
                         replyButton.disabled = false;
                    }
                });
            };
            singleViewReplyContainer.appendChild(replyButton);
        }
    } else {
        console.error("Reply container 'diaryViewPageReplySection' not found.");
    }
    navigateToDiaryPage('diaryViewPage');
}


function submitDiaryEntry() {
    if (!currentUser) { showCustomMessage('Please log in first.'); logout(); return; }
    const thoughts = document.getElementById('diaryThoughts').value.trim();
    const date = document.getElementById('selectedDate').value;

    if (!date) { showCustomMessage('No date selected.'); return; }
    if (!thoughts) { showCustomMessage('Please write your thoughts.'); return; }
    if (scriptURL.includes('YOUR_SCRIPT_ID_HERE') || scriptURL === '') {
        showCustomMessage('Please update the scriptURL in script.js.'); return;
    }

    const formData = new FormData();
    formData.append('formType', 'diaryEntry');
    formData.append('date', date);
    formData.append('thoughts', thoughts);
    formData.append('submittedBy', currentUser); 

    const submitBtn = document.querySelector('#diaryEntryPage button[onclick="submitDiaryEntry()"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    console.log(`Submitting diary entry by ${currentUser}:`, { date: date, thoughts: thoughts.substring(0, 50) + '...' });

    fetch(scriptURL, { method: 'POST', body: formData, mode: 'cors' })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(`HTTP error! ${response.status}: ${text}`); });
        }
        return response.json();
    })
    .then(data => {
        console.log('Diary Entry Success!', data);
        if (data.status === 'error') throw new Error(data.message || 'Server error saving diary.');
        return fetchDiaryEntries().then(() => { 
             renderCalendar(calendarCurrentDate); 
             navigateToDiaryPage('diaryConfirmationPage');
        });
    })
    .catch(error => {
        console.error('Diary Entry Error!', error);
        showCustomMessage('Error saving diary entry: ' + error.message);
    })
    .finally(() => {
        if (submitBtn) {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

async function fetchAndDisplayAllDiaryEntries() {
    if (!currentUser) { showCustomMessage('Please log in to view entries.'); logout(); return; }
    console.log('Fetching all diary entries list...');
    const listContainer = document.getElementById('allDiaryEntriesList');
    if (!listContainer) { console.error('"allDiaryEntriesList" not found.'); return; }
    listContainer.innerHTML = '<p>Loading entries...</p>';

    if (scriptURL.includes('YOUR_SCRIPT_ID_HERE') || scriptURL === '') {
        listContainer.innerHTML = '<p>Error: scriptURL not configured.</p>'; return;
    }

    try {
        const response = await fetch(`${scriptURL}?action=getDiaryEntries`, { method: 'GET', mode: 'cors' });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! ${response.status}: ${errorText}`);
        }
        const serverData = await response.json();
        console.log('All diary entries data:', serverData);
        listContainer.innerHTML = '';

        if (serverData.status === 'success' && serverData.data && serverData.data.length > 0) {
            const sortedEntries = serverData.data.sort((a, b) => new Date(b.date) - new Date(a.date)); 
            sortedEntries.forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.classList.add('diary-entry-list-item');
                
                let formattedDate = 'Unknown Date';
                if (entry.date) {
                    const entryDateObj = new Date(entry.date + "T00:00:00"); 
                     if (!isNaN(entryDateObj.getTime())) {
                        formattedDate = entryDateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    } else { formattedDate = `Invalid Date: ${entry.date}`; }
                }
                
                const entryMetaDiv = document.createElement('div');
                entryMetaDiv.classList.add('entry-meta-info');
                if(entry.submittedBy) entryMetaDiv.classList.add(`${entry.submittedBy.toLowerCase()}-entry`);
                entryMetaDiv.innerHTML = `<strong>${entry.submittedBy || 'Unknown User'}</strong> Made a New entry:`;
                
                entryDiv.innerHTML = `<h3>${formattedDate}</h3>`;
                entryDiv.appendChild(entryMetaDiv);
                const thoughtsP = document.createElement('p');
                thoughtsP.classList.add('entry-content');
                thoughtsP.textContent = entry.thoughts || 'No thoughts.';
                entryDiv.appendChild(thoughtsP);


                const replySectionDiv = document.createElement('div');
                replySectionDiv.classList.add('entry-reply-section');

                if (entry.repliedBy && entry.replyMessage) {
                    const replyContainer = document.createElement('div');
                    replyContainer.classList.add('reply-display', `${entry.repliedBy.toLowerCase()}-reply`);
                    const replyTextP = document.createElement('p');
                    replyTextP.innerHTML = `<strong>${entry.repliedBy} Replied:</strong> ${entry.replyMessage}`;
                    replyContainer.appendChild(replyTextP);
                    if (entry.replyTimestamp) {
                        const replyTimeP = document.createElement('p');
                        replyTimeP.classList.add('reply-timestamp');
                        replyTimeP.textContent = `Replied: ${new Date(entry.replyTimestamp).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}`;
                        replyContainer.appendChild(replyTimeP);
                    }
                    replySectionDiv.appendChild(replyContainer);
                } else {
                    const replyButton = document.createElement('button');
                    replyButton.textContent = 'Reply 💌';
                    replyButton.classList.add('reply-btn', 'small-reply-btn');
                    replyButton.onclick = function(event) {
                        event.stopPropagation();
                        replyButton.disabled = true;
                        showCustomPrompt(`Replying to ${entry.submittedBy || 'User'}'s diary entry for ${formattedDate}:\n"${(entry.thoughts || '').substring(0, 100)}${(entry.thoughts || '').length > 100 ? "..." : ""}"\n\n${currentUser}, your reply:`, (replyText) => {
                            if (replyText !== null) {
                                submitReply('diary', entry.date, replyText, replyButton);
                            } else {
                                replyButton.disabled = false;
                            }
                        });
                    };
                    replySectionDiv.appendChild(replyButton);
                }
                entryDiv.appendChild(replySectionDiv);
                listContainer.appendChild(entryDiv);
            });
        } else {
            listContainer.innerHTML = '<p>No diary entries found.</p>';
        }
    } catch (error) {
        console.error('Error fetching all diary entries:', error);
        listContainer.innerHTML = `<p>Error loading entries: ${error.message}</p>`;
    }
}

/* ---------- Reply / Submit functions (both feelings and diary) ---------- */
// submitReply(formType, key, replyText, replyButton) ... and other helper modal functions below...
// For brevity they remain unchanged from original. Ensure they are present in your script.js file.
function submitReply(type, key, replyText, buttonRef) {
    if (!currentUser) { showCustomMessage('Please login to reply.'); if (buttonRef) buttonRef.disabled=false; return; }
    if (!replyText || replyText.trim().length === 0) { showCustomMessage('Reply cannot be empty.'); if (buttonRef) buttonRef.disabled=false; return; }
    if (scriptURL.includes('YOUR_SCRIPT_ID_HERE') || scriptURL === '') {
        showCustomMessage('Please update the scriptURL in script.js.'); if (buttonRef) buttonRef.disabled=false; return;
    }
    const formData = new FormData();
    formData.append('formType','reply');
    formData.append('replyType', type);
    formData.append('key', key);
    formData.append('replyMessage', replyText);
    formData.append('repliedBy', currentUser);

    fetch(scriptURL, { method:'POST', body: formData, mode:'cors' })
    .then(resp => {
        if (!resp.ok) return resp.text().then(t => { throw new Error(`Server error ${resp.status}: ${t}`); });
        return resp.json();
    })
    .then(data => {
        if (data.status === 'success') {
            showCustomMessage('Reply saved!');
            // update local caches if possible by refetching
            if (type === 'diary') fetchDiaryEntries().then(()=>{ renderCalendar(calendarCurrentDate); });
            else if (type === 'feeling') fetchAndDisplayFeelingsEntries();
        } else {
            throw new Error(data.message || 'Server returned error.');
        }
    })
    .catch(err => {
        console.error('Reply error', err);
        showCustomMessage('Error saving reply: ' + err.message);
    })
    .finally(()=>{ if (buttonRef) buttonRef.disabled=false; });
}

/* Simple custom prompt/modal to avoid browser prompt() */
function showCustomPrompt(message, callback) {
    const promptOverlay = document.createElement('div');
    promptOverlay.style.position='fixed';
    promptOverlay.style.left=0; promptOverlay.style.top=0; promptOverlay.style.right=0; promptOverlay.style.bottom=0;
    promptOverlay.style.background='rgba(0,0,0,0.6)';
    promptOverlay.style.display='flex'; promptOverlay.style.alignItems='center'; promptOverlay.style.justifyContent='center';
    promptOverlay.style.zIndex=2000;

    const box = document.createElement('div');
    box.style.width='min(520px,94%)';
    box.style.background='#111';
    box.style.border='1px solid rgba(255,255,255,0.04)';
    box.style.padding='18px';
    box.style.borderRadius='12px';
    box.style.color='#fff';

    const p = document.createElement('p');
    p.style.margin='0 0 12px 0';
    p.style.whiteSpace='pre-wrap';
    p.textContent = message;
    const ta = document.createElement('textarea'); ta.style.width='100%'; ta.style.minHeight='80px'; ta.style.marginBottom='12px';
    const actions = document.createElement('div'); actions.style.textAlign='right';
    const ok = document.createElement('button'); ok.textContent='Send'; ok.style.marginRight='8px';
    const cancel = document.createElement('button'); cancel.textContent='Cancel'; cancel.style.background='transparent'; cancel.style.border='1px solid rgba(255,255,255,0.06)';
    actions.appendChild(ok); actions.appendChild(cancel);
    box.appendChild(p); box.appendChild(ta); box.appendChild(actions);
    promptOverlay.appendChild(box);
    document.body.appendChild(promptOverlay);
    ta.focus();

    ok.onclick = () => { const v = ta.value.trim(); document.body.removeChild(promptOverlay); callback(v); };
    cancel.onclick = () => { document.body.removeChild(promptOverlay); callback(null); };
}

/* small custom message */
function showCustomMessage(msg) {
    // small toast / ephemeral message
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.position='fixed';
    toast.style.right='18px';
    toast.style.bottom='18px';
    toast.style.padding='12px 16px';
    toast.style.background='linear-gradient(90deg,var(--accent),var(--accent-2))';
    toast.style.color='white';
    toast.style.borderRadius='12px';
    toast.style.boxShadow='0 12px 30px rgba(0,0,0,0.6)';
    toast.style.zIndex=2200;
    document.body.appendChild(toast);
    setTimeout(()=>{ toast.style.transition='opacity .4s ease'; toast.style.opacity=0; setTimeout(()=>document.body.removeChild(toast),420); }, 2400);
}

/* Miss-you popup functions */
const missYouMessages = [
    "I love you my chikoo! 🥰",
    "Sending virtual huggies 🤗 to my darling!",
    "Sending virtual kissy 😘 to my darling!",
    "Pratham misses you too! ❤️", 
    "Thinking of you, always! ✨",
    "You're the best! 💖"
];

function showMissYouPopup() {
    const bunnyFace = document.querySelector('.bunny-button .bunny-face');
    if(bunnyFace) bunnyFace.classList.add('spinning'); 

    setTimeout(() => {
        if(bunnyFace) bunnyFace.classList.remove('spinning');
                
        let message = missYouMessages[Math.floor(Math.random() * missYouMessages.length)];
                
        if (typeof currentUser !== 'undefined' && currentUser === 'Chikoo' && message === "Pratham misses you too! ❤️") {
            // message remains as is
        } else if (typeof currentUser !== 'undefined' && currentUser === 'Prath' && message === "Pratham misses you too! ❤️") {
            message = "Chikoo misses you too! ❤️"; 
        }

        const popup = document.getElementById('missYouPopup');
        if(popup){ popup.querySelector('#missYouMessage').innerHTML = message; popup.hidden=false; }
        const overlay = document.getElementById('overlay'); if(overlay){ overlay.style.display='block'; overlay.hidden=false; }
    }, 600);
}

function closeMissYouPopup() {
    const popup = document.getElementById('missYouPopup');
    if(popup) popup.hidden=true;
    const overlay = document.getElementById('overlay'); if(overlay) { overlay.style.display='none'; overlay.hidden=true; }
}

/* Initialization & helpers (calendar navigation etc) */
document.addEventListener('DOMContentLoaded', function(){
    // set visibility depending on login
    checkLoginStatus();

    // calendar prev/next handlers
    const prev = document.getElementById('prevMonthBtn');
    const next = document.getElementById('nextMonthBtn');
    if(prev) prev.addEventListener('click', ()=>{ calendarCurrentDate = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth()-1, 1); renderCalendar(calendarCurrentDate); });
    if(next) next.addEventListener('click', ()=>{ calendarCurrentDate = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth()+1, 1); renderCalendar(calendarCurrentDate); });

    // Dare generator
    const nextDareBtn = document.getElementById('nextDareBtn');
    if(nextDareBtn) nextDareBtn.addEventListener('click', generateDare);
});

/* Dare generator helper */
function generateDare() {
    if (!dareTextElement) return;
    if (usedDares.length === coupleDares.length) { usedDares = []; } // reset
    let idx;
    do { idx = Math.floor(Math.random() * coupleDares.length); } while (usedDares.includes(idx) && usedDares.length < coupleDares.length);
    usedDares.push(idx);
    dareTextElement.textContent = coupleDares[idx];
}

/* End of script.js */
