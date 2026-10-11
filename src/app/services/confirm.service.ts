import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

export type ConfirmTone = 'neutral' | 'attention' | 'critical';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** neutral = routine, attention = waits on someone's decision, critical = removes or blocks something */
  tone?: ConfirmTone;
}

const TONE_ICON: Record<ConfirmTone, string> = {
  neutral: 'pi pi-info-circle',
  attention: 'pi pi-clock',
  critical: 'pi pi-exclamation-triangle',
};

/**
 * Promise wrapper over PrimeNG's ConfirmationService. Provided by
 * DashboardComponent, which hosts the single <p-confirmDialog key="ph">.
 */
@Injectable()
export class ConfirmService {
  constructor(private confirmation: ConfirmationService) {}

  ask(options: ConfirmOptions): Promise<boolean> {
    const tone = options.tone ?? 'neutral';
    return new Promise<boolean>((resolve) => {
      this.confirmation.confirm({
        key: 'ph',
        header: options.title,
        message: options.message,
        acceptLabel: options.confirmLabel,
        rejectLabel: options.cancelLabel ?? 'Cancel',
        // The headless template reads the tone back from `icon`.
        icon: `${tone}|${TONE_ICON[tone]}`,
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }
}
