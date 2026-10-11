import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AdminService } from '../endpoints/admin.service';
import { HospitalsService } from '../endpoints/hospitals.service';
import { UserService } from '../endpoints/user.service';

/**
 * One shared copy of the signed-in account for the panel shell, so the header
 * and side nav don't each fetch it on every page change.
 */
// Not providedIn root: it must share the injector that carries the auth interceptor
// (provided via AppModule), or admin/hospital requests go out without a token.
@Injectable()
export class SessionUserService {
  private readonly subject = new BehaviorSubject<any | null>(null);
  readonly user$: Observable<any | null> = this.subject.asObservable();
  private loadedFor: string | null = null;

  constructor(
    private users: UserService,
    private admins: AdminService,
    private hospitals: HospitalsService,
  ) {}

  get snapshot(): any | null { return this.subject.value; }

  /** Loads once per signed-in id; pass force to re-read after a profile edit. */
  load(force = false): Observable<any | null> {
    const id = localStorage.getItem('id');
    if (!id) { this.subject.next(null); this.loadedFor = null; return of(null); }
    if (!force && this.loadedFor === id && this.subject.value) return this.user$;
    if (this.loadedFor !== id) this.subject.next(null);
    this.loadedFor = id;
    this.source().get(id).subscribe({
      next: (res: any) => this.subject.next(res.user ?? null),
      error: () => { this.loadedFor = null; },
    });
    return this.user$;
  }

  clear(): void { this.subject.next(null); this.loadedFor = null; }

  private source(): any {
    try {
      const type = JSON.parse(localStorage.getItem('userData') || '{}')?.user?.user_type;
      if (type === 'admin') return this.admins;
      if (type === 'hospital') return this.hospitals;
    } catch { /* fall through */ }
    return this.users;
  }
}
