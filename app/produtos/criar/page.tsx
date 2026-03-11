"use client";

import { useEffect, useState } from "react";
import { SelfProductsTable } from "@/components/self-products/self-product-table";
import { ProductSheet } from "@/components/self-products/product-sheet";
import { api } from "@/lib/api";
import { ProductForm } from "@/components/self-products/product-form";

type Supplier = { _id: string; name: string };

export default function ProductsPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    api<Supplier[]>("/api/suppliers").then(setSuppliers).catch(() => { });
  }, []);

  return (
    <div className="px-4 py-8">
      <ProductForm suppliers={suppliers} />
    </div>
  );
}
