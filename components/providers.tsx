"use client"

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { TooltipProvider } from "./ui/tooltip";
import { SidebarProvider } from "./ui/sidebar";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <SidebarProvider>
                    {children}
                    <Toaster />
                </SidebarProvider>
            </TooltipProvider>
        </QueryClientProvider>
    )
}