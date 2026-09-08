import HomeScreen from "@/components/HomeScreen";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
/* Belt and braces with the no-store fetch in lib/supabase.js: this page is
   rebuilt on every request, never served from a cache. */
export const revalidate = 0;

export default async function Page() {
  const settings = await getSettings();
  return <HomeScreen settings={settings} />;
}
