import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../endpoints/payment.service';

type CallbackState = 'verifying' | 'success' | 'failed';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-callback.component.html',
  styleUrl: './payment-callback.component.css',
})
export class PaymentCallbackComponent implements OnInit {
  state: CallbackState = 'verifying';
  message = 'Confirming your payment…';
  amount: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentEndpoint: PaymentService,
  ) {}

  ngOnInit(): void {
    // Paystack appends both `reference` and `trxref`; either works.
    const params = this.route.snapshot.queryParams;
    const reference = params['reference'] || params['trxref'];

    if (!reference) {
      this.state = 'failed';
      this.message = 'No payment reference was found.';
      return;
    }

    this.paymentEndpoint.verify(reference).subscribe({
      next: (res: any) => {
        this.state = 'success';
        this.amount = res?.data?.appointment?.amount ?? null;
        this.message = 'Payment confirmed. Your consultation is now unlocked.';
        setTimeout(() => this.goToAppointments(), 2500);
      },
      error: (err: any) => {
        this.state = 'failed';
        this.message = err?.error?.error || 'We could not confirm your payment. If you were charged, it will reflect shortly.';
      },
    });
  }

  goToAppointments(): void {
    this.router.navigate(['/panel/client-appointment']);
  }
}
