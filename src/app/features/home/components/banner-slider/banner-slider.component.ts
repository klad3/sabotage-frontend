import { Component, signal, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';

interface BannerSlide {
    imageUrl: string;
    alt: string;
}

@Component({
    selector: 'app-banner-slider',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="w-full h-[230px] sm:h-[350px] md:h-[500px] lg:h-[800px] relative overflow-hidden border-t border-b border-sabotage-light">
      @for (slide of slides; track slide.imageUrl; let i = $index) {
        <div
          class="w-full h-full absolute flex items-center justify-center transition-opacity duration-1000 ease-in-out bg-sabotage-dark"
          [class.opacity-100]="currentSlide() === i"
          [class.opacity-0]="currentSlide() !== i"
        >
          <img
            [src]="slide.imageUrl"
            [alt]="slide.alt"
            class="w-full h-full object-cover"
          />
        </div>
      }

      <!-- Navigation Dots -->
      <div class="absolute bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-3 md:gap-4 z-10">
        @for (slide of slides; track slide.imageUrl; let i = $index) {
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
    </div>
  `,
    host: {
        class: 'block'
    }
})
export class BannerSliderComponent implements OnInit, OnDestroy {
    readonly slides: BannerSlide[] = [
        { imageUrl: '/img/BANNER WEB 1 SABOTAGE.png', alt: 'Banner Sabotage 1' },
        { imageUrl: '/img/BANNER WEB 2 SABOTAGE.png', alt: 'Banner Sabotage 2' },
        { imageUrl: '/img/BANNER WEB 3 SABOTAGE.png', alt: 'Banner Sabotage 3' }
    ];

    readonly currentSlide = signal(0);
    private intervalId: ReturnType<typeof setInterval> | null = null;

    ngOnInit(): void {
        this.startAutoPlay();
    }

    ngOnDestroy(): void {
        this.stopAutoPlay();
    }

    goToSlide(index: number): void {
        this.currentSlide.set(index);
        // Reset autoplay timer
        this.stopAutoPlay();
        this.startAutoPlay();
    }

    private startAutoPlay(): void {
        this.intervalId = setInterval(() => {
            const next = (this.currentSlide() + 1) % this.slides.length;
            this.currentSlide.set(next);
        }, 7000);
    }

    private stopAutoPlay(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
