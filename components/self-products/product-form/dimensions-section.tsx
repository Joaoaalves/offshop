"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSection } from "./form-section";

interface Props {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const dimensionFields = [
  { key: "lengthCm", label: "Comprimento (cm)" },
  { key: "widthCm", label: "Largura (cm)" },
  { key: "heightCm", label: "Altura (cm)" },
  { key: "weightKg", label: "Peso (kg)" },
] as const;

export function DimensionsSection({ values, errors, onChange }: Props) {
  const l = parseFloat(values.lengthCm) || 0;
  const w = parseFloat(values.widthCm) || 0;
  const h = parseFloat(values.heightCm) || 0;
  const volumeM3 = l > 0 && w > 0 && h > 0 ? (l * w * h) / 1_000_000 : null;

  function handleChange(field: string, value: string) {
    onChange(field, value);

    const newL = field === "lengthCm" ? parseFloat(value) || 0 : l;
    const newW = field === "widthCm" ? parseFloat(value) || 0 : w;
    const newH = field === "heightCm" ? parseFloat(value) || 0 : h;
    const vol = newL > 0 && newW > 0 && newH > 0 ? (newL * newW * newH) / 1_000_000 : 0;
    onChange("volumeM3", vol > 0 ? vol.toFixed(6) : "");
  }

  return (
    <FormSection title="Dimensões e Peso">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {dimensionFields.map(({ key, label }) => (
          <div key={key}>
            <Label className="mb-1.5 block text-sm font-medium">{label}</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={values[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder="0"
            />
            {errors[key] && (
              <p className="mt-1 text-xs text-destructive">{errors[key]}</p>
            )}
          </div>
        ))}

        <div className="rounded-lg bg-muted px-3 py-2">
          <p className="text-xs text-muted-foreground">Volume (m³)</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">
            {volumeM3 != null ? volumeM3.toFixed(4) : "—"}
          </p>
        </div>

        <div>
          <Label className="mb-1.5 block text-sm font-medium">Custo de Armazenamento (R$)</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={values.storageCost}
            onChange={(e) => onChange("storageCost", e.target.value)}
            placeholder="0,00"
          />
          {errors.storageCost && (
            <p className="mt-1 text-xs text-destructive">{errors.storageCost}</p>
          )}
        </div>
      </div>
    </FormSection>
  );
}
