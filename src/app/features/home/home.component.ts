import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BannerSliderComponent } from './components/banner-slider/banner-slider.component';
import { ProductsMonthComponent } from './components/products-month/products-month.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { StatsComponent } from './components/stats/stats.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { SocialFeedComponent } from './components/social-feed/social-feed.component';
import { NewsletterComponent } from './components/newsletter/newsletter.component';

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
      <app-products-month />

      <!-- Categories -->
      <app-categories />

      <!-- Stats -->
      <app-stats />

      <!-- Testimonials -->
      <app-testimonials />

      <!-- Social Feed -->
      <app-social-feed />

      <!-- Newsletter -->
      <app-newsletter />
    </main>
  `,
    host: {
        class: 'block'
    }
})
export class HomeComponent { }
