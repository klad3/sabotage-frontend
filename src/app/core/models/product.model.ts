export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    type: 'simple' | 'personalizado';
    theme: string;
    sizes: string[];
    inStock: boolean;
    createdAt?: Date;
    // Multi-color system
    colors: ProductColor[];
    defaultColor?: ProductColor;
    // Legacy field for backward compatibility (computed from default color)
    imageUrl: string;
}

/** Frontend color variant */
export interface ProductColor {
    id: string;
    name: string;
    hexCode: string | null;
    displayOrder: number;
    isDefault: boolean;
    inStock: boolean;
    images: ProductImage[];
}

/** Frontend product image */
export interface ProductImage {
    id: string;
    url: string;
    displayOrder: number;
    isPrimary: boolean;
}

// ============================================
// Cart Types (Supabase-based)
// ============================================

/** Cart stored in Supabase */
export interface DbCart {
    id: string;
    created_at: string;
    updated_at: string;
}

/** Cart item stored in Supabase */
export interface DbCartItem {
    id: string;
    cart_id: string;
    product_id: string;
    product_color_id: string | null; // NEW: Selected color
    size: string;
    quantity: number;
    created_at: string;
    updated_at: string;
}

/** Cart item with joined product data (prices come from DB) */
export interface HydratedCartItem {
    id: string;
    cart_id: string;
    product_id: string;
    product_color_id: string | null;
    size: string;
    quantity: number;
    created_at: string;
    updated_at: string;
    product: DbProduct;
    product_color?: DbProductColor; // NEW: Joined color data
}

/** @deprecated Use HydratedCartItem instead - kept for migration compatibility */
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
    theme: string | null;
    sizes: string[];
    in_stock: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Legacy fields (kept for backward compatibility during migration)
    color?: string | null;
    image_url?: string | null;
    // Joined data
    category?: DbCategory;
    colors?: DbProductColor[]; // NEW: Color variants
}

/** Product color variant in Supabase */
export interface DbProductColor {
    id: string;
    product_id: string;
    color_name: string;
    hex_code: string | null;
    display_order: number;
    is_default: boolean;
    in_stock: boolean;
    created_at: string;
    // Joined data
    images?: DbProductImage[];
}

/** Product image in Supabase */
export interface DbProductImage {
    id: string;
    product_color_id: string;
    image_url: string;
    display_order: number;
    is_primary: boolean;
    created_at: string;
}

export interface DbCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
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
    color?: string;
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
    value: Record<string, unknown> | unknown[]; // JSONB - can be object or array
    updated_at: string;
}

