"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import QuantityStepper from "@/components/quantity-stepper";

interface CartItemType {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartItemProps {
  item: CartItemType;
  removeFromCart: (productId: string) => void;
  loadingProductId: string | null;
  // New prop for updating quantity:
  updateQuantity: (productId: string, newQuantity: number) => void;
  userId: string;
}

export default function CartItem({ item, removeFromCart, loadingProductId, updateQuantity, userId }: CartItemProps) {
  return (
    <Card
      key={item.productId}
      className="shadow-md p-4 flex flex-col border border-border bg-card text-card-foreground"
    >
      <CardHeader className="p-0 mb-2">
        <CardTitle className="text-lg font-semibold text-foreground truncate">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            <p>₹{item.price}</p>
            <p className="text-xs">Quantity: {item.quantity}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <QuantityStepper
              productId={item.productId}
              currentQuantity={item.quantity}
              userId={userId}
              onQuantityChange={updateQuantity}
            />
            <Button
              onClick={() => removeFromCart(item.productId)}
              disabled={loadingProductId === item.productId}
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              size="icon"
              aria-label="Remove item"
            >
              <Trash className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
