export interface Offer {
    _id: string;
    title: string;
    description: string;
    images: string[];
    createdAt?: string; // Adicionado para receber a data de criação do Mongoose
}

export interface TenantGroup {
    tenantId: string;
    tenantName: string;
    tenantPhone: string;
    tenantCity: string;
    tenantCardLink: string;
    websiteLink?: string;
    offers: Offer[];
}