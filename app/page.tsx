"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { products } from "@/data/products";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const addToCart = async (productId: string, name: string, price: number) => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (!session?.user?.id) {
      toast.error("No user in session.");
      return;
    }

    setLoadingProductId(productId);
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          productId,
          name,
          price,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Error adding item");
      } else {
        toast.success(`${name} added to cart`);
      }
    } catch (error) {
      console.error("Network error adding to cart:", error);
    } finally {
      setLoadingProductId(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.productId} className="shadow-md">
            <Link href={`/products/${product.productId}`}>
              <CardHeader className="p-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="object-cover w-full h-48"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
                <p className="text-gray-600">₹{product.price}</p>
              </CardContent>
            </Link>
            <CardFooter className="p-4">
              <Button
                onClick={() => addToCart(product.productId, product.name, product.price)}
                disabled={loadingProductId === product.productId}
                className="w-full"
              >
                {loadingProductId === product.productId ? "Adding..." : "Add to Cart"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
