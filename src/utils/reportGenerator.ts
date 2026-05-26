// src/utils/reportGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RelatorioData {
  user: { nome: string; usuario: string } | null;
  metricas: {
    faturamentoTotal: number;
    ticketMedio: number;
    pedidosEntregues: number;
    pedidosCancelados: number;
  };
  stats: {
    totalPratos: number;
    saudaveis: number;
    criticos: number;
    melhorPrato: { nome: string; healthScore: number };
  };
}

export function gerarRelatorioGerencial({ user, metricas, stats }: RelatorioData) {
  const doc = new jsPDF();
  const dataAtual = new Date().toLocaleString('pt-BR');

  // ==========================================
  // CABEÇALHO DO DOCUMENTO
  // ==========================================
  doc.setFontSize(22);
  doc.setTextColor(11, 43, 38); // river-dark aproximado
  doc.text('Relatório Executivo - RiverFood', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Parceiro: ${user?.nome}`, 14, 32);
  doc.text(`Gerado em: ${dataAtual}`, 14, 38);
  doc.text(`Documento de uso interno.`, 14, 44);

  // Linha separadora
  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 48, 196, 48);

  // ==========================================
  // TABELA 1: RESULTADOS DE VENDAS
  // ==========================================
  const formatarMoeda = (valor: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  autoTable(doc, {
    startY: 55,
    head: [['Métrica Financeira', 'Resultado']],
    body: [
      ['Faturamento Total', formatarMoeda(metricas.faturamentoTotal)],
      ['Ticket Médio', formatarMoeda(metricas.ticketMedio)],
      ['Pedidos Entregues (Sucesso)', metricas.pedidosEntregues.toString()],
      ['Pedidos Cancelados (Perdas)', metricas.pedidosCancelados.toString()],
    ],
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' }, // emerald-500
    alternateRowStyles: { fillColor: [248, 250, 252] },
    theme: 'grid',
  });

  // ==========================================
  // TABELA 2: INTELIGÊNCIA DE CARDÁPIO
  // ==========================================
  // Pegamos a posição final (Y) da tabela anterior para não sobrepor
  const finalY = (doc as any).lastAutoTable.finalY || 55;

  autoTable(doc, {
    startY: finalY + 15,
    head: [['Indicador de Cardápio', 'Dados Atuais']],
    body: [
      ['Total de Pratos Ativos', stats.totalPratos.toString()],
      ['Pratos Saudáveis (Score A ou B)', stats.saudaveis.toString()],
      ['Pratos Críticos (Score de Atenção)', stats.criticos.toString()],
      ['Prato com Melhor Avaliação', `${stats.melhorPrato.nome} (Score: ${stats.melhorPrato.healthScore})`],
    ],
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' }, // slate-900
    alternateRowStyles: { fillColor: [248, 250, 252] },
    theme: 'grid',
  });

  // ==========================================
  // RODAPÉ
  // ==========================================
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} - RiverFood Delivery Tech`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // ==========================================
  // SALVAR ARQUIVO
  // ==========================================
  const nomeArquivo = `Fechamento_${user?.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nomeArquivo);
}

// Adicione esta nova função no final de src/utils/reportGenerator.ts

export function gerarRelatorioHistorico(pedidos: any[], restauranteNome: string = 'Restaurante') {
  // 'l' significa Landscape (Paisagem), formato A4
  const doc = new jsPDF('l', 'mm', 'a4'); 
  const dataAtual = new Date().toLocaleString('pt-BR');

  // Cabeçalho
  doc.setFontSize(22);
  doc.setTextColor(11, 43, 38);
  doc.text('Relatório de Pedidos e Entregas', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Estabelecimento: ${restauranteNome}`, 14, 32);
  doc.text(`Extraído em: ${dataAtual}`, 14, 38);
  doc.text(`Total de registros: ${pedidos.length}`, 14, 44);

  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 48, 283, 48); // Linha mais longa por ser paisagem

  // Preparação dos dados para a tabela
  const tableData = pedidos.map(p => [
    `#${p.id}`,
    new Date(p.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    p.cliente.nome,
    p.itens.map((i: any) => `${i.quantidade}x ${i.nomeProdutoSnapshot}`).join('\n'), // Quebra linha por item
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valorTotal),
    p.metodoPagamento,
    p.status.toUpperCase(),
    p.entregador ? `${p.entregador.nome}\n(${p.entregador.usuario})` : 'Não atribuído' // Pega nome e email do motoboy
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['ID', 'Data/Hora', 'Cliente', 'Itens do Pedido', 'Total', 'Pagamento', 'Status', 'Entregador (Nome/Email)']],
    body: tableData,
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' }, // Fonte menor para caber tudo
    columnStyles: {
      3: { cellWidth: 50 }, // Dá mais espaço para a coluna de itens
      7: { cellWidth: 45 }  // Dá mais espaço para o e-mail do motoboy não quebrar feio
    },
    theme: 'grid',
  });

  // Rodapé com numeração de página
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} - RiverFood Delivery Tech`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const nomeArquivo = `Historico_Pedidos_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(nomeArquivo);
}