"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FIELD_LABELS, IMPORT_FIELDS } from "@/lib/self-product-fields";

interface Props {
  columns: string[];
  mapping: Record<string, string>;
  previewRow: Record<string, string>;
  onMappingChange: (col: string, field: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export function FieldMapping({
  columns,
  mapping,
  previewRow,
  onMappingChange,
  onConfirm,
  onBack,
}: Props) {
  const assignedFields = Object.values(mapping).filter((v) => v !== "_ignore");
  const hasSku = assignedFields.includes("baseSku");
  const hasName = assignedFields.includes("name");
  const canProceed = hasSku && hasName;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold">Mapeamento de Campos</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirme como cada coluna do arquivo mapeia para os campos do produto.
          Campos em vermelho são obrigatórios.
        </p>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left font-medium">Coluna do arquivo</th>
              <th className="px-4 py-2 text-left font-medium">Exemplo</th>
              <th className="px-4 py-2 text-left font-medium">Campo do produto</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col) => (
              <tr key={col} className="border-b last:border-0">
                <td className="px-4 py-2 font-mono text-xs">{col}</td>
                <td className="max-w-40 truncate px-4 py-2 text-muted-foreground">
                  {previewRow[col] ?? "—"}
                </td>
                <td className="px-4 py-2">
                  <Select
                    value={mapping[col] ?? "_ignore"}
                    onValueChange={(v) => onMappingChange(col, v)}
                  >
                    <SelectTrigger className="h-8 w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_ignore">
                        <span className="text-muted-foreground">— Ignorar —</span>
                      </SelectItem>
                      {IMPORT_FIELDS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {FIELD_LABELS[f]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!canProceed && (
        <div className="flex flex-wrap gap-2 text-xs text-destructive">
          <span>Obrigatórios não mapeados:</span>
          {!hasSku && <Badge variant="destructive">SKU</Badge>}
          {!hasName && <Badge variant="destructive">Nome</Badge>}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={onConfirm} disabled={!canProceed}>
          Confirmar Mapeamento
        </Button>
      </div>
    </div>
  );
}
