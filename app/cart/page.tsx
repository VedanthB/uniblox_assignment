"use client";

import { useEffect, useState } from "react";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userId] = useState("user123"); // Temporary user session ID

  useEffect(() => {
    async function fetchCart() {
      const response = await fetch(`/api/cart/${userId}`);
      const data = await response.json();
      setCart(data.cart || []);
    }
    fetchCart();
  }, [userId]);

  const handleRemoveItem = async (productId: string) => {
    await fetch("/api/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId }),
    });
    setCart(cart.filter((item) => item.productId !== productId));
  };

  return (
    <div>
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item.productId}>
              {item.name} - {item.quantity} x ₹{item.price}
              <button onClick={() => handleRemoveItem(item.productId)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
