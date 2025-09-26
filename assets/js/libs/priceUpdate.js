import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

let foundProductId = null;

// Find product by code
const findBtn = document.getElementById("findProductBtn");
if (findBtn) {
  findBtn.addEventListener("click", async function () {
    const code = document.getElementById("productCode").value.trim();
    if (!code) {
      alert("Please enter a product code.");
      return;
    }

    // Query Firestore for product with this code
    const q = query(collection(db, "Products"), where("code", "==", code));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("Product not found.");
      document.getElementById("productName").value = "";
      document.getElementById("currentPrice").value = "";
      foundProductId = null;
      return;
    }

    // Assume product codes are unique, so take the first result
    const productDoc = querySnapshot.docs[0];
    const data = productDoc.data();

    document.getElementById("productName").value = data.title || "";
    document.getElementById("currentPrice").value = data.regularPrice || "";
    foundProductId = productDoc.id;
  });
}

// Update product price
const form = document.getElementById("ProductPriceUpdateForm");
if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!foundProductId) {
      alert("Please find a product first.");
      return;
    }

    const newPrice = document.getElementById("newPrice").value.trim();
    if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) {
      alert("Please enter a valid new price.");
      return;
    }

    // Update Firestore
    const productRef = doc(db, "Products", foundProductId);
    await updateDoc(productRef, { regularPrice: Number(newPrice) });

    alert("Price updated successfully!");

    // Optionally, update the displayed current price
    document.getElementById("currentPrice").value = newPrice;
    document.getElementById("newPrice").value = "";
  });
}
