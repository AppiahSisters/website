// js/script.js

// IMPORTANT: You MUST replace 'YOUR_WEBSITE_BASE_URL_HERE' with the actual base URL of your website.
// For example, if your website is hosted at 'https://www.yourdomain.com/', use that.
// If you're testing locally with Live Server, it might be something like 'http://127.0.0.1:5500/'
const WEBSITE_BASE_URL = 'YOUR_WEBSITE_BASE_URL_HERE';

// Define the general shipping fee
const SHIPPING_FEE = 3.99;


// Function to get cart items from local storage
function getCartItems() {
  const cartItems = localStorage.getItem('appiahSistersCart');
  try {
    return cartItems ? JSON.parse(cartItems) : [];
  } catch (e) {
    console.error("Error parsing cart items from localStorage:", e);
    return [];
  }
}

// Function to save cart items to local storage
function saveCartItems(cartItems) {
  localStorage.setItem('appiahSistersCart', JSON.stringify(cartItems));
}

// Function to update the cart item count in the header
function updateCartItemCount() {
  const cartItems = getCartItems();
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartItemCountSpan = document.querySelector('.cart-item-count');
  if (cartItemCountSpan) {
    cartItemCountSpan.textContent = totalCount;
    cartItemCountSpan.style.display = totalCount > 0 ? 'inline-block' : 'none'; // Show/hide based on count
  }
}

// Function to add an item to the cart
function addToCart(product) {
  let cartItems = getCartItems();
  const existingItemIndex = cartItems.findIndex(item => item.id === product.id);

  if (existingItemIndex > -1) {
    // If item exists, increase quantity
    cartItems[existingItemIndex].quantity += 1;
  } else {
    // If item doesn't exist, add new item with quantity 1
    cartItems.push({ ...product, quantity: 1 });
  }

  saveCartItems(cartItems);
  updateCartItemCount();
  // Using a custom message box instead of alert() for better UX
  showCustomAlert(`${product.name} added to cart!`);
}

