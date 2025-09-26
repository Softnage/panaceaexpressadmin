import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
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

async function populateCategoryDropdown() {
  const categoryDropdown = document.getElementById("productCategory");

  try {
    const querySnapshot = await getDocs(collection(db, "Categories"));
    querySnapshot.forEach((doc) => {
      const category = doc.data();
      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      categoryDropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching categories: ", error);
  }
}

function FormatTotal(amount) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
async function populateAllProductsTable() {
  const productsTableBody = document.querySelector("#productsListTable tbody");
  const spinner = $("#stockReportSpinner");
  spinner.show();
  spinner.css("color", "red");
  try {
    const querySnapshot = await getDocs(collection(db, "Products"));
    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const total = product.quantity * product.regularPrice;
      const row = document.createElement("tr");

      row.innerHTML = `
          
        <td>${product.code}</td>
          <td><a href="#" class="text-reset">${product.title}</a></td>
          <td>${product.category}</td>
          <td>${product.regularPrice}</td>
          <td>${product.quantity}</td>
          <td>${FormatTotal(total)}</td>
          
        `;

      productsTableBody.appendChild(row);
      spinner.hide();
    });

    // Add event listeners for delete buttons
    const deleteButtons = document.querySelectorAll(".delete-product");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", handleDeleteProduct);
    });
  } catch (error) {
    console.error("Error fetching products: ", error);
    alert("Error fetching products: " + error.message);
  }
}
async function populateFilteredProductsTable(category) {
  const productsTableBody = document.querySelector("#productsListTable tbody");
  const spinner = $("#stockReportSpinner");
  spinner.show();
  spinner.css("color", "red");

  try {
    const q = query(
      collection(db, "Products"),
      where("category", "==", category)
    );
    const querySnapshot = await getDocs(q);

    productsTableBody.innerHTML = ""; // Clear existing rows

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const total = product.quantity * product.regularPrice;
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${product.code}</td>
                <td><a href="#" class="text-reset">${product.title}</a></td>
                <td>${product.category}</td>
                <td>${product.regularPrice}</td>
                <td>${product.quantity}</td>
                <td>${FormatTotal(total)}</td>
            `;

      productsTableBody.appendChild(row);
    });

    // Hide the spinner after rows are appended
    spinner.hide();

    // Add event listeners for delete buttons
    const deleteButtons = document.querySelectorAll(".delete-product");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", handleDeleteProduct);
    });
  } catch (error) {
    console.error("Error fetching products: ", error);
    alert("Error fetching products: " + error.message);
    spinner.hide(); // Hide the spinner in case of error
  }
}
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function convertTableToArray() {
  var convertedIntoArray = [];
  $("#productsListTable tr").each(function () {
    var rowDataArray = [];
    var actualData = $(this).find("td");
    if (actualData.length > 0) {
      actualData.each(function () {
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
  const category = document.getElementById("productCategory").value;
  const props = {
    outputType: jsPDFInvoiceTemplate.OutputType.Save,
    returnJsPDFDocObject: true,
    fileName: "Stock Report" + formattedNow,
    orientationLandscape: false,
    compress: true,
    logo: {
      src: "../Assets/images/logos/site-logo2.png",
      type: "PNG",
      width: 53.33,
      height: 26.66,
      margin: { top: 0, left: 0 },
    },
    stamp: {
      inAllPages: true,
      src: "https://raw.githubusercontent.com/edisonneza/jspdf-invoice-template/demo/images/qr_code.jpg",
      type: "JPG",
      width: 20,
      height: 20,
      margin: { top: 0, left: 0 },
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
      name: "Stock Report",
    },
    invoice: {
      label: "Category: " + category,
      invDate: "Payment Date: " + formattedNow,
      invGenDate: "Invoice Date: " + formattedNow,
      headerBorder: false,
      tableBodyBorder: false,
      header: [
        { title: "Prod ID", style: { width: 30, textAlign: "center" } },
        { title: "Prod Name", style: { width: 80 } },
        { title: "Category", style: { width: 30 } },
        { title: "Sale Unit Price", style: { width: 30 } },
        { title: "Current Stock", style: { width: 30, textAlign: "center" } },
        { title: "Stock Value", style: { width: 30, textAlign: "center" } },
      ],
      table: tableData,
      additionalRows: [
        {
          col1: "Total:",
          col2: "145,250.50",
          col3: "ALL",
          style: {
            fontSize: 14, //optional, default 12
          },
        },
        {
          col1: "VAT:",
          col2: "20",
          col3: "%",
          style: {
            fontSize: 10, //optional, default 12
          },
        },
        {
          col1: "SubTotal:",
          col2: "116,199.90",
          col3: "ALL",
          style: {
            fontSize: 10, //optional, default 12
          },
        },
      ],
      invDescLabel: "Report Note",
      invDesc: "",
    },
    footer: {
      text: "Powered By Softnage",
    },
    pageEnable: true,
    pageLabel: "Page ",
  };

  const pdfObject = jsPDFInvoiceTemplate.default(props);
}
function GenerateExcelReport() {
  const now = new Date();
  const formattedNow = formatDate(now);
  const category = document.getElementById("productCategory").value;

  // Get table data
  const tableData = convertTableToArray();

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([
    // Header row
    ["Panacea Pharmaceuticals Stock Report"],
    ["Category: " + category],
    ["Generated Date: " + formattedNow],
    [], // Empty row for spacing
    // Column headers
    [
      "Product ID",
      "Product Name",
      "Category",
      "Sale Unit Price",
      "Current Stock",
      "Stock Value",
    ],
    // Data rows
    ...tableData,
  ]);

  // Set column widths
  const wscols = [
    { wch: 15 }, // Product ID
    { wch: 40 }, // Product Name
    { wch: 20 }, // Category
    { wch: 15 }, // Sale Unit Price
    { wch: 15 }, // Current Stock
    { wch: 15 }, // Stock Value
  ];
  ws["!cols"] = wscols;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock Report");

  // Generate and download the Excel file
  XLSX.writeFile(wb, `Stock_Report_${formattedNow}.xlsx`);
}
$(document).ready(function () {
  $("#showDataBtn").click(function () {
    const category = document.getElementById("productCategory").value;
    if (category == "allCategories") {
      populateAllProductsTable();
    } else {
      populateFilteredProductsTable(category);
    }
  });
});
$("#exportPDF").click(function () {
  GenerateReport();
});
$("#exportExcel").click(function () {
  GenerateExcelReport();
});
$(document).ready(function () {
  populateCategoryDropdown();
});
