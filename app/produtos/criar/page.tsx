"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSelfProducts } from "@/hooks/use-self-products";

type Supplier = {
    _id: string;
    name: string;
};

export default function CreateInternalProductPage() {
    const { createSelfProduct, createPending } = useSelfProducts();

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);

    const [form, setForm] = useState({
        name: "",
        baseSku: "",
        supplierId: "",
        minStockDays: 30,
    });

    useEffect(() => {
        async function fetchSuppliers() {
            try {
                const data: any = await api("/api/suppliers");
                setSuppliers(data);
            } finally {
                setLoadingSuppliers(false);
            }
        }

        fetchSuppliers();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        await createSelfProduct({
            ...form,
            minStockDays: Number(form.minStockDays),
        });

        setForm({
            name: "",
            baseSku: "",
            supplierId: "",
            minStockDays: 30,
        });

        alert("Produto criado com sucesso!");
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Criar Produto Interno</h1>

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
                    <label className="block text-sm font-medium">Base SKU</label>
                    <input
                        className="w-full border rounded px-3 py-2"
                        value={form.baseSku}
                        onChange={(e) => setForm({ ...form, baseSku: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Fornecedor</label>
                    {loadingSuppliers ? (
                        <p className="text-sm text-gray-500">Carregando...</p>
                    ) : (
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={form.supplierId}
                            onChange={(e) =>
                                setForm({ ...form, supplierId: e.target.value })
                            }
                            required
                        >
                            <option value="">Selecione um fornecedor</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier._id} value={supplier._id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium">
                        Dias mínimos de estoque
                    </label>
                    <input
                        type="number"
                        className="w-full border rounded px-3 py-2"
                        value={form.minStockDays}
                        onChange={(e) =>
                            setForm({ ...form, minStockDays: Number(e.target.value) })
                        }
                    />
                </div>

                <button
                    type="submit"
                    disabled={createPending}
                    className="bg-black text-white px-4 py-2 rounded"
                >
                    {createPending ? "Salvando..." : "Criar Produto"}
                </button>
            </form>
        </div>
    );
}
