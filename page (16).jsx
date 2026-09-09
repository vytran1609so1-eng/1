import ArchiveScreen from "@/components/ArchiveScreen";
import { getSettings, getEntries } from "@/lib/data";

export const dynamic = "force-dynamic";
/* Belt and braces with the no-store fetch in lib/supabase.js: this page is
   rebuilt on every request, never served from a cache. */
export const revalidate = 0;

export const metadata = {
  title: "Archive",
  description: "The complete record of every activity, newest first.",
};

export default async function Page() {
  const settings = await getSettings();
  const entries = await getEntries(settings);
  return <ArchiveScreen settings={settings} entries={entries} />;
}
