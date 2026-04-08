import { PostDetailContent } from "@/components/post/PostDetailContent";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <PostDetailContent paramsPromise={params} />;
}
