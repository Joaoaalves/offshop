"use client";

import { useSuppliers } from "@/hooks/use-suppliers";
import { useState } from "react";

export default function CreateSupplierPage() {
    const { createSupplier, createPending } = useSuppliers();

    const [form, setForm] = useState({
        name: "",
        leadTimeDays: 0,
        safetyDays: 0,
        active: true,
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        await createSupplier({
            ...form,
            leadTimeDays: Number(form.leadTimeDays),
            safetyDays: Number(form.safetyDays),
        });

        setForm({
            name: "",
            leadTimeDays: 0,
            safetyDays: 0,
            active: true,
        });

        alert("Fornecedor criado com sucesso!");
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Criar Fornecedor</h1>

            <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <label className="block text-sm font-medium">Nome</label>
                    <input
                        className="w-full border rounded px-3 py-2"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">
                        Lead Time (dias)
                    </label>
                    <input
                        type="number"
                        className="w-full border rounded px-3 py-2"
                        value={form.leadTimeDays}
                        onChange={(e) =>
                            setForm({ ...form, leadTimeDays: Number(e.target.value) })
                        }
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">
                        Safety Days
                    </label>
                    <input
                        type="number"
                        className="w-full border rounded px-3 py-2"
                        value={form.safetyDays}
                        onChange={(e) =>
                            setForm({ ...form, safetyDays: Number(e.target.value) })
                        }
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) =>
                            setForm({ ...form, active: e.target.checked })
                        }
                    />
                    <label>Fornecedor ativo</label>
                </div>

                <button
                    type="submit"
                    disabled={createPending}
                    className="bg-black text-white px-4 py-2 rounded"
                >
                    {createPending ? "Salvando..." : "Criar Fornecedor"}
                </button>
            </form>
        </div>
    );
}
