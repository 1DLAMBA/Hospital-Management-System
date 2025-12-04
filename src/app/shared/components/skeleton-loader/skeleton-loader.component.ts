import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.css'
})
export class SkeletonLoaderComponent {
  @Input() type: 'text' | 'avatar' | 'card' | 'table' = 'text';
  @Input() width: string = '100%';
  @Input() height: string = '1rem';
  @Input() count: number = 1;
  @Input() borderRadius: string = '4px';

  get items(): number[] {
    return Array(this.count).fill(0).map((_, i) => i);
  }
}

