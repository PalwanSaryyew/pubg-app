// app/api/share/prepare/route.ts
import { APP_NAME, BOT_USERNAME } from "@/lib/settings";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { productId, title, description, price, imageUrl, userId } =
      await request.json();

    // 1. User ID Kontrolü
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    const startAppParam = `product-${productId}`;
    const deepLinkUrl = `https://t.me/${BOT_USERNAME}/${APP_NAME}?startapp=${startAppParam}`;

    // --- 2. URL DÜZELTME ---
    let finalImageUrl = imageUrl;

    if (
      !finalImageUrl ||
      !finalImageUrl.startsWith("http") ||
      finalImageUrl.includes("localhost") ||
      finalImageUrl.includes("127.0.0.1")
    ) {
      console.log(
        "⚠️ Geçersiz resim URL'si, placeholder kullanılıyor."
      );
      finalImageUrl =
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop";
    }
    // ------------------------

    // --- 3. 🔥 CAPTION UZUNLUK KONTROLÜ (YENİ KISIM) ---
    // Telegram Caption Limiti: 1024 karakter (HTML etiketleri dahil)
    
    // Başlık, Fiyat ve HTML etiketleri için ortalama bir pay ayıralım (Örn: 200 karakter)
    // Bu sayede description için güvenli bir alan kalır.
    const MAX_DESCRIPTION_LENGTH = 800; 

    let safeDescription = description || "";

    // Eğer açıklama çok uzunsa kes ve '...' ekle
    if (safeDescription.length > MAX_DESCRIPTION_LENGTH) {
        safeDescription = safeDescription.substring(0, MAX_DESCRIPTION_LENGTH) + "...";
    }
    // ---------------------------------------------------

    const telegramData = {
      user_id: userId,
      result: {
        type: "photo",
        id: productId, 
        photo_url: finalImageUrl, 
        thumb_url: finalImageUrl, 

        // 🔥 DÜZELTİLMİŞ CAPTION
        // 'description' yerine 'safeDescription' kullanıyoruz
        caption: `<b>${title}</b>\n<u>${price} TMT</u>\n<blockquote expandable>${safeDescription}</blockquote>`,
        
        parse_mode: "HTML", 

        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔎Giňişleýin görmek🔍",
                url: deepLinkUrl,
              },
            ],
          ],
        },
      },
      allow_user_chats: true,
      allow_group_chats: true,
      allow_channel_chats: true,
    };

    const apiResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/savePreparedInlineMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegramData),
      }
    );

    const apiResult = await apiResponse.json();

    if (!apiResult.ok) {
      console.error("Telegram API Error:", apiResult);
      throw new Error(apiResult.description);
    }

    return NextResponse.json({
      preparedMessageId: apiResult.result.id,
    });
  } catch (error) {
    console.error("Prepared message error:", error);
    return NextResponse.json(
      { error: "Mesaj hazırlanamadı" },
      { status: 500 }
    );
  }
}