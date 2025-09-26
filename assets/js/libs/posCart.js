

  function AddToCart(pid,code, name, price, imageurl) {
    const product = {
        pid: pid,
        code: code,
        title: name,
        price: price,
        imageUrl: imageurl,
        quantity: 1 // Initialize quantity
    };
    
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if the product already exists in the cart
    const existingProductIndex = cart.findIndex(item => item.pid === product.pid);
    
    if (existingProductIndex !== -1) {
        // If the product exists, update the quantity
        cart[existingProductIndex].quantity += 1;
    } else {
        // If the product does not exist, add it to the cart
        cart.push(product);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
   
    console.log("Product added to cart: " + product.pid);
    var audio = new Audio("Assets/audio/added.mp3");
    audio.play();
}

function DisplayCartItems() {
    const ordersListTableBody = document.querySelector('#posProductsListTable tbody');
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    

    cart.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${item.title}</td>
        <td>59</td>
        <td>
            <input type="button" value="-" class="button-minus btn btn-sm" data-pid="${item.pid}" data-field="quantity"/>
            <input type="number" step="1" max="10" value="${item.quantity}" name="quantity" class="quantity-field form-control-sm form-input" style="text-align:center;width:50px"/>
            <input type="button" value="+" class="button-plus btn btn-sm" data-pid="${item.pid}" data-field="quantity"/>
        </td>
        <td>${item.price}</td>
        <td>500</td>
        <td>
            <span class="text-danger" id="removeProduct" onclick="RemoveFromCart(${index})" data-index="${index}" style="color:red">Remove</span>
        </td>
    `;
        ordersListTableBody.appendChild(row);
    })

}
function RemoveFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);  
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.reload();
   
  }
  function updateCartQuantity(pid, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const productIndex = cart.findIndex(product => product.pid === pid);

    if (productIndex !== -1) {
        let product = cart[productIndex];
        product.quantity += change;

        // Ensure quantity does not go below 1
        if (product.quantity < 1) {
            product.quantity = 1;
        }

        cart[productIndex] = product;
        localStorage.setItem("cart", JSON.stringify(cart));
        console.log("Updated quantity for " + product.title + ": " + product.quantity);
        calculateCartTotal();
        window.location.reload();
    } else {
        console.log("Product not found in cart.");
    }
}
 

$(document).on('click', '.button-minus', function() {
    const pid = $(this).data('pid');
    updateCartQuantity(pid, -1);
    console.log("Product " + pid);
});

$(document).on('click', '.button-plus', function() {
    const pid = $(this).data('pid');
    updateCartQuantity(pid, 1); // Change to 1 to increase quantity
    console.log("Product " + pid);
});


function calculateCartTotal() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let total = cart.reduce((accumulator, item) => {
      return accumulator + (item.price * item.quantity);
    }, 0);
    
    return total;
  }
  function FormatTotal(amount) {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  DisplayCartItems();
  const finalTotal = calculateCartTotal();
  $("#TotalAmount").html("GHS "+FormatTotal(finalTotal));

  

  
