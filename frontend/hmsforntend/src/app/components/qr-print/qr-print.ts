import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-qr-print',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './qr-print.html',
  styleUrl: './qr-print.scss',
})
export class QrPrint implements OnInit {

  qrValue: string = '';
  patient: any;

  constructor(
    private router: Router
  ){
  }

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');

    if (data) {
      this.patient = JSON.parse(decodeURIComponent(data));

      // QR contains patient identifier
      this.qrValue = this.patient.patientIdentifier;
    }
  }

printQR() {
  const printContent = document.getElementById("printview");
  if (!printContent) return;

  html2canvas(printContent).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = 100;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    //center horizontally
    const x = (pageWidth - imgWidth) / 2;

    let heightLeft = imgHeight;
    let y = 0;

    // First page
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Additional pages
    while (heightLeft > 0) {
      y = heightLeft - pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.output('dataurlnewwindow', {
      filename: `${this.patient.patientIdentifier}.pdf`
    });
  });
}

  downloadQR() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;

    if (!canvas) return;

    const image = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = image;
    link.download = `${this.patient.patientIdentifier}.png`;
    link.click();
  }

  goBack() {
    // this.router.navigate(['/patients']);
    window.history.back();
  }

}