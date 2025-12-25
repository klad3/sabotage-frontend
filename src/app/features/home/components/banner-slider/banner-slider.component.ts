import { Component, signal, ChangeDetectionStrategy, OnInit, OnDestroy, inject, computed, HostListener, ElementRef } from '@angular/core';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { DbBanner } from '../../../../core/models/product.model';

interface DisplaySlide {
  imageUrl: string;
  alt: string;
  link: string | null;
}

// Placeholder URLs for when no banners exist
const PLACEHOLDER_DESKTOP = 'https://placehold.co/1920x720';
const PLACEHOLDER_TABLET = 'https://placehold.co/1024x768';
const PLACEHOLDER_MOBILE = 'https://placehold.co/400x600';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

@Component({
  selector: 'app-banner-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="w-full aspect-[2/3] sm:aspect-[4/3] lg:aspect-[8/3] relative overflow-hidden border-t border-b border-sabotage-light select-none touch-pan-y"
      (mousedown)="onDragStart($event)"
      (mousemove)="onDragMove($event)"
      (mouseup)="onDragEnd()"
      (mouseleave)="onDragEnd()"
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="onDragEnd()"
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
          @for (slide of displaySlides(); track $index) {
            <div 
              class="h-full flex-shrink-0"
              [style.width.px]="slideWidth()"
            >
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
            </div>
          }
        </div>

        <!-- Navigation Dots (only if more than 1 slide) -->
        @if (displaySlides().length > 1) {
          <div class="absolute bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-3 md:gap-4 z-10">
            @for (slide of displaySlides(); track $index; let i = $index) {
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
export class BannerSliderComponent implements OnInit, OnDestroy {
  private readonly supabase = inject(SupabaseService);
  private readonly elementRef = inject(ElementRef);

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

  // Breakpoints
  private readonly MOBILE_MAX = 640;
  private readonly TABLET_MAX = 1024;
  // Only 15% of slide width needed to trigger change (very sensitive)
  private readonly DRAG_THRESHOLD_PERCENT = 0.15;

  readonly displaySlides = computed<DisplaySlide[]>(() => {
    const banners = this.banners();
    const device = this.deviceType();

    const getPlaceholder = (): string => {
      switch (device) {
        case 'mobile': return PLACEHOLDER_MOBILE;
        case 'tablet': return PLACEHOLDER_TABLET;
        default: return PLACEHOLDER_DESKTOP;
      }
    };

    if (banners.length === 0) {
      const placeholderUrl = getPlaceholder();
      return [
        { imageUrl: placeholderUrl, alt: 'Banner 1', link: null },
        { imageUrl: placeholderUrl, alt: 'Banner 2', link: null },
        { imageUrl: placeholderUrl, alt: 'Banner 3', link: null }
      ];
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
        imageUrl: imageUrl || getPlaceholder(),
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
    this.updateDragOffset();
  }

  async ngOnInit(): Promise<void> {
    this.checkDevice();
    this.updateSlideWidth();
    await this.loadBanners();
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  private updateSlideWidth(): void {
    const width = this.elementRef.nativeElement.offsetWidth || window.innerWidth;
    this.slideWidth.set(width);
  }

  private updateDragOffset(): void {
    this.dragOffset.set(-this.currentSlide() * this.slideWidth());
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
      const banners = await this.supabase.getAll<DbBanner>('banners', {
        filters: [{ column: 'is_active', operator: 'eq', value: true }],
        orderBy: { column: 'display_order', ascending: true }
      });
      this.banners.set(banners);
    } catch (error) {
      console.error('Error loading banners:', error);
      this.banners.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  // Mouse events
  onDragStart(event: MouseEvent): void {
    this.startDrag(event.clientX);
  }

  onDragMove(event: MouseEvent): void {
    if (!this.isDragging()) return;
    this.moveDrag(event.clientX);
  }

  // Touch events
  onTouchStart(event: TouchEvent): void {
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
    const baseOffset = -this.currentSlide() * this.slideWidth();

    // Add resistance at edges
    const slides = this.displaySlides();
    let newOffset = baseOffset + delta;

    // Resistance when dragging past first slide
    if (this.currentSlide() === 0 && delta > 0) {
      newOffset = baseOffset + delta * 0.3;
    }
    // Resistance when dragging past last slide
    else if (this.currentSlide() === slides.length - 1 && delta < 0) {
      newOffset = baseOffset + delta * 0.3;
    }

    this.dragOffset.set(newOffset);

    if (Math.abs(delta) > 5) {
      this.hasDragged = true;
    }
  }

  onDragEnd(): void {
    if (!this.isDragging()) return;

    const baseOffset = -this.currentSlide() * this.slideWidth();
    const currentOffset = this.dragOffset();
    const dragDelta = currentOffset - baseOffset;
    const slides = this.displaySlides();
    const threshold = this.slideWidth() * this.DRAG_THRESHOLD_PERCENT;

    let newSlide = this.currentSlide();

    if (Math.abs(dragDelta) >= threshold) {
      if (dragDelta > 0 && this.currentSlide() > 0) {
        // Dragged right - go to previous
        newSlide = this.currentSlide() - 1;
      } else if (dragDelta < 0 && this.currentSlide() < slides.length - 1) {
        // Dragged left - go to next
        newSlide = this.currentSlide() + 1;
      }
    }

    this.currentSlide.set(newSlide);
    this.isDragging.set(false);

    // Animate to final position
    this.dragOffset.set(-newSlide * this.slideWidth());

    this.startAutoPlay();
  }

  preventClickDuringDrag(event: MouseEvent): void {
    if (this.hasDragged) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
    this.dragOffset.set(-index * this.slideWidth());
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  private startAutoPlay(): void {
    const slides = this.displaySlides();
    if (slides.length <= 1) return;

    this.intervalId = setInterval(() => {
      const next = (this.currentSlide() + 1) % slides.length;
      this.currentSlide.set(next);
      this.dragOffset.set(-next * this.slideWidth());
    }, 7000);
  }

  private stopAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
