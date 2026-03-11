import { z } from "zod";

// ─── Shared field groups ──────────────────────────────────────────────────────

const dimensionsFields = {
  lengthCm:           z.coerce.number().positive().optional(),
  widthCm:            z.coerce.number().positive().optional(),
  heightCm:           z.coerce.number().positive().optional(),
  volumeCm3:          z.coerce.number().positive().optional(),
  weightKg:           z.coerce.number().positive().optional(),
  chargeableWeightKg: z.coerce.number().positive().optional(),
};

const taxFields = {
  icms:        z.coerce.number().min(0).max(100).default(0),
  ipi:         z.coerce.number().min(0).max(100).default(0),
  difal:       z.coerce.number().min(0).max(100).default(0),
  storageCost: z.coerce.number().min(0).default(0),
};

// ─── Simples ─────────────────────────────────────────────────────────────────

export const simplesProductSchema = z.object({
  productType:      z.literal("simples").default("simples"),
  baseSku:          z.string().min(1, "SKU é obrigatório"),
  name:             z.string().min(1, "Nome é obrigatório"),
  imageUrl:         z.string().url("URL inválida").or(z.literal("")).optional(),
  manufacturerCode: z.string().optional(),
  ncm:              z.string().regex(/^\d{8}$/, "NCM deve ter exatamente 8 dígitos").or(z.literal("")).optional(),
  unitsPerBox:      z.coerce.number().int().positive("Deve ser positivo").optional(),
  supplierId:       z.string().min(1, "Fornecedor é obrigatório"),
  tablePrice:       z.coerce.number().positive("Deve ser positivo").optional(),
  ...taxFields,
  ...dimensionsFields,
  minStockDays:     z.coerce.number().int().positive().default(30),
});

// ─── Kit ─────────────────────────────────────────────────────────────────────

export const kitProductSchema = z.object({
  productType:   z.literal("kit"),
  baseSku:       z.string().min(1, "SKU é obrigatório"),
  name:          z.string().min(1, "Nome é obrigatório"),
  parentProduct: z.string().min(1, "Produto base é obrigatório"),
  kitQuantity:   z.coerce.number().int().min(2, "Mínimo 2 unidades"),
  supplierId:    z.string().min(1, "Fornecedor é obrigatório"),
  imageUrl:      z.string().url("URL inválida").or(z.literal("")).optional(),
  tablePrice:    z.coerce.number().positive().optional(),
  ...taxFields,
  ...dimensionsFields,
  minStockDays:  z.coerce.number().int().positive().default(30),
});

// ─── Combo ───────────────────────────────────────────────────────────────────

export const comboProductSchema = z.object({
  productType: z.literal("combo"),
  baseSku:     z.string().min(1, "SKU é obrigatório"),
  name:        z.string().min(1, "Nome é obrigatório"),
  components:  z
    .array(z.object({ product: z.string().min(1), quantity: z.coerce.number().int().positive() }))
    .min(2, "Combo deve ter pelo menos 2 produtos"),
  supplierId:  z.string().optional(),
  imageUrl:    z.string().url("URL inválida").or(z.literal("")).optional(),
  ...taxFields,
  ...dimensionsFields,
  minStockDays: z.coerce.number().int().positive().default(30),
});

// ─── Union ───────────────────────────────────────────────────────────────────

export const selfProductUnionSchema = z.discriminatedUnion("productType", [
  simplesProductSchema,
  kitProductSchema,
  comboProductSchema,
]);

export type SelfProductFormData = z.infer<typeof selfProductUnionSchema>;

// Backward-compat alias — CSV import creates only simples products
export const selfProductSchema = simplesProductSchema;

// ─── Import row schema ────────────────────────────────────────────────────────

export const importRowSchema = simplesProductSchema
  .omit({ supplierId: true })
  .extend({
    supplierId:   z.string().optional(),
    supplierName: z.string().optional(),
  })
  .refine((d) => d.supplierId || d.supplierName, {
    message: "Fornecedor é obrigatório",
    path: ["supplierId"],
  });

export type ImportRowData = z.infer<typeof importRowSchema>;
