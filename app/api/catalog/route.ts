import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import { Tenant, Offer } from '../../../models/Schemas';

// Função auxiliar para escapar caracteres especiais em expressões regulares
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Função flexível para validar se o anúncio está ativo e dentro do prazo
// Função flexível para validar se o anúncio está ativo e dentro do prazo
function isOfferValid(offer: any): boolean {
    // 1. Se estiver marcado explicitamente como inativo, descarta
    if (offer.isActive === false) return false;

    // 2. Se não houver data de expiração definida, o anúncio é permanente
    if (!offer.expiresAt) return true;

    const raw = offer.expiresAt;
    let expireDate: Date | null = null;

    if (raw instanceof Date) {
        expireDate = new Date(raw);
        expireDate.setUTCHours(23, 59, 59, 999);
    } else if (typeof raw === 'string' && raw.trim() !== '') {
        const trimmed = raw.trim();
        // Suporte ao formato brasileiro DD/MM/YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
            const [day, month, year] = trimmed.split('/');
            expireDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999));
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            const [year, month, day] = trimmed.split('-');
            expireDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999));
        } else {
            // Suporte ao formato ISO
            const parsed = new Date(trimmed);
            if (!isNaN(parsed.getTime())) {
                expireDate = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 23, 59, 59, 999));
            }
        }
    }

    // Se a data for inválida ou não reconhecida, mantém o anúncio por segurança
    if (!expireDate) return true;

    // Compara o tempo final do anúncio com a hora atual
    return expireDate.getTime() >= Date.now();
}

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const cityParam = searchParams.get('city');

        // 1. Lista todas as cidades cadastradas nos corretores para alimentar os filtros do front
        const allTenantsForCities = await Tenant.find({}).select('city').lean();
        const citiesList = Array.from(
            new Set(
                allTenantsForCities
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

        // Busca os anúncios no banco ordenados por criação
        const rawOffers = await Offer.find(matchQuery)
            .sort({ createdAt: -1, _id: -1 })
            .lean();

        // Aplica a validação de datas e expiração em memória
        const offers = rawOffers.filter(isOfferValid);

        // Busca os corretores do filtro
        const tenants = await Tenant.find(tenantFilter).sort({ name: 1 }).lean();

        // Agrupa anúncios por corretor
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

        return NextResponse.json({
            cities: citiesList,
            catalog: groupedCatalog
        });
    } catch (error: any) {
        console.error('Erro ao gerar catálogo agrupado:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}