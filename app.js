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

  // DOM helper and cached references
  const $ = s => document.querySelector(s);
  const $emojis = $("#emojis");
  const $guess = $("#guess");
  const $msg = $("#msg");
  const $btnGuess = $("#btnGuess");
  const $btnHint = $("#btnHint");
  const $btnSkip = $("#btnSkip");
  const $score = $("#score");
  const $streak = $("#streak");
  const $timer = $("#timer");

  // Game state
  let current = null;
  let attempts = 0;
  let timer = 15;
  let tickId = null;
  let score = parseInt(localStorage.getItem("emojiGameScore")) || 0;
  let streak = parseInt(localStorage.getItem("emojiGameStreak")) || 0;

  // Initialize UI
  $score.textContent = score;
  $streak.textContent = streak;
  $timer.textContent = timer;

  function setTimer(value) {
    timer = Math.max(0, Math.min(value, 30));
    $timer.textContent = timer;
  }

  function startTimer() {
    if (tickId) clearInterval(tickId);
    
    tickId = setInterval(() => {
      setTimer(timer - 1);
      
      if (timer <= 0) {
        clearInterval(tickId);
        tickId = null;
        $msg.textContent = "⏰ Time up! Moving on…";
        nextRound();
      }
    }, 1000);
  }

  function pickRandomPuzzle() {
    return PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
  }

  function startRound() {
    current = pickRandomPuzzle();
    attempts = 0;
    setTimer(15);
    $emojis.textContent = current.emojis;
    $msg.textContent = "";
    $msg.classList.remove("glow");
    $guess.value = "";
    $btnGuess.disabled = false;
    $btnGuess.textContent = "Guess";
    $guess.focus();
    startTimer();
  }

  function nextRound() {
    if (tickId) {
      clearInterval(tickId);
      tickId = null;
    }
    setTimeout(startRound, 1200);
  }

  function updateScore(isCorrect) {
    if (isCorrect) {
      score += 10;
      streak += 1;
    } else {
      score = Math.max(0, score - 3);
      streak = 0;
    }
    
    $score.textContent = score;
    $streak.textContent = streak;
    localStorage.setItem("emojiGameScore", score);
    localStorage.setItem("emojiGameStreak", streak);
  }

  function handleGuess() {
    const userGuess = $guess.value.trim().toLowerCase();
    
    if (userGuess === current.answer) {
      setTimer(timer + 5); // Add 5 seconds for correct answer
      $msg.textContent = "✅ Correct!";
      $msg.classList.add("glow");
      updateScore(true);
      $btnGuess.disabled = true;
      $btnGuess.textContent = "Solved!";
      nextRound();
      return;
    }

    attempts++;
    setTimer(timer - 3); // Subtract 3 seconds for wrong answer
    updateScore(false);
    
    if (timer <= 0) {
      $msg.textContent = "⏰ Time up!";
      nextRound();
      return;
    }
    
    if (attempts >= 3) {
      $msg.textContent = "☠️ 3 tries used. Moving on…";
      nextRound();
      return;
    }
    
    $msg.textContent = `❌ Try again (attempts: ${attempts}/3)`;
    $guess.value = "";
    $guess.focus();
  }

  function showHint() {
    $msg.textContent = `💡 Hint: ${current.hint}`;
    $btnHint.disabled = true;
    setTimeout(() => {
      $btnHint.disabled = false;
    }, 1000);
  }

  function skipPuzzle() {
    $msg.textContent = "⏭️ Skipped.";
    nextRound();
  }

  // Event listeners
  $btnGuess.addEventListener("click", handleGuess);
  $btnSkip.addEventListener("click", skipPuzzle);
  $guess.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleGuess();
  });

  // Create hint button
  const hintButton = document.createElement("button");
  hintButton.id = "btnHint";
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

  // Insert hint button after skip button
  if ($btnSkip && $btnSkip.parentNode) {
    $btnSkip.parentNode.insertBefore(hintButton, $btnSkip.nextSibling);
  }

  // Start the game
  startRound();
})();
