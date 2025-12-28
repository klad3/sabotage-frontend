import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { SupabaseService } from '../../../../../core/services/supabase.service';
import { DbProduct, DbCategory, DbProductColor, DbProductImage } from '../../../../../core/models/product.model';

interface ColorFormData {
    id?: string;
    color_name: string;
    hex_code: string;
    is_default: boolean;
    in_stock: boolean;
    images: ImageFormData[];
    newImages: File[];
}

interface ImageFormData {
    id: string;
    image_url: string;
    is_primary: boolean;
    display_order: number;
}

@Component({
    selector: 'app-product-form',
    imports: [ReactiveFormsModule, RouterLink],
    template: `
        <div class="product-form-page">
            <div class="page-header">
                <a routerLink="/admin/products" class="back-link">← Volver a productos</a>
                <h1>{{ isEditMode() ? 'Editar Producto' : 'Nuevo Producto' }}</h1>
            </div>

            @if (loading()) {
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Cargando...</p>
                </div>
            } @else {
                <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="form-container">
                    <div class="form-grid">
                        <div class="form-main">
                            <section class="form-section">
                                <h2>Información Básica</h2>
                                
                                <div class="form-group">
                                    <label for="name">Nombre del Producto *</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        formControlName="name"
                                        placeholder="Ej: Polo Oversize Negro"
                                    >
                                    @if (productForm.get('name')?.hasError('required') && productForm.get('name')?.touched) {
                                        <span class="field-error">El nombre es requerido</span>
                                    }
                                </div>

                                <div class="form-group">
                                    <label for="description">Descripción</label>
                                    <textarea 
                                        id="description" 
                                        formControlName="description"
                                        rows="4"
                                        placeholder="Describe el producto..."
                                    ></textarea>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="price">Precio (S/) *</label>
                                        <input 
                                            type="number" 
                                            id="price" 
                                            formControlName="price"
                                            step="0.01"
                                            min="0"
                                            placeholder="49.90"
                                        >
                                        @if (productForm.get('price')?.hasError('required') && productForm.get('price')?.touched) {
                                            <span class="field-error">El precio es requerido</span>
                                        }
                                    </div>

                                    <div class="form-group">
                                        <label for="category_id">Categoría</label>
                                        <select id="category_id" formControlName="category_id">
                                            <option value="">Seleccionar...</option>
                                            @for (cat of categories(); track cat.id) {
                                                <option [value]="cat.id">{{ cat.name }}</option>
                                            }
                                        </select>
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="type">Tipo *</label>
                                        <select id="type" formControlName="type">
                                            <option value="simple">Simple</option>
                                            <option value="personalizado">Personalizado</option>
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label for="theme">Temática</label>
                                        <input 
                                            type="text" 
                                            id="theme" 
                                            formControlName="theme"
                                            placeholder="Ej: anime, urbano, gaming"
                                        >
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Tallas Disponibles</label>
                                    <div class="sizes-grid">
                                        @for (size of availableSizes; track size) {
                                            <label class="size-checkbox">
                                                <input 
                                                    type="checkbox" 
                                                    [checked]="selectedSizes().includes(size)"
                                                    (change)="toggleSize(size)"
                                                >
                                                <span>{{ size }}</span>
                                            </label>
                                        }
                                    </div>
                                </div>
                            </section>

                            <!-- Color Variants Section -->
                            <section class="form-section">
                                <div class="section-header">
                                    <h2>Colores y Variantes</h2>
                                    <button type="button" class="btn-add" (click)="addColor()">
                                        + Agregar Color
                                    </button>
                                </div>

                                @if (colorVariants().length === 0) {
                                    <div class="empty-colors">
                                        <p>No hay colores definidos. Agrega al menos un color con sus imágenes.</p>
                                    </div>
                                }

                                @for (color of colorVariants(); track color.id || $index; let i = $index) {
                                    <div class="color-card" [class.is-default]="color.is_default">
                                        <div class="color-header">
                                            <div class="color-preview" [style.background-color]="color.hex_code || '#808080'"></div>
                                            <input 
                                                type="text" 
                                                [value]="color.color_name"
                                                (input)="updateColorName(i, $event)"
                                                placeholder="Nombre del color"
                                                class="color-name-input"
                                            >
                                            <input 
                                                type="color" 
                                                [value]="color.hex_code || '#808080'"
                                                (input)="updateColorHex(i, $event)"
                                                class="color-picker"
                                                title="Seleccionar color"
                                            >
                                            <label class="toggle-small">
                                                <input 
                                                    type="checkbox" 
                                                    [checked]="color.in_stock"
                                                    (change)="toggleColorStock(i)"
                                                >
                                                <span>En Stock</span>
                                            </label>
                                            <button 
                                                type="button" 
                                                class="btn-default"
                                                [disabled]="color.is_default"
                                                (click)="setDefaultColor(i)"
                                                title="Establecer como color por defecto"
                                            >
                                                {{ color.is_default ? '★ Por defecto' : '☆ Hacer default' }}
                                            </button>
                                            <button 
                                                type="button" 
                                                class="btn-remove-color"
                                                (click)="removeColor(i)"
                                                title="Eliminar color"
                                                [disabled]="colorVariants().length === 1"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <!-- Images for this color -->
                                        <div class="color-images">
                                            <div class="images-grid">
                                                @for (img of color.images; track img.id; let j = $index) {
                                                    <div class="image-thumb" [class.is-primary]="img.is_primary">
                                                        <img [src]="img.image_url" alt="Imagen">
                                                        <div class="image-actions">
                                                            <button 
                                                                type="button"
                                                                (click)="setPrimaryImage(i, j)"
                                                                [disabled]="img.is_primary"
                                                                title="Hacer imagen principal"
                                                            >
                                                                ★
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                (click)="removeImage(i, j)"
                                                                title="Eliminar imagen"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                }
                                                <!-- Upload new images -->
                                                <div class="image-upload-thumb" (click)="triggerImageUpload(i)">
                                                    <span>+</span>
                                                    <small>Agregar</small>
                                                </div>
                                                <input 
                                                    #imageInput
                                                    type="file" 
                                                    accept="image/*"
                                                    multiple
                                                    (change)="onImagesSelected(i, $event)"
                                                    [attr.data-color-index]="i"
                                                    style="display: none"
                                                >
                                            </div>
                                            @if (color.newImages.length > 0) {
                                                <p class="pending-uploads">{{ color.newImages.length }} imagen(es) pendiente(s) de subir</p>
                                            }
                                        </div>
                                    </div>
                                }
                            </section>
                        </div>

                        <div class="form-sidebar">
                            <section class="form-section">
                                <h2>Estado</h2>
                                
                                <label class="toggle-field">
                                    <span>En Stock (General)</span>
                                    <input type="checkbox" formControlName="in_stock">
                                    <span class="toggle"></span>
                                </label>

                                <label class="toggle-field">
                                    <span>Producto Activo</span>
                                    <input type="checkbox" formControlName="is_active">
                                    <span class="toggle"></span>
                                </label>
                            </section>

                            <section class="form-section">
                                <h2>Resumen</h2>
                                <div class="summary-info">
                                    <p><strong>Colores:</strong> {{ colorVariants().length }}</p>
                                    <p><strong>Imágenes:</strong> {{ totalImages() }}</p>
                                    <p><strong>Tallas:</strong> {{ selectedSizes().join(', ') || 'Ninguna' }}</p>
                                </div>
                            </section>

                            <div class="form-actions">
                                <button 
                                    type="submit" 
                                    class="btn-primary"
                                    [disabled]="productForm.invalid || saving() || colorVariants().length === 0"
                                >
                                    @if (saving()) {
                                        <span class="spinner-small"></span>
                                        Guardando...
                                    } @else {
                                        {{ isEditMode() ? 'Actualizar Producto' : 'Crear Producto' }}
                                    }
                                </button>
                                <a routerLink="/admin/products" class="btn-secondary">Cancelar</a>
                            </div>
                        </div>
                    </div>
                </form>
            }
        </div>
    `,
    styles: [`
        .product-form-page {
            max-width: 1200px;
            margin: 0 auto;
        }

        .page-header {
            margin-bottom: 32px;
        }

        .back-link {
            color: rgba(255, 255, 255, 0.6);
            text-decoration: none;
            font-size: 14px;
            transition: color 0.2s;
        }

        .back-link:hover {
            color: #feca57;
        }

        .page-header h1 {
            font-size: 28px;
            font-weight: 700;
            color: #fff;
            margin: 8px 0 0;
        }

        .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px;
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
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

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 360px;
            gap: 24px;
        }

        .form-section {
            background: rgba(26, 26, 26, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
        }

        .form-section h2 {
            font-size: 16px;
            font-weight: 600;
            color: #fff;
            margin: 0 0 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .section-header h2 {
            margin: 0;
            padding: 0;
            border: none;
        }

        .btn-add {
            padding: 8px 16px;
            background: rgba(254, 202, 87, 0.2);
            border: 1px solid #feca57;
            border-radius: 8px;
            color: #feca57;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-add:hover {
            background: rgba(254, 202, 87, 0.3);
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
            transition: all 0.2s;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
            color: rgba(255, 255, 255, 0.3);
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #feca57;
            background: rgba(255, 255, 255, 0.08);
        }

        .form-group select option {
            background: #1a1a1a;
            color: #fff;
            padding: 12px;
        }

        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }

        .field-error {
            color: #ff6b6b;
            font-size: 12px;
            margin-top: 4px;
            display: block;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .sizes-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .size-checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .size-checkbox:has(input:checked) {
            background: rgba(254, 202, 87, 0.2);
            border-color: #feca57;
        }

        .size-checkbox input {
            display: none;
        }

        .size-checkbox span {
            color: #fff;
            font-size: 14px;
            font-weight: 500;
        }

        /* Color Cards */
        .empty-colors {
            padding: 40px;
            text-align: center;
            color: rgba(255, 255, 255, 0.5);
            border: 2px dashed rgba(255, 255, 255, 0.1);
            border-radius: 12px;
        }

        .color-card {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
        }

        .color-card.is-default {
            border-color: #feca57;
        }

        .color-header {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .color-preview {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .color-name-input {
            flex: 1;
            min-width: 120px;
            padding: 8px 12px !important;
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 8px !important;
            color: #fff !important;
        }

        .color-name-input::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }

        .color-picker {
            width: 40px;
            height: 32px;
            padding: 0 !important;
            border: none !important;
            cursor: pointer;
            background: transparent !important;
        }

        .toggle-small {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
        }

        .toggle-small input {
            width: auto !important;
        }

        .btn-default {
            padding: 6px 12px;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            color: rgba(255, 255, 255, 0.7);
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-default:hover:not(:disabled) {
            border-color: #feca57;
            color: #feca57;
        }

        .btn-default:disabled {
            background: rgba(254, 202, 87, 0.2);
            border-color: #feca57;
            color: #feca57;
            cursor: default;
        }

        .btn-remove-color {
            width: 28px;
            height: 28px;
            background: rgba(255, 107, 107, 0.2);
            border: 1px solid rgba(255, 107, 107, 0.5);
            border-radius: 6px;
            color: #ff6b6b;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-remove-color:hover:not(:disabled) {
            background: rgba(255, 107, 107, 0.4);
        }

        .btn-remove-color:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        /* Color Images */
        .color-images {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .images-grid {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .image-thumb {
            position: relative;
            width: 80px;
            height: 80px;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .image-thumb.is-primary {
            border-color: #feca57;
        }

        .image-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .image-actions {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            gap: 2px;
        }

        .image-actions button {
            flex: 1;
            padding: 4px;
            background: rgba(0, 0, 0, 0.7);
            border: none;
            color: #fff;
            font-size: 12px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .image-actions button:first-child:disabled {
            color: #feca57;
        }

        .image-actions button:last-child:hover {
            background: #ff6b6b;
        }

        .image-upload-thumb {
            width: 80px;
            height: 80px;
            border: 2px dashed rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            color: rgba(255, 255, 255, 0.5);
        }

        .image-upload-thumb:hover {
            border-color: #feca57;
            color: #feca57;
        }

        .image-upload-thumb span {
            font-size: 24px;
        }

        .image-upload-thumb small {
            font-size: 10px;
        }

        .pending-uploads {
            margin-top: 8px;
            font-size: 12px;
            color: #feca57;
        }

        /* Toggle Fields */
        .toggle-field {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            cursor: pointer;
        }

        .toggle-field:last-of-type {
            border-bottom: none;
        }

        .toggle-field > span:first-child {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
        }

        .toggle-field input {
            display: none;
        }

        .toggle {
            width: 48px;
            height: 26px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 13px;
            position: relative;
            transition: background 0.2s;
        }

        .toggle::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 20px;
            height: 20px;
            background: #fff;
            border-radius: 50%;
            transition: transform 0.2s;
        }

        .toggle-field input:checked + .toggle {
            background: #10b981;
        }

        .toggle-field input:checked + .toggle::after {
            transform: translateX(22px);
        }

        /* Summary */
        .summary-info {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
        }

        .summary-info p {
            margin: 8px 0;
        }

        /* Actions */
        .form-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .btn-primary {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 14px 24px;
            background: linear-gradient(135deg, #ff6b6b, #feca57);
            border: none;
            border-radius: 12px;
            color: #000;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(255, 107, 107, 0.3);
        }

        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .spinner-small {
            width: 16px;
            height: 16px;
            border: 2px solid transparent;
            border-top-color: #000;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        .btn-secondary {
            display: block;
            padding: 14px 24px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 1024px) {
            .form-grid {
                grid-template-columns: 1fr;
            }

            .form-sidebar {
                order: -1;
            }
        }

        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }

            .color-header {
                flex-direction: column;
                align-items: stretch;
            }

            .color-header > * {
                width: 100%;
            }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductFormComponent implements OnInit {
    private readonly supabase = inject(SupabaseService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly fb = inject(FormBuilder);

    readonly loading = signal(true);
    readonly saving = signal(false);
    readonly isEditMode = signal(false);
    readonly categories = signal<DbCategory[]>([]);
    readonly selectedSizes = signal<string[]>([]);
    readonly colorVariants = signal<ColorFormData[]>([]);

    readonly availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    private productId: string | null = null;
    private imageInputElements: HTMLInputElement[] = [];

    readonly productForm = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        price: [0, [Validators.required, Validators.min(0)]],
        category_id: [''],
        type: ['simple' as 'simple' | 'personalizado'],
        theme: [''],
        in_stock: [true],
        is_active: [true]
    });

    readonly totalImages = computed(() => {
        return this.colorVariants().reduce((sum, color) =>
            sum + color.images.length + color.newImages.length, 0
        );
    });

    async ngOnInit(): Promise<void> {
        this.productId = this.route.snapshot.paramMap.get('id');
        this.isEditMode.set(!!this.productId);

        await this.loadCategories();

        if (this.productId) {
            await this.loadProduct();
        } else {
            // Start with one default color for new products
            this.addColor();
            this.loading.set(false);
        }
    }

    private async loadCategories(): Promise<void> {
        try {
            const categories = await this.supabase.getAll<DbCategory>('categories');
            this.categories.set(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    private async loadProduct(): Promise<void> {
        if (!this.productId) return;

        try {
            // Load product with colors and images
            const client = this.supabase.client;
            if (!client) throw new Error('Supabase not configured');

            const { data: product, error } = await client
                .from('products')
                .select(`
                    *,
                    colors:product_colors(
                        *,
                        images:product_images(*)
                    )
                `)
                .eq('id', this.productId)
                .single();

            if (error) throw error;

            if (product) {
                this.productForm.patchValue({
                    name: product.name,
                    description: product.description || '',
                    price: product.price,
                    category_id: product.category_id || '',
                    type: product.type,
                    theme: product.theme || '',
                    in_stock: product.in_stock,
                    is_active: product.is_active
                });
                this.selectedSizes.set(product.sizes || []);

                // Load color variants
                if (product.colors && product.colors.length > 0) {
                    const colors: ColorFormData[] = product.colors.map((c: DbProductColor) => ({
                        id: c.id,
                        color_name: c.color_name,
                        hex_code: c.hex_code || '#808080',
                        is_default: c.is_default,
                        in_stock: c.in_stock,
                        images: (c.images || []).map((img: DbProductImage) => ({
                            id: img.id,
                            image_url: img.image_url,
                            is_primary: img.is_primary,
                            display_order: img.display_order
                        })),
                        newImages: []
                    }));
                    this.colorVariants.set(colors);
                } else {
                    // Legacy product without colors - create one from old data
                    this.colorVariants.set([{
                        color_name: product.color || 'Default',
                        hex_code: '#808080',
                        is_default: true,
                        in_stock: product.in_stock,
                        images: product.image_url ? [{
                            id: 'legacy',
                            image_url: product.image_url,
                            is_primary: true,
                            display_order: 0
                        }] : [],
                        newImages: []
                    }]);
                }
            }
        } catch (error) {
            console.error('Error loading product:', error);
        } finally {
            this.loading.set(false);
        }
    }

    toggleSize(size: string): void {
        this.selectedSizes.update(sizes =>
            sizes.includes(size)
                ? sizes.filter(s => s !== size)
                : [...sizes, size]
        );
    }

    // Color management
    addColor(): void {
        const isFirst = this.colorVariants().length === 0;
        this.colorVariants.update(colors => [...colors, {
            color_name: '',
            hex_code: '#808080',
            is_default: isFirst,
            in_stock: true,
            images: [],
            newImages: []
        }]);
    }

    removeColor(index: number): void {
        const colors = this.colorVariants();
        if (colors.length <= 1) return;

        const wasDefault = colors[index].is_default;
        this.colorVariants.update(c => c.filter((_, i) => i !== index));

        // If we removed the default, make the first one default
        if (wasDefault) {
            this.colorVariants.update(c => {
                if (c.length > 0) {
                    c[0].is_default = true;
                }
                return [...c];
            });
        }
    }

    updateColorName(index: number, event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.colorVariants.update(colors => {
            colors[index].color_name = value;
            return [...colors];
        });
    }

    updateColorHex(index: number, event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.colorVariants.update(colors => {
            colors[index].hex_code = value;
            return [...colors];
        });
    }

    toggleColorStock(index: number): void {
        this.colorVariants.update(colors => {
            colors[index].in_stock = !colors[index].in_stock;
            return [...colors];
        });
    }

    setDefaultColor(index: number): void {
        this.colorVariants.update(colors => {
            colors.forEach((c, i) => {
                c.is_default = i === index;
            });
            return [...colors];
        });
    }

    // Image management
    triggerImageUpload(colorIndex: number): void {
        const inputs = document.querySelectorAll<HTMLInputElement>('input[type="file"][data-color-index]');
        const input = Array.from(inputs).find(i => i.dataset['colorIndex'] === String(colorIndex));
        input?.click();
    }

    onImagesSelected(colorIndex: number, event: Event): void {
        const input = event.target as HTMLInputElement;
        const files = input.files;

        if (files && files.length > 0) {
            const newFiles = Array.from(files).filter(f => f.size <= 2 * 1024 * 1024);

            if (newFiles.length < files.length) {
                alert('Algunas imágenes fueron ignoradas por ser mayores a 2MB');
            }

            this.colorVariants.update(colors => {
                colors[colorIndex].newImages = [...colors[colorIndex].newImages, ...newFiles];
                return [...colors];
            });
        }

        // Reset input
        input.value = '';
    }

    setPrimaryImage(colorIndex: number, imageIndex: number): void {
        this.colorVariants.update(colors => {
            colors[colorIndex].images.forEach((img, i) => {
                img.is_primary = i === imageIndex;
            });
            return [...colors];
        });
    }

    removeImage(colorIndex: number, imageIndex: number): void {
        this.colorVariants.update(colors => {
            colors[colorIndex].images = colors[colorIndex].images.filter((_, i) => i !== imageIndex);
            return [...colors];
        });
    }

    async onSubmit(): Promise<void> {
        if (this.productForm.invalid || this.colorVariants().length === 0) return;

        this.saving.set(true);

        try {
            const client = this.supabase.client;
            if (!client) throw new Error('Supabase not configured');

            const formValue = this.productForm.value;

            // Prepare product data (without color/image_url as they're now in separate tables)
            const productData = {
                name: formValue.name || '',
                description: formValue.description || null,
                price: formValue.price || 0,
                category_id: formValue.category_id || null,
                type: formValue.type || 'simple',
                theme: formValue.theme || null,
                in_stock: formValue.in_stock ?? true,
                is_active: formValue.is_active ?? true,
                sizes: this.selectedSizes()
            };

            let productId = this.productId;

            if (this.isEditMode() && productId) {
                // Update existing product
                const { error } = await client
                    .from('products')
                    .update(productData)
                    .eq('id', productId);
                if (error) throw error;
            } else {
                // Create new product
                const { data, error } = await client
                    .from('products')
                    .insert(productData)
                    .select('id')
                    .single();
                if (error) throw error;
                productId = data.id;
            }

            // Save colors and images
            await this.saveColorsAndImages(client, productId!);

            this.router.navigate(['/admin/products']);
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error al guardar el producto');
        } finally {
            this.saving.set(false);
        }
    }

    private async saveColorsAndImages(client: NonNullable<SupabaseService['client']>, productId: string): Promise<void> {
        if (!client) return;

        const colors = this.colorVariants();

        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            let colorId = color.id;

            // Create or update color
            if (colorId && !colorId.startsWith('mock')) {
                // Update existing
                const { error } = await client
                    .from('product_colors')
                    .update({
                        color_name: color.color_name || 'Sin nombre',
                        hex_code: color.hex_code,
                        display_order: i,
                        is_default: color.is_default,
                        in_stock: color.in_stock
                    })
                    .eq('id', colorId);
                if (error) console.error('Error updating color:', error);
            } else {
                // Create new
                const { data, error } = await client
                    .from('product_colors')
                    .insert({
                        product_id: productId,
                        color_name: color.color_name || 'Sin nombre',
                        hex_code: color.hex_code,
                        display_order: i,
                        is_default: color.is_default,
                        in_stock: color.in_stock
                    })
                    .select('id')
                    .single();
                if (error) {
                    console.error('Error creating color:', error);
                    continue;
                }
                colorId = data.id;
            }

            // Upload new images for this color
            for (let j = 0; j < color.newImages.length; j++) {
                const file = color.newImages[j];
                const fileName = `${Date.now()}-${j}-${file.name}`;
                const uploadedUrl = await this.supabase.uploadFile('products', fileName, file);

                if (uploadedUrl) {
                    const isFirst = color.images.length === 0 && j === 0;
                    await client
                        .from('product_images')
                        .insert({
                            product_color_id: colorId,
                            image_url: uploadedUrl,
                            display_order: color.images.length + j,
                            is_primary: isFirst
                        });
                }
            }

            // Update existing images order/primary status
            for (const img of color.images) {
                if (img.id && img.id !== 'legacy') {
                    await client
                        .from('product_images')
                        .update({
                            is_primary: img.is_primary,
                            display_order: img.display_order
                        })
                        .eq('id', img.id);
                }
            }
        }

        // Delete colors that were removed (if editing)
        if (this.isEditMode()) {
            const existingColorIds = colors.filter(c => c.id).map(c => c.id);
            if (existingColorIds.length > 0) {
                await client
                    .from('product_colors')
                    .delete()
                    .eq('product_id', productId)
                    .not('id', 'in', `(${existingColorIds.join(',')})`);
            }
        }
    }
}
