const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const translateButton = document.getElementById("translateButton");
const swapButton = document.getElementById("swapButton");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");
const charCount = document.getElementById("charCount");
const directionLabel = document.getElementById("directionLabel");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const historyBox = document.getElementById("history");
const clearHistoryButton = document.getElementById("clearHistory");
const sourceLanguage = document.getElementById("sourceLanguage");
const targetLanguage = document.getElementById("targetLanguage");

let direction = "en-es";

let history = JSON.parse(
  localStorage.getItem("qvacTranslatorHistory") || "[]"
);

function updateLanguageUI() {
  if (direction === "en-es") {
    sourceLanguage.textContent = "English";
    targetLanguage.textContent = "Spanish";
    directionLabel.textContent = "English → Spanish";
  } else {
    sourceLanguage.textContent = "Spanish";
    targetLanguage.textContent = "English";
    directionLabel.textContent = "Spanish → English";
  }
}

function updateCharacterCount() {
  charCount.textContent = `${inputText.value.length} / 2000`;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
}

function renderHistory() {
  if (history.length === 0) {
    historyBox.innerHTML = `
      <div class="empty-history">
        Your recent translations will appear here.
      </div>
    `;
    return;
  }

  historyBox.innerHTML = history
    .map(
      (item) => `
        <div class="history-item">
          <div class="history-source">
            ${escapeHtml(item.source)}
          </div>
          <div class="history-result">
            ${escapeHtml(item.result)}
          </div>
        </div>
      `
    )
    .join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveHistory(source, result) {
  history.unshift({
    source,
    result
  });

  history = history.slice(0, 8);

  localStorage.setItem(
    "qvacTranslatorHistory",
    JSON.stringify(history)
  );

  renderHistory();
}

async function translateText() {
  const text = inputText.value.trim();

  hideError();

  if (!text) {
    showError("Please enter some text first.");
    inputText.focus();
    return;
  }

  translateButton.disabled = true;
  loading.classList.remove("hidden");

  outputText.textContent = "Translating...";

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        direction
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Translation failed.");
    }

    outputText.textContent = data.translation;

    saveHistory(text, data.translation);
  } catch (error) {
    outputText.textContent =
      "Your translation will appear here.";

    showError(error.message);
  } finally {
    translateButton.disabled = false;
    loading.classList.add("hidden");
  }
}

swapButton.addEventListener("click", () => {
  direction = direction === "en-es" ? "es-en" : "en-es";

  const oldInput = inputText.value;
  const oldOutput =
    outputText.textContent === "Your translation will appear here."
      ? ""
      : outputText.textContent;

  inputText.value = oldOutput || oldInput;

  outputText.textContent =
    "Your translation will appear here.";

  updateLanguageUI();
  updateCharacterCount();
  hideError();
});

clearButton.addEventListener("click", () => {
  inputText.value = "";
  outputText.textContent =
    "Your translation will appear here.";

  updateCharacterCount();
  hideError();
  inputText.focus();
});

copyButton.addEventListener("click", async () => {
  const text = outputText.textContent;

  if (
    !text ||
    text === "Your translation will appear here." ||
    text === "Translating..."
  ) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);

    const original = copyButton.textContent;
    copyButton.textContent = "Copied!";

    setTimeout(() => {
      copyButton.textContent = original;
    }, 1200);
  } catch {
    showError("Could not copy the translation.");
  }
});

clearHistoryButton.addEventListener("click", () => {
  history = [];

  localStorage.removeItem("qvacTranslatorHistory");

  renderHistory();
});

inputText.addEventListener("input", updateCharacterCount);

translateButton.addEventListener("click", translateText);

inputText.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "Enter") {
    translateText();
  }
});

updateLanguageUI();
updateCharacterCount();
renderHistory();