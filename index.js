// PenDen E-Commerce Store Logic
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const penStock = document.getElementById('pen-stock');
    const markerStock = document.getElementById('marker-stock');
    const cartCount = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const cartIcon = cartCount.parentElement;
    const closeCart = document.getElementById('close-cart');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotalDisplay = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const productsGrid = document.querySelector('.products-grid');
    const toast = document.getElementById('toast');
    const successModal = document.getElementById('success-modal');

    // Cart State
    let cart = [];
    let count = 0;

    // Load Products
    const defaultProducts = [
        { id: 1, name: 'Uni-ball Elite', price: 5.50, category: 'Pens', quantity: 25, desc: 'Smooth ink, effortless precision.', img: 'uniball-pen.png' },
        { id: 2, name: 'Vivid Gel Pen', price: 5.00, category: 'Pens', quantity: 40, desc: 'Bold colors for bold ideas.', img: 'gel-pen.png' },
        { id: 3, name: 'Everyday Precision', price: 3.00, category: 'Pens', quantity: 100, desc: 'Reliable performance for daily tasks.', img: 'everyday-pen.png' }
    ];

    let products = [];

    async function initProducts() {
        try {
            // Try to fetch from products.json (synced from Streamlit)
            const response = await fetch('products.json');
            if (response.ok) {
                products = await response.json();
                console.log("Loaded products from products.json");
            } else {
                throw new Error("JSON not found");
            }
        } catch (err) {
            // Fallback to localStorage or defaults
            products = JSON.parse(localStorage.getItem('penden_products')) || defaultProducts;
            console.log("Loaded products from localStorage/Defaults");
        }
        renderStore();
    }

    function renderStore() {
        if (!productsGrid) return;
        productsGrid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image"><img src="${product.img}" alt="${product.name}"></div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p style="font-size: 0.9rem; color: #666; height: 3.6rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; margin-bottom: 0.5rem;">${product.desc}</p>
                    <div style="font-size: 0.8rem; color: ${product.quantity > 0 ? '#27ae60' : '#e74c3c'}; font-weight: 600; margin-bottom: 0.5rem;">
                        ${product.quantity > 0 ? `In Stock: ${product.quantity}` : 'Out of Stock'}
                    </div>
                    <div class="product-price">AED ${product.price.toFixed(2)}</div>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})" ${product.quantity <= 0 ? 'disabled style="background: #ccc; cursor: not-allowed;"' : ''} style="padding: 0.5rem 1rem; width: 100%; margin-top: 1rem;">
                        ${product.quantity > 0 ? 'Add to Cart' : 'Sold Out'}
                    </button>
                </div>
            `;
            productsGrid.appendChild(card);
        });
    }

    function showToast(msg) {
        const toastMsg = document.getElementById('toast-msg');
        toastMsg.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    window.addToCart = (id) => {
        const product = products.find(p => p.id === id);
        if (product) {
            cart.push(product);
            count++;
            updateCartUI();
            showToast(`${product.name} added to cart!`);
        }
    };

    function updateCartUI() {
        cartCount.innerText = count;
        cartCount.style.display = count > 0 ? 'block' : 'none';
        cartItemsList.innerHTML = '';
        let total = 0;
        cart.forEach((item, index) => {
            total += item.price;
            const cartItem = document.createElement('div');
            cartItem.style = 'display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #eee;';
            cartItem.innerHTML = `
                <span>${item.name}</span>
                <span>AED ${item.price.toFixed(2)} <i class="fa-solid fa-trash" style="color: #ff4444; cursor: pointer; margin-left: 10px;" onclick="removeFromCart(${index})"></i></span>
            `;
            cartItemsList.appendChild(cartItem);
        });
        cartTotalDisplay.innerText = `AED ${total.toFixed(2)}`;
    }

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        count--;
        updateCartUI();
    };

    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        cartModal.style.display = 'block';
    });

    closeCart.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    // Checkout
    checkoutBtn.addEventListener('click', () => {
        const name = document.getElementById('cust-name').value;
        const email = document.getElementById('cust-email').value;
        const phone = document.getElementById('cust-phone').value;

        if (cart.length === 0) {
            showToast('Your cart is empty!');
            return;
        }
        if (!name || !email || !phone) {
            showToast('Please fill in all details.');
            return;
        }

        const adminEmail = 'ameer.hamzasigma1980@gmail.com';
        const senderEmail = 'ai.tester005@gmail.com';
        const subject = encodeURIComponent(`New Order from PenDen - ${name}`);
        let orderItemsText = '';
        cart.forEach(item => {
            orderItemsText += `- ${item.name}: AED ${item.price.toFixed(2)}\n`;
        });

        const body = encodeURIComponent(
            `New Order Received via PenDen!\n\n` +
            `From Account: ${senderEmail}\n` +
            `---------------------------\n` +
            `Customer: ${name}\n` +
            `Email: ${email}\n` +
            `Phone: ${phone}\n\n` +
            `Order Details:\n${orderItemsText}\n` +
            `Total Amount: ${cartTotalDisplay.innerText}\n\n` +
            `Payment Method: Cash on Delivery`
        );

        const mailtoUrl = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
        
        // Trigger Email Client
        window.location.href = mailtoUrl;

        // Show Modern Success Modal
        cartModal.style.display = 'none';
        successModal.style.display = 'block';
        document.getElementById('success-msg').innerText = `Order drafted for ${name}! Please make sure to click "SEND" in your email app to notify the team.`;
    });

    initProducts();
    console.log("PenDen E-Commerce Engine Initialized.");
});
