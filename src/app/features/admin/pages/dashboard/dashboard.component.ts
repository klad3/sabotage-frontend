import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { DbProduct, DbOrder, DbSubscriber, DbDiscountCode } from '../../../../core/models/product.model';

interface DashboardStats {
    products: number;
    orders: number;
    subscribers: number;
    revenue: number;
}

@Component({
    selector: 'app-dashboard',
    imports: [],
    template: `
        <div class="dashboard">
            <div class="dashboard-header">
                <h1>Dashboard</h1>
                <p class="date">{{ formattedDate }}</p>
            </div>

            @if (loading()) {
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Cargando estadísticas...</p>
                </div>
            } @else {
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon products">👕</div>
                        <div class="stat-info">
                            <span class="stat-value">{{ stats().products }}</span>
                            <span class="stat-label">Productos</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon orders">📦</div>
                        <div class="stat-info">
                            <span class="stat-value">{{ stats().orders }}</span>
                            <span class="stat-label">Órdenes</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon subscribers">📧</div>
                        <div class="stat-info">
                            <span class="stat-value">{{ stats().subscribers }}</span>
                            <span class="stat-label">Suscriptores</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon revenue">💰</div>
                        <div class="stat-info">
                            <span class="stat-value">S/ {{ stats().revenue.toFixed(2) }}</span>
                            <span class="stat-label">Ingresos</span>
                        </div>
                    </div>
                </div>

                <div class="dashboard-sections">
                    <section class="section">
                        <h2>Órdenes Recientes</h2>
                        @if (recentOrders().length === 0) {
                            <div class="empty-state">
                                <p>No hay órdenes aún</p>
                            </div>
                        } @else {
                            <div class="orders-list">
                                @for (order of recentOrders(); track order.id) {
                                    <div class="order-item">
                                        <div class="order-info">
                                            <span class="order-number">#{{ order.order_number }}</span>
                                            <span class="order-customer">{{ order.customer_name }}</span>
                                        </div>
                                        <div class="order-meta">
                                            <span class="order-total">S/ {{ order.total.toFixed(2) }}</span>
                                            <span class="order-status" [class]="order.status">
                                                {{ getStatusLabel(order.status) }}
                                            </span>
                                        </div>
                                    </div>
                                }
                            </div>
                        }
                    </section>

                    <section class="section">
                        <h2>Acciones Rápidas</h2>
                        <div class="quick-actions">
                            <a href="/admin/products" class="action-card">
                                <span class="action-icon">➕</span>
                                <span>Nuevo Producto</span>
                            </a>
                            <a href="/admin/discount-codes" class="action-card">
                                <span class="action-icon">🏷️</span>
                                <span>Crear Descuento</span>
                            </a>
                            <a href="/admin/orders" class="action-card">
                                <span class="action-icon">📦</span>
                                <span>Ver Órdenes</span>
                            </a>
                        </div>
                    </section>
                </div>
            }
        </div>
    `,
    styles: [`
        .dashboard {
            max-width: 1400px;
            margin: 0 auto;
        }

        .dashboard-header {
            margin-bottom: 32px;
        }

        .dashboard-header h1 {
            font-size: 28px;
            font-weight: 700;
            color: #fff;
            margin: 0 0 8px;
        }

        .date {
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
        }

        .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px;
            color: rgba(255, 255, 255, 0.6);
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: #feca57;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 16px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 32px;
        }

        .stat-card {
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 24px;
            display: flex;
            align-items: center;
            gap: 16px;
            transition: all 0.3s;
        }

        .stat-card:hover {
            border-color: rgba(254, 202, 87, 0.3);
            transform: translateY(-2px);
        }

        .stat-icon {
            width: 56px;
            height: 56px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
        }

        .stat-icon.products { background: rgba(99, 102, 241, 0.2); }
        .stat-icon.orders { background: rgba(16, 185, 129, 0.2); }
        .stat-icon.subscribers { background: rgba(244, 63, 94, 0.2); }
        .stat-icon.revenue { background: rgba(254, 202, 87, 0.2); }

        .stat-info {
            display: flex;
            flex-direction: column;
        }

        .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #fff;
        }

        .stat-label {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.5);
        }

        .dashboard-sections {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 24px;
        }

        .section {
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 24px;
        }

        .section h2 {
            font-size: 18px;
            font-weight: 600;
            color: #fff;
            margin: 0 0 20px;
        }

        .empty-state {
            text-align: center;
            padding: 40px;
            color: rgba(255, 255, 255, 0.4);
        }

        .orders-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .order-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            transition: background 0.2s;
        }

        .order-item:hover {
            background: rgba(255, 255, 255, 0.06);
        }

        .order-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .order-number {
            font-weight: 600;
            color: #feca57;
        }

        .order-customer {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
        }

        .order-meta {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .order-total {
            font-weight: 600;
            color: #fff;
        }

        .order-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }

        .order-status.pending {
            background: rgba(255, 193, 7, 0.2);
            color: #ffc107;
        }

        .order-status.confirmed {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
        }

        .order-status.shipped {
            background: rgba(99, 102, 241, 0.2);
            color: #6366f1;
        }

        .order-status.delivered {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
        }

        .order-status.cancelled {
            background: rgba(244, 63, 94, 0.2);
            color: #f43f5e;
        }

        .quick-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .action-card {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            color: #fff;
            text-decoration: none;
            transition: all 0.2s;
        }

        .action-card:hover {
            background: rgba(254, 202, 87, 0.1);
            transform: translateX(4px);
        }

        .action-icon {
            font-size: 20px;
        }

        @media (max-width: 1200px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .dashboard-sections {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
    private readonly supabase = inject(SupabaseService);

    readonly loading = signal(true);
    readonly stats = signal<DashboardStats>({
        products: 0,
        orders: 0,
        subscribers: 0,
        revenue: 0
    });
    readonly recentOrders = signal<DbOrder[]>([]);

    readonly formattedDate = new Date().toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    async ngOnInit(): Promise<void> {
        await this.loadDashboardData();
    }

    private async loadDashboardData(): Promise<void> {
        this.loading.set(true);

        try {
            const [products, orders, subscribers] = await Promise.all([
                this.supabase.getAll<DbProduct>('products'),
                this.supabase.getAll<DbOrder>('orders', {
                    orderBy: { column: 'created_at', ascending: false },
                    limit: 5
                }),
                this.supabase.getAll<DbSubscriber>('subscribers')
            ]);

            const allOrders = await this.supabase.getAll<DbOrder>('orders');
            const revenue = allOrders
                .filter(o => o.status !== 'cancelled')
                .reduce((sum, o) => sum + o.total, 0);

            this.stats.set({
                products: products.length,
                orders: allOrders.length,
                subscribers: subscribers.length,
                revenue
            });

            this.recentOrders.set(orders);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            this.loading.set(false);
        }
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            pending: 'Pendiente',
            confirmed: 'Confirmado',
            shipped: 'Enviado',
            delivered: 'Entregado',
            cancelled: 'Cancelado'
        };
        return labels[status] || status;
    }
}
