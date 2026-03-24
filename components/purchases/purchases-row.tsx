"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IPurchaseDashboardItem, PurchaseClassification } from "@/types/purchases";

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtNum(n: number) {
  if (n === 0) return "—";
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function statusDot(c?: PurchaseClassification) {
  if (c === "discontinuing") return "bg-red-500 shadow-[0_0_4px_1px_rgba(239,68,68,0.5)]";
  if (c === "observation") return "bg-yellow-400 shadow-[0_0_4px_1px_rgba(250,204,21,0.5)]";
  return "bg-muted-foreground/20 border border-border";
}

function statusLabel(c?: PurchaseClassification) {
  if (c === "discontinuing") return "Descontinuando";
  if (c === "observation") return "Observação";
  return "Normal";
}

function trendDot(item: IPurchaseDashboardItem) {
  if (item.classification === "discontinuing") return "bg-red-500";
  const hasStock = item.stock.storage + item.stock.fulfillment > 0;
  if (item.sales30d.total === 0 && hasStock) return "bg-red-500";
  // Green only for items selling >= 0.3/day; slower movers get yellow
  if (item.sales30d.dailyAvg < 0.3) return "bg-yellow-400";
  if (item.trend === "rising") return "bg-green-500 shadow-[0_0_4px_1px_rgba(34,197,94,0.4)]";
  if (item.trend === "falling") return "bg-yellow-400";
  return "bg-muted-foreground/20 border border-border";
}

function trendLabel(item: IPurchaseDashboardItem) {
  if (item.classification === "discontinuing") return "Descontinuando";
  const hasStock = item.stock.storage + item.stock.fulfillment > 0;
  if (!hasStock) return "Sem Estoque";
  if (item.sales30d.total === 0 && hasStock) return "Sem vendas (com estoque)";
  if (item.sales30d.dailyAvg < 0.3) return "Vendas lentas";
  if (item.trend === "rising") return "Em alta";
  if (item.trend === "falling") return "Em queda";
  return "Estável";
}

function restockBg(days: number, leadTime: number, dailyAvg: number) {
  if (dailyAvg === 0) return "";
  if (days < leadTime) return "bg-red-500/20 text-red-700 dark:text-red-400";
  if (days < 15) return "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300";
  return "";
}

// ─── Inline number input ─────────────────────────────────────────────────────

export function InlineInput({
  value,
  placeholder,
  onSave,
  className,
  step = "1",
  validate,
}: {
  value: number | null | undefined;
  placeholder?: string;
  onSave: (v: number | null) => void;
  className?: string;
  step?: string;
  validate?: (v: number) => boolean;
}) {
  const [local, setLocal] = useState(value != null ? String(value) : "");
  const badRef = useRef(false);

  function commit() {
    const s = local.trim();
    if (s === "") { onSave(null); return; }
    const num = parseFloat(s);
    if (isNaN(num)) return;
    if (validate && !validate(num)) { badRef.current = true; return; }
    badRef.current = false;
    onSave(num);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setLocal(value != null ? String(value) : "");
  }

  return (
    <input
      type="number"
      step={step}
      value={local}
      placeholder={placeholder}
      onChange={(e) => { setLocal(e.target.value); badRef.current = false; }}
      onBlur={commit}
      onKeyDown={handleKey}
      min={0}
      className={cn(
        "w-full bg-transparent text-right text-xs outline-none",
        "border-b border-dashed border-border/40 focus:border-primary",
        "placeholder:text-muted-foreground/30 tabular-nums font-mono",
        className,
      )}
    />
  );
}

// ─── Status options ───────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: PurchaseClassification | null; label: string }[] = [
  { value: null, label: "Normal" },
  { value: "observation", label: "Observação" },
  { value: "discontinuing", label: "Descontinuando" },
];

// ─── Row ─────────────────────────────────────────────────────────────────────

interface PurchasesRowProps {
  item: IPurchaseDashboardItem;
  isEven: boolean;
  onFieldSave: (
    baseSku: string,
    field: "classification" | "order" | "newCost",
    value: PurchaseClassification | number | null,
  ) => Promise<void>;
}

