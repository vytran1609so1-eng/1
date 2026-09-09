import AboutScreen from "@/components/AboutScreen";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "About",
  description:
    "The parts that do not fit on a CV — a timeline of the things I have done, the places I have been and the people I did it with.",
};

export default async function Page() {
  const settings = await getSettings();
  return <AboutScreen settings={settings} />;
}
