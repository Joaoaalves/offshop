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
  const cost         = parseFloat(values.cost) || 0;
  const unitsPerBox  = parseInt(values.unitsPerBox) || 0;
  const unitPrice    = cost > 0 && unitsPerBox > 0 ? cost / unitsPerBox : 0;

  return (
    <FormSection title="Preços">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Custo da Caixa (R$)" error={errors.cost}>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={values.cost}
            onChange={(e) => onChange("cost", e.target.value)}
            placeholder="0,00"
          />
        </Field>

        <Field label="Custo Unit. c/ Impostos (R$)" error={errors.priceWithTaxes}>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={values.priceWithTaxes}
            onChange={(e) => onChange("priceWithTaxes", e.target.value)}
            placeholder="0,00"
          />
        </Field>

        <div className="rounded-lg bg-muted px-3 py-2">
          <p className="text-xs text-muted-foreground">Custo Unitário</p>
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
