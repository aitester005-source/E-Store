// Admin Dashboard Logic
document.addEventListener('DOMContentLoaded', () => {
    const addItemForm = document.getElementById('add-item-form');
    const inventoryList = document.getElementById('inventory-list');
    const submitBtn = document.getElementById('submit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const itemIdInput = document.getElementById('item-id');
    const imageInput = document.getElementById('item-image');
    const imgPreview = document.getElementById('img-preview');

    let currentBase64Image = '';

    // Load items from localStorage
    const defaultProducts = [
        { id: 1, name: 'Uni-ball Elite', price: 5.50, category: 'Pens', quantity: 25, desc: 'Smooth ink, effortless precision. The gold standard for professional writing.', img: 'uniball-pen.png' },
        { id: 2, name: 'Vivid Gel Pen', price: 5.00, category: 'Pens', quantity: 40, desc: 'Bold colors for bold ideas. High-pigment ink that dries instantly.', img: 'gel-pen.png' },
        { id: 3, name: 'Everyday Precision', price: 3.00, category: 'Pens', quantity: 100, desc: 'Reliable performance for daily tasks. Durable tip and comfortable grip.', img: 'everyday-pen.png' }
    ];

    let products = JSON.parse(localStorage.getItem('penden_products')) || defaultProducts;

    function renderInventory() {
        inventoryList.innerHTML = '';
        products.forEach(product => {
            const item = document.createElement('div');
            item.style = 'background: white; padding: 1.5rem; border-radius: 15px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: 0.3s; margin-bottom: 1rem;';
            item.innerHTML = `
                <div style="display: flex; gap: 1rem; align-items: center; flex: 1;">
                    <img src="${product.img}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #eee;">
                    <div style="flex: 1;">
                        <strong>${product.name}</strong> - <span style="color: var(--primary-blue); font-weight: 800;">AED ${product.price.toFixed(2)}</span>
                        <br><small style="color: #666; font-style: italic;">${product.category} | Stock: ${product.quantity || 0}</small>
                        <p style="font-size: 0.85rem; color: #888; margin-top: 0.3rem; max-width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${product.desc}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn" style="background: var(--primary-blue); color: white; padding: 0.5rem 1rem;" onclick="editItem(${product.id})">EDIT</button>
                    <button class="btn" style="background: #ff4444; color: white; padding: 0.5rem 1rem;" onclick="deleteItem(${product.id})">DELETE</button>
                </div>
            `;
            inventoryList.appendChild(item);
        });
    }

    // Handle Image Upload -> Base64
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                currentBase64Image = event.target.result;
                imgPreview.innerHTML = `<img src="${currentBase64Image}" style="width: 100%; height: 100%; object-fit: cover;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = itemIdInput.value;
        const productData = {
            name: document.getElementById('item-name').value,
            price: parseFloat(document.getElementById('item-price').value),
            category: document.getElementById('item-category').value,
            quantity: parseInt(document.getElementById('item-quantity').value) || 0,
            desc: document.getElementById('item-desc').value,
            img: currentBase64Image || 'gel-pen.png' // Use uploaded image or placeholder/existing
        };

        if (id) {
            // Edit Mode
            const index = products.findIndex(p => p.id == id);
            // If no new image was uploaded, keep the old one
            if (!currentBase64Image) {
                productData.img = products[index].img;
            }
            products[index] = { ...products[index], ...productData };
            alert('Product updated successfully!');
        } else {
            // Add Mode
            products.push({ id: Date.now(), ...productData });
            alert('Product added successfully!');
        }

        localStorage.setItem('penden_products', JSON.stringify(products));
        resetForm();
        renderInventory();
    });

    window.editItem = (id) => {
        const product = products.find(p => p.id == id);
        if (product) {
            document.getElementById('item-name').value = product.name;
            document.getElementById('item-price').value = product.price;
            document.getElementById('item-category').value = product.category;
            document.getElementById('item-quantity').value = product.quantity || 0;
            document.getElementById('item-desc').value = product.desc;
            itemIdInput.value = product.id;
            
            // Show current image in preview
            imgPreview.innerHTML = `<img src="${product.img}" style="width: 100%; height: 100%; object-fit: cover;">`;
            currentBase64Image = ''; // Reset until a new file is picked

            submitBtn.innerText = 'Update Product';
            cancelEditBtn.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    window.deleteItem = (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            products = products.filter(p => p.id !== id);
            localStorage.setItem('penden_products', JSON.stringify(products));
            renderInventory();
        }
    };

    cancelEditBtn.addEventListener('click', resetForm);

    function resetForm() {
        addItemForm.reset();
        itemIdInput.value = '';
        document.getElementById('item-quantity').value = '';
        currentBase64Image = '';
        imgPreview.innerHTML = '<span style="font-size: 0.7rem; color: #999;">No Image</span>';
        submitBtn.innerText = 'Add Product';
        cancelEditBtn.style.display = 'none';
    }

    renderInventory();
});
