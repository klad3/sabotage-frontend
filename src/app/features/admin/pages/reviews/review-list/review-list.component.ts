import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReviewsService } from '../../../../../core/services/reviews.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { DbReview, ReviewStatus } from '../../../../../core/models/product.model';

type TabType = 'pending' | 'approved' | 'rejected' | 'all';

@Component({
    selector: 'app-review-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule],
    template: `
        <div class="reviews-admin">
            <header class="page-header">
                <div>
                    <h1>💬 Gestión de Reseñas</h1>
                    <p class="subtitle">Administra las reseñas de tus clientes</p>
                </div>
                <button class="btn-add" (click)="showAddForm.set(!showAddForm())">
                    {{ showAddForm() ? '✕ Cerrar' : '+ Nueva Reseña' }}
                </button>
            </header>

            <!-- Add Review Form -->
            @if (showAddForm()) {
                <section class="add-form-section">
                    <h2>Agregar Reseña Manualmente</h2>
                    <form (ngSubmit)="onCreateReview()" class="add-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="author">Nombre del cliente</label>
                                <input
                                    type="text"
                                    id="author"
                                    [(ngModel)]="newReview.author"
                                    name="author"
                                    placeholder="María G."
                                    required
                                >
                            </div>
                            <div class="form-group small">
                                <label for="stars">Estrellas</label>
                                <select id="stars" [(ngModel)]="newReview.stars" name="stars">
                                    <option [value]="5">⭐⭐⭐⭐⭐ (5)</option>
                                    <option [value]="4">⭐⭐⭐⭐ (4)</option>
                                    <option [value]="3">⭐⭐⭐ (3)</option>
                                    <option [value]="2">⭐⭐ (2)</option>
                                    <option [value]="1">⭐ (1)</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="text">Texto de la reseña</label>
                            <textarea
                                id="text"
                                [(ngModel)]="newReview.text"
                                name="text"
                                placeholder="Excelente calidad y diseño..."
                                rows="3"
                                required
                            ></textarea>
                        </div>
                        <button type="submit" class="btn-save" [disabled]="saving()">
                            {{ saving() ? 'Guardando...' : 'Guardar Reseña' }}
                        </button>
                    </form>
                </section>
            }

            <!-- Tabs -->
            <nav class="tabs">
                <button
                    class="tab"
                    [class.active]="activeTab() === 'pending'"
                    (click)="activeTab.set('pending')"
                >
                    Pendientes
                    @if (reviewsService.pendingReviews().length > 0) {
                        <span class="badge">{{ reviewsService.pendingReviews().length }}</span>
                    }
                </button>
                <button
                    class="tab"
                    [class.active]="activeTab() === 'approved'"
                    (click)="activeTab.set('approved')"
                >
                    Aprobadas
                </button>
                <button
                    class="tab"
                    [class.active]="activeTab() === 'rejected'"
                    (click)="activeTab.set('rejected')"
                >
                    Rechazadas
                </button>
                <button
                    class="tab"
                    [class.active]="activeTab() === 'all'"
                    (click)="activeTab.set('all')"
                >
                    Todas
                </button>
            </nav>

            <!-- Reviews Table -->
            @if (loading()) {
                <div class="loading">Cargando reseñas...</div>
            } @else if (currentReviews().length === 0) {
                <div class="empty-state">
                    <p>No hay reseñas en esta categoría.</p>
                </div>
            } @else {
                <div class="table-container">
                    <table class="reviews-table">
                        <thead>
                            <tr>
                                <th>Autor</th>
                                <th>Reseña</th>
                                <th>Estrellas</th>
                                <th>Estado</th>
                                <th>Home</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for (review of currentReviews(); track review.id) {
                                <tr>
                                    <td class="author">{{ review.author }}</td>
                                    <td class="text" [title]="review.text">
                                        {{ truncateText(review.text, 60) }}
                                    </td>
                                    <td class="stars">
                                        @for (star of getStars(review.stars); track $index) {
                                            ⭐
                                        }
                                    </td>
                                    <td>
                                        <span class="status-badge" [class]="review.status">
                                            {{ getStatusLabel(review.status) }}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            class="btn-featured"
                                            [class.active]="review.is_featured"
                                            (click)="toggleFeatured(review)"
                                            [title]="review.is_featured ? 'Quitar del home' : (canToggleFeatured(review) ? 'Mostrar en home' : 'Máximo 3 en home')"
                                            [disabled]="review.status !== 'approved' || !canToggleFeatured(review)"
                                        >
                                            {{ review.is_featured ? '⭐' : '☆' }}
                                        </button>
                                    </td>
                                    <td class="date">{{ formatDate(review.created_at) }}</td>
                                    <td class="actions">
                                        @if (review.status !== 'approved') {
                                            <button
                                                class="btn-action approve"
                                                (click)="updateStatus(review.id, 'approved')"
                                                title="Aprobar"
                                            >
                                                ✓
                                            </button>
                                        }
                                        @if (review.status !== 'rejected') {
                                            <button
                                                class="btn-action reject"
                                                (click)="updateStatus(review.id, 'rejected')"
                                                title="Rechazar"
                                            >
                                                ✕
                                            </button>
                                        }
                                        <button
                                            class="btn-action delete"
                                            (click)="deleteReview(review.id)"
                                            title="Eliminar"
                                        >
                                            🗑
                                        </button>
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            }
        </div>
    `,
    styles: [`
        .reviews-admin {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2rem;
        }

        .page-header h1 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }

        .subtitle {
            color: #888;
        }

        .btn-add {
            background: linear-gradient(135deg, #00d9ff, #0099ff);
            color: #000;
            border: none;
            padding: 0.75rem 1.25rem;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-add:hover {
            transform: translateY(-2px);
        }

        /* Add Form */
        .add-form-section {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }

        .add-form-section h2 {
            font-size: 1.25rem;
            margin-bottom: 1.25rem;
        }

        .add-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 1rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .form-group.small {
            width: 180px;
        }

        .form-group label {
            font-weight: 500;
            color: #ccc;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            background: #0a0a0a;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 0.75rem;
            color: #fff;
            font-size: 1rem;
        }

        .form-group textarea {
            resize: vertical;
        }

        .btn-save {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: #fff;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
            align-self: flex-start;
        }

        .btn-save:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Tabs */
        .tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid #333;
            padding-bottom: 0.5rem;
        }

        .tab {
            background: transparent;
            border: none;
            color: #888;
            padding: 0.75rem 1.25rem;
            font-size: 0.95rem;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .tab:hover {
            color: #fff;
            background: #1a1a1a;
        }

        .tab.active {
            color: #00d9ff;
            background: rgba(0, 217, 255, 0.1);
        }

        .badge {
            background: #ef4444;
            color: #fff;
            font-size: 0.75rem;
            padding: 0.125rem 0.5rem;
            border-radius: 10px;
            font-weight: 600;
        }

        /* Table */
        .table-container {
            overflow-x: auto;
        }

        .reviews-table {
            width: 100%;
            border-collapse: collapse;
            background: #1a1a1a;
            border-radius: 8px;
            overflow: hidden;
        }

        .reviews-table th,
        .reviews-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #333;
        }

        .reviews-table th {
            background: #141414;
            color: #888;
            font-weight: 500;
            font-size: 0.875rem;
            text-transform: uppercase;
        }

        .reviews-table td.author {
            font-weight: 600;
            color: #00d9ff;
        }

        .reviews-table td.text {
            color: #ccc;
            max-width: 300px;
        }

        .reviews-table td.stars {
            font-size: 0.875rem;
        }

        .reviews-table td.date {
            color: #888;
            font-size: 0.875rem;
        }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-badge.pending {
            background: rgba(251, 191, 36, 0.2);
            color: #fbbf24;
        }

        .status-badge.approved {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
        }

        .status-badge.rejected {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }

        .actions {
            display: flex;
            gap: 0.5rem;
        }

        .btn-action {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .btn-action.approve {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
        }

        .btn-action.approve:hover {
            background: rgba(34, 197, 94, 0.4);
        }

        .btn-action.reject {
            background: rgba(251, 191, 36, 0.2);
            color: #fbbf24;
        }

        .btn-action.reject:hover {
            background: rgba(251, 191, 36, 0.4);
        }

        .btn-action.delete {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }

        .btn-action.delete:hover {
            background: rgba(239, 68, 68, 0.4);
        }

        .btn-featured {
            background: transparent;
            border: 1px solid #333;
            border-radius: 6px;
            width: 32px;
            height: 32px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s;
        }

        .btn-featured:hover:not(:disabled) {
            border-color: #fbbf24;
        }

        .btn-featured.active {
            background: rgba(251, 191, 36, 0.2);
            border-color: #fbbf24;
        }

        .btn-featured:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        .loading,
        .empty-state {
            text-align: center;
            padding: 3rem;
            color: #888;
            background: #1a1a1a;
            border-radius: 8px;
        }

        @media (max-width: 768px) {
            .reviews-admin {
                padding: 1rem;
            }

            .page-header {
                flex-direction: column;
                gap: 1rem;
            }

            .form-row {
                grid-template-columns: 1fr;
            }

            .form-group.small {
                width: 100%;
            }

            .tabs {
                flex-wrap: wrap;
            }
        }
    `]
})
export class ReviewListComponent implements OnInit {
    readonly reviewsService = inject(ReviewsService);
    private readonly toast = inject(ToastService);

