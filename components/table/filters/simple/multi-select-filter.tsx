"use client";

import { useState, useCallback } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Filter } from "@/hooks/tables/use-filters";
import { Label } from "@/components/ui/label";

interface MultiSelectFilterProps<T> {
    filter: Filter<T>;
    value?: any[];
    onChange: (value: any[]) => void;
}

export function MultiSelectFilter<T>({
    filter,
    value = [],
    onChange,
}: MultiSelectFilterProps<T>) {
    const selectedValues = new Set(value?.map(String) || []);

    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {filter.label}
            </Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs px-2">
                        <Plus className="mr-2 h-4 w-4" />
                        {filter.label}
                        {selectedValues?.size > 0 && (
                            <>
                                <Separator orientation="vertical" className="mx-2 h-4" />
                                <Badge
                                    variant="secondary"
                                    className="rounded-sm px-1 font-normal lg:hidden"
                                >
                                    {selectedValues.size}
                                </Badge>
                                <div className="hidden space-x-1 lg:flex">
                                    {selectedValues.size > 2 ? (
                                        <Badge
                                            variant="secondary"
                                            className="rounded-sm px-1 font-normal"
                                        >
                                            {selectedValues.size} selecionados
                                        </Badge>
                                    ) : (
                                        filter.options
                                            ?.filter((option) => selectedValues.has(String(option.value)))
                                            .map((option) => (
                                                <Badge
                                                    variant="secondary"
                                                    key={String(option.value)}
                                                    className="rounded-sm px-1 font-normal"
                                                >
                                                    {option.label}
                                                </Badge>
                                            ))
                                    )}
                                </div>
                            </>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-50 p-0" align="start">
                    <Command>
                        <CommandInput placeholder={filter.label} />
                        <CommandList>
                            <CommandEmpty>Nenhum resultado.</CommandEmpty>
                            <CommandGroup >
                                {filter.options?.map((option) => {
                                    const isSelected = selectedValues.has(String(option.value));
                                    return (
                                        <CommandItem
                                            key={String(option.value)}
                                            onSelect={() => {
                                                const next = new Set(selectedValues);
                                                if (isSelected) {
                                                    next.delete(String(option.value));
                                                } else {
                                                    next.add(String(option.value));
                                                }
                                                onChange(Array.from(next));
                                            }}
                                            className={cn(isSelected && "bg-primary/10", "mb-1")}
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isSelected
                                                        ? "bg-primary"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <Check className={cn("h-4 w-4 text-white")} />
                                            </div>
                                            <span>{option.label}</span>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                            {selectedValues.size > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup>
                                        <CommandItem
                                            onSelect={() => onChange([])}
                                            className="justify-center text-center"
                                        >
                                            Limpar filtros
                                        </CommandItem>
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