export interface DbBanner {
    id: string;
    title: string;
    image_desktop: string | null;
    image_tablet: string | null;
    image_mobile: string | null;
    link: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Helper function to convert DB product color to frontend ProductColor
export function dbProductColorToProductColor(dbColor: DbProductColor): ProductColor {
    return {
        id: dbColor.id,
        name: dbColor.color_name,
        hexCode: dbColor.hex_code,
        displayOrder: dbColor.display_order,
        isDefault: dbColor.is_default,
        inStock: dbColor.in_stock,
        images: (dbColor.images || []).map(img => ({
            id: img.id,
            url: img.image_url,
            displayOrder: img.display_order,
            isPrimary: img.is_primary
        })).sort((a, b) => a.displayOrder - b.displayOrder)
    };
}

// Helper function to convert DB product to frontend Product
export function dbProductToProduct(dbProduct: DbProduct, categorySlug?: string): Product {
    // Convert colors if available
    const colors = (dbProduct.colors || []).map(dbProductColorToProductColor)
        .sort((a, b) => a.displayOrder - b.displayOrder);

    // Find default color
    const defaultColor = colors.find(c => c.isDefault) || colors[0];

    // Get primary image from default color (for backward compatibility)
    const primaryImage = defaultColor?.images?.find(img => img.isPrimary)
        || defaultColor?.images?.[0];

    // Legacy fallback: use old image_url if no colors exist yet
    const imageUrl = primaryImage?.url || dbProduct.image_url || '';

    return {
        id: dbProduct.id,
        name: dbProduct.name,
        description: dbProduct.description || '',
        price: dbProduct.price,
        category: categorySlug || dbProduct.category?.slug || 'oversize',
        type: dbProduct.type,
        theme: dbProduct.theme || '',
        sizes: dbProduct.sizes || [],
        inStock: dbProduct.in_stock,
        createdAt: new Date(dbProduct.created_at),
        colors,
        defaultColor,
        imageUrl
    };
}

// ============================================
// Site Configuration Types
// ============================================

export interface AnnouncementBar {
    text: string;
    link: string | null;
    is_active: boolean;
    background_color: string;
    text_color: string;
}

export interface ContactInfo {
    whatsapp: string;
    whatsapp_message: string;
    email: string;
    instagram: string;
    facebook: string;
    tiktok: string;
}

export interface Branding {
    logo_url: string | null;
    logo_alt: string;
    favicon_url: string | null;
    site_name: string;
    tagline: string;
}

export interface StatItem {
    value: string;
    label: string;
    numeric_value: number | null;
    suffix: string | null;
    order: number;
}

export interface SectionTitles {
    categories: string;
    products_month: string;
    testimonials: string;
    newsletter: string;
}

export interface FooterConfig {
    about_text: string;
    copyright: string;
    show_social_links: boolean;
    show_payment_methods: boolean;
}

export interface Testimonial {
    stars: number;
    text: string;
    author: string;
    order: number;
}

export interface NewsletterContent {
    title: string;
    subtitle: string;
}

export interface HeaderConfig {
    is_sticky: boolean;
}

// ============================================
// Social Media Embeds
// ============================================

export type SocialPlatform = 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'twitter' | 'other';
export type EmbedDisplayMode = 'cropped' | 'custom' | 'original';

export interface DbSocialEmbed {
    id: string;
    platform: SocialPlatform;
    embed_code: string;
    title: string;
    display_order: number;
    is_active: boolean;
    display_mode: EmbedDisplayMode;  // cropped (570px), custom, or original
    custom_height: number | null;     // height in px when display_mode is 'custom'
    created_at: string;
    updated_at: string;
}

// ============================================
// Customer Reviews
// ============================================

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface DbReview {
    id: string;
    author: string;
    text: string;
    stars: number;
    status: ReviewStatus;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateReviewPayload {
    author: string;
    text: string;
    stars: number;
    status?: ReviewStatus;
    is_featured?: boolean;
}

// ============================================
// About Page Configuration
// ============================================

export interface AboutPageBanner {
    image_url: string | null;  // Uploaded to banners bucket
}

export interface AboutPageIntro {
    title: string;  // "¿Quiénes somos?"
    paragraphs: string[];  // Array of paragraphs
}

export interface AboutPageHistory {
    title: string;  // "Nuestra Historia"
    paragraphs: string[];
}

export interface AboutPageMissionVision {
    mission_title: string;
    mission_text: string;
    vision_title: string;
    vision_text: string;
    background_image: string | null;  // Optional background image
}

export interface AboutPageValue {
    title: string;  // Keyword shown on image (e.g., "CALIDAD")
    text: string;  // Description shown on hover
    image_url: string | null;  // Default image
    hover_image_url: string | null;  // Image shown on hover
}

export interface AboutPageValues {
    title: string;  // "Valores"
    items: AboutPageValue[];
}

export interface AboutPageModel {
    name: string;
    image_url: string | null;  // Uploaded to banners bucket
}

export interface AboutPageModels {
    title: string;  // "Nuestras estrellas de la camara"
    items: AboutPageModel[];
}

export interface AboutPageConfig {
    banner: AboutPageBanner;
    intro: AboutPageIntro;
    history: AboutPageHistory;
    mission_vision: AboutPageMissionVision;
    values: AboutPageValues;
    models: AboutPageModels;
}
