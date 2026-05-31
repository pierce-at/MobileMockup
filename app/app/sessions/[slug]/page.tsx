import { SessionDetailScreen } from "@/components/session-detail-screen";
import { defaultAppState } from "@/lib/data/mock-data";

type SessionDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { slug } = await params;
  return <SessionDetailScreen slug={slug} />;
}

export function generateStaticParams() {
  return defaultAppState.sessions.map((session) => ({
    slug: session.slug
  }));
}
