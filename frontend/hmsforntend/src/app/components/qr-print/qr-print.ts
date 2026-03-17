import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { Router } from '@angular/router';

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
    window.print();
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