export function PurchasesRow({ item, isEven, onFieldSave }: PurchasesRowProps) {
  const isDiscontinuing = item.classification === "discontinuing";
  const { daysOfCoverage, suggestedUnits } = item.restock;
  const leadTime = item.supplierLeadTimeDays;

  const incoming = item.stock.incoming;
  const storage = item.stock.storage;
  const fulfillment = item.stock.fulfillment;
  const warehouseTotal = incoming + storage;
  const grandTotal = warehouseTotal + fulfillment;

  const rowBg = isEven ? "" : "bg-muted/30";

  return (
    <tr className={cn("border-b border-border/20 hover:bg-primary/5 transition-colors text-xs", rowBg)}>

      {/* ── Group 1: Identificação ─────────────────── */}
      <td className="px-2 py-1 w-7 text-center border-r border-border/20">
        <DropdownMenu>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "mx-auto flex h-3 w-3 items-center justify-center rounded-full transition-all",
                      statusDot(item.classification),
                    )}
                  />
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {statusLabel(item.classification)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent align="start" className="w-40">
            {STATUS_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value ?? "normal"}
                className={cn("text-xs gap-2", opt.value === item.classification && "font-semibold bg-muted/50")}
                onSelect={() => onFieldSave(item.baseSku, "classification", opt.value)}
              >
                <span className={cn(
                  "h-2 w-2 rounded-full border border-border",
                  opt.value === "discontinuing" && "bg-red-500 border-red-500",
                  opt.value === "observation" && "bg-yellow-400 border-yellow-400",
                )} />
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>

      <td className="px-2 py-1 w-7 text-center border-r border-border/20">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn("mx-auto h-3 w-3 rounded-full transition-all cursor-default", trendDot(item))} />
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {trendLabel(item)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>

      <td className="px-3 py-1 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
        {item.manufacturerCode ?? "—"}
      </td>

      <td className="px-3 py-1 font-mono font-medium text-[11px] whitespace-nowrap border-r border-border/30">
        {item.baseSku}
      </td>

      {/* ── Group 2: Vendas & Pedido ───────────────── */}
      <td className="px-3 py-1 text-right tabular-nums font-mono text-[11px] whitespace-nowrap">
        <span className="font-medium">{fmtNum(item.sales30d.total)}</span>
        {item.sales30d.total > 0 && (
          <span className="ml-1 text-[10px] text-muted-foreground/50">
            {item.sales30d.dailyAvg.toFixed(1)}/d
          </span>
        )}
      </td>

      <td className="px-3 py-1 text-right tabular-nums font-mono text-[11px] whitespace-nowrap">
        <span className="font-medium">{fmtNum(item.sales15d.total)}</span>
        {item.sales15d.total > 0 && (
          <span className="ml-1 text-[10px] text-muted-foreground/50">
            {item.sales15d.dailyAvg.toFixed(1)}/d
          </span>
        )}
      </td>

      <td className={cn("px-3 py-1 text-right tabular-nums font-mono text-[11px] whitespace-nowrap", restockBg(daysOfCoverage, leadTime, item.sales30d.dailyAvg))}>
        <span className="font-semibold">{suggestedUnits > 0 && item.classification != "discontinuing" ? suggestedUnits : "—"}</span>
        {daysOfCoverage < 999 && daysOfCoverage > 0 && (
          <span className="ml-1 text-[10px] opacity-60">{Math.round(daysOfCoverage)}d</span>
        )}
      </td>

      <td className="px-2 py-1 w-24 border-r border-border/30">
        <InlineInput
          value={item.order}
          placeholder={item.unitsPerBox > 1 ? `×${item.unitsPerBox}` : "0"}
          step={String(item.unitsPerBox ?? 1)}
          validate={(v) => (item.unitsPerBox ? v % item.unitsPerBox === 0 : true)}
          onSave={(v) => onFieldSave(item.baseSku, "order", v)}
          className={isDiscontinuing ? "text-red-500" : ""}
        />
      </td>

      {/* ── Group 3: Estoque ───────────────────────── */}
      <td className="px-3 py-1 text-right tabular-nums font-mono text-[11px] text-muted-foreground">
        {incoming || "—"}
      </td>

      <td className="px-3 py-1 text-right tabular-nums font-mono text-[11px]">
        {storage || "—"}
      </td>

      <td className="px-3 py-1 text-right tabular-nums font-mono text-[11px]">
        {fulfillment || "—"}
      </td>

      <td className="px-3 py-1 text-right tabular-nums font-mono text-[11px] font-medium">
        {warehouseTotal || "—"}
      </td>

      <td className="px-3 py-1 text-right tabular-nums font-mono text-[11px] font-semibold border-r border-border/30">
        {grandTotal || "—"}
      </td>

      {/* ── Group 4: Custo ─────────────────────────── */}
      <td className="px-3 py-1 text-right tabular-nums font-mono text-[11px] text-muted-foreground whitespace-nowrap">
        {fmt(item.cost)}
      </td>

      <td className="px-2 py-1 w-28">
        <InlineInput
          value={item.newCost}
          placeholder={fmt(item.cost)}
          step="0.01"
          onSave={(v) => onFieldSave(item.baseSku, "newCost", v)}
          className={item.newCost != null && item.newCost !== item.cost ? "text-primary font-medium" : ""}
        />
      </td>
    </tr>
  );
}
