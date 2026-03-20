"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PortalContainerContext } from "@/lib/portal-container-context";
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
import { TinyImportForm } from "./tiny-import-form";

type Supplier = { _id: string; name: string };

interface Props {
  suppliers: Supplier[];
}

export function ProductSheet({ suppliers }: Props) {
  const [open, setOpen] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

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
        {/* Portal container: renders combobox popups inside the dialog so  */}
        {/* Radix's aria-hidden doesn't block them.                          */}
        <div ref={setContainer} />

        <PortalContainerContext.Provider value={container}>
          <SheetHeader className="pb-2">
            <SheetTitle>Adicionar Produto</SheetTitle>
          </SheetHeader>

          <div className="px-4 pb-8">
            <Tabs defaultValue="manual">
              <TabsList className="mb-6">
                <TabsTrigger value="manual">Criar Manualmente</TabsTrigger>
                <TabsTrigger value="import">Importar Arquivo</TabsTrigger>
                <TabsTrigger value="tiny">Importar do Tiny</TabsTrigger>
              </TabsList>

              <TabsContent value="manual">
                <ProductForm
                  suppliers={suppliers}
                  onSuccess={() => setOpen(false)}
                />
              </TabsContent>

              <TabsContent value="import">
                <ProductImport
                  onSuccess={() => setOpen(false)}
                />
              </TabsContent>

              <TabsContent value="tiny">
                <TinyImportForm onSuccess={() => setOpen(false)} />
              </TabsContent>
            </Tabs>
          </div>
        </PortalContainerContext.Provider>
      </SheetContent>
    </Sheet>
  );
}
