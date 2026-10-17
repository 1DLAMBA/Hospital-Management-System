import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ProfileShareService } from '../../../services/profile-share.service';

type ShareCardState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Preview + export dialog for a professional's shareable card. The Share
 * button opens this (via `open(slug, name)`) instead of acting immediately,
 * so the person always sees the card before it leaves the device.
 */
@Component({
  selector: 'app-share-card-dialog',
  templateUrl: './share-card-dialog.component.html',
  styleUrl: './share-card-dialog.component.css',
})
export class ShareCardDialogComponent {
  visible = false;
  state: ShareCardState = 'idle';
  imageUrl: string | null = null;
  canNativeShare = false;
  sharing = false;
  downloadingPdf = false;

  private slug = '';
  private name = '';
  private blob: Blob | null = null;

  constructor(
    private shareService: ProfileShareService,
    private messageService: MessageService,
  ) {}

  async open(slug: string, name: string): Promise<void> {
    this.slug = slug;
    this.name = name;
    this.visible = true;
    await this.load();
  }

  private async load(): Promise<void> {
    this.state = 'loading';
    this.revokeImage();
    this.blob = null;
    try {
      const blob = await this.shareService.fetchCard(this.slug);
      this.blob = blob;
      this.imageUrl = URL.createObjectURL(blob);
      this.canNativeShare = this.shareService.canShareFiles(blob, this.slug);
      this.state = 'ready';
    } catch {
      this.state = 'error';
    }
  }

  retry(): void {
    if (this.slug) this.load();
  }

  onHide(): void {
    this.revokeImage();
    this.blob = null;
    this.state = 'idle';
  }

  async shareNow(): Promise<void> {
    if (!this.blob) return;
    this.sharing = true;
    const shared = await this.shareService.shareNative(this.blob, this.slug, this.name);
    this.sharing = false;
    if (shared) {
      this.visible = false;
    }
  }

  downloadImage(): void {
    if (!this.blob) return;
    this.shareService.downloadImage(this.blob, this.slug);
    this.messageService.add({ severity: 'success', detail: 'Card image downloaded.' });
  }

  async downloadPdf(): Promise<void> {
    if (!this.blob) return;
    this.downloadingPdf = true;
    try {
      await this.shareService.downloadPdf(this.blob, this.slug);
      this.messageService.add({ severity: 'success', detail: 'Card PDF downloaded.' });
    } catch {
      this.messageService.add({ severity: 'error', detail: 'Could not create the PDF. Please try again.' });
    }
    this.downloadingPdf = false;
  }

  async copyLink(): Promise<void> {
    const ok = await this.shareService.copyLink(this.slug);
    this.messageService.add(ok
      ? { severity: 'success', detail: 'Profile link copied.' }
      : { severity: 'error', detail: 'Could not copy the link.' });
  }

  private revokeImage(): void {
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);
      this.imageUrl = null;
    }
  }
}
