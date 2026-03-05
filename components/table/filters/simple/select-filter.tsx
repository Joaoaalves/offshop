"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter } from "@/hooks/tables/use-filters";

type SelectFilterProps<T> = {
    filter: Filter<T>;
    value: any;
    onChange: (value: any) => void;
};

export function SelectFilter<T>({
    filter,
    value,
    onChange,
}: SelectFilterProps<T>) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {filter.label}
            </Label>
            <Select
                value={value || "none"}
                onValueChange={(val) => onChange(val === "none" ? "" : val)}
            >
                <SelectTrigger className="h-8 w-[160px] text-xs">
                    <SelectValue placeholder={filter.placeholder ?? "Selecionar..."} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Todos</SelectItem>
                    {filter.options?.map((option) => (
                        <SelectItem key={String(option.value)} value={String(option.value)}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
