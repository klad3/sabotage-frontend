import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Product } from '../../../../core/models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent],
  template: `
    <main class="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 items-start">
      @for (product of products(); track product.id) {
        <app-product-card
          [product]="product"
          (cardClick)="productClick.emit($event)"
        />
      } @empty {
        <div class="col-span-full text-center py-16 text-lg text-[#888]">
          <p>No se encontraron productos con los filtros seleccionados.</p>
        </div>
      }
    </main>
  `,
  host: {
    class: 'block'
  }
})
export class ProductGridComponent {
  readonly products = input.required<Product[]>();

  readonly productClick = output<Product>();
}

