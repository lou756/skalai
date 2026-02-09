import jsPDF from 'jspdf';
import type { SEOAnalysisResult } from './seo';

export function generatePDFReport(result: SEOAnalysisResult): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const addLine = (text: string, size = 10, bold = false, color: [number, number, number] = [50, 50, 50]) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, pageWidth - 30);
    doc.text(lines, 15, y);
    y += lines.length * (size * 0.45) + 2;
  };

  const addSeparator = () => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y, pageWidth - 15, y);
    y += 6;
  };

  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SKAL IA', 15, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('SEO Audit Report', 15, 26);
  doc.setFontSize(8);
  const dateStr = result.scanMeta?.scannedAt
    ? new Date(result.scanMeta.scannedAt).toLocaleString()
    : new Date().toLocaleString();
  doc.text(`Generated: ${dateStr}`, 15, 34);
  doc.text(`Engine: ${result.scanMeta?.engine || 'SKAL IA'}`, pageWidth - 60, 34);

  y = 50;

  // URL & Score
  addLine(`URL: ${result.url}`, 11, true);
  y += 2;

  const scoreColor: [number, number, number] = result.score >= 80 ? [16, 185, 129] : result.score >= 60 ? [245, 158, 11] : [239, 68, 68];
  addLine(`SEO Score: ${result.score}/100`, 18, true, scoreColor);
  y += 4;

  // Scan metadata
  if (result.scanMeta) {
    addLine(`Duration: ${(result.scanMeta.durationMs / 1000).toFixed(1)}s | Pages: ${result.scanMeta.pagesCrawled} | Elements: ${result.scanMeta.elementsChecked}`, 9, false, [120, 120, 120]);
  }
  y += 2;
  addSeparator();

  // Score breakdown
  addLine('Score Breakdown', 14, true, [30, 30, 30]);
  y += 2;
  result.scoreBreakdown?.forEach((b) => {
    const pct = Math.round((b.score / b.maxScore) * 100);
    addLine(`${b.category}: ${b.score}/${b.maxScore} (${pct}%)`, 10, false);
    addLine(`  ${b.details}`, 8, false, [120, 120, 120]);
  });
  y += 2;
  addSeparator();

  // Confidence indicators
  if (result.confidence?.length) {
    addLine('Confidence Indicators', 14, true, [30, 30, 30]);
    y += 2;
    result.confidence.forEach((c) => {
      const levelLabel = c.level === 'verified' ? '✓' : c.level === 'partial' ? '~' : '?';
      addLine(`${levelLabel} ${c.aspect} [${c.level}]: ${c.detail}`, 9, false);
    });
    y += 2;
    addSeparator();
  }

  // Issues
  if (result.issues.length > 0) {
    addLine(`Issues Detected (${result.issues.length})`, 14, true, [30, 30, 30]);
    y += 2;

    const priorities: Array<{ label: string; filter: string; color: [number, number, number] }> = [
      { label: 'HIGH PRIORITY', filter: 'High', color: [239, 68, 68] },
      { label: 'MEDIUM PRIORITY', filter: 'Medium', color: [245, 158, 11] },
      { label: 'LOW PRIORITY', filter: 'Low', color: [59, 130, 246] },
    ];

    priorities.forEach(({ label, filter, color }) => {
      const filtered = result.issues.filter(i => i.priority === filter);
      if (filtered.length === 0) return;
      addLine(`${label} (${filtered.length})`, 11, true, color);
      filtered.forEach((issue) => {
        addLine(`• ${issue.issue}`, 10, true);
        addLine(`  Impact: ${issue.impact}`, 9, false, [120, 120, 120]);
        addLine(`  Fix: ${issue.fix}`, 9, false, [120, 120, 120]);
        y += 1;
      });
      y += 2;
    });
    addSeparator();
  }

  // Generated fixes
  if (result.generatedFixes?.length) {
    addLine(`Generated Files (${result.generatedFixes.length})`, 14, true, [30, 30, 30]);
    y += 2;
    result.generatedFixes.forEach((fix) => {
      addLine(`📄 ${fix.filename} — ${fix.label}`, 10, true);
      addLine(`   ${fix.description}`, 9, false, [120, 120, 120]);
      y += 1;
    });
    addSeparator();
  }

  // Action report
  if (result.actionReport) {
    if (result.actionReport.automated.length > 0) {
      addLine('Automated Actions', 12, true, [30, 30, 30]);
      result.actionReport.automated.forEach((a) => {
        addLine(`${a.status} ${a.action}`, 9, false);
      });
      y += 3;
    }
    if (result.actionReport.manual.length > 0) {
      addLine('Manual Actions Required', 12, true, [30, 30, 30]);
      result.actionReport.manual.forEach((m) => {
        addLine(`[${m.priority}] ${m.action}`, 9, true);
        addLine(`  ${m.instructions}`, 8, false, [120, 120, 120]);
      });
    }
  }

  // Footer on last page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`SKAL IA — Verified data • ${dateStr} • Page ${i}/${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
  }

  doc.save(`skalai-report-${new URL(result.url).hostname}-${new Date().toISOString().split('T')[0]}.pdf`);
}
