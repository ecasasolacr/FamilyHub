import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Star, CheckCircle, Clock } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  // Fetch pending tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("assigned_to", user.id)
    .eq("is_completed", false)
    .order("due_date", { ascending: true })
    .limit(5);

  // Fetch upcoming events (simplification: getting 5 upcoming ones)
  const now = new Date().toISOString();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .gte("start_time", now)
    .order("start_time", { ascending: true })
    .limit(5);

  return (
    <div className="flex flex-col min-h-screen px-4 py-8 max-w-4xl mx-auto w-full">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
            Hola {profile.first_name} 👋
          </h1>
          <p className="text-slate-500 font-medium">Aquí está el resumen de hoy.</p>
        </div>
        
        {/* US2.2: Points Display */}
        {profile.role === "member" && (
          <div className="flex flex-col items-center justify-center bg-amber-50 text-amber-600 border border-amber-200 px-4 py-2 rounded-2xl shadow-sm">
            <div className="flex items-center gap-1 font-bold text-xl">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              {profile.total_points}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600/80">Puntos</span>
          </div>
        )}
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* US2.1: Tareas Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Tus Tareas
            </h2>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
              {tasks?.length || 0} PENDIENTES
            </span>
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            {(!tasks || tasks.length === 0) ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl py-8 border border-dashed border-slate-200 text-sm font-medium">
                No hay tareas pendientes. ¡Buen trabajo!
              </div>
            ) : (
              tasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <span className="font-semibold text-slate-700">{task.title}</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-amber-500" /> {task.points}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* US2.1: Eventos Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Próximos Eventos
            </h2>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
              {events?.length || 0} PRÓXIMOS
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {(!events || events.length === 0) ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl py-8 border border-dashed border-slate-200 text-sm font-medium">
                No hay eventos programados.
              </div>
            ) : (
              events.map((event: any) => {
                const date = new Date(event.start_time);
                return (
                  <div key={event.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50">
                    <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl w-12 h-12 flex-shrink-0">
                      <span className="text-xs font-bold text-red-500">{date.toLocaleDateString('es', { month: 'short' }).toUpperCase()}</span>
                      <span className="text-sm font-black text-slate-800">{date.getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{event.title}</h3>
                      <p className="text-xs font-medium text-slate-500">
                        {date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
