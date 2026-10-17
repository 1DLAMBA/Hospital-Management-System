import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { jsPDF } from 'jspdf';

// Card is rendered server-side at 1080x1350px. Converted to mm at 150dpi for
// the PDF page so the exported PDF prints at the same physical proportions.
const CARD_W_PX = 1080;
const CARD_H_PX = 1350;
const PX_TO_MM = 25.4 / 150;

/**
 * Fetches and exports a health professional's shareable profile card. The
 * card is generated from the public slug, so it is identical whether the
 * owner or a visitor requests it.
 */
@Injectable({ providedIn: 'root' })
export class ProfileShareService {
  cardUrl(slug: string): string {
    return `${environment.apiUrl}/professional/public/${slug}/card`;
  }

  profileUrl(slug: string): string {
    return `https://phoenixmed.online/${slug}`;
  }

  async fetchCard(slug: string): Promise<Blob> {
    const res = await fetch(this.cardUrl(slug), { cache: 'no-store' });
    if (!res.ok) throw new Error('card unavailable');
    return res.blob();
  }

  /** Sync feature check — call once the card blob is in hand. */
  canShareFiles(blob: Blob, slug: string): boolean {
    const nav: any = typeof navigator !== 'undefined' ? navigator : null;
    if (!nav || typeof nav.share !== 'function' || typeof nav.canShare !== 'function') return false;
    try {
      const file = new File([blob], `phoenix-${slug}.png`, { type: 'image/png' });
      return nav.canShare({ files: [file] });
    } catch {
      return false;
    }
  }

  /** Opens the native share sheet with the card image. Resolves false on cancel/unsupported/error. */
  async shareNative(blob: Blob, slug: string, name: string): Promise<boolean> {
    const nav: any = typeof navigator !== 'undefined' ? navigator : null;
    if (!nav?.share) return false;
    try {
      const file = new File([blob], `phoenix-${slug}.png`, { type: 'image/png' });
      await nav.share({ files: [file], title: name, text: `Book a consultation with ${name} on Phoenix`, url: this.profileUrl(slug) });
      return true;
    } catch {
      return false; // user cancelled, or the sheet failed — either way, no toast needed
    }
  }

  downloadImage(blob: Blob, slug: string): void {
    this.triggerDownload(URL.createObjectURL(blob), `phoenix-${slug}.png`);
  }

  async downloadPdf(blob: Blob, slug: string): Promise<void> {
    const dataUrl = await this.blobToDataUrl(blob);
    const w = CARD_W_PX * PX_TO_MM;
    const h = CARD_H_PX * PX_TO_MM;
    const doc = new jsPDF({ unit: 'mm', format: [w, h] });
    doc.addImage(dataUrl, 'PNG', 0, 0, w, h);
    doc.save(`phoenix-${slug}.pdf`);
  }

  async copyLink(slug: string): Promise<boolean> {
    try {
      await navigator.clipboard?.writeText(this.profileUrl(slug));
      return true;
    } catch {
      return false;
    }
  }

  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private triggerDownload(url: string, filename: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
}
