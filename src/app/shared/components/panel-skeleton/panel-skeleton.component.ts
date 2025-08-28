import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-panel-skeleton',
  template: `
    <div class="skeleton-wrapper" [ngClass]="panelType">
      <div class="skeleton-header"></div>
      <div class="skeleton-stats">
        <div class="skeleton-card" *ngFor="let i of [1,2,3]"></div>
      </div>
      <div class="skeleton-chart"></div>
      <div class="skeleton-table">
        <div class="skeleton-row" *ngFor="let i of [1,2,3,4]"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-wrapper {
      padding: 20px;
    }
    .skeleton-header, .skeleton-card, .skeleton-chart, .skeleton-row {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .skeleton-header {
      height: 60px;
      margin-bottom: 20px;
    }
    .skeleton-stats {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    .skeleton-card {
      height: 100px;
      flex: 1;
      min-width: 200px;
    }
    .skeleton-chart {
      height: 300px;
      margin: 20px 0;
    }
    .skeleton-row {
      height: 40px;
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @media (max-width: 768px) {
      .skeleton-stats {
        flex-direction: column;
      }
      .skeleton-card {
        width: 100%;
      }
    }
  `]
})
export class PanelSkeletonComponent {
  @Input() panelType: 'doctor' | 'nurse' | 'client' = 'doctor';
}
