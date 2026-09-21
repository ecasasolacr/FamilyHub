import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { createProfile } from "../actions";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if profile exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (profile) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col justify-center items-center p-4 bg-slate-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            Completa tu Perfil
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            ¡Bienvenido a HomeHub! ¿Cómo te llamas?
          </p>
        </div>

        <form action={async (formData) => {
          "use server";
          await createProfile(formData);
        }} className="space-y-4">
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              Nombre
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Ej. Mamá, Juan..."
            />
          </div>

          <div>
            <label
              htmlFor="avatar_color"
              className="block text-sm font-semibold text-slate-700 mb-1"
            >
              Color de Avatar
            </label>
            <select
              id="avatar_color"
              name="avatar_color"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="#3B82F6">Azul</option>
              <option value="#EF4444">Rojo</option>
              <option value="#10B981">Verde</option>
              <option value="#F59E0B">Naranja</option>
              <option value="#8B5CF6">Morado</option>
              <option value="#EC4899">Rosa</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Guardar Perfil
          </button>
        </form>
      </div>
    </div>
  );
}
