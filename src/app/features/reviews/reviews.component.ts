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
        <main class="reviews-page">
            <div class="container">
                <header class="page-header">
                    <h1>{{ siteConfig.sectionTitles().testimonials }}</h1>
                    <p class="subtitle">Conoce las experiencias de nuestra comunidad</p>
                </header>

                <!-- Approved Reviews List -->
                <section class="reviews-list-section">
                    <h2>💬 Lo que dicen nuestros clientes</h2>

                    @if (loading()) {
                        <div class="loading">Cargando reseñas...</div>
                    } @else if (reviews().length === 0) {
                        <div class="empty-state">
                            <p>Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!</p>
                        </div>
                    } @else {
                        <div class="reviews-grid">
                            @for (review of reviews(); track review.id) {
                                <article class="review-card">
                                    <div class="stars">
                                        @for (star of getStars(review.stars); track $index) {
                                            ⭐
                                        }
                                    </div>
                                    <p class="text">"{{ review.text }}"</p>
                                    <footer>
                                        <span class="author">- {{ review.author }}</span>
                                        <time class="date">{{ formatDate(review.created_at) }}</time>
                                    </footer>
                                </article>
                            }
                        </div>
                    }
                </section>

                <!-- Submit Review Form -->
                <section class="submit-form-section">
                    <h2>✍️ Comparte tu experiencia</h2>

                    @if (submitted()) {
                        <div class="success-message">
                            <span class="icon">✅</span>
                            <div>
                                <strong>¡Gracias por tu reseña!</strong>
                                <p>Tu comentario está pendiente de aprobación y aparecerá pronto.</p>
                            </div>
                        </div>
                    } @else {
                        <form (ngSubmit)="onSubmit()" class="review-form">
                            <div class="form-group">
                                <label for="author">Tu nombre</label>
                                <input
                                    type="text"
                                    id="author"
                                    [(ngModel)]="formData.author"
                                    name="author"
                                    placeholder="María G."
                                    required
                                    maxlength="50"
                                >
                            </div>

                            <div class="form-group">
                                <label for="text">Tu reseña</label>
                                <textarea
                                    id="text"
                                    [(ngModel)]="formData.text"
                                    name="text"
                                    placeholder="Cuéntanos tu experiencia con SABOTAGE..."
                                    required
                                    maxlength="500"
                                    rows="4"
                                ></textarea>
                            </div>

                            <div class="form-group">
                                <label>Calificación</label>
                                <div class="stars-input" role="radiogroup" aria-label="Calificación">
                                    @for (star of [1, 2, 3, 4, 5]; track star) {
                                        <button
                                            type="button"
                                            class="star-btn"
                                            [class.active]="formData.stars >= star"
                                            (click)="formData.stars = star"
                                            [attr.aria-label]="star + ' estrellas'"
                                            [attr.aria-pressed]="formData.stars >= star"
                                        >
                                            ⭐
                                        </button>
                                    }
                                </div>
                            </div>

                            <button
                                type="submit"
                                class="btn-submit"
                                [disabled]="submitting() || !isFormValid()"
                            >
                                {{ submitting() ? 'Enviando...' : 'Enviar Reseña' }}
                            </button>
                        </form>
                    }
                </section>
            </div>
        </main>
    `,
    styles: [`
        .reviews-page {
            min-height: 100vh;
            background: #0a0a0a;
            padding: 2rem 1rem;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .page-header {
            text-align: center;
            margin-bottom: 3rem;
        }

        .page-header h1 {
            font-size: clamp(2rem, 5vw, 3.5rem);
            font-weight: 800;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #fff, #ccc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .subtitle {
            color: #888;
            font-size: 1.1rem;
        }

        /* Form Section */
        .submit-form-section {
            background: linear-gradient(145deg, #1a1a1a, #141414);
            border: 1px solid #333;
            border-radius: 16px;
            padding: 2rem;
            margin-top: 3rem;
        }

        .submit-form-section h2 {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .review-form {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .form-group label {
            font-weight: 500;
            color: #ccc;
        }

        .form-group input,
        .form-group textarea {
            background: #0a0a0a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 0.875rem 1rem;
            color: #fff;
            font-size: 1rem;
            transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #00d9ff;
        }

        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }

        .stars-input {
            display: flex;
            gap: 0.5rem;
        }

        .star-btn {
            background: transparent;
            border: none;
            font-size: 1.75rem;
            cursor: pointer;
            opacity: 0.3;
            transition: all 0.2s;
            padding: 0.25rem;
        }

        .star-btn:hover,
        .star-btn.active {
            opacity: 1;
            transform: scale(1.1);
        }

        .btn-submit {
            background: linear-gradient(135deg, #00d9ff, #0099ff);
            color: #000;
            border: none;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            align-self: flex-start;
        }

        .btn-submit:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0, 217, 255, 0.3);
        }

        .btn-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .success-message {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
        }

        .success-message .icon {
            font-size: 1.5rem;
        }

        .success-message strong {
            display: block;
            margin-bottom: 0.25rem;
            color: #22c55e;
        }

        .success-message p {
            color: #888;
            margin: 0;
        }

        /* Reviews List */
        .reviews-list-section {
            margin-top: 2rem;
        }

        .reviews-list-section h2 {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
        }

        .reviews-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.5rem;
        }

        .review-card {
            background: linear-gradient(145deg, #1a1a1a, #141414);
            border: 1px solid #333;
            border-radius: 12px;
            padding: 1.5rem;
            transition: all 0.3s;
        }

        .review-card:hover {
            border-color: #555;
            transform: translateY(-4px);
        }

        .review-card .stars {
            font-size: 1.25rem;
            margin-bottom: 1rem;
        }

        .review-card .text {
            color: #ccc;
            line-height: 1.6;
            font-style: italic;
            margin-bottom: 1rem;
        }

        .review-card footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1rem;
            border-top: 1px solid #333;
        }

        .review-card .author {
            font-weight: 600;
            color: #00d9ff;
        }

        .review-card .date {
            color: #666;
            font-size: 0.875rem;
        }

        .loading,
        .empty-state {
            text-align: center;
            padding: 3rem;
            color: #888;
        }

        @media (max-width: 640px) {
            .reviews-page {
                padding: 1rem;
            }

            .submit-form-section {
                padding: 1.5rem;
            }

            .reviews-grid {
                grid-template-columns: 1fr;
            }
        }
    `]
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
