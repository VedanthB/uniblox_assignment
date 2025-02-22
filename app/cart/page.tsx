"use client";

import { useEffect, useState } from "react";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface DiscountCodeInfo {
  code: string;
  expired: boolean;
}

interface Order {
  orderId: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  discountApplied?: boolean;
  discountCode?: string;
  newDiscountCode?: string; // optional if your API returns it
}

interface CartResponse {
  cart: CartItem[];
  discountCodes: DiscountCodeInfo[];
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCodeInfo[]>([]);
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [userId] = useState("user123"); // Temporary user session ID
  const [order, setOrder] = useState<Order | null>(null);

  // 1) Fetch cart & discount codes
  useEffect(() => {
    async function fetchCartAndCodes() {
      try {
        const response = await fetch(`/api/cart/${userId}`);
        const data: CartResponse = await response.json();

        if (response.ok) {
          setCart(data.cart || []);
          setDiscountCodes(data.discountCodes || []);
        } else {
          console.error("Error fetching cart:", data);
        }
      } catch (error) {
        console.error("Network error fetching cart:", error);
      }
    }
    fetchCartAndCodes();
  }, [userId]);

  // 2) Remove an item from cart
  const handleRemoveItem = async (productId: string) => {
    try {
      const response = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });

      if (response.ok) {
        // Update cart in UI
        setCart(cart.filter((item) => item.productId !== productId));
      } else {
        console.error("Error removing item");
      }
    } catch (error) {
      console.error("Network error removing item:", error);
    }
  };

  // 3) Checkout with optional discount code
  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          discountCode: discountCodeInput.trim() || null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Clear cart on UI
        setCart([]);
        // Store the order details for display
        setOrder(data.order);
      } else {
        // If discount code was invalid or any other error:
        alert(data.error);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  return (
    <div>
      <h1>Your Cart</h1>

      {/* CART ITEMS */}
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

      {/* DISCOUNT CODES */}
      <div style={{ marginTop: "1rem" }}>
        <h2>Your Discount Codes</h2>
        {discountCodes.length === 0 ? (
          <p>No discount codes yet.</p>
        ) : (
          <ul>
            {discountCodes.map((dc, idx) => (
              <li key={idx}>
                {dc.code} {dc.expired && <strong>(Expired)</strong>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* INPUT FIELD FOR CODE */}
      {cart.length > 0 && (
        <div style={{ margin: "1rem 0" }}>
          <label htmlFor="discountCodeInput">Enter a Discount Code (optional):</label>
          <br />
          <input
            id="discountCodeInput"
            type="text"
            value={discountCodeInput}
            onChange={(e) => setDiscountCodeInput(e.target.value)}
            placeholder="DISCOUNT-123456"
          />
        </div>
      )}

      {/* CHECKOUT BUTTON */}
      {cart.length > 0 && <button onClick={handleCheckout}>Proceed to Checkout</button>}

      {/* ORDER CONFIRMATION */}
      {order && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Order Confirmation</h2>
          <p>Order ID: {order.orderId}</p>
          <p>Total Amount: ₹{order.totalAmount}</p>
          {order.discountApplied && <p>Discount Applied: {order.discountCode}</p>}
          {order.newDiscountCode && <p>New Discount Code: {order.newDiscountCode}</p>}
          <a href="/orders">
            <button>View Orders</button>
          </a>
        </div>
      )}
    </div>
  );
}
