import { Injectable, inject, signal, computed } from '@angular/core';
import { HydratedCartItem, DbProduct, DbProductColor, DISCOUNT_CODES } from '../models/product.model';
import { SupabaseService } from './supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';

const CART_ID_KEY = 'cart_id';
const SHIPPING_COST = 15.00;

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly supabase = inject(SupabaseService);

    // State signals
    private readonly _cartId = signal<string | null>(this.getStoredCartId());
    private readonly _items = signal<HydratedCartItem[]>([]);
    private readonly _isLoading = signal(false);
    private readonly _discountCode = signal<string | null>(null);

    // Public readonly signals
    readonly items = this._items.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly discountCode = this._discountCode.asReadonly();

    // Computed values - prices ALWAYS come from product.price (secure)
    readonly itemCount = computed(() =>
        this._items().reduce((sum, item) => sum + item.quantity, 0)
    );

    readonly subtotal = computed(() =>
        this._items().reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    );

    readonly shipping = computed(() =>
        this._items().length > 0 ? SHIPPING_COST : 0
    );

    readonly discountPercentage = computed(() => {
        const code = this._discountCode();
        return code ? (DISCOUNT_CODES[code] || 0) : 0;
    });

    readonly discountAmount = computed(() =>
        (this.subtotal() * this.discountPercentage()) / 100
    );

    readonly total = computed(() =>
        this.subtotal() + this.shipping() - this.discountAmount()
    );

    readonly isEmpty = computed(() => this._items().length === 0);

    /** Get Supabase client, throws if not configured */
    private get db(): SupabaseClient {
        const client = this.supabase.client;
        if (!client) {
            throw new Error('Supabase is not configured');
        }
        return client;
    }

    /** Check if Supabase is enabled */
    private get isSupabaseEnabled(): boolean {
        return this.supabase.isEnabled;
    }

    constructor() {
        // Load cart on initialization
        if (this.isSupabaseEnabled) {
            this.loadCart();
        }
    }

    /**
     * Load cart items from Supabase
     */
    async loadCart(): Promise<void> {
        const cartId = this._cartId();
        if (!cartId) {
            this._items.set([]);
            return;
        }

        this._isLoading.set(true);

        try {
            // First check if cart exists
            const { data: cart, error: cartError } = await this.db
                .from('carts')
                .select('id')
                .eq('id', cartId)
                .single();

            if (cartError || !cart) {
                // Cart was deleted (cleanup or manual), create new one
                this.clearStoredCartId();
                this._cartId.set(null);
                this._items.set([]);
                return;
            }

            // Load items with product and color data
            const { data: items, error } = await this.db
                .from('cart_items')
                .select(`
                    id,
                    cart_id,
                    product_id,
                    product_color_id,
                    size,
                    quantity,
                    created_at,
                    updated_at,
                    product:products(*),
                    product_color:product_colors(
                        *,
                        images:product_images(*)
                    )
                `)
                .eq('cart_id', cartId);

            if (error || !items) {
                console.error('Error loading cart:', error);
                this._items.set([]);
                return;
            }

            // Map and filter items - product comes as single object from Supabase join
            const validItems: HydratedCartItem[] = items
                .filter(item => item.product != null)
                .map(item => ({
                    id: item.id,
                    cart_id: item.cart_id,
                    product_id: item.product_id,
                    product_color_id: item.product_color_id || null,
                    size: item.size,
                    quantity: item.quantity,
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                    product: item.product as unknown as DbProduct,
                    product_color: item.product_color as unknown as DbProductColor | undefined
                }));
            this._items.set(validItems);
        } finally {
            this._isLoading.set(false);
        }
    }

    /**
     * Add an item to the cart
     * @param productId - Product ID
     * @param size - Selected size
     * @param quantity - Quantity to add (default 1)
     * @param colorId - Optional color variant ID
     */
    async addItem(productId: string, size: string, quantity: number = 1, colorId?: string): Promise<boolean> {
        this._isLoading.set(true);

        try {
            const cartId = await this.ensureCart();

            // Check if item already exists (same product, size, and color)
            const existingItem = this._items().find(
                i => i.product_id === productId &&
                    i.size === size &&
                    i.product_color_id === (colorId || null)
            );

            if (existingItem) {
                // Update quantity
                const newQuantity = Math.min(existingItem.quantity + quantity, 10);
                return this.updateQuantity(existingItem.id, newQuantity);
            }

            // Insert new item
            const { error: insertError } = await this.db
                .from('cart_items')
                .insert({
                    cart_id: cartId,
                    product_id: productId,
                    product_color_id: colorId || null,
                    size,
                    quantity: Math.min(quantity, 10)
                });

            if (insertError) {
                console.error('Error adding item:', insertError);
                return false;
            }

            // Reload cart to get hydrated items
            await this.loadCart();
            return true;
        } finally {
            this._isLoading.set(false);
        }
    }

    /**
     * Remove an item from the cart
     */
    async removeItem(cartItemId: string): Promise<boolean> {
        this._isLoading.set(true);

        try {
            const { error: deleteError } = await this.db
                .from('cart_items')
                .delete()
                .eq('id', cartItemId);

            if (deleteError) {
                console.error('Error removing item:', deleteError);
                return false;
            }

            // Update local state
            this._items.update(items => items.filter(item => item.id !== cartItemId));
            return true;
        } finally {
            this._isLoading.set(false);
        }
    }

    /**
     * Update item quantity
     */
    async updateQuantity(cartItemId: string, quantity: number): Promise<boolean> {
        const clampedQuantity = Math.max(1, Math.min(quantity, 10));

        // Optimistic update
        this._items.update(items =>
            items.map(item =>
                item.id === cartItemId ? { ...item, quantity: clampedQuantity } : item
            )
        );

        const { error: updateError } = await this.db
            .from('cart_items')
            .update({ quantity: clampedQuantity })
            .eq('id', cartItemId);

        if (updateError) {
            console.error('Error updating quantity:', updateError);
            // Rollback on error
            await this.loadCart();
            return false;
        }

        return true;
    }

    /**
     * Increase item quantity by 1
     */
    async increaseQuantity(cartItemId: string): Promise<void> {
        const item = this._items().find(i => i.id === cartItemId);
        if (item && item.quantity < 10) {
            await this.updateQuantity(cartItemId, item.quantity + 1);
        }
    }

    /**
     * Decrease item quantity by 1
     */
    async decreaseQuantity(cartItemId: string): Promise<void> {
        const item = this._items().find(i => i.id === cartItemId);
        if (item && item.quantity > 1) {
            await this.updateQuantity(cartItemId, item.quantity - 1);
        }
    }

    /**
     * Apply a discount code
     */
    applyDiscountCode(code: string): { success: boolean; message: string } {
        const upperCode = code.trim().toUpperCase();

        if (!upperCode) {
            return { success: false, message: 'Por favor ingresa un código' };
        }

        if (DISCOUNT_CODES[upperCode]) {
            this._discountCode.set(upperCode);
            return {
                success: true,
                message: `✓ Código aplicado: ${DISCOUNT_CODES[upperCode]}% de descuento`
            };
        }

        this._discountCode.set(null);
        return { success: false, message: 'Código inválido o expirado' };
    }

    /**
     * Remove applied discount code
     */
    removeDiscountCode(): void {
        this._discountCode.set(null);
    }

    /**
     * Clear the entire cart
     */
    async clearCart(): Promise<void> {
        const cartId = this._cartId();
        if (!cartId) return;

        this._isLoading.set(true);

        try {
            await this.db
                .from('cart_items')
                .delete()
                .eq('cart_id', cartId);

            this._items.set([]);
            this._discountCode.set(null);
        } finally {
            this._isLoading.set(false);
        }
    }

    /**
     * Get cart data for checkout
     * Prices are guaranteed to come from the database
     */
    getCartData() {
        return {
            items: this._items(),
            subtotal: this.subtotal(),
            shipping: this.shipping(),
            discountCode: this._discountCode(),
            discountAmount: this.discountAmount(),
            total: this.total()
        };
    }

    /**
     * Ensure a cart exists, create one if needed
     */
    private async ensureCart(): Promise<string> {
        const existingCartId = this._cartId();

        if (existingCartId) {
            // Verify cart still exists in DB
            const { data: cart } = await this.db
                .from('carts')
                .select('id')
                .eq('id', existingCartId)
                .single();

            if (cart) {
                return existingCartId;
            }
        }

        // Create new cart
        const { data: newCart, error: createError } = await this.db
            .from('carts')
            .insert({})
            .select('id')
            .single();

        if (createError || !newCart) {
            throw new Error('Failed to create cart');
        }

        this.storeCartId(newCart.id);
        this._cartId.set(newCart.id);
        return newCart.id;
    }

    private getStoredCartId(): string | null {
        if (typeof window === 'undefined') return null;

        try {
            return localStorage.getItem(CART_ID_KEY);
        } catch {
            return null;
        }
    }

    private storeCartId(cartId: string): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(CART_ID_KEY, cartId);
        } catch (err) {
            console.error('Failed to store cart ID:', err);
        }
    }

    private clearStoredCartId(): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.removeItem(CART_ID_KEY);
        } catch {
            // Ignore
        }
    }
}
