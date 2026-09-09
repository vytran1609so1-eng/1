import BlogScreen from "@/components/BlogScreen";
import { getSettings, getPosts } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Blog",
  description: "Ghi chép về fintech, chuyện học và vài thứ ngoài lề.",
};

export default async function Page() {
  const [settings, posts] = await Promise.all([getSettings(), getPosts()]);
  return <BlogScreen settings={settings} posts={posts} />;
}
