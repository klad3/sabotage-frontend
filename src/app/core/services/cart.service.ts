import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem, DISCOUNT_CODES } from '../models/product.model';

const CART_STORAGE_KEY = 'carrito';
const SHIPPING_COST = 15.00;

@Injectable({
    providedIn: 'root'
})
export class CartService {
    // State signals
    private readonly _items = signal<CartItem[]>(this.loadFromStorage());
    private readonly _discountCode = signal<string | null>(null);

    // Public readonly signals
    readonly items = this._items.asReadonly();
    readonly discountCode = this._discountCode.asReadonly();

    // Computed values
    readonly itemCount = computed(() =>
        this._items().reduce((sum, item) => sum + item.quantity, 0)
    );

    readonly subtotal = computed(() =>
        this._items().reduce((sum, item) => sum + (item.price * item.quantity), 0)
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

    constructor() {
        // Auto-save to localStorage when cart changes
        effect(() => {
            this.saveToStorage(this._items());
        });
    }

    /**
     * Add an item to the cart
     */
    addItem(item: Omit<CartItem, 'id'>): void {
        const items = this._items();
        const existingItem = items.find(
            i => i.productId === item.productId && i.size === item.size
        );

        if (existingItem) {
            // Update quantity if item already exists
            this.updateQuantity(existingItem.id, existingItem.quantity + item.quantity);
        } else {
            // Add new item
            const newItem: CartItem = {
                ...item,
                id: this.generateId()
            };
            this._items.set([...items, newItem]);
        }
    }

    /**
     * Remove an item from the cart
     */
    removeItem(itemId: string): void {
        this._items.update(items => items.filter(item => item.id !== itemId));
    }

    /**
     * Update item quantity
     */
    updateQuantity(itemId: string, quantity: number): void {
        if (quantity < 1) quantity = 1;
        if (quantity > 10) quantity = 10;

        this._items.update(items =>
            items.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    }

    /**
     * Increase item quantity by 1
     */
    increaseQuantity(itemId: string): void {
        const item = this._items().find(i => i.id === itemId);
        if (item && item.quantity < 10) {
            this.updateQuantity(itemId, item.quantity + 1);
        }
    }

    /**
     * Decrease item quantity by 1
     */
    decreaseQuantity(itemId: string): void {
        const item = this._items().find(i => i.id === itemId);
        if (item && item.quantity > 1) {
            this.updateQuantity(itemId, item.quantity - 1);
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
    clearCart(): void {
        this._items.set([]);
        this._discountCode.set(null);
    }

    /**
     * Get cart data for checkout
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

    private loadFromStorage(): CartItem[] {
        if (typeof window === 'undefined') return [];

        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    private saveToStorage(items: CartItem[]): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch (err) {
            console.error('Failed to save cart to localStorage:', err);
        }
    }

    private generateId(): string {
        return `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
