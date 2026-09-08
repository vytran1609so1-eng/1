import HomeScreen from "@/components/HomeScreen";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const settings = await getSettings();
  return <HomeScreen settings={settings} />;
}
