document.addEventListener("DOMContentLoaded", () => {
  // Select DOM elements safely
  const quoteDisplay = document.getElementById("quoteDisplay");
  const newQuoteButton = document.getElementById("newQuote");
  const newQuoteText = document.getElementById("newQuoteText");
  const newQuoteCategory = document.getElementById("newQuoteCategory");
  const addQuoteButton = document.getElementById("addQuoteButton");
  const notificationArea = document.getElementById("notificationArea");
  const syncButton = document.getElementById("syncButton");

  // Initialize quotes array from Local Storage
  let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    {
      text: "Believe in yourself",
      category: "Motivational",
      id: "local-1",
      timestamp: Date.now(),
    },
    {
      text: "Never give up",
      category: "Motivational",
      id: "local-2",
      timestamp: Date.now(),
    },
  ];

  // Function to fetch quotes from server
  async function fetchQuotesFromServer() {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      return data.map((post) => ({
        id: `server-${post.id}`,
        text: post.title,
        category: "Server",
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error("Error fetching quotes:", error);
      showNotification("Failed to fetch quotes from server", "error");
      return [];
    }
  }

  // Function to post new quote to server
  async function postQuoteToServer(quote) {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: quote.text,
            body: quote.category,
            userId: 1, // Required by JSONPlaceholder
          }),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log("Successfully posted to server:", data);
      showNotification("Quote successfully synced to server", "success");
      return data;
    } catch (error) {
      console.error("Error posting quote:", error);
      showNotification("Failed to sync quote to server", "error");
      return null;
    }
  }

  // Function to update quote on server
  async function updateQuoteOnServer(quote) {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${quote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: quote.text,
            body: quote.category,
            userId: 1,
          }),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log("Successfully updated on server:", data);
      showNotification("Quote successfully updated on server", "success");
      return data;
    } catch (error) {
      console.error("Error updating quote:", error);
      showNotification("Failed to update quote on server", "error");
      return null;
    }
  }

  // Function to delete quote from server
  async function deleteQuoteFromServer(quoteId) {
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${quoteId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      showNotification("Quote successfully deleted from server", "success");
      return true;
    } catch (error) {
      console.error("Error deleting quote:", error);
      showNotification("Failed to delete quote from server", "error");
      return false;
    }
  }

  // Function to sync with server
  async function syncQuotes() {
    showNotification("Syncing with server...", "info");

    try {
      // Get server quotes
      const serverQuotes = await fetchQuotesFromServer();

      // Find quotes that need to be synced to server
      const unsyncedQuotes = quotes.filter(
        (quote) => quote.id.startsWith("local-") && !quote.synced
      );

      // Sync unsynced quotes to server
      for (const quote of unsyncedQuotes) {
        const serverResponse = await postQuoteToServer(quote);
        if (serverResponse) {
          quote.id = `server-${serverResponse.id}`;
          quote.synced = true;
        }
      }

      // Merge server quotes with local quotes
      await resolveConflicts(serverQuotes);
      showNotification("Sync completed successfully", "success");

      // Save updated quotes to local storage
      saveToLocalStorage();
      displayQuotes();
    } catch (error) {
      console.error("Sync failed:", error);
      showNotification("Sync failed. Please try again later.", "error");
    }
  }

  // Function to resolve conflicts
  function resolveConflicts(serverQuotes) {
    const mergedQuotes = [...quotes];

    serverQuotes.forEach((serverQuote) => {
      const localIndex = mergedQuotes.findIndex(
        (local) => local.id === serverQuote.id
      );

      if (localIndex === -1) {
        // New quote from server
        mergedQuotes.push(serverQuote);
      } else if (serverQuote.timestamp > mergedQuotes[localIndex].timestamp) {
        // Server version is newer
        mergedQuotes[localIndex] = serverQuote;
      }
    });

    quotes = mergedQuotes;
  }

  // Function to add a new quote
  async function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (!text || !category) {
      showNotification("Please enter both a quote and a category.", "error");
      return;
    }

    const newQuote = {
      id: `local-${Date.now()}`,
      text,
      category,
      timestamp: Date.now(),
      synced: false,
    };

    // Try to post to server immediately
    const serverResponse = await postQuoteToServer(newQuote);
    if (serverResponse) {
      newQuote.id = `server-${serverResponse.id}`;
      newQuote.synced = true;
    }

    quotes.push(newQuote);
    saveToLocalStorage();
    displayQuotes();
    showRandomQuote();

    newQuoteText.value = "";
    newQuoteCategory.value = "";
    showNotification("Quote added successfully!", "success");
  }

  // Display notification
  function showNotification(message, type = "info") {
    notificationArea.textContent = message;
    notificationArea.className = `notification ${type}`;
    setTimeout(() => {
      notificationArea.textContent = "";
      notificationArea.className = "notification";
    }, 5000);
  }

  // Show random quote
  function showRandomQuote() {
    if (quotes.length === 0) {
      quoteDisplay.innerHTML = "<p>No quotes available.</p>";
      return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const { text, category } = quotes[randomIndex];
    quoteDisplay.innerHTML = `<p>"${text}"</p><small>- ${category}</small>`;
  }

  // Save to local storage
  function saveToLocalStorage() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }

  // Display quotes
  function displayQuotes() {
    const quoteList = document.getElementById("quoteList");
    if (!quoteList) return;

    quoteList.innerHTML = "";
    quotes.forEach((quote) => {
      const li = document.createElement("li");
      li.textContent = `"${quote.text}" - ${quote.category} ${
        quote.synced ? "✓" : "🔄"
      }`;
      quoteList.appendChild(li);
    });
  }

  // Event listeners
  newQuoteButton.addEventListener("click", showRandomQuote);
  addQuoteButton.addEventListener("click", addQuote);
  if (syncButton) {
    syncButton.addEventListener("click", syncQuotes);
  }

  // Initialize
  displayQuotes();
  showRandomQuote();

  // Start periodic sync
  setInterval(syncQuotes, 30000);

  // Initial sync
  syncQuotes().catch(console.error);
});
