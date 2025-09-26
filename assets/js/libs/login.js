
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth,setPersistence, signInWithEmailAndPassword ,onAuthStateChanged,browserLocalPersistence  } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
const firebaseConfig = {
    apiKey: "AIzaSyDVRG9BKj8af4h0abdjz8Tab4pQRq0wzjM",
    authDomain: "panacea-admin.firebaseapp.com",
    projectId: "panacea-admin",
    storageBucket: "panacea-admin.appspot.com",
    messagingSenderId: "800826664196",
    appId: "1:800826664196:web:df61636a3b5a44bf6bdc51"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const currentUser = auth.currentUser;
if (currentUser) {
    window.location.href = "main.html";
  } else {
    // No user is signed in.
  
  }



function isEmailValid(emailAdress)
{
    let regex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/ ;
    if (emailAdress.match(regex)) 
        return true; 
    
       else 
        return false; 

}

function isPasswordValid(password)
{
    if(password < 6)
        {
            alert("Password must be at least 6")
            return false;
        }else{
            return true;
        }
    
}
let LoginForm = document.getElementById("LoginForm");
let email = document.getElementById("formSigninEmail");
let password = document.getElementById("formSigninPassword");

  

let LoginUser = (evt) => {
  evt.preventDefault();
  if (isEmailValid(email.value) === false) {
      alert("Invalid Email Address");
  } else if (isPasswordValid(password.value) === false) {
      alert("Password should be at least 6 characters");
  } else {
      setPersistence(auth, browserLocalPersistence)
          .then(() => {
              return signInWithEmailAndPassword(auth, email.value, password.value);
          })
          .then((userCredential) => {
              // Signed in 
              const user = userCredential.user;
              if (user) {
                  window.location.href = "main.html";
              } else {
                  alert("User not found");
              }
          })
          .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              if (errorCode === "auth/invalid-login-credentials") {
                  alert("Invalid Login Credentials");
              } else {
                  alert(`Error: ${errorMessage}`);
              }
          });
  }
};
LoginForm.addEventListener('submit',LoginUser);
auth.onAuthStateChanged(user => {
    if (user) {
        window.location.href = "main.html";
    } 
});