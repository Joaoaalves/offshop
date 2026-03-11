"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./product-form";
import { ProductImport } from "./product-import";

type Supplier = { _id: string; name: string };

interface Props {
  suppliers: Supplier[];
}

export function ProductSheet({ suppliers }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-2xl"
      >
        <SheetHeader className="pb-2">
          <SheetTitle>Adicionar Produto</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-8">
          <Tabs defaultValue="manual">
            <TabsList className="mb-6">
              <TabsTrigger value="manual">Criar Manualmente</TabsTrigger>
              <TabsTrigger value="import">Importar Arquivo</TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <ProductForm
                suppliers={suppliers}
                onSuccess={() => setOpen(false)}
              />
            </TabsContent>

            <TabsContent value="import">
              <ProductImport
                suppliers={suppliers}
                onSuccess={() => setOpen(false)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
