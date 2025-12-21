import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../../core/services/supabase.service';
import { DbOrder, OrderStatus } from '../../../../../core/models/product.model';

@Component({
    selector: 'app-order-list',
    imports: [FormsModule],
    template: `
        <div class="order-list-page">
            <div class="page-header">
                <div class="header-left">
                    <h1>Órdenes</h1>
                    <span class="count">{{ orders().length }} órdenes</span>
                </div>
            </div>

            <div class="filters-bar">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Buscar por número o cliente..." 
                        [(ngModel)]="searchTerm"
                        (input)="filterOrders()"
                    >
                </div>
                <select [(ngModel)]="statusFilter" (change)="filterOrders()">
                    <option value="">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="shipped">Enviado</option>
                    <option value="delivered">Entregado</option>
                    <option value="cancelled">Cancelado</option>
                </select>
            </div>

            @if (loading()) {
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Cargando órdenes...</p>
                </div>
            } @else if (filteredOrders().length === 0) {
                <div class="empty-state">
                    <span class="empty-icon">📦</span>
                    <h3>No hay órdenes</h3>
                    <p>Las órdenes de compra aparecerán aquí</p>
                </div>
            } @else {
                <div class="orders-list">
                    @for (order of filteredOrders(); track order.id) {
                        <div class="order-card" (click)="selectOrder(order)">
                            <div class="order-header">
                                <span class="order-number">#{{ order.order_number }}</span>
                                <span class="order-status" [class]="order.status">
                                    {{ getStatusLabel(order.status) }}
                                </span>
                            </div>
                            <div class="order-body">
                                <div class="customer-info">
                                    <span class="customer-name">{{ order.customer_name }}</span>
                                    <span class="customer-phone">📱 {{ order.customer_phone }}</span>
                                </div>
                                <div class="order-meta">
                                    <span class="items-count">{{ order.items.length }} productos</span>
                                    <span class="order-total">S/ {{ order.total.toFixed(2) }}</span>
                                </div>
                            </div>
                            <div class="order-footer">
                                <span class="order-date">{{ formatDate(order.created_at) }}</span>
                            </div>
                        </div>
                    }
                </div>
            }

            @if (selectedOrder()) {
                <div class="modal-overlay" (click)="selectedOrder.set(null)">
                    <div class="modal order-detail" (click)="$event.stopPropagation()">
                        <div class="modal-header">
                            <h3>Orden #{{ selectedOrder()?.order_number }}</h3>
                            <button class="close-btn" (click)="selectedOrder.set(null)">✕</button>
                        </div>

                        <div class="detail-section">
                            <h4>Cliente</h4>
                            <p><strong>{{ selectedOrder()?.customer_name }}</strong></p>
                            <p>📱 {{ selectedOrder()?.customer_phone }}</p>
                            @if (selectedOrder()?.customer_email) {
                                <p>📧 {{ selectedOrder()?.customer_email }}</p>
                            }
                            @if (selectedOrder()?.shipping_address) {
                                <p>📍 {{ selectedOrder()?.shipping_address }}</p>
                            }
                        </div>

                        <div class="detail-section">
                            <h4>Productos</h4>
                            <div class="items-list">
                                @for (item of selectedOrder()?.items || []; track item.id) {
                                    <div class="item-row">
                                        <span class="item-name">{{ item.name }} ({{ item.size }})</span>
                                        <span class="item-qty">x{{ item.quantity }}</span>
                                        <span class="item-price">S/ {{ (item.price * item.quantity).toFixed(2) }}</span>
                                    </div>
                                }
                            </div>
                        </div>

                        <div class="detail-section totals">
                            <div class="total-row">
                                <span>Subtotal</span>
                                <span>S/ {{ formatAmount(selectedOrder()?.subtotal) }}</span>
                            </div>
                            <div class="total-row">
                                <span>Envío</span>
                                <span>S/ {{ formatAmount(selectedOrder()?.shipping) }}</span>
                            </div>
                            @if (selectedOrder()?.discount_code) {
                                <div class="total-row discount">
                                    <span>Descuento ({{ selectedOrder()?.discount_code }})</span>
                                    <span>- S/ {{ formatAmount(selectedOrder()?.discount_amount) }}</span>
                                </div>
                            }
                            <div class="total-row final">
                                <span>Total</span>
                                <span>S/ {{ formatAmount(selectedOrder()?.total) }}</span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Cambiar Estado</h4>
                            <select [(ngModel)]="newStatus" class="status-select">
                                <option value="pending">Pendiente</option>
                                <option value="confirmed">Confirmado</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                            <button 
                                class="btn-primary update-status" 
                                (click)="updateOrderStatus()"
                                [disabled]="updating() || newStatus === selectedOrder()?.status"
                            >
                                {{ updating() ? 'Actualizando...' : 'Actualizar Estado' }}
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    `,
    styles: [`
        .order-list-page {
            max-width: 1400px;
            margin: 0 auto;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }

        .header-left h1 {
            font-size: 28px;
            font-weight: 700;
            color: #fff;
            margin: 0;
        }

        .count {
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
        }

        .filters-bar {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
        }

        .search-box {
            flex: 1;
            position: relative;
        }

        .search-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
        }

        .search-box input {
            width: 100%;
            padding: 12px 12px 12px 48px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
        }

        .search-box input:focus {
            outline: none;
            border-color: #feca57;
        }

        .filters-bar select {
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
            min-width: 180px;
            cursor: pointer;
        }

        .filters-bar select:focus {
            outline: none;
            border-color: #feca57;
        }

        .filters-bar select option {
            background: #1a1a1a;
            color: #fff;
            padding: 12px;
        }

        .loading-state, .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px;
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
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

        .empty-icon {
            font-size: 64px;
            margin-bottom: 16px;
        }

        .empty-state h3 {
            color: #fff;
            margin: 0 0 8px;
        }

        .empty-state p {
            color: rgba(255, 255, 255, 0.5);
            margin: 0;
        }

        .orders-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
        }

        .order-card {
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s;
        }

        .order-card:hover {
            border-color: rgba(254, 202, 87, 0.3);
            transform: translateY(-2px);
        }

        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .order-number {
            font-weight: 700;
            color: #feca57;
            font-size: 16px;
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
            background: rgba(99, 102, 241, 0.2);
            color: #6366f1;
        }

        .order-status.shipped {
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
        }

        .order-status.delivered {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
        }

        .order-status.cancelled {
            background: rgba(244, 63, 94, 0.2);
            color: #f43f5e;
        }

        .order-body {
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
        }

        .customer-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .customer-name {
            font-weight: 500;
            color: #fff;
        }

        .customer-phone {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.6);
        }

        .order-meta {
            text-align: right;
        }

        .items-count {
            display: block;
            font-size: 13px;
            color: rgba(255, 255, 255, 0.5);
        }

        .order-total {
            font-size: 18px;
            font-weight: 700;
            color: #fff;
        }

        .order-footer {
            padding-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .order-date {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.4);
        }

        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
        }

        .modal.order-detail {
            background: #1a1a1a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            max-width: 560px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            position: sticky;
            top: 0;
            background: #1a1a1a;
        }

        .modal-header h3 {
            color: #feca57;
            margin: 0;
            font-size: 20px;
        }

        .close-btn {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 8px;
            color: #fff;
            cursor: pointer;
        }

        .detail-section {
            padding: 20px 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .detail-section:last-child {
            border-bottom: none;
        }

        .detail-section h4 {
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
            text-transform: uppercase;
            margin: 0 0 12px;
        }

        .detail-section p {
            color: #fff;
            margin: 4px 0;
        }

        .items-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .item-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0;
        }

        .item-name {
            flex: 1;
            color: #fff;
        }

        .item-qty {
            color: rgba(255, 255, 255, 0.5);
        }

        .item-price {
            font-weight: 500;
            color: #fff;
        }

        .totals {
            background: rgba(255, 255, 255, 0.02);
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            color: rgba(255, 255, 255, 0.7);
        }

        .total-row.discount {
            color: #10b981;
        }

        .total-row.final {
            font-size: 18px;
            font-weight: 700;
            color: #fff;
            padding-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .status-select {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
            margin-bottom: 12px;
            cursor: pointer;
        }

        .status-select:focus {
            outline: none;
            border-color: #feca57;
        }

        .status-select option {
            background: #1a1a1a;
            color: #fff;
            padding: 12px;
        }

        .btn-primary.update-status {
            width: 100%;
            padding: 12px 24px;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            border: none;
            border-radius: 12px;
            color: #000;
            font-weight: 600;
            cursor: pointer;
        }

        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        @media (max-width: 768px) {
            .page-header {
                flex-direction: column;
                gap: 16px;
                align-items: flex-start;
            }

            .page-header h1 {
                font-size: 24px;
            }

            .filters-bar {
                flex-direction: column;
            }

            .orders-list {
                overflow-x: auto;
            }

            table {
                min-width: 700px;
            }

            .modal {
                max-height: 90vh;
                overflow-y: auto;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderListComponent implements OnInit {
    private readonly supabase = inject(SupabaseService);

    readonly loading = signal(true);
    readonly updating = signal(false);
    readonly orders = signal<DbOrder[]>([]);
    readonly filteredOrders = signal<DbOrder[]>([]);
    readonly selectedOrder = signal<DbOrder | null>(null);

    searchTerm = '';
    statusFilter = '';
    newStatus: OrderStatus = 'pending';

    async ngOnInit(): Promise<void> {
        await this.loadOrders();
    }

    private async loadOrders(): Promise<void> {
        this.loading.set(true);
        try {
            const orders = await this.supabase.getAll<DbOrder>('orders', {
                orderBy: { column: 'created_at', ascending: false }
            });
            this.orders.set(orders);
            this.filteredOrders.set(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            this.loading.set(false);
        }
    }

    filterOrders(): void {
        let filtered = this.orders();

        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(o =>
                o.order_number.toLowerCase().includes(term) ||
                o.customer_name.toLowerCase().includes(term)
            );
        }

        if (this.statusFilter) {
            filtered = filtered.filter(o => o.status === this.statusFilter);
        }

        this.filteredOrders.set(filtered);
    }

    selectOrder(order: DbOrder): void {
        this.selectedOrder.set(order);
        this.newStatus = order.status;
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

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatAmount(value: number | undefined | null): string {
        return (value ?? 0).toFixed(2);
    }

    async updateOrderStatus(): Promise<void> {
        const order = this.selectedOrder();
        if (!order || this.newStatus === order.status) return;

        this.updating.set(true);
        try {
            await this.supabase.update<DbOrder>('orders', order.id, {
                status: this.newStatus
            });
            await this.loadOrders();
            this.selectedOrder.update(o => o ? { ...o, status: this.newStatus } : null);
        } catch (error) {
            console.error('Error updating order status:', error);
        } finally {
            this.updating.set(false);
        }
    }
}
