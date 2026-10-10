import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../endpoints/user.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

/**
 * Post-registration "verify your email" screen.
 *
 * Verification now happens via a link we email the user (they click it, which opens
 * the /verify-email page). This screen just tells them to check their inbox and lets
 * them resend the link. Selector, inputs and the `verified` output are kept so the
 * register/login flows that embed <app-otp-verification> keep working unchanged.
 */
@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, ToastModule],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.css'
})
export class OtpVerificationComponent {
  @Input() userId!: any;
  @Input() userEmail!: string;
  @Input() userType!: string;
  @Output() verified = new EventEmitter<void>();

  isResending = false;
  resent = false;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
  ) {}

  resendLink(): void {
    if (this.isResending || !this.userId) {
      return;
    }
    this.isResending = true;

    this.userService.resendVerification({ user_id: this.userId }).subscribe({
      next: (res: any) => {
        this.isResending = false;
        this.resent = true;
        this.messageService.add({
          severity: 'success',
          detail: res?.success || 'A new verification link has been sent to your email.',
        });
      },
      error: (err: any) => {
        this.isResending = false;
        const detail = err?.error?.error || 'Could not resend the link. Please try again.';
        this.messageService.add({ severity: 'error', detail });
      },
    });
  }
}
