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

// Function to populate the table
async function populateSalesReturnsTable() {
    const salesReturnsRef = collection(db, 'Sales Returns');
    
    try {
        // Fetch sales returns documents
        const querySnapshot = await getDocs(salesReturnsRef);
        
        // Get the table body element
        const tableBody = document.querySelector('#salesReturnsTable tbody');
        tableBody.innerHTML = ''; // Clear existing rows
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const products = data.products;
            const notes = data.notes || '';
            const returnedDate = data.returnDate;
           
            const createdOn = data.timestamp.toDate().toLocaleDateString();
            
            // Iterate over each product and create a table row
            products.forEach(product => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${product.code}</td>
                    <td>${product.name}</td>
                    <td>${product.qty}</td>
                    <td>${notes}</td>
                    <td>${returnedDate}</td>
                    <td>${createdOn}</td>
                `;
                tableBody.appendChild(row);
            });
        });
    } catch (error) {
        console.error('Error fetching sales returns:', error);
    }
}
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
function convertTableToArray() {
    var convertedIntoArray = [];
    $("#salesReturnsTable tr").each(function() {
        var rowDataArray = [];
        var actualData = $(this).find('td');
        if (actualData.length > 0) {
            actualData.each(function() {
                rowDataArray.push($(this).text().trim());
            });
            convertedIntoArray.push(rowDataArray);
        }
    });
    return convertedIntoArray;
}
function GenerateReport() {
    const now = new Date();
    const formattedNow = formatDate(now);
    const tableData = convertTableToArray();
    
    const props = {
      outputType: jsPDFInvoiceTemplate.OutputType.Save,
      returnJsPDFDocObject: true,
      fileName: "Sales Return Reports " + formattedNow,
      orientationLandscape: false,
      compress: true,
      logo: {
        src: "../Assets/images/logos/site-logo2.png",
        type: 'PNG',
        width: 53.33,
        height: 26.66,
        margin: { top: 0, left: 0 }
      },
      stamp: {
        inAllPages: true,
        src: "https://raw.githubusercontent.com/edisonneza/jspdf-invoice-template/demo/images/qr_code.jpg",
        type: 'JPG',
        width: 20,
        height: 20,
        margin: { top: 0, left: 0 }
      },
      business: {
        name: "Panacea Pharmaceuticals",
        address: "Ghana",
        phone: " +233 (0) 550713124",
        email: "info.panaceaonlinegh.com",
        email_1: "info@panaceaexpress.com",
        website: "www.panaceaexpress.com"
      },
      contact: {
        label: "Report for:",
        name: "Sales Return Return"
      },
      invoice: {
        invDate: "Payment Date: " + formattedNow,
        invGenDate: "Invoice Date: " + formattedNow,
        headerBorder: false,
        tableBodyBorder: false,
        header: [
        
          { title: "Code", style: { width: 30 } },
          { title: "Item", style: { width: 50 } },
          { title: "Qty returned", style: { width: 20 } },
          { title: "Note", style: { width: 80 } },
          { title: "Returned Date", style: { width: 20 } },
          { title: "Created on", style: { width: 20 } }
        ],
        table: tableData,
        additionalRows: [
          { col1: 'Total:', col2: '1000', col3: '', style: { fontSize: 14 } }
        ],
        invDescLabel: "Report Note",
        invDesc: ""
      },
      footer: {
        text: "Powered By Softnage"
      },
      pageEnable: true,
      pageLabel: "Page "
    };
  
    const pdfObject = jsPDFInvoiceTemplate.default(props);
    console.log("Object Created ", pdfObject);
  }

// Call the function to populate the table
populateSalesReturnsTable();

$("#exportPDF").click(function(){
    const tableData = convertTableToArray();
    GenerateReport();
   })