import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { TaskList } from "@/components/tasks/TaskList";

export default async function TasksPage() {
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

  const isAdmin = profile.role === "admin";

  // Build queries
  let pendingQuery = supabase
    .from("tasks")
    .select("*")
    .eq("is_completed", false)
    .order("created_at", { ascending: false });

  let completedQuery = supabase
    .from("tasks")
    .select("*")
    .eq("is_completed", true)
    .order("created_at", { ascending: false })
    .limit(50); // Just recent history

  // If not admin, only fetch their own tasks
  if (!isAdmin) {
    pendingQuery = pendingQuery.eq("assigned_to", user.id);
    completedQuery = completedQuery.eq("assigned_to", user.id);
  }

  const [{ data: pendingTasks }, { data: completedTasks }] = await Promise.all([
    pendingQuery,
    completedQuery
  ]);

  // Fetch all profiles for names
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, avatar_color");

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen p-4 max-w-5xl mx-auto w-full">
      <header className="mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
          Tareas
        </h1>
        <p className="text-slate-500 font-medium">Gana puntos completando tus tareas.</p>
      </header>

      <div className="flex-1 min-h-0">
        <TaskList 
          pendingTasks={pendingTasks || []} 
          completedTasks={completedTasks || []} 
          profiles={profiles || []} 
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
