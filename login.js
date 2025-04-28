// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD4Pdyy-WKtCbrzCEGwF8DZ0r2SgCjQerc",
    authDomain: "drug-inventory-3bc04.firebaseapp.com",
    projectId: "drug-inventory-3bc04",
    storageBucket: "drug-inventory-3bc04.firebasestorage.app",
    messagingSenderId: "1065908954555",
    appId: "1:1065908954555:web:bf32d4ff49411e8f11909e",
    measurementId: "G-X6WSJF9F3X"
  };
  
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle sign-in
function SignInUser(event) {
  event.preventDefault(); // Prevent form submission and page reload

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
          console.log("Login successful, UID:", userCredential.user.uid);
          // Redirect to the desired page after login
          window.location.href = "dashboard.html"; // Replace with the actual page you want to redirect to
      })
      .catch((error) => {
          console.error("Login failed:", error.message);
          alert("Login failed: " + error.message); // Show an error message to the user
      });
}

// Attach event listener to the login form
document.getElementById('loginForm').addEventListener('submit', SignInUser);

// Toggle forms
const loginForm = document.getElementById('loginForm');
const signUpForm = document.getElementById('signUpForm');
const showSignUpBtn = document.getElementById('showSignUp');
const showLoginBtn = document.getElementById('showLogin');

showSignUpBtn.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    signUpForm.classList.remove('hidden');
});

showLoginBtn.addEventListener('click', () => {
    signUpForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// Handle sign-up
function SignUpUser(event) {
    event.preventDefault();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("Sign up successful, UID:", userCredential.user.uid);
            alert("Sign up successful! Please log in.");
            signUpForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        })
        .catch((error) => {
            console.error("Sign up failed:", error.message);
            alert("Sign up failed: " + error.message);
        });
}

// Attach event listener to the sign-up form
signUpForm.addEventListener('submit', SignUpUser);
