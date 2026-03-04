"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditSupplierDialog } from "./edit-supplier-dialog";
import { useSuppliers } from "@/hooks/use-suppliers";

export function SuppliersTable() {
    const { suppliers, isLoading, deleteSupplier } = useSuppliers();

    if (isLoading) return <div className="p-6">Carregando...</div>;

    return (
        <div className="rounded-xl border shadow-sm overflow-auto relative max-h-[85vh]">
            <Table>
                <TableHeader className="sticky top-0 z-10 h-16">
                    <TableRow>
                        <TableHead className="bg-muted border-r">Nome</TableHead>
                        <TableHead className="bg-muted border-r">Tempo de Entrega</TableHead>
                        <TableHead className="bg-muted border-r">Dias Extras</TableHead>
                        <TableHead className="bg-muted border-r">Status</TableHead>
                        <TableHead className="text-center bg-muted border-r">Ações</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {suppliers?.map((supplier: any) => (
                        <TableRow key={supplier._id}>
                            <TableCell className="font-medium">
                                {supplier.name}
                            </TableCell>

                            <TableCell>{supplier.leadTimeDays} dias</TableCell>
                            <TableCell>{supplier.safetyDays}</TableCell>

                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={
                                        supplier.active
                                            ? "text-emerald-600 border-emerald-400"
                                            : "text-red-600 border-red-400"
                                    }
                                >
                                    {supplier.active ? "Ativo" : "Inativo"}
                                </Badge>
                            </TableCell>

                            <TableCell className="text-right space-x-2">
                                <EditSupplierDialog supplier={supplier} />

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm("Tem certeza que deseja remover?")) {
                                            deleteSupplier(supplier._id);
                                        }
                                    }}
                                >
                                    Remover
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

