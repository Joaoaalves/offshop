"use client";

import Image from "next/image";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RowDetails } from "./row-details";

const COL_SPAN = 9;

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtMeasures(p: any) {
  const dims = [p.lengthCm, p.widthCm, p.heightCm]
    .map((v) => (v != null ? String(v) : "–"))
    .join("×");
  const weight = p.weightKg != null ? `${p.weightKg} kg` : "–";
  return `${dims} · ${weight}`;
}

interface Props {
  product: any;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export function ProductRow({ product, isOpen, onToggle, onDelete }: Props) {
  const ChevronIcon = isOpen ? ChevronDown : ChevronRight;

  return (
    <>
      <TableRow
        onClick={onToggle}
        className={cn(
          "cursor-pointer transition-colors duration-150",
          isOpen && "bg-muted/40",
        )}
      >
        {/* Expand toggle */}
        <TableCell className="w-8 pl-3 pr-0">
          <ChevronIcon className="h-4 w-4 text-muted-foreground" />
        </TableCell>

        {/* Foto */}
        <TableCell className="w-12">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={36}
              height={36}
              className="rounded object-contain"
              unoptimized
            />
          ) : (
            <div className="h-9 w-9 rounded bg-muted" />
          )}
        </TableCell>

        {/* Código do Fabricante */}
        <TableCell className="text-sm text-muted-foreground">
          {product.manufacturerCode ?? "—"}
        </TableCell>

        {/* Nome */}
        <TableCell className="max-w-48 truncate font-medium">
          {product.name}
        </TableCell>

        {/* SKU */}
        <TableCell>
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            {product.baseSku}
          </span>
        </TableCell>

        {/* Preço de Tabela */}
        <TableCell className="text-right tabular-nums text-sm">
          {product.tablePrice ? fmt(product.tablePrice) : "—"}
        </TableCell>

        {/* Preço Unitário */}
        <TableCell className="text-right tabular-nums text-sm font-medium">
          {product.unitPrice ? fmt(product.unitPrice) : "—"}
        </TableCell>

        {/* Medidas */}
        <TableCell className="whitespace-nowrap text-right text-xs text-muted-foreground">
          {fmtMeasures(product)}
        </TableCell>

        {/* Ações */}
        <TableCell
          className="text-right"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remover produto"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>

      {isOpen && <RowDetails product={product} colSpan={COL_SPAN} />}
    </>
  );
}
