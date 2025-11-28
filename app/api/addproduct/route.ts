// /app/api/addproduct/route.ts - Düzeltilmiş
// 1. Rota Segment Konfigürasyonları
// Dinamik çalışma zamanı sınırı. Maksimum değeri ortamınıza göre ayarlayın (Vercel'de 60 saniyeye kadar).
export const maxDuration = 3000; // Saniye cinsinden
// İstek gövdesi boyut sınırını 10MB olarak ayarla
export const config = {
   api: {
      bodyParser: {
         sizeLimit: "30mb",
      },
   },
};
import { getUserDataFromInitData, validateTelegramInitData } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, access, mkdir } from "fs/promises";
import { constants } from "fs";
import path from "path";
import prisma from "@/prisma/prismaConf";

// Bu fonksiyon, dosya yükleme ve işlemleri yönetir
export async function POST(request: NextRequest) {
   try {
      const formData = await request.formData();

      const initData = formData.get("initData") as string | null;
      const title = formData.get("title") as string | null;
      const priceString = formData.get("price") as string | null; // Adını değiştirdik
      const description = formData.get("description") as string | null;
      const files = formData.getAll("images") as File[];

      // ********** 4. Doğrulama (Geliştirme ve Production için ayrıldı) **********

      if (!initData) {
         return NextResponse.json(
            { error: "initData eksik." },
            { status: 400 }
         );
      }

      // Her durumda kullanıcı verisini ayrıştırmayı dene
      const userData = getUserDataFromInitData(initData);

      // Sadece production ortamında kriptografik doğrulama yap
      if (process.env.NODE_ENV === "production") {
         const isDataValid = validateTelegramInitData(initData);
         if (!isDataValid) {
            return NextResponse.json(
               { error: "Geçersiz initData. Yetkisiz erişim." },
               { status: 401 }
            );
         }
      }
      
      // userData ayrıştırılabildi mi ve içinde 'id' var mı diye kontrol et
      if (!userData?.id) {
         return NextResponse.json(
            { error: "Kullanıcı kimliği alınamadı. initData formatı yanlış olabilir." },
            { status: 400 }
         );
      }

      // Zorunlu alan kontrolü
      if (!title || title.length < 5) {
         return NextResponse.json(
            { error: "Başlık en az 5 karakter olmalıdır." },
            { status: 400 }
         );
      }
      if (!description || description.length < 20) {
         return NextResponse.json(
            { error: "Açıklama en az 20 karakter olmalıdır." },
            { status: 400 }
         );
      }
      if (files.length === 0 || !priceString) {
         return NextResponse.json(
            { error: "Fiyat ve en az bir resim gereklidir." },
            { status: 400 }
         );
      }

      // Fiyatı Sayıya Çevirme ve Kontrol (BURADA HATA OLABİLİRDİ!)
      const price = parseFloat(priceString);
      if (isNaN(price) || price <= 0) {
         return NextResponse.json(
            { error: "Geçerli bir fiyat girilmelidir." },
            { status: 400 }
         );
      }

      // ********** 5. Dosyaları Kaydet (GÜNCELLENDİ) **********
      const uploadedFilePaths: string[] = [];

      // DEĞİŞİKLİK 1: "public" ibaresini kaldırdık.
      // Artık proje kök dizininde (root) "uploads" diye bir klasöre yazacak.
      const uploadDir = path.join(process.cwd(), "uploads");

      try {
         await access(uploadDir, constants.F_OK);
      } catch (error: unknown) {
         if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            await mkdir(uploadDir, { recursive: true });
         } else {
            throw error;
         }
      }

      for (const file of files) {
         // File tipindeki verilerin doğru olduğundan emin ol
         if (file.size === 0 || !(file instanceof File)) continue;

         const buffer = Buffer.from(await file.arrayBuffer());

         // Dosya isimlendirme (Mevcut mantık korundu)
         const filename = `${Date.now()}-${file.name.replace(/ /g, "_")}`;
         const filepath = path.join(uploadDir, filename);

         await writeFile(filepath, buffer);

         // DEĞİŞİKLİK 2: URL yapısını değiştirdik.
         // Artık direkt dosya yolu değil, API route adresini kaydediyoruz.
         // Frontend bu URL'e istek attığında, aşağıda oluşturacağımız API çalışacak.
         uploadedFilePaths.push(`/api/images/${filename}`);
      }

      // ********** 6. VERİTABANI İŞLEMLERİ (PRISMA) **********

      // Kullanıcı Kaydı/Güncelleme
      const user = await prisma.user.upsert({
         where: { id: userData?.id.toString() },
         update: {
            firstName: userData?.first_name,
            lastName: userData?.last_name || null,
            username: userData?.username || null,
            languageCode: userData?.language_code || null,
            lastActivity: new Date(),
         },
         create: {
            id: userData?.id.toString(),
            firstName: userData?.first_name,
            lastName: userData?.last_name || null,
            username: userData?.username || null,
            languageCode: userData?.language_code || null,
            lastActivity: new Date(),
         },
      });

      // Ürün Kaydı
      const newProduct = await prisma.product.create({
         data: {
            title: title,
            description: description,
            price: price, // Artık kontrol edilmiş parseFloat değeri
            images: uploadedFilePaths,
            userId: user.id,
         },
      });

      // ********** 7. Başarılı bir yanıt döndür **********
      return NextResponse.json(
         {
            message: "Ürün başarıyla kaydedildi ve resimler yüklendi!",
            product: newProduct,
         },
         { status: 200 }
      );
   } catch (error) {
      console.error(
         "API isteği işlenirken beklenmedik bir hata oluştu:",
         error
      );
      return NextResponse.json(
         { error: "Sunucu hatası. Kayıt işlemi tamamlanamadı." },
         { status: 500 }
      );
   }
}
