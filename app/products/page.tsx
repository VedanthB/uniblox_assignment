"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { products } from "@/data/products";
import { useState } from "react";

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  // When user clicks "Add to Cart"
  const addToCart = async (productId: string, name: string, price: number) => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (!session?.user?.id) {
      alert("No user in session.");
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
        alert(data.error || "Error adding item");
      } else {
        alert(`${name} added to cart`);
      }
    } catch (error) {
      console.error("Network error adding to cart:", error);
    } finally {
      setLoadingProductId(null);
    }
  };

  // Then display the products
  return (
    <div>
      <h1>All Products</h1>
      <div style={{ display: "flex", gap: "10px" }}>
        {products.map((product) => (
          <div key={product.productId} style={{ border: "1px solid black", padding: "10px" }}>
            <img src={product.image} alt={product.name} width={100} />
            <h3>{product.name}</h3>
            <p>₹{product.price}</p>
            <button onClick={() => addToCart(product.productId, product.name, product.price)}>
              {loadingProductId === product.productId ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
