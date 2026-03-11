"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSection } from "./form-section";

interface Props {
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const fields = [
  { key: "lengthCm",           label: "Comprimento (cm)" },
  { key: "widthCm",            label: "Largura (cm)"     },
  { key: "heightCm",           label: "Altura (cm)"      },
  { key: "volumeCm3",          label: "Volume (cm³)"     },
  { key: "weightKg",           label: "Peso (kg)"        },
  { key: "chargeableWeightKg", label: "Peso Tarifável (kg)" },
] as const;

export function DimensionsSection({ values, errors, onChange }: Props) {
  return (
    <FormSection title="Dimensões e Peso">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {fields.map(({ key, label }) => (
          <div key={key}>
            <Label className="mb-1.5 block text-sm font-medium">{label}</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={values[key]}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder="0"
            />
            {errors[key] && (
              <p className="mt-1 text-xs text-destructive">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>
    </FormSection>
  );
}
