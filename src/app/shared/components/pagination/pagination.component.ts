import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-pagination',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (totalPages() > 1) {
            <div class="pagination">
                <button 
                    class="page-btn"
                    [disabled]="currentPage() === 1"
                    (click)="goToPage(1)"
                    title="Primera página"
                >
                    ««
                </button>
                <button 
                    class="page-btn"
                    [disabled]="currentPage() === 1"
                    (click)="goToPage(currentPage() - 1)"
                    title="Anterior"
                >
                    «
                </button>

                @for (page of visiblePages(); track page) {
                    @if (page === -1) {
                        <span class="ellipsis">...</span>
                    } @else {
                        <button 
                            class="page-btn"
                            [class.active]="page === currentPage()"
                            (click)="goToPage(page)"
                        >
                            {{ page }}
                        </button>
                    }
                }

                <button 
                    class="page-btn"
                    [disabled]="currentPage() === totalPages()"
                    (click)="goToPage(currentPage() + 1)"
                    title="Siguiente"
                >
                    »
                </button>
                <button 
                    class="page-btn"
                    [disabled]="currentPage() === totalPages()"
                    (click)="goToPage(totalPages())"
                    title="Última página"
                >
                    »»
                </button>

                <span class="page-info">
                    {{ startItem() }}-{{ endItem() }} de {{ total() }}
                </span>
            </div>
        }
    `,
    styles: [`
        .pagination {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 20px 0;
        }

        .page-btn {
            min-width: 36px;
            height: 36px;
            padding: 0 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.05);
            color: rgba(255, 255, 255, 0.7);
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border-color: rgba(255, 255, 255, 0.2);
        }

        .page-btn.active {
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            border-color: transparent;
            color: #000;
            font-weight: 600;
        }

        .page-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        .ellipsis {
            color: rgba(255, 255, 255, 0.5);
            padding: 0 4px;
        }

        .page-info {
            margin-left: 16px;
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
        }

        @media (max-width: 640px) {
            .pagination {
                flex-wrap: wrap;
                gap: 6px;
            }

            .page-btn {
                min-width: 32px;
                height: 32px;
                padding: 0 8px;
                font-size: 12px;
            }

            .page-info {
                width: 100%;
                text-align: center;
                margin-left: 0;
                margin-top: 8px;
            }
        }
    `]
})
export class PaginationComponent {
    readonly currentPage = input.required<number>();
    readonly pageSize = input<number>(10);
    readonly total = input.required<number>();
    readonly pageChange = output<number>();

    readonly totalPages = computed(() =>
        Math.ceil(this.total() / this.pageSize())
    );

    readonly startItem = computed(() =>
        (this.currentPage() - 1) * this.pageSize() + 1
    );

    readonly endItem = computed(() =>
        Math.min(this.currentPage() * this.pageSize(), this.total())
    );

    readonly visiblePages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        const pages: number[] = [];

        if (total <= 7) {
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (current > 3) {
                pages.push(-1); // Ellipsis
            }

            // Pages around current
            const start = Math.max(2, current - 1);
            const end = Math.min(total - 1, current + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (current < total - 2) {
                pages.push(-1); // Ellipsis
            }

            // Always show last page
            pages.push(total);
        }

        return pages;
    });

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
            this.pageChange.emit(page);
        }
    }
}
