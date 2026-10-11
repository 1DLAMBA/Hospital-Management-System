import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';

type LoadState = 'loading' | 'ready' | 'notfound';

/**
 * Target of the shareable link (phoenixmed.online/<slug>). Signed-in users are
 * sent to the in-app profile page; guests see that same page, view-only, under
 * a minimal bar that only offers login and sign-up.
 */
@Component({
  selector: 'app-guest-profile',
  templateUrl: './guest-profile.component.html',
  styleUrl: './guest-profile.component.css',
  providers: [MessageService],
})
export class GuestProfileComponent implements OnInit {
  state: LoadState = 'loading';
  profile: any = null;
  slug = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private meta: Meta,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
    if (!this.slug) { this.state = 'notfound'; return; }
    this.http.get<any>(`${environment.apiUrl}/professional/public/${this.slug}`).subscribe({
      next: (res) => {
        this.profile = res?.profile ?? null;
        if (!this.profile) { this.state = 'notfound'; return; }
        this.setLinkPreview();
        if (typeof localStorage !== 'undefined' && localStorage.getItem('id')) { this.openInApp(); return; }
        this.state = 'ready';
      },
      error: () => { this.state = 'notfound'; },
    });
  }

  get isNurse(): boolean { return this.profile?.user_type === 'nurse'; }
  get professionalType(): 'doctor' | 'other_professional' {
    return this.profile?.user_type === 'other_professional' ? 'other_professional' : 'doctor';
  }

  /** Tags read by chat apps and social sites when the link is pasted or sent. */
  private setLinkPreview(): void {
    const p = this.profile;
    const name = p.name as string;
    const heading = `${name} · ${p.display_type} on Phoenix`;
    const desc = [p.specialization, p.hospital].filter(Boolean).join(' · ') || 'Consult a verified health professional on Phoenix.';
    const image = `${environment.apiUrl}/professional/public/${p.slug}/share-image`;
    const url = `https://phoenixmed.online/${p.slug}`;
    this.title.setTitle(heading);
    const tags: Array<[string, string, string]> = [
      ['property', 'og:type', 'profile'],
      ['property', 'og:site_name', 'Phoenix'],
      ['property', 'og:title', heading],
      ['property', 'og:description', desc],
      ['property', 'og:url', url],
      ['property', 'og:image', image],
      ['property', 'og:image:width', '1200'],
      ['property', 'og:image:height', '630'],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', heading],
      ['name', 'twitter:description', desc],
      ['name', 'twitter:image', image],
      ['name', 'description', desc],
    ];
    for (const [attr, key, content] of tags) {
      this.meta.updateTag({ [attr]: key, content } as any, `${attr}='${key}'`);
    }
  }

  private openInApp(): void {
    const id = this.profile.id;
    if (this.isNurse) {
      this.router.navigate(['/panel/nurses/nurse-profile', id], { replaceUrl: true });
    } else {
      this.router.navigate(['/panel/doctors/profile', id], { queryParams: { type: this.professionalType }, replaceUrl: true });
    }
  }
}
