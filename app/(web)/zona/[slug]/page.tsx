import { ZonePageClient } from "@/components/ZonePageClient";

export default async function ZonaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ZonePageClient slug={slug} />;
}
