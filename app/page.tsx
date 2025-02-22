"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { products } from "@/data/products";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/product-card";

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

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
      toast.error("Network error. Please try again.");
    } finally {
      setLoadingProductId(null);
    }
  };

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts =
    selectedCategory === "All" ? products : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-foreground">All Products</h1>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="cursor-pointer"
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.productId}
            product={product}
            addToCart={addToCart}
            loadingProductId={loadingProductId}
          />
        ))}
      </div>
    </div>
  );
}
