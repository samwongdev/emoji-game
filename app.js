(function () {
  const EMOJI_PUZZLE = "🍎📱";
  const CORRECT_ANSWER = "iphone";

  const input = document.getElementById("guess");
  const button = document.getElementById("btn");
  const message = document.getElementById("msg");
  const emojis = document.getElementById("emojis");

  if (emojis && emojis.textContent !== EMOJI_PUZZLE) {
    emojis.textContent = EMOJI_PUZZLE;
  }

  function evaluateGuess() {
    const userGuess = (input?.value || "").trim().toLowerCase();
    if (userGuess === CORRECT_ANSWER) {
      message.textContent = "✅ Correct!";
    } else {
      message.textContent = "❌ Try again";
    }
  }

  button?.addEventListener("click", evaluateGuess);

  input?.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      evaluateGuess();
    }
  });
})();
