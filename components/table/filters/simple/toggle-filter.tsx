"use client";

import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import { Filter } from "@/hooks/tables/use-filters";

type ToggleFilterProps<T> = {
    filter: Filter<T>;
    value: any;
    onChange: (value: any) => void;
};

export function ToggleFilter<T>({
    filter,
    value,
    onChange,
}: ToggleFilterProps<T>) {
    return (
        <Toggle
            pressed={!!value}
            onPressedChange={onChange}
            variant="outline"
            size="sm"
            className="h-8 px-3 justify-start"
        >
            {filter.label}
        </Toggle>
    );
}
