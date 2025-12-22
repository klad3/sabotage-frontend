import {
    Component,
    signal,
    ChangeDetectionStrategy,
    ElementRef,
    inject,
    AfterViewInit,
    OnDestroy,
    OnInit,
    computed
} from '@angular/core';
import { SiteConfigService } from '../../../../core/services/site-config.service';
import { StatItem } from '../../../../core/models/product.model';

@Component({
    selector: 'app-stats',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <section class="py-10 md:py-16 px-5 md:px-10 bg-sabotage-black">
      <div class="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-center">
        @for (stat of displayStats(); track stat.label) {
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
export class StatsComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly elementRef = inject(ElementRef);
    private readonly siteConfig = inject(SiteConfigService);
    private observer: IntersectionObserver | null = null;
    private hasAnimated = false;

    // Animated values for display
    readonly animatedStats = signal<StatItem[]>([]);

    // Get stats from config service
    readonly displayStats = computed(() => {
        const animated = this.animatedStats();
        return animated.length > 0 ? animated : this.siteConfig.stats();
    });

    async ngOnInit(): Promise<void> {
        await this.siteConfig.loadConfigs();
        // Initialize animated stats with starting values
        this.animatedStats.set(this.siteConfig.stats().map(stat => ({
            ...stat,
            value: stat.numeric_value !== null ? '0' : stat.value
        })));
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
        const stats = this.siteConfig.stats();

        stats.forEach((stat, index) => {
            if (stat.numeric_value !== null) {
                let currentFrame = 0;
                const increment = stat.numeric_value / totalFrames;

                const timer = setInterval(() => {
                    currentFrame++;
                    const currentValue = Math.min(
                        Math.floor(increment * currentFrame),
                        stat.numeric_value!
                    );

                    this.animatedStats.update((current) => {
                        const newStats = [...current];
                        newStats[index] = {
                            ...stat,
                            value: currentValue + (stat.suffix || '')
                        };
                        return newStats;
                    });

                    if (currentFrame >= totalFrames) {
                        clearInterval(timer);
                        this.animatedStats.update((current) => {
                            const newStats = [...current];
                            newStats[index] = {
                                ...stat,
                                value: stat.numeric_value + (stat.suffix || '')
                            };
                            return newStats;
                        });
                    }
                }, frameRate);
            }
        });
    }
}

