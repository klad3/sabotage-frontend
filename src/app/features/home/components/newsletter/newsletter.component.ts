import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { SiteConfigService } from '../../../../core/services/site-config.service';
import { COUNTRIES, DISTRICTS_BY_COUNTRY } from '../../../../core/models/product.model';

@Component({
  selector: 'app-newsletter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule],
  template: `
    <!-- Newsletter Section -->
    <section class="py-12 md:py-20 px-5 md:px-10 bg-black border-t-[3px] border-sabotage-light">
      <div class="max-w-[800px] mx-auto text-center">
        <h2 class="text-3xl md:text-5xl font-extrabold mb-5 tracking-wide">
          {{ siteConfig.newsletterContent().title }}
        </h2>
        <p class="text-base md:text-xl mb-8 text-sabotage-muted">
          {{ siteConfig.newsletterContent().subtitle }}
        </p>

        <form
          class="flex flex-col sm:flex-row gap-3 max-w-[600px] mx-auto"
          (ngSubmit)="openSubscriptionModal()"
        >
          <input
            type="email"
            [(ngModel)]="email"
            name="email"
            placeholder="Tu correo electrónico..."
            required
            class="flex-1 px-5 py-4 md:py-5 bg-sabotage-dark border-2 border-sabotage-border text-sabotage-light text-base transition-all duration-300 focus:outline-none focus:border-sabotage-light"
          />
          <button
            type="submit"
            class="px-8 md:px-10 py-4 md:py-5 bg-sabotage-light text-black font-bold text-base uppercase tracking-wide transition-all duration-300 hover:bg-white hover:scale-105"
          >
            Suscribirse
          </button>
        </form>
      </div>
    </section>

    <!-- Subscription Modal -->
    @if (isModalOpen()) {
      <div
        class="fixed inset-0 z-[10000] bg-black/95 overflow-y-auto animate-[fadeIn_0.3s_ease]"
        (click)="closeModal($event)"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="relative bg-sabotage-dark my-[3%] mx-auto border-[3px] border-sabotage-border w-[90%] max-w-[900px] rounded-xl animate-[slideDown_0.4s_ease]"
          (click)="$event.stopPropagation()"
        >
          <!-- Close Button -->
          <button
            type="button"
            (click)="closeModal()"
            class="absolute right-5 top-4 text-4xl font-bold text-sabotage-light cursor-pointer z-10 leading-none transition-all duration-300 hover:text-sabotage-accent hover:rotate-90"
            aria-label="Cerrar modal"
          >
            &times;
          </button>

          <!-- Header -->
          <div class="px-6 md:px-10 py-8 md:py-10 border-b-2 border-sabotage-border text-center">
            <h2 class="text-2xl md:text-4xl font-extrabold mb-4 tracking-wide">
              COMPLETA TU SUSCRIPCIÓN
            </h2>
            <p class="text-base md:text-lg text-sabotage-muted">
              Queremos conocerte mejor para ofrecerte una experiencia personalizada
            </p>
          </div>

          <!-- Form -->
          <form
            [formGroup]="subscriptionForm"
            (ngSubmit)="submitSubscription()"
            class="p-6 md:p-10"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-8">
              <!-- Nombre -->
              <div class="flex flex-col">
                <label for="firstName" class="text-sm font-bold mb-2 tracking-wide">
                  NOMBRE *
                </label>
                <input
                  id="firstName"
                  type="text"
                  formControlName="firstName"
                  placeholder="Ej: Juan"
                  class="px-4 py-3 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light rounded-md transition-all duration-300 focus:outline-none focus:border-sabotage-light focus:bg-sabotage-border"
                />
              </div>

              <!-- Apellido -->
              <div class="flex flex-col">
                <label for="lastName" class="text-sm font-bold mb-2 tracking-wide">
                  APELLIDO *
                </label>
                <input
                  id="lastName"
                  type="text"
                  formControlName="lastName"
                  placeholder="Ej: Pérez"
                  class="px-4 py-3 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light rounded-md transition-all duration-300 focus:outline-none focus:border-sabotage-light focus:bg-sabotage-border"
                />
              </div>

              <!-- Edad -->
              <div class="flex flex-col">
                <label for="age" class="text-sm font-bold mb-2 tracking-wide">
                  EDAD *
                </label>
                <input
                  id="age"
                  type="number"
                  formControlName="age"
                  placeholder="Ej: 25"
                  min="13"
                  max="120"
                  class="px-4 py-3 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light rounded-md transition-all duration-300 focus:outline-none focus:border-sabotage-light focus:bg-sabotage-border"
                />
              </div>

              <!-- Teléfono -->
              <div class="flex flex-col">
                <label for="phone" class="text-sm font-bold mb-2 tracking-wide">
                  TELÉFONO *
                </label>
                <input
                  id="phone"
                  type="tel"
                  formControlName="phone"
                  placeholder="Ej: 987654321"
                  class="px-4 py-3 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light rounded-md transition-all duration-300 focus:outline-none focus:border-sabotage-light focus:bg-sabotage-border"
                />
              </div>

              <!-- País -->
              <div class="flex flex-col">
                <label for="country" class="text-sm font-bold mb-2 tracking-wide">
                  PAÍS *
                </label>
                <select
                  id="country"
                  formControlName="country"
                  class="px-4 py-3 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light rounded-md cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23f2f2f2%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_15px_center] pr-10 transition-all duration-300 focus:outline-none focus:border-sabotage-light"
                >
                  <option value="">Selecciona tu país</option>
                  @for (country of countries; track country) {
                    <option [value]="country">{{ country }}</option>
                  }
                </select>
              </div>

              <!-- Distrito -->
              <div class="flex flex-col">
                <label for="district" class="text-sm font-bold mb-2 tracking-wide">
                  DISTRITO/CIUDAD *
                </label>
                <select
                  id="district"
                  formControlName="district"
                  class="px-4 py-3 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light rounded-md cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23f2f2f2%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_15px_center] pr-10 transition-all duration-300 focus:outline-none focus:border-sabotage-light"
                >
                  <option value="">
                    {{ selectedCountry() ? 'Selecciona tu distrito/ciudad' : 'Primero selecciona tu país' }}
                  </option>
                  @for (district of availableDistricts(); track district) {
                    <option [value]="district">{{ district }}</option>
                  }
                </select>
              </div>

              <!-- Nacionalidad -->
              <div class="flex flex-col md:col-span-2">
                <label for="nationality" class="text-sm font-bold mb-2 tracking-wide">
                  NACIONALIDAD *
                </label>
                <input
                  id="nationality"
                  type="text"
                  formControlName="nationality"
                  placeholder="Ej: Peruana"
                  class="px-4 py-3 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light rounded-md transition-all duration-300 focus:outline-none focus:border-sabotage-light focus:bg-sabotage-border"
                />
              </div>

              <!-- Comentarios -->
              <div class="flex flex-col md:col-span-2">
                <label for="comments" class="text-sm font-bold mb-2 tracking-wide">
                  COMENTARIOS (OPCIONAL)
                </label>
                <textarea
                  id="comments"
                  formControlName="comments"
                  rows="4"
                  maxlength="1000"
                  placeholder="Cuéntanos qué te gustaría encontrar en SABOTAGE... (máximo 200 palabras)"
                  class="px-4 py-3 bg-sabotage-gray border-2 border-sabotage-border text-sabotage-light rounded-md resize-y min-h-[100px] max-h-[200px] leading-relaxed transition-all duration-300 focus:outline-none focus:border-sabotage-light focus:bg-sabotage-border"
                ></textarea>
                <div class="mt-2 text-sm text-sabotage-muted text-right">
                  <span>{{ wordCount() }}</span> / 200 palabras
                </div>
              </div>
            </div>

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="bg-sabotage-accent/10 border-2 border-sabotage-accent text-sabotage-accent p-4 rounded-md mb-5 font-semibold text-center animate-[shake_0.5s_ease]">
                {{ errorMessage() }}
              </div>
            }

            <!-- Buttons -->
            <div class="flex flex-col-reverse md:flex-row gap-4 justify-end">
              <button
                type="button"
                (click)="closeModal()"
                class="px-8 py-4 bg-transparent border-2 border-[#666] text-sabotage-muted font-bold tracking-wider rounded-md transition-all duration-300 hover:bg-sabotage-border hover:border-sabotage-light hover:text-sabotage-light"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="px-8 py-4 bg-sabotage-light text-black font-bold tracking-wider rounded-md transition-all duration-300 hover:bg-white hover:scale-105 disabled:bg-[#555] disabled:text-[#888] disabled:cursor-not-allowed disabled:transform-none"
                [class.relative]="isSubmitting()"
              >
                @if (isSubmitting()) {
                  <span class="opacity-0">COMPLETAR SUSCRIPCIÓN</span>
                  <span class="absolute inset-0 flex items-center justify-center">
                    <span class="w-5 h-5 border-3 border-sabotage-border border-t-transparent rounded-full animate-spin"></span>
                  </span>
                } @else {
                  COMPLETAR SUSCRIPCIÓN
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  host: {
    class: 'block'
  }
})
export class NewsletterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly subscriptionService = inject(SubscriptionService);
  readonly siteConfig = inject(SiteConfigService);

  email = '';
  readonly countries = COUNTRIES;

  async ngOnInit(): Promise<void> {
    await this.siteConfig.loadConfigs();
  }

  readonly isModalOpen = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedCountry = signal<string | null>(null);
  readonly wordCount = signal(0);

  readonly subscriptionForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.pattern(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/)]],
    lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/)]],
    age: ['', [Validators.required, Validators.min(13), Validators.max(120)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,15}$/)]],
    country: ['', Validators.required],
    district: ['', Validators.required],
    nationality: ['', [Validators.required, Validators.pattern(/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/)]],
    comments: ['']
  });

  constructor() {
    // Watch for country changes to update districts
    this.subscriptionForm.get('country')?.valueChanges.subscribe((country) => {
      this.selectedCountry.set(country);
      this.subscriptionForm.get('district')?.setValue('');
    });

    // Watch for comments changes to count words
    this.subscriptionForm.get('comments')?.valueChanges.subscribe((value) => {
      if (value) {
        const words = value.trim().split(/\s+/).filter((w: string) => w.length > 0);
        this.wordCount.set(words.length);
      } else {
        this.wordCount.set(0);
      }
    });
  }

  readonly availableDistricts = () => {
    const country = this.selectedCountry();
    return country ? (DISTRICTS_BY_COUNTRY[country] || []) : [];
  };

  openSubscriptionModal(): void {
    if (!this.email || !this.email.includes('@')) {
      return;
    }
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal(event?: MouseEvent): void {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    this.isModalOpen.set(false);
    document.body.style.overflow = 'auto';
    this.errorMessage.set(null);
    this.subscriptionForm.reset();
  }

  async submitSubscription(): Promise<void> {
    if (!this.subscriptionForm.valid) {
      this.subscriptionForm.markAllAsTouched();
      this.errorMessage.set('Por favor completa todos los campos requeridos');
      return;
    }

    // Check word count
    if (this.wordCount() > 200) {
      this.errorMessage.set('Los comentarios no pueden exceder las 200 palabras');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValue = this.subscriptionForm.value;
    const subscriber = {
      email: this.email,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      age: parseInt(formValue.age, 10),
      phone: formValue.phone,
      country: formValue.country,
      district: formValue.district,
      nationality: formValue.nationality,
      comments: formValue.comments || 'Sin comentarios'
    };

    try {
      await this.subscriptionService.subscribe(subscriber);
      this.isSubmitting.set(false);

      // Close modal after a short delay
      setTimeout(() => {
        this.closeModal();
        this.email = '';
      }, 2000);
    } catch {
      this.isSubmitting.set(false);
      this.errorMessage.set('Error al procesar la suscripción. Por favor intenta de nuevo.');
    }
  }
}
