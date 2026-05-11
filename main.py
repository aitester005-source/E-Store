import streamlit as st
import pandas as pd
import json
import os

# Set page config
st.set_page_config(page_title="PenDen Admin | Streamlit", page_icon="🖋️", layout="wide")

# Title and Description
st.title("🖋️ PenDen Inventory Management")
st.markdown("Welcome to the Streamlit-powered backend for **PenDen**. Manage your stock and products efficiently.")

# Load Data (Simulating the localStorage data in Python)
DATA_FILE = 'products.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    else:
        # Default data if file doesn't exist
        return [
            {"id": 1, "name": "Uni-ball Elite", "price": 5.50, "category": "Pens", "quantity": 25, "desc": "Smooth ink, effortless precision.", "img": "uniball-pen.png"},
            {"id": 2, "name": "Vivid Gel Pen", "price": 5.00, "category": "Pens", "quantity": 40, "desc": "Bold colors for bold ideas.", "img": "gel-pen.png"},
            {"id": 3, "name": "Everyday Precision", "price": 3.00, "category": "Pens", "quantity": 100, "desc": "Reliable performance for daily tasks.", "img": "everyday-pen.png"}
        ]

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

# Load current products
products = load_data()

# Sidebar - Navigation & Store Link
st.sidebar.title("Navigation")
# Use index.html explicitly for the link
st.sidebar.markdown(f"[🔗 View Public Store](https://aitester005-source.github.io/E-Store/index.html)")
st.sidebar.markdown("---")

# Sidebar - Add New Product
st.sidebar.header("Add New Product")
new_name = st.sidebar.text_input("Product Name")
new_price = st.sidebar.number_input("Price (AED)", min_value=0.0, step=0.5)
new_qty = st.sidebar.number_input("Quantity in Stock", min_value=0, step=1)
new_cat = st.sidebar.selectbox("Category", ["Pens", "Markers", "Notebooks", "Others"])

# Image Uploader for New Product
uploaded_file = st.sidebar.file_uploader("Upload Product Image", type=["png", "jpg", "jpeg"])
new_img_name = "gel-pen.png" # Default
if uploaded_file:
    new_img_name = uploaded_file.name
    with open(new_img_name, "wb") as f:
        f.write(uploaded_file.getbuffer())
    st.sidebar.info(f"Uploaded: {new_img_name}")

new_desc = st.sidebar.text_area("Description")

if st.sidebar.button("Add Product"):
    if new_name:
        new_product = {
            "id": int(pd.Timestamp.now().timestamp()),
            "name": new_name,
            "price": new_price,
            "category": new_cat,
            "quantity": new_qty,
            "desc": new_desc,
            "img": new_img_name
        }
        products.append(new_product)
        save_data(products)
        st.sidebar.success(f"Added {new_name}!")
        st.rerun()
    else:
        st.sidebar.error("Please enter a product name.")

# Main View - Inventory Table
st.subheader("Current Inventory")
df = pd.DataFrame(products)
if not df.empty:
    # Display table with image column
    st.dataframe(df[['name', 'category', 'price', 'quantity', 'img', 'desc']], use_container_width=True)
    
    # Visual Gallery
    st.markdown("### 🖼️ Product Gallery")
    cols = st.columns(4)
    for idx, product in enumerate(products):
        with cols[idx % 4]:
            if os.path.exists(product['img']):
                st.image(product['img'], caption=product['name'], use_column_width=True)
            else:
                st.info(f"No image: {product['img']}")

    # Analytics
    st.markdown("---")
    col1, col2, col3 = st.columns(3)
    col1.metric("Total Products", len(products))
    col2.metric("Total Stock", df['quantity'].sum())
    col3.metric("Average Price", f"AED {df['price'].mean():.2f}")

    # Manage Section (Edit & Delete)
    st.markdown("---")
    colA, colB = st.columns(2)

    with colA:
        st.subheader("✏️ Edit Item")
        edit_item_name = st.selectbox("Select item to edit", df['name'].tolist())
        product_to_edit = next((p for p in products if p['name'] == edit_item_name), None)
        
        if product_to_edit:
            # Show current image
            if os.path.exists(product_to_edit['img']):
                st.image(product_to_edit['img'], width=100)
            
            edit_price = st.number_input("Edit Price", value=float(product_to_edit['price']), step=0.5, key="edit_price")
            edit_qty = st.number_input("Edit Quantity", value=int(product_to_edit['quantity']), step=1, key="edit_qty")
            
            # Image Uploader for Editing
            edit_uploaded_file = st.file_uploader("Change Product Image", type=["png", "jpg", "jpeg"], key="edit_upload")
            edit_img = product_to_edit['img']
            if edit_uploaded_file:
                edit_img = edit_uploaded_file.name
                with open(edit_img, "wb") as f:
                    f.write(edit_uploaded_file.getbuffer())
                st.info(f"Updated Image: {edit_img}")

            edit_desc = st.text_area("Edit Description", value=product_to_edit['desc'], key="edit_desc")
            
            if st.button("Update Item"):
                product_to_edit['price'] = edit_price
                product_to_edit['quantity'] = edit_qty
                product_to_edit['img'] = edit_img
                product_to_edit['desc'] = edit_desc
                save_data(products)
                st.success(f"Updated {edit_item_name}!")
                st.rerun()

    with colB:
        st.subheader("🗑️ Delete Item")
        item_to_delete = st.selectbox("Select item to remove", df['name'].tolist(), key="delete_box")
        if st.button("Delete Selected Item"):
            products = [p for p in products if p['name'] != item_to_delete]
            save_data(products)
            st.warning(f"Removed {item_to_delete}")
            st.rerun()
else:
    st.info("No products found in inventory.")

st.markdown("---")
st.caption("PenDen E-Commerce Engine © 2026")
