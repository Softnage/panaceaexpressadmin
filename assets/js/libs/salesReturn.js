import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, query, where, getDocs,addDoc,doc,updateDoc,increment,getDoc   } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDVRG9BKj8af4h0abdjz8Tab4pQRq0wzjM",
  authDomain: "panacea-admin.firebaseapp.com",
  projectId: "panacea-admin",
  storageBucket: "panacea-admin.appspot.com",
  messagingSenderId: "800826664196",
  appId: "1:800826664196:web:df61636a3b5a44bf6bdc51"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productSearch = document.getElementById('productSearch');
const autocompleteList = document.getElementById('autocompleteList');
const productTable = document.getElementById('productTable').querySelector('tbody');

productSearch.addEventListener('input', async function () {
  const searchQuery = productSearch.value.trim();
  
  console.log(`Search Query: ${searchQuery}`); // Log search query
  
  if (searchQuery.length < 2) {
    autocompleteList.innerHTML = ''; // Clear autocomplete if query is too short
    return;
  }

  const productsRef = collection(db, 'Products');
  try {
    const productsQuery = query(
      productsRef,
      where('title', '>=', searchQuery),
      where('title', '<=', searchQuery + '\uf8ff')
    );

    const querySnapshot = await getDocs(productsQuery);
    
    console.log(`Query returned ${querySnapshot.size} documents`); // Log the number of documents returned
    
    autocompleteList.innerHTML = ''; // Clear previous results

    if (querySnapshot.empty) {
      console.log('No matching documents.');
    }

    querySnapshot.forEach(doc => {
      const product = doc.data();
      console.log(`Product found: ${product.title}`); // Log each product found
      
      const listItem = document.createElement('li');
      listItem.className = 'list-group-item list-group-item-action';
      listItem.textContent = `${product.code} -- [qty: ${product.quantity}] -- ${product.title}`;
      listItem.addEventListener('click', () => addProductToTable(product));
      autocompleteList.appendChild(listItem);
    });
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
});

function addProductToTable(product) {
  const row = document.createElement('tr');

  row.innerHTML = `
    <td>${product.code}</td>
    <td>${product.title}</td>
    <td>GHS ${parseFloat(product.regularPrice).toFixed(2)}</td>
    <td><input type="number" id="itemQty" class="form-control" value="1" min="1" /></td>
     <td class="totalCell">GHS 0.00</td>
  `;

  productTable.appendChild(row);
  autocompleteList.innerHTML = ''; // Clear autocomplete list
  productSearch.value = ''; // Clear search input
}
// Function to populate the table


function CalculateTotal() {
    // Get all rows from the product table
    const rows = document.querySelectorAll('#productTable tbody tr');

    rows.forEach(row => {
        // Get the unit price and qty input field from the row
        const unitPriceText = row.cells[2].textContent;
        console.log('Unit Price Text:', unitPriceText); // Debugging
        const unitPrice = parseFloat(unitPriceText.replace('GHS ', ''));
        console.log('Unit Price:', unitPrice); // Debugging
        const qtyInput = row.cells[3].querySelector('input');
        const qtyValue = parseFloat(qtyInput.value);
        console.log('Quantity:', qtyValue); // Debugging
        
        // Calculate the total cost for this row
        const total = unitPrice * qtyValue;
        console.log('Total:', total); // Debugging
        
        // Update the total cell in the row
        row.cells[4].textContent = `GHS ${total.toFixed(2)}`;
    });
}

// Attach an event listener to all qty input fields to recalculate the total when the value changes
document.querySelector('#productTable tbody').addEventListener('input', function(event) {
    if (event.target.classList.contains('itemQty')) {
        CalculateTotal();
    }
});
document.getElementById('saveButton').addEventListener('click', async function() {
    const notes = document.getElementById('notes').value.trim();
    const returnDate = document.getElementById('returnDate').value;
    const products = [];

    // Collect data from the table
    const rows = document.querySelectorAll('#productTable tbody tr');
    rows.forEach(row => {
        const code = row.cells[0].textContent;
        const name = row.cells[1].textContent;
        const cost = parseFloat(row.cells[2].textContent.replace('GHS ', ''));
        const qty = parseInt(row.cells[3].querySelector('input').value);

        products.push({ code, name, cost, qty });
    });

    // Save to "Sales Returns"
    try {
        const salesReturnsRef = collection(db, 'Sales Returns');
        const salesReturnData = {
            products,
            notes,
            returnDate,
            timestamp: new Date()
        };

        // Add sales return record
        await addDoc(salesReturnsRef, salesReturnData);

        // Update quantities in "Products" collection
        for (const product of products) {
            const productRef = doc(db, 'Products', product.code);

            // Check if document exists
            const productDoc = await getDoc(productRef);

            if (productDoc.exists()) {
                // Update the document
                await updateDoc(productRef, {
                    quantity: increment(-product.qty)
                });
            } else {
                console.error(`No document found for product code: ${product.code}`);
                // Optionally: Notify user about the missing document
            }
        }

        alert('Sales return saved successfully!');
    } catch (error) {
        console.error('Error saving sales return:', error);
        alert('Error saving sales return.');
    }
});





