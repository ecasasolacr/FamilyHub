import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PantryView } from "@/components/pantry/PantryView";

export default async function PantryPage() {
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

  // Fetch all pantry items
  const { data: items } = await supabase
    .from("pantry_items")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen p-4 max-w-5xl mx-auto w-full">
      <header className="mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
          Despensa
        </h1>
        <p className="text-slate-500 font-medium">Gestiona tu inventario y lista de compras.</p>
      </header>

      <div className="flex-1 min-h-0">
        <PantryView items={items || []} />
      </div>
    </div>
  );
}
