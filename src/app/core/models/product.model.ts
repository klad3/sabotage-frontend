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
