import { notFound } from "next/navigation";
import PostScreen from "@/components/PostScreen";
import { getSettings, getPost, getPosts } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** The title and the summary that show in a browser tab and in a shared link. */
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return { title: "Không tìm thấy bài viết" };
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      images: post.cover ? [post.cover] : undefined,
    },
  };
}

export default async function Page({ params }) {
  const [settings, post] = await Promise.all([getSettings(), getPost(params.slug)]);
  if (!post) notFound();

  /* Three other posts to carry on with, newest first. */
  const all = await getPosts();
  const more = all.filter((p) => p.slug !== post.slug).slice(0, 3);

  return <PostScreen settings={settings} post={post} more={more} />;
}
