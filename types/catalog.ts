export interface Offer {
    _id: string;
    title: string;
    description: string;
    images: string[];
}

export interface TenantGroup {
    tenantId: string;
    tenantName: string;
    tenantPhone: string;
    tenantCity: string;
    tenantCardLink: string;
    websiteLink?: string; // Adicionado para receber o site do banco de dados
    offers: Offer[];
}