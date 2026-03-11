"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { detectField } from "@/lib/self-product-fields";
import { parseCSV, parseJSONOrJSONL } from "@/lib/self-product-parser";
import { selfProductSchema } from "@/lib/self-product-schema";
import { useQueryClient } from "@tanstack/react-query";
import { DropZone } from "./drop-zone";
import { FieldMapping } from "./field-mapping";
import { ImportPreview, type ValidatedRow } from "./import-preview";

type Supplier = { _id: string; name: string };
type Step = "idle" | "mapping" | "preview" | "done";

interface Props {
  suppliers: Supplier[];
  onSuccess?: () => void;
}

export function ProductImport({ suppliers, onSuccess }: Props) {
  const qc = useQueryClient();

  const [step, setStep]         = useState<Step>("idle");
  const [rawRows, setRawRows]   = useState<Record<string, string>[]>([]);
  const [columns, setColumns]   = useState<string[]>([]);
  const [mapping, setMapping]   = useState<Record<string, string>>({});
  const [validated, setValidated] = useState<ValidatedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = file.name.endsWith(".csv")
          ? parseCSV(text)
          : parseJSONOrJSONL(text) as Record<string, string>[];

        if (!rows.length) { toast.error("Arquivo vazio ou inválido."); return; }

        const cols = Object.keys(rows[0]);
        const autoMapping: Record<string, string> = {};
        for (const col of cols) {
          autoMapping[col] = detectField(col) ?? "_ignore";
        }

        setRawRows(rows);
        setColumns(cols);
        setMapping(autoMapping);
        setStep("mapping");
      } catch {
        toast.error("Erro ao ler o arquivo. Verifique o formato.");
      }
    };
    reader.readAsText(file);
  }

  function handleConfirmMapping() {
    const supplierMap = Object.fromEntries(
      suppliers.map((s) => [s.name.toLowerCase(), s._id]),
    );

    const rows: ValidatedRow[] = rawRows.map((raw, index) => {
      const obj: Record<string, unknown> = {};

      for (const [col, field] of Object.entries(mapping)) {
        if (field === "_ignore") continue;
        if (field === "supplierName") {
          const sid = supplierMap[raw[col]?.toLowerCase()?.trim()];
          if (sid) obj["supplierId"] = sid;
          else obj["supplierName"] = raw[col];
        } else {
          obj[field] = raw[col];
        }
      }

      const result = selfProductSchema.safeParse(obj);
      if (result.success) {
        return { index, data: result.data as Record<string, unknown>, errors: [] };
      }
      return {
        index,
        data: null,
        errors: result.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`),
      };
    });

    setValidated(rows);
    setStep("preview");
  }

  async function handleImport() {
    const valid = validated
      .filter((r) => r.errors.length === 0)
      .map((r) => r.data);

    setImporting(true);
    try {
      const res = await api<{ imported: number }>("/api/self-products/import", {
        method: "POST",
        body: JSON.stringify(valid),
      });
      setImportedCount(res.imported);
      qc.invalidateQueries({ queryKey: ["self-products"] });
      setStep("done");
      onSuccess?.();
    } catch {
      toast.error("Erro ao importar produtos.");
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setStep("idle");
    setRawRows([]);
    setColumns([]);
    setMapping({});
    setValidated([]);
    setImportedCount(0);
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <div>
          <p className="text-lg font-semibold">{importedCount} produtos importados!</p>
          <p className="text-sm text-muted-foreground">Os produtos já estão disponíveis na listagem.</p>
        </div>
        <Button variant="outline" onClick={reset}>
          Importar outro arquivo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {step === "idle" && <DropZone onFile={handleFile} />}

      {step === "mapping" && (
        <FieldMapping
          columns={columns}
          mapping={mapping}
          previewRow={rawRows[0] ?? {}}
          onMappingChange={(col, field) =>
            setMapping((prev) => ({ ...prev, [col]: field }))
          }
          onConfirm={handleConfirmMapping}
          onBack={reset}
        />
      )}

      {step === "preview" && (
        <ImportPreview
          rows={validated}
          onImport={handleImport}
          onBack={() => setStep("mapping")}
          importing={importing}
        />
      )}
    </div>
  );
}
