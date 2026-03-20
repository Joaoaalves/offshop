"use client"

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { TooltipProvider } from "./ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { queryClient } from "@/lib/query-client";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    {children}
                </TooltipProvider>
            </QueryClientProvider>
        </SessionProvider>
    )
}