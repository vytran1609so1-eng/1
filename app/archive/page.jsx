import ArchiveScreen from "@/components/ArchiveScreen";
import { getSettings, getEntries } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Archive",
  description: "The complete record of every activity, newest first.",
};

export default async function Page() {
  const settings = await getSettings();
  const entries = await getEntries(settings);
  return <ArchiveScreen settings={settings} entries={entries} />;
}
