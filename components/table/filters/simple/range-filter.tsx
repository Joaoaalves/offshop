"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter } from "@/hooks/tables/use-filters";

type RangeFilterProps<T> = {
    filter: Filter<T>;
    value: { min?: number; max?: number };
    onChange: (value: { min?: number; max?: number }) => void;
};

export function RangeFilter<T>({
    filter,
    value = {},
    onChange,
}: RangeFilterProps<T>) {
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const min = e.target.value === "" ? undefined : Number(e.target.value);
        onChange({ ...value, min });
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const max = e.target.value === "" ? undefined : Number(e.target.value);
        onChange({ ...value, max });
    };

    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {filter.label}
            </Label>
            <div className="flex items-center gap-2">
                <Input
                    type="number"
                    placeholder="Min"
                    value={value.min ?? ""}
                    onChange={handleMinChange}
                    className="h-8 w-17.5 px-2 text-xs"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                    type="number"
                    placeholder="Max"
                    value={value.max ?? ""}
                    onChange={handleMaxChange}
                    className="h-8 w-17.5 px-2 text-xs"
                />
            </div>
        </div>
    );
}
