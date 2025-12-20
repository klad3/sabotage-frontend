import { Component, ChangeDetectionStrategy } from '@angular/core';

interface Testimonial {
    stars: number;
    text: string;
    author: string;
}

@Component({
    selector: 'app-testimonials',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <section class="py-12 md:py-20 px-5 md:px-10 max-w-[1400px] mx-auto">
      <h2 class="text-3xl md:text-6xl font-extrabold text-center mb-10 md:mb-16 tracking-wide">
        LO QUE DICEN NUESTROS CLIENTES
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
        @for (testimonial of testimonials; track testimonial.author) {
          <div
            class="bg-sabotage-dark border-2 border-sabotage-border p-6 md:p-10 rounded-[10px] transition-all duration-300 hover:border-sabotage-light hover:-translate-y-[5px] hover:shadow-[0_10px_30px_rgba(242,242,242,0.1)]"
          >
            <div class="text-xl md:text-2xl mb-5">
              @for (star of getStars(testimonial.stars); track $index) {
                ⭐
              }
            </div>
            <p class="text-sm md:text-base leading-relaxed mb-5 italic text-[#ccc]">
              "{{ testimonial.text }}"
            </p>
            <p class="text-base md:text-lg font-semibold text-sabotage-light">
              {{ testimonial.author }}
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
export class TestimonialsComponent {
    readonly testimonials: Testimonial[] = [
        {
            stars: 5,
            text: 'La calidad de las prendas es increíble! El oversize fit es perfecto y la tela super cómoda. Definitivamente volveré a comprar.',
            author: '- María G.'
        },
        {
            stars: 5,
            text: 'Me encanta el estilo urbano que tienen. Los diseños son únicos y la atención al cliente es de primera. 100% recomendado!',
            author: '- Carlos R.'
        },
        {
            stars: 5,
            text: 'Mejor relación calidad-precio imposible. Las prendas llegaron súper rápido y son tal cual se ven en las fotos. SABOTAGE rules!',
            author: '- Andrea L.'
        }
    ];

    getStars(count: number): number[] {
        return Array(count).fill(0);
    }
}