    readonly loading = signal(true);
    readonly saving = signal(false);
    readonly showAddForm = signal(false);
    readonly activeTab = signal<TabType>('all');

    newReview = {
        author: '',
        text: '',
        stars: 5
    };

    readonly currentReviews = computed(() => {
        const tab = this.activeTab();
        switch (tab) {
            case 'pending':
                return this.reviewsService.pendingReviews();
            case 'approved':
                return this.reviewsService.approvedReviews();
            case 'rejected':
                return this.reviewsService.rejectedReviews();
            case 'all':
            default:
                return [
                    ...this.reviewsService.pendingReviews(),
                    ...this.reviewsService.approvedReviews(),
                    ...this.reviewsService.rejectedReviews()
                ];
        }
    });

    readonly featuredCount = computed(() =>
        this.reviewsService.approvedReviews().filter(r => r.is_featured).length
    );

    canToggleFeatured(review: DbReview): boolean {
        // Can always unfeatured
        if (review.is_featured) return true;
        // Can only feature if less than 3 are featured
        return this.featuredCount() < 3;
    }

    async ngOnInit(): Promise<void> {
        this.loading.set(true);
        try {
            await this.reviewsService.loadAllReviews();
        } finally {
            this.loading.set(false);
        }
    }

    async onCreateReview(): Promise<void> {
        if (!this.newReview.author.trim() || !this.newReview.text.trim()) {
            this.toast.error('Por favor completa todos los campos');
            return;
        }

        this.saving.set(true);
        try {
            const result = await this.reviewsService.createReview({
                author: this.newReview.author.trim(),
                text: this.newReview.text.trim(),
                stars: Number(this.newReview.stars),
                status: 'approved'
            });

            if (result) {
                this.toast.success('Reseña creada correctamente');
                this.newReview = { author: '', text: '', stars: 5 };
                this.showAddForm.set(false);
            } else {
                this.toast.error('Error al crear la reseña');
            }
        } finally {
            this.saving.set(false);
        }
    }

