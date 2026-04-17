import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as xlsx from 'xlsx';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });

    const headerIndex = data.findIndex(row => row && row[0] === 'Razão Social');
    if (headerIndex === -1) {
       return NextResponse.json({ error: 'Invalid spreadsheet format: Cabeçalho "Razão Social" não encontrado' }, { status: 400 });
    }

    const headers = data[headerIndex];
    const rows = data.slice(headerIndex + 1);

    let count = 0;

    for (const row of rows) {
      if (!row || !row[0]) continue; 

      const rowData: Record<string, any> = {};
      headers.forEach((header: string, index: number) => {
        rowData[header] = row[index];
      });

      const mapField = (val: any) => val ? String(val).trim() : null;
      const diasSemComprarStr = mapField(rowData['Dias sem comprar']);
      const cicloMedioStr = mapField(rowData['Ciclo médio de compra']);
      let diasSemComprar = diasSemComprarStr ? parseInt(diasSemComprarStr) : null;
      let cicloMedio = cicloMedioStr ? parseFloat(cicloMedioStr) : null;

      let pipelineStatus = 'OPORTUNIDADE';
      const situacao = mapField(rowData['Situação']);
      if (situacao === 'Ativo') {
        pipelineStatus = 'ATIVADO';
      } else if (situacao === 'Inativos antigos') {
        pipelineStatus = 'PERDIDO';
      }

      const valorUltimoPedidoStr = mapField(rowData['Valor do último pedido']);

      const razaoSocial = mapField(rowData['Razão Social']) || 'Sem nome';

      const existingClient = await prisma.client.findFirst({
        where: { razaoSocial }
      });

      const upsertData = {
        nomeFantasia: mapField(rowData['Nome fantasia']),
        email: mapField(rowData['E-mail']),
        telefone: mapField(rowData['Telefone']),
        cidade: mapField(rowData['Cidade']),
        estado: mapField(rowData['Estado']),
        bairro: mapField(rowData['Bairro']),
        cep: mapField(rowData['CEP']),
        endereco: mapField(rowData['Endereço']),
        segmento: mapField(rowData['Segmento']),
        situacaoPlanilha: situacao,
        ultimoPedido: mapField(rowData['Último pedido']),
        vendedorUltimoPedido: mapField(rowData['Vendedor do último pedido']),
        valorUltimoPedido: valorUltimoPedidoStr ? parseFloat(valorUltimoPedidoStr) : null,
        diasSemComprar: isNaN(diasSemComprar as number) ? null : diasSemComprar,
        cicloMedioCompra: isNaN(cicloMedio as number) ? null : cicloMedio,
      };

      if (existingClient) {
        // Protege o pipeline se o cliente já estiver em contato ativo
        let finalStatus = pipelineStatus;
        const activeStages = ['CONTATO_INICIAL', 'EM_NEGOCIACAO'];
        if (activeStages.includes(existingClient.pipelineStatus)) {
          finalStatus = existingClient.pipelineStatus;
        }

        await prisma.client.update({
          where: { id: existingClient.id },
          data: {
            ...upsertData,
            pipelineStatus: finalStatus as any,
          }
        });
      } else {
        await prisma.client.create({
          data: {
            razaoSocial,
            ...upsertData,
            pipelineStatus: pipelineStatus as any,
          }
        });
      }
      count++;
    }

    return NextResponse.json({ message: `Successfully imported ${count} clients` });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import file', details: error.message }, { status: 500 });
  }
}
