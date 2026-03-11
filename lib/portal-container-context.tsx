"use client";

import { createContext, useContext } from "react";

/**
 * Provides a container element for floating portals (e.g. base-ui Combobox).
 * When the combobox is rendered inside a Radix Dialog / Sheet, the portal must
 * render *inside* the dialog's DOM so that Radix's aria-hidden doesn't block it.
 */
export const PortalContainerContext = createContext<HTMLElement | null>(null);

export function usePortalContainer(): HTMLElement | null {
  return useContext(PortalContainerContext);
}
