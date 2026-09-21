"use client";

import { useState } from "react";
import { Plus, ShoppingCart, Archive, AlertCircle, Trash2, CheckSquare, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PantryView({ items }: { items: any[] }) {
  const [activeTab, setActiveTab] = useState<"pantry" | "shopping">("pantry");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pantryItems = items.filter(i => !i.is_low_stock);
  const shoppingItems = items.filter(i => i.is_low_stock);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const { toggleLowStock } = await import('@/app/pantry/actions');
    await toggleLowStock(id, currentStatus);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este artículo?")) {
      const { deletePantryItem } = await import('@/app/pantry/actions');
      await deletePantryItem(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-6 relative overflow-hidden">
      
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-100 mb-6">
        <button 
          onClick={() => setActiveTab("pantry")}
          className={`pb-3 font-bold text-sm transition-colors relative flex items-center gap-2 ${activeTab === "pantry" ? "text-primary" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Archive className="w-4 h-4" /> Despensa
          {activeTab === "pantry" && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("shopping")}
          className={`pb-3 font-bold text-sm transition-colors relative flex items-center gap-2 ${activeTab === "shopping" ? "text-rose-500" : "text-slate-400 hover:text-slate-600"}`}
        >
          <ShoppingCart className="w-4 h-4" /> Compras ({shoppingItems.length})
          {activeTab === "shopping" && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-t-full" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-24">
        <AnimatePresence mode="popLayout">
          {activeTab === "pantry" ? (
            pantryItems.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Tu despensa está vacía. Añade artículos.
              </motion.div>
            ) : (
              pantryItems.map(item => (
                <motion.div 
                  key={item.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 group"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggle(item.id, item.is_low_stock)}
                      title="Marcar para comprar"
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                      <AlertCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-red-500 rounded-full transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )
          ) : (
            shoppingItems.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                ¡No hay nada en la lista de compras!
              </motion.div>
            ) : (
              shoppingItems.map(item => (
                <motion.div 
                  key={item.id} 
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-4 rounded-2xl border border-rose-100 bg-rose-50"
                >
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggle(item.id, item.is_low_stock)} className="text-rose-400 hover:text-rose-600">
                      <Square className="w-6 h-6" />
                    </button>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">{item.category}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-300 hover:text-rose-500 rounded-full transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )
          )}
        </AnimatePresence>
      </div>

      {/* FAB Add Item */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="absolute bottom-6 right-6 md:static md:w-full md:mt-4 bg-primary text-white p-4 md:py-3 md:rounded-xl rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-6 h-6 md:w-5 md:h-5" />
        <span className="hidden md:inline font-bold">Añadir Artículo</span>
      </button>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Añadir Artículo</h3>
            <form action={async (formData) => {
              const { addPantryItem } = await import('@/app/pantry/actions');
              await addPantryItem(formData);
              setIsModalOpen(false);
            }} className="space-y-4">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
                <input name="name" required type="text" placeholder="Ej. Leche, Huevos..." className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Categoría</label>
                <select name="category" required className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="Lácteos">Lácteos</option>
                  <option value="Verduras">Verduras</option>
                  <option value="Frutas">Frutas</option>
                  <option value="Carnes">Carnes</option>
                  <option value="Limpieza">Limpieza</option>
                  <option value="Despensa">Despensa Básica</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                  Añadir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
