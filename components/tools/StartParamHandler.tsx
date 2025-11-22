// app/components/StartParamHandler.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { webApp } from "@/lib/webApp"; // WebApp importunuz
import { WebApp as WebAppType } from "@twa-dev/types";

export function StartParamHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    const handleStartParam = async () => {
      // Eğer zaten işlendiyse veya tarayıcıda değilsek dur
      if (isProcessed || typeof window === "undefined") return;

      try {
        // WebApp'i yükle
        const app = (await webApp()) as WebAppType;

        // start_param var mı kontrol et (Örn: "product-123")
        const startParam = app.initDataUnsafe?.start_param;

        if (startParam && startParam.startsWith("product-")) {
          // "product-" kısmını atıp sadece ID'yi alalım
          const productId = startParam.replace("product-", "");

          // Şu anki URL'de zaten bu ürün açık mı?
          const currentProduct = searchParams.get("product-id");

          if (currentProduct !== productId) {
            console.log("🚀 Deep Link Algılandı! Ürün açılıyor:", productId);
            
            // URL'yi güncelle -> Drawer otomatik açılacak
            // replace kullanıyoruz ki 'Geri' tuşu geçmişi bozmasın
            router.replace(`/?product-id=${productId}`, { scroll: false });
          }
        }
      } catch (e) {
        console.error("Start param hatası:", e);
      } finally {
        setIsProcessed(true); // Bir kere çalıştıktan sonra işaretle
      }
    };

    handleStartParam();
  }, [router, searchParams, isProcessed]);

  return null; // Bu bileşen görünmez, sadece mantık çalıştırır
}