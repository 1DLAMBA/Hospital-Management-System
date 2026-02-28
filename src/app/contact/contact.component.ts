import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ContactService } from '../endpoints/contact.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  providers: [MessageService]
})
export class ContactComponent {
  contactForm: FormGroup;
  submitLoading = false;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private messageService: MessageService,
  ) {
    this.contactForm = this.fb.group({
      name: this.fb.control('', [Validators.required]),
      email: this.fb.control('', [Validators.required, Validators.email]),
      message: this.fb.control('', [Validators.required]),
    });
  }

  submit() {
    if (this.submitLoading) return;

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', detail: 'Please Fill Accordingly' });
      return;
    }

    this.submitLoading = true;
    this.contactService.send(this.contactForm.value).subscribe({
      next: () => {
        this.submitLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Message sent successfully' });
        this.contactForm.reset();
      },
      error: (err) => {
        this.submitLoading = false;
        const message = err?.error?.message || err?.error?.error || 'Failed to send message. Please try again.';
        this.messageService.add({ severity: 'error', detail: message });
      }
    });
  }
}
