"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSection } from "./form-section";

interface Props {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PricingSection({ values, errors, onChange }: Props) {
  const tablePrice = parseFloat(values.tablePrice) || 0;
  const icms       = parseFloat(values.icms) || 0;
  const ipi        = parseFloat(values.ipi) || 0;
  const difal      = parseFloat(values.difal) || 0;
  const unitsPerBox = parseInt(values.unitsPerBox) || 0;

  const priceWithTaxes = tablePrice > 0 ? tablePrice * (1 + (icms + ipi + difal) / 100) : 0;
  const unitPrice      = priceWithTaxes > 0 && unitsPerBox > 0 ? priceWithTaxes / unitsPerBox : 0;

  return (
    <FormSection title="Preços e Impostos">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Preço de Tabela (R$)" error={errors.tablePrice}>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={values.tablePrice}
            onChange={(e) => onChange("tablePrice", e.target.value)}
            placeholder="0,00"
          />
        </Field>

        <Field label="ICMS (%)" error={errors.icms}>
          <Input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={values.icms}
            onChange={(e) => onChange("icms", e.target.value)}
          />
        </Field>

        <Field label="IPI (%)" error={errors.ipi}>
          <Input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={values.ipi}
            onChange={(e) => onChange("ipi", e.target.value)}
          />
        </Field>

        <Field label="DIFAL (%)" error={errors.difal}>
          <Input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={values.difal}
            onChange={(e) => onChange("difal", e.target.value)}
          />
        </Field>

        <div className="rounded-lg bg-muted px-3 py-2">
          <p className="text-xs text-muted-foreground">Preço c/ Impostos</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">
            {priceWithTaxes > 0 ? fmt(priceWithTaxes) : "—"}
          </p>
        </div>

        <div className="rounded-lg bg-muted px-3 py-2">
          <p className="text-xs text-muted-foreground">Preço Unitário</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">
            {unitPrice > 0 ? fmt(unitPrice) : "—"}
          </p>
        </div>
      </div>
    </FormSection>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
