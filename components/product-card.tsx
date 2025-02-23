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
  currentQuantity?: number;
}

export default function ProductCard({ product, addToCart, loadingProductId, currentQuantity = 0 }: ProductCardProps) {
  return (
    <Card
      key={product.productId}
      className="h-full flex flex-col shadow-md border border-border bg-card text-card-foreground rounded-lg overflow-hidden transition-transform hover:scale-[1.02]"
    >
      <Link href={`/products/${product.productId}`} className="block p-4 flex-grow">
        <CardHeader className="p-0 mb-2">
          <div className="flex flex-col space-y-1">
            <div className="relative group">
              <CardTitle className="text-lg font-semibold text-foreground truncate" title={product.name}>
                {product.name}
              </CardTitle>
            </div>
            {product.category && (
              <Badge variant="outline" className="bg-blue-400/10 text-xs ">
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
        {currentQuantity > 0 ? (
          <Button asChild variant="outline" className="w-full flex items-center text-primary hover:bg-primary/10">
            <Link href="/cart">Go to Cart</Link>
          </Button>
        ) : (
          <Button
            onClick={() => addToCart(product.productId, product.name, product.price)}
            disabled={loadingProductId === product.productId}
            variant="outline"
            className="flex items-center gap-2 text-primary hover:bg-primary/10 w-full"
          >
            <CirclePlus className="h-5 w-5" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
