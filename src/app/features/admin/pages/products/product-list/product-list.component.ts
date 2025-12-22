import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../../core/services/supabase.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { DbProduct, DbCategory } from '../../../../../core/models/product.model';

@Component({
    selector: 'app-product-list',
    imports: [RouterLink, FormsModule],
    template: `
        <div class="product-list-page">
            <div class="page-header">
                <div class="header-left">
                    <h1>Productos</h1>
                    <span class="count">{{ products().length }} productos</span>
                </div>
                <a routerLink="new" class="btn-primary">
                    <span>➕</span> Nuevo Producto
                </a>
            </div>

            <div class="filters-bar">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Buscar productos..." 
                        [(ngModel)]="searchTerm"
                        (input)="filterProducts()"
                    >
                </div>
                <select [(ngModel)]="categoryFilter" (change)="filterProducts()">
                    <option value="">Todas las categorías</option>
                    @for (cat of categories(); track cat.id) {
                        <option [value]="cat.id">{{ cat.name }}</option>
                    }
                </select>
                <select [(ngModel)]="stockFilter" (change)="filterProducts()">
                    <option value="">Todo el stock</option>
                    <option value="in">En stock</option>
                    <option value="out">Agotado</option>
                </select>
            </div>

            @if (loading()) {
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Cargando productos...</p>
                </div>
            } @else if (filteredProducts().length === 0) {
                <div class="empty-state">
                    <span class="empty-icon">📦</span>
                    <h3>No hay productos</h3>
                    <p>Crea tu primer producto para comenzar</p>
                    <a routerLink="new" class="btn-primary">Crear Producto</a>
                </div>
            } @else {
                <div class="products-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Imagen</th>
                                <th>Nombre</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for (product of filteredProducts(); track product.id) {
                                <tr>
                                    <td class="image-cell">
                                        @if (product.image_url) {
                                            <img [src]="product.image_url" [alt]="product.name">
                                        } @else {
                                            <div class="no-image">📷</div>
                                        }
                                    </td>
                                    <td class="name-cell">
                                        <span class="product-name">{{ product.name }}</span>
                                        <span class="product-type">{{ product.type }}</span>
                                    </td>
                                    <td>{{ getCategoryName(product.category_id) }}</td>
                                    <td class="price-cell">S/ {{ product.price.toFixed(2) }}</td>
                                    <td>
                                        <span class="stock-badge" [class.in-stock]="product.in_stock" [class.out-of-stock]="!product.in_stock">
                                            {{ product.in_stock ? 'En stock' : 'Agotado' }}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="status-badge" [class.active]="product.is_active" [class.inactive]="!product.is_active">
                                            {{ product.is_active ? 'Activo' : 'Inactivo' }}
                                        </span>
                                    </td>
                                    <td class="actions-cell">
                                        <a [routerLink]="[product.id, 'edit']" class="btn-icon" title="Editar">
                                            ✏️
                                        </a>
                                        <button class="btn-icon delete" (click)="confirmDelete(product)" title="Eliminar">
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            }

            @if (showDeleteModal()) {
                <div class="modal-overlay" (click)="showDeleteModal.set(false)">
                    <div class="modal" (click)="$event.stopPropagation()">
                        <h3>¿Eliminar producto?</h3>
                        <p>Esta acción no se puede deshacer. El producto "{{ productToDelete()?.name }}" será eliminado permanentemente.</p>
                        <div class="modal-actions">
                            <button class="btn-secondary" (click)="showDeleteModal.set(false)">Cancelar</button>
                            <button class="btn-danger" (click)="deleteProduct()" [disabled]="deleting()">
                                {{ deleting() ? 'Eliminando...' : 'Eliminar' }}
                            </button>
                        </div>
                    </div>
                </div>
            }
        </div>
    `,
    styles: [`
        .product-list-page {
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

        .btn-primary {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            border: none;
            border-radius: 12px;
            color: #000;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(255, 107, 107, 0.3);
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

        .search-box input::placeholder {
            color: rgba(255, 255, 255, 0.4);
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
            margin: 0 0 24px;
        }

        .products-table {
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            overflow: hidden;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            text-align: left;
            padding: 16px;
            background: rgba(255, 255, 255, 0.03);
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        td {
            padding: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            color: #fff;
        }

        tr:hover td {
            background: rgba(255, 255, 255, 0.02);
        }

        .image-cell img {
            width: 48px;
            height: 48px;
            object-fit: cover;
            border-radius: 8px;
        }

        .no-image {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            font-size: 20px;
        }

        .name-cell .product-name,
        .name-cell .product-type {
            display: block;
        }

        .name-cell .product-type {
            margin-top: 4px;
        }

        .product-name {
            font-weight: 500;
            text-transform: uppercase;
        }

        .product-type {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
            text-transform: capitalize;
        }

        .price-cell {
            font-weight: 600;
            color: #feca57;
        }

        .stock-badge, .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }

        .stock-badge.in-stock {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
        }

        .stock-badge.out-of-stock {
            background: rgba(244, 63, 94, 0.2);
            color: #f43f5e;
        }

        .status-badge.active {
            background: rgba(16, 185, 129, 0.2);
            color: #10b981;
        }

        .status-badge.inactive {
            background: rgba(255, 193, 7, 0.2);
            color: #ffc107;
        }

        .actions-cell {
            white-space: nowrap;
        }

        .actions-cell a,
        .actions-cell button {
            display: inline-flex;
            vertical-align: middle;
            margin-right: 8px;
        }

        .actions-cell a:last-child,
        .actions-cell button:last-child {
            margin-right: 0;
        }

        .btn-icon {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
        }

        .btn-icon:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .btn-icon.delete:hover {
            background: rgba(244, 63, 94, 0.2);
        }

        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .modal {
            background: #1a1a1a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 32px;
            max-width: 400px;
            width: 90%;
        }

        .modal h3 {
            color: #fff;
            margin: 0 0 16px;
        }

        .modal p {
            color: rgba(255, 255, 255, 0.7);
            margin: 0 0 24px;
            line-height: 1.6;
        }

        .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }

        .btn-secondary {
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 12px;
            color: #fff;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .btn-danger {
            padding: 12px 24px;
            background: #f43f5e;
            border: none;
            border-radius: 12px;
            color: #fff;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-danger:hover:not(:disabled) {
            background: #e11d48;
        }

        .btn-danger:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        @media (max-width: 1024px) {
            .filters-bar {
                flex-wrap: wrap;
            }

            .search-box {
                width: 100%;
            }
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

            .filters-bar select {
                width: 100%;
                min-width: auto;
                border-radius: 8px;
                -webkit-appearance: menulist;
                appearance: menulist;
            }

            .products-table {
                overflow-x: auto;
            }

            table {
                min-width: 800px;
            }

            th, td {
                padding: 12px 8px;
                font-size: 13px;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
    private readonly supabase = inject(SupabaseService);
    private readonly toast = inject(ToastService);

    readonly loading = signal(true);
    readonly products = signal<DbProduct[]>([]);
    readonly filteredProducts = signal<DbProduct[]>([]);
    readonly categories = signal<DbCategory[]>([]);
    readonly showDeleteModal = signal(false);
    readonly productToDelete = signal<DbProduct | null>(null);
    readonly deleting = signal(false);

    searchTerm = '';
    categoryFilter = '';
    stockFilter = '';

    async ngOnInit(): Promise<void> {
        await this.loadData();
    }

    private async loadData(): Promise<void> {
        this.loading.set(true);
        try {
            const [products, categories] = await Promise.all([
                this.supabase.getAll<DbProduct>('products', {
                    orderBy: { column: 'created_at', ascending: false }
                }),
                this.supabase.getAll<DbCategory>('categories')
            ]);

            this.products.set(products);
            this.filteredProducts.set(products);
            this.categories.set(categories);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            this.loading.set(false);
        }
    }

    filterProducts(): void {
        let filtered = this.products();

        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.description?.toLowerCase().includes(term)
            );
        }

        if (this.categoryFilter) {
            filtered = filtered.filter(p => p.category_id === this.categoryFilter);
        }

        if (this.stockFilter) {
            filtered = filtered.filter(p =>
                this.stockFilter === 'in' ? p.in_stock : !p.in_stock
            );
        }

        this.filteredProducts.set(filtered);
    }

    getCategoryName(categoryId: string | null): string {
        if (!categoryId) return '-';
        const category = this.categories().find(c => c.id === categoryId);
        return category?.name || '-';
    }

    confirmDelete(product: DbProduct): void {
        this.productToDelete.set(product);
        this.showDeleteModal.set(true);
    }

    async deleteProduct(): Promise<void> {
        const product = this.productToDelete();
        if (!product) return;

        this.deleting.set(true);
        try {
            const success = await this.supabase.delete('products', product.id);
            if (success) {
                this.products.update(products =>
                    products.filter(p => p.id !== product.id)
                );
                this.filterProducts();
                this.showDeleteModal.set(false);
                this.toast.success('Producto eliminado correctamente');
            } else {
                this.toast.error('Error al eliminar el producto');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            this.toast.error('Error al eliminar el producto');
        } finally {
            this.deleting.set(false);
        }
    }
}
