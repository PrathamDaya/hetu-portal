let selectedEmotion = "";

function selectEmotion(emotion) {
  selectedEmotion = emotion;
  document.getElementById("inputSection").classList.remove("hidden");
  document.querySelector(".emotion-options").classList.add("hidden");
}

function submitEmotion() {
  const message = document.getElementById("message").value.trim();
  if (!message) {
    alert("Please enter your thoughts.");
    return;
  }

  fetch('https://script.google.com/macros/s/AKfycbw3krscUgsxF1KWDZDwXnQ-ykilGeGYES3MdKou9d6pm3nnh-XX1nHXmVqFebGpiQDo/exec', {
    method: 'POST',
    body: JSON.stringify({ emotion: selectedEmotion, message }),
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(() => {
    document.getElementById("inputSection").classList.add("hidden");
    document.getElementById("thankYou").classList.remove("hidden");
    document.getElementById("responseText").innerText =
      selectedEmotion === 'Grievance'
        ? "Prath will solve this 💪"
        : "Prath will always love you 💖";

    setTimeout(() => {
      document.getElementById("thankYou").classList.add("hidden");
      document.querySelector(".emotion-options").classList.remove("hidden");
      document.getElementById("message").value = "";
      selectedEmotion = "";
    }, 4000);
  });
}
