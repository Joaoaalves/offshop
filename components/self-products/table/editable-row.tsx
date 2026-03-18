"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

export type FieldType = "text" | "number";

export interface EditableRowProps {
  label: string;
  displayValue?: string | null;
  highlight?: boolean;
  /** If provided, the row becomes editable */
  fieldName?: string;
  rawValue?: number | string | null;
  fieldType?: FieldType;
  /** HTML input step attribute (e.g. "0.01" for decimals) */
  step?: string;
  /** Called when user confirms a new value. Should throw on error. */
  onSave?: (field: string, value: number | string | null) => Promise<void>;
}

export function EditableRow({
  label,
  displayValue,
  highlight,
  fieldName,
  rawValue,
  fieldType = "text",
  step,
  onSave,
}: EditableRowProps) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  const editable = !!fieldName && !!onSave;

  function startEditing() {
    if (!editable) return;
    cancelledRef.current = false;
    setInputVal(rawValue != null ? String(rawValue) : "");
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }

  async function commitSave() {
    if (!editable || !fieldName || cancelledRef.current) return;
    setSaving(true);
    try {
      let value: number | string | null =
        inputVal.trim() === "" ? null : inputVal.trim();
      if (fieldType === "number" && inputVal.trim() !== "") {
        const parsed = parseFloat(inputVal.replace(",", "."));
        value = isNaN(parsed) ? null : parsed;
      }
      await onSave(fieldName, value);
      setEditing(false);
    } catch {
      // error already toasted by the caller; keep editing open
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    cancelledRef.current = true;
    setEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  }

  // ── Edit mode ────────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="flex items-center justify-between gap-3 border-b border-dashed border-border/60 pb-1.5 last:border-0 last:pb-0">
        <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
        <input
          ref={inputRef}
          type={fieldType === "number" ? "number" : "text"}
          step={step}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitSave}
          disabled={saving}
          className={cn(
            "w-28 rounded border border-primary/60 bg-background px-1.5 py-0.5 text-right text-xs",
            "focus:outline-none focus:ring-1 focus:ring-primary",
            "disabled:opacity-50",
          )}
        />
      </div>
    );
  }

  // ── Display mode ─────────────────────────────────────────────────────────────
  return (
    <div
      role={editable ? "button" : undefined}
      tabIndex={editable ? 0 : undefined}
      onClick={editable ? startEditing : undefined}
      onKeyDown={
        editable
          ? (e) => (e.key === "Enter" || e.key === " ") && startEditing()
          : undefined
      }
      className={cn(
        "group flex items-baseline justify-between gap-3 border-b border-dashed border-border/60 pb-1.5 last:border-0 last:pb-0",
        editable &&
          "-mx-1 cursor-pointer rounded px-1 hover:bg-muted/40 transition-colors",
      )}
    >
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {editable && (
          <Pencil className="h-2.5 w-2.5 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/50" />
        )}
        <span
          className={
            highlight
              ? "text-xs font-semibold text-primary"
              : "text-xs font-medium text-foreground"
          }
        >
          {displayValue ?? "—"}
        </span>
      </div>
    </div>
  );
}
