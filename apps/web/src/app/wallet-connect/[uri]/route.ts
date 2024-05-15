import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: { uri: string } }) {
  redirect(`/dashboard/app-connect?uri=${encodeURIComponent(params.uri)}`);
}
