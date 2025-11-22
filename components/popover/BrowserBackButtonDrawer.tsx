// app/components/BrowserBackButtonDrawer.tsx
"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { WebApp } from "@twa-dev/types";
import { webApp as Webapp } from "@/lib/webApp";
import { ProductCardProps } from "../product/ProductCard";
import { ProductPhotosCarousel } from "../product/ProductPhotosCarousel";

// TWA Kontrolü
const isTwaAvailable = (
  app: WebApp
): app is WebApp & { BackButton: unknown; initData: string } => {
  return (
    !!app.initData &&
    !!app.BackButton &&
    typeof app.BackButton.show === "function"
  );
};

export function BrowserBackButtonDrawer({
  children,
  id,
  name,
  description,
  price,
  imageUrls,
}: ProductCardProps & {
  children: React.ReactNode;
}) {
  const [webApp, setWebApp] = React.useState<WebApp>({} as WebApp);

  // Next.js Router Hook'ları
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL'de 'product-id' bizim ID'mize eşit mi?
  const isOpen = searchParams.get("product-id") === id;

  // TWA Yükleme
  React.useEffect(() => {
    const initWebApp = async () => {
      if (typeof window !== "undefined") {
        try {
          const app = await Webapp();
          setWebApp(app);
        } catch (e) {
          console.error("TWA yüklenemedi", e);
        }
      }
    };
    initWebApp();
  }, []);

  // 1. AÇMA: URL'ye ID ekler
  const openDrawer = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("product-id", id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // 2. KAPATMA: Router geçmişinde geri gider
  // useCallback ile sarmaladık ama bağımlılıklarını azalttık.
  const closeDrawer = React.useCallback(() => {
    // Sadece eğer gerçekten açıksa geri git (History stack'i korumak için)
    const currentId = searchParams.get("product-id");
    if (currentId === id) {
       router.back();
    }
  }, [id, searchParams, router]);


  // Drawer UI üzerinden (kaydırarak) kapatıldığında tetiklenir
  const onOpenChange = (open: boolean) => {
    if (!open) {
      closeDrawer();
    }
  };

  // --- DÜZELTİLEN TWA LOGIC ---
  React.useEffect(() => {
    if (!isTwaAvailable(webApp)) return;

    // Handler'ı useEffect içinde tanımlıyoruz.
    // Böylece dışarıdaki 'closeDrawer' karmaşasından etkilenmiyor.
    // Router.back() zaten URL'yi değiştireceği için isOpen false olacak ve drawer kapanacak.
    const handleTwaBack = () => {
      router.back();
    };

    if (isOpen) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(handleTwaBack);
    } else {
      webApp.BackButton.hide();
      webApp.BackButton.offClick(handleTwaBack);
    }

    return () => {
      // Temizlik: Her durumda listener'ı kaldır
      webApp.BackButton.offClick(handleTwaBack);
    };
  }, [isOpen, webApp, router]); // 'closeDrawer' bağımlılığı kaldırıldı!

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <div onClick={openDrawer} className="cursor-pointer">
        {children}
      </div>

      <DrawerContent className="!max-h-[90dvh] flex flex-col focus:outline-none">
        <div className="flex-1 overflow-y-auto px-4">
          <div className="flex justify-center pt-4">
            <ProductPhotosCarousel imageUrls={imageUrls} />
          </div>

          <DrawerHeader className="px-0 mt-4 text-left">
            <DrawerTitle className="text-2xl font-bold">
              {name}
            </DrawerTitle>
            <div className="text-xl font-semibold text-primary mt-2">
              {price}
            </div>
            <DrawerDescription className="mt-2 text-base leading-relaxed">
              {description}
            </DrawerDescription>
          </DrawerHeader>
        </div>

        <DrawerFooter className="pt-2 bg-card rounded-t-4xl border-t">
          <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden">
            <Button
              variant="secondary"
              className="w-full rounded-sm shadow-none border-none bg-popover hover:bg-secondary text-foreground"
            >
              Satyn al
            </Button>
            <Button
              variant="secondary"
              className="w-full rounded-sm shadow-none border-none bg-popover hover:bg-secondary text-foreground"
            >
              Teswirler
            </Button>
            <Button
              variant="secondary"
              className="w-full rounded-sm shadow-none border-none bg-popover hover:bg-secondary text-foreground"
            >
              Paýlaş
            </Button>
            <DrawerClose asChild>
              <Button
                variant="secondary"
                // DrawerClose zaten context içinden close fonksiyonunu çağırır,
                // ama bizim URL mantığımızla çakışmaması için onClick ekleyebiliriz
                onClick={(e) => {
                   // DrawerClose'un varsayılan davranışını engellememize gerek yok
                   // ama router.back yapmasını istiyorsak burayı manuel yönetebiliriz.
                   // Şimdilik DrawerClose kalsın, onOpenChange(false) tetiklenecek.
                }}
                className="w-full rounded-sm shadow-none border-none bg-popover hover:bg-destructive hover:text-destructive-foreground text-foreground"
              >
                Ýap
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}