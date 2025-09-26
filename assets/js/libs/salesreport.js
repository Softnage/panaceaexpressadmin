// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, getDoc,getDocs,query, where  } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { Timestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";


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

async function getUserName(userid) {
    let fullname = "";
    try {
      const customerReg = collection(db, "Customers");
      const q = query(customerReg, where("userID", "==", userid));
      const querySnapshot = await getDocs(q);
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fullname = `${data.firstname} ${data.lastname}`;
      });
    } catch (error) {
      console.error("Error fetching customer: ", error);
      alert("Error fetching customer: " + error.message);
    }
    return fullname;
  }
  function parseDate(dateString) {
    // Assuming the date format is "mm/dd/yyyy"
    const [month, day, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}`);
  }
  
  async function GetOrdersReports(fromDate, toDate,type) {
    
    const ordersOnlineListTable = document.querySelector('#ordersOnlineListTable tbody');
   // const spinner = $("#salesReportSpinner");
    const ordersTableBody = $("#ordersTableBody");
    ordersTableBody.empty();

    try {
      let productUrl = "";
      //  spinner.style.display = "block"; // Show spinner;
      // Parse the dates from "mm/dd/yyyy" format to JavaScript Date objects
      const fromTimestamp = Timestamp.fromDate(parseDate(fromDate));
      const toTimestamp = Timestamp.fromDate(parseDate(toDate));
      console.log("From " + fromTimestamp);
  console.log("To " + toTimestamp);
  console.log("Type " + type);
      
      // Query the Orders collection where status is "Success" and createdAt is between fromDate and toDate
      const ordersQuery = query(
        collection(db, type),
        where("status", "==", "Success"),
        where("createdAt", ">=", fromTimestamp),
        where("createdAt", "<=", toTimestamp)
      );
      const querySnapshot = await getDocs(ordersQuery);
  
      // Use Promise.all to handle async operations within the loop
      const orderPromises = querySnapshot.docs.map(async (doc) => {
        const orderData = doc.data();
        
        // Store the required fields in variables
        const createdAt = orderData.createdAt;
        const orderId = orderData.orderId;
        const orderedBy = orderData.orderedBy;
        const totalAmount = orderData.totalAmount;
        const fullname = await getUserName(orderedBy);
        
        const date = createdAt.toDate();
        const formattedDate = date.toLocaleDateString(); 
       if(type == "Orders"){
        productUrl = `../order-single.html?code=${orderData.orderId}`;
       }else{
        productUrl = `../order-single-pos.html?code=${orderData.orderId}`;
       }
        const row = document.createElement('tr');
        row.innerHTML = `
          
          <td><a href="${productUrl}">${orderId}</a></td>
          <td>${formattedDate}</td>
          <td>${fullname}</td>
          <td>${totalAmount}</td>
          <td>${totalAmount}</td>
          <td>${totalAmount}</td>
        `;
      //  spinner.style.display = "none"; // hide spinner;
        ordersOnlineListTable.appendChild(row);
      });
  
      // Wait for all promises to complete
      await Promise.all(orderPromises);
    } catch (error) {
      console.error("Error fetching Orders:", error);
    }
  }
  function convertDateFormat(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  }

  $(document).ready(function(){
   
    $("#showDataBtn").click(function(){
        const fromDate = document.getElementById('fromdate').value;
        const toDate = document.getElementById('todate').value;
        const type = document.getElementById('reportType').value;
        // Convert the dates to "mm/dd/yyyy" format
  const formattedFromDate = convertDateFormat(fromDate);
  const formattedToDate = convertDateFormat(toDate);
  
        GetOrdersReports(formattedFromDate, formattedToDate,type);
    })
  
  })
 
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

  function convertTableToArray() {
    var convertedIntoArray = [];
    $("#ordersOnlineListTable tr").each(function() {
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
    fileName: "Sales Reports " + formattedNow,
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
      phone: " (+233) 123 4567 890",
      email: "info.panaceaonlinegh.com",
      email_1: "contact.panaceaonlinegh.com",
      website: "www.panaceaonlinegh.com"
    },
    contact: {
      label: "Report for:",
      name: "Sales"
    },
    invoice: {
      invDate: "Payment Date: " + formattedNow,
      invGenDate: "Invoice Date: " + formattedNow,
      headerBorder: false,
      tableBodyBorder: false,
      header: [
        { title: "", style: { width: 5 } },
        { title: "Invoice Number", style: { width: 50 } },
        { title: "Sales Date", style: { width: 30 } },
        { title: "Customer", style: { width: 80 } },
        { title: "Total GHS", style: { width: 20 } }
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

  function ViewReport()
  {
   const now = new Date();
   const formattedNow = formatDate(now);
   const tableData = convertTableToArray();
   var props = {
       outputType: jsPDFInvoiceTemplate.OutputType.Save,
       returnJsPDFDocObject: true,
       fileName: "Sales Reports"+formattedNow,
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
           name: "Sales",
           
       },
       invoice: {
           invDate: "Payment Date: "+formattedNow,
           invGenDate: "Invoice Date: "+formattedNow,
           headerBorder: false,
           tableBodyBorder: false,
           header: [
             {
               title: "Invoice Number",  style: { width: 50  } 
             }, 
             { 
               title: "Sales Date", style: {   width: 30  } 
             }, 
             { 
               title: "Customer",   style: { width: 80 } 
             }, 
             { title: "Total Due",  style: {  width: 20 } 
             }
             , 
             { title: "Payable Amt",   style: { width: 20   } 
             }
             , 
             { title: "Paid Amt",style: { width: 20 } 
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





   //var pdfObject = jsPDFInvoiceTemplate.default(props);
   var pdfObject = jsPDFInvoiceTemplate.default(props);
   console.log("Object Created ",pdfObject);
   
  }
  $("#exportPDF").click(function(){
   const tableData = convertTableToArray();
   GenerateReport();
  })
  $("#viewReportBtn").click(function(){
   const tableData = convertTableToArray();
   ViewReport();
  })
