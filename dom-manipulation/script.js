document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements

  const quoteDisplay = document.getElementById("quoteDisplay");
  const newQuoteButton = document.getElementById("newQuote");
  const newQuoteText = document.getElementById("newQuoteText");
  const newQuoteCategory = document.getElementById("newQuoteCategory");
  const addQuoteButton = document.getElementById("addQuoteButton");
  const syncButton = document.getElementById("syncButton");
  const syncStatus = document.getElementById("syncStatus");
  const categorySelect = document.getElementById("categorySelect");
  const quoteList = document.getElementById("quoteList");
  const notificationArea = document.getElementById("notificationArea");
  const exportButton = document.getElementById("exportButton");
  const importFile = document.getElementById("importFile");

  // Initialize quotes array
  let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    {
      text: "Believe in yourself",
      category: "Motivational",
      id: "local-1",
      lastUpdated: Date.now(),
    },
    {
      text: "Never give up",
      category: "Motivational",
      id: "local-2",
      lastUpdated: Date.now(),
    },
    {
      text: "The only limit is your mind",
      category: "Inspirational",
      id: "local-3",
      lastUpdated: Date.now(),
    },
  ];

  // Mock API Configuration
  const API_CONFIG = {
    baseUrl: "https://jsonplaceholder.typicode.com",
    endpoints: {
      quotes: "/posts",
      sync: "/posts",
    },
  };

  // Sync Status Tracker
  let lastSyncTime = localStorage.getItem("lastSyncTime") || null;
  let isSyncing = false;

  // ====== Core Functions ======

  async function syncWithServer() {
    if (isSyncing) return;

    try {
      isSyncing = true;
      updateSyncStatus("Syncing...", "pending");

      const serverQuotes = await fetchQuotesFromServer();
      await resolveConflicts(serverQuotes);

      lastSyncTime = Date.now();
      localStorage.setItem("lastSyncTime", lastSyncTime);

      updateSyncStatus(
        "Last synced: " + new Date(lastSyncTime).toLocaleString(),
        "success"
      );
      notifyUser("Sync completed successfully");
    } catch (error) {
      console.error("Sync failed:", error);
      updateSyncStatus("Sync failed. Will retry later.", "error");
      notifyUser("Failed to sync with server", "error");
    } finally {
      isSyncing = false;
    }
  }

  async function fetchQuotesFromServer() {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.quotes}`
    );
    if (!response.ok) throw new Error("Failed to fetch from server");

    const serverData = await response.json();
    return serverData.map((item) => ({
      id: `server-${item.id}`,
      text: item.title,
      category: "Server",
      lastUpdated: Date.now(),
    }));
  }

  async function resolveConflicts(serverQuotes) {
    const mergedQuotes = [...quotes];

    serverQuotes.forEach((serverQuote) => {
      const localIndex = mergedQuotes.findIndex(
        (local) => local.id === serverQuote.id
      );

      if (localIndex === -1) {
        // New quote from server
        mergedQuotes.push(serverQuote);
      } else if (
        serverQuote.lastUpdated > mergedQuotes[localIndex].lastUpdated
      ) {
        // Server version is newer
        mergedQuotes[localIndex] = serverQuote;
      }
      // If local is newer, keep local version
    });

    quotes = mergedQuotes;
    saveToLocalStorage();
    updateUI();
  }

  // ====== UI Functions ======

  function showRandomQuote() {
    if (quotes.length === 0) {
      quoteDisplay.innerHTML = "<p>No quotes available.</p>";
      return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const { text, category } = quotes[randomIndex];
    quoteDisplay.innerHTML = `<p>"${text}"</p><small>- ${category}</small>`;
  }

  function updateSyncStatus(message, status) {
    syncStatus.textContent = message;
    syncStatus.className = `sync-status sync-${status}`;
  }

  function notifyUser(message, type = "info") {
    notificationArea.textContent = message;
    notificationArea.className = `notification ${type}`;
    setTimeout(() => {
      notificationArea.textContent = "";
      notificationArea.className = "notification";
    }, 5000);
  }

  function updateUI() {
    populateCategories();
    displayQuotes();
    showRandomQuote();
  }

  // ====== Event Handlers ======

  function handleAddQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (!text || !category) {
      notifyUser("Please enter both quote and category", "error");
      return;
    }

    const newQuote = {
      id: `local-${Date.now()}`,
      text,
      category,
      lastUpdated: Date.now(),
    };

    quotes.push(newQuote);
    saveToLocalStorage();
    updateUI();

    newQuoteText.value = "";
    newQuoteCategory.value = "";
    notifyUser("Quote added successfully");
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quotes-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedQuotes = JSON.parse(e.target.result);
        quotes = [...quotes, ...importedQuotes];
        saveToLocalStorage();
        updateUI();
        notifyUser("Quotes imported successfully");
      } catch (error) {
        notifyUser("Failed to import quotes", "error");
      }
    };
    reader.readAsText(file);
  }

  // ====== Utility Functions ======

  function saveToLocalStorage() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }

  function populateCategories() {
    const categories = [...new Set(quotes.map((quote) => quote.category))];
    categorySelect.innerHTML = '<option value="">All Categories</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
  }

  function displayQuotes() {
    const selectedCategory = categorySelect.value;
    const filteredQuotes = selectedCategory
      ? quotes.filter((quote) => quote.category === selectedCategory)
      : quotes;

    quoteList.innerHTML = "";
    filteredQuotes.forEach((quote) => {
      const li = document.createElement("li");
      li.textContent = `"${quote.text}" - ${quote.category}`;
      quoteList.appendChild(li);
    });
  }

  // ====== Event Listeners ======

  newQuoteButton.addEventListener("click", showRandomQuote);
  addQuoteButton.addEventListener("click", handleAddQuote);
  syncButton.addEventListener("click", syncWithServer);
  exportButton.addEventListener("click", handleExport);
  importFile.addEventListener("change", handleImport);
  categorySelect.addEventListener("change", displayQuotes);

  // ====== Initialization ======

  updateUI();

  // Start periodic sync (every 30 seconds)
  setInterval(syncWithServer, 30000);

  // Initial sync
  syncWithServer();
});
