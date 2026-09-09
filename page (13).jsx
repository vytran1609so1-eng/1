import { notFound } from "next/navigation";
import KeywordScreen from "@/components/KeywordScreen";
import { getSettings, getEntries } from "@/lib/data";
import { KEYWORD_IDS } from "@/lib/content";

export const dynamic = "force-dynamic";
/* Belt and braces with the no-store fetch in lib/supabase.js: this page is
   rebuilt on every request, never served from a cache. */
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const settings = await getSettings();
  const k = settings.keywords.find((x) => x.id === params.keyword);
  if (!k) return { title: "Not found" };
  return { title: k.word, description: k.lead || k.line };
}

export default async function Page({ params }) {
  if (!KEYWORD_IDS.includes(params.keyword)) notFound();
  const settings = await getSettings();
  const entries = await getEntries(settings);
  return <KeywordScreen settings={settings} entries={entries} keywordId={params.keyword} />;
}
