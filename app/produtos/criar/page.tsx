"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductForm } from "@/components/self-products/product-form";
import { ProductImport } from "@/components/self-products/product-import";
import { api } from "@/lib/api";

type Supplier = { _id: string; name: string };

export default function CreateProductPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    api<Supplier[]>("/api/suppliers").then(setSuppliers).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Produtos</h1>

      <Tabs defaultValue="manual">
        <TabsList className="mb-6">
          <TabsTrigger value="manual">Criar Manualmente</TabsTrigger>
          <TabsTrigger value="import">Importar Arquivo</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <ProductForm suppliers={suppliers} />
        </TabsContent>

        <TabsContent value="import">
          <ProductImport suppliers={suppliers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
