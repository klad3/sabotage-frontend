import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteConfigService } from '../../../../core/services/site-config.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { DbCategory } from '../../../../core/models/product.model';

@Component({
  selector: 'app-categories',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="py-12 md:py-20 px-5 md:px-10 bg-sabotage-dark border-t-2 border-b-2 border-sabotage-border">
      <h2 class="text-3xl md:text-6xl font-extrabold text-center mb-10 md:mb-16 tracking-wide">
        {{ siteConfig.sectionTitles().categories }}
      </h2>

      <div class="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        @for (category of categories(); track category.id) {
          <a
            [routerLink]="'/' + category.slug"
            class="bg-sabotage-black border-2 border-sabotage-border flex flex-col items-center cursor-pointer transition-all duration-400 relative overflow-hidden group hover:border-sabotage-light hover:scale-[1.03]"
          >
            <!-- Ripple effect -->
            <div
              class="absolute top-1/2 left-1/2 w-0 h-0 bg-sabotage-light/5 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-600 group-hover:w-[500px] group-hover:h-[500px]"
            ></div>

            <div class="w-full flex items-center justify-center overflow-hidden z-[1]">
              @if (category.image_url) {
                <img
                  [src]="category.image_url"
                  [alt]="category.name"
                  class="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(.25,.8,.25,1)] group-hover:scale-105"
                />
              } @else {
                <div class="w-full aspect-square bg-sabotage-gray flex items-center justify-center text-6xl">
                  📁
                </div>
              }
            </div>
            <div class="text-center my-4 text-lg md:text-2xl font-bold z-[1] uppercase">
              {{ category.name }}
            </div>
          </a>
        }
      </div>
    </section>
  `,
  host: {
    class: 'block'
  }
})
export class CategoriesComponent implements OnInit {
  readonly siteConfig = inject(SiteConfigService);
  private readonly supabase = inject(SupabaseService);

  readonly categories = signal<DbCategory[]>([]);

  async ngOnInit(): Promise<void> {
    await this.siteConfig.loadConfigs();
    await this.loadCategories();
  }

  private async loadCategories(): Promise<void> {
    const data = await this.supabase.getAll<DbCategory>('categories', {
      orderBy: { column: 'display_order', ascending: true },
      filters: [{ column: 'is_active', operator: 'eq', value: true }]
    });
    this.categories.set(data);
  }
}


