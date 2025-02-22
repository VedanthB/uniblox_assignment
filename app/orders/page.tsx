"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
      <h1 className="text-3xl font-bold mb-6">Your Order History</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center">You have no past orders.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card key={order.orderId} className="shadow-lg flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Order ID: {order.orderId}</CardTitle>
                <p className="text-gray-500">Total Amount: ₹{order.totalAmount.toFixed(2)}</p>
                {order.discountApplied && <p className="text-green-500">Discount Applied: {order.discountCode}</p>}
              </CardHeader>
              <CardContent className="flex-grow">
                <h4 className="font-medium">Items:</h4>
                <ul className="list-disc list-inside">
                  {order.items.map((item) => (
                    <li key={item.productId}>
                      {item.name} - {item.quantity} x ₹{item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
