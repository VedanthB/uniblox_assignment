"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface QuantityStepperProps {
  productId: string;
  currentQuantity: number;
  userId: string;
  onQuantityChange: (productId: string, newQuantity: number) => void;
}

export default function QuantityStepper({
  productId,
  currentQuantity,
  userId,
  onQuantityChange,
}: QuantityStepperProps) {
  const [quantity, setQuantity] = useState(currentQuantity);

  const updateQuantity = async (newQuantity: number) => {
    try {
      const res = await fetch("/api/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, quantity: newQuantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error updating quantity");
      } else {
        setQuantity(newQuantity);
        onQuantityChange(productId, newQuantity);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Network error updating quantity");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => updateQuantity(quantity - 1)} disabled={quantity === 1}>
        –
      </Button>
      <span>{quantity}</span>
      <Button variant="outline" size="sm" onClick={() => updateQuantity(quantity + 1)}>
        +
      </Button>
    </div>
  );
}
