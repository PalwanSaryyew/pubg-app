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
import { Skeleton } from "@/components/ui/skeleton";
import { WebApp } from "@twa-dev/types";
import { webApp as Webapp } from "@/lib/webApp";
import { ProductCardProps } from "../product/ProductCard";
import { ProductPhotosCarousel } from "../product/ProductPhotosCarousel";

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
  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL kontrolü
  const isOpen = searchParams.get("product-id") === id;

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

  // Yükleme durumu kontrolü
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsLoading(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const openDrawer = () => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("product-id", id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const closeDrawer = React.useCallback(() => {
    const currentId = searchParams.get("product-id");
    if (currentId === id) {
       router.back();
    }
  }, [id, searchParams, router]);

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setIsLoading(false);
      closeDrawer();
    }
  };

  React.useEffect(() => {
    if (!isTwaAvailable(webApp)) return;
    const handleTwaBack = () => router.back();

    if (isOpen) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(handleTwaBack);
    } else {
      webApp.BackButton.hide();
      webApp.BackButton.offClick(handleTwaBack);
    }

    return () => {
      webApp.BackButton.offClick(handleTwaBack);
    };
  }, [isOpen, webApp, router]);

  // --- İÇERİK BİLEŞENLERİ ---
  const DrawerLoadingContent = () => (
    <div className="flex-1 overflow-y-auto px-4">
      <div className="flex justify-center pt-4">
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <div className="mt-4 space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );

  const DrawerRealContent = () => (
    <div className="flex-1 overflow-y-auto px-4">
      <div className="flex justify-center pt-4">
        <ProductPhotosCarousel imageUrls={imageUrls} />
      </div>
      <DrawerHeader className="px-0 mt-4 text-left">
        <DrawerTitle className="text-2xl font-bold">{name}</DrawerTitle>
        <div className="text-xl font-semibold text-primary mt-2">
          {price}
        </div>
        <DrawerDescription className="mt-2 text-base leading-relaxed">
          {description}
        </DrawerDescription>
      </DrawerHeader>
    </div>
  );

  return (
    <Drawer open={isOpen || isLoading} onOpenChange={onOpenChange}>
      <div onClick={openDrawer} className="cursor-pointer">
        {children}
      </div>

      <DrawerContent className="!max-h-[90dvh] flex flex-col focus:outline-none">
        
        {/* İçerik */}
        {isLoading && !isOpen ? <DrawerLoadingContent /> : <DrawerRealContent />}

        {/* Footer - ESKİ TASARIM */}
        <DrawerFooter className="pt-2 bg-card rounded-t-4xl border-t">
          {/* gap-px ve bg-border: Butonlar arası ince çizgiyi oluşturur.
              rounded-2xl ve overflow-hidden: Köşeleri yuvarlar.
          */}
          <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden">
            {/* 1. Buton (Sol Üst) */}
            <Button
              variant="secondary"
              disabled={isLoading && !isOpen}
              className="w-full rounded-sm shadow-none border-none bg-popover hover:bg-secondary text-foreground"
            >
              Satyn al
            </Button>

            {/* 2. Buton (Sağ Üst) */}
            <Button
              variant="secondary"
              disabled={isLoading && !isOpen}
              className="w-full rounded-sm shadow-none border-none bg-popover hover:bg-secondary text-foreground"
            >
              Teswirler
            </Button>

            {/* 3. Buton (Sol Alt) */}
            <Button
              variant="secondary"
              disabled={isLoading && !isOpen}
              className="w-full rounded-sm shadow-none border-none bg-popover hover:bg-secondary text-foreground"
            >
              Paýlaş
            </Button>

            {/* 4. Buton (Sağ Alt - Kapat) */}
            <DrawerClose asChild>
              <Button
                variant="secondary"
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