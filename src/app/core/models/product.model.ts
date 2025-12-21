export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'oversize' | 'clasico';
    type: 'simple' | 'personalizado';
    color: string;
    theme: string;
    sizes: string[];
    imageUrl: string;
    inStock: boolean;
    createdAt?: Date;
}

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    type: 'simple' | 'personalizado';
    size: string;
    quantity: number;
    imageUrl: string;
}

export interface Subscriber {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    age: number;
    phone: string;
    country: string;
    district: string;
    nationality: string;
    comments?: string;
    createdAt?: Date;
}

export interface DiscountCode {
    id: string;
    code: string;
    percentage: number;
    active: boolean;
    expiresAt?: Date;
}

export interface FilterState {
    types: string[];
    sizes: string[];
    colors: string[];
    themes: string[];
    priceRange: {
        min: number;
        max: number;
    };
}

export const DISTRICTS_BY_COUNTRY: Record<string, string[]> = {
    Peru: [
        'Lima', 'Miraflores', 'San Isidro', 'Barranco', 'Surco',
        'La Molina', 'San Borja', 'Jesús María', 'Lince', 'Magdalena',
        'San Miguel', 'Pueblo Libre', 'Breña', 'Callao', 'Arequipa',
        'Cusco', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Huancayo'
    ],
    Argentina: [
        'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata',
        'San Miguel de Tucumán', 'Mar del Plata', 'Salta', 'Santa Fe'
    ],
    Chile: [
        'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta',
        'Temuco', 'Rancagua', 'Talca', 'Arica', 'Puerto Montt'
    ],
    Colombia: [
        'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
        'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Manizales'
    ],
    Ecuador: [
        'Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala',
        'Durán', 'Portoviejo', 'Manta', 'Loja', 'Ambato'
    ],
    Bolivia: [
        'La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Oruro',
        'Tarija', 'Potosí', 'Trinidad', 'Cobija'
    ],
    Uruguay: [
        'Montevideo', 'Salto', 'Paysandú', 'Las Piedras', 'Rivera',
        'Maldonado', 'Tacuarembó', 'Melo', 'Mercedes'
    ],
    Paraguay: [
        'Asunción', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiatá',
        'Lambaré', 'Fernando de la Mora', 'Encarnación'
    ],
    Venezuela: [
        'Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay',
        'Ciudad Guayana', 'Barcelona', 'Maturín', 'Puerto La Cruz'
    ],
    Mexico: [
        'Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana',
        'León', 'Juárez', 'Zapopan', 'Mérida', 'Cancún'
    ],
    Otro: ['Ciudad/Distrito']
};

export const COUNTRIES = [
    'Peru', 'Argentina', 'Chile', 'Colombia', 'Ecuador',
    'Bolivia', 'Uruguay', 'Paraguay', 'Venezuela', 'Mexico', 'Otro'
];

export const DISCOUNT_CODES: Record<string, number> = {
    'SABOTAGE10': 10,
    'PRIMERACOMPRA': 15,
    'VERANO2024': 20
};

// ============================================
// Supabase Database Interfaces
// ============================================

export interface DbProduct {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category_id: string | null;
    type: 'simple' | 'personalizado';
    color: string | null;
    theme: string | null;
    sizes: string[];
    image_url: string | null;
    in_stock: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Joined data
    category?: DbCategory;
}

export interface DbCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface DbDiscountCode {
    id: string;
    code: string;
    percentage: number;
    is_active: boolean;
    usage_limit: number | null;
    usage_count: number;
    expires_at: string | null;
    created_at: string;
}

export interface DbSubscriber {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    age: number | null;
    phone: string | null;
    country: string | null;
    district: string | null;
    nationality: string | null;
    comments: string | null;
    created_at: string;
}

// Order item as stored in JSONB
export interface OrderItem {
    id: string;
    name: string;
    size: string;
    quantity: number;
    price: number;
    image?: string;
}

export interface DbOrder {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string;
    shipping_address: string | null;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    discount_code: string | null;
    discount_amount: number;
    total: number;
    status: OrderStatus;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface DbSiteConfig {
    id: string;
    key: string;
    value: Record<string, unknown>;
    updated_at: string;
}

// Helper function to convert DB product to frontend Product
export function dbProductToProduct(dbProduct: DbProduct, categorySlug?: string): Product {
    return {
        id: dbProduct.id,
        name: dbProduct.name,
        description: dbProduct.description || '',
        price: dbProduct.price,
        category: (categorySlug as 'oversize' | 'clasico') ||
            (dbProduct.category?.slug as 'oversize' | 'clasico') || 'oversize',
        type: dbProduct.type,
        color: dbProduct.color || '',
        theme: dbProduct.theme || '',
        sizes: dbProduct.sizes || [],
        imageUrl: dbProduct.image_url || '',
        inStock: dbProduct.in_stock,
        createdAt: new Date(dbProduct.created_at)
    };
}
