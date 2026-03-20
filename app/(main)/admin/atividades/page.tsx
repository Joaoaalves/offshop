"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { USER_ROLE_LABELS } from "@/types/roles";

interface AuditEntry {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  method: string;
  path: string;
  action: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  "products:write":    "bg-blue-500/15 text-blue-700",
  "products:delete":   "bg-red-500/15 text-red-700",
  "suppliers:write":   "bg-blue-500/15 text-blue-700",
  "suppliers:delete":  "bg-red-500/15 text-red-700",
  "purchases:write":   "bg-yellow-500/15 text-yellow-700",
  "purchases:execute": "bg-green-500/15 text-green-700",
  "orders:write":      "bg-green-500/15 text-green-700",
  "finance:write":     "bg-purple-500/15 text-purple-700",
  "admin:write":       "bg-orange-500/15 text-orange-700",
  "admin:delete":      "bg-red-500/15 text-red-700",
};

export default function AuditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && !["admin", "management"].includes(session.user.role)) {
      router.replace("/");
    }
  }, [status, session, router]);

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    const res = await fetch(`/api/admin/audit?page=${p}&limit=50`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs);
      setPages(data.pages);
      setTotal(data.total);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && ["admin", "management"].includes(session.user.role)) {
      fetchLogs(page);
    }
  }, [status, session, page, fetchLogs]);

  if (status !== "authenticated" || !["admin", "management"].includes(session.user.role)) return null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Histórico de atividades</h1>
        <p className="text-sm text-muted-foreground">
          {total} ações registradas — apenas escritas e exclusões.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Rota</TableHead>
            <TableHead>Detalhes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                Carregando…
              </TableCell>
            </TableRow>
          )}
          {!loading && logs.map((log) => (
            <TableRow key={log._id}>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString("pt-BR")}
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium leading-none">{log.userName}</p>
                <p className="text-xs text-muted-foreground">{log.userEmail}</p>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-mono font-medium ${ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground"}`}>
                  {log.action}
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                <span className="text-xs font-semibold mr-1">{log.method}</span>
                {log.path}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground font-mono">
                {log.meta ? JSON.stringify(log.meta) : "—"}
              </TableCell>
            </TableRow>
          ))}
          {!loading && logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                Nenhuma atividade registrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeftIcon className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {pages}
          </span>
          <Button variant="outline" size="icon" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
