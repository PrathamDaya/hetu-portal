// Modern JavaScript with ES6+ features and better error handling
// ⚠️ CRITICAL: REPLACE THIS WITH YOUR ACTUAL DEPLOYED GOOGLE APPS SCRIPT URL
const scriptURL = 'https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID_HERE/exec';

// DOM Elements - Cached for better performance
const loginContainer = document.getElementById('loginContainer');
const appContainer = document.getElementById('appContainer');
const loggedInUserDisplay = document.getElementById('loggedInUserDisplay');
const dynamicUserNameElements = document.querySelectorAll('.dynamicUserName');
const loadingScreen = document.getElementById('loadingScreen');
const screens = document.querySelectorAll('.screen');
const feelingsPages = document.querySelectorAll('#feelingsPortalScreen .page');
const diaryPages = document.querySelectorAll('#diaryScreen .page');
const dareTextElement = document.getElementById('dareText');

// Global variables for application state
let currentUser = '';
const SCRIPT_USER_KEY = 'hetuAppCurrentUser';
let currentEmotion = '';
let calendarCurrentDate = new Date();
let diaryEntries = {};
let usedDares = [];

// Enhanced Dares List with more variety
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

// Miss You Messages with more variety
const missYouMessages = [
    "I love you my chikoo! 🥰",
    "Sending virtual huggies 🤗 to my darling!",
    "Sending virtual kissy 😘 to my darling!",
    "Pratham misses you too! ❤️", 
    "Thinking of you, always! ✨",
    "You're the best! 💖",
    "My heart beats for you! 💓",
    "You're my everything! 🌟",
    "Can't wait to see you! 😍",
    "You make my world brighter! ☀️",
    "You're my princess! 👸",
    "Forever yours! 💕",
    "You complete me! 🤗",
    "Love you to the moon and back! 🌙",
    "You're my happy place! 😊"
];

// Period tracking data
let periodData = {
    lastPeriodDate: null,
    cycleLength: 28,
    nextPeriodDate: null,
    fertileWindow: null
};

// Game data
let currentGame = null;
let gameScores = {};

// Utility Functions
const showLoading = () => {
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
};

const hideLoading = () => {
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
};

