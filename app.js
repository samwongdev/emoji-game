(function () {
  // Fallback puzzles in case JSON loading fails
  const FALLBACK_PUZZLES = [
    { emojis: "🍎📱", answer: "iphone", hint: "Think Apple + phone" },
    { emojis: "🎬🍿", answer: "cinema", hint: "Where you watch movies" },
    { emojis: "🚗⛽", answer: "gas", hint: "Fuel for cars" },
    { emojis: "🌙⭐", answer: "night", hint: "When the stars come out" },
    { emojis: "☕📚", answer: "study", hint: "Coffee and books go together" }
  ];

  const DIFFICULTY = {
    easy:   { startTime: 60 },
    medium: { startTime: 45 },
    hard:   { startTime: 30 }
  };

  // DOM helper and cached references
  const $ = s => document.querySelector(s);
  const $emojis = $("#emojis");
  const $guess = $("#guess");
  const $msg = $("#msg");
  const $btnStart = $("#btnStart");
  const $btnGuess = $("#btnGuess");
  const $btnHint = $("#btnHint");
  const $btnSkip = $("#btnSkip");
  const $score = $("#score");
  const $streak = $("#streak");
  const $timer = $("#timer");

  // Game state
  let isRunning = false;
  let isGameOver = false;
  let current = null;
  let attempts = 0;
  let timer = 0;
  let tickId = null;
  let currentDifficulty = 'easy';
  let score = 0;
  let streak = 0;

  // Puzzle management
  let PUZZLES = [];
  let puzzleQueue = [];
  let currentPuzzleIndex = 0;

  // Initialize UI
  updateUI();
  disableGameControls();

  // Load difficulty from localStorage
  const savedDifficulty = localStorage.getItem("emojiGameDifficulty") || 'easy';
  currentDifficulty = savedDifficulty;
  $(`#${savedDifficulty}`).checked = true;

  // Load puzzles from JSON file
  async function loadPuzzles() {
    try {
      const response = await fetch('public/puzzles.json');
      if (!response.ok) throw new Error('Failed to fetch puzzles');
      PUZZLES = await response.json();
    } catch (error) {
      console.warn('Failed to load puzzles from JSON, using fallback:', error);
      PUZZLES = FALLBACK_PUZZLES;
    }
    
    // Initialize puzzle queue
    shufflePuzzleQueue();
  }

  // Fisher-Yates shuffle algorithm
  function shufflePuzzleQueue() {
    puzzleQueue = [...PUZZLES];
    for (let i = puzzleQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [puzzleQueue[i], puzzleQueue[j]] = [puzzleQueue[j], puzzleQueue[i]];
    }
    currentPuzzleIndex = 0;
  }

  // Get next puzzle from queue, reshuffle if exhausted
  function getNextPuzzle() {
    if (currentPuzzleIndex >= puzzleQueue.length) {
      shufflePuzzleQueue();
    }
    return puzzleQueue[currentPuzzleIndex++];
  }

  // Helper functions
  function setTimer(value) {
    timer = Math.max(0, Math.min(value, 120));
    $timer.textContent = timer;
  }

  function setRunningState(running) {
    isRunning = running;
    $btnStart.textContent = running ? "Restart" : "Start";
    if (running) {
      enableGameControls();
    } else {
      disableGameControls();
    }
  }

  function setGameOverState(gameOver) {
    isGameOver = gameOver;
    if (gameOver) {
      $msg.textContent = `🕹️ GAME OVER · Score: ${score} — Click Start to play again`;
      disableGameControls();
    }
  }

  function enableGameControls() {
    $btnGuess.disabled = false;
    $btnHint.disabled = false;
    $btnSkip.disabled = false;
    $guess.disabled = false;
  }

  function disableGameControls() {
    $btnGuess.disabled = true;
    $btnHint.disabled = true;
    $btnSkip.disabled = true;
    $guess.disabled = true;
  }

  function updateUI() {
    $score.textContent = score;
    $streak.textContent = streak;
    $timer.textContent = timer;
  }

  function startTimer() {
    if (tickId) clearInterval(tickId);
    
    tickId = setInterval(() => {
      setTimer(timer - 1);
      
      if (timer <= 0) {
        clearInterval(tickId);
        tickId = null;
        setRunningState(false);
        setGameOverState(true);
      }
    }, 1000);
  }

  function startRound() {
    current = getNextPuzzle();
    attempts = 0;
    $emojis.textContent = current.emojis;
    $msg.textContent = "";
    $msg.classList.remove("glow");
    $guess.value = "";
    $guess.focus();
  }

  function nextRound() {
    if (!isRunning) return;
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
    
    updateUI();
    localStorage.setItem("emojiGameScore", score);
    localStorage.setItem("emojiGameStreak", streak);
  }

  function handleGuess() {
    if (!isRunning || isGameOver) return;
    
    const userGuess = $guess.value.trim().toLowerCase();
    
    if (userGuess === current.answer) {
      setTimer(timer + 5); // Add 5 seconds for correct answer
      $msg.textContent = "✅ Correct!";
      $msg.classList.add("glow");
      updateScore(true);
      nextRound();
      return;
    }

    attempts++;
    setTimer(timer - 3); // Subtract 3 seconds for wrong answer
    updateScore(false);
    
    if (timer <= 0) {
      clearInterval(tickId);
      tickId = null;
      setRunningState(false);
      setGameOverState(true);
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
    if (!isRunning || isGameOver) return;
    $msg.textContent = `💡 Hint: ${current.hint}`;
    $btnHint.disabled = true;
    setTimeout(() => {
      if (isRunning) $btnHint.disabled = false;
    }, 1000);
  }

  function skipPuzzle() {
    if (!isRunning || isGameOver) return;
    $msg.textContent = "⏭️ Skipped.";
    nextRound();
  }

  function startGame() {
    // Reset game state
    score = 0;
    streak = 0;
    isGameOver = false;
    
    // Set timer from difficulty
    setTimer(DIFFICULTY[currentDifficulty].startTime);
    
    // Start game
    setRunningState(true);
    startRound();
    startTimer();
    
    // Update localStorage
    localStorage.setItem("emojiGameScore", score);
    localStorage.setItem("emojiGameStreak", streak);
  }

  function handleDifficultyChange() {
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
    if (selectedDifficulty !== currentDifficulty) {
      currentDifficulty = selectedDifficulty;
      localStorage.setItem("emojiGameDifficulty", currentDifficulty);
      
      // If game is running, restart with new difficulty
      if (isRunning) {
        startGame();
      }
    }
  }

  // Event listeners
  $btnStart.addEventListener("click", startGame);
  $btnGuess.addEventListener("click", handleGuess);
  $btnSkip.addEventListener("click", skipPuzzle);
  $guess.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && isRunning && !isGameOver) handleGuess();
  });

  // Difficulty change listener
  document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
    radio.addEventListener("change", handleDifficultyChange);
  });

  // Create hint button
  const hintButton = document.createElement("button");
  hintButton.id = "btnHint";
  hintButton.textContent = "Hint";
  hintButton.className = "btn";
  hintButton.style.cssText = `
    background-color: #9d4bff;
    color: #ffffff;
    border: none;
    padding: 10px 16px;
    font-size: 16px;
    border-radius: 6px;
    cursor: pointer;
    margin-left: 8px;
  `;
  hintButton.addEventListener("mouseenter", function() {
    this.style.backgroundColor = "#7c3aed";
  });
  hintButton.addEventListener("mouseleave", function() {
    this.style.backgroundColor = "#9d4bff";
  });
  hintButton.addEventListener("click", showHint);

  // Insert hint button after skip button
  if ($btnSkip && $btnSkip.parentNode) {
    $btnSkip.parentNode.insertBefore(hintButton, $btnSkip.nextSibling);
  }

  // Load puzzles and initialize
  loadPuzzles();
})();
