import ContractDetail from '@/components/contracts/ContractDetail';

export default function ContractDetailPage({
  params,
}: {
  params: { contractId: string };
}) {
  return <ContractDetail contractId={params.contractId} />;
}
