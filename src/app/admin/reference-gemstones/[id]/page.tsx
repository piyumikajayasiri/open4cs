import DataRecords from "@/components/admin/DataRecords";
export default async function ReferenceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DataRecords initialDataset="REFERENCE" initialRecordId={id} />;
}
