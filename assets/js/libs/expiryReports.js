// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, Timestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
const db = getFirestore(app);

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  async function getAboutToExpireProducts() {
    const now = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(now.getMonth() + 3);
  
    const formattedNow = formatDate(now);
    const formattedThreeMonthsLater = formatDate(threeMonthsLater);
    console.log("Three months later: " + formattedThreeMonthsLater);
  
    try {
      const productsRef = collection(db, "Products");
      const productsSnapshot = await getDocs(productsRef);
  
      const aboutToExpireProducts = [];
  
      for (const productDoc of productsSnapshot.docs) {
        const productData = productDoc.data();
        const expirationDate = productData.expiryDate;
  
        if (expirationDate > formattedNow && expirationDate <= formattedThreeMonthsLater) {
          aboutToExpireProducts.push({
            id: productData.code,
            name: productData.title,
            expirationDate: expirationDate,
            quantity: productData.quantity
          });
        }
      }
  
      // Get the total number of products that are about to expire
      const totalAboutToExpireProducts = aboutToExpireProducts.length;
      console.log("Total about to expire products: " + totalAboutToExpireProducts);
  
      populateAboutToExpireProductsTable(aboutToExpireProducts);
    } catch (error) {
      console.error("Error fetching about to expire products: ", error);
      alert("Error fetching about to expire products: " + error.message);
    }
  }
  
  

  async function getExpiredProducts() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(now.getDate()).padStart(2, '0');
  
    const formattedDate = `${year}-${month}-${day}`;
  
    try {
      const productsRef = collection(db, "Products");
      const productsSnapshot = await getDocs(productsRef);
  
      const expiredProducts = [];
  
      for (const productDoc of productsSnapshot.docs) {
        const productData = productDoc.data();
        const expirationDate = productData.expiryDate;
  
        console.log("Expiry Date: " + expirationDate);
        console.log("Current Date: " + formattedDate);
  
        if (expirationDate <= formattedDate) {
          expiredProducts.push({
            id: productData.code,
            name: productData.title,
            expirationDate: expirationDate, // Keep the expiration date format as is
            quantity: productData.quantity
          });
        }
      }
  
      // Get the total number of expired products
      const totalExpiredProducts = expiredProducts.length;
      console.log("Total expired products: " + totalExpiredProducts);
  
      populateExpiredProductsTable(expiredProducts);
    } catch (error) {
      console.error("Error fetching expired products: ", error);
      alert("Error fetching expired products: " + error.message);
    }
  }
  

  function populateExpiredProductsTable(products) {
    const productsTableBody = document.querySelector('#expiredProductsTable tbody');
    productsTableBody.innerHTML = '';
    $("#expiryTableBody").empty();
  
    products.forEach(product => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="orderOne"/>
            <label class="form-check-label" for="orderOne"></label>
          </div>
        </td>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.expirationDate}</td>
        <td>${product.quantity}</td>
      `;
      productsTableBody.appendChild(row);
    });
  }
  function populateAboutToExpireProductsTable(products) {
    const productsTableBody = document.querySelector('#expiredProductsTable tbody');
    productsTableBody.innerHTML = '';
    $("#expiryTableBody").empty();
  
    products.forEach(product => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="orderOne"/>
            <label class="form-check-label" for="orderOne"></label>
          </div>
        </td>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.expirationDate}</td>
        <td>${product.quantity}</td>
      `;
      productsTableBody.appendChild(row);
    });
  }
  var convertedIntoArray = [];

  function convertTableToArray() {
    var convertedIntoArray = [];
    $("#expiredProductsTable tr").each(function() {
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
  $(function(){

    $("#dataType").change(function(){
        var dataType = this.value;
       
      if(dataType =="expire"){
        getExpiredProducts();
        convertTableToArray();
         console.log(convertedIntoArray);
      }else{
        getAboutToExpireProducts();
        convertTableToArray()
         console.log(convertedIntoArray);
      }
      
    
     });
   
   });

 
   function GenerateReport()
   {
    const now = new Date();
    const formattedNow = formatDate(now);
    const tableData = convertTableToArray();
    var props = {
        outputType: jsPDFInvoiceTemplate.OutputType.Save,
        returnJsPDFDocObject: true,
        fileName: "Expiry Reports"+formattedNow,
        orientationLandscape: false,
        compress: true,
        logo: {
            src: "../Assets/images/logos/site-logo2.png",
            type: 'PNG', //optional, when src= data:uri (nodejs case)
            width: 53.33, //aspect ratio = width/height
            height: 26.66,
            margin: {
                top: 0, //negative or positive num, from the current position
                left: 0 //negative or positive num, from the current position
            }
        },
        stamp: {
            inAllPages: true, //by default = false, just in the last page
            src: "https://raw.githubusercontent.com/edisonneza/jspdf-invoice-template/demo/images/qr_code.jpg",
            type: 'JPG', //optional, when src= data:uri (nodejs case)
            width: 20, //aspect ratio = width/height
            height: 20,
            margin: {
                top: 0, //negative or positive num, from the current position
                left: 0 //negative or positive num, from the current position
            }
        },
        business: {
            name: "Panacea Pharmaceuticals",
            address: "Ghana",
            phone: " (+233) 123 4567 890",
            email: "info.panaceaonlinegh.com",
            email_1: "contact.panaceaonlinegh.com",
            website: "www.panaceaonlinegh.com",
        },
        contact: {
            label: "Report for:",
            name: "Expired/About to expire",
            
        },
        invoice: {
            invDate: "Payment Date: "+formattedNow,
            invGenDate: "Invoice Date: "+formattedNow,
            headerBorder: false,
            tableBodyBorder: false,
            header: [
                { title: "",
                    style: {
                        width: 5
                      } 
                  }
                ,
              {
                title: "#", 
                style: { 
                  width: 50 
                } 
              }, 
              { 
                title: "Product Name",
                style: {
                  width: 100
                } 
              }, 
              { 
                title: "Expiry",
                style: {
                  width: 20
                } 
              }, 
              { title: "Stock Qty",
                style: {
                    width: 20
                  } 
              }
            ],
           table: tableData,
            additionalRows: [{
                col1: 'Total:',
                col2: '145,250.50',
                col3: 'ALL',
                style: {
                    fontSize: 14 //optional, default 12
                }
            },
            {
                col1: 'VAT:',
                col2: '20',
                col3: '%',
                style: {
                    fontSize: 10 //optional, default 12
                }
            },
            {
                col1: 'SubTotal:',
                col2: '116,199.90',
                col3: 'ALL',
                style: {
                    fontSize: 10 //optional, default 12
                }
            }],
            invDescLabel: "Report Note",
            invDesc: "",
        },
        footer: {
            text: "Powered By Softnage",
        },
        pageEnable: true,
        pageLabel: "Page ",
    };





    var pdfObject = jsPDFInvoiceTemplate.default(props);
    console.log("Object Created ",pdfObject);
    
   }
   $("#exportPDF").click(function(){
    const tableData = convertTableToArray();
    GenerateReport();
   })

  