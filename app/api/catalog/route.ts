import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import { Tenant, Offer } from '../../../models/Schemas';

// Função auxiliar para escapar caracteres especiais de Regex (como parênteses, pontos, etc)
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const cityParam = searchParams.get('city');

        // 1. Busca todas as cidades dos corretores para alimentar o select do frontend
        const allTenantsForCities = await Tenant.find({}).select('city').lean();
        const citiesList = Array.from(
            new Set(
                allTenantsForCities
                    .map((t: any) => t.city)
                    .filter((city): city is string => typeof city === 'string' && city.trim() !== '')
                    .map(city => city.trim())
            )
        ).sort((a, b) => a.localeCompare(b));

        let matchQuery: any = {};
        let tenantFilter: any = {};

        // 2. Filtro por cidade nos corretores (Tenants)
        if (cityParam && cityParam.trim() !== '') {
            const escapedCity = escapeRegExp(cityParam.trim());
            tenantFilter.city = { $regex: new RegExp(`^${escapedCity}$`, 'i') };
        }

        // 3. Filtro de pesquisa de texto (nome do corretor, título ou descrição do imóvel)
        if (search && search.trim() !== '') {
            const escapedSearch = escapeRegExp(search.trim());
            const regex = new RegExp(escapedSearch, 'i');

            const matchedTenants = await Tenant.find({
                ...tenantFilter,
                name: regex
            }).select('_id').lean();

            const matchedTenantIds = matchedTenants.map((t: any) => t._id);

            matchQuery = {
                $or: [
                    { title: regex },
                    { description: regex },
                    { tenantId: { $in: matchedTenantIds } }
                ]
            };
        }

        // Se houver filtro de cidade, mas não busca textual, limita os imóveis àquela cidade
        if ((!search || search.trim() === '') && (cityParam && cityParam.trim() !== '')) {
            const cityTenants = await Tenant.find(tenantFilter).select('_id').lean();
            const cityTenantIds = cityTenants.map((t: any) => t._id);
            matchQuery.tenantId = { $in: cityTenantIds };
        }

        // Busca as ofertas filtradas e ORDENA POR DATA DE CRIAÇÃO DECRESCENTE (mais recentes primeiro)
        const offers = await Offer.find(matchQuery)
            .sort({ createdAt: -1, _id: -1 })
            .lean();

        // Busca os corretores aplicando o filtro de cidade (se ativo) ordenados por nome
        const tenants = await Tenant.find(tenantFilter).sort({ name: 1 }).lean();

        // Agrupa as ofertas por corretor (mantendo a ordem decrescente das ofertas)
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
        }).filter(group => group.offers.length > 0); // Remove corretores que não têm imóveis correspondentes ao filtro

        // Retorna a lista de cidades únicas e o catálogo estruturado
        return NextResponse.json({
            cities: citiesList,
            catalog: groupedCatalog
        });
    } catch (error: any) {
        console.error('Erro ao gerar catálogo agrupado:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}