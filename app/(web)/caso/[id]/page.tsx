import { CaseDetail } from "@/components/CaseDetail";

export default async function CasoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CaseDetail postId={id} />;
}