    async updateStatus(id: string, status: ReviewStatus): Promise<void> {
        const success = await this.reviewsService.updateReviewStatus(id, status);
        if (success) {
            this.toast.success(`Reseña ${status === 'approved' ? 'aprobada' : 'rechazada'}`);
        } else {
            this.toast.error('Error al actualizar el estado');
        }
    }

    async deleteReview(id: string): Promise<void> {
        if (!confirm('¿Estás seguro de eliminar esta reseña?')) return;

        const success = await this.reviewsService.deleteReview(id);
        if (success) {
            this.toast.success('Reseña eliminada');
        } else {
            this.toast.error('Error al eliminar la reseña');
        }
    }

    async toggleFeatured(review: DbReview): Promise<void> {
        const newValue = !review.is_featured;
        const success = await this.reviewsService.toggleFeatured(review.id, newValue);
        if (success) {
            this.toast.success(newValue ? 'Reseña destacada en home' : 'Reseña quitada del home');
        } else {
            this.toast.error('Error al actualizar');
        }
    }

    getStars(count: number): number[] {
        return Array(count).fill(0);
    }

    truncateText(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    getStatusLabel(status: ReviewStatus): string {
        const labels: Record<ReviewStatus, string> = {
            pending: 'Pendiente',
            approved: 'Aprobada',
            rejected: 'Rechazada'
        };
        return labels[status];
    }
}
