import { z } from "zod";

export const selfProductSchema = z.object({
  baseSku:            z.string().min(1, "SKU é obrigatório"),
  name:               z.string().min(1, "Nome é obrigatório"),
  imageUrl:           z.string().url("URL inválida").or(z.literal("")).optional(),
  manufacturerCode:   z.string().optional(),
  ncm:                z.string().regex(/^\d{8}$/, "NCM deve ter exatamente 8 dígitos").or(z.literal("")).optional(),
  unitsPerBox:        z.coerce.number().int().positive("Deve ser positivo").optional(),
  supplierId:         z.string().min(1, "Fornecedor é obrigatório"),

  tablePrice:         z.coerce.number().positive("Deve ser positivo").optional(),
  icms:               z.coerce.number().min(0).max(100).default(0),
  ipi:                z.coerce.number().min(0).max(100).default(0),
  difal:              z.coerce.number().min(0).max(100).default(0),
  storageCost:        z.coerce.number().min(0).default(0),

  lengthCm:           z.coerce.number().positive().optional(),
  widthCm:            z.coerce.number().positive().optional(),
  heightCm:           z.coerce.number().positive().optional(),
  volumeCm3:          z.coerce.number().positive().optional(),
  weightKg:           z.coerce.number().positive().optional(),
  chargeableWeightKg: z.coerce.number().positive().optional(),

  minStockDays:       z.coerce.number().int().positive().default(30),
});

export type SelfProductFormData = z.infer<typeof selfProductSchema>;

// Import rows accept supplierName in place of supplierId (resolved client-side)
export const importRowSchema = selfProductSchema
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
