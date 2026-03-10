import { Trend } from "@/types/enums";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ISalesDashboardItem } from "@/types/sales";
import { detectAbruptDrop, isDead } from "@/lib/sales-utils";


export default function StockTag({ product }: { product: ISalesDashboardItem }) {
    const hasFulfillment = product.products.some(p => p.logisticType === "fulfillment");
    const totalFullStock = product.products.reduce((s, p) => s + (p.stock?.full ?? 0), 0);
    const totalStorageStock = product.stock?.storage?.stock ?? 0;

    if (product.status !== "active" && (totalFullStock + totalStorageStock) === 0)
        return;

    const dead = isDead(product);

    if (dead) {
        if (detectAbruptDrop(product))
            return <TooltipTag text="Investigar" className=" p-0.5 py-0 text-[10px] text-black bg-fuchsia-500/30 border-fuchsia-800" description={`Esse SKU vinha bem e sumiu nos últimos 45 dias. Investigue.`} variant="outline" />
        return <TooltipTag text="Queime" className=" p-0.5 py-0 text-[10px] text-black bg-red-500/30 border-red-800" description={`Esse SKU não vendeu nos últimos 45 dias.`} variant="outline" />
    }

    if (!hasFulfillment)
        return;

    const cov = product.stock?.fulfillment?.replenishment?.coverage ?? 0;

    if (product.trend < Trend.STABLE) {
        if (cov > 120)
            return <TooltipTag text="Queime" className=" p-0.5 py-0 text-[10px] text-black bg-yellow-500/30 border-yellow-800" description={`Esse SKU possui ${cov.toFixed(0)} dias de cobertura.`} variant="outline" />

        if (cov > 45)
            return <TooltipTag text="Queime" className=" p-0.5 py-0 text-[10px] text-black bg-yellow-500/30 border-yellow-800" description={`Esse SKU possui ${cov.toFixed(0)} dias de cobertura.`} variant="outline" />
    } else {
        if (cov > 50)
            return <TooltipTag text="Acelere" className=" p-0.5 py-0 text-[10px] text-black bg-yellow-500/30 border-yellow-800" description={`Esse SKU possui ${cov.toFixed(0)} dias de cobertura.`} variant="outline" />
    }

    const units = product.stock?.fulfillment?.replenishment?.suggestedUnits ?? 0;
    if (product.trend >= Trend.STABLE) {
        if (cov <= 0)
            return <TooltipTag text={`Acabou`} className=" p-0.5 py-0 text-[10px]" description={`Esse SKU possui ${cov.toFixed(0)} dias de cobertura. Reponha: ${units} unidades.`} variant="destructive" />

        if (cov < 15)
            return <TooltipTag text={`Repor`} className=" p-0.5 py-0 text-[10px] text-white bg-destructive border-red-700" description={`Esse SKU possui ${cov.toFixed(0)} dias de cobertura. Reponha: ${units} unidades.`} variant="destructive" />

        if (cov < 45)
            return <TooltipTag text={`Repor`} className=" p-0.5 py-0 text-[10px] text-black bg-amber-500/30 border-amber-700" description={`Esse SKU possui ${cov.toFixed(0)} dias de cobertura. Reponha: ${units}  unidades.`} variant="destructive" />
    }
}

function TooltipTag({ text, description, variant, className }:
    {
        text: string,
        description: string
        className?: string,
        variant: "default" | "secondary" | "link" | "destructive" | "outline" | "ghost",
    }) {
    return (
        <Tooltip>
            <TooltipTrigger>
                <Badge variant={variant} className={className}>
                    {text}
                </Badge>
            </TooltipTrigger>

            <TooltipContent>
                <span>{description}</span>
            </TooltipContent>
        </Tooltip>
    )
}
