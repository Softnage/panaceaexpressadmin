import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

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
const auth = getAuth(app);

//   Get Categories list in Dropdown
// Function to fetch categories and populate the dropdown
async function populateCategoryDropdown() {
  const categoryDropdown = document.getElementById("productCategory");
  categoryDropdown.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "Categories"));
    querySnapshot.forEach((doc) => {
      const category = doc.data();
      if (
        !Array.from(categoryDropdown.options).some(
          (option) => option.value === category.name
        )
      ) {
        const option = document.createElement("option");
        option.value = category.name;
        option.textContent = category.name;
        categoryDropdown.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Error fetching categories: ", error);
  }
}
// Function to get URL parameter for update
function getURLParameter(name) {
  return new URLSearchParams(window.location.search).get(name);
}
// Function to populate form fields with product data
async function populateProductForm(docID) {
  try {
    const docRef = doc(db, "Products", docID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const product = docSnap.data();
      document.getElementById("ProdName").value = product.title;
      document.getElementById("productCategory").value = product.category;
      document.getElementById("prodWeight").value = product.weight;
      document.getElementById("prodUnit").value = product.unit;
      document.getElementById("prodStockStatus").checked = product.stockStatus;
      document.getElementById("isFeaturedCheck").checked = product.isFeatured;
      document.getElementById("prodCode").value = product.code;
      document.getElementById("prodRegularPrice").value = product.regularPrice;
      document.getElementById("prodSalePrice").value = product.salePrice;
      document.getElementById("prodMetaDescription").value =
        product.metaDescription;
      document.getElementById("brandname").value = product.brand;
      document.getElementById("manufacturer").value = product.manufacturer;
      $("#currentStock").val(product.quantity);
      document.getElementById("addBtn").style.display = "none";
      document.getElementById("updateBtn").style.display = "block";
      // Populate the editor with the product description
      document.getElementById("editor").innerHTML = product.description;
      // Set the status radio buttons
      if (product.activeStatus === "option1") {
        document.getElementById("prodisActive").checked = true;
      } else {
        document.getElementById("prodisNotActive").checked = true;
      }
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error getting document:", error.message);
  }
}

// Function to get selected product status
function getSelectedProductStatus() {
  const statusElements = document.getElementsByName("prodActiveStatus");
  for (const element of statusElements) {
    if (element.checked) {
      return element.value;
    }
  }
  return null;
}

async function getUserName(userid) {
  let fullname = "";
  try {
    const customerReg = collection(db, "Users");
    const q = query(customerReg, where("uid", "==", userid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      fullname = `${data.fullName}`;
    });
  } catch (error) {
    console.error("Error fetching customer: ", error);
    alert("Error fetching customer: " + error.message);
  }
  return fullname;
}

// Function to handle the form submission

async function handleFormSubmit(event) {
  event.preventDefault();

  // Get form values
  const user = auth.currentUser;
  const title = document.getElementById("ProdName").value;
  const LongTitle = document.getElementById("ProdLongName").value;
  const category = document.getElementById("productCategory").value;
  const weight = document.getElementById("prodWeight").value;
  const brand = document.getElementById("brandname").value;
  const manufacturer = document.getElementById("manufacturer").value;
  const unit = document.getElementById("prodUnit").value;
  const shortDes = document.getElementById("editor2").innerHTML;
  const description = document.getElementById("editor").innerHTML;
  const stockStatus = document.getElementById("prodStockStatus").checked;
  const isFeaturedCheck = document.getElementById("isFeaturedCheck").checked;
  const code = document.getElementById("prodCode").value;
  const activeStatus = getSelectedProductStatus();
  const regularPrice = document.getElementById("prodRegularPrice").value;
  const salePrice = document.getElementById("prodSalePrice").value;
  const metaDescription = document.getElementById("prodMetaDescription").value;
  const prodExpiryDate = document.getElementById("prodExpiryDate").value;
  const prodQuantity = document.getElementById("prodQuantity").value;
  const spinner = document.getElementById("spinner");
  const lowercaseTitle = title.toLowerCase();
  if (unit === "Select unit") {
    alert("Please select a unit.");
    return;
  }

  // Handle image upload
  const imageChooser = document.getElementById("imageChooser");
  const otherImageFiles = document.getElementById("otherImages").files;
  const file = imageChooser.files[0];
  let imageUrl = "";
  let otherImageUrls = [];
  if (otherImageFiles.length > 3) {
    alert("You can only upload up to 3 images");
    return;
  }
  if (file) {
    if (file.type.startsWith("image/") && file.size > 0) {
      spinner.style.display = "block"; // Show spinner
      try {
        // Upload image to Firebase Storage
        const storageRef = ref(storage, `products/${file.name}`);
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
        // Upload other images and get their URLs
        otherImageUrls = [];
        for (let i = 0; i < otherImageFiles.length; i++) {
          const myimageUrl = await uploadImageToFirebase(
            otherImageFiles[i],
            `other-${i}`
          );
          otherImageUrls.push(myimageUrl);
        }
      } catch (error) {
        console.error("Error uploading image: ", error);
        alert("Error uploading image: " + error.message);
        return;
      }
    } else if (file.size === 0) {
      alert("The selected file is empty. Please choose a valid image.");
      return;
    } else {
      alert("The selected file is not an image. Please choose an image file.");
      return;
    }
  } else if (category == "Prescription") {
    imageUrl =
      "https://universalele.websites.co.in/obaju-turquoise/img/product-placeholder.png";
  } else {
    alert("No file selected. Please choose an image to upload.");
    return;
  }

  // Add product to Firestore
  try {
    const docRef = await addDoc(collection(db, "Products"), {
      title: title,
      LongTitle: LongTitle,
      lowercaseTitle: lowercaseTitle,
      category: category,
      weight: weight,
      unit: unit,
      brand: brand,
      manufacturer: manufacturer,
      shortDescription: shortDes,
      description: description,
      stockStatus: stockStatus,
      code: code,
      activeStatus: activeStatus,
      isFeatured: isFeaturedCheck,
      regularPrice: regularPrice,
      salePrice: salePrice,
      metaDescription: metaDescription,
      imageUrl: imageUrl,
      otherImages: otherImageUrls,
      createdAt: new Date(),
      expiryDate: prodExpiryDate,
      quantity: prodQuantity,
      postTimestamp: serverTimestamp(),
    });
    // Add the document ID to the product itself
    await updateDoc(docRef, { docId: docRef.id });
    AddStockHistory();
    console.log("Product added successfully.");
    alert("Product added successfully.");
  } catch (error) {
    console.error("Error adding product: ", error);
    alert("Error adding product: " + error.message);
  } finally {
    spinner.style.display = "none"; // Hide spinner
    document.getElementById("addBtn").disabled = false;
    window.location.reload();
  }
}

async function uploadImageToFirebase(file, imageName) {
  const storage = getStorage(); // Initialize Firebase storage
  const storageRef = ref(storage, `products/others/${imageName}-${Date.now()}`); // Get a reference to the storage path

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Optional: You can track the upload progress here if needed
      },
      (error) => reject(error), // Handle errors during upload
      async () => {
        try {
          // Get the download URL once the upload is complete
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl); // Resolve the promise with the download URL
        } catch (error) {
          reject(error); // Handle any errors in retrieving the download URL
        }
      }
    );
  });
}
function generateProductCode(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }

  return result;
}

