import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../endpoints/user.service';

type VerifyState = 'verifying' | 'success' | 'failed' | 'expired';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
})
export class VerifyEmailComponent implements OnInit {
  state: VerifyState = 'verifying';
  message = 'Verifying your email…';
  private userId: number | null = null;
  resending = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];

    if (!token) {
      this.state = 'failed';
      this.message = 'This verification link is missing its token.';
      return;
    }

    this.userService.verifyEmail(token).subscribe({
      next: () => {
        this.state = 'success';
        this.message = 'Your email is verified. You can now log in.';
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err: any) => {
        if (err?.error?.expired) {
          this.state = 'expired';
          this.userId = err.error.user_id ?? null;
          this.message = 'This verification link has expired.';
        } else {
          this.state = 'failed';
          this.message = err?.error?.error || 'We could not verify your email.';
        }
      },
    });
  }

  resend(): void {
    if (!this.userId || this.resending) {
      return;
    }
    this.resending = true;
    this.userService.resendVerification({ user_id: this.userId }).subscribe({
      next: () => {
        this.resending = false;
        this.message = 'A new verification link is on its way to your inbox.';
      },
      error: () => {
        this.resending = false;
        this.message = 'Could not resend the link. Please try again.';
      },
    });
  }
}
