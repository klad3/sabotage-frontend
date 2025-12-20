import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-black border-t-[3px] border-sabotage-light pt-[60px] pb-[30px] px-5 md:px-10 mt-20">
      <div class="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
        <!-- Brand Section -->
        <div class="footer-section">
          <div class="text-4xl font-extrabold tracking-wider mb-4">SABOTAGE</div>
          <p class="text-sabotage-muted leading-relaxed">
            Moda urbana con actitud.<br />Diseño, calidad y estilo.
          </p>
        </div>

        <!-- Contact Section -->
        <div class="footer-section">
          <h3 class="text-2xl font-bold tracking-wider mb-5">CONTACTO</h3>
          <p class="text-sabotage-muted leading-relaxed">
            Av. La Marina 2355<br />San Miguel, Lima - Perú
          </p>
          <p class="text-sabotage-muted leading-relaxed mt-2">
            contacto&#64;sabotage.pe<br />+51 987 654 321
          </p>
        </div>

        <!-- Info Section -->
        <div class="footer-section">
          <h3 class="text-2xl font-bold tracking-wider mb-5">INFORMACIÓN</h3>
          <nav class="flex flex-col gap-2">
            <a href="#envios" class="text-sabotage-muted hover:text-sabotage-light transition-colors">
              Envíos y Devoluciones
            </a>
            <a href="#pagos" class="text-sabotage-muted hover:text-sabotage-light transition-colors">
              Métodos de Pago
            </a>
            <a href="#tallas" class="text-sabotage-muted hover:text-sabotage-light transition-colors">
              Guía de Tallas
            </a>
            <a href="#cuidados" class="text-sabotage-muted hover:text-sabotage-light transition-colors">
              Cuidado de Prendas
            </a>
          </nav>
        </div>

        <!-- Legal Section -->
        <div class="footer-section">
          <h3 class="text-2xl font-bold tracking-wider mb-5">LEGAL</h3>
          <nav class="flex flex-col gap-2">
            <a href="#terminos" class="text-sabotage-muted hover:text-sabotage-light transition-colors">
              Términos y Condiciones
            </a>
            <a href="#privacidad" class="text-sabotage-muted hover:text-sabotage-light transition-colors">
              Política de Privacidad
            </a>
            <a href="#cookies" class="text-sabotage-muted hover:text-sabotage-light transition-colors">
              Política de Cookies
            </a>
            <a href="#reclamos" class="text-sabotage-muted hover:text-sabotage-light transition-colors">
              Libro de Reclamaciones
            </a>
          </nav>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="text-center pt-8 border-t border-sabotage-border text-sabotage-subtle text-sm">
        <p>© 2024 SABOTAGE PERU. Todos los derechos reservados.</p>
        <p class="mt-1">RUC: 20123456789 | VESTIMOS TU PASION | Lima, Perú</p>
      </div>
    </footer>
  `,
  host: {
    class: 'block'
  }
})
export class FooterComponent { }
