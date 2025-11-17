// /app/api/addproduct/route.ts
import { getUserDataFromInitData, validateTelegramInitData } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, access, mkdir } from "fs/promises";
import { constants } from "fs";
import path from "path";
// Prisma istemcisini import edin
import prisma from '@/lib/prisma'; // Varsayalım ki prisma istemciniz buradan import ediliyor


// Bu fonksiyon, dosya yükleme ve işlemleri yönetir
export async function POST(request: NextRequest) {
    try {
        // 1. FormData'yı al
        const formData = await request.formData();

        // 2. Metin alanlarını al
        const initData = formData.get("initData") as string | null;
        const title = formData.get("title") as string | null;
        const description = formData.get("description") as string | null;

        // 3. Dosyaları al
        const files = formData.getAll("images") as File[];

        // 4. Doğrulama
        if (!initData) {
            return NextResponse.json(
                { error: "initData eksik." },
                { status: 400 }
            );
        }

        const isDataValid = await validateTelegramInitData(initData);
        // Telegram initData'dan gelen kullanıcı verileri (örneğin { id: number, first_name: string, ... })
        const userData = await getUserDataFromInitData(initData); 

        if (process.env.DEVELOPMENT !== "true" && !isDataValid) {
            return NextResponse.json(
                { error: "Yetkisiz erişim. initData doğrulanamadı." },
                { status: 401 }
            );
        }

        if (!userData?.id) {
            return NextResponse.json(
                { error: "Kullanıcı kimliği alınamadı." },
                { status: 400 }
            );
        }

        // Zorunlu alan kontrolü
        if (!title || !description || files.length === 0) {
             return NextResponse.json(
                { error: "Başlık, açıklama ve en az bir resim gereklidir." },
                { status: 400 }
            );
        }

        // 5. Dosyaları Kaydet (Mevcut kodunuz)
        const uploadedFilePaths: string[] = [];
        const uploadDir = path.join(process.cwd(), "public/uploads");

        try {
            await access(uploadDir, constants.F_OK);
        } catch (error: unknown) {
            if ((error as NodeJS.ErrnoException).code === "ENOENT") {
                await mkdir(uploadDir, { recursive: true });
                console.log(`Yükleme dizini oluşturuldu: ${uploadDir}`);
            } else {
                throw error;
            }
        }

        for (const file of files) {
            if (file.size === 0) continue;

            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `${Date.now()}-${file.name.replace(/ /g, "_")}`;
            const filepath = path.join(uploadDir, filename);

            await writeFile(filepath, buffer);
            uploadedFilePaths.push(`/uploads/${filename}`);
        }

        // ******************************************************
        // 6. VERİTABANI İŞLEMLERİ (PRISMA)
        // ******************************************************

        // User Şemasını Upsert Et (varsa güncelle, yoksa oluştur)
        const user = await prisma.user.upsert({
            where: { id: userData?.id.toString() }, // Telegram ID'sine göre arama
            update: { 
                firstName: userData?.first_name,
                lastName: userData?.last_name || null,
                username: userData?.username || null,
                languageCode: userData?.language_code || null,
                lastActivity: new Date(), // Son aktiviteyi güncelle
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

        // Ürün Şemasını Oluştur
        const newProduct = await prisma.product.create({
            data: {
                title: title,
                description: description,
                // Resim yollarını ayırıcı ile tek bir string olarak kaydedebiliriz veya
                // eğer ProductImage şeması varsa, onu kullanmalıyız.
                // Basitlik için Product modelinizde 'images' string dizisi (String[]) olduğunu varsayalım.
                images: uploadedFilePaths, // Product modelinizin bu alanı String[] (dizi) olarak tuttuğunu varsayarız.
                
                // Kullanıcı ilişkisini kur
                userId: user.id, 
                // Diğer alanlar (fiyat, kategori vb.)
            },
        });


        console.log("Kullanıcı Verisi:", user);
        console.log("Yeni Ürün:", newProduct);
        console.log("Yüklenen Dosya Yolları:", uploadedFilePaths);

        // 7. Başarılı bir yanıt döndür
        return NextResponse.json(
            {
                message: "Ürün başarıyla kaydedildi ve resimler yüklendi!",
                product: newProduct,
                user: user,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("API isteği işlenirken hata oluştu:", error);
        // Hata durumunda 500 dön ve kullanıcıya genel bir hata mesajı ver.
        return NextResponse.json(
            { error: "Sunucu hatası. Kayıt işlemi tamamlanamadı." },
            { status: 500 }
        );
    }
}