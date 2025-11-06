const ITEMS_PER_PAGE = 10;
let dictionaryData = [];
let filteredData = [];
let currentPage = 1;
let sortAscending = true;
let customFont = null; // For Google Font names
let localFont = null;  // For local .ttf files

async function loadDictionary(jsonUrl, options = {}) {
  try {
    const res = await fetch(jsonUrl);
    const data = await res.json();
    dictionaryData = data.Dictionary || [];
    filteredData = [...dictionaryData];

    if (options.customFont) {
      customFont = options.customFont;
      loadCustomFont(customFont);
    }

    if (options.localFontPath) {
      localFont = options.localFontPath;
      await loadLocalFont(localFont);
    }

    renderControls();
    renderPage();
    renderPagination();
  } catch (err) {
    console.error("Error loading dictionary:", err);
    document.body.innerHTML = "<p style='color:red'>Failed to load dictionary.</p>";
  }
}

function loadCustomFont(fontName) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;600&display=swap`;
  document.head.appendChild(link);
  document.body.style.fontFamily = `'${fontName}', sans-serif`;
}

async function loadLocalFont(fontPath) {
  try {
    const fontName = fontPath.split("/").pop().replace(".ttf", "");
    const fontFace = new FontFace(fontName, `url(${fontPath})`);
    await fontFace.load();
    document.fonts.add(fontFace);
    console.log(`Loaded local font: ${fontName}`);
    document.body.dataset.localFont = fontName;
  } catch (err) {
    console.error("Error loading local font:", err);
  }
}

function renderControls() {
  const controlsDiv = document.createElement("div");
  controlsDiv.className = "controls";

  // Search
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search for a word...";
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    filteredData = dictionaryData.filter(entry =>
      entry.Word.toLowerCase().includes(query) ||
      entry.Translation.toLowerCase().includes(query)
    );
    currentPage = 1;
    renderPage();
    renderPagination();
  });

  // Sorting Button
  const sortBtn = document.createElement("button");
  sortBtn.textContent = "Sort A–Z";
  sortBtn.addEventListener("click", () => {
    sortAscending = !sortAscending;
    filteredData.sort((a, b) =>
      sortAscending
        ? a.Word.localeCompare(b.Word)
        : b.Word.localeCompare(a.Word)
    );
    sortBtn.textContent = sortAscending ? "Sort A–Z" : "Sort Z–A";
    renderPage();
  });

  controlsDiv.appendChild(searchInput);
  controlsDiv.appendChild(sortBtn);
  document.body.appendChild(controlsDiv);
}

function renderPage() {
  const containerId = "dictionary-container";
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);
  }
  container.innerHTML = "";

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(start, end);

  const localFontName = document.body.dataset.localFont || customFont;

  currentItems.forEach(entry => {
    const card = document.createElement("div");
    card.className = "word-card";
    card.innerHTML = `
      <h3 class="word" style="${localFontName ? `font-family: '${localFontName}', sans-serif;` : ''}">
        ${entry.Word}
      </h3>
      <p><strong>Part of Speech:</strong> ${entry.PartOfSpeech}</p>
      <p><strong>Translation:</strong> ${entry.Translation}</p>
      ${
        entry.ExampleUsage
          ? `<p class="example" style="${localFontName ? `font-family: '${localFontName}', sans-serif;` : ''}">
              <em>${entry.ExampleUsage}</em>
            </p>`
          : ""
      }
      ${
        entry.ExampleUsageTranslated
          ? `<p class="example-translated"><em>(${entry.ExampleUsageTranslated})</em></p>`
          : ""
      }
      <hr>
    `;
    container.appendChild(card);
  });
}

function renderPagination() {
  const paginationId = "pagination";
  let pagination = document.getElementById(paginationId);
  if (!pagination) {
    pagination = document.createElement("div");
    pagination.id = paginationId;
    document.body.appendChild(pagination);
  }
  pagination.innerHTML = "";

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.addEventListener("click", () => {
      currentPage = i;
      renderPage();
      renderPagination();
    });
    pagination.appendChild(btn);
  }
}

// Example usage:
// loadDictionary("dictionary.json", { localFontPath: "fonts/MyFont.ttf" });
// OR: loadDictionary("dictionary.json", { customFont: "Noto Sans Arabic" });