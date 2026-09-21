"use client";

import { useState } from "react";
import { CheckCircle, Star, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TaskList({ 
  pendingTasks, 
  completedTasks, 
  profiles, 
  isAdmin 
}: { 
  pendingTasks: any[], 
  completedTasks: any[], 
  profiles: any[], 
  isAdmin: boolean 
}) {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const handleComplete = async (task: any) => {
    setCompletingId(task.id);
    
    // Call server action dynamically
    const { completeTask } = await import('@/app/tasks/actions');
    await completeTask(task.id, task.points, task.assigned_to);
    
    // We keep the completingId for a second to show the animation, then it unmounts via revalidate
    setTimeout(() => {
      setCompletingId(null);
    }, 1500);
  };

  const getProfileName = (id: string) => profiles.find(p => p.id === id)?.first_name || "Desconocido";

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-6 relative overflow-hidden">
      
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-100 mb-6">
        <button 
          onClick={() => setActiveTab("pending")}
          className={`pb-3 font-bold text-sm transition-colors relative ${activeTab === "pending" ? "text-primary" : "text-slate-400 hover:text-slate-600"}`}
        >
          Pendientes
          {activeTab === "pending" && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={`pb-3 font-bold text-sm transition-colors relative ${activeTab === "history" ? "text-primary" : "text-slate-400 hover:text-slate-600"}`}
        >
          Historial Semanal
          {activeTab === "history" && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {/* Pending Tasks */}
      {activeTab === "pending" && (
        <div className="flex-1 overflow-y-auto space-y-3 pb-24">
          <AnimatePresence>
            {pendingTasks.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                ¡Todo listo! No hay tareas pendientes.
              </motion.div>
            ) : (
              pendingTasks.map(task => (
                <motion.div 
                  key={task.id} 
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 relative"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{task.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs font-semibold">
                      <span className="text-slate-500">Para: {getProfileName(task.assigned_to)}</span>
                      <span className="flex items-center gap-1 text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-amber-500" /> {task.points} pts
                      </span>
                    </div>
                  </div>

                  {completingId === task.id ? (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: [0, 1.2, 1] }} 
                      className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30"
                    >
                      <Check className="w-6 h-6" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <button 
                      onClick={() => handleComplete(task)}
                      className="w-10 h-10 rounded-full border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center group"
                    >
                      <CheckCircle className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* History */}
      {activeTab === "history" && (
        <div className="flex-1 overflow-y-auto space-y-3 pb-24">
          {completedTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Aún no hay tareas completadas esta semana.
            </div>
          ) : (
            completedTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white opacity-60">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 line-through">{task.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs font-semibold">
                    <span className="text-slate-500">Hecho por: {getProfileName(task.assigned_to)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-bold text-sm">
                  <Check className="w-4 h-4" /> +{task.points}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Admin Create Task FAB */}
      {isAdmin && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-6 right-6 md:static md:w-full md:mt-4 bg-primary text-white p-4 md:py-3 md:rounded-xl rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-6 h-6 md:w-5 md:h-5" />
          <span className="hidden md:inline font-bold">Nueva Tarea</span>
        </button>
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Asignar Tarea</h3>
            <form action={async (formData) => {
              const { createTask } = await import('@/app/tasks/actions');
              await createTask(formData);
              setIsModalOpen(false);
            }} className="space-y-4">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título de la tarea</label>
                <input name="title" required type="text" placeholder="Ej. Sacar la basura" className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Asignado a</label>
                  <select name="assigned_to" required className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary">
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.first_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Puntos Recompensa</label>
                  <input name="points" required type="number" defaultValue="10" min="1" max="100" className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
