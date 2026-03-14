import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('heroBg') heroBgRef!: ElementRef<HTMLCanvasElement>;
  private animationId: number | null = null;
  private angle = 0;

  ngAfterViewInit(): void {
    this.startHeroBackground();
  }

  ngOnDestroy(): void {
    if (this.animationId != null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private startHeroBackground(): void {
    const canvas = this.heroBgRef?.nativeElement;
    if (!canvas) return;

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
}
