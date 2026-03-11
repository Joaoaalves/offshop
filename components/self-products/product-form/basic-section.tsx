"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection } from "./form-section";

type Supplier = { _id: string; name: string };

interface Props {
  values: Record<string, string>;
  errors: Record<string, string>;
  suppliers: Supplier[];
  onChange: (field: string, value: string) => void;
}

export function BasicSection({ values, errors, suppliers, onChange }: Props) {
  return (
    <FormSection title="Informações Básicas">
      {values.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={values.imageUrl}
          alt="preview"
          className="mb-4 h-24 w-24 rounded-lg border object-contain p-1"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="SKU *" error={errors.baseSku}>
          <Input
            value={values.baseSku}
            onChange={(e) => onChange("baseSku", e.target.value)}
            placeholder="EX-001"
          />
        </Field>

        <Field label="Nome *" error={errors.name}>
          <Input
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Nome do produto"
          />
        </Field>

        <Field label="URL da Imagem" error={errors.imageUrl} className="sm:col-span-2">
          <Input
            value={values.imageUrl}
            onChange={(e) => onChange("imageUrl", e.target.value)}
            placeholder="https://..."
          />
        </Field>

        <Field label="Código do Fabricante" error={errors.manufacturerCode}>
          <Input
            value={values.manufacturerCode}
            onChange={(e) => onChange("manufacturerCode", e.target.value)}
            placeholder="REF-123"
          />
        </Field>

        <Field label="NCM" error={errors.ncm}>
          <Input
            value={values.ncm}
            onChange={(e) => onChange("ncm", e.target.value)}
            placeholder="00000000"
            maxLength={8}
          />
        </Field>

        <Field label="Unidades por Caixa" error={errors.unitsPerBox}>
          <Input
            type="number"
            min={1}
            value={values.unitsPerBox}
            onChange={(e) => onChange("unitsPerBox", e.target.value)}
            placeholder="12"
          />
        </Field>

        <Field label="Fornecedor *" error={errors.supplierId}>
          <Select
            value={values.supplierId}
            onValueChange={(v) => onChange("supplierId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um fornecedor" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((s) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </FormSection>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
