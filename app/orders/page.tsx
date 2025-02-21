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

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userId] = useState("user123"); // Temporary user session ID

  useEffect(() => {
    async function fetchOrders() {
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
    fetchOrders();
  }, [userId]);

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
