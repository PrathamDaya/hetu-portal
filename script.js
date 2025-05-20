const scriptURL = 'https://script.google.com/macros/s/AKfycbw11-sZBdkaxqiKzKeLtkOBs5KZaABiz2BkEIsUTI2a2TGRUDXLFhb-GEKPZqEd0eEREQ/exec'; // Replace with your Google Apps Script Web App URL
const pages = document.querySelectorAll('.page');
let currentEmotion = '';

function navigateTo(pageId, emotion = '') {
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    currentEmotion = emotion;
    if (pageId === 'page2' && emotion) {
        document.querySelector('#page2 h2').textContent = `You selected: ${emotion}. Please let me know your thoughts.`;
    }
    if (pageId === 'page3') {
        const messageBox = document.getElementById('message-box');
        const messageTextarea = document.getElementById('message');
        messageBox.textContent = messageTextarea.value.substring(0, 20) + '...'; // Show a snippet in the animation
    }
}

function submitEntry() {
    const message = document.getElementById('message').value;
    if (!message.trim()) {
        alert('Please enter your thoughts.');
        return;
    }

    const timestamp = new Date().toISOString();
    const formData = new FormData();
    formData.append('emotion', currentEmotion);
    formData.append('message', message);
    formData.append('timestamp', timestamp);

    fetch(scriptURL, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success!', data);
        navigateTo('page3');
        document.getElementById('message').value = ''; // Clear the textarea
    })
    .catch((error) => {
        console.error('Error!', error);
        alert('There was an error submitting your entry. Please try again later.');
    });
}

// Initial navigation to the first page
navigateTo('page1');
