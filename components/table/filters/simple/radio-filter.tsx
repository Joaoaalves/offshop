"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Filter } from "@/hooks/tables/use-filters";

type RadioFilterProps<T> = {
    filter: Filter<T>;
    value: any;
    onChange: (value: any) => void;
};

export function RadioFilter<T>({
    filter,
    value,
    onChange,
}: RadioFilterProps<T>) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {filter.label}
            </Label>
            <RadioGroup
                value={value}
                onValueChange={onChange}
                className="flex h-8 items-center gap-4"
            >
                {filter.options?.map((option) => (
                    <div key={String(option.value)} className="flex items-center gap-1.5">
                        <RadioGroupItem
                            value={String(option.value)}
                            id={`${filter.id}-${option.value}`}
                            className="h-3.5 w-3.5"
                        />
                        <Label
                            htmlFor={`${filter.id}-${option.value}`}
                            className="cursor-pointer text-xs font-normal"
                        >
                            {option.label}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    );
}
