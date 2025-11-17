// /app/api/myproducts/route.ts
import { getUserDataFromInitData, validateTelegramInitData } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prismaConf";

// Bir önceki hatayı çözmek için BigInt'i string'e dönüştüren yardımcı fonksiyon
/* function serializeBigInts(obj: any): string {
   return JSON.parse(
      JSON.stringify(obj, (key, value) =>
         typeof value === "bigint" ? value.toString() : value
      )
   );
} */

export async function POST(request: NextRequest) {
   try {
      const { initData } = await request.json();

      if (!initData) {
         return NextResponse.json(
            { error: "initData eksik." },
            { status: 400 }
         );
      }

      const isDataValid = await validateTelegramInitData(initData);
      const userData = await getUserDataFromInitData(initData);

      // Güvenlik ve kullanıcı kimliği kontrolü
      if (
         (process.env.DEVELOPMENT !== "true" && !isDataValid) ||
         !userData?.id
      ) {
         return NextResponse.json(
            { error: "Yetkisiz erişim veya kullanıcı kimliği eksik." },
            { status: 401 }
         );
      }

      // Telegram ID'sini string'e dönüştür (Veritabanında String olarak sakladık)
      const telegramIdString = userData.id.toString();

      // 1. Kullanıcıyı bul
      const user = await prisma.user.findUnique({
         where: { id: telegramIdString },
         select: { id: true, firstName: true }, // Sadece gerekli alanları seç
      });

      if (!user) {
         return NextResponse.json(
            { error: "Kullanıcı veritabanında bulunamadı." },
            { status: 404 }
         );
      }

      // 2. Kullanıcının tüm ürünlerini çek
      const products = await prisma.product.findMany({
         where: { userId: user.id },
         orderBy: { createdAt: "desc" }, // En yeni ürünler üstte olsun
         // İsteğe bağlı olarak sadece gösterilecek alanları seçebilirsiniz
      });

      // const serializedProducts = products.map((p) => serializeBigInts(p));

      return NextResponse.json(
         {
            products: products,
            // user: serializeBigInts(user),
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