const showCustomMessage = (message, onOkCallback) => {
    // Remove existing popups
    const existingPopup = document.getElementById('customMessagePopup');
    const existingOverlay = document.getElementById('customMessageOverlay');
    if (existingPopup) existingPopup.remove();
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'customMessageOverlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6); z-index: 1999; display: flex;
        align-items: center; justify-content: center; backdrop-filter: blur(5px);
    `;

    const popup = document.createElement('div');
    popup.id = 'customMessagePopup';
    popup.style.cssText = `
        background: linear-gradient(145deg, #ffffff, #fafafa);
        padding: 40px; border-radius: 20px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.2);
        text-align: center; max-width: 400px; width: 90%;
        z-index: 2000; border: 1px solid rgba(255,255,255,0.8);
        backdrop-filter: blur(10px);
    `;
    
    const messageP = document.createElement('p');
    messageP.textContent = message;
    messageP.style.cssText = "margin: 0 0 25px 0; font-size: 1.1em; line-height: 1.5; color: #5c3b4c;";

    const okButton = document.createElement('button');
    okButton.innerHTML = '<i class="fas fa-check"></i> Okay';
    okButton.style.cssText = `
        background: linear-gradient(45deg, #d94a6b, #ff80a0);
        color: white; border: none; padding: 12px 30px; border-radius: 25px;
        cursor: pointer; font-size: 1em; font-weight: 600; transition: all 0.3s ease;
    `;

    okButton.onclick = () => {
        overlay.remove();
        if (onOkCallback && typeof onOkCallback === 'function') {
            onOkCallback();
        }
    };

    popup.appendChild(messageP);
    popup.appendChild(okButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
};

const showCustomPrompt = (message, callback) => {
    // Remove existing popups
    const existingPopup = document.getElementById('customPromptPopup');
    const existingOverlay = document.getElementById('customPromptOverlay');
    if (existingPopup) existingPopup.remove();
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'customPromptOverlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.65); z-index: 1999; display: flex;
        align-items: center; justify-content: center; backdrop-filter: blur(5px);
    `;

    const popup = document.createElement('div');
    popup.id = 'customPromptPopup';
    popup.style.cssText = `
        background: linear-gradient(145deg, #ffffff, #fafafa);
        padding: 40px; border-radius: 20px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.25);
        text-align: center; max-width: 450px; width: 90%;
        z-index: 2000; border: 1px solid rgba(255,255,255,0.8);
        backdrop-filter: blur(10px);
    `;

    const messageP = document.createElement('p');
    messageP.textContent = message;
    messageP.style.cssText = "margin: 0 0 20px 0; font-size: 1em; line-height: 1.5; white-space: pre-wrap; color: #5c3b4c;";

    const inputField = document.createElement('textarea');
    inputField.rows = 4;
    inputField.style.cssText = `
        width: 100%; padding: 15px; border: 2px solid #ddd; border-radius: 12px;
        margin-bottom: 25px; font-size: 0.95em; font-family: inherit;
        box-sizing: border-box; resize: vertical; transition: all 0.3s ease;
    `;

    inputField.addEventListener('focus', () => {
        inputField.style.borderColor = '#d94a6b';
        inputField.style.boxShadow = '0 0 8px rgba(217, 74, 107, 0.3)';
    });

    inputField.addEventListener('blur', () => {
        inputField.style.borderColor = '#ddd';
        inputField.style.boxShadow = 'none';
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = "display: flex; justify-content: space-around; gap: 15px;";

    const submitButton = document.createElement('button');
    submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit';
    submitButton.style.cssText = `
        background: linear-gradient(45deg, #4CAF50, #81C784); color: white;
        border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer;
        font-size: 0.95em; font-weight: 600; flex: 1; transition: all 0.3s ease;
    `;

    const cancelButton = document.createElement('button');
    cancelButton.innerHTML = '<i class="fas fa-times"></i> Cancel';
    cancelButton.style.cssText = `
        background: #f0f0f0; color: #666; border: 1px solid #ddd;
        padding: 12px 24px; border-radius: 25px; cursor: pointer;
        font-size: 0.95em; font-weight: 600; flex: 1; transition: all 0.3s ease;
    `;

    submitButton.onclick = () => {
        overlay.remove();
        callback(inputField.value);
    };

    cancelButton.onclick = () => {
        overlay.remove();
        callback(null);
    };

    popup.appendChild(messageP);
    popup.appendChild(inputField);
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(submitButton);
    popup.appendChild(buttonContainer);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    inputField.focus();
};

// User Authentication and Session Management
const login = (userName) => {
    if (userName === 'Chikoo' || userName === 'Prath') {
        currentUser = userName;
        localStorage.setItem(SCRIPT_USER_KEY, currentUser);
        updateUserDisplay();
        loginContainer.style.display = 'none';
        appContainer.style.display = 'block';
        document.body.style.alignItems = 'flex-start';
        navigateToApp('homeScreen');
        console.log(`${currentUser} logged in.`);
        
        // Show welcome message
        setTimeout(() => {
            showCustomMessage(`Welcome back, ${currentUser}! 💖`);
        }, 500);
    } else {
        showCustomMessage('Invalid user selection. Please choose either Chikoo or Prath.');
    }
};

const logout = () => {
    currentUser = '';
    localStorage.removeItem(SCRIPT_USER_KEY);
    updateUserDisplay();
    appContainer.style.display = 'none';
    loginContainer.style.display = 'flex';
    document.body.style.alignItems = 'center';
    screens.forEach(screen => screen.classList.remove('active'));
    console.log('User logged out.');
};

const updateUserDisplay = () => {
    if (loggedInUserDisplay) {
        loggedInUserDisplay.textContent = currentUser ? `User: ${currentUser}` : 'User: Not logged in';
    }
    dynamicUserNameElements.forEach(el => {
        el.textContent = currentUser || 'User';
    });
};

const checkLoginStatus = () => {
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
};

// Navigation Functions
const navigateToApp = (screenId) => {
    if (!currentUser && screenId !== 'loginScreen') {
        console.warn('No user logged in. Redirecting to login.');
        logout();
        return;
    }
    
    screens.forEach(screen => screen.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    } else {
        console.error("Screen not found:", screenId);
        if (currentUser) navigateToApp('homeScreen');
        else logout();
        return;
    }

    // Initialize specific screens
    if (screenId === 'feelingsPortalScreen') {
        navigateToFeelingsPage('feelingsPage1');
    } else if (screenId === 'diaryScreen') {
        fetchDiaryEntries().then(() => {
            renderCalendar(calendarCurrentDate);
            navigateToDiaryPage('diaryCalendarPage');
        });
    } else if (screenId === 'dareGameScreen') {
        if (usedDares.length === coupleDares.length) {
            usedDares = [];
            showCustomMessage("You've gone through all the dares! Resetting for more fun. 😉");
        }
        if (dareTextElement) {
            dareTextElement.textContent = "Click the button below to get your first dare!";
        }
    } else if (screenId === 'periodTrackerScreen') {
        initializePeriodTracker();
    } else if (screenId === 'gamesScreen') {
        initializeGames();
    }
};

// Feelings Portal Functions
const navigateToFeelingsPage = (pageId, emotion = '') => {
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
        if (heading) {
            heading.textContent = `You selected: ${currentEmotion}. ${currentUser}, please let me know your thoughts.`;
        }
    }
    
    if (pageId === 'feelingsPage3') {
        const messageBox = document.getElementById('feelings-message-box');
        const messageTextarea = document.getElementById('feelingsMessage');
        if (messageBox && messageTextarea && messageTextarea.value) {
            messageBox.textContent = messageTextarea.value.substring(0, 30) + '...';
        } else if (messageBox) {
            messageBox.textContent = "Thoughts recorded!";
        }
    }
};

const submitFeelingsEntry = async () => {
    if (!currentUser) {
        showCustomMessage('Please log in first.');
        logout();
        return;
    }
    
    const messageInput = document.getElementById('feelingsMessage');
    const message = messageInput.value.trim();

    if (!currentEmotion) {
        showCustomMessage('Please select an emotion first!');
        return;
    }
    if (!message) {
        showCustomMessage('Please enter your thoughts.');
        return;
    }
    if (scriptURL.includes('YOUR_ACTUAL_SCRIPT_ID_HERE') || scriptURL === '') {
        showCustomMessage('Please update the scriptURL in script.js with your Google Apps Script URL.');
        return;
    }

    const submitBtn = document.getElementById('submitFeelingsBtn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('formType', 'feelingsEntry');
        formData.append('emotion', currentEmotion);
        formData.append('message', message);
        formData.append('submittedBy', currentUser);

        console.log(`Submitting feelings entry by ${currentUser}:`, { 
            emotion: currentEmotion, 
            message: message.substring(0, 50) + '...' 
        });

        const response = await fetch(scriptURL, { 
            method: 'POST', 
            body: formData, 
            mode: 'cors' 
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Feelings Entry Success!', data);
        
        if (data.status === 'error') {
            throw new Error(data.message || 'Server error saving feeling.');
        }
        
        navigateToFeelingsPage('feelingsPage3');
        messageInput.value = '';
        
        // Show success message
        showCustomMessage('Your feelings have been shared! 💖');
        
    } catch (error) {
        console.error('Feelings Entry Error!', error);
        showCustomMessage('Error submitting feelings entry: ' + error.message);
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    }
};

const fetchAndDisplayFeelingsEntries = async () => {
    if (!currentUser) {
        showCustomMessage('Please log in to view entries.');
        logout();
        return;
    }

    const listContainer = document.getElementById('feelingsEntriesList');
    if (!listContainer) {
        console.error('"feelingsEntriesList" not found.');
        navigateToFeelingsPage('feelingsPage1');
        return;
    }
    
    listContainer.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Loading entries...</div>';

    try {
        const response = await fetch(`${scriptURL}?action=getFeelingsEntries`, { 
            method: 'GET', 
            mode: 'cors' 
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! ${response.status}: ${errorText}`);
        }
        
        const serverData = await response.json();
        console.log('Received feelings data:', serverData);
        listContainer.innerHTML = '';

        if (serverData.status === 'success' && serverData.data && serverData.data.length > 0) {
            const table = document.createElement('table');
            table.className = 'feelings-table';
            
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
                
                // Timestamp
                const cellTimestamp = row.insertCell();
                cellTimestamp.textContent = entry.timestamp ? 
                    new Date(entry.timestamp).toLocaleString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        hour12: true 
                    }) : 'N/A';

                // Submitted by
                const cellSubmittedBy = row.insertCell();
                cellSubmittedBy.innerHTML = `<strong>${entry.submittedBy || 'Unknown'}</strong>`;

                // Emotion
                const cellEmotion = row.insertCell();
                const emotionSpan = document.createElement('span');
                emotionSpan.className = `emotion-tag ${entry.emotion ? entry.emotion.toLowerCase() : 'unknown'}`;
                emotionSpan.textContent = entry.emotion || 'N/A';
                cellEmotion.appendChild(emotionSpan);

                // Message
                const cellMessage = row.insertCell();
                cellMessage.textContent = entry.message || 'No message';

                // Response/Reply
                const cellResponse = row.insertCell();
                cellResponse.style.verticalAlign = 'top';

                if (entry.repliedBy && entry.replyMessage) {
                    const replyContainer = document.createElement('div');
                    replyContainer.className = `reply-display ${entry.repliedBy.toLowerCase()}-reply`;
                    
                    const replyTextP = document.createElement('p');
                    replyTextP.innerHTML = `<strong>${entry.repliedBy} Replied:</strong> ${entry.replyMessage}`;
                    replyContainer.appendChild(replyTextP);
                    
                    if (entry.replyTimestamp) {
                        const replyTimeP = document.createElement('p');
                        replyTimeP.className = 'reply-timestamp';
                        replyTimeP.textContent = `Replied: ${new Date(entry.replyTimestamp).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}`;
                        replyContainer.appendChild(replyTimeP);
                    }
                    cellResponse.appendChild(replyContainer);
                } else {
                    const replyButton = document.createElement('button');
                    replyButton.innerHTML = '<i class="fas fa-reply"></i> Reply 💌';
                    replyButton.className = 'reply-btn small-reply-btn';
                    replyButton.onclick = () => {
                        replyButton.disabled = true;
                        const entryDateStr = entry.timestamp ? 
                            new Date(entry.timestamp).toLocaleDateString() : "this feeling";
                        
                        showCustomPrompt(
                            `Replying to ${entry.submittedBy || 'User'}'s feeling on ${entryDateStr}:\n"${(entry.message || '').substring(0, 100)}${(entry.message || '').length > 100 ? "..." : ""}"\n\n${currentUser}, your reply:`, 
                            (replyText) => {
                                if (replyText !== null) {
                                    submitReply('feeling', entry.timestamp, replyText, replyButton);
                                } else {
                                    replyButton.disabled = false;
                                }
                            }
                        );
                    };
                    cellResponse.appendChild(replyButton);
                }
            });
            
            listContainer.appendChild(table);
        } else if (serverData.status === 'success' && (!serverData.data || serverData.data.length === 0)) {
            listContainer.innerHTML = '<div class="no-entries"><i class="fas fa-heart-broken"></i> No feelings entries recorded yet.</div>';
        } else {
            listContainer.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Could not load entries: ${serverData.message || 'Unknown server response'}</div>`;
        }
        
        navigateToFeelingsPage('feelingsViewEntriesPage');
        
    } catch (error) {
        console.error('Failed to fetch feelings entries:', error);
        listContainer.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Error loading entries: ${error.message}</div>`;
    }
};

// Diary Functions
const navigateToDiaryPage = (pageId) => {
    diaryPages.forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        console.error('Diary page not found:', pageId);
    }
};

