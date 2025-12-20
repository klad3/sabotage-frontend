import {
    Component,
    signal,
    ChangeDetectionStrategy,
    ElementRef,
    inject,
    AfterViewInit,
    OnDestroy
} from '@angular/core';

interface Stat {
    value: string;
    numericValue?: number;
    suffix?: string;
    label: string;
}

@Component({
    selector: 'app-stats',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <section class="py-10 md:py-16 px-5 md:px-10 bg-sabotage-black">
      <div class="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-center">
        @for (stat of stats; track stat.label) {
          <div class="stat-item">
            <h3 class="text-4xl md:text-6xl font-extrabold mb-2">
              {{ stat.value }}
            </h3>
            <p class="text-sm md:text-lg text-sabotage-muted uppercase tracking-wide">
              {{ stat.label }}
            </p>
          </div>
        }
      </div>
    </section>
  `,
    host: {
        class: 'block'
    }
})
export class StatsComponent implements AfterViewInit, OnDestroy {
    private readonly elementRef = inject(ElementRef);
    private observer: IntersectionObserver | null = null;
    private hasAnimated = false;

    readonly stats: Stat[] = [
        { value: '0', numericValue: 15, suffix: 'K+', label: 'Clientes felices' },
        { value: '0', numericValue: 500, suffix: '+', label: 'Productos' },
        { value: '0', numericValue: 98, suffix: '%', label: 'Satisfacción' },
        { value: '24/7', label: 'Atención' }
    ];

    private readonly animatedStats = signal([...this.stats]);

    get currentStats() {
        return this.animatedStats();
    }

    ngAfterViewInit(): void {
        this.setupIntersectionObserver();
    }

    ngOnDestroy(): void {
        if (this.observer) {
            this.observer.disconnect();
        }
    }

    private setupIntersectionObserver(): void {
        if (typeof IntersectionObserver === 'undefined') {
            this.animateStats();
            return;
        }

        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.hasAnimated = true;
                        this.animateStats();
                    }
                });
            },
            { threshold: 0.3 }
        );

        this.observer.observe(this.elementRef.nativeElement);
    }

    private animateStats(): void {
        const duration = 2000;
        const frameRate = 16;
        const totalFrames = duration / frameRate;

        this.stats.forEach((stat, index) => {
            if (stat.numericValue !== undefined) {
                let currentFrame = 0;
                const increment = stat.numericValue / totalFrames;

                const timer = setInterval(() => {
                    currentFrame++;
                    const currentValue = Math.min(
                        Math.floor(increment * currentFrame),
                        stat.numericValue!
                    );

                    this.animatedStats.update((stats) => {
                        const newStats = [...stats];
                        newStats[index] = {
                            ...stat,
                            value: currentValue + (stat.suffix || '')
                        };
                        return newStats;
                    });

                    if (currentFrame >= totalFrames) {
                        clearInterval(timer);
                        this.animatedStats.update((stats) => {
                            const newStats = [...stats];
                            newStats[index] = {
                                ...stat,
                                value: stat.numericValue + (stat.suffix || '')
                            };
                            return newStats;
                        });
                    }
                }, frameRate);
            }
        });
    }
}
