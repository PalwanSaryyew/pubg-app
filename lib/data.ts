// lib/data.ts

import prisma from "@/prisma/prismaConf";
import { Product } from "@/lib/generated/prisma/client";
import { unstable_noStore as noStore } from 'next/cache'; // 👈 Bu satırı ekleyin

// API rotanızdaki tüm mantığı buraya taşıyın.
export async function getProducts({
    limit = 20,
    page = 1,
}): Promise<Product[]> {
    noStore(); // 👈 Veri çekimini dinamik hale getirir ve önbelleği devre dışı bırakır.
    
    const skip = (page - 1) * limit;
    try {
        const products = await prisma.product.findMany({
            where: { isPublished: true },
            skip: skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        });
        return products;
    } catch (error) {
        console.error("Veritabanı hatası:", error);
        return [];
    }
}