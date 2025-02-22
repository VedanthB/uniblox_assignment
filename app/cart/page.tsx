"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  newDiscountCode?: string;
}

interface CartResponse {
  cart: CartItem[];
  discountCodes: DiscountCodeInfo[];
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCodeInfo[]>([]);
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [order, setOrder] = useState<Order | null>(null);

  const [userId, setUserId] = useState("");

  // On load or whenever auth status changes, decide if user can access
  useEffect(() => {
    if (status === "loading") return; // still checking session
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [status, session, router]);

  // Once we have a valid userId, fetch their cart
  useEffect(() => {
    async function fetchCartAndCodes() {
      if (!userId) return; // no user yet
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

  // Remove an item from cart
  const handleRemoveItem = async (productId: string) => {
    if (!userId) return;
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

  // Checkout with optional discount code
  const handleCheckout = async () => {
    if (!userId) return;
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // userId is NOT needed by the server – it reads from session
          discountCode: discountCodeInput.trim() || null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setCart([]);
        setOrder(data.order);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  // If still loading the session or about to redirect, show nothing
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // If not logged in, we push to /auth/login in the useEffect, so we can also show nothing here:
  if (!session) {
    return null;
  }

  // Render cart content
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
