"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { products } from "@/data/products";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/product-card";

interface CartItemType {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

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
        setCartItems(data.cart || []);
      } else {
        toast.error("Error loading cart.");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const addToCart = async (productId: string, name: string, price: number) => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (!session?.user?.id) {
      toast.error("No user in session.");
      return;
    }

    // If product is already in cart, navigate to cart instead
    const existingItem = cartItems.find((item) => item.productId === productId);
    if (existingItem) {
      router.push("/cart");
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
        fetchCart();
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

  // Map productId to quantity
  const cartMap = cartItems.reduce<Record<string, number>>((acc, item) => {
    acc[item.productId] = item.quantity;
    return acc;
  }, {});

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
            currentQuantity={cartMap[product.productId] || 0}
          />
        ))}
      </div>
    </div>
  );
}
