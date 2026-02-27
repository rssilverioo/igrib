import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface ContractPdfData {
  contractId: string;
  buyerOrg: { name: string; cnpj: string };
  sellerOrg: { name: string; cnpj: string };
  buyerUser: { name: string; cpf: string | null };
  sellerUser: { name: string; cpf: string | null };
  product: { name: string; type: string };
  pricePerUnit: number;
  quantity: number;
  unit: string;
  deliveryType: string;
  deliveryDate: string | null;
  paymentTerms: string | null;
  notes: string | null;
  approvedAt: string;
}

export async function generateContractPdf(data: ContractPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  const drawText = (text: string, x: number, yPos: number, size = 10, bold = false) => {
    page.drawText(text, {
      x,
      y: yPos,
      size,
      font: bold ? fontBold : font,
      color: rgb(0.1, 0.1, 0.1),
    });
  };

  const drawLine = (yPos: number) => {
    page.drawLine({
      start: { x: margin, y: yPos },
      end: { x: width - margin, y: yPos },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
  };

  const totalValue = data.pricePerUnit * data.quantity;

  // Header
  drawText('iGrib', margin, y, 24, true);
  y -= 18;
  drawText('Contrato de Compra e Venda de Commodities', margin, y, 12, true);
  y -= 14;
  drawText(`Contrato N. ${data.contractId}`, margin, y, 9);
  y -= 10;
  drawText(`Aprovado em: ${data.approvedAt}`, margin, y, 9);
  y -= 20;
  drawLine(y);
  y -= 25;

  // Buyer section
  drawText('COMPRADOR', margin, y, 12, true);
  y -= 18;
  drawText(`Empresa: ${data.buyerOrg.name}`, margin, y);
  y -= 14;
  drawText(`CNPJ: ${data.buyerOrg.cnpj}`, margin, y);
  y -= 14;
  drawText(`Representante: ${data.buyerUser.name}`, margin, y);
  y -= 14;
  drawText(`CPF: ${data.buyerUser.cpf || 'Nao informado'}`, margin, y);
  y -= 25;

  // Seller section
  drawText('VENDEDOR', margin, y, 12, true);
  y -= 18;
  drawText(`Empresa: ${data.sellerOrg.name}`, margin, y);
  y -= 14;
  drawText(`CNPJ: ${data.sellerOrg.cnpj}`, margin, y);
  y -= 14;
  drawText(`Representante: ${data.sellerUser.name}`, margin, y);
  y -= 14;
  drawText(`CPF: ${data.sellerUser.cpf || 'Nao informado'}`, margin, y);
  y -= 25;

  drawLine(y);
  y -= 25;

  // Terms
  drawText('TERMOS DO CONTRATO', margin, y, 12, true);
  y -= 22;

  const terms = [
    ['Produto', `${data.product.name} (${data.product.type})`],
    ['Preco por Unidade', `R$ ${data.pricePerUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
    ['Quantidade', `${data.quantity} ${data.unit}`],
    ['Valor Total', `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
    ['Tipo de Entrega', data.deliveryType === 'DELIVERY' ? 'Entrega' : 'Retirada'],
    ['Data de Entrega', data.deliveryDate || 'A combinar'],
    ['Condicoes de Pagamento', data.paymentTerms || 'A combinar'],
  ];

  for (const [label, value] of terms) {
    drawText(`${label}:`, margin, y, 10, true);
    drawText(value, margin + 150, y, 10);
    y -= 16;
  }

  if (data.notes) {
    y -= 10;
    drawText('Observacoes:', margin, y, 10, true);
    y -= 14;
    drawText(data.notes, margin, y, 9);
    y -= 10;
  }

  y -= 20;
  drawLine(y);
  y -= 40;

  // Signature spaces
  drawText('ASSINATURAS', margin, y, 12, true);
  y -= 40;

  const sigWidth = (width - margin * 2 - 40) / 2;

  // Buyer signature
  drawLine(y);
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + sigWidth, y },
    thickness: 1,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 14;
  drawText(`${data.buyerOrg.name}`, margin, y, 9);
  y -= 12;
  drawText('Comprador', margin, y, 8);

  // Seller signature (same y level)
  const sellerX = margin + sigWidth + 40;
  page.drawLine({
    start: { x: sellerX, y: y + 26 },
    end: { x: sellerX + sigWidth, y: y + 26 },
    thickness: 1,
    color: rgb(0.3, 0.3, 0.3),
  });
  drawText(`${data.sellerOrg.name}`, sellerX, y, 9);
  y -= 12;
  drawText('Vendedor', sellerX, y + 12, 8);

  y -= 40;
  drawText('Documento gerado automaticamente pela plataforma iGrib.', margin, y, 7);

  return doc.save();
}
