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
    function addQuote() {
        const text = newQuoteText.value.trim();
        const category = newQuoteCategory.value.trim();

        if (text === "" || category === "") {
            alert("Please enter both a quote and a category.");
            return;
        }

        // Add new quote to the array
        quotes.push({ text, category });

        // Clear input fields
        newQuoteText.value = "";
        newQuoteCategory.value = "";

        alert("Quote added successfully!");
    }

    // Event listeners for button clicks
    newQuoteButton.addEventListener("click", showRandomQuote);
    addQuoteButton.addEventListener("click", addQuote);

    // Display a random quote on page load
    showRandomQuote();
});

  