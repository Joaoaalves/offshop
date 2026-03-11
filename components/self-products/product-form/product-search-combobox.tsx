"use client";

import { SearchIcon } from "lucide-react";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@/components/ui/combobox";
import { useSelfProducts } from "@/hooks/use-self-products";

interface Props {
  value: string | null;           // product._id
  onChange: (product: any) => void;
  placeholder?: string;
  filter?: (p: any) => boolean;
  exclude?: string[];             // product._ids to exclude
}

export function ProductSearchCombobox({
  value,
  onChange,
  placeholder = "Buscar produto…",
  filter,
  exclude = [],
}: Props) {
  const { selfProducts } = useSelfProducts();

  const all = (selfProducts as any[] ?? []);
  const products = all
    .filter((p) => (filter ? filter(p) : true))
    .filter((p) => !exclude.includes(p._id));

  const selected = all.find((p) => p._id === value) ?? null;

  return (
    <Combobox
      value={selected}
      onValueChange={(product) => onChange(product)}
      items={products}
      itemToStringLabel={(p: any) => (p ? `${p.baseSku} ${p.name}` : "")}
      isItemEqualToValue={(a: any, b: any) => a?._id === b?._id}
    >
      <ComboboxInput
        startAddon={<SearchIcon />}
        placeholder={placeholder}
        showClear={!!selected}
        showTrigger={!selected}
      />
      <ComboboxPopup>
        <ComboboxEmpty>Nenhum produto encontrado.</ComboboxEmpty>
        <ComboboxList>
          {(p: any) => (
            <ComboboxItem key={p._id} value={p}>
              <span className="flex items-center gap-2 overflow-hidden">
                <span className="shrink-0 rounded bg-muted px-1 font-mono text-xs text-muted-foreground">
                  {p.baseSku}
                </span>
                <span className="truncate">{p.name}</span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}