// Define missing calendar navigation functions
const prevMonth = () => {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
    renderCalendar(calendarCurrentDate);
};

const nextMonth = () => {
    calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
    renderCalendar(calendarCurrentDate);
};

const fetchDiaryEntries = async () => {
    if (!currentUser) {
        console.warn('User not logged in. Diary fetch aborted.');
        return;
    }
    
    if (scriptURL.includes('YOUR_ACTUAL_SCRIPT_ID_HERE') || scriptURL === '') {
        console.warn('scriptURL not configured. Diary entries cannot be fetched.');
        diaryEntries = {};
        return;
    }

    try {
        console.log('Fetching diary entries...');
        const response = await fetch(`${scriptURL}?action=getDiaryEntries`, { 
            method: 'GET', 
            mode: 'cors' 
        });
        
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
};

const renderCalendar = (date) => {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearDisplay = document.getElementById('currentMonthYear');
    
    if (!calendarGrid || !monthYearDisplay) {
        console.error("Calendar elements not found.");
        return;
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
        dayHeaderEl.className = 'calendar-day-header';
        dayHeaderEl.textContent = day;
        calendarGrid.appendChild(dayHeaderEl);
    });

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyCell);
    }

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
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
        }

        dayCell.addEventListener('click', () => {
            if (diaryEntries[dayCell.dataset.date]) {
                viewDiaryEntry(dayCell.dataset.date);
            } else {
                openDiaryEntry(dayCell.dataset.date);
            }
        });
        
        calendarGrid.appendChild(dayCell);
    }
};

