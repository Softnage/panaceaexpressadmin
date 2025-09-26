// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVRG9BKj8af4h0abdjz8Tab4pQRq0wzjM",
  authDomain: "panacea-admin.firebaseapp.com",
  projectId: "panacea-admin",
  storageBucket: "panacea-admin.appspot.com",
  messagingSenderId: "800826664196",
  appId: "1:800826664196:web:df61636a3b5a44bf6bdc51"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const currentUser = auth.currentUser;
if (currentUser) {
    window.location.href = "main.html";
  } else {
    // No user is signed in.
    
  }
  console.log("Cuurent "+currentUser);
// Get form elements
const RegisterForm = document.getElementById("RegisterForm");
const formUserfullname = document.getElementById("formUserfullname");
const formUserPhone = document.getElementById("formUserPhone");
const formUserEmail = document.getElementById("formUserEmail");
const formUserPassword = document.getElementById("formUserPassword");
const formUserrole = document.getElementById("userRole");

// Function to validate email
function isEmailValid(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to create an account and save user details in Firestore
async function createAccountAndSaveDetails(event) {
  event.preventDefault(); // Prevent the form from submitting the traditional way

  const fullName = formUserfullname.value;
  const phone = formUserPhone.value;
  const email = formUserEmail.value;
  const password = formUserPassword.value;
  const role = formUserrole.value;

  // Validate email format
  if (!isEmailValid(email)) {
    alert("Invalid Email Address");
    return;
  }

  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user details in Firestore
    await addDoc(collection(db, "Users"), {
      uid: user.uid,
      fullName: fullName,
      phone: phone,
      email: email,
      createdAt: new Date(),
      LastedLoggedIn: Date.now(),
      role:role
    });

    console.log("User account created and details saved successfully.");
    alert("User registered successfully");
    window.location.href = "main.html";
  } catch (error) {
    console.error("Error creating account and saving details:", error);
    alert("Error: " + error.message);
  }
}

// Add event listener to the form
RegisterForm.addEventListener('submit', createAccountAndSaveDetails);
