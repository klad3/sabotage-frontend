import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DbReview, CreateReviewPayload, ReviewStatus } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
    private readonly supabase = inject(SupabaseService);

    // Cached reviews
    private readonly allReviews = signal<DbReview[]>([]);
    private loaded = false;

    // Computed signals for different views
    readonly approvedReviews = computed(() =>
        this.allReviews()
            .filter(r => r.status === 'approved')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    );

    readonly pendingReviews = computed(() =>
        this.allReviews()
            .filter(r => r.status === 'pending')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    );

    readonly rejectedReviews = computed(() =>
        this.allReviews()
            .filter(r => r.status === 'rejected')
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    );

    // ============================================
    // Public Methods
    // ============================================

    /**
     * Get all approved reviews (public)
     */
    async getApprovedReviews(): Promise<DbReview[]> {
        const reviews = await this.supabase.getAll<DbReview>('reviews', {
            filters: [{ column: 'status', operator: 'eq', value: 'approved' }],
            orderBy: { column: 'created_at', ascending: false }
        });
        return reviews;
    }

    /**
     * Get featured reviews for home page (max 3)
     * Falls back to latest 3 approved if none featured
     */
    async getFeaturedReviews(): Promise<DbReview[]> {
        // First try to get featured reviews
        const featured = await this.supabase.getAll<DbReview>('reviews', {
            filters: [
                { column: 'status', operator: 'eq', value: 'approved' },
                { column: 'is_featured', operator: 'eq', value: true }
            ],
            orderBy: { column: 'created_at', ascending: false },
            limit: 3
        });

        if (featured.length > 0) {
            return featured;
        }

        // Fallback to latest 3 approved
        return this.supabase.getAll<DbReview>('reviews', {
            filters: [{ column: 'status', operator: 'eq', value: 'approved' }],
            orderBy: { column: 'created_at', ascending: false },
            limit: 3
        });
    }

    /**
     * Submit a new review (public) - always pending status
     */
    async submitReview(review: Omit<CreateReviewPayload, 'status'>): Promise<DbReview | null> {
        const payload: CreateReviewPayload = {
            ...review,
            status: 'pending'
        };

        const result = await this.supabase.insert<DbReview>('reviews', payload);

        if (result) {
            // Update local cache
            this.allReviews.update(reviews => [...reviews, result]);
        }

        return result;
    }

    // ============================================
    // Admin Methods
    // ============================================

    /**
     * Load all reviews (admin)
     */
    async loadAllReviews(): Promise<void> {
        if (this.loaded) return;

        const reviews = await this.supabase.getAll<DbReview>('reviews', {
            orderBy: { column: 'created_at', ascending: false }
        });

        this.allReviews.set(reviews);
        this.loaded = true;
    }

    /**
     * Force reload reviews
     */
    async reload(): Promise<void> {
        this.loaded = false;
        await this.loadAllReviews();
    }

    /**
     * Create a review directly (admin) - can set any status
     */
    async createReview(review: CreateReviewPayload): Promise<DbReview | null> {
        const payload: CreateReviewPayload = {
            ...review,
            status: review.status ?? 'approved'
        };

        const result = await this.supabase.insert<DbReview>('reviews', payload);

        if (result) {
            this.allReviews.update(reviews => [result, ...reviews]);
        }

        return result;
    }

    /**
     * Update review status (admin)
     */
    async updateReviewStatus(id: string, status: ReviewStatus): Promise<boolean> {
        const result = await this.supabase.update<DbReview>('reviews', id, { status });

        if (result) {
            this.allReviews.update(reviews =>
                reviews.map(r => r.id === id ? { ...r, status } : r)
            );
            return true;
        }

        return false;
    }

    /**
     * Toggle featured status (admin)
     */
    async toggleFeatured(id: string, isFeatured: boolean): Promise<boolean> {
        const result = await this.supabase.update<DbReview>('reviews', id, { is_featured: isFeatured });

        if (result) {
            this.allReviews.update(reviews =>
                reviews.map(r => r.id === id ? { ...r, is_featured: isFeatured } : r)
            );
            return true;
        }

        return false;
    }

    /**
     * Delete a review (admin)
     */
    async deleteReview(id: string): Promise<boolean> {
        const success = await this.supabase.delete('reviews', id);

        if (success) {
            this.allReviews.update(reviews => reviews.filter(r => r.id !== id));
        }

        return success;
    }
}
