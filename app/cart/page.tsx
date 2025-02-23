"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import CartItem from "@/components/cart-item";

interface CartItemType {
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
  totalAmount: number;
  discountApplied?: boolean;
  discountCode?: string;
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCodeInfo[]>([]);
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (session?.user?.id) {
      fetchCart();
    }
  }, [status, session, router]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`/api/cart/${session?.user?.id}`);
      const data = await response.json();
      if (response.ok) {
        setCart(data.cart || []);
        setDiscountCodes(data.discountCodes || []);
      } else {
        toast.error("Error loading cart.");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!session?.user?.id) return;

    setLoadingProductId(productId);
    try {
      const response = await fetch("/api/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, productId }),
      });

      if (!response.ok) {
        toast.error("Error removing item.");
      } else {
        toast.success("Item removed from cart.");
        setCart(cart.filter((item) => item.productId !== productId));
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoadingProductId(null);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch("/api/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          productId,
          quantity: newQuantity,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Error updating quantity");
      } else {
        fetchCart();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const handleCheckout = async () => {
    if (!session?.user?.id) return;

    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountCode: discountCodeInput.trim() || null }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Checkout failed.");
      } else {
        toast.success("Order placed successfully!");
        setCart([]); // Clear cart after successful checkout
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-muted-foreground text-center">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                removeFromCart={removeFromCart}
                loadingProductId={loadingProductId}
                updateQuantity={updateQuantity}
                userId={session!.user.id}
              />
            ))}
          </div>

          {/* Order Summary & Discount Codes */}
          <div>
            <Card className="p-4 shadow-md border border-border bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium text-muted-foreground">Subtotal: ₹{calculateTotal().toFixed(2)}</p>

                {/* Discount Codes */}
                <div className="mt-6">
                  <h2 className="text-md font-semibold text-foreground">Your Discount Codes</h2>
                  {discountCodes.length === 0 ? (
                    <p className="text-muted-foreground">No discount codes available.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {discountCodes.map((dc, idx) => (
                        <Badge key={idx} variant={dc.expired ? "destructive" : "outline"} className="text-xs">
                          {dc.code} {dc.expired && <span>(Expired)</span>}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Apply Discount Code */}
                <div className="mt-4">
                  <label htmlFor="discountCodeInput" className="block text-sm font-medium text-muted-foreground">
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
                <Button className="w-full" onClick={handleCheckout} disabled={isCheckingOut}>
                  {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {/* Order Confirmation */}
      {order && (
        <div className="mt-8">
          <Card className="shadow-md p-6 border border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-green-500">Order Confirmed</CardTitle>
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
              <Button asChild className="w-full">
                <Link href="/orders">View Orders</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
