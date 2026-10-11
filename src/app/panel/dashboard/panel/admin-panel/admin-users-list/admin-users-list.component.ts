import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../../endpoints/admin.service';
import { environment } from '../../../../../../environments/environment';
import { MessageService } from 'primeng/api';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConfirmService } from '../../../../../services/confirm.service';

@Component({
  selector: 'app-admin-users-list',
  templateUrl: './admin-users-list.component.html',
  styleUrl: './admin-users-list.component.css',
  providers: [MessageService],
})
export class AdminUsersListComponent implements OnInit {
  users: any[] = [];
  selectedUsers: any[] = [];
  avatar_file!: string;
  loading: boolean = false;
  busyId: number | null = null;

  // Broadcast compose dialog
  showBroadcast = false;
  broadcastSubject = '';
  broadcastMessage = '';
  broadcastHeadline = '';
  broadcastBanner = '';
  broadcastCtaLabel = '';
  broadcastCtaUrl = '';
  broadcastTab: 'write' | 'preview' = 'write';
  previewHtml: SafeHtml | null = null;
  previewing = false;
  uploadingBanner = false;
  sending = false;

  constructor(private adminService: AdminService, private messageService: MessageService, private confirm: ConfirmService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.avatar_file = environment.apiUrl + '/file/get/';
    this.getUsers();
  }

  getUsers(): void {
    this.loading = true;
    this.adminService.getAllUsers().subscribe({
      next: (response: any) => {
        this.users = response.users || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  roleLabel(user: any): string {
    switch (user.user_type) {
      case 'other_professional': return 'Other Professional';
      case 'doctor': return 'Doctor';
      case 'nurse': return 'Nurse';
      case 'client': return 'Client';
      default: return user.user_type || 'Unknown';
    }
  }

  isDeactivated(user: any): boolean {
    return !!user?.deleted_at;
  }

  // --- Deactivate / reactivate ---
  async deactivate(user: any): Promise<void> {
    const ok = await this.confirm.ask({
      title: `Deactivate ${user.name}?`,
      message: 'They will be hidden from the platform and unable to log in. You can reactivate them later.',
      confirmLabel: 'Deactivate user',
      cancelLabel: 'Keep active',
      tone: 'critical',
    });
    if (!ok) return;
    this.busyId = user.id;
    this.adminService.deactivateUser(user.id).subscribe({
      next: () => {
        this.busyId = null;
        this.messageService.add({ severity: 'success', detail: `${user.name} deactivated` });
        this.getUsers();
      },
      error: (err) => {
        this.busyId = null;
        this.messageService.add({ severity: 'error', detail: err?.error?.error || 'Could not deactivate user' });
      }
    });
  }

  async reactivate(user: any): Promise<void> {
    const ok = await this.confirm.ask({
      title: `Reactivate ${user.name}?`,
      message: 'They will be able to log in again and will reappear on the platform.',
      confirmLabel: 'Reactivate user',
      cancelLabel: 'Leave deactivated',
      tone: 'neutral',
    });
    if (!ok) return;
    this.busyId = user.id;
    this.adminService.reactivateUser(user.id).subscribe({
      next: () => {
        this.busyId = null;
        this.messageService.add({ severity: 'success', detail: `${user.name} reactivated` });
        this.getUsers();
      },
      error: (err) => {
        this.busyId = null;
        this.messageService.add({ severity: 'error', detail: err?.error?.error || 'Could not reactivate user' });
      }
    });
  }

  // --- Broadcast to selected users ---
  openBroadcast(): void {
    if (!this.selectedUsers.length) {
      this.messageService.add({ severity: 'info', detail: 'Select at least one user to email.' });
      return;
    }
    this.broadcastSubject = '';
    this.broadcastMessage = '';
    this.broadcastHeadline = '';
    this.broadcastBanner = '';
    this.broadcastCtaLabel = '';
    this.broadcastCtaUrl = '';
    this.broadcastTab = 'write';
    this.previewHtml = null;
    this.showBroadcast = true;
  }

  private newsletterFields() {
    const clean = (v: string) => v.trim() || null;
    return {
      subject: this.broadcastSubject.trim(),
      message: this.broadcastMessage.trim(),
      headline: clean(this.broadcastHeadline),
      banner_url: clean(this.broadcastBanner),
      cta_label: clean(this.broadcastCtaLabel),
      cta_url: clean(this.broadcastCtaUrl),
    };
  }

  uploadBanner(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.uploadingBanner = true;
    this.adminService.uploadBanner(file).subscribe({
      next: (res) => {
        this.uploadingBanner = false;
        this.broadcastBanner = `${environment.apiUrl}/file/get/${res.data}`;
      },
      error: (err) => {
        this.uploadingBanner = false;
        this.messageService.add({ severity: 'error', detail: err?.error?.message || 'Banner must be a PNG or JPG under 2 MB.' });
      }
    });
  }

  showPreview(): void {
    const fields = this.newsletterFields();
    if (!fields.subject || !fields.message) {
      this.messageService.add({ severity: 'error', detail: 'Add a subject and message to preview.' });
      return;
    }
    this.previewing = true;
    this.adminService.broadcastPreview(fields).subscribe({
      next: (res) => {
        this.previewing = false;
        // Admin-authored, server-escaped HTML shown in a sandboxed iframe.
        this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(res.html);
        this.broadcastTab = 'preview';
      },
      error: (err) => {
        this.previewing = false;
        const first = err?.error?.errors ? (Object.values(err.error.errors)[0] as string[])[0] : null;
        this.messageService.add({ severity: 'error', detail: first || 'Could not build the preview.' });
      }
    });
  }

  async sendBroadcast(): Promise<void> {
    const fields = this.newsletterFields();
    if (!fields.subject || !fields.message) {
      this.messageService.add({ severity: 'error', detail: 'Subject and message are required.' });
      return;
    }
    const user_ids = this.selectedUsers.map((u) => u.id);
    const count = user_ids.length;
    const ok = await this.confirm.ask({
      title: `Email ${count} ${count === 1 ? 'user' : 'users'}?`,
      message: 'The email goes out immediately and can\'t be recalled.',
      confirmLabel: 'Send email',
      cancelLabel: 'Keep editing',
      tone: 'attention',
    });
    if (!ok) return;
    this.sending = true;
    this.adminService.broadcast({ ...fields, user_ids }).subscribe({
      next: (res) => {
        this.sending = false;
        this.showBroadcast = false;
        this.selectedUsers = [];
        this.messageService.add({ severity: 'success', detail: `Email sent to ${res.sent} user(s)${res.failed ? `, ${res.failed} failed` : ''}.` });
      },
      error: (err) => {
        this.sending = false;
        const first = err?.error?.errors ? (Object.values(err.error.errors)[0] as string[])[0] : null;
        this.messageService.add({ severity: 'error', detail: first || err?.error?.error || 'Could not send the broadcast.' });
      }
    });
  }
}
