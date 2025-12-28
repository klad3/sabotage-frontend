import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReviewsService } from '../../core/services/reviews.service';
import { ToastService } from '../../core/services/toast.service';
import { SiteConfigService } from '../../core/services/site-config.service';
import { DbReview } from '../../core/models/product.model';

@Component({
    selector: 'app-reviews',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule],
    template: `
        <main class="min-h-screen bg-sabotage-black">
            <!-- Header -->
            <section class="py-12 md:py-20 px-5 md:px-10 max-w-[1400px] mx-auto text-center">
                <h1 class="text-3xl md:text-6xl font-extrabold mb-4 tracking-wide text-sabotage-light">
                    {{ siteConfig.sectionTitles().testimonials }}
                </h1>
                <p class="text-base md:text-xl text-sabotage-muted">
                    Conoce las experiencias de nuestra comunidad
                </p>
            </section>

            <!-- Reviews List -->
            <section class="px-5 md:px-10 max-w-[1400px] mx-auto pb-12">
                @if (loading()) {
                    <div class="text-center py-12 text-sabotage-muted">Cargando reseñas...</div>
                } @else if (reviews().length === 0) {
                    <div class="text-center py-12 text-sabotage-muted">
                        <p>Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!</p>
                    </div>
                } @else {
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        @for (review of reviews(); track review.id) {
                            <article class="bg-sabotage-dark border-2 border-sabotage-border p-6 md:p-8 rounded-[10px] transition-all duration-300 hover:border-sabotage-light hover:-translate-y-[5px] hover:shadow-lg">
                                <div class="text-xl md:text-2xl mb-4">
                                    @for (star of getStars(review.stars); track $index) {
                                        ⭐
                                    }
                                </div>
                                <p class="text-sm md:text-base leading-relaxed mb-4 italic text-sabotage-muted">
                                    "{{ review.text }}"
                                </p>
                                <div class="flex justify-between items-center pt-4 border-t border-sabotage-border">
                                    <span class="text-base font-semibold text-sabotage-light">- {{ review.author }}</span>
                                    <time class="text-sm text-sabotage-muted">{{ formatDate(review.created_at) }}</time>
                                </div>
                            </article>
                        }
                    </div>
                }
            </section>

            <!-- Submit Form Section -->
            <section class="py-12 md:py-20 px-5 md:px-10 bg-sabotage-black border-t-[3px] border-sabotage-light">
                <div class="max-w-[800px] mx-auto text-center">
                    <h2 class="text-3xl md:text-5xl font-extrabold mb-5 tracking-wide text-sabotage-light">
                        ✍️ COMPARTE TU EXPERIENCIA
                    </h2>
                    <p class="text-base md:text-xl mb-8 text-sabotage-muted">
                        Tu opinión nos ayuda a mejorar y ayuda a otros clientes
                    </p>

                    @if (submitted()) {
                        <div class="bg-[#22c55e]/10 border-2 border-[#22c55e] text-[#22c55e] p-6 text-center max-w-[600px] mx-auto">
                            <span class="text-3xl mb-2 block">✅</span>
                            <strong class="block text-lg mb-1">¡Gracias por tu reseña!</strong>
                            <p class="text-sabotage-muted">Tu comentario está pendiente de aprobación y aparecerá pronto.</p>
                        </div>
                    } @else {
                        <form (ngSubmit)="onSubmit()" class="max-w-[600px] mx-auto text-left">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                <!-- Nombre -->
                                <div class="flex flex-col">
                                    <label for="author" class="text-sm font-bold mb-2 tracking-wide text-sabotage-light">
                                        TU NOMBRE *
                                    </label>
                                    <input
                                        id="author"
                                        type="text"
                                        [(ngModel)]="formData.author"
                                        name="author"
                                        placeholder="Ej: María G."
                                        required
                                        maxlength="50"
                                        class="px-5 py-4 bg-sabotage-dark border-2 border-sabotage-border text-sabotage-light text-base transition-all duration-300 focus:outline-none focus:border-sabotage-light"
                                    />
                                </div>

                                <!-- Calificación -->
                                <div class="flex flex-col">
                                    <label class="text-sm font-bold mb-2 tracking-wide text-sabotage-light">
                                        CALIFICACIÓN *
                                    </label>
                                    <div class="flex gap-2 py-3" role="radiogroup" aria-label="Calificación">
                                        @for (star of [1, 2, 3, 4, 5]; track star) {
                                            <button
                                                type="button"
                                                class="text-2xl transition-all duration-200 hover:scale-110"
                                                [class.opacity-30]="formData.stars < star"
                                                (click)="formData.stars = star"
                                                [attr.aria-label]="star + ' estrellas'"
                                                [attr.aria-pressed]="formData.stars >= star"
                                            >
                                                ⭐
                                            </button>
                                        }
                                    </div>
                                </div>
                            </div>

                            <!-- Reseña -->
                            <div class="flex flex-col mb-6">
                                <label for="text" class="text-sm font-bold mb-2 tracking-wide text-sabotage-light">
                                    TU RESEÑA *
                                </label>
                                <textarea
                                    id="text"
                                    [(ngModel)]="formData.text"
                                    name="text"
                                    placeholder="Cuéntanos tu experiencia con SABOTAGE..."
                                    required
                                    maxlength="500"
                                    rows="4"
                                    class="px-5 py-4 bg-sabotage-dark border-2 border-sabotage-border text-sabotage-light text-base resize-y min-h-[100px] max-h-[200px] leading-relaxed transition-colors duration-300 focus:outline-none focus:border-sabotage-light"
                                ></textarea>
                            </div>

                            <!-- Submit Button -->
                            <div class="text-center">
                                <button
                                    type="submit"
                                    [disabled]="submitting() || !isFormValid()"
                                    class="px-8 md:px-10 py-4 md:py-5 bg-sabotage-light text-sabotage-black font-bold text-base uppercase tracking-wide transition-all duration-300 hover:opacity-80 hover:scale-105 disabled:bg-[#555] disabled:text-[#888] disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {{ submitting() ? 'ENVIANDO...' : 'ENVIAR RESEÑA' }}
                                </button>
                            </div>
                        </form>
                    }
                </div>
            </section>
        </main>
    `,
    host: {
        class: 'block'
    }
})
export class ReviewsComponent implements OnInit {
    private readonly reviewsService = inject(ReviewsService);
    private readonly toast = inject(ToastService);
    readonly siteConfig = inject(SiteConfigService);

