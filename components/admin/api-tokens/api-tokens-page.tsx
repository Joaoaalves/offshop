"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useApiTokens } from "@/hooks/use-api-tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Copy, KeyRound, Trash2, Plus, Check } from "lucide-react";
import { IApiToken } from "@/models/ApiToken";

// ─── Create form ─────────────────────────────────────────────────────────────

function CreateTokenDialog({
  onCreated,
}: {
  onCreated: (raw: string, name: string) => void;
}) {
  const { createToken, creating } = useApiTokens();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const result = await createToken(name.trim());
    setOpen(false);
    setName("");
    onCreated(result.token, result.name);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="w-4 h-4 mr-1.5" />
        Novo token
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar token de ingestão</DialogTitle>
            <DialogDescription>
              O token é gerado uma única vez e não pode ser recuperado depois.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <Input
              placeholder="Nome do token (ex: Tiny Webhook)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={creating || !name.trim()}>
                {creating ? "Gerando…" : "Gerar token"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Token reveal dialog ──────────────────────────────────────────────────────

function TokenRevealDialog({
  raw,
  name,
  onClose,
}: {
  raw: string;
  name: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Token criado — {name}
          </DialogTitle>
          <DialogDescription>
            Copie agora. Este token não será exibido novamente.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 rounded-lg border bg-muted p-4 font-mono text-sm break-all select-all">
          {raw}
        </div>

        <Button onClick={copy} variant="outline" className="w-full mt-1">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1.5 text-green-500" /> Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1.5" /> Copiar token
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-1">
          Use no header:{" "}
          <code className="bg-muted px-1 rounded">
            Authorization: Bearer {raw.slice(0, 16)}…
          </code>
        </p>
      </DialogContent>
    </Dialog>
  );
}

// ─── Token row ────────────────────────────────────────────────────────────────

function TokenRow({
  token,
  onRevoke,
}: {
  token: Omit<IApiToken, "tokenHash">;
  onRevoke: (id: string, name: string) => void;
}) {
  const neverUsed = !token.lastUsedAt;
  const lastUsed = token.lastUsedAt
    ? new Date(token.lastUsedAt).toLocaleString("pt-BR")
    : null;

  return (
    <div className="flex items-center gap-4 px-5 py-4 group">
      {/* Icon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <KeyRound className="w-4 h-4 text-primary" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{token.name}</span>
          {neverUsed && (
            <Badge variant="secondary" className="text-xs">
              Nunca usado
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
            {token.prefix}…
          </code>
          <span>Criado por {token.createdBy}</span>
          {lastUsed && <span>· Último uso {lastUsed}</span>}
        </div>
      </div>

      {/* Revoke */}
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => onRevoke(String(token._id), token.name)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ApiTokensPage() {
  const { tokens, isLoading, revokeToken } = useApiTokens();
  const [revealed, setRevealed] = useState<{
    raw: string;
    name: string;
  } | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  async function handleRevoke() {
    if (!revokeTarget) return;
    await revokeToken(revokeTarget.id);
    toast.success(`Token "${revokeTarget.name}" revogado`);
    setRevokeTarget(null);
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">API Tokens</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tokens usados para autenticar requisições nas rotas{" "}
            <code className="bg-muted px-1 rounded">/api/ingest/*</code>
          </p>
        </div>
        <CreateTokenDialog
          onCreated={(raw, name) => setRevealed({ raw, name })}
        />
      </div>

      {/* Token list */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            Carregando…
          </div>
        ) : tokens.length === 0 ? (
          <div className="px-5 py-10 text-center space-y-1">
            <KeyRound className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium">Nenhum token criado</p>
            <p className="text-xs text-muted-foreground">
              Crie um token para autenticar integrações externas.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {tokens.map((t) => (
              <TokenRow
                key={String(t._id)}
                token={t}
                onRevoke={(id, name) => setRevokeTarget({ id, name })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Usage tip */}
      {tokens.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Envie o token no header:{" "}
          <code className="bg-muted px-1 rounded">
            Authorization: Bearer &lt;token&gt;
          </code>
        </p>
      )}

      {/* Reveal dialog */}
      {revealed && (
        <TokenRevealDialog
          raw={revealed.raw}
          name={revealed.name}
          onClose={() => setRevealed(null)}
        />
      )}

      {/* Revoke confirm */}
      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={(o) => !o && setRevokeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar token?</AlertDialogTitle>
            <AlertDialogDescription>
              O token <strong>{revokeTarget?.name}</strong> será removido
              permanentemente. Integrações que o utilizam perderão acesso
              imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="bg-destructive hover:bg-destructive/90"
            >
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
