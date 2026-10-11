import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../../endpoints/admin.service';
import { MessageService } from 'primeng/api';
import { ConfirmService } from '../../../../../services/confirm.service';

@Component({
  selector: 'app-admin-hospitals-list',
  templateUrl: './admin-hospitals-list.component.html',
  styleUrl: './admin-hospitals-list.component.css',
  providers: [MessageService]
})
export class AdminHospitalsListComponent implements OnInit {
  hospitals: any[] = [];

  statusFilter: string = '';
  totalRecords: number = 0;
  currentPage: number = 1;
  rowsPerPage: number = 10;
  loading: boolean = false;
  actionLoadingId: number | null = null;

  readonly statusOptions = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  constructor(
    private adminService: AdminService,
    private messageService: MessageService,
    private confirm: ConfirmService,
  ) {}

  ngOnInit(): void {
    this.getHospitals();
  }

  getHospitals(page: number = 1, perPage: number = 10): void {
    this.loading = true;
    this.adminService.getAllHospitals(this.statusFilter || undefined, page, perPage).subscribe({
      next: (response: any) => {
        this.hospitals = response.hospital || [];
        if (response.pagination) {
          this.totalRecords = response.pagination.total;
          this.currentPage = response.pagination.current_page;
          this.rowsPerPage = response.pagination.per_page;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  setStatusFilter(value: string): void {
    this.statusFilter = value;
    this.currentPage = 1;
    this.getHospitals(this.currentPage, this.rowsPerPage);
  }

  onPageChange(event: any): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.currentPage = page;
    this.rowsPerPage = event.rows;
    this.getHospitals(this.currentPage, this.rowsPerPage);
  }

  async approve(hospital: any): Promise<void> {
    const ok = await this.confirm.ask({
      title: `Approve ${hospital.name}?`,
      message: 'Health professionals will be able to select this hospital on their profile.',
      confirmLabel: 'Approve hospital',
      cancelLabel: 'Not now',
      tone: 'attention',
    });
    if (!ok) return;
    this.actionLoadingId = hospital.id;
    this.adminService.approveHospital(hospital.id).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.messageService.add({ severity: 'success', summary: 'Approved', detail: `${hospital.name} can now be selected during registration.` });
        this.getHospitals(this.currentPage, this.rowsPerPage);
      },
      error: () => {
        this.actionLoadingId = null;
        this.messageService.add({ severity: 'error', summary: 'Not approved', detail: `${hospital.name} could not be approved. Try again.` });
      }
    });
  }

  async reject(hospital: any): Promise<void> {
    const ok = await this.confirm.ask({
      title: `Reject ${hospital.name}?`,
      message: 'It will not appear when professionals choose a hospital.',
      confirmLabel: 'Reject hospital',
      cancelLabel: 'Keep pending',
      tone: 'critical',
    });
    if (!ok) return;
    this.actionLoadingId = hospital.id;
    this.adminService.rejectHospital(hospital.id).subscribe({
      next: () => {
        this.actionLoadingId = null;
        this.messageService.add({ severity: 'success', summary: 'Rejected', detail: `${hospital.name} will not appear during registration.` });
        this.getHospitals(this.currentPage, this.rowsPerPage);
      },
      error: () => {
        this.actionLoadingId = null;
        this.messageService.add({ severity: 'error', summary: 'Not rejected', detail: `${hospital.name} could not be rejected. Try again.` });
      }
    });
  }
}
