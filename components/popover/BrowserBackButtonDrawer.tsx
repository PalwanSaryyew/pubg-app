// app/components/BrowserBackButtonDrawer.tsx
"use client";
import * as React from "react";
import {
   Drawer,
   DrawerContent,
   DrawerTrigger,
   DrawerHeader,
   DrawerTitle,
   DrawerDescription,
   DrawerFooter,
   DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { WebApp } from "@twa-dev/types";
import { webApp as Webapp } from "@/lib/webApp"; // Varsayılan webApp yükleme fonksiyonunuz
import { ProductCardProps } from "../product/ProductCard";
import { ProductPhotosCarousel } from "../product/ProductPhotosCarousel";

// TWA'nın kullanılabilir olup olmadığını kontrol eden bir tip koruması (type guard)
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
   imageUrl,
}: ProductCardProps & {
   children: React.ReactNode;
}) {
   const [webApp, setWebApp] = React.useState<WebApp>({} as WebApp);
   const [isDrawerOpen, setDrawerState] = React.useState(false);

   // TWA SDK'yı asenkron olarak yüklerken:
   React.useEffect(() => {
      const initWebApp = async () => {
         if (typeof window !== "undefined") {
            try {
               const app = await Webapp();
               setWebApp(app);
            } catch (e: unknown) {
               // TWA ortamı yoksa veya yükleme başarısız olursa (normal tarayıcı)
               console.info(
                  "TWA WebApp yüklenemedi. Normal tarayıcı modunda çalışılıyor.",
                  e
               );
            }
         }
      };
      initWebApp();
   }, []);

   // Drawer'ı kapatma fonksiyonu
   const closeDrawer = React.useCallback(() => {
      setDrawerState(false);
   }, []);

   // Drawer'ı açma fonksiyonu
   const openDrawer = (productId: string) => {
      setDrawerState(true);
      // Ürün ID'sini de URL'ye ekleyebiliriz, ancak şimdilik sadece açma parametresini kullanıyoruz.
   };

   // Drawer'ın açılma/kapanma durumu değiştiğinde (shadcn/ui tarafından tetiklenir)
   const onOpenChange = (open: boolean) => {
      if (isDrawerOpen) {
         closeDrawer();
      } else {
         openDrawer("");
      }
   };

   // 1. TWA BackButton Görünürlüğünü Yönetme
   React.useEffect(() => {
      if (isTwaAvailable(webApp)) {
         if (isDrawerOpen) {
            webApp.BackButton.show();
         } else {
            webApp.BackButton.hide();
         }
      }
      return () => {
         if (isTwaAvailable(webApp)) {
            webApp.BackButton.hide();
         }
      };
   }, [isDrawerOpen, webApp]);

   // 2. TWA BackButton Olay Dinleyicisi
   React.useEffect(() => {
      if (isTwaAvailable(webApp)) {
         webApp.BackButton.onClick(closeDrawer);
      }
      return () => {
         if (isTwaAvailable(webApp)) {
            webApp.BackButton.offClick(closeDrawer);
         }
      };
   }, [webApp, closeDrawer]);

   return (
      <Drawer open={isDrawerOpen} onOpenChange={onOpenChange}>
         <DrawerTrigger>{children}</DrawerTrigger>
         <DrawerContent>
            <div className="flex justify-center pt-4">
               <ProductPhotosCarousel />
            </div>
            <DrawerHeader>
               <DrawerTitle>{name}</DrawerTitle>
               <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
               <Button>Satyjy bilen habarlas</Button>
               <DrawerClose></DrawerClose>
            </DrawerFooter>
         </DrawerContent>
      </Drawer>
   );
}