const openDiaryEntry = (dateString) => {
    document.getElementById('selectedDate').value = dateString;
    
    const dateParts = dateString.split('-');
    if (dateParts.length !== 3) {
        showCustomMessage('Invalid date format for opening diary: ' + dateString);
        return;
    }
    
    const yearNum = parseInt(dateParts[0], 10);
    const monthNum = parseInt(dateParts[1], 10) - 1;
    const dayNum = parseInt(dateParts[2], 10);
    const dateObj = new Date(yearNum, monthNum, dayNum);

    if (isNaN(dateObj.getTime())) {
        showCustomMessage('Could not create valid date from: ' + dateString);
        return;
    }
    
    const displayOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    document.getElementById('diaryDateDisplay').textContent = dateObj.toLocaleDateString('en-US', displayOptions);
    document.getElementById('diaryEntryTitle').textContent = `Diary for ${dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    
    const thoughtsTextarea = document.getElementById('diaryThoughts');
    thoughtsTextarea.value = '';
    thoughtsTextarea.placeholder = `${currentUser}, write your diary entry here...`;
    
    navigateToDiaryPage('diaryEntryPage');
};

const viewDiaryEntry = (dateString) => {
    const entry = diaryEntries[dateString];
    if (!entry) {
        console.warn('viewDiaryEntry called for a date with no cached entry:', dateString);
        showCustomMessage('Could not load details for ' + dateString + '. Entry not found.');
        openDiaryEntry(dateString);
        return;
    }

    const dateParts = dateString.split('-');
    if (dateParts.length !== 3) {
        showCustomMessage('Invalid date format for view: ' + dateString);
        return;
    }
    
    const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    if (isNaN(dateObj.getTime())) {
        showCustomMessage('Invalid date object for view: ' + dateString);
        return;
    }

    const displayOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    document.getElementById('viewDiaryDateDisplay').textContent = dateObj.toLocaleDateString('en-US', displayOptions);
    document.getElementById('viewDiaryThoughts').textContent = entry.thoughts || 'No thoughts recorded.';

    const attributionElement = document.getElementById('diaryEntryAttribution');
    if (attributionElement) {
        attributionElement.innerHTML = `<em>${entry.submittedBy || 'Unknown User'} made this entry</em>`;
        attributionElement.className = 'entry-attribution';
    }

    const singleViewReplyContainer = document.getElementById('diaryViewPageReplySection');
    if (singleViewReplyContainer) {
        singleViewReplyContainer.innerHTML = '';

        if (entry.repliedBy && entry.replyMessage) {
            const replyDisplay = document.createElement('div');
            replyDisplay.className = `reply-display ${entry.repliedBy.toLowerCase()}-reply`;
            
            const replyTextP = document.createElement('p');
            replyTextP.innerHTML = `<strong>${entry.repliedBy} Replied:</strong> ${entry.replyMessage}`;
            replyDisplay.appendChild(replyTextP);
            
            if (entry.replyTimestamp) {
                const replyTimeP = document.createElement('p');
                replyTimeP.className = 'reply-timestamp';
                replyTimeP.textContent = `Replied: ${new Date(entry.replyTimestamp).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })}`;
                replyDisplay.appendChild(replyTimeP);
            }
            singleViewReplyContainer.appendChild(replyDisplay);
        } else {
            const replyButton = document.createElement('button');
            replyButton.innerHTML = '<i class="fas fa-reply"></i> Reply 💌';
            replyButton.className = 'reply-btn';
            replyButton.onclick = () => {
                replyButton.disabled = true;
                const currentDisplayDate = document.getElementById('viewDiaryDateDisplay').textContent || entry.date;
                
                showCustomPrompt(
                    `Replying to ${entry.submittedBy || 'User'}'s diary entry for ${currentDisplayDate}:\n"${(entry.thoughts || '').substring(0, 100)}${(entry.thoughts || '').length > 100 ? "..." : ""}"\n\n${currentUser}, your reply:`, 
                    (replyText) => {
                        if (replyText !== null) {
                            submitReply('diary', dateString, replyText, replyButton);
                        } else {
                            replyButton.disabled = false;
                        }
                    }
                );
            };
            singleViewReplyContainer.appendChild(replyButton);
        }
    }
    
    navigateToDiaryPage('diaryViewPage');
};

