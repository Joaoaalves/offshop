"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import { useSelfProducts } from "@/hooks/use-self-products";


export function SelfProductsTable() {
    const { selfProducts, isLoading, deleteSelfProduct } = useSelfProducts();

    if (isLoading) return <div className="p-6">Carregando...</div>;

    return (
        <div className="rounded-xl border shadow-sm overflow-auto relative max-h-[85vh]">
            <Table>
                <TableHeader className="sticky top-0 z-10 h-16">
                    <TableRow>
                        <TableHead className="bg-muted border-r">Nome</TableHead>
                        <TableHead className="bg-muted border-r">Base SKU</TableHead>
                        <TableHead className="bg-muted border-r">Fornecedor</TableHead>
                        <TableHead className="bg-muted border-r">Min Stock Days</TableHead>
                        <TableHead className="text-center bg-muted border-r">Ações</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {selfProducts?.map((product: any) => (
                        <TableRow key={product._id}>
                            <TableCell className="font-medium">
                                {product.name}
                            </TableCell>

                            <TableCell>{product.baseSku}</TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className="font-semibold tabular-nums"
                                >
                                    {product?.supplierId?.name}

                                </Badge>
                            </TableCell>
                            <TableCell>{product.minStockDays}</TableCell>

                            <TableCell className="text-right">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm("Deseja remover este produto?")) {
                                            deleteSelfProduct(product._id);
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
        </div >
    );
}
