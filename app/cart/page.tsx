"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
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

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchCartAndCodes() {
      if (!userId) return;
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

  const handleCheckout = async () => {
    if (!userId) return;
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discountCode: discountCodeInput.trim() || null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setCart([]);
        setOrder(data.order);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-center">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {cart.map((item) => (
              <Card key={item.productId} className="mb-4 shadow-lg">
                <div className="flex">
                  <Link href={`/products/${item.productId}`}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={150}
                      height={150}
                      className="object-cover rounded-md cursor-pointer"
                    />
                  </Link>
                  <div className="flex flex-col justify-between p-4 w-full">
                    <div>
                      <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-gray-600">Price: ₹{item.price.toFixed(2)}</p>
                    </div>
                    <Button variant="outline" onClick={() => handleRemoveItem(item.productId)} className="mt-4 w-full">
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary & Discount Codes */}
          <div>
            <Card className="p-4 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg">Subtotal: ₹{calculateTotal().toFixed(2)}</p>

                {/* Discount Codes Section */}
                <div className="mt-6">
                  <h2 className="text-md font-semibold">Your Discount Codes</h2>
                  {discountCodes.length === 0 ? (
                    <p className="text-gray-500">No discount codes available.</p>
                  ) : (
                    <ul className="mt-2">
                      {discountCodes.map((dc, idx) => (
                        <li
                          key={idx}
                          className={`text-sm p-1 rounded ${dc.expired ? "text-gray-400" : "text-green-600"}`}
                        >
                          {dc.code} {dc.expired && <span>(Expired)</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Apply Discount Code */}
                <div className="mt-4">
                  <label htmlFor="discountCodeInput" className="block text-sm font-medium text-gray-700">
                    Apply Discount Code
                  </label>
                  <Input
                    id="discountCodeInput"
                    type="text"
                    value={discountCodeInput}
                    onChange={(e) => setDiscountCodeInput(e.target.value)}
                    placeholder="Enter code (optional)"
                    className="mt-1 w-full"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {/* Order Confirmation */}
      {order && (
        <div className="mt-8">
          <Card className="shadow-md p-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-green-600">Order Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                Order ID: <span className="font-semibold">{order.orderId}</span>
              </p>
              <p className="text-lg">Total Amount: ₹{order.totalAmount}</p>
              {order.discountApplied && (
                <p className="text-lg text-green-500">Discount Applied: {order.discountCode}</p>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/orders">
                <Button className="w-full">View Orders</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