// Example usage:
const randomCode = generateProductCode(10); // Generates a code like "B0CJ6RXV1N"
console.log(randomCode);

const ProductForm = document.getElementById("ProductForm");
ProductForm.addEventListener("submit", handleFormSubmit);

async function AddStockHistory() {
  const currentQty = parseInt($("#currentStock").val(), 10);
  const newQty = parseInt($("#prodQuantity").val(), 10) || 0;

  // If newQty is not null, NaN, or 0, add it to the currentQty
  const finalQty = currentQty + newQty;
  const user = auth.currentUser;
  try {
    // Resolve the promise returned by getUserName
    const userName = await getUserName(user.uid);

    await addDoc(collection(db, "StockHistory"), {
      title: document.getElementById("ProdName").value,
      category: document.getElementById("productCategory").value,
      code: document.getElementById("prodCode").value,
      lastedUpdated: new Date(),
      quantity: newQty,
      availableQty: finalQty,
      packageType: $("#prodUnit").val(),
      postTimestamp: serverTimestamp(),
      by: userName, // Use the resolved value here
    });

    console.log("Product added successfully.");
  } catch (error) {
    console.error("Error adding product: ", error);
    alert("Error adding product: " + error.message);
  }
}

async function updateProduct(docID) {
  const currentQty = parseInt($("#currentStock").val(), 10);
  const newQty = parseInt($("#prodQuantity").val(), 10) || 0;

  // If newQty is not null, NaN, or 0, add it to the currentQty
  const finalQty = currentQty + newQty;
  const prodTitle = document.getElementById("ProdName").value;
  const lowercaseTitle = prodTitle.toLowerCase();
  const updatedProduct = {
    title: document.getElementById("ProdName").value,
    LongTitle: document.getElementById("ProdLongName").value,
    lowercaseTitle: lowercaseTitle,
    category: document.getElementById("productCategory").value,
    weight: document.getElementById("prodWeight").value,
    unit: document.getElementById("prodUnit").value,
    inStock: document.getElementById("prodStockStatus").checked,
    isFeatured: document.getElementById("isFeaturedCheck").checked,
    productCode: document.getElementById("prodCode").value,
    regularPrice: document.getElementById("prodRegularPrice").value,
    salePrice: document.getElementById("prodSalePrice").value,
    quantity: finalQty, // Use finalQty here
    metaDescription: document.getElementById("prodMetaDescription").value,
    description: document.getElementById("editor").innerHTML,
    activeStatus: document.querySelector(
      'input[name="prodActiveStatus"]:checked'
    ).value,
    lastedUpdated: new Date(),
  };

  try {
    const docRef = doc(db, "Products", docID);
    await updateDoc(docRef, updatedProduct);
    alert("Product updated successfully!");
    AddStockHistory();
    
    // Check if there's a returnPage parameter to preserve pagination
    const returnPage = getURLParameter("returnPage");
    if (returnPage) {
      window.location.href = `products.html?page=${returnPage}`;
    } else {
      window.location.href = "products.html"; // Default redirect
    }
  } catch (error) {
    console.error("Error updating document:", error);
    alert("Error updating product.");
  }
}

// On page load, get the docID from URL and populate the form
window.onload = () => {
  const randomCode = generateProductCode(10);
  $("#prodCode").val(randomCode);
  populateCategoryDropdown();
  const docID = getURLParameter("docID");
  if (docID) {
    populateProductForm(docID);

    // Add event listener to update button
    document
      .getElementById("updateBtn")
      .addEventListener("click", () => updateProduct(docID));
  } else {
    populateCategoryDropdown();
  }
};
