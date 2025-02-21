"use client";

import { products } from "@/lib/products";
import { useState } from "react";

export default function ProductsPage() {
  const [userId] = useState("user123"); // Temporary user session ID

  const addToCart = async (productId: string, name: string, price: number) => {
    await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId, name, price, quantity: 1 }),
    });
    alert(`${name} added to cart`);
  };

  return (
    <div>
      <h1>All Products</h1>
      <div style={{ display: "flex", gap: "10px" }}>
        {products.map((product) => (
          <div key={product.productId} style={{ border: "1px solid black", padding: "10px" }}>
            <img src={product.image} alt={product.name} width={100} />
            <h3>{product.name}</h3>
            <p>₹{product.price}</p>
            <button onClick={() => addToCart(product.productId, product.name, product.price)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