// Function to render cart items on cart.html
function renderCart() {
  const cartItemsContainer = document.querySelector('.cart-table tbody');
  const cartSubtotalSpan = document.querySelector('.cart-subtotal'); // New subtotal span
  const cartShippingSpan = document.querySelector('.cart-shipping'); // New shipping span
  const cartTotalSpan = document.querySelector('.cart-total');
  const emptyCartMessage = document.querySelector('.cart-empty-message');
  const cartSummary = document.querySelector('.cart-summary');
  const cartTable = document.querySelector('.cart-table');

  if (!cartItemsContainer || !cartTotalSpan || !cartSubtotalSpan || !cartShippingSpan) return; // Stop if not on cart.html

  let cartItems = getCartItems();
  cartItemsContainer.innerHTML = '';
  let subtotal = 0;

  if (cartItems.length === 0) {
    emptyCartMessage.style.display = 'block';
    cartSummary.style.display = 'none';
    cartTable.style.display = 'none';
  } else {
    emptyCartMessage.style.display = 'none';
    cartSummary.style.display = 'block';
    cartTable.style.display = 'table'; // Show the table

    cartItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td data-label="Product">
          <div class="cart-item-info">
            <img src="${item.image}" alt="${item.name}" /> <span>${item.name}</span>
          </div>
        </td>
        <td data-label="Price">€${item.price.toFixed(2)}</td>
        <td data-label="Quantity">
          <input type="number" value="${item.quantity}" min="1" class="cart-quantity-input" data-product-id="${item.id}">
        </td>
        <td data-label="Subtotal">€${itemTotal.toFixed(2)}</td>
        <td data-label="Remove"><button class="remove-item-btn" data-product-id="${item.id}">Remove</button></td>
      `;
      cartItemsContainer.appendChild(row);
    });

    const total = subtotal + SHIPPING_FEE; // Calculate total including shipping

    cartSubtotalSpan.textContent = `€${subtotal.toFixed(2)}`; // Display subtotal
    cartShippingSpan.textContent = `€${SHIPPING_FEE.toFixed(2)}`; // Display shipping
    cartTotalSpan.textContent = `€${total.toFixed(2)}`; // Display final total

    // Add event listeners for quantity changes
    document.querySelectorAll('.cart-quantity-input').forEach(input => {
      input.addEventListener('change', (event) => {
        const productId = event.target.dataset.productId;
        const newQuantity = parseInt(event.target.value);
        if (!isNaN(newQuantity)) {
            updateCartQuantity(productId, newQuantity);
        }
      });
    });

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-item-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const productId = event.target.dataset.productId;
        removeFromCart(productId);
      });
    });
  }
}

// Function to update item quantity in the cart
function updateCartQuantity(productId, newQuantity) {
  let cartItems = getCartItems();
  const itemIndex = cartItems.findIndex(item => item.id === productId);
  if (itemIndex > -1 && newQuantity > 0) {
    cartItems[itemIndex].quantity = newQuantity;
    saveCartItems(cartItems);
    updateCartItemCount();
    renderCart(); // Re-render cart to update subtotals and total
  } else if (newQuantity <= 0) {
    removeFromCart(productId);
  }
}

// Function to remove an item from the cart
function removeFromCart(productId) {
  let cartItems = getCartItems();
  cartItems = cartItems.filter(item => item.id !== productId);
  saveCartItems(cartItems);
  updateCartItemCount();
  renderCart(); // Re-render cart after removal
}

// Custom Alert Box (replaces alert())
function showCustomAlert(message) {
  const alertBox = document.createElement('div');
  alertBox.className = 'custom-alert-box';
  alertBox.innerHTML = `
    <p>${message}</p>
    <button class="custom-alert-close-btn">OK</button>
  `;
  document.body.appendChild(alertBox);

  // Simple styling for the alert box (can be moved to CSS)
  alertBox.style.position = 'fixed';
  alertBox.style.top = '50%';
  alertBox.style.left = '50%';
  alertBox.style.transform = 'translate(-50%, -50%)';
  alertBox.style.backgroundColor = 'var(--color-primary-bg-light)';
  alertBox.style.border = '1px solid var(--color-accent-medium)';
  alertBox.style.borderRadius = '8px';
  alertBox.style.padding = '20px';
  alertBox.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
  alertBox.style.zIndex = '1000';
  alertBox.style.textAlign = 'center';
  alertBox.style.maxWidth = '300px';

  const closeBtn = alertBox.querySelector('.custom-alert-close-btn');
  closeBtn.style.marginTop = '15px';
  closeBtn.style.padding = '8px 15px';
  closeBtn.style.backgroundColor = 'var(--color-accent-medium)';
  closeBtn.style.color = 'var(--color-white)';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '5px';
  closeBtn.style.cursor = 'pointer';

  closeBtn.addEventListener('click', () => {
    document.body.removeChild(alertBox);
  });
}


// Banner Carousel Logic (for index.html only)
let currentSlide = 0;
let slides = []; // Will be populated on DOMContentLoaded
let slideInterval; // To store the interval ID

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (i === index) {
      slide.classList.add('active');
    }
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

function startSlideShow() {
  // Clear any existing interval to prevent multiple slideshows
  if (slideInterval) {
    clearInterval(slideInterval);
  }
  slideInterval = setInterval(nextSlide, 3000); // Change slide every 3 seconds
}


// Event Listeners for Add to Cart buttons and DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  if (addToCartButtons) {
    addToCartButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const productId = button.dataset.productId;
        const productName = button.dataset.productName;
        const productPrice = parseFloat(button.dataset.productPrice);
        const productImage = button.dataset.productImage; // Get the image path

        // Specific handling for 'The Jefe's Curse' Paperback and Hardcover
        if (productId === "APP010-P" || productId === "APP010-H" || productId === "APP011-P" || productId === "APP011-H") { // Added Caution: Rulebreakers IDs
            // For books with multiple editions, ensure the correct price is used
            addToCart({ id: productId, name: productName, price: productPrice, image: productImage });
        } else {
            // For all other products
            addToCart({ id: productId, name: productName, price: productPrice, image: productImage });
        }
      });
    });
  }

  // Render cart items if on cart.html
  if (document.querySelector('.cart-table')) {
    renderCart();
  }

  // Handle PayPal Checkout Button
  const checkoutButton = document.querySelector('.checkout-btn');
  if (checkoutButton) {
      checkoutButton.addEventListener('click', () => {
          let cart = getCartItems();

          if (cart.length === 0) {
              showCustomAlert('Your cart is empty. Please add items before checking out.');
              return;
          }

          // Calculate the total amount including shipping for PayPal
          let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const totalAmountForPayPal = subtotal + SHIPPING_FEE;

          // Create a dynamic form for PayPal checkout
          const form = document.createElement('form');
          form.action = 'https://www.paypal.com/cgi-bin/webscr';
          form.method = 'post';
          form.target = '_top'; // Opens PayPal in the same window/tab

          form.innerHTML += '<input type="hidden" name="cmd" value="_cart">';
          form.innerHTML += '<input type="hidden" name="upload" value="1">';
          form.innerHTML += '<input type="hidden" name="business" value="appiahsisters@gmail.com">'; // Replace with your PayPal Business Email

          // Add each item from the cart
          cart.forEach((item, index) => {
              const itemNumber = index + 1;
              form.innerHTML += `<input type="hidden" name="item_name_${itemNumber}" value="${item.name} (${item.id})">`;
              form.innerHTML += `<input type="hidden" name="amount_${itemNumber}" value="${item.price.toFixed(2)}">`;
              form.innerHTML += `<input type="hidden" name="quantity_${itemNumber}" value="${item.quantity}">`;
          });

          // Add shipping as a separate item in PayPal checkout
          // PayPal's "_cart" command handles shipping via "shipping_1" or "shipping_amount"
          // For simplicity and consistency with the "unified payment" note, we'll add it as a separate item.
          form.innerHTML += `<input type="hidden" name="item_name_${cart.length + 1}" value="Shipping Fee">`;
          form.innerHTML += `<input type="hidden" name="amount_${cart.length + 1}" value="${SHIPPING_FEE.toFixed(2)}">`;
          form.innerHTML += `<input type="hidden" name="quantity_${cart.length + 1}" value="1">`;


          form.innerHTML += '<input type="hidden" name="currency_code" value="EUR">'; // Set your currency
          form.innerHTML += '<input type="hidden" name="no_shipping" value="1">'; // Set to 1 if you don't collect shipping via PayPal
          // *** IMPORTANT: Use absolute URLs for return and cancel_return ***
          form.innerHTML += `<input type="hidden" name="return" value="${WEBSITE_BASE_URL}success.html">`;
          form.innerHTML += `<input type="hidden" name="cancel_return" value="${WEBSITE_BASE_URL}cancel.html">`;

          document.body.appendChild(form);
          form.submit();
      });
  }

  updateCartItemCount(); // Initial count update for all pages

  // Initialize banner carousel ONLY if on index.html
  // Check if .banner-carousel exists on the current page
  const bannerCarouselElement = document.querySelector('.banner-carousel');
  if (bannerCarouselElement) {
    slides = document.querySelectorAll('.banner-slide');
    if (slides.length > 0) {
      showSlide(currentSlide); // Show the first slide immediately
      startSlideShow(); // Start the rotation
    }
  }
});