    readonly loading = signal(true);
    readonly submitting = signal(false);
    readonly submitted = signal(false);
    readonly reviews = signal<DbReview[]>([]);

    formData = {
        author: '',
        text: '',
        stars: 5
    };

    async ngOnInit(): Promise<void> {
        await this.loadReviews();
    }

    private async loadReviews(): Promise<void> {
        this.loading.set(true);
        try {
            const reviews = await this.reviewsService.getApprovedReviews();
            this.reviews.set(reviews);
        } finally {
            this.loading.set(false);
        }
    }

    isFormValid(): boolean {
        return (
            this.formData.author.trim().length > 0 &&
            this.formData.text.trim().length > 0 &&
            this.formData.stars >= 1 &&
            this.formData.stars <= 5
        );
    }

    async onSubmit(): Promise<void> {
        if (!this.isFormValid()) return;

        this.submitting.set(true);
        try {
            const result = await this.reviewsService.submitReview({
                author: this.formData.author.trim(),
                text: this.formData.text.trim(),
                stars: this.formData.stars
            });

            if (result) {
                this.submitted.set(true);
                this.formData = { author: '', text: '', stars: 5 };
            } else {
                this.toast.error('Error al enviar la reseña. Intenta de nuevo.');
            }
        } finally {
            this.submitting.set(false);
        }
    }

    getStars(count: number): number[] {
        return Array(count).fill(0);
    }

    formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
}
