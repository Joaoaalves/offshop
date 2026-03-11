"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FIELD_LABELS } from "@/lib/self-product-fields";

export interface ValidatedRow {
  index: number;
  data: Record<string, unknown> | null;
  errors: string[];
}

interface Props {
  rows: ValidatedRow[];
  onImport: () => void;
  onBack: () => void;
  importing: boolean;
}

export function ImportPreview({ rows, onImport, onBack, importing }: Props) {
  const valid = rows.filter((r) => r.errors.length === 0);
  const invalid = rows.filter((r) => r.errors.length > 0);

  const previewCols = valid.length > 0
    ? Object.keys(valid[0].data ?? {}).slice(0, 5)
    : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span><strong>{valid.length}</strong> válidos</span>
        </div>
        {invalid.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span><strong>{invalid.length}</strong> com erros (serão ignorados)</span>
          </div>
        )}
      </div>

      {valid.length > 0 && (
        <div className="overflow-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                {previewCols.map((c) => (
                  <th key={c} className="px-3 py-2 text-left font-medium">
                    {FIELD_LABELS[c] ?? c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {valid.slice(0, 5).map((row) => (
                <tr key={row.index} className="border-b last:border-0">
                  {previewCols.map((c) => (
                    <td key={c} className="max-w-35 truncate px-3 py-2">
                      {String(row.data?.[c] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {valid.length > 5 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              + {valid.length - 5} linhas adicionais
            </p>
          )}
        </div>
      )}

      {invalid.length > 0 && (
        <details className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <summary className="cursor-pointer text-xs font-medium text-destructive">
            Ver erros ({invalid.length} linhas)
          </summary>
          <ul className="mt-2 space-y-1">
            {invalid.map((row) => (
              <li key={row.index} className="text-xs">
                <Badge variant="outline" className="mr-2 text-destructive">
                  Linha {row.index + 2}
                </Badge>
                {row.errors.join(" · ")}
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={onImport} disabled={valid.length === 0 || importing}>
          {importing ? "Importando..." : `Importar ${valid.length} produto${valid.length !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
}
