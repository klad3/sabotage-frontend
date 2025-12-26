import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteConfigService } from '../../../../core/services/site-config.service';
import { ReviewsService } from '../../../../core/services/reviews.service';
import { DbReview } from '../../../../core/models/product.model';

@Component({
  selector: 'app-testimonials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="py-12 md:py-20 px-5 md:px-10 max-w-[1400px] mx-auto">
      <h2 class="text-3xl md:text-6xl font-extrabold text-center mb-10 md:mb-16 tracking-wide">
        {{ siteConfig.sectionTitles().testimonials }}
      </h2>

      @if (reviews().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          @for (review of reviews(); track review.id) {
            <div
              class="bg-sabotage-dark border-2 border-sabotage-border p-6 md:p-10 rounded-[10px] transition-all duration-300 hover:border-sabotage-light hover:-translate-y-[5px] hover:shadow-[0_10px_30px_rgba(242,242,242,0.1)]"
            >
              <div class="text-xl md:text-2xl mb-5">
                @for (star of getStars(review.stars); track $index) {
                  ⭐
                }
              </div>
              <p class="text-sm md:text-base leading-relaxed mb-5 italic text-sabotage-muted">
                "{{ review.text }}"
              </p>
              <p class="text-base md:text-lg font-semibold text-sabotage-light">
                - {{ review.author }}
              </p>
            </div>
          }
        </div>
      }

      <div class="text-center mt-10">
        <a
          routerLink="/reviews"
          class="inline-flex items-center gap-2 text-lg font-semibold text-[#00d9ff] hover:text-sabotage-light transition-colors duration-200"
        >
          Ver todos los testimonios
          <span class="text-xl">→</span>
        </a>
      </div>
    </section>
  `,
  host: {
    class: 'block'
  }
})
export class TestimonialsComponent implements OnInit {
  readonly siteConfig = inject(SiteConfigService);
  private readonly reviewsService = inject(ReviewsService);

  readonly reviews = signal<DbReview[]>([]);

  async ngOnInit(): Promise<void> {
    await this.siteConfig.loadConfigs();
    const featured = await this.reviewsService.getFeaturedReviews();
    this.reviews.set(featured);
  }

  getStars(count: number): number[] {
    return Array(count).fill(0);
  }
}
