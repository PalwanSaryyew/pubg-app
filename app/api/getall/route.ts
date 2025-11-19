// app/api/getall/route.ts - Sayfalama Eklendi
import { NextResponse } from "next/server";
import prisma from "@/prisma/prismaConf";
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
   // 1. URL'den 'limit' ve 'page' parametrelerini al
   const { searchParams } = new URL(request.url);
   const take = parseInt(searchParams.get("limit") || "20"); // Varsayılan 20 ürün
   const page = parseInt(searchParams.get("page") || "1"); // Varsayılan sayfa 1
   const skip = (page - 1) * take;

   try {
      const products = await prisma.product.findMany({
         // Sayfalama için 'skip' ve 'take' kullan
         skip: skip,
         take: take,
         orderBy: { createdAt: "desc" },
         // ... (select kısmı aynı kalabilir)
      });

      // Toplam ürün sayısını da çekmek iyi bir pratiktir (Önerilir!)
      // const totalCount = await prisma.product.count();

      return NextResponse.json(
         {
            products: products,
            // totalProducts: totalCount, // Sayfalama için gerekli
            // currentPage: page,
            // totalPages: Math.ceil(totalCount / take),
         },
         { status: 200 }
      );
   } catch (error) {
      console.error("Ürünler çekilirken hata oluştu:", error);
      return NextResponse.json(
         { error: "Sunucu hatası. Ürünler yüklenemedi." },
         { status: 500 }
      );
   }
}
