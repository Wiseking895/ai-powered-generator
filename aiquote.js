// ======================= FIREBASE SETUP =======================
// Load Firebase from CDN in your HTML BEFORE this script:
// <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>

const firebaseConfig = {
  apiKey: "AIzaSyCK8lQhUjJiDP6D0f0vChPm5j4RUkhjyAs",
  authDomain: "form1-e7b2e.firebaseapp.com",
  projectId: "form1-e7b2e",
  storageBucket: "form1-e7b2e.firebasestorage.app",
  messagingSenderId: "59720471799",
  appId: "1:59720471799:web:6221d92669a2441d40aff2",
  measurementId: "G-R02DC06DEF",
};

// Initialize Firebase (v8 syntax)
firebase.initializeApp(firebaseConfig);

// Get Firestore
const db = firebase.firestore();

// ======================= QUOTE APP =======================

const quoteText = document.getElementById("quote");
const authorText = document.getElementById("author");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

let quotes = [];
let currentIndex = -1;

// Colors for background cycling
const bgColors = [
  "#f5b7b1", // soft red
  "#aed6f1", // light blue
  "#a9dfbf", // green
  "#f9e79f", // yellow
  "#d2b4de", // purple
  "#fad7a0", // orange
  "#95a5a6"  // grey
];
let colorIndex = 0;

// Change background color
function changeBackground() {
  document.body.style.transition = "background-color 0.6s ease"; 
  document.body.style.backgroundColor = bgColors[colorIndex];
  colorIndex = (colorIndex + 1) % bgColors.length; 
}

// Fetch with timeout helper
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  } catch (err) {
    clearTimeout(id);
    console.error("Fetch failed:", resource, err.message);
    return null;
  }
}

// API fetchers
async function fetchQuotable() {
  const res = await fetchWithTimeout("https://api.quotable.io/random");
  if (res) return { text: res.content, author: res.author };
  return null;
}

async function fetchZenQuotes() {
  const res = await fetchWithTimeout("https://zenquotes.io/api/random");
  if (res && res[0]) return { text: res[0].q, author: res[0].a };
  return null;
}

async function fetchDummyJSON() {
  const res = await fetchWithTimeout("https://dummyjson.com/quotes/random");
  if (res) return { text: res.quote, author: res.author };
  return null;
}

// Get a random quote
async function getRandomQuote() {
  const apis = [fetchQuotable, fetchZenQuotes, fetchDummyJSON];
  for (let api of apis) {
    const quote = await api();
    if (quote) return quote;
  }
  return { text: "No quotes available right now.", author: "" };
}

// Display quote
function displayQuote(index) {
  if (index >= 0 && index < quotes.length) {
    quoteText.textContent = quotes[index].text;
    authorText.textContent = quotes[index].author
      ? `– ${quotes[index].author}`
      : "";
  }
}

// ======================= BUTTON HANDLERS =======================

if (nextBtn) {
  nextBtn.addEventListener("click", async () => {
    quoteText.textContent = "Loading…";
    authorText.textContent = "";

    const quote = await getRandomQuote();
    quotes.push(quote);
    currentIndex = quotes.length - 1;
    displayQuote(currentIndex);

    changeBackground(); 
  });
}

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      displayQuote(currentIndex);

      changeBackground(); 
    }
  });
}

// Load the first quote + set initial background
(async () => {
  const quote = await getRandomQuote();
  quotes.push(quote);
  currentIndex = 0;
  displayQuote(currentIndex);
  changeBackground();
})();

// ======================= FIRESTORE FORM =======================

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = contactForm.name.value;
    const email = contactForm.email.value;
    const message = contactForm.message.value;

    try {
      await db.collection("messages").add({
        name,
        email,
        message,
        timestamp: new Date(),
      });

      alert("Message sent successfully!");
      contactForm.reset();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to send message. Please try again.");
    }
  });
}

// ======================= NAVBAR TOGGLE =======================

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    // Toggle between ☰ and ✖
    menuToggle.textContent = navLinks.classList.contains("active") ? "✖" : "☰";
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.textContent = "☰";
    });
  });
}

// ======================= END OF FILE =======================
