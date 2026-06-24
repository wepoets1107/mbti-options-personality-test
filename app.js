const state = {
  index: 0,
  answers: [],
};

const home = document.querySelector("#home");
const quiz = document.querySelector("#quiz");
const result = document.querySelector("#result");
const gallery = document.querySelector("#gallery");
const progressBar = document.querySelector("#progressBar");
const progressText = document.querySelector("#progressText");
const questionAxis = document.querySelector("#questionAxis");
const questionText = document.querySelector("#questionText");
const answerA = document.querySelector("#answerA");
const answerB = document.querySelector("#answerB");
const resultVisual = document.querySelector("#resultVisual");
const ASSET_VERSION = "20260624-1515";

function versionedAsset(src) {
  if (!src) return src;
  const joiner = src.includes("?") ? "&" : "?";
  return `${src}${joiner}v=${ASSET_VERSION}`;
}

function show(section) {
  [home, quiz, result].forEach((item) => item.classList.add("hidden"));
  section.classList.remove("hidden");
}

function startQuiz() {
  state.index = 0;
  state.answers = [];
  show(quiz);
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderQuestion() {
  const question = QUESTIONS[state.index];
  const progress = ((state.index + 1) / QUESTIONS.length) * 100;
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `${state.index + 1} / ${QUESTIONS.length}`;
  questionAxis.textContent = question.axis;
  questionText.textContent = question.text;
  answerA.textContent = question.a.text;
  answerB.textContent = question.b.text;
}

function choose(optionKey) {
  const question = QUESTIONS[state.index];
  state.answers[state.index] = question[optionKey].letter;
  if (state.index < QUESTIONS.length - 1) {
    state.index += 1;
    renderQuestion();
    return;
  }
  renderResult();
}

function goBack() {
  if (state.index === 0) {
    show(home);
    return;
  }
  state.index -= 1;
  renderQuestion();
}

function countLetters() {
  const score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  state.answers.forEach((letter) => {
    score[letter] += 1;
  });
  return score;
}

function resolveType() {
  const score = countLetters();
  return [
    score.E >= score.I ? "E" : "I",
    score.S >= score.N ? "S" : "N",
    score.T >= score.F ? "T" : "F",
    score.J >= score.P ? "J" : "P",
  ].join("");
}

function makeFallbackCard(personality, compact = false) {
  const card = document.createElement("article");
  card.className = compact ? "mini-card fallback-card" : "personality-card fallback-card";
  card.style.setProperty("--accent", personality.color);
  card.innerHTML = `
    <div class="card-frame">
      <p class="card-type">${personality.type} ${personality.name}</p>
      <div class="card-traits">${personality.traits.join("｜")}</div>
      <div class="card-orbit" aria-hidden="true">
        <span>Δ</span><span>Γ</span><span>Θ</span><span>V</span>
      </div>
      <div class="card-strategy">
        <span>本命期权策略</span>
        <strong>${personality.strategy}</strong>
      </div>
      <p class="card-line">${personality.line}</p>
      <p class="card-risk">风险提醒：${personality.risk}</p>
    </div>
  `;
  return card;
}

function renderResult() {
  const type = resolveType();
  const personality = PERSONALITIES[type];
  document.querySelector("#resultTitle").textContent = `${personality.type} ${personality.name}`;
  document.querySelector("#resultSubtitle").textContent = personality.line;
  document.querySelector("#resultTraits").textContent = personality.traits.join("｜");
  document.querySelector("#resultStrategy").textContent = personality.strategy;
  document.querySelector("#resultRisk").textContent = personality.risk;
  document.querySelector("#resultNote").textContent = personality.note;

  resultVisual.innerHTML = "";
  if (personality.image) {
    const image = document.createElement("img");
    image.src = versionedAsset(personality.image);
    image.alt = `${personality.type} ${personality.name} ${personality.strategy}`;
    image.className = "result-image";
    image.addEventListener("error", () => {
      resultVisual.innerHTML = "";
      resultVisual.appendChild(makeFallbackCard(personality));
    });
    resultVisual.appendChild(image);
  } else {
    resultVisual.appendChild(makeFallbackCard(personality));
  }

  show(result);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderGallery() {
  const grid = document.querySelector("#galleryGrid");
  grid.innerHTML = "";
  Object.values(PERSONALITIES).forEach((personality) => {
    const item = document.createElement("button");
    item.className = "gallery-item";
    item.type = "button";
    item.style.setProperty("--accent", personality.color);
    item.innerHTML = personality.image
      ? `<img src="${versionedAsset(personality.image)}" alt="${personality.type} ${personality.name}" loading="lazy" />
         <span>${personality.type}</span>
         <strong>${personality.name}</strong>
         <small>${personality.strategy}</small>`
      : `<span>${personality.type}</span>
         <strong>${personality.name}</strong>
         <small>${personality.strategy}</small>`;
    item.addEventListener("click", () => {
      state.answers = [];
      resultVisual.innerHTML = "";
      document.querySelector("#resultTitle").textContent = `${personality.type} ${personality.name}`;
      document.querySelector("#resultSubtitle").textContent = personality.line;
      document.querySelector("#resultTraits").textContent = personality.traits.join("｜");
      document.querySelector("#resultStrategy").textContent = personality.strategy;
      document.querySelector("#resultRisk").textContent = personality.risk;
      document.querySelector("#resultNote").textContent = personality.note;
      if (personality.image) {
        const image = document.createElement("img");
        image.src = versionedAsset(personality.image);
        image.alt = `${personality.type} ${personality.name}`;
        image.className = "result-image";
        image.addEventListener("error", () => {
          resultVisual.innerHTML = "";
          resultVisual.appendChild(makeFallbackCard(personality));
        });
        resultVisual.appendChild(image);
      } else {
        resultVisual.appendChild(makeFallbackCard(personality));
      }
      show(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    grid.appendChild(item);
  });
}

document.querySelector("#startButton").addEventListener("click", startQuiz);
document.querySelector("#galleryButton").addEventListener("click", () => gallery.scrollIntoView({ behavior: "smooth" }));
document.querySelector("#backButton").addEventListener("click", goBack);
document.querySelector("#answerA").addEventListener("click", () => choose("a"));
document.querySelector("#answerB").addEventListener("click", () => choose("b"));
document.querySelector("#restartButton").addEventListener("click", startQuiz);
document.querySelector("#scrollGalleryButton").addEventListener("click", () => gallery.scrollIntoView({ behavior: "smooth" }));

renderGallery();
