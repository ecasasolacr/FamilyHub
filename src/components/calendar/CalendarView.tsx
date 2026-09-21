"use client";

import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List, Clock } from "lucide-react";

export function CalendarView({ events, profiles, isAdmin }: { events: any[], profiles: any[], isAdmin: boolean }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "day">("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Month View calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter events for selected day
  const selectedDayEvents = events.filter(e => isSameDay(parseISO(e.start_time), selectedDate));

  const getProfileColor = (assignedTo: string | null) => {
    if (!assignedTo) return "#64748b"; // slate-500 for family
    const p = profiles.find(p => p.id === assignedTo);
    return p ? p.avatar_color : "#64748b";
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-slate-100 p-4 md:p-6 overflow-hidden">
      {/* Header & Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-xl font-bold text-slate-800 capitalize w-36 text-center">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setView("month")}
            className={`p-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all ${view === "month" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
          >
            <CalendarIcon className="w-4 h-4" /> <span className="hidden sm:inline">Mes</span>
          </button>
          <button 
            onClick={() => setView("day")}
            className={`p-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all ${view === "day" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
          >
            <List className="w-4 h-4" /> <span className="hidden sm:inline">Día</span>
          </button>
        </div>
      </div>

      {/* Month View */}
      {view === "month" && (
        <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="py-2">{day}</div>
          ))}
          
          {daysInMonth.map((day, idx) => {
            const dayEvents = events.filter(e => isSameDay(parseISO(e.start_time), day));
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <button 
                key={day.toISOString()} 
                onClick={() => { setSelectedDate(day); setView("day"); }}
                className={`min-h-[80px] p-1 md:p-2 border rounded-xl flex flex-col items-center transition-all ${!isCurrentMonth ? 'opacity-30' : ''} ${isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-slate-100 hover:border-slate-300'}`}
              >
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${isToday(day) ? 'bg-primary text-white font-bold' : 'text-slate-700 font-medium'}`}>
                  {format(day, 'd')}
                </span>
                <div className="mt-1 flex flex-wrap gap-1 justify-center w-full">
                  {dayEvents.slice(0, 3).map(e => (
                    <div key={e.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: getProfileColor(e.assigned_to) }} title={e.title} />
                  ))}
                  {dayEvents.length > 3 && <span className="text-[10px] text-slate-400">+{dayEvents.length - 3}</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Day View */}
      {view === "day" && (
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 capitalize">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
          </h3>
          
          {selectedDayEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No hay eventos para este día.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map(event => (
                <div key={event.id} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: getProfileColor(event.assigned_to) }} />
                  <div className="flex-1 ml-2">
                    <h4 className="font-bold text-slate-800">{event.title}</h4>
                    {event.description && <p className="text-sm text-slate-500 mt-1">{event.description}</p>}
                    <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(parseISO(event.start_time), 'HH:mm')} - {format(parseISO(event.end_time), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAB for Admin to Create Event */}
      {isAdmin && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-20 right-6 md:static md:w-full md:mt-6 bg-primary text-white p-4 md:py-3 md:rounded-xl rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-6 h-6 md:w-5 md:h-5" />
          <span className="hidden md:inline font-bold">Nuevo Evento</span>
        </button>
      )}

      {/* Basic Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Crear Nuevo Evento</h3>
            <form action={async (formData) => {
              const { createEvent } = await import('@/app/calendar/actions');
              await createEvent(formData);
              setIsModalOpen(false);
            }} className="space-y-4">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título</label>
                <input name="title" required type="text" className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
                <textarea name="description" rows={2} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha</label>
                  <input name="date" required type="date" defaultValue={format(selectedDate, 'yyyy-MM-dd')} className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Asignado a</label>
                  <select name="assigned_to" className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="family">Toda la familia</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.first_name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Hora Inicio</label>
                  <input name="start_time" required type="time" defaultValue="10:00" className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Hora Fin</label>
                  <input name="end_time" required type="time" defaultValue="11:00" className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
