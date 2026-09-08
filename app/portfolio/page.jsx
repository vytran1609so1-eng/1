import PortfolioScreen from "@/components/PortfolioScreen";
import { getSettings, getEntries } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portfolio",
  description:
    "Academic work, professional experience, leadership, extracurricular projects and competitions.",
};

export default async function Page() {
  const settings = await getSettings();
  const entries = await getEntries(settings);
  return <PortfolioScreen settings={settings} entries={entries} />;
}
