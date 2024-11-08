import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export async function GET(
  _: Request,
  props: { params: Promise<{ uri: string }> },
) {
  const params = await props.params;
  redirect(`/dashboard/app-connect?uri=${encodeURIComponent(params.uri)}`);
}
