import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-lazy-image',
  templateUrl: './lazy-image.component.html',
  styleUrl: './lazy-image.component.css'
})
export class LazyImageComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() src: string = '';
  @Input() alt: string = '';
  @Input() class: string = '';
  @Input() width: string = '';
  @Input() height: string = '';
  @Input() borderRadius: string = '';
  @Input() defaultImage: string = 'assets/default-avatar.png'; // Default placeholder image
  
  @ViewChild('imageContainer', { static: false }) imageContainer!: ElementRef;
  
  imageLoaded: boolean = false;
  imageError: boolean = false;
  showSpinner: boolean = true;
  
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    // If src is empty, show default
    if (!this.src) {
      this.imageError = true;
      this.showSpinner = false;
    }
  }

  ngAfterViewInit(): void {
    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window && this.imageContainer) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            if (this.observer) {
              this.observer.unobserve(entry.target);
            }
          }
        });
      }, {
        rootMargin: '50px' // Start loading 50px before image enters viewport
      });

      this.observer.observe(this.imageContainer.nativeElement);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage();
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  loadImage(): void {
    if (!this.src) {
      this.imageError = true;
      this.showSpinner = false;
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      this.imageLoaded = true;
      this.showSpinner = false;
      this.imageError = false;
    };
    
    img.onerror = () => {
      this.imageError = true;
      this.showSpinner = false;
      this.imageLoaded = false;
    };
    
    img.src = this.src;
  }

  get imageSrc(): string {
    if (this.imageError) {
      return this.defaultImage;
    }
    return this.src;
  }
}

