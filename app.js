(function () {
  const PUZZLES = [
    { emojis: "🍎📱", answer: "iphone", hint: "Think Apple + phone" },
    { emojis: "🎬🍿", answer: "cinema", hint: "Where you watch movies" },
    { emojis: "🚗⛽", answer: "gas", hint: "Fuel for cars" },
    { emojis: "🌙⭐", answer: "night", hint: "When the stars come out" },
    { emojis: "☕📚", answer: "study", hint: "Coffee and books go together" },
    { emojis: "🏠🌳", answer: "garden", hint: "Plants around your house" },
    { emojis: "🎵🎤", answer: "karaoke", hint: "Singing with music" },
    { emojis: "🌊🏄", answer: "surfing", hint: "Riding ocean waves" },
    { emojis: "🍕🍺", answer: "party", hint: "Food and drinks celebration" },
    { emojis: "🚀🌍", answer: "space", hint: "Beyond our planet" }
  ];

  // Randomly select a puzzle on page load
  const selectedPuzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];

  const input = document.getElementById("guess");
  const button = document.getElementById("btn");
  const message = document.getElementById("msg");
  const emojis = document.getElementById("emojis");
  const scoreElement = document.getElementById("score");
  const streakElement = document.getElementById("streak");

  // Load score and streak from localStorage
  let score = parseInt(localStorage.getItem("emojiGameScore")) || 0;
  let streak = parseInt(localStorage.getItem("emojiGameStreak")) || 0;

  // Update UI with loaded values
  scoreElement.textContent = score;
  streakElement.textContent = streak;

  // Render the selected puzzle's emojis
  if (emojis) {
    emojis.textContent = selectedPuzzle.emojis;
  }

  function updateScore(isCorrect) {
    if (isCorrect) {
      score += 10;
      streak += 1;
      message.textContent = "✅ Correct!";
      button.disabled = true;
      button.textContent = "Solved!";
    } else {
      score = Math.max(0, score - 3); // Prevent negative score
      streak = 0;
      message.textContent = "❌ Try again";
    }
    
    // Update UI and localStorage
    scoreElement.textContent = score;
    streakElement.textContent = streak;
    localStorage.setItem("emojiGameScore", score);
    localStorage.setItem("emojiGameStreak", streak);
  }

  function evaluateGuess() {
    const userGuess = (input?.value || "").trim().toLowerCase();
    updateScore(userGuess === selectedPuzzle.answer);
  }

  function showHint() {
    message.textContent = `💡 Hint: ${selectedPuzzle.hint}`;
  }

  // Add hint button functionality
  button?.addEventListener("click", evaluateGuess);

  // Add Enter key support
  input?.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      evaluateGuess();
    }
  });

  // Create and add hint button
  const hintButton = document.createElement("button");
  hintButton.textContent = "Hint";
  hintButton.style.cssText = `
    background-color: #3b82f6;
    color: #ffffff;
    border: none;
    padding: 10px 16px;
    font-size: 16px;
    border-radius: 6px;
    cursor: pointer;
    margin-left: 8px;
  `;
  hintButton.addEventListener("mouseenter", function() {
    this.style.backgroundColor = "#2563eb";
  });
  hintButton.addEventListener("mouseleave", function() {
    this.style.backgroundColor = "#3b82f6";
  });
  hintButton.addEventListener("click", showHint);

  // Insert hint button after the guess button
  if (button && button.parentNode) {
    button.parentNode.insertBefore(hintButton, button.nextSibling);
  }
})();
