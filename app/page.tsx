"use client";

import { useState, useEffect } from "react";
import { products } from "@/data/products";

interface Product {
  productId: string;
  name: string;
  price: number;
  image: string;
}

export default function Home() {
  const [randomProducts, setRandomProducts] = useState<Product[]>([]); // ✅ Define Type

  useEffect(() => {
    // Shuffle and get 3 random products
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    setRandomProducts(shuffled.slice(0, 3));
  }, []);

  return (
    <div>
      <h1>Welcome to Our Store</h1>
      <div style={{ display: "flex", gap: "10px" }}>
        {randomProducts.map((product) => (
          <div key={product.productId} style={{ border: "1px solid black", padding: "10px" }}>
            <img src={product.image} alt={product.name} width={100} />
            <h3>{product.name}</h3>
            <p>₹{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
