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

# Sidebar - Add New Product
st.sidebar.header("Add New Product")
new_name = st.sidebar.text_input("Product Name")
new_price = st.sidebar.number_input("Price (AED)", min_value=0.0, step=0.5)
new_qty = st.sidebar.number_input("Quantity in Stock", min_value=0, step=1)
new_cat = st.sidebar.selectbox("Category", ["Pens", "Markers", "Notebooks", "Others"])
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
            "img": "gel-pen.png" # Default placeholder
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
    # Display table
    st.dataframe(df[['name', 'category', 'price', 'quantity', 'desc']], use_container_width=True)
    
    # Analytics
    col1, col2, col3 = st.columns(3)
    col1.metric("Total Products", len(products))
    col2.metric("Total Stock", df['quantity'].sum())
    col3.metric("Average Price", f"AED {df['price'].mean():.2f}")

    # Delete Section
    st.subheader("Manage Items")
    item_to_delete = st.selectbox("Select item to remove", df['name'].tolist())
    if st.button("Delete Selected Item"):
        products = [p for p in products if p['name'] != item_to_delete]
        save_data(products)
        st.warning(f"Removed {item_to_delete}")
        st.rerun()
else:
    st.info("No products found in inventory.")

st.markdown("---")
st.caption("PenDen E-Commerce Engine © 2026")
