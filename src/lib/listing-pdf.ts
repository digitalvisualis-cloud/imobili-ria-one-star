import jsPDF from 'jspdf';

export interface PdfListingData {
  tipo: string;
  operacao: string;
  endereco: string;
  cidade: string;
  estado: string;
  preco: number;
  quartos: number;
  banheiros: number;
  metros_construidos: number;
  metros_terreno: number;
  vagas: number;
  amenidades: string[];
  descricao: string;
  agente_nome: string;
  agente_telefone: string;
  agente_email: string;
  imagens: string[];
}

const formatBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n || 0);

async function loadImageAsDataURL(url: string): Promise<{ dataUrl: string; w: number; h: number } | null> {
  try {
    const resp = await fetch(url, { mode: 'cors' });
    const blob = await resp.blob();
    const dataUrl: string = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onloadend = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(blob);
    });
    const dims = await new Promise<{ w: number; h: number }>((res) => {
      const img = new Image();
      img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => res({ w: 1, h: 1 });
      img.src = dataUrl;
    });
    return { dataUrl, w: dims.w, h: dims.h };
  } catch (e) {
    console.warn('Image load failed', url, e);
    return null;
  }
}

export async function generateListingPdf(data: PdfListingData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;

  // Colors (gold/charcoal theme)
  const gold: [number, number, number] = [191, 149, 63];
  const charcoal: [number, number, number] = [38, 38, 38];
  const muted: [number, number, number] = [115, 115, 115];
  const lightBg: [number, number, number] = [248, 246, 240];

  // === HEADER BAR ===
  doc.setFillColor(...gold);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(`${data.tipo} para ${data.operacao}`, margin, 13);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const loc = [data.endereco, data.cidade, data.estado].filter(Boolean).join(' • ');
  if (loc) doc.text(loc, margin, 21);

  let y = 36;

  // === PRICE ===
  doc.setTextColor(...gold);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(formatBRL(data.preco), margin, y);
  y += 8;

  // === COVER IMAGE ===
  if (data.imagens.length > 0) {
    const cover = await loadImageAsDataURL(data.imagens[0]);
    if (cover) {
      const imgW = contentW;
      const imgH = Math.min(85, (imgW * cover.h) / cover.w);
      try {
        doc.addImage(cover.dataUrl, 'JPEG', margin, y, imgW, imgH, undefined, 'FAST');
        y += imgH + 6;
      } catch {
        // ignore unsupported format
      }
    }
  }

  // === KEY FACTS BOX ===
  const facts = [
    { label: 'Quartos', value: String(data.quartos || '—') },
    { label: 'Banheiros', value: String(data.banheiros || '—') },
    { label: 'Vagas', value: String(data.vagas || '—') },
    { label: 'Construído', value: data.metros_construidos ? `${data.metros_construidos} m²` : '—' },
    { label: 'Terreno', value: data.metros_terreno ? `${data.metros_terreno} m²` : '—' },
  ];
  const boxH = 18;
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentW, boxH, 2, 2, 'F');
  const colW = contentW / facts.length;
  facts.forEach((f, i) => {
    const cx = margin + colW * i + colW / 2;
    doc.setTextColor(...charcoal);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(f.value, cx, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(f.label, cx, y + 14, { align: 'center' });
  });
  y += boxH + 8;

  // === DESCRIPTION ===
  doc.setTextColor(...gold);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Descrição', margin, y);
  y += 6;
  doc.setTextColor(...charcoal);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(data.descricao || '—', contentW);
  const lineH = 4.6;
  for (const line of descLines) {
    if (y > pageH - 30) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineH;
  }
  y += 4;

  // === AMENITIES ===
  if (data.amenidades.length > 0) {
    if (y > pageH - 50) { doc.addPage(); y = margin; }
    doc.setTextColor(...gold);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Diferenciais', margin, y);
    y += 6;
    doc.setTextColor(...charcoal);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const cols = 3;
    const colWidth = contentW / cols;
    data.amenidades.forEach((a, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = margin + col * colWidth;
      const ay = y + row * 6;
      if (ay > pageH - 30) return;
      doc.setFillColor(...gold);
      doc.circle(x + 1.5, ay - 1.2, 1, 'F');
      doc.text(a, x + 5, ay);
    });
    y += Math.ceil(data.amenidades.length / cols) * 6 + 6;
  }

  // === EXTRA PHOTOS ===
  const extras = data.imagens.slice(1, 7);
  if (extras.length > 0) {
    if (y > pageH - 70) { doc.addPage(); y = margin; }
    doc.setTextColor(...gold);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Galeria', margin, y);
    y += 6;
    const cols = 3;
    const gap = 3;
    const thumbW = (contentW - gap * (cols - 1)) / cols;
    const thumbH = thumbW * 0.7;
    for (let i = 0; i < extras.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = margin + col * (thumbW + gap);
      const ty = y + row * (thumbH + gap);
      if (ty + thumbH > pageH - 30) break;
      const img = await loadImageAsDataURL(extras[i]);
      if (img) {
        try {
          doc.addImage(img.dataUrl, 'JPEG', x, ty, thumbW, thumbH, undefined, 'FAST');
        } catch { /* skip */ }
      }
    }
    y += Math.ceil(extras.length / cols) * (thumbH + gap) + 4;
  }

  // === FOOTER (CONTACT) on last page ===
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const fy = pageH - 18;
    doc.setFillColor(...charcoal);
    doc.rect(0, fy, pageW, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(data.agente_nome || 'Corretor', margin, fy + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const contact = [data.agente_telefone, data.agente_email].filter(Boolean).join('  •  ');
    if (contact) doc.text(contact, margin, fy + 13);
    doc.setTextColor(...gold);
    doc.setFontSize(8);
    doc.text(`${p} / ${totalPages}`, pageW - margin, fy + 13, { align: 'right' });
  }

  const fileName = `${data.tipo}-${data.cidade || 'imovel'}`.replace(/\s+/g, '-').toLowerCase();
  doc.save(`${fileName}.pdf`);
}