const submitDiaryEntry = async () => {
    if (!currentUser) {
        showCustomMessage('Please log in first.');
        logout();
        return;
    }
    
    const thoughts = document.getElementById('diaryThoughts').value.trim();
    const date = document.getElementById('selectedDate').value;

    if (!date) {
        showCustomMessage('No date selected.');
        return;
    }
    if (!thoughts) {
        showCustomMessage('Please write your thoughts.');
        return;
    }
    if (scriptURL.includes('YOUR_ACTUAL_SCRIPT_ID_HERE') || scriptURL === '') {
        showCustomMessage('Please update the scriptURL in script.js.');
        return;
    }

    const submitBtn = document.querySelector('#diaryEntryPage button[onclick="submitDiaryEntry()"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('formType', 'diaryEntry');
        formData.append('date', date);
        formData.append('thoughts', thoughts);
        formData.append('submittedBy', currentUser);

        console.log(`Submitting diary entry by ${currentUser}:`, { 
            date: date, 
            thoughts: thoughts.substring(0, 50) + '...' 
        });

        const response = await fetch(scriptURL, { 
            method: 'POST', 
            body: formData, 
            mode: 'cors' 
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Diary Entry Success!', data);
        
        if (data.status === 'error') {
            throw new Error(data.message || 'Server error saving diary.');
        }

        await fetchDiaryEntries();
        renderCalendar(calendarCurrentDate);
        navigateToDiaryPage('diaryConfirmationPage');
        
        // Show success message
        showCustomMessage('Your diary entry has been saved! 📖');
        
    } catch (error) {
        console.error('Diary Entry Error!', error);
        showCustomMessage('Error saving diary entry: ' + error.message);
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    }
};

const fetchAndDisplayAllDiaryEntries = async () => {
    if (!currentUser) {
        showCustomMessage('Please log in to view entries.');
        logout();
        return;
    }

    const listContainer = document.getElementById('allDiaryEntriesList');
    if (!listContainer) {
        console.error('"allDiaryEntriesList" not found.');
        return;
    }
    
    listContainer.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Loading entries...</div>';

    if (scriptURL.includes('YOUR_ACTUAL_SCRIPT_ID_HERE') || scriptURL === '') {
        listContainer.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Error: scriptURL not configured.</div>';
        return;
    }

    try {
        const response = await fetch(`${scriptURL}?action=getDiaryEntries`, { 
            method: 'GET', 
            mode: 'cors' 
        });
        
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
                entryDiv.className = 'diary-entry-list-item';
                
                let formattedDate = 'Unknown Date';
                if (entry.date) {
                    const entryDateObj = new Date(entry.date + "T00:00:00");
                    if (!isNaN(entryDateObj.getTime())) {
                        formattedDate = entryDateObj.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                    } else {
                        formattedDate = `Invalid Date: ${entry.date}`;
                    }
                }
                
                const entryMetaDiv = document.createElement('div');
                entryMetaDiv.className = 'entry-meta-info';
                if (entry.submittedBy) entryMetaDiv.classList.add(`${entry.submittedBy.toLowerCase()}-entry`);
                entryMetaDiv.innerHTML = `<strong>${entry.submittedBy || 'Unknown User'}</strong> made this entry:`;
                
                entryDiv.innerHTML = `<h3>${formattedDate}</h3>`;
                entryDiv.appendChild(entryMetaDiv);
                
                const thoughtsP = document.createElement('p');
                thoughtsP.className = 'entry-content';
                thoughtsP.textContent = entry.thoughts || 'No thoughts.';
                entryDiv.appendChild(thoughtsP);

                const replySectionDiv = document.createElement('div');
                replySectionDiv.className = 'entry-reply-section';

                if (entry.repliedBy && entry.replyMessage) {
                    const replyContainer = document.createElement('div');
                    replyContainer.className = `reply-display ${entry.repliedBy.toLowerCase()}-reply`;
                    
                    const replyTextP = document.createElement('p');
                    replyTextP.innerHTML = `<strong>${entry.repliedBy} Replied:</strong> ${entry.replyMessage}`;
                    replyContainer.appendChild(replyTextP);
                    
                    if (entry.replyTimestamp) {
                        const replyTimeP = document.createElement('p');
                        replyTimeP.className = 'reply-timestamp';
                        replyTimeP.textContent = `Replied: ${new Date(entry.replyTimestamp).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}`;
                        replyContainer.appendChild(replyTimeP);
                    }
                    replySectionDiv.appendChild(replyContainer);
                } else {
                    const replyButton = document.createElement('button');
                    replyButton.innerHTML = '<i class="fas fa-reply"></i> Reply 💌';
                    replyButton.className = 'reply-btn small-reply-btn';
                    replyButton.onclick = (event) => {
                        event.stopPropagation();
                        replyButton.disabled = true;
                        
                        showCustomPrompt(
                            `Replying to ${entry.submittedBy || 'User'}'s diary entry for ${formattedDate}:\n"${(entry.thoughts || '').substring(0, 100)}${(entry.thoughts || '').length > 100 ? "..." : ""}"\n\n${currentUser}, your reply:`, 
                            (replyText) => {
                                if (replyText !== null) {
                                    submitReply('diary', entry.date, replyText, replyButton);
                                } else {
                                    replyButton.disabled = false;
                                }
                            }
                        );
                    };
                    replySectionDiv.appendChild(replyButton);
                }
                
                entryDiv.appendChild(replySectionDiv);
                
                const hr = document.createElement('hr');
                entryDiv.appendChild(hr);
                
                listContainer.appendChild(entryDiv);
            });
        } else if (serverData.status === 'success' && (!serverData.data || serverData.data.length === 0)) {
            listContainer.innerHTML = '<div class="no-entries"><i class="fas fa-book-open"></i> No diary entries recorded yet.</div>';
        } else {
            listContainer.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Could not load entries: ${serverData.message || 'Unknown server response'}</div>`;
        }
        
        navigateToDiaryPage('allDiaryEntriesPage');
        
    } catch (error) {
        console.error('Failed to fetch all diary entries list:', error);
        listContainer.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Error loading all diary entries: ${error.message}</div>`;
    }
};

