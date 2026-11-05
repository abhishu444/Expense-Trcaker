
// Get HTML elements
const form = document.getElementById("transactionForm");

const description = document.getElementById("description");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const date = document.getElementById("date");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const balance = document.getElementById("balance");

const transactionList = document.getElementById("transactionList");
const emptyMessage = document.getElementById("emptyMessage");
const errorMessage = document.getElementById("errorMessage");
const filter = document.getElementById("filter");
const themeBtn = document.getElementById("themeBtn");

// Load saved transactions
let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];

// Set today's date
date.value = new Date().toISOString().split("T")[0];

// Format currency
function formatMoney(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(value);
}

// Save transactions
function saveData() {
    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}

// Add transaction
form.addEventListener("submit", function(event) {

    event.preventDefault();

    const desc = description.value.trim();
    const money = Number(amount.value);
    const selectedType = type.value;
    const selectedCategory = category.value;
    const selectedDate = date.value;

    // Validation
    if (
        desc === "" ||
        !Number.isFinite(money) ||
        money <= 0 ||
        selectedCategory === "" ||
        selectedDate === ""
    ) {
        errorMessage.textContent =
            "Please enter valid details in all fields.";
        return;
    }

    if (selectedDate > new Date().toISOString().split("T")[0]) {
        errorMessage.textContent =
            "Future dates are not allowed.";
        return;
    }

    errorMessage.textContent = "";

    // Create transaction object
    const transaction = {
        id: Date.now() + Math.random(),
        description: desc,
        amount: money,
        type: selectedType,
        category: selectedCategory,
        date: selectedDate
    };

    // Add transaction to array
    transactions.push(transaction);

    saveData();

    // Reset form
    form.reset();
    date.value = new Date().toISOString().split("T")[0];

    // Update dashboard
    updateDashboard();
});

// Update summary cards
function updateDashboard() {

    let income = 0;
    let expense = 0;

    transactions.forEach(function(item) {

        if (item.type === "income") {
            income = income + item.amount;
        } else {
            expense = expense + item.amount;
        }

    });

    totalIncome.textContent = formatMoney(income);
    totalExpense.textContent = formatMoney(expense);
    balance.textContent = formatMoney(income - expense);

    displayTransactions();
}

// Display transactions
function displayTransactions() {

    transactionList.innerHTML = "";

    // Apply filter
    const selectedFilter = filter.value;

    const filteredTransactions = transactions.filter(function(item) {
        return selectedFilter === "all" ||
            item.type === selectedFilter;
    });

    // Empty state
    emptyMessage.style.display =
        filteredTransactions.length === 0 ? "block" : "none";

    // Show latest transaction first
    const sortedTransactions = [...filteredTransactions].reverse();

    sortedTransactions.forEach(function(item) {

        const row = document.createElement("div");
        row.className = "transaction-item";

        const info = document.createElement("div");
        info.className = "transaction-info";

        const title = document.createElement("h3");
        title.textContent = item.description;

        const details = document.createElement("p");
        details.textContent =
            item.category + " • " + item.date;

        info.append(title, details);

        const right = document.createElement("div");
        right.className = "transaction-right";

        const price = document.createElement("span");
        price.className = "transaction-amount " +
            (item.type === "income" ? "income-text" : "expense-text");

        price.textContent =
            (item.type === "income" ? "+ " : "- ") +
            formatMoney(item.amount);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", function() {
            deleteTransaction(item.id);
        });

        right.append(price, deleteBtn);
        row.append(info, right);

        transactionList.appendChild(row);

    });
}

// Delete transaction
function deleteTransaction(id) {

    transactions = transactions.filter(function(item) {
        return item.id !== id;
    });

    saveData();
    updateDashboard();
}

// Filter transactions
filter.addEventListener("change", function() {
    displayTransactions();
});

// Dark and light mode
themeBtn.addEventListener("click", function() {

    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    themeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";

    localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️ Light Mode";
}

// Initial dashboard display
updateDashboard();
