import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrPrint } from './qr-print';

describe('QrPrint', () => {
  let component: QrPrint;
  let fixture: ComponentFixture<QrPrint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrPrint]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrPrint);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
