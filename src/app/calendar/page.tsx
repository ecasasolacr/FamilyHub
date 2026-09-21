import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/calendar/CalendarView";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: { session } } = await supabase.auth.getSession();
  const providerToken = session?.provider_token;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  // Fetch all events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("start_time", { ascending: true });

  let googleEvents: any[] = [];
  if (providerToken) {
    try {
      const { fetchFamilyHubEvents } = await import("@/lib/google-calendar");
      const items = await fetchFamilyHubEvents(providerToken);
      googleEvents = items.map((item: any) => ({
        id: item.id,
        title: item.summary,
        description: item.description || "",
        start_time: item.start?.dateTime || item.start?.date,
        end_time: item.end?.dateTime || item.end?.date,
        assigned_to: "google",
      }));
    } catch (e) {
      console.error(e);
    }
  }

  const allEvents = [...(events || []), ...googleEvents];

  // Fetch all profiles for color mapping
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, avatar_color");
    
  const allProfiles = [
    ...(profiles || []),
    { id: "google", first_name: "Google Calendar", avatar_color: "#4285F4" }
  ];

  const isAdmin = profile.role === "admin";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen p-4 max-w-5xl mx-auto w-full">
      <header className="mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
          Calendario
        </h1>
        <p className="text-slate-500 font-medium">Visualiza y organiza los eventos de la familia.</p>
      </header>

      <div className="flex-1 min-h-0">
        <CalendarView 
          events={allEvents} 
          profiles={allProfiles} 
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
