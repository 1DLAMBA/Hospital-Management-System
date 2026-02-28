import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SlideElement } from '../animate';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  animations: [SlideElement]
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroBg') heroBgRef!: ElementRef<HTMLCanvasElement>;
  visible = false;
  private animationId: number | null = null;
  private angle = 0;
  private routerSub: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.routerSub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      const url = e.urlAfterRedirects?.split('?')[0] || '';
      if (url === '' || url === '/') this.scheduleHeroBackground();
    });
  }

  ngAfterViewInit(): void {
    this.scheduleHeroBackground();
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.animationId != null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /** Defer start so the view (and canvas) has layout when we navigate back to landing. */
  private scheduleHeroBackground(): void {
    if (!this.heroBgRef?.nativeElement) return;
    setTimeout(() => this.startHeroBackground(), 50);
  }

  private startHeroBackground(): void {
    const canvas = this.heroBgRef?.nativeElement;
    if (!canvas) return;

    if (this.animationId != null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    const draw = (): void => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        this.animationId = requestAnimationFrame(draw);
        return;
      }

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      const rx = w * 0.38;
      const ry = h * 0.28;
      const cx = w * 0.5 + Math.cos(this.angle) * rx;
      const cy = h * 0.5 + Math.sin(this.angle) * ry;

      const grad = ctx.createRadialGradient(cx, cy, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.85);
      grad.addColorStop(0, '#1e80ff');
      grad.addColorStop(0.25, '#1060d8');
      grad.addColorStop(0.55, '#071a5c');
      grad.addColorStop(1, '#060e30');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      this.angle += 0.008;
      this.animationId = requestAnimationFrame(draw);
    };

    draw();
  }

  showDialog(): void {
    this.visible = true;
  }
}
