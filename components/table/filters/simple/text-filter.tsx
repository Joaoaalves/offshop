"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter } from "@/hooks/tables/use-filters";

type TextFilterProps<T> = {
    filter: Filter<T>;
    value: any;
    onChange: (value: any) => void;
};

export function TextFilter<T>({
    filter,
    value,
    onChange,
}: TextFilterProps<T>) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {filter.label}
            </Label>
            <Input
                type="text"
                placeholder={filter.placeholder ?? "Pesquisar..."}
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 text-xs"
            />
        </div>
    );
}
