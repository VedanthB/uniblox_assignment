"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
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

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Your Order History</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center">You have no past orders.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card
              key={order.orderId}
              className="shadow-sm border border-border bg-card text-card-foreground p-5 flex flex-col rounded-lg"
            >
              {/* Order Details */}
              <CardHeader className="p-0 mb-3">
                <p className="text-xs uppercase text-muted-foreground">Order ID:</p>
                <CardTitle className="text-lg font-semibold text-primary">{order.orderId}</CardTitle>
                <p className="text-sm text-muted-foreground">Total: ₹{order.totalAmount.toFixed(2)}</p>
                {order.discountApplied && (
                  <p className="text-sm text-green-500">Discount Applied: {order.discountCode}</p>
                )}
              </CardHeader>

              {/* Items List */}
              <CardContent className="flex-grow border-t pt-3 space-y-2">
                <h4 className="text-sm font-medium text-foreground mb-2">Items:</h4>
                <ul className="space-y-1">
                  {order.items.slice(0, 3).map((item) => (
                    <li key={item.productId} className="text-sm text-muted-foreground flex justify-between">
                      <span className="truncate">{item.name}</span>
                      <span className="text-xs">Qty: {item.quantity}</span>
                    </li>
                  ))}
                </ul>

                {/* "+X more items" if more than 3 */}
                {order.items.length > 3 && (
                  <p className="text-xs text-muted-foreground text-right mt-2">+{order.items.length - 3} more items</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
