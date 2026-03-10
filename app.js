// =========================
// ANSWERS
// =========================
const ROOM1_ANSWER = btoa("sha" + "dow");
const ROOM2_ANSWER = btoa("ci" + "pher");

// Correct order: planet → star → moon
const CORRECT_SEQUENCE = ["cGxhbmV0", "c3Rhcg==", "bW9vbg=="];
let clickSequence = [];

// =========================
// TIMER
// =========================
function startTimer() {
    if (!localStorage.getItem("escapeStartTime")) {
        localStorage.setItem("escapeStartTime", Date.now().toString());
    }
}

function getElapsedSeconds() {
    const storedTime = parseInt(localStorage.getItem("escapeStartTime") || "0", 10);
    return storedTime ? Math.floor((Date.now() - storedTime) / 1000) : 0;
}

function formatTime(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById("timerDisplay");
    if (timerDisplay) {
        timerDisplay.textContent = `⏱ Time: ${formatTime(getElapsedSeconds())}`;
    }
}

function runTimer() {
    const timerDisplay = document.getElementById("timerDisplay");
    if (timerDisplay) {
        updateTimerDisplay();
        setInterval(updateTimerDisplay, 1000);
    }
}

// =========================
// PROGRESS
// =========================
function unlockLevel(level) {
    localStorage.setItem(`unlocked_${level}`, "true");
}

function isUnlocked(level) {
    return localStorage.getItem(`unlocked_${level}`) === "true";
}

function saveBestTime(seconds) {
    const previousBest = parseInt(localStorage.getItem("bestTime") || "999999", 10);
    if (seconds < previousBest) {
        localStorage.setItem("bestTime", seconds.toString());
    }
}

function getBestTime() {
    const bestTime = localStorage.getItem("bestTime");
    return bestTime ? formatTime(parseInt(bestTime, 10)) : "No record yet";
}

// =========================
// PAGE LOCK
// =========================
function checkPageAccess(requiredLevel) {
    if (!isUnlocked(requiredLevel)) {
        document.body.innerHTML = `
            <header class="site-header">
                <h1 class="logo">🔐 Escape<span>TheWeb</span></h1>
            </header>
            <div class="locked-msg">
                <p>🔒 This room is locked!</p>
                <p>You need to complete the previous room first.</p><br>
                <a href="index.html" class="locked-home-link">← Go back to Home</a><br><br>
                <small class="locked-small-note">If you believe this is an error, try resetting your progress from the home page.</small>
            </div>
        `;
        return false;
    }
    return true;
}

// =========================
// VALIDATION
// =========================
function validateCode(input, encodedAnswer) {
    return input.trim().toLowerCase() === atob(encodedAnswer).toLowerCase().trim();
}

function setFeedback(id, message, type) {
    const feedbackElement = document.getElementById(id);
    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.className = `feedback ${type}`;
    }
}

function showInputError(inputElement) {
    if (!inputElement) return;
    inputElement.classList.add("input-error");
    setTimeout(() => {
        inputElement.classList.remove("input-error");
    }, 1000);
}

