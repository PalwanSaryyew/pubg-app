   // /app/api/addproduct/route.ts
   import { getUserDataFromInitData, validateTelegramInitData } from "@/lib/auth";
   import { NextRequest, NextResponse } from "next/server";
   // fs/promises modülünden writeFile, access ve mkdir fonksiyonlarını import ediyoruz
   import { writeFile, access, mkdir } from "fs/promises";
   import { constants } from "fs"; // Dizin erişimi için F_OK sabitini import ediyoruz
   import path from "path";

   // Bu fonksiyon, dosya yükleme ve işlemleri yönetir
   export async function POST(request: NextRequest) {
      try {
         // 1. FormData'yı al
         const formData = await request.formData(); // 2. Metin alanlarını al

         const initData = formData.get("initData") as string | null;
         const title = formData.get("title") as string | null;
         const description = formData.get("description") as string | null; // 3. Dosyaları al (AddProductField'daki 'images' name'ini kullanıyoruz)

         const files = formData.getAll("images") as File[]; // Birden çok dosya olabilir // 4. Doğrulama (initData'yı kontrol et)

         if (!initData) {
            console.error("initData eksik.");
            return NextResponse.json(
               { error: "initData eksik." },
               { status: 400 }
            );
         }

         const isDataValid = await validateTelegramInitData(initData);
         const userData = await getUserDataFromInitData(initData);

         if (process.env.DEVELOPMENT !== "true" && !isDataValid) {
            return NextResponse.json(
               { error: "Yetkisiz erişim. initData doğrulanamadı." },
               { status: 401 }
            );
         } // 5. Dosyaları Kaydet

         const uploadedFilePaths: string[] = [];
         const uploadDir = path.join(process.cwd(), "public/uploads"); // ****************************************************** // YÜKLEME DİZİNİ KONTROL VE OLUŞTURMA KISMI (ENOENT hatası çözümü)

         try {
            // Dizin var mı ve erişilebilir mi diye kontrol et
            await access(uploadDir, constants.F_OK);
         } catch (error: unknown) {
            // Eğer yoksa (ENOENT hatası alınırsa), dizini oluştur
            if ((error as NodeJS.ErrnoException).code === "ENOENT") {
               await mkdir(uploadDir, { recursive: true }); // Klasör yoksa oluştur
               console.log(`Yükleme dizini oluşturuldu: ${uploadDir}`);
            } else {
               // Başka bir hata türü varsa, hatayı tekrar fırlat
               throw error;
            }
         } // ******************************************************
         for (const file of files) {
            if (file.size === 0) continue; // Boş dosyaları atla

            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `${Date.now()}-${file.name.replace(/ /g, "_")}`;
            const filepath = path.join(uploadDir, filename);

            await writeFile(filepath, buffer);
            uploadedFilePaths.push(`/uploads/${filename}`);
         } // 6. Veritabanına kaydetme işlemi (buraya kodunuzu ekleyin) // Örneğin: saveProductToDatabase({ title, description, userData, uploadedFilePaths });

         console.log("Kullanıcı Verisi:", userData);
         console.log("Başlık:", title);
         console.log("Açıklama:", description);
         console.log("Yüklenen Dosya Yolları:", uploadedFilePaths); // 7. Başarılı bir yanıt döndür

         return NextResponse.json(
            {
               message: "Ürün ve resimler başarıyla alındı ve işlendi!",
               product: { title, description },
               files: uploadedFilePaths,
               user: userData,
            },
            { status: 200 }
         );
      } catch (error) {
         console.error("API isteği işlenirken hata oluştu:", error);
         return NextResponse.json(
            { error: "Sunucu hatası. Dosya veya veri işlenemedi." },
            { status: 500 }
         );
      }
   }
