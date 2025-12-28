import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { BannerSliderComponent } from './components/banner-slider/banner-slider.component';
import { ProductsMonthComponent } from './components/products-month/products-month.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { StatsComponent } from './components/stats/stats.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { SocialFeedComponent } from './components/social-feed/social-feed.component';
import { NewsletterComponent } from './components/newsletter/newsletter.component';
import { AosService } from '../../core/services/aos.service';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BannerSliderComponent,
    ProductsMonthComponent,
    CategoriesComponent,
    StatsComponent,
    TestimonialsComponent,
    SocialFeedComponent,
    NewsletterComponent
  ],
  template: `
    <main>
      <!-- Banner Slider -->
      <app-banner-slider />

      <!-- Products of the Month -->
      <div data-aos="fade-up">
        <app-products-month />
      </div>

      <!-- Categories -->
      <div data-aos="fade-up">
        <app-categories />
      </div>

      <!-- Stats -->
      <div data-aos="fade-up">
        <app-stats />
      </div>

      <!-- Testimonials -->
      <div data-aos="fade-up">
        <app-testimonials />
      </div>

      <!-- Social Feed -->
      <div data-aos="fade-up">
        <app-social-feed />
      </div>

      <!-- Newsletter -->
      <div data-aos="fade-up">
        <app-newsletter />
      </div>
    </main>
  `,
  host: {
    class: 'block'
  }
})
export class HomeComponent implements OnInit {
  private readonly aos = inject(AosService);

  async ngOnInit(): Promise<void> {
    await this.aos.init();
  }
}
