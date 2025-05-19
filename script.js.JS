document.getElementById('emotionForm').addEventListener('submit',
function(e) {
   e.preventDefault();
   const emotion = document.getElementById('emotion').value;
   const message = document.getElementById('message').value;
   fetch('https://script.google.com/macros/s/AKfycbw3krscUgsxF1KWDZDwXnQ-ykilGeGYES3MdKou9d6pm3nnh-XX1nHXmVqFebGpiQDo/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         emotion,
         message
      })
   });
   let responseText = (emotion === "Grievance") ? "Prath will solve this ❤️": "Prath will always love you ❤️";
   document.getElementById('thankYou').innerHTML = "<h2>" + responseText + "</h2>";
   document.getElementById('thankYou').classList.remove('hidden');
   document.getElementById('emotionForm').classList.add('hidden');
});