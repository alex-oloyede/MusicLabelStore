// Sample product data
const products = [
    {
        id: 1,
        name: "Music 1",
        price: 9.99,
        image: "label1.webp"
    },
    {
        id: 2,
        name: "Music 2",
        price: 19.99,
        image: "label2.jpg"
    },
    {
        id: 3,
        name: "Podcast 1",
        price: 9.99,
        image: "label3.webp"
    },
    {
        id: 4,
        name: "Music 3",
        price: 7.99,
        image: "label4.jpg"
    },
    {
        id: 5,
        name: "Podcast 2",
        price: 5.99,
        image: "label5.jpg"
    },
    {
        id: 6,
        name: "Music 4",
        price: 6.99,
        image: "label6.jpg"
    }
];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartIcon = document.getElementById('cartIcon');
const cartCount = document.getElementById('cartCount');
const cartSection = document.getElementById('cartSection');
const cartItems = document.getElementById('cartItems');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');
const orderModal = document.getElementById('orderModal');
const closeModal = document.getElementById('closeModal');
const orderForm = document.getElementById('orderForm');
const successMessage = document.getElementById('successMessage');

// Cart state
let cart = [];

// Initialize the store
function initStore() {
    renderProducts();
    loadCart();
    updateCartUI();
    setupEventListeners();
}

// Render products to the page
function renderProducts() {
    productsGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Add to cart buttons
    productsGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
        }
    });

    // Cart icon click
    cartIcon.addEventListener('click', () => {
        cartSection.style.display = cart.length ? 'block' : 'none';
    });

    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        orderModal.style.display = 'flex';
    });

    // Close modal
    closeModal.addEventListener('click', () => {
        orderModal.style.display = 'none';
    });

    // Order form submission
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        orderModal.style.display = 'none';
        successMessage.style.display = 'block';
        clearCart();
    });

    // Close modal if clicked outside
    window.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.style.display = 'none';
        }
    });
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    
    // Show cart section if it was hidden
    cartSection.style.display = 'block';
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartUI();
    }
}

// Update cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Render cart items
    cartItems.innerHTML = '';
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartSection.style.display = 'none';
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                <button class="quantity-btn plus" data-id="${item.id}">+</button>
            </div>
            <button class="remove-item" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });

    // Add event listeners to quantity buttons and remove buttons
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const item = cart.find(item => item.id === id);
            if (item) updateQuantity(id, item.quantity - 1);
        });
    });

    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const item = cart.find(item => item.id === id);
            if (item) updateQuantity(id, item.quantity + 1);
        });
    });

    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const newQuantity = parseInt(e.target.value);
            if (!isNaN(newQuantity)) updateQuantity(id, newQuantity);
        });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.remove-item').getAttribute('data-id'));
            removeFromCart(id);
        });
    });

    // Update totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const total = subtotal

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Clear cart
function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

// Initialize the store when the page loads
document.addEventListener('DOMContentLoaded', initStore);