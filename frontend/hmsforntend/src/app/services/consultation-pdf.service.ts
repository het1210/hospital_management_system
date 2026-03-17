import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { Consultation } from '../models/consultation.model';
import { Hospital } from '../models/hospital.model';

@Injectable({ providedIn: 'root' })
export class ConsultationPdfService {

  /**
   * Generates a styled consultation PDF and opens it in a new browser tab (preview).
   */
  generateAndPreview(consultation: Consultation, hospital: Hospital[] | null): void {
    console.log(hospital);
    const  hospital1 = hospital?.at(0);
    
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 18;
    const contentW = pageW - margin * 2;

    const blue      = [26, 115, 232]  as [number, number, number];
    const darkBlue  = [13, 71, 161]   as [number, number, number];
    const white     = [255, 255, 255] as [number, number, number];
    const lightGray = [248, 250, 255] as [number, number, number];
    const midGray   = [120, 120, 140] as [number, number, number];
    const dark      = [30, 30, 40]    as [number, number, number];
    const borderCol = [220, 229, 244] as [number, number, number];

    const HEADER_H = 28;
    const FOOTER_H = 14;

    // ────────── HEADER ──────────
    pdf.setFillColor(...blue);
    pdf.rect(0, 0, pageW, HEADER_H, 'F');

    // gradient stripe
    pdf.setFillColor(...darkBlue);
    pdf.rect(0, 0, 6, HEADER_H, 'F');

    // Cross / medical icon (simple + symbol)
    pdf.setFillColor(...white);
    pdf.rect(10, 8, 3, 12, 'F');
    pdf.rect(7, 11, 9, 6, 'F');

    // Hospital name
    const hospitalName = hospital1?.name || 'Hospital Management System';
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.setTextColor(...white);
    pdf.text(hospitalName.toUpperCase(), 22, 12);

    if (hospital1?.address) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(200, 220, 255);
      const addr = [hospital1.address, hospital1.city, hospital1.state, hospital1.pincode]
        .filter(Boolean).join(', ');
      pdf.text(addr, 22, 17);
    }

    if (hospital1?.phone) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(200, 220, 255);
      pdf.text(`Tel: ${hospital1.phone}`, 22, 22);
    }

    // "CONSULTATION REPORT" label on right
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(...white);
    pdf.text('CONSULTATION REPORT', pageW - margin, 12, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(200, 220, 255);
    pdf.text(`ID: #${consultation.id ?? '—'}`, pageW - margin, 17, { align: 'right' });
    const now = new Date();
    pdf.text(`Date: ${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      pageW - margin, 22, { align: 'right' });

    // ────────── FOOTER ──────────
    const footerY = pageH - FOOTER_H;
    pdf.setFillColor(...blue);
    pdf.rect(0, footerY, pageW, FOOTER_H, 'F');
    pdf.setFillColor(...darkBlue);
    pdf.rect(0, footerY, 6, FOOTER_H, 'F');

    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(7.5);
    pdf.setTextColor(200, 220, 255);
    pdf.text('This is a computer-generated document. No signature required.', margin, footerY + 6);
    pdf.text(`Generated: ${now.toLocaleString('en-IN')}`, pageW - margin, footerY + 6, { align: 'right' });
    pdf.setFont('helvetica', 'normal');
    pdf.text('Confidential – For medical records only', margin, footerY + 11);
    if (hospital1?.phone) {
      pdf.text(`Contact: ${hospital1.phone}`, pageW - margin, footerY + 11, { align: 'right' });
    }

    // ────────── CONTENT AREA ──────────
    let y = HEADER_H + 8;

    // Helper: section header
    const sectionHeader = (title: string) => {
      pdf.setFillColor(...lightGray);
      pdf.roundedRect(margin, y, contentW, 8, 2, 2, 'F');
      pdf.setFillColor(...blue);
      pdf.roundedRect(margin, y, 4, 8, 1, 1, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...blue);
      pdf.text(title, margin + 8, y + 5.5);
      y += 12;
    };

    // Helper: label-value pair
    const labelValue = (label: string, value: string, x: number, maxW: number) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(...midGray);
      pdf.text(label, x, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(...dark);
      const lines = pdf.splitTextToSize(value || '—', maxW);
      pdf.text(lines, x, y + 4.5);
      return lines.length * 4.5 + 5;
    };

    // Helper: text block
    const textBlock = (label: string, content: string) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(...midGray);
      pdf.text(label, margin, y);
      y += 5;

      pdf.setFillColor(255, 255, 255);
      const wrappedLines = pdf.splitTextToSize(content || 'Not recorded.', contentW - 4);
      const blockH = Math.max(wrappedLines.length * 4.5 + 6, 12);
      pdf.setDrawColor(...borderCol);
      pdf.roundedRect(margin, y, contentW, blockH, 2, 2, 'S');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(...dark);
      pdf.text(wrappedLines, margin + 3, y + 5);
      y += blockH + 5;
    };

    // ── PATIENT INFORMATION ──
    sectionHeader('PATIENT & DOCTOR INFO');
    const thirdW = (contentW - 16) / 3;
    const h1 = labelValue('PATIENT NAME', consultation.patientName || '—', margin, thirdW);
    const h2 = labelValue('PATIENT ID', `#${consultation.patient}`, margin + thirdW + 8, thirdW);
    const h3 = labelValue('ENCOUNTER ID', consultation.encounter ? `#${consultation.encounter}` : '—', margin + (thirdW * 2) + 16, thirdW);
    y += Math.max(h1, h2, h3);
    const h4 = labelValue('DOCTOR NAME', consultation.doctorName || '—', margin, thirdW);
    const h5 = labelValue('DOCTOR ID', `#${consultation.doctor}`, margin + thirdW + 8, thirdW);
    y += Math.max(h4, h5) + 4;

    // divider
    pdf.setDrawColor(...borderCol);
    pdf.line(margin, y, pageW - margin, y);
    y += 6;

    // ── CLINICAL DETAILS ──
    sectionHeader('CLINICAL DETAILS');
    textBlock('SYMPTOMS', consultation.symptoms || '');
    textBlock('DIAGNOSIS', consultation.diagnosis || '');
    textBlock('NOTES', consultation.notes || '');

    // ── PRESCRIPTIONS ──
    sectionHeader('PRESCRIPTIONS');
    const rxList = consultation.prescriptions ?? [];

    if (rxList.length === 0) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9);
      pdf.setTextColor(...midGray);
      pdf.text('No prescriptions issued for this consultation.', margin, y);
      y += 8;
    } else {
      // Table header
      const cols = [
        { label: '#',         x: margin,      w: 8 },
        { label: 'MEDICINE',  x: margin + 8,  w: 50 },
        { label: 'DOSAGE',    x: margin + 58, w: 30 },
        { label: 'FREQUENCY', x: margin + 88, w: 40 },
        { label: 'DURATION',  x: margin + 128,w: 30 },
      ];
      const rowH = 7;

      pdf.setFillColor(...blue);
      pdf.rect(margin, y, contentW, rowH, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(...white);
      cols.forEach(col => pdf.text(col.label, col.x + 1, y + 5));
      y += rowH;

      rxList.forEach((rx, idx) => {
        const bg: [number, number, number] = idx % 2 === 0 ? white : lightGray;
        pdf.setFillColor(...bg);
        pdf.rect(margin, y, contentW, rowH, 'F');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(...dark);
        pdf.text(String(idx + 1), cols[0].x + 1, y + 5);
        pdf.text(pdf.splitTextToSize(rx.medicineName || '—', cols[1].w - 2)[0], cols[1].x + 1, y + 5);
        pdf.text(rx.dosage || '—', cols[2].x + 1, y + 5);
        pdf.text(rx.frequency || '—', cols[3].x + 1, y + 5);
        pdf.text(rx.duration || '—', cols[4].x + 1, y + 5);

        // row border
        pdf.setDrawColor(...borderCol);
        pdf.line(margin, y + rowH, margin + contentW, y + rowH);
        y += rowH;
      });

      // table outer border
      pdf.setDrawColor(...borderCol);
      const tableH = (rxList.length + 1) * rowH;
      pdf.rect(margin, y - tableH, contentW, tableH, 'S');
      y += 4;
    }

    // Open preview in new tab
    pdf.output('dataurlnewwindow', { filename: `consultation-${consultation.id}.pdf` });
  }
}
