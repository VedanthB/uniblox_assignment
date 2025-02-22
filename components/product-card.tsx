import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CirclePlus } from "lucide-react";

interface Product {
  productId: string;
  name: string;
  price: number;
  category?: string;
}

interface ProductCardProps {
  product: Product;
  addToCart: (productId: string, name: string, price: number) => void;
  loadingProductId: string | null;
}

export default function ProductCard({ product, addToCart, loadingProductId }: ProductCardProps) {
  return (
    <Card
      key={product.productId}
      className="h-full flex flex-col shadow-md border border-border bg-card text-card-foreground rounded-lg overflow-hidden transition-transform hover:scale-[1.02]"
    >
      <Link href={`/products/${product.productId}`} className="block p-4 flex-grow">
        <CardHeader className="p-0 mb-2">
          {/* Consistent title height, truncate long names */}
          <div className="flex flex-col space-y-1">
            <div className="relative group">
              <CardTitle className="text-lg font-semibold text-foreground truncate" title={product.name}>
                {product.name}
              </CardTitle>
            </div>
            {product.category && (
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-2">
          <p className="text-muted-foreground text-sm font-medium">₹{product.price}</p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 border-t flex justify-center">
        <Button
          onClick={() => addToCart(product.productId, product.name, product.price)}
          disabled={loadingProductId === product.productId}
          variant="ghost"
          className="flex items-center gap-2 text-primary hover:bg-primary/10 w-full"
        >
          <CirclePlus className="h-5 w-5" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
