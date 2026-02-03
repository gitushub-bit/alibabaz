export interface Category {
    id: string;
    name: string;
    icon: string;
}

export interface Product {
    id: string;
    name: string;
    image: string;
    category: string;
}

export interface Country {
    code: string;
    name: string;
    currency: string;
}

export enum TabType {
    AI_MODE = 'AI_MODE',
    PRODUCTS = 'PRODUCTS',
    MANUFACTURERS = 'MANUFACTURERS',
    WORLDWIDE = 'WORLDWIDE'
}
