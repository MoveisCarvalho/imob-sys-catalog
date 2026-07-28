import mongoose, { Document, Model, Schema } from 'mongoose';

// 1. Interface e Schema do Tenant
export interface ITenant extends Document {
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    city: string;
    businessCardLink?: string;
}

const TenantSchema = new Schema<ITenant>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    city: { type: String, required: true, default: '' },
    businessCardLink: { type: String, default: '' },
}, { timestamps: true });

export const Tenant: Model<ITenant> = mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);


// 2. Interface e Schema da Oferta (Item)
export interface IOffer extends Document {
    tenantId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    images: string[];
    expiresAt?: string;
    isActive?: boolean;
    businessCardLink?: string;
    createdAt?: string;
}

const OfferSchema = new Schema<IOffer>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    expiresAt: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    businessCardLink: { type: String, default: '' },
}, { timestamps: true });

// Apontando para a coleção 'items'
export const Offer: Model<IOffer> = mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema, 'items');