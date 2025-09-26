import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc,doc,getDoc,updateDoc  } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";
import { getAuth,onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";



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
  const db = getFirestore(app);
  const storage = getStorage(app);
  const auth = getAuth(app);
  const currentUser = auth.currentUser;
  console.log("Cuurent "+currentUser);

  onAuthStateChanged(auth, (user) => {
    if (user) {
     
      const uid = user.uid;
      console.log("User : "+uid);
    } else {
        console.log("User : "+uid);
    }
  });

  function getURLParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  async function populateCategoryForm(docID) {
    try {
      const docRef = doc(db, "Categories", docID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const category = docSnap.data();
        document.getElementById('categoryName').value = category.name;
      document.getElementById('categorySlug').value = category.slug;
     // document.getElementById('productStatus').checked = category.status;
      console.log(category.name);
      console.log(category.slug);
      }else{
        console.log("Doc with ID "+docID+" does not exist");
      }
    }catch(error){
      console.log(error);
    }
  }

  // Get form elements
const CategoryForm = document.getElementById("CategoryForm");
const imageChooser = document.getElementById("imageChooser");
const categoryImage = document.getElementById("categoryImage");
const categoryName = document.getElementById("categoryName");
const categorySlug = document.getElementById("categorySlug");

const productStatusElements = document.getElementsByName("productStatus");
const categoryMetaTitle = document.getElementById("categoryMetaTitle");

const spinner = document.getElementById("spinner");


// Display chosen image
imageChooser.addEventListener("change", function() {
    const file = imageChooser.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function(e) {
        categoryImage.src = e.target.result;
        categoryImage.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      categoryImage.style.display = "none";
    }
  });

  // Function to get selected product status
function getSelectedProductStatus() {
    for (const element of productStatusElements) {
      if (element.checked) {
        return element.value;
      }
    }
    return null;
  }

  // Function to add category to Firestore
async function addCategory(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
  
    const name = categoryName.value;
    const slug = categorySlug.value;
    const status = getSelectedProductStatus();
    const file = imageChooser.files[0];
  
    if (file && file.type.startsWith("image/")) {
        spinner.style.display = "block"; // Show spinner
        document.getElementById("addBtn").disabled  = true;
      try {
        // Upload image to Firebase Storage
        const storageRef = ref(storage, `categories/${file.name}`);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);
  
        // Save category details in Firestore
        await addDoc(collection(db, "Categories"), {
          name: name,
          slug: slug,
          imageUrl: imageUrl,
          createdAt: new Date()
        });
  
        console.log("Category added successfully.");
        alert("Category added successfully.");
      } catch (error) {
        console.error("Error adding category:", error);
        alert("Error adding category: " + error.message);
      }finally {
        spinner.style.display = "none"; // Hide spinner
        document.getElementById("addBtn").disabled  = false;
        categoryName.value = "";
        categoryMetaTitle.value = "";
        categorySlug.value = "";
      }
    } else {
      alert("Please choose a valid image file.");
    }
  }

  async function updateCategory(docID) {
    const updatedCategory = {
      name: document.getElementById('categoryName').value,
    slug: document.getElementById('categorySlug').value
    }

    try {
      const docRef = doc(db, "Categories", docID);
      await updateDoc(docRef, updatedCategory);
      alert("Category updated successfully!");
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Error updating product.");
    }
  }
  CategoryForm.addEventListener('submit', addCategory);
  window.onload = () => {
    const docID = getURLParameter('docID');
    if (docID) {
      document.getElementById("addBtn").style.display = "none";
      populateCategoryForm(docID)
      console.log("This is an Update");
  
      // Add event listener to update button
      document.getElementById('updateBtn').addEventListener('click', () => updateCategory(docID));
    }
  };