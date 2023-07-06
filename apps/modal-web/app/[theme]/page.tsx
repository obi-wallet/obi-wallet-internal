import dynamic from "next/dynamic";

const Modal = dynamic(() => import("../../src/modal"), {
  ssr: false,
});

export default async function Index({ params }: { params: { theme: string } }) {
  return <Modal theme={params.theme} />;
}
