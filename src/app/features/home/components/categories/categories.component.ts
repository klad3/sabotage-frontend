import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Category {
    name: string;
    imageUrl: string;
    route: string;
}

@Component({
    selector: 'app-categories',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink],
    template: `
    <section class="py-12 md:py-20 px-5 md:px-10 bg-sabotage-dark border-t-2 border-b-2 border-sabotage-border">
      <h2 class="text-3xl md:text-6xl font-extrabold text-center mb-10 md:mb-16 tracking-wide">
        COMPRA POR CATEGORÍA
      </h2>

      <div class="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        @for (category of categories; track category.name) {
          <a
            [routerLink]="category.route"
            class="bg-sabotage-black border-2 border-sabotage-border flex flex-col items-center cursor-pointer transition-all duration-400 relative overflow-hidden group hover:border-sabotage-light hover:scale-[1.03]"
          >
            <!-- Ripple effect -->
            <div
              class="absolute top-1/2 left-1/2 w-0 h-0 bg-sabotage-light/5 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-600 group-hover:w-[500px] group-hover:h-[500px]"
            ></div>

            <div class="w-full flex items-center justify-center overflow-hidden z-[1]">
              <img
                [src]="category.imageUrl"
                [alt]="category.name"
                class="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(.25,.8,.25,1)] group-hover:scale-105"
              />
            </div>
            <div class="text-center my-4 text-lg md:text-2xl font-bold z-[1]">
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
export class CategoriesComponent {
    readonly categories: Category[] = [
        {
            name: 'POLOS OVERSIZE',
            imageUrl: '/img/NEGRO OVERSIZE SOLO C.png',
            route: '/oversize'
        },
        {
            name: 'POLOS CLÁSICOS',
            imageUrl: '/img/ROJO Y CELESTE JUNTOS ENFRENTADOS PERFIL.png',
            route: '/polos-clasicos'
        },
        {
            name: 'PERSONALIZADOS',
            imageUrl: '/img/BLANCO MOCKUP ENJAMBRE 1.png',
            route: '/oversize'
        },
        {
            name: 'TOTTEBAGS',
            imageUrl: '/img/TOTTEBAG AMARILLO DE BICICLETA BLANCO.png',
            route: '/oversize'
        }
    ];
}
