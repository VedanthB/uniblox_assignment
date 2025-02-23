"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  discountApplied?: boolean;
  discountCode?: string;
}

interface DiscountCode {
  code: string;
  expired: boolean;
}

interface AdminSummary {
  totalOrders: number;
  totalItemsPurchased: number;
  totalPurchaseAmount: number;
  totalDiscountAmount: number;
  orders: Order[];
  userDiscounts: Record<string, DiscountCode[]>;
  adminDiscountCodes: string[];
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [summary, setSummary] = useState<AdminSummary | null>(null);

  // State for discount code generation form
  const [userIdForDiscount, setUserIdForDiscount] = useState<string>("");
  const [generatedDiscountCode, setGeneratedDiscountCode] = useState<string | null>(null);

  // Define the chart configuration required by ChartContainer
  const chartConfig: ChartConfig = {
    name: {
      label: "Metric",
    },
    value: {
      label: "Value",
      color: "hsl(var(--chart-1))",
    },
  };

  useEffect(() => {
    // (Optional) Restrict access to admin users:
    // if (session?.user?.role !== "admin") {
    //   router.push("/");
    //   return;
    // }

    fetch("/api/admin/summary")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch admin summary");
        }
        return res.json();
      })
      .then((data: AdminSummary) => {
        setSummary(data);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to fetch admin summary.");
      });
  }, [session, router]);

  const handleGenerateDiscount = async () => {
    // For demonstration purposes only; do not expose your admin key in production.
    const adminKey = "mysecureadminkey";
    const payload: { adminKey: string; userId?: string } = { adminKey };

    if (userIdForDiscount.trim() !== "") {
      payload.userId = userIdForDiscount.trim();
    }

    try {
      const res = await fetch("/api/admin/generate-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error generating discount code");
      } else {
        toast.success(data.message || "Discount code generated");
        setGeneratedDiscountCode(data.discountCode);
        // Optionally refresh summary here if needed.
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while generating discount code");
    }
  };

  if (status === "loading") {
    return <div className="container mx-auto p-6">Loading...</div>;
  }
  if (!session) {
    return <div className="container mx-auto p-6">You are not logged in.</div>;
  }
  if (!summary) {
    return <div className="container mx-auto p-6">Loading summary...</div>;
  }

  // Prepare chart data based on summary values
  const chartData = [
    { name: "Total Orders", value: summary.totalOrders },
    { name: "Items Purchased", value: summary.totalItemsPurchased },
    { name: "Purchase Amount", value: summary.totalPurchaseAmount },
    { name: "Discount Amount", value: summary.totalDiscountAmount },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Admin Dashboard</h1>

      {/* Admin Summary Card */}
      <Card className="border border-border bg-card text-card-foreground shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Admin Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>Total Orders: {summary.totalOrders}</p>
          <p>Total Items Purchased: {summary.totalItemsPurchased}</p>
          <p>Total Purchase Amount: ₹{summary.totalPurchaseAmount.toFixed(2)}</p>
          <p>Total Discount Amount: ₹{summary.totalDiscountAmount.toFixed(2)}</p>

          <div className="mt-4">
            <h2 className="font-semibold">Admin Discount Codes:</h2>
            <ul className="list-disc list-inside text-sm space-y-1 mt-1">
              {summary.adminDiscountCodes.map((code) => (
                <li key={code}>{code}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h2 className="font-semibold">User Discount Codes:</h2>
            {Object.entries(summary.userDiscounts).map(([userId, codes]) => (
              <div key={userId} className="mb-2">
                <p className="text-sm font-medium">User {userId}:</p>
                <ul className="list-disc list-inside text-sm pl-4">
                  {codes.map((dc) => (
                    <li key={dc.code}>
                      {dc.code} {dc.expired && "(expired)"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discount Code Generation Card */}
      <Card className="border border-border bg-card text-card-foreground shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Generate Discount Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Enter a user ID to generate a discount code for a specific user. Leave blank to generate a global discount
            code.
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="userId">
              User ID (optional):
            </label>
            <input
              id="userId"
              type="text"
              value={userIdForDiscount}
              onChange={(e) => setUserIdForDiscount(e.target.value)}
              placeholder="Enter user ID"
              className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <Button onClick={handleGenerateDiscount} className="mt-2 w-full">
            Generate Discount Code
          </Button>
          {generatedDiscountCode && (
            <p className="mt-2 text-sm font-semibold text-green-500">Generated Code: {generatedDiscountCode}</p>
          )}
        </CardContent>
      </Card>

      {/* Summary Chart Card */}
      <Card className="border border-border bg-card text-card-foreground shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Summary Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "var(--foreground)" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
