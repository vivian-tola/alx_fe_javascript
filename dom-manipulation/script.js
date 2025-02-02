document.addEventListener("DOMContentLoaded", () => {
    // Select DOM elements safely
    const quoteDisplay = document.getElementById("quoteDisplay");
    const newQuoteButton = document.getElementById("newQuote");
    const newQuoteText = document.getElementById("newQuoteText");
    const newQuoteCategory = document.getElementById("newQuoteCategory");
    const addQuoteButton = document.getElementById("addQuoteButton");

    if (!quoteDisplay || !newQuoteButton || !newQuoteText || !newQuoteCategory || !addQuoteButton) {
        console.error("Missing essential DOM elements. Please check your HTML structure.");
        return;
    }

    // Array of quotes
    const quotes = [
        { text: "The only way to do great work is to love what you do.", category: "Motivation" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" },
        { text: "Believe you can and you're halfway there.", category: "Inspiration" },
        { text: "Do what you can, with what you have, where you are.", category: "Productivity" }
    ];

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
    function createAddQuoteForm() {
        const text = newQuoteText.value.trim();
        const category = newQuoteCategory.value.trim();

        
        if (text === "" || category === "") {
            alert("Please enter both a quote and a category.");
            return;
        }

        quotes.push({ text, category });

        const quoteContainer = document.createElement("div")
        const quoteText = document.createElement("p");
        quoteText.textContent = `"${text}"`;


        const categoryText = document.createElement("small");
        categoryText.className = "quote-category";
        categoryText.textContent = `- ${category}`;
        quoteContainer.appendChild(quoteText);
        quoteContainer.appendChild(categoryText);

        // Add new quote to the array
  
        // Clear input fields
        newQuoteText.value = "";
        newQuoteCategory.value = "";

        alert("Quote added successfully!");
    }

    // Event listeners for button clicks
    newQuoteButton.addEventListener("click", showRandomQuote);
    addQuoteButton.addEventListener("click", createAddQuoteForm);

    // Display a random quote on page load
    showRandomQuote();
});
// Initialize quotes array from Local Storage, if any
let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

// Function to save quotes to Local Storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to add a new quote
function addQuote(newQuote) {
  quotes.push(newQuote);
  saveQuotes(); // Save quotes to local storage
  displayQuotes();
}

// Function to display quotes (UI)
function displayQuotes() {
  const quoteList = document.getElementById('quoteList');
  quoteList.innerHTML = '';
  quotes.forEach((quote) => {
    const li = document.createElement('li');
    li.textContent = quote;
    quoteList.appendChild(li);
  });
}

// Load quotes when the page initializes
document.addEventListener('DOMContentLoaded', displayQuotes);
// Function to export quotes to a JSON file
function exportToJson() {
    const jsonContent = JSON.stringify(quotes, null, 2); // Pretty print JSON
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json'; // Default filename
    a.click(); // Trigger the download
    URL.revokeObjectURL(url); // Clean up the URL
  }
  
  // Example: Add a button for export
  const exportButton = document.getElementById('exportButton');
  exportButton.addEventListener('click', exportToJson);
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
  }
   // Sample quotes with categories
  let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "Believe in yourself", category: "Motivational" },
    { text: "Never give up", category: "Motivational" },
    { text: "The only limit is your mind", category: "Inspirational" },
    { text: "Stay focused", category: "Productivity" }
  ];

  function populateCategories() {
    const categoryFilter = document.getElementById('categorySelect');
    const categories = [...new Set(quotes.map(quote => quote.category))];
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }

  function filterQuotes() {
    const selectedCategory = document.getElementById('categorySelect').value;
    const filteredQuotes = selectedCategory
      ? quotes.filter(quote => quote.category === selectedCategory)
      : quotes;
    displayQuotes(filteredQuotes);
  }

  function displayQuotes(filteredQuotes) {
    const quoteList = document.getElementById('quoteList');
    quoteList.innerHTML = '';
    filteredQuotes.forEach(quote => {
      const li = document.createElement('li');
      li.textContent = `${quote.text} (${quote.category})`;
      quoteList.appendChild(li);
    });
  }

  function saveSelectedCategory(category) {
    localStorage.setItem('selectedCategory', category);
  }

  function loadSelectedCategory() {
    const lastCategory = localStorage.getItem('selectedCategory');
    if (lastCategory) {
      document.getElementById('categorySelect').value = lastCategory;
      filterQuotes();
    }
  }

  function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    saveSelectedCategory(document.getElementById('categorySelect').value);
  }

  function addQuote(newQuote) {
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();
  }

  document.getElementById('categorySelect').addEventListener('change', filterQuotes);

  document.addEventListener('DOMContentLoaded', () => {
    populateCategories();
    loadSelectedCategory();
  });

  