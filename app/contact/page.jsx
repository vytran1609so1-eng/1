import ContactScreen from "@/components/ContactScreen";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact",
  description: "Get in touch with Tran Thi Thuy Vy.",
};

export default async function Page() {
  const settings = await getSettings();
  return <ContactScreen settings={settings} />;
}
