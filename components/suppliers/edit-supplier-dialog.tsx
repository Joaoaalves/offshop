"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSuppliers } from "@/hooks/use-suppliers";

export function EditSupplierDialog({ supplier }: any) {
    const { updateSupplier, updatePending } = useSuppliers();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const [form, setForm] = useState({
        name: supplier.name ?? "",
        leadTimeDays: supplier.leadTimeDays ?? 0,
        safetyDays: supplier.safetyDays ?? 0,
        active: supplier.active ?? true,
    });

    async function handleSave() {
        await updateSupplier({
            id: supplier._id,
            data: form,
        });

        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                    Editar
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Fornecedor</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Nome */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                        />
                    </div>

                    {/* Lead Time */}
                    <div className="space-y-2">
                        <Label htmlFor="leadTimeDays">Tempo de Entrega (dias)</Label>
                        <Input
                            id="leadTimeDays"
                            type="number"
                            min={0}
                            value={form.leadTimeDays}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    leadTimeDays: Number(e.target.value),
                                })
                            }
                        />
                    </div>

                    {/* Safety Days */}
                    <div className="space-y-2">
                        <Label htmlFor="safetyDays">Dias de Segurança</Label>
                        <Input
                            id="safetyDays"
                            type="number"
                            min={0}
                            value={form.safetyDays}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    safetyDays: Number(e.target.value),
                                })
                            }
                        />
                    </div>

                    {/* Ativo */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <Label htmlFor="active">Fornecedor ativo</Label>
                        <Switch
                            id="active"
                            checked={form.active}
                            onCheckedChange={(value) =>
                                setForm({ ...form, active: value })
                            }
                        />
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                    >
                        Cancelar
                    </Button>

                    <Button onClick={handleSave} disabled={updatePending}>
                        {updatePending ? "Salvando..." : "Salvar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}