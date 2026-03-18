"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSuppliers } from "@/hooks/use-suppliers";

export function DeleteSupplierDialog({ supplier }: any) {
  const { deleteSupplier, deletePending } = useSuppliers();
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    await deleteSupplier(supplier._id);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          Remover
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Remover fornecedor</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja remover{" "}
            <span className="font-semibold text-foreground">{supplier.name}</span>?
            {supplier.productCount > 0 && (
              <span className="mt-1 block text-destructive">
                Este fornecedor possui {supplier.productCount} produto
                {supplier.productCount !== 1 ? "s" : ""} vinculado
                {supplier.productCount !== 1 ? "s" : ""}. Os produtos não serão
                excluídos, mas perderão o vínculo.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deletePending}
          >
            {deletePending ? "Removendo..." : "Remover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
