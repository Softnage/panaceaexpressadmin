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
const db = getFirestore(app);

function clearBestSellingTable() {
    const bestSellingTableBody = document.querySelector('#bestSellingTableBody');
    if (bestSellingTableBody) {
      bestSellingTableBody.innerHTML = '';
    }
  }
  
  function parseDate(dateString) {
    // Validate input format
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!dateRegex.test(dateString)) {
      throw new Error(`Invalid date format. Expected MM/DD/YYYY, got: ${dateString}`);
    }
  
    const [month, day, year] = dateString.split('/').map(Number);
  
    // Additional validation
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
      throw new Error(`Invalid date values: ${dateString}`);
    }
  
    // Use Date constructor with explicit parameters to avoid parsing ambiguity
    const parsedDate = new Date(year, month - 1, day);
  
    // Double-check date validity
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Unable to parse date: ${dateString}`);
    }
  
    return parsedDate;
  }
  
  async function GetBestSellingProducts(fromDate, toDate, type) {
    const bestSellingTableBody = document.querySelector('#bestSellingTableBody');
    const spinner = document.querySelector('#salesReportSpinner');
    clearBestSellingTable();
  
    try {
      spinner.style.display = "block";
  
      const fromTimestamp = Timestamp.fromDate(parseDate(fromDate));
      const toTimestamp = Timestamp.fromDate(parseDate(toDate));
  
      const ordersQuery = query(
        collection(db, type),
        where("status", "==", "Success"),
        where("createdAt", ">=", fromTimestamp),
        where("createdAt", "<=", toTimestamp)
      );
  
      const querySnapshot = await getDocs(ordersQuery);
      console.log("Number of orders found:", querySnapshot.size);
  
      const productSales = new Map();
      let totalSalesAmount = 0;
      let totalOrdersCount = 0;
  
      // Process each order
      for (const doc of querySnapshot.docs) {
        const orderData = doc.data();
        console.log("Processing order:", orderData.orderId);
  
        const items = orderData.items || [];
        console.log("Items in order:", items);
  
        for (const item of items) {
          const productCode = item.code;
          const quantity = Number(item.quantity) || 1;
          const price = Number(item.price) || 0;
          const title = item.title || '';
  
          if (!productSales.has(productCode)) {
            productSales.set(productCode, {
              productName: title,
              totalOrders: 0,
              totalAmount: 0,
              invoiceNumbers: new Set()
            });
          }
  
          const stats = productSales.get(productCode);
          stats.totalOrders += quantity;
          stats.totalAmount += price * quantity;
          stats.invoiceNumbers.add(orderData.orderId);
  
          totalOrdersCount += quantity;
          totalSalesAmount += price * quantity;
        }
      }
  
      const sortedProducts = Array.from(productSales.entries())
        .map(([productCode, stats]) => ({
          productCode,
          productName: stats.productName,
          totalOrders: stats.totalOrders,
          totalAmount: stats.totalAmount,
          invoiceNumbers: Array.from(stats.invoiceNumbers).join(', ')
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);
  
      // Create table rows
      if (sortedProducts.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
          <td colspan="4" class="text-center">No products found in the selected date range</td>
        `;
        bestSellingTableBody.appendChild(emptyRow);
      } else {
        // Add product rows
        sortedProducts.forEach((product) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${product.invoiceNumbers}</td>
            <td>${product.productName}</td>
            <td>${product.totalOrders}</td>
            <td>${product.totalAmount.toFixed(2)}</td>
          `;
          bestSellingTableBody.appendChild(row);
        });
  
        // Add total row
        const totalRow = document.createElement('tr');
        totalRow.classList.add('fw-bold', 'bg-light');
        totalRow.innerHTML = `
          <td colspan="2" class="text-end">Totals:</td>
          <td>${totalOrdersCount}</td>
          <td>${totalSalesAmount.toFixed(2)}</td>
        `;
        bestSellingTableBody.appendChild(totalRow);
      }
  
      spinner.style.display = "none";
    } catch (error) {
      console.error("Error fetching best selling products:", error);
      spinner.style.display = "none";
  
      bestSellingTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger">
            Error loading data: ${error.message}
          </td>
        </tr>
      `;
    }
  }
  
  // Add this helper function to check the data structure of an order
  function logOrderStructure(orderData) {
    console.log("Order Structure:", {
      orderId: orderData.orderId,
      status: orderData.status,
      createdAt: orderData.createdAt,
      productsPath: orderData.products ? 'products' : orderData.items ? 'items' : 'not found',
      rawData: orderData
    });
  }
  
  // Update the click handler to include error handling
  $(document).ready(function() {
    $("#showDataBtn").off("click").on("click", function() {
      try {
        const fromDate = document.getElementById('fromdate').value;
        const toDate = document.getElementById('todate').value;
        const type = document.getElementById('reportType').value;
  
        if (!fromDate || !toDate) {
          alert("Please select both start and end dates");
          return;
        }
  
        console.log("Date inputs:", { fromDate, toDate, type });
  
        const formattedFromDate = convertDateFormat(fromDate);
        const formattedToDate = convertDateFormat(toDate);
  
        console.log("Formatted dates:", { formattedFromDate, formattedToDate });
  
        GetBestSellingProducts(formattedFromDate, formattedToDate, type);
      } catch (error) {
        console.error("Error in click handler:", error);
        alert("Error processing request: " + error.message);
      }
    });
  });
  
  function convertDateFormat(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  }
  
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  function convertTableToArray() {
    const convertedIntoArray = [];
    $("#bestSellingTable tr").each(function() {
      const rowDataArray = [];
      const actualData = $(this).find('td');
      if (actualData.length > 0) {
        actualData.each(function() {
          rowDataArray.push($(this).text().trim());
        });
        convertedIntoArray.push(rowDataArray);
      }
    });
    return convertedIntoArray;
  }
  
  // Update the PDF generation function to include totals
  function GenerateBestSellingReport() {
    clearBestSellingTable();
    const now = new Date();
    const formattedNow = formatDate(now);
    const tableData = convertTableToArray();
  
    // Calculate totals from table data
    let totalOrders = 0;
    let totalAmount = 0;
    tableData.forEach(row => {
      // Skip the last row which is the total row
      if (row[1] !== 'Totals:') {
        totalOrders += parseInt(row[2]) || 0;
        totalAmount += parseFloat(row[3]) || 0;
      }
    });
  
    const props = {
      outputType: jsPDFInvoiceTemplate.OutputType.Save,
      returnJsPDFDocObject: true,
      fileName: "Best Selling Products Report " + formattedNow,
      orientationLandscape: false,
      compress: true,
      logo: {
        src: "../Assets/images/logos/site-logo2.png",
        type: 'PNG',
        width: 53.33,
        height: 26.66,
        margin: { top: 0, left: 0 }
      },
      business: {
        name: "Panacea Pharmaceuticals",
        address: "Ghana",
        phone: "(+233) 123 4567 890",
        email: "info.panaceaonlinegh.com",
        website: "www.panaceaonlinegh.com"
      },
      contact: {
        label: "Report for:",
        name: "Best Selling Products"
      },
      invoice: {
        invDate: "Report Date: " + formattedNow,
        headerBorder: false,
        tableBodyBorder: false,
        header: [
          { title: "Invoice Numbers", style: { width: 50 } },
          { title: "Product Name", style: { width: 80 } },
          { title: "Total Orders", style: { width: 30 } },
          { title: "Total Amount", style: { width: 30 } }
        ],
        table: tableData,
        additionalRows: [
          {
            col1: 'Total Products:',
            col2: `${tableData.length - 1}`, // Subtract 1 to account for the total row
            style: { fontSize: 14 }
          },
          {
            col1: 'Total Orders:',
            col2: `${totalOrders}`,
            style: { fontSize: 14 }
          },
          {
            col1: 'Total Amount:',
            col2: `GHS ${totalAmount.toFixed(2)}`,
            style: { fontSize: 14 }
          }
        ],
        invDescLabel: "Report Note",
        invDesc: "Best selling products report generated on " + formattedNow
      },
      footer: {
        text: "Powered By Softnage"
      },
      pageEnable: true,
      pageLabel: "Page "
    };
  
    const pdfObject = jsPDFInvoiceTemplate.default(props);
    console.log("PDF Report Generated", pdfObject);
  }
  
  $(document).ready(function() {
    $("#showDataBtn").off("click").on("click", function() {
      try {
        const fromDate = document.getElementById('fromdate').value;
        const toDate = document.getElementById('todate').value;
        const type = document.getElementById('reportType').value;
  
        if (!fromDate || !toDate) {
          alert("Please select both start and end dates");
          return;
        }
  
        // Clear table before showing new data
        clearBestSellingTable();
  
        const formattedFromDate = convertDateFormat(fromDate);
        const formattedToDate = convertDateFormat(toDate);
  
        GetBestSellingProducts(formattedFromDate, formattedToDate, type);
      } catch (error) {
        console.error("Error in click handler:", error);
        alert("Error processing request: " + error.message);
      }
    });
  
    $("#exportPDF").off("click").on("click", function() {
      // Clear table before exporting
      clearBestSellingTable();
  
      // Regenerate the data
      const fromDate = document.getElementById('fromdate').value;
      const toDate = document.getElementById('todate').value;
      const type = document.getElementById('reportType').value;
  
      if (!fromDate || !toDate) {
        alert("Please select both start and end dates");
        return;
      }
  
      const formattedFromDate = convertDateFormat(fromDate);
      const formattedToDate = convertDateFormat(toDate);
  
      // Get fresh data and then generate PDF
      GetBestSellingProducts(formattedFromDate, formattedToDate, type)
        .then(() => {
          GenerateBestSellingReport();
        })
        .catch(error => {
          console.error("Error generating PDF:", error);
          alert("Error generating PDF: " + error.message);
        });
    });
  });