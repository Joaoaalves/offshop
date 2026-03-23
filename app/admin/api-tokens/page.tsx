import { requirePermission } from "@/lib/auth-guard";
import { ApiTokensPage } from "@/components/admin/api-tokens/api-tokens-page";
import { redirect } from "next/navigation";

export default async function Page() {
  const deny = await requirePermission("admin:read");
  if (deny) redirect("/");

  return <ApiTokensPage />;
}
