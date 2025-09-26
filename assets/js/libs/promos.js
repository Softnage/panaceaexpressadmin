// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVRG9BKj8af4h0abdjz8Tab4pQRq0wzjM",
  authDomain: "panacea-admin.firebaseapp.com",
  projectId: "panacea-admin",
  storageBucket: "panacea-admin.appspot.com",
  messagingSenderId: "800826664196",
  appId: "1:800826664196:web:df61636a3b5a44bf6bdc51",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Handle form submission
document
  .getElementById("promoForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form values
    const section = document.getElementById("sectionSelect").value;
    const imageFile = document.getElementById("promoImage").files[0];
    const title = document.getElementById("promoTitle").value;
    const link = document.getElementById("promoLink").value;

    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, "promoImages/" + imageFile.name);
      await uploadBytes(storageRef, imageFile);
      console.log("Uploaded a blob or file!");

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Save promo details to Firestore
      await addDoc(collection(db, "Marketing"), {
        section: section,
        imageUrl: downloadURL,
        title: title,
        link: link,
      });

      alert("Promo created successfully!");
      // Optionally reset the form
      document.getElementById("promoForm").reset();
    } catch (error) {
      console.error("Error: ", error);
      alert("Error creating promo: " + error.message);
    }
  });
