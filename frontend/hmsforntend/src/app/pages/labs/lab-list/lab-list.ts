// src/app/pages/labs/lab-list/lab-list.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LabService } from '../../../services/lab.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth';
import {
  LabOrder, LabOrderStatus,
  STATUS_LABELS, STATUS_COLORS,
} from '../../../models/lab.model';

@Component({
  selector: 'app-lab-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './lab-list.html',
  styleUrl: './lab-list.scss',
})
export class LabList implements OnInit {

  orders: LabOrder[] = [];
  isLoading = false;
  userRole = '';

  // ── Pagination ────────────────────────────────────────────────────────────
  currentPage = 0;
  pageSize    = 10;
  totalPages  = 0;
  totalElements = 0;

  // ── Filters ───────────────────────────────────────────────────────────────
  selectedStatus = '';
  readonly allStatuses: LabOrderStatus[] = [
    'ORDERED','BOOKED','SAMPLE_COLLECTED','IN_PROGRESS','COMPLETED','CANCELLED'
  ];

  readonly STATUS_LABELS  = STATUS_LABELS;
  readonly STATUS_COLORS  = STATUS_COLORS;

  // ── Action modal state ────────────────────────────────────────────────────
  selectedOrder: LabOrder | null = null;

  constructor(
    private labService:   LabService,
    private toastService: ToastService,
    private authService:  AuthService,
    private router:       Router,
    private cdRef:        ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.userRole = this.authService.getRole() || '';
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.labService.getLabOrders(this.currentPage, this.pageSize, this.selectedStatus || undefined)
      .subscribe({
        next: (r: any) => {
          const page = r.data;
          this.orders        = page.content;
          this.totalPages    = page.totalPages;
          this.totalElements = page.totalElements;
          this.isLoading     = false;
          this.cdRef.detectChanges();
        },
        error: () => {
          this.toastService.error('Failed to load lab orders');
          this.isLoading = false;
        },
      });
  }

  // ── Pagination helpers ────────────────────────────────────────────────────
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i); }
  goToPage(p: number)   { this.currentPage = p; this.loadOrders(); }
  nextPage()            { if (this.currentPage < this.totalPages - 1) { this.currentPage++; this.loadOrders(); } }
  prevPage()            { if (this.currentPage > 0) { this.currentPage--; this.loadOrders(); } }

  onStatusFilter()  { this.currentPage = 0; this.loadOrders(); }
  clearFilter()     { this.selectedStatus = ''; this.loadOrders(); }

  // ── Navigation ────────────────────────────────────────────────────────────
  viewDetails(id: number) { this.router.navigate(['/lab-orders', id]); }

  // ── Quick actions ─────────────────────────────────────────────────────────
  bookAppointment(order: LabOrder) {
    this.router.navigate(['/lab-orders', order.id, 'book']);
  }

  collectSample(order: LabOrder) {
    this.router.navigate(['/lab-orders', order.id, 'collect-sample']);
  }

  startProcessing(order: LabOrder) {
    if (confirm(`Start processing Lab Order #${order.id}?`)) {
      this.labService.startProcessing(order.id).subscribe({
        next: () => { this.toastService.success('Processing started'); this.loadOrders(); },
        error: (e) => this.toastService.error(e.error?.message || 'Failed'),
      });
    }
  }

  viewReport(order: LabOrder) {
    this.router.navigate(['/lab-orders', order.id, 'report']);
  }

  cancelOrder(order: LabOrder) {
    if (confirm(`Cancel Lab Order #${order.id}? This cannot be undone.`)) {
      this.labService.cancelLabOrder(order.id).subscribe({
        next: () => { this.toastService.success('Lab order cancelled'); this.loadOrders(); },
        error: (e) => this.toastService.error(e.error?.message || 'Failed'),
      });
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getStatusLabel(s: LabOrderStatus)  { return STATUS_LABELS[s] || s; }
  getStatusColor(s: LabOrderStatus)  { return STATUS_COLORS[s] || '#718096'; }

  getTestNames(order: LabOrder): string {
    return order.tests?.map(t => t.testCode || t.testName).join(', ') || '—';
  }

  canBook(o: LabOrder)            { return o.status === 'ORDERED' && this.userRole === 'frontdesk'; }
  canCollectSample(o: LabOrder)   { return o.status === 'BOOKED' && this.userRole === 'labtechnician'; }
  canStartProcessing(o: LabOrder) { return o.status === 'SAMPLE_COLLECTED' && this.userRole === 'labtechnician'; }
  canEnterResults(o: LabOrder)    { return o.status === 'IN_PROGRESS' && this.userRole === 'labtechnician'; }
  canViewReport(o: LabOrder)      { return o.status === 'COMPLETED'; }
  canCancel(o: LabOrder)          { return o.status !== 'COMPLETED' && o.status !== 'CANCELLED'; }
}