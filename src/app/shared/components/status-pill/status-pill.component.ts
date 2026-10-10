import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusTone = 'awaiting' | 'active' | 'blocked' | 'idle';

/**
 * The single state vocabulary for the whole portal.
 *
 * 'awaiting' is the only tone that renders in ember, and it means one thing:
 * a person still has to make a decision here. A doctor being unavailable is
 * 'idle', not 'awaiting' — there is nothing to decide.
 */
const TONE_BY_STATUS: Record<string, StatusTone> = {
  pending: 'awaiting',
  unverified: 'awaiting',
  requested: 'awaiting',
  approved: 'active',
  available: 'active',
  accepted: 'active',
  verified: 'active',
  active: 'active',
  rejected: 'blocked',
  declined: 'blocked',
  cancelled: 'blocked',
  suspended: 'blocked',
  unavailable: 'idle',
  inactive: 'idle',
  archived: 'idle',
  completed: 'idle',
};

@Component({
  selector: 'app-status-pill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-pill.component.html',
  styleUrl: './status-pill.component.css',
})
export class StatusPillComponent {
  @Input() status: string | null | undefined;
  /** Overrides the tone derived from `status`. */
  @Input() tone?: StatusTone;
  /** Overrides the text shown; defaults to the status itself. */
  @Input() label?: string;

  get resolvedTone(): StatusTone {
    if (this.tone) return this.tone;
    return TONE_BY_STATUS[(this.status || '').toLowerCase()] ?? 'idle';
  }

  get resolvedLabel(): string {
    return this.label ?? this.status ?? '';
  }
}