// Reply Function
const submitReply = async (entryType, entryIdentifier, replyMessage, buttonElement) => {
    if (!currentUser) {
        showCustomMessage('Please log in to reply.');
        logout();
        return;
    }
    
    if (!replyMessage || replyMessage.trim() === "") {
        showCustomMessage("Reply cannot be empty.");
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = '<i class="fas fa-reply"></i> Reply 💌';
        }
        return;
    }

    if (scriptURL.includes('YOUR_ACTUAL_SCRIPT_ID_HERE') || scriptURL === '') {
        showCustomMessage('Please update the scriptURL in script.js.');
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.innerHTML = '<i class="fas fa-reply"></i> Reply 💌';
        }
        return;
    }

    const formData = new FormData();
    formData.append('formType', 'replyEntry');
    formData.append('entryType', entryType);
    formData.append('entryIdentifier', entryIdentifier);
    formData.append('replyMessage', replyMessage.trim());
    formData.append('repliedBy', currentUser);

    const originalButtonText = buttonElement ? buttonElement.innerHTML : '<i class="fas fa-reply"></i> Reply 💌';
    if (buttonElement) {
        buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Replying...';
        buttonElement.disabled = true;
    }

    console.log(`${currentUser} submitting reply for ${entryType} ID ${entryIdentifier}: ${replyMessage.trim()}`);

    try {
        const response = await fetch(scriptURL, { 
            method: 'POST', 
            body: formData, 
            mode: 'cors' 
        });
        
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP error! ${response.status}: ${text}`);
        }
        
        const data = await response.json();
        console.log('Reply server response:', data);
        
        if (data.status === 'error') {
            throw new Error(data.message || 'Error saving reply from server.');
        }

        showCustomMessage(`Reply by ${currentUser} submitted successfully! 💌`);
        
        // Refresh the appropriate view
        if (entryType === 'feeling') {
            fetchAndDisplayFeelingsEntries();
        } else if (entryType === 'diary') {
            await fetchDiaryEntries();
            renderCalendar(calendarCurrentDate);
            
            if (document.getElementById('allDiaryEntriesPage').classList.contains('active')) {
                fetchAndDisplayAllDiaryEntries();
            }
            
            const diaryViewPageActive = document.getElementById('diaryViewPage').classList.contains('active');
            const currentViewingDate = diaryEntries[entryIdentifier] ? entryIdentifier : null;
            if (diaryViewPageActive && currentViewingDate === entryIdentifier) {
                viewDiaryEntry(entryIdentifier);
            }
        }

    } catch (error) {
        console.error('Reply Submission Error!', error);
        showCustomMessage('Error submitting reply.\n' + error.message);
        
        if (buttonElement) {
            buttonElement.innerHTML = originalButtonText;
            buttonElement.disabled = false;
        }
    }
};

// Dare Game Functions
const generateDare = () => {
    if (!currentUser) {
        showCustomMessage('Please log in to play the Dare Game!');
        logout();
        return;
    }
    
    if (!dareTextElement) {
        console.error("Dare text element not found!");
        return;
    }

    if (coupleDares.length === 0) {
        dareTextElement.textContent = "No dares available!";
        return;
    }

    let availableDares = coupleDares.filter(dare => !usedDares.includes(dare));

    if (availableDares.length === 0) {
        usedDares = [];
        availableDares = [...coupleDares];
        showCustomMessage("You've gone through all the dares! Resetting for more fun. 😉");
    }

    const randomIndex = Math.floor(Math.random() * availableDares.length);
    const selectedDare = availableDares[randomIndex];
    
    usedDares.push(selectedDare);
    
    // Add some animation to the dare text
    dareTextElement.style.opacity = '0';
    dareTextElement.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        dareTextElement.textContent = selectedDare;
        dareTextElement.style.opacity = '1';
        dareTextElement.style.transform = 'scale(1)';
    }, 200);
};

// Period Tracker Functions
const initializePeriodTracker = () => {
    // Load saved period data
    const savedPeriodData = localStorage.getItem('periodTrackerData');
    if (savedPeriodData) {
        periodData = JSON.parse(savedPeriodData);
        
        // Populate form fields
        const lastPeriodInput = document.getElementById('lastPeriodDate');
        const cycleLengthSelect = document.getElementById('cycleLength');
        
        if (periodData.lastPeriodDate) {
            lastPeriodInput.value = periodData.lastPeriodDate;
        }
        if (periodData.cycleLength) {
            cycleLengthSelect.value = periodData.cycleLength;
        }
        
        // Calculate and display results
        calculatePeriod();
    }
};

const calculatePeriod = () => {
    const lastPeriodInput = document.getElementById('lastPeriodDate');
    const cycleLengthSelect = document.getElementById('cycleLength');
    
    if (!lastPeriodInput.value) {
        showCustomMessage('Please select your last period date.');
        return;
    }
    
    // Save data
    periodData.lastPeriodDate = lastPeriodInput.value;
    periodData.cycleLength = parseInt(cycleLengthSelect.value);
    
    localStorage.setItem('periodTrackerData', JSON.stringify(periodData));
    
    // Calculate dates
    const lastPeriodDate = new Date(periodData.lastPeriodDate);
    const nextPeriodDate = new Date(lastPeriodDate);
    nextPeriodDate.setDate(lastPeriodDate.getDate() + periodData.cycleLength);
    
    // Calculate fertile window (typically 14 days before next period)
    const ovulationDate = new Date(nextPeriodDate);
    ovulationDate.setDate(nextPeriodDate.getDate() - 14);
    
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(ovulationDate.getDate() - 3);
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(ovulationDate.getDate() + 3);
    
    // Determine current status
    const today = new Date();
    const daysSinceLastPeriod = Math.floor((today - lastPeriodDate) / (1000 * 60 * 60 * 24));
    
    let currentStatus = '';
    if (daysSinceLastPeriod <= 5) {
        currentStatus = '🩸 Menstrual Phase';
    } else if (daysSinceLastPeriod <= 13) {
        currentStatus = '🌱 Follicular Phase';
    } else if (daysSinceLastPeriod <= 15) {
        currentStatus = '🥚 Ovulation Phase';
    } else {
        currentStatus = '🌸 Luteal Phase';
    }
    
    // Display results
    document.getElementById('nextPeriodDate').textContent = nextPeriodDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('fertileWindow').textContent = `${fertileStart.toLocaleDateString()} - ${fertileEnd.toLocaleDateString()}`;
    document.getElementById('currentStatus').textContent = currentStatus;
    
    document.getElementById('periodResults').style.display = 'grid';
};

// Games Functions
const initializeGames = () => {
    // Load saved game scores
    const savedScores = localStorage.getItem('gameScores');
    if (savedScores) {
        gameScores = JSON.parse(savedScores);
    }
};

const playGame = (gameType) => {
    currentGame = gameType;
    const gameContainer = document.getElementById('gameContainer');
    
    gameContainer.style.display = 'block';
    
    switch (gameType) {
        case 'memory':
            initMemoryGame();
            break;
        case 'cooking':
            initCookingGame();
            break;
        case 'dressup':
            initDressUpGame();
            break;
        case 'puzzle':
            initPuzzleGame();
            break;
        default:
            gameContent.innerHTML = '<p>Game coming soon!</p>';
    }
};

const closeGame = () => {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.style.display = 'none';
    currentGame = null;
};

// Memory Game
const initMemoryGame = () => {
    const gameContent = document.getElementById('gameContent');
    
    // Remove existing style first to prevent memory leaks
    const existingStyle = document.getElementById('memory-game-style');
    if (existingStyle) existingStyle.remove();
    
    const emojis = ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌵', '🌿'];
    const cards = [...emojis, ...emojis];
    
    // Shuffle cards
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    
    const gameHTML = `
        <div class="memory-game">
            <h3>Memory Game - Find the pairs!</h3>
            <p>Moves: <span id="moves">0</span></p>
            <div class="memory-grid">
                ${cards.map((emoji, index) => `
                    <div class="memory-card" data-index="${index}" data-emoji="${emoji}">
                        <div class="card-front">?</div>
                        <div class="card-back">${emoji}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    gameContent.innerHTML = gameHTML;
    
    // Add CSS with ID for cleanup
    const style = document.createElement('style');
    style.id = 'memory-game-style';
    style.textContent = `
        .memory-game { text-align: center; }
        .memory-grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 10px; 
            max-width: 400px; 
            margin: 20px auto; 
        }
        .memory-card { 
            width: 80px; 
            height: 80px; 
            cursor: pointer; 
            position: relative; 
            border-radius: 8px; 
            transform-style: preserve-3d; 
            transition: transform 0.3s; 
        }
        .memory-card.flipped { transform: rotateY(180deg); }
        .memory-card.matched { opacity: 0.5; cursor: default; }
        .card-front, .card-back { 
            position: absolute; 
            width: 100%; 
            height: 100%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border-radius: 8px; 
            backface-visibility: hidden; 
            font-size: 2em; 
        }
        .card-front { 
            background: linear-gradient(45deg, #d94a6b, #ff80a0); 
            color: white; 
        }
        .card-back { 
            background: white; 
            transform: rotateY(180deg); 
        }
    `;
    document.head.appendChild(style);
    
    // Add event listeners
    document.querySelectorAll('.memory-card').forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length >= 2) {
                return;
            }
            
            card.classList.add('flipped');
            flippedCards.push(card);
            
            if (flippedCards.length === 2) {
                moves++;
                document.getElementById('moves').textContent = moves;
                
                setTimeout(() => {
                    const [card1, card2] = flippedCards;
                    const emoji1 = card1.dataset.emoji;
                    const emoji2 = card2.dataset.emoji;
                    
                    if (emoji1 === emoji2) {
                        card1.classList.add('matched');
                        card2.classList.add('matched');
                        matchedPairs++;
                        
                        if (matchedPairs === emojis.length) {
                            setTimeout(() => {
                                showCustomMessage(`🎉 Congratulations! You won in ${moves} moves!`, () => {
                                    // Save score
                                    gameScores.memory = Math.min(gameScores.memory || Infinity, moves);
                                    localStorage.setItem('gameScores', JSON.stringify(gameScores));
                                    closeGame();
                                });
                            }, 500);
                        }
                    } else {
                        card1.classList.remove('flipped');
                        card2.classList.remove('flipped');
                    }
                    
                    flippedCards = [];
                }, 1000);
            }
        });
    });
};

// Cooking Game
const initCookingGame = () => {
    const gameContent = document.getElementById('gameContent');
    
    const recipes = [
        { name: 'Strawberry Cake', ingredients: ['🍓', '🍰', '🥛', '🥚'], time: 30 },
        { name: 'Chocolate Cookies', ingredients: ['🍫', '🍪', '🥛', '🧈'], time: 20 },
        { name: 'Fruit Salad', ingredients: ['🍎', '🍌', '🍇', '🍊'], time: 15 }
    ];
    
    let currentRecipe = recipes[Math.floor(Math.random() * recipes.length)];
    let collectedIngredients = [];
    
    const gameHTML = `
        <div class="cooking-game">
            <h3>👩‍🍳 Kitchen Fun - Make ${currentRecipe.name}!</h3>
            <p>Time: <span id="timer">${currentRecipe.time}</span>s</p>
            <div class="recipe-ingredients">
                <h4>Ingredients needed:</h4>
                <div class="ingredients-list">
                    ${currentRecipe.ingredients.map(ingredient => `
                        <span class="ingredient-needed">${ingredient}</span>
                    `).join('')}
                </div>
            </div>
            <div class="kitchen-area">
                <h4>Find ingredients in the kitchen:</h4>
                <div class="ingredients-grid">
                    ${['🍓', '🍰', '🥛', '🥚', '🍫', '🍪', '🧈', '🍎', '🍌', '🍇', '🍊', '🧀'].map(ingredient => `
                        <div class="ingredient-item" data-ingredient="${ingredient}">${ingredient}</div>
                    `).join('')}
                </div>
            </div>
            <div class="collected-ingredients">
                <h4>Your ingredients:</h4>
                <div id="collected-list"></div>
            </div>
        </div>
    `;
    
    gameContent.innerHTML = gameHTML;
    
    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
        .cooking-game { text-align: center; }
        .ingredients-list, .collected-ingredients { margin: 20px 0; }
        .ingredient-needed, .collected-ingredient { 
            display: inline-block; 
            font-size: 2em; 
            margin: 5px; 
            padding: 10px; 
            border-radius: 8px; 
        }
        .ingredient-needed { background: #f0f0f0; }
        .collected-ingredient { background: #d4edda; }
        .ingredients-grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 10px; 
            max-width: 300px; 
            margin: 20px auto; 
        }
        .ingredient-item { 
            font-size: 2em; 
            padding: 15px; 
            border: 2px solid #ddd; 
            border-radius: 8px; 
            cursor: pointer; 
            transition: all 0.3s; 
        }
        .ingredient-item:hover { 
            border-color: var(--primary-color); 
            transform: scale(1.1); 
        }
    `;
    document.head.appendChild(style);
    
    // Add event listeners
    let timeLeft = currentRecipe.time;
    const timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            showCustomMessage('⏰ Time\'s up!