// =========================
// ROOM 1 PUZZLES
// =========================
function handleSeqClick(id) {
    clickSequence.push(id);

    const selectedElement = document.getElementById(id);
    if (selectedElement) {
        selectedElement.classList.add("selected");
    }

    const expected = atob(CORRECT_SEQUENCE[clickSequence.length - 1]);

    if (id !== expected) {
        const allItems = document.querySelectorAll(".seq-item");
        allItems.forEach((item) => item.classList.add("wrong"));

        setTimeout(() => {
            allItems.forEach((item) => item.classList.remove("wrong", "selected"));
            clickSequence = [];
            setFeedback("seqFeedback", "❌ Wrong order! Try again.", "error");
        }, 800);

        return;
    }

    if (clickSequence.length === CORRECT_SEQUENCE.length) {
        setFeedback("seqFeedback", "✅ Sequence correct! Bonus clue unlocked below! 🎉", "success");
        const clueBox = document.getElementById("seqClueRevealed");
        if (clueBox) {
            clueBox.style.display = "block";
            clueBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }
}

function room1Submit() {
    const input = document.getElementById("room1Input");
    const submitButton = document.getElementById("room1SubmitBtn");

    if (!input) return;

    if (validateCode(input.value, ROOM1_ANSWER)) {
        unlockLevel("room2");
        setFeedback("room1Feedback", "✅ Correct! Unlocking Room 2... 🚪", "success");

        if (submitButton) {
            submitButton.disabled = true;
        }

        setTimeout(() => {
            window.location.href = "room2.html";
        }, 1600);
    } else {
        setFeedback("room1Feedback", "❌ That's not right. Keep searching for clues!", "error");
        showInputError(input);
    }
}

// =========================
// ROOM 2 PUZZLES
// =========================
function detectKeyPhrase(value) {
    const display = document.getElementById("keyDisplayText");

    if (display) {
        display.innerHTML = `⌨️ Typing... <span class="typing-dots">${"●".repeat(Math.min(value.length, 6))}</span>`;
    }

    if (value.trim().toLowerCase() === "decode") {
        setFeedback("keyFeedback", "✅ Keyboard challenge complete! Bonus clue revealed!", "success");

        const clue = document.getElementById("keyClueRevealed");
        if (clue) {
            clue.style.display = "block";
            clue.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        const input = document.getElementById("keyboardInput");
        if (input) {
            input.value = "";
        }
    } else if (value.length > 6) {
        const input = document.getElementById("keyboardInput");
        if (input) {
            input.value = "";
        }

        if (display) {
            display.innerHTML = `🖱️ Click here, then type: <strong>decode</strong>`;
        }

        setFeedback("keyFeedback", "❌ Wrong phrase. Try again.", "error");
    }
}

function room2Submit() {
    const input = document.getElementById("room2Input");
    const submitButton = document.getElementById("room2SubmitBtn");

    if (!input) return;

    if (validateCode(input.value, ROOM2_ANSWER)) {
        saveBestTime(getElapsedSeconds());
        unlockLevel("final");
        setFeedback("room2Feedback", "✅ Correct! You cracked the code! Escaping... 🏆", "success");

        if (submitButton) {
            submitButton.disabled = true;
        }

        setTimeout(() => {
            window.location.href = "final.html";
        }, 1600);
    } else {
        setFeedback("room2Feedback", "❌ Wrong code. Keep searching for clues!", "error");
        showInputError(input);
    }
}

// =========================
// RESET
// =========================
function resetProgress() {
    ["escapeStartTime", "unlocked_room2", "unlocked_final", "bestTime"].forEach((key) => {
        localStorage.removeItem(key);
    });

    const resetMessage = document.getElementById("resetMsg");
    if (resetMessage) {
        resetMessage.textContent = "✅ Progress reset! You can start fresh now.";
    }

    const bestTimeDisplay = document.getElementById("bestTimeDisplay");
    if (bestTimeDisplay) {
        bestTimeDisplay.textContent = "";
    }
}

function resetAndRestart() {
    resetProgress();
    window.location.href = "index.html";
}

// =========================
// LANDING PAGE
// =========================
function showBestTime() {
    const bestTimeElement = document.getElementById("bestTimeDisplay");
    const storedBestTime = localStorage.getItem("bestTime");

    if (bestTimeElement && storedBestTime) {
        bestTimeElement.textContent = `🏅 Your Best Time: ${formatTime(parseInt(storedBestTime, 10))}`;
    }
}

// =========================
// FINAL PAGE
// =========================
function setupFinalPage() {
    if (!document.getElementById("finalTime")) {
        return;
    }

    if (!checkPageAccess("final")) {
        return;
    }

    const elapsed = getElapsedSeconds();
    const finalTime = document.getElementById("finalTime");
    const finalBestTime = document.getElementById("finalBestTime");
    const starLabel = document.getElementById("starLabel");
    const starRating = document.getElementById("starRating");

    if (finalTime) {
        finalTime.textContent = `⏱ You completed it in: ${formatTime(elapsed)}`;
    }

    if (finalBestTime) {
        finalBestTime.textContent = `🏅 Best Time Ever: ${getBestTime()}`;
    }

    if (starLabel && starRating) {
        const star = (dimmed) => `<span class="star${dimmed ? " star-dim" : ""}">⭐</span>`;

        if (elapsed < 120) {
            starRating.innerHTML = star(false) + star(false) + star(false);
            starLabel.textContent = "🚀 Blazing fast! You're a true escape artist!";
        } else if (elapsed < 300) {
            starRating.innerHTML = star(false) + star(false) + star(true);
            starLabel.textContent = "👍 Great job! You solved it with skill!";
        } else {
            starRating.innerHTML = star(false) + star(true) + star(true);
            starLabel.textContent = "😅 You made it! Try again to beat your time.";
        }
    }
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", resetProgress);
    }

    const finalResetBtn = document.getElementById("finalResetBtn");
    if (finalResetBtn) {
        finalResetBtn.addEventListener("click", resetAndRestart);
    }

    const room1SubmitBtn = document.getElementById("room1SubmitBtn");
    if (room1SubmitBtn) {
        room1SubmitBtn.addEventListener("click", room1Submit);
    }

    const room1Input = document.getElementById("room1Input");
    if (room1Input) {
        startTimer();

        room1Input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                room1Submit();
            }
        });
    }

    const moon = document.getElementById("moon");
    const star = document.getElementById("star");
    const planet = document.getElementById("planet");

    if (moon) {
        moon.addEventListener("click", () => handleSeqClick("moon"));
    }

    if (star) {
        star.addEventListener("click", () => handleSeqClick("star"));
    }

    if (planet) {
        planet.addEventListener("click", () => handleSeqClick("planet"));
    }

    const room2Input = document.getElementById("room2Input");
    if (room2Input) {
        if (!checkPageAccess("room2")) {
            return;
        }

        room2Input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                room2Submit();
            }
        });
    }

    const room2SubmitBtn = document.getElementById("room2SubmitBtn");
    if (room2SubmitBtn) {
        room2SubmitBtn.addEventListener("click", room2Submit);
    }

    const keyListenerBox = document.getElementById("keyListenerBox");
    const keyboardInput = document.getElementById("keyboardInput");

    if (keyListenerBox && keyboardInput) {
        keyListenerBox.addEventListener("click", () => keyboardInput.focus());

        keyListenerBox.addEventListener("keydown", () => {
            keyboardInput.focus();
        });

        keyboardInput.addEventListener("input", () => {
            detectKeyPhrase(keyboardInput.value);
        });
    }

    showBestTime();
    runTimer();
    setupFinalPage();
});