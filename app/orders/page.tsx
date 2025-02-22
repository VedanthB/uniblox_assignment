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

interface Order {
  orderId: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  discountApplied?: boolean;
  discountCode?: string;
}

export default function OrderHistory() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (status === "loading") return; // Wait until session is known

    if (status === "unauthenticated") {
      // If not logged in, redirect to login
      router.push("/auth/login");
      return;
    }

    // If we are authenticated and have an ID, fetch that user's orders
    if (session?.user?.id) {
      fetchUserOrders(session.user.id);
    }
  }, [status, session, router]);

  async function fetchUserOrders(userId: string) {
    try {
      const response = await fetch(`/api/orders/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        console.error("Error fetching orders:", data.error);
      }
    } catch (error) {
      console.error("Network error fetching orders:", error);
    }
  }

  // If still loading or about to redirect, show nothing
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    // We already pushed to /auth/login above
    return null;
  }

  return (
    <div>
      <h1>Your Order History</h1>
      {orders.length === 0 ? (
        <p>You have no past orders.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.orderId}>
              <h3>Order ID: {order.orderId}</h3>
              <p>Total Amount: ₹{order.totalAmount}</p>
              {order.discountApplied && <p>Discount Applied: {order.discountCode}</p>}
              <h4>Items:</h4>
              <ul>
                {order.items.map((item) => (
                  <li key={item.productId}>
                    {item.name} - {item.quantity} x ₹{item.price}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
