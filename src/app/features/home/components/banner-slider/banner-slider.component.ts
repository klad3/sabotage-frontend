import { Component, signal, ChangeDetectionStrategy, OnInit, OnDestroy, inject, computed, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { BannerService } from '../../../../core/services/banner.service';
import { DbBanner } from '../../../../core/models/product.model';

interface DisplaySlide {
  imageUrl: string | null;
  alt: string;
  link: string | null;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

@Component({
  selector: 'app-banner-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      #sliderContainer
      class="w-full aspect-[2/3] sm:aspect-[4/3] lg:aspect-[8/3] relative overflow-hidden border-t border-b border-sabotage-light select-none touch-pan-y"
      (mousedown)="onDragStart($event)"
      (mousemove)="onDragMove($event)"
      (mouseup)="onDragEnd()"
      (mouseleave)="onDragEnd()"
    >
      @if (loading()) {
        <div class="w-full h-full flex items-center justify-center bg-sabotage-dark">
          <div class="animate-pulse text-sabotage-light/50">Cargando...</div>
        </div>
      } @else {
        <div 
          class="flex h-full"
          [class.transition-transform]="!isDragging()"
          [class.duration-300]="!isDragging()"
          [class.ease-out]="!isDragging()"
          [style.transform]="'translateX(' + dragOffset() + 'px)'"
          [style.cursor]="isDragging() ? 'grabbing' : 'grab'"
        >
          <!-- Clone of last slide (for infinite scroll left) -->
          @if (infiniteSlides().length > 1) {
            <div 
              class="h-full flex-shrink-0"
              [style.width.px]="slideWidth()"
            >
              @if (infiniteSlides()[infiniteSlides().length - 1].imageUrl) {
                <img
                  [src]="infiniteSlides()[infiniteSlides().length - 1].imageUrl"
                  [alt]="infiniteSlides()[infiniteSlides().length - 1].alt"
                  class="w-full h-full object-cover"
                  draggable="false"
                />
              } @else {
                <div class="w-full h-full bg-sabotage-gray flex items-center justify-center">
                  <span class="text-sabotage-muted">Sin imagen</span>
                </div>
              }
            </div>
          }
          
          @for (slide of infiniteSlides(); track $index) {
            <div 
              class="h-full flex-shrink-0"
              [style.width.px]="slideWidth()"
            >
              @if (slide.imageUrl) {
                @if (slide.link) {
                  <a 
                    [href]="slide.link" 
                    class="w-full h-full block"
                    (click)="preventClickDuringDrag($event)"
                  >
                    <img
                      [src]="slide.imageUrl"
                      [alt]="slide.alt"
                      class="w-full h-full object-cover pointer-events-none"
                      draggable="false"
                    />
                  </a>
                } @else {
                  <img
                    [src]="slide.imageUrl"
                    [alt]="slide.alt"
                    class="w-full h-full object-cover"
                    draggable="false"
                  />
                }
              } @else {
                <!-- Empty placeholder when no image -->
                <div class="w-full h-full bg-sabotage-gray flex items-center justify-center">
                  <span class="text-sabotage-muted">Sin imagen</span>
                </div>
              }
            </div>
          }
          
          <!-- Clone of first slide (for infinite scroll right) -->
          @if (infiniteSlides().length > 1) {
            <div 
              class="h-full flex-shrink-0"
              [style.width.px]="slideWidth()"
            >
              @if (infiniteSlides()[0].imageUrl) {
                <img
                  [src]="infiniteSlides()[0].imageUrl"
                  [alt]="infiniteSlides()[0].alt"
                  class="w-full h-full object-cover"
                  draggable="false"
                />
              } @else {
                <div class="w-full h-full bg-sabotage-gray flex items-center justify-center">
                  <span class="text-sabotage-muted">Sin imagen</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Navigation Dots (only if more than 1 slide) -->
        @if (infiniteSlides().length > 1) {
          <div class="absolute bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-3 md:gap-4 z-10">
            @for (slide of infiniteSlides(); track $index; let i = $index) {
              <button
                type="button"
                (click)="goToSlide(i)"
                [attr.aria-label]="'Ir a slide ' + (i + 1)"
                class="h-2 md:h-3 rounded-full transition-all duration-300 cursor-pointer"
                [class]="currentSlide() === i
                  ? 'w-5 md:w-[30px] bg-sabotage-light'
                  : 'w-2 md:w-3 bg-sabotage-light/50 hover:bg-sabotage-light/70'"
              ></button>
            }
          </div>
        }
      }
    </div>
  `,
  host: {
    class: 'block'
  }
})
export class BannerSliderComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly bannerService = inject(BannerService);
  private readonly elementRef = inject(ElementRef);

  @ViewChild('sliderContainer') sliderContainer!: ElementRef<HTMLDivElement>;

  readonly loading = signal(true);
  readonly banners = signal<DbBanner[]>([]);
  readonly currentSlide = signal(0);
  readonly deviceType = signal<DeviceType>('desktop');
  readonly isDragging = signal(false);
  readonly dragOffset = signal(0);
  readonly slideWidth = signal(0);

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private dragStartX = 0;
  private hasDragged = false;
  private isTransitioning = false;

  // Touch event handlers bound to this context
  private boundTouchStart = this.onTouchStart.bind(this);
  private boundTouchMove = this.onTouchMove.bind(this);
  private boundTouchEnd = this.onDragEnd.bind(this);

  // Breakpoints
  private readonly MOBILE_MAX = 640;
  private readonly TABLET_MAX = 1024;
  private readonly DRAG_THRESHOLD_PERCENT = 0.15;

  readonly infiniteSlides = computed<DisplaySlide[]>(() => {
    const banners = this.banners();
    const device = this.deviceType();

    // If no banners, return empty array
    if (banners.length === 0) {
      return [];
    }

    const slides: DisplaySlide[] = [];

    for (const banner of banners) {
      let imageUrl: string | null;

      switch (device) {
        case 'mobile':
          imageUrl = banner.image_mobile;
          break;
        case 'tablet':
          imageUrl = banner.image_tablet;
          break;
        default:
          imageUrl = banner.image_desktop;
      }

      slides.push({
        imageUrl: imageUrl,
        alt: banner.title,
        link: banner.link
      });
    }

    return slides;
  });

  @HostListener('window:resize')
  onResize(): void {
    this.checkDevice();
    this.updateSlideWidth();
    this.updateDragOffset(false);
  }

  async ngOnInit(): Promise<void> {
    this.checkDevice();
    this.updateSlideWidth();
    await this.loadBanners();
    this.updateDragOffset(false);
    this.startAutoPlay();
  }

  ngAfterViewInit(): void {
    // Add touch event listeners with passive: false to allow preventDefault
    const container = this.sliderContainer?.nativeElement;
    if (container) {
      container.addEventListener('touchstart', this.boundTouchStart, { passive: true });
      container.addEventListener('touchmove', this.boundTouchMove, { passive: true });
      container.addEventListener('touchend', this.boundTouchEnd, { passive: true });
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();

    // Clean up touch event listeners
    const container = this.sliderContainer?.nativeElement;
    if (container) {
      container.removeEventListener('touchstart', this.boundTouchStart);
      container.removeEventListener('touchmove', this.boundTouchMove);
      container.removeEventListener('touchend', this.boundTouchEnd);
    }
  }

  private updateSlideWidth(): void {
    const width = this.elementRef.nativeElement.offsetWidth || window.innerWidth;
    this.slideWidth.set(width);
  }

  // Get offset including the cloned slide at the start
  private getSlideOffset(slideIndex: number): number {
    const slides = this.infiniteSlides();
    if (slides.length <= 1) {
      return -slideIndex * this.slideWidth();
    }
    // Add 1 to account for the cloned last slide at the beginning
    return -(slideIndex + 1) * this.slideWidth();
  }

  private updateDragOffset(animate: boolean): void {
    const offset = this.getSlideOffset(this.currentSlide());
    this.dragOffset.set(offset);
  }

  private checkDevice(): void {
    const width = window.innerWidth;
    if (width < this.MOBILE_MAX) {
      this.deviceType.set('mobile');
    } else if (width < this.TABLET_MAX) {
      this.deviceType.set('tablet');
    } else {
      this.deviceType.set('desktop');
    }
  }

  private async loadBanners(): Promise<void> {
    this.loading.set(true);
    try {
      await this.bannerService.loadBanners();
      this.banners.set(this.bannerService.banners());
    } catch (error) {
      console.error('Error loading banners:', error);
      this.banners.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  // Mouse events
  onDragStart(event: MouseEvent): void {
    if (this.isTransitioning) return;
    this.startDrag(event.clientX);
  }

  onDragMove(event: MouseEvent): void {
    if (!this.isDragging()) return;
    this.moveDrag(event.clientX);
  }

  // Touch events
  onTouchStart(event: TouchEvent): void {
    if (this.isTransitioning) return;
    const touch = event.touches[0];
    this.startDrag(touch.clientX);
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging()) return;
    const touch = event.touches[0];
    this.moveDrag(touch.clientX);
  }

  private startDrag(clientX: number): void {
    this.isDragging.set(true);
    this.dragStartX = clientX;
    this.hasDragged = false;
    this.stopAutoPlay();
  }

  private moveDrag(clientX: number): void {
    const delta = clientX - this.dragStartX;
    const baseOffset = this.getSlideOffset(this.currentSlide());
    const newOffset = baseOffset + delta;

    this.dragOffset.set(newOffset);

    if (Math.abs(delta) > 5) {
      this.hasDragged = true;
    }
  }

  onDragEnd(): void {
    if (!this.isDragging()) return;

    const baseOffset = this.getSlideOffset(this.currentSlide());
    const currentOffset = this.dragOffset();
    const dragDelta = currentOffset - baseOffset;
    const slides = this.infiniteSlides();
    const threshold = this.slideWidth() * this.DRAG_THRESHOLD_PERCENT;

    let newSlide = this.currentSlide();

    if (Math.abs(dragDelta) >= threshold) {
      if (dragDelta > 0) {
        // Dragged right - go to previous (with wrap)
        newSlide = this.currentSlide() - 1;
      } else if (dragDelta < 0) {
        // Dragged left - go to next (with wrap)
        newSlide = this.currentSlide() + 1;
      }
    }

    this.isDragging.set(false);

    // Handle infinite loop
    if (newSlide < 0) {
      // Went before first slide - jump to clone, then to last
      this.animateToSlide(-1, () => {
        this.jumpToSlide(slides.length - 1);
      });
    } else if (newSlide >= slides.length) {
      // Went after last slide - jump to clone, then to first
      this.animateToSlide(slides.length, () => {
        this.jumpToSlide(0);
      });
    } else {
      this.currentSlide.set(newSlide);
      this.dragOffset.set(this.getSlideOffset(newSlide));
    }

    this.restartAutoPlay();
  }

  private animateToSlide(index: number, callback: () => void): void {
    this.isTransitioning = true;
    const slides = this.infiniteSlides();

    // For clone positions
    let offset: number;
    if (index < 0) {
      // Clone of last slide is at position 0
      offset = 0;
    } else if (index >= slides.length) {
      // Clone of first slide is at position slides.length + 1
      offset = -(slides.length + 1) * this.slideWidth();
    } else {
      offset = this.getSlideOffset(index);
    }

    this.dragOffset.set(offset);

    // Wait for animation to complete, then jump
    setTimeout(() => {
      callback();
      this.isTransitioning = false;
    }, 300);
  }

  private jumpToSlide(index: number): void {
    // Instantly jump without animation
    this.isDragging.set(true); // Disable transition
    this.currentSlide.set(index);
    this.dragOffset.set(this.getSlideOffset(index));

    // Re-enable transition after a frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.isDragging.set(false);
      });
    });
  }

  preventClickDuringDrag(event: MouseEvent): void {
    if (this.hasDragged) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  goToSlide(index: number): void {
    if (this.isTransitioning) return;
    this.currentSlide.set(index);
    this.dragOffset.set(this.getSlideOffset(index));
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  private startAutoPlay(): void {
    const slides = this.infiniteSlides();
    if (slides.length <= 1) return;

    this.intervalId = setInterval(() => {
      const next = this.currentSlide() + 1;

      if (next >= slides.length) {
        // Loop to first slide
        this.animateToSlide(slides.length, () => {
          this.jumpToSlide(0);
        });
      } else {
        this.currentSlide.set(next);
        this.dragOffset.set(this.getSlideOffset(next));
      }
    }, 7000);
  }

  private stopAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private restartAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}
