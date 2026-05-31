import { SponsorProfileScreen } from "@/components/sponsor-profile-screen";
import { defaultAppState } from "@/lib/data/mock-data";

type SponsorProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SponsorProfilePage({ params }: SponsorProfilePageProps) {
  const { slug } = await params;
  return <SponsorProfileScreen slug={slug} />;
}

export function generateStaticParams() {
  return defaultAppState.sponsors.map((sponsor) => ({
    slug: sponsor.slug
  }));
}
