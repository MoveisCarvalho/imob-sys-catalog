import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import { Tenant, Offer } from '../../../models/Schemas';

// Função auxiliar para escapar caracteres especiais em expressões regulares
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Função flexível para validar se o anúncio está ativo e dentro do prazo
function isOfferValid(offer: any): boolean {
    if (offer.isActive === false) return false;
    if (!offer.expiresAt) return true;

    const raw = offer.expiresAt;
    let expireDate: Date | null = null;

    if (raw instanceof Date) {
        expireDate = new Date(raw);
        expireDate.setUTCHours(23, 59, 59, 999);
    } else if (typeof raw === 'string' && raw.trim() !== '') {
        const trimmed = raw.trim();
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
            const [day, month, year] = trimmed.split('/');
            expireDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999));
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            const [year, month, day] = trimmed.split('-');
            expireDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999));
        } else {
            const parsed = new Date(trimmed);
            if (!isNaN(parsed.getTime())) {
                expireDate = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 23, 59, 59, 999));
            }
        }
    }

    if (!expireDate) return true;
    return expireDate.getTime() >= Date.now();
}

// Função corrigida para validar se a assinatura do Tenant está ativa até o final do dia de expiração
function isTenantSubscriptionValid(tenant: any): boolean {
    if (!tenant.subscriptionExpiresAt) return true;

    const raw = tenant.subscriptionExpiresAt;
    let expiryDate: Date | null = null;

    if (raw instanceof Date) {
        expiryDate = new Date(raw);
        expiryDate.setUTCHours(23, 59, 59, 999);
    } else if (typeof raw === 'string' && raw.trim() !== '') {
        const trimmed = raw.trim();
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
            const [day, month, year] = trimmed.split('/');
            expiryDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999));
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            const [year, month, day] = trimmed.split('-');
            expiryDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999));
        } else {
            const parsed = new Date(trimmed);
            if (!isNaN(parsed.getTime())) {
                expiryDate = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 23, 59, 59, 999));
            }
        }
    }

    if (!expiryDate) return true;
    return expiryDate.getTime() >= Date.now();
}

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const cityParam = searchParams.get('city');

        // 1. Lista todas as cidades cadastradas nos corretores válidos para alimentar os filtros do front
        const allTenantsForCities = await Tenant.find({}).lean();
        const validTenantsForCities = allTenantsForCities.filter(isTenantSubscriptionValid);

        const citiesList = Array.from(
            new Set(
                validTenantsForCities
                    .map((t: any) => t.city)
                    .filter((city): city is string => typeof city === 'string' && city.trim() !== '')
                    .map(city => city.trim())
            )
        ).sort((a, b) => a.localeCompare(b));

        let tenantFilter: any = {};

        // 2. Filtro por cidade nos corretores
        if (cityParam && cityParam.trim() !== '') {
            const escapedCity = escapeRegExp(cityParam.trim());
            tenantFilter.city = { $regex: new RegExp(`^${escapedCity}$`, 'i') };
        }

        // Condição inicial no MongoDB: traz todos os anúncios que NÃO estão explicitamente inativos
        let matchQuery: any = { isActive: { $ne: false } };

        // 3. Aplicação da busca textual ou por cidade na consulta principal
        if (search && search.trim() !== '') {
            const escapedSearch = escapeRegExp(search.trim());
            const regex = new RegExp(escapedSearch, 'i');

            const matchedTenants = await Tenant.find({
                ...tenantFilter,
                name: regex
            }).select('_id').lean();

            const matchedTenantIds = matchedTenants.map((t: any) => t._id);

            matchQuery = {
                isActive: { $ne: false },
                $or: [
                    { title: regex },
                    { description: regex },
                    { tenantId: { $in: matchedTenantIds } }
                ]
            };
        } else if (cityParam && cityParam.trim() !== '') {
            const cityTenants = await Tenant.find(tenantFilter).select('_id').lean();
            const cityTenantIds = cityTenants.map((t: any) => t._id);

            matchQuery = {
                isActive: { $ne: false },
                tenantId: { $in: cityTenantIds }
            };
        }

        // Busca os anúncios no banco ordenados por criação globalmente (do mais recente para o mais antigo)
        const rawOffers = await Offer.find(matchQuery)
            .sort({ createdAt: -1, _id: -1 })
            .lean();

        // Aplica a validação de datas e expiração dos anúncios em memória
        const offers = rawOffers.filter(isOfferValid);

        // Busca os corretores do filtro
        const rawTenants = await Tenant.find(tenantFilter).lean();

        // 🔥 Filtra apenas os corretores cuja assinatura (subscriptionExpiresAt) está válida até o final do dia
        const tenants = rawTenants.filter(isTenantSubscriptionValid);

        // Agrupa anúncios por corretor (somente para tenants válidos)
        const groupedCatalog = tenants.map((tenant: any) => {
            const tenantOffers = offers.filter((offer: any) =>
                offer.tenantId && offer.tenantId.toString() === tenant._id.toString()
            );

            return {
                tenantId: tenant._id.toString(),
                tenantName: tenant.name,
                tenantPhone: tenant.phone,
                tenantCity: tenant.city || '',
                tenantCardLink: tenant.businessCardLink || '',
                websiteLink: tenant.websiteLink || tenant.website || tenant.siteUrl || tenant.site || '',
                offers: tenantOffers
            };
        }).filter(group => group.offers.length > 0);

        // 🔥 ORDENAÇÃO POR DATA DO CARD (INDEPENDENTE DO TENANT):
        groupedCatalog.sort((a, b) => {
            const dateA = a.offers[0]?.createdAt ? new Date(a.offers[0].createdAt).getTime() : 0;
            const dateB = b.offers[0]?.createdAt ? new Date(b.offers[0].createdAt).getTime() : 0;
            return dateB - dateA; // Ordem decrescente: do mais recente para o mais antigo
        });

        return NextResponse.json({
            cities: citiesList,
            catalog: groupedCatalog
        });
    } catch (error: any) {
        console.error('Erro ao gerar catálogo agrupado:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}