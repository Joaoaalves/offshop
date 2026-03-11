"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimplesForm } from "./simples-form";
import { KitForm } from "./kit-form";
import { ComboForm } from "./combo-form";

type Supplier = { _id: string; name: string };

interface Props {
  suppliers: Supplier[];
  onSuccess?: () => void;
}

export function ProductForm({ suppliers, onSuccess }: Props) {
  return (
    <Tabs defaultValue="simples">
      <TabsList className="mb-6 grid w-full grid-cols-3">
        <TabsTrigger value="simples">Simples</TabsTrigger>
        <TabsTrigger value="kit">Kit</TabsTrigger>
        <TabsTrigger value="combo">Combo</TabsTrigger>
      </TabsList>

      <TabsContent value="simples">
        <SimplesForm suppliers={suppliers} onSuccess={onSuccess} />
      </TabsContent>

      <TabsContent value="kit">
        <KitForm onSuccess={onSuccess} />
      </TabsContent>

      <TabsContent value="combo">
        <ComboForm suppliers={suppliers} onSuccess={onSuccess} />
      </TabsContent>
    </Tabs>
  );
}
