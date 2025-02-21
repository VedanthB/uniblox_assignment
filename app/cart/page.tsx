"use client";

import { useEffect, useState } from "react";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  orderId: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  discountApplied?: boolean;
  discountCode?: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userId] = useState("user123"); // Temporary user session ID
  const [order, setOrder] = useState<Order | null>(null); // ✅ Store order after checkout

  useEffect(() => {
    async function fetchCart() {
      try {
        const response = await fetch(`/api/cart/${userId}`);
        const data = await response.json();
        if (response.ok) {
          setCart(data.cart || []);
        } else {
          console.error("Error fetching cart:", data.error);
        }
      } catch (error) {
        console.error("Network error fetching cart:", error);
      }
    }
    fetchCart();
  }, [userId]);

  const handleRemoveItem = async (productId: string) => {
    try {
      const response = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });

      if (response.ok) {
        setCart(cart.filter((item) => item.productId !== productId));
      } else {
        console.error("Error removing item");
      }
    } catch (error) {
      console.error("Network error removing item:", error);
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (response.ok) {
        setCart([]); // Clear cart on UI
        setOrder(data.order); // ✅ Store the order details
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    }
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
      {cart.length > 0 && <button onClick={handleCheckout}>Proceed to Checkout</button>}

      {order && (
        <div>
          <h2>Order Confirmation</h2>
          <p>Order ID: {order.orderId}</p>
          <p>Total Amount: ₹{order.totalAmount}</p>
          {order.discountApplied && <p>Discount Applied: {order.discountCode}</p>}
          <a href="/orders">
            <button>View Orders</button>
          </a>
        </div>
      )}
    </div>
  );
}
