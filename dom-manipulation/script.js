// Mock API URL
const MOCK_API_URL = 'https://jsonplaceholder.typicode.com/posts';

document.addEventListener("DOMContentLoaded", () => {
    // Select DOM elements safely
    const quoteDisplay = document.getElementById("quoteDisplay");
    const newQuoteButton = document.getElementById("newQuote");
    const newQuoteText = document.getElementById("newQuoteText");
    const newQuoteCategory = document.getElementById("newQuoteCategory");
    const addQuoteButton = document.getElementById("addQuoteButton");
    const notificationArea = document.getElementById("notificationArea");
    const syncButton = document.getElementById("syncButton");

    if (!quoteDisplay || !newQuoteButton || !newQuoteText || !newQuoteCategory || !addQuoteButton) {
        console.error("Missing essential DOM elements. Please check your HTML structure.");
        return;
    }

    // Initialize quotes array from Local Storage, if any
    let quotes = JSON.parse(localStorage.getItem('quotes')) || [
        { text: "Believe in yourself", category: "Motivational", id: "local-1", timestamp: Date.now() },
        { text: "Never give up", category: "Motivational", id: "local-2", timestamp: Date.now() },
        { text: "The only limit is your mind", category: "Inspirational", id: "local-3", timestamp: Date.now() }
    ];

    // Function to fetch quotes from mock API
    async function fetchQuotesFromServer() {
        try {
            const response = await fetch(MOCK_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Transform server data to match our quote format
            const serverQuotes = data.map(post => ({
                id: `server-${post.id}`,
                text: post.title,
                category: 'Server',
                timestamp: Date.now()
            }));

            console.log('Fetched server quotes:', serverQuotes);
            return serverQuotes;
        } catch (error) {
            console.error('Error fetching quotes from server:', error);
            showNotification('Failed to fetch quotes from server', 'error');
            return [];
        }
    }

    // Function to sync with server
    async function syncWithServer() {
        showNotification('Syncing with server...', 'info');
        
        try {
            const serverQuotes = await fetchQuotesFromServer();
            if (serverQuotes.length > 0) {
                await resolveConflicts(serverQuotes);
                showNotification('Sync completed successfully', 'success');
            }
        } catch (error) {
            console.error('Sync failed:', error);
            showNotification('Sync failed. Please try again later.', 'error');
        }
    }

    // Function to resolve conflicts between local and server data
    function resolveConflicts(serverQuotes) {
        const mergedQuotes = [...quotes];
        
        serverQuotes.forEach(serverQuote => {
            const localIndex = mergedQuotes.findIndex(local => local.id === serverQuote.id);
            
            if (localIndex === -1) {
                // New quote from server
                mergedQuotes.push(serverQuote);
            } else if (serverQuote.timestamp > mergedQuotes[localIndex].timestamp) {
                // Server version is newer
                mergedQuotes[localIndex] = serverQuote;
            }
            // If local is newer, keep local version
        });

        quotes = mergedQuotes;
        saveToLocalStorage();
        displayQuotes();
        showNotification('Quotes updated with server data', 'success');
    }

    // Function to display notification
    function showNotification(message, type = 'info') {
        notificationArea.textContent = message;
        notificationArea.className = `notification ${type}`;
        setTimeout(() => {
            notificationArea.textContent = '';
            notificationArea.className = 'notification';
        }, 5000);
    }

    // Function to display a random quote
    function showRandomQuote() {
        if (quotes.length === 0) {
            quoteDisplay.innerHTML = "<p>No quotes available.</p>";
            return;
        }

        const randomIndex = Math.floor(Math.random() * quotes.length);
        const { text, category } = quotes[randomIndex];
        quoteDisplay.innerHTML = `<p>"${text}"</p><small>- ${category}</small>`;
    }

    // Function to add a new quote
    function addQuote() {
        const text = newQuoteText.value.trim();
        const category = newQuoteCategory.value.trim();

        if (text === "" || category === "") {
            showNotification("Please enter both a quote and a category.", "error");
            return;
        }

        const newQuote = {
            id: `local-${Date.now()}`,
            text,
            category,
            timestamp: Date.now()
        };

        quotes.push(newQuote);
        saveToLocalStorage();
        displayQuotes();

        newQuoteText.value = "";
        newQuoteCategory.value = "";
        showNotification("Quote added successfully!", "success");
    }

    // Function to save quotes to Local Storage
    function saveToLocalStorage() {
        localStorage.setItem('quotes', JSON.stringify(quotes));
    }

    // Function to display all quotes
    function displayQuotes() {
        const quoteList = document.getElementById('quoteList');
        if (!quoteList) return;

        quoteList.innerHTML = '';
        quotes.forEach(quote => {
            const li = document.createElement('li');
            li.textContent = `"${quote.text}" - ${quote.category}`;
            quoteList.appendChild(li);
        });
    }

    // Event listeners
    newQuoteButton.addEventListener("click", showRandomQuote);
    addQuoteButton.addEventListener("click", addQuote);
    if (syncButton) {
        syncButton.addEventListener("click", syncWithServer);
    }

    // Initialize the app
    displayQuotes();
    showRandomQuote();

    // Start periodic sync (every 30 seconds)
    setInterval(syncWithServer, 30000);

    // Initial sync
    syncWithServer().catch(console.error);

    // Export functionality
    const exportButton = document.getElementById('exportButton');
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            const jsonContent = JSON.stringify(quotes, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'quotes.json';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // Import functionality
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedQuotes = JSON.parse(e.target.result);
                    quotes = [...quotes, ...importedQuotes];
                    saveToLocalStorage();
                    displayQuotes();
                    showNotification('Quotes imported successfully!', 'success');
                } catch (error) {
                    showNotification('Error importing quotes. Please check the file format.', 'error');
                }
            };
            reader.readAsText(file);
        });
    }

    // Category filter functionality
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) {
        function updateCategoryFilter() {
            const categories = [...new Set(quotes.map(quote => quote.category))];
            categorySelect.innerHTML = '<option value="">All Categories</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        }

        categorySelect.addEventListener('change', () => {
            const selectedCategory = categorySelect.value;
            const filteredQuotes = selectedCategory
                ? quotes.filter(quote => quote.category === selectedCategory)
                : quotes;
            displayQuotes(filteredQuotes);
        });

        updateCategoryFilter();
    }
});