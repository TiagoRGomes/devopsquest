// Gera o certificado como arquivo PDF (A4 paisagem) pronto para imprimir.
import { jsPDF } from "jspdf";
import type { CertificateData } from "@/components/Certificate";

export interface CertificateLabels {
  brand: string;
  heading: string;
  certifies: string;
  line: string;
  hoursLabel: string;
  issuedLabel: string;
  codeLabel: string;
  signature: string;
  hoursValue: string;
  issuedValue: string;
}

const NAVY = [12, 18, 32] as const;
const GOLD = [214, 168, 74] as const;
const CYAN = [64, 196, 214] as const;
const TEXT = [28, 34, 48] as const;

function drawLogo(doc: jsPDF, x: number, y: number) {
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.roundedRect(x, y, 46, 46, 10, 10, "f");
  doc.setDrawColor(CYAN[0], CYAN[1], CYAN[2]);
  doc.setLineWidth(2.4);
  // Sinal de terminal: > _
  doc.line(x + 13, y + 17, x + 21, y + 23);
  doc.line(x + 21, y + 23, x + 13, y + 29);
  doc.line(x + 25, y + 30, x + 34, y + 30);
}

export function certificateFilename(data: CertificateData) {
  const base = data.kind === "final" ? "certificado-final" : "certificado-modulo";
  return `${base}-${data.code}.pdf`;
}

export function buildCertificatePdf(data: CertificateData, labels: CertificateLabels): jsPDF {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const accent = data.kind === "final" ? GOLD : CYAN;

  doc.setFillColor(252, 252, 253);
  doc.rect(0, 0, W, H, "f");

  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, W, 14, "f");
  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.rect(0, 14, W, 4, "f");

  doc.setDrawColor(accent[0], accent[1], accent[2]);
  doc.setLineWidth(1.4);
  doc.rect(32, 34, W - 64, H - 68);
  doc.setDrawColor(226, 228, 234);
  doc.setLineWidth(0.7);
  doc.rect(42, 44, W - 84, H - 88);

  drawLogo(doc, W / 2 - 23, 64);

  doc.setTextColor(accent[0], accent[1], accent[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(labels.brand.toUpperCase(), W / 2, 132, { align: "center", charSpace: 2.5 });

  doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.setFontSize(26);
  doc.text(labels.heading, W / 2, 168, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(110, 116, 130);
  doc.text(labels.certifies, W / 2, 202, { align: "center" });

  doc.setFont("times", "bold");
  doc.setFontSize(34);
  doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
  doc.text(data.studentName, W / 2, 240, { align: "center" });

  doc.setDrawColor(accent[0], accent[1], accent[2]);
  doc.setLineWidth(1);
  doc.line(W / 2 - 170, 252, W / 2 + 170, 252);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(60, 66, 80);
  const lines = doc.splitTextToSize(labels.line, W - 220);
  doc.text(lines, W / 2, 286, { align: "center" });

  const boxY = 380;
  const cols = [
    { label: labels.hoursLabel, value: labels.hoursValue },
    { label: labels.issuedLabel, value: labels.issuedValue },
    { label: labels.codeLabel, value: data.code },
  ];
  cols.forEach((col, i) => {
    const cx = W / 4 + (i * (W / 2)) / 2;
    doc.setFontSize(9);
    doc.setTextColor(130, 136, 148);
    doc.text(col.label.toUpperCase(), cx, boxY, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text(col.value, cx, boxY + 22, { align: "center" });
    doc.setFont("helvetica", "normal");
  });

  doc.setDrawColor(180, 186, 198);
  doc.setLineWidth(0.8);
  doc.line(W / 2 - 110, H - 78, W / 2 + 110, H - 78);
  doc.setFontSize(10);
  doc.setTextColor(110, 116, 130);
  doc.text(labels.signature, W / 2, H - 62, { align: "center" });

  return doc;
}

export function downloadCertificatePdf(data: CertificateData, labels: CertificateLabels) {
  buildCertificatePdf(data, labels).save(certificateFilename(data));
}
