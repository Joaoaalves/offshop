"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelfProducts } from "@/hooks/use-self-products";
import { selfProductSchema } from "@/lib/self-product-schema";
import { BasicSection } from "./basic-section";
import { PricingSection } from "./pricing-section";
import { DimensionsSection } from "./dimensions-section";
import { FormSection } from "./form-section";

type Supplier = { _id: string; name: string };

interface Props {
  suppliers: Supplier[];
  onSuccess?: () => void;
}

const EMPTY_FORM: Record<string, string> = {
  baseSku: "", name: "", imageUrl: "", manufacturerCode: "", ncm: "",
  unitsPerBox: "", supplierId: "",
  tablePrice: "", icms: "0", ipi: "0", difal: "0", storageCost: "0",
  lengthCm: "", widthCm: "", heightCm: "", volumeCm3: "", weightKg: "",
  chargeableWeightKg: "",
  minStockDays: "30",
};

export function ProductForm({ suppliers, onSuccess }: Props) {
  const router = useRouter();
  const { createSelfProduct, createPending } = useSelfProducts();

  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>();

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors?.[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const coerced = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === "" ? undefined : v]),
    );

    const result = selfProductSchema.safeParse(coerced);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Corrija os campos destacados.");
      return;
    }

    await createSelfProduct(result.data);
    toast.success("Produto criado com sucesso!");
    setForm(EMPTY_FORM);
    setErrors({});
    if (onSuccess) onSuccess();
    else router.push("/produtos");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <BasicSection
        values={form}
        errors={errors ?? {}}
        suppliers={suppliers}
        onChange={setField}
      />

      <PricingSection
        values={form}
        errors={errors ?? {}}
        onChange={setField}
      />

      <DimensionsSection
        values={form}
        errors={errors ?? {}}
        onChange={setField}
      />

      <FormSection title="Configurações">
        <div className="max-w-xs">
          <Label className="mb-1.5 block text-sm font-medium">
            Dias Mínimos de Estoque
          </Label>
          <Input
            type="number"
            min={1}
            value={form.minStockDays}
            onChange={(e) => setField("minStockDays", e.target.value)}
          />
          {errors?.minStockDays && (
            <p className="mt-1 text-xs text-destructive">{errors.minStockDays}</p>
          )}
        </div>
      </FormSection>

      <div className="flex justify-end">
        <Button type="submit" disabled={createPending} size="lg">
          {createPending ? "Salvando..." : "Criar Produto"}
        </Button>
      </div>
    </form>
  );
}
