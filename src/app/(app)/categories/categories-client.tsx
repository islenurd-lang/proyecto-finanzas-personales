"use client";

import { useState } from "react";
import { CATEGORY_TYPE_LABELS, DEFAULT_COLORS, DEFAULT_ICONS } from "@/features/categories/category.types";
import { createCategoryAction, updateCategoryAction, toggleCategoryStatusAction } from "@/features/categories/category.actions";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import Select from "@/components/ui/select";
import FormError from "@/components/ui/form-error";
import EmptyState from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface CategoryData {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
  isDefault: boolean;
  isActive: boolean;
}

export default function CategoriesClient({
  incomeCategories,
  expenseCategories,
}: {
  incomeCategories: CategoryData[];
  expenseCategories: CategoryData[];
}) {
  const [tab, setTab] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryData | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);

  const categories = tab === "INCOME" ? incomeCategories : expenseCategories;

  function openCreate() {
    setEditing(null);
    setErrors({});
    setMessage("");
    setSelectedColor(DEFAULT_COLORS[0]);
    setModalOpen(true);
  }

  function openEdit(cat: CategoryData) {
    setEditing(cat);
    setErrors({});
    setMessage("");
    setSelectedColor(cat.color);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    const formData = new FormData(e.currentTarget);
    formData.set("color", selectedColor);

    const result = editing
      ? await updateCategoryAction(editing.id, formData)
      : await createCategoryAction(formData);

    setLoading(false);

    if (result.ok) {
      setModalOpen(false);
    } else {
      setMessage(result.message);
      if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors);
    }
  }

  async function handleToggle(id: string) {
    await toggleCategoryStatusAction(id);
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {(["EXPENSE", "INCOME"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {CATEGORY_TYPE_LABELS[t]}s ({t === "INCOME" ? incomeCategories.length : expenseCategories.length})
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={openCreate} className="px-4 py-2 bg-navy-600 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors">
          + Nueva categoría
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title={`Sin categorías de ${tab === "INCOME" ? "ingresos" : "gastos"}`}
          description="Crea categorías para organizar tus transacciones."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={cn(
                "bg-white dark:bg-slate-800 rounded-xl border p-4 transition-shadow hover:shadow-md flex items-center gap-3",
                cat.isActive ? "border-slate-200" : "border-slate-200 opacity-60"
              )}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              >
                {cat.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{cat.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">{cat.icon}</span>
                  {cat.isDefault && (
                    <span className="text-xs bg-navy-50 text-navy-600 px-1.5 py-0.5 rounded">Default</span>
                  )}
                  {!cat.isActive && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Inactiva</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="text-xs px-2 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleToggle(cat.id)}
                  className={cn(
                    "text-xs px-2 py-1 rounded transition-colors",
                    cat.isActive
                      ? "border border-amber-300 text-amber-700 hover:bg-amber-50"
                      : "border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  )}
                >
                  {cat.isActive ? "Inactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar categoría" : "Nueva categoría"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{message}</div>
          )}

          <div>
            <Label htmlFor="cat-name" required>Nombre</Label>
            <Input id="cat-name" name="name" defaultValue={editing?.name} placeholder="Ej: Comida" error={errors.name?.[0]} />
            <FormError message={errors.name?.[0]} />
          </div>

          <div>
            <Label htmlFor="cat-type" required>Tipo</Label>
            <Select id="cat-type" name="type" defaultValue={editing?.type ?? tab} error={errors.type?.[0]}>
              <option value="INCOME">Ingreso</option>
              <option value="EXPENSE">Gasto</option>
            </Select>
            <FormError message={errors.type?.[0]} />
          </div>

          <div>
            <Label required>Color</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-lg border-2 transition-all",
                    selectedColor === c ? "border-slate-900 scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input type="hidden" name="color" value={selectedColor} />
            <FormError message={errors.color?.[0]} />
          </div>

          <div>
            <Label htmlFor="cat-icon" required>Ícono</Label>
            <Select id="cat-icon" name="icon" defaultValue={editing?.icon ?? DEFAULT_ICONS[0]} error={errors.icon?.[0]}>
              {DEFAULT_ICONS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </Select>
            <FormError message={errors.icon?.[0]} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm bg-navy-600 text-white font-medium rounded-lg hover:bg-navy-700 disabled:opacity-50 transition-colors">
              {loading ? "Guardando..." : editing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
