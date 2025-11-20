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
import { Badge } from "../ui/badge";
import { ButtonGroup, ButtonGroupSeparator } from "../ui/button-group";

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
   imageUrls,
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
      console.log(productId);

      // Ürün ID'sini de URL'ye ekleyebiliriz, ancak şimdilik sadece açma parametresini kullanıyoruz.
   };

   // Drawer'ın açılma/kapanma durumu değiştiğinde (shadcn/ui tarafından tetiklenir)
   const onOpenChange = (open: boolean) => {
      console.log(open);

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
   console.log(id);

   return (
      <Drawer open={isDrawerOpen} onOpenChange={onOpenChange}>
         <DrawerTrigger>{children}</DrawerTrigger>

         {/* 1. ADIM: DrawerContent'e yükseklik ve flex düzeni verin */}
         <DrawerContent className="!max-h-[90dvh]">
            {/* 2. ADIM: Kaydırılabilir (Scrollable) alan oluşturun */}
            {/* Bu div, footer hariç tüm içeriği kapsar ve kalan boşluğu doldurur */}
            <div className="flex-1 overflow-y-auto px-4">
               <div className="flex justify-center pt-4">
                  <ProductPhotosCarousel imageUrls={imageUrls} />
               </div>

               <DrawerHeader className="px-0">
                  {" "}
                  {/* İçerideki padding'i sıfırlayabilirsiniz */}
                  <DrawerTitle>{name}</DrawerTitle>
                  <DrawerDescription>{description}</DrawerDescription>
               </DrawerHeader>
            </div>

            {/* 3. ADIM: Footer her zaman en altta sabit kalır */}
            <DrawerFooter className="pt-2 bg-card rounded-t-4xl border-t">
               {/* Dış Kapsayıcı:
    - grid-cols-2: İkiye böl
    - gap-px: Butonlar arasında 1px boşluk bırak (çizgi için)
    - bg-border: O boşluklardan görünecek çizgi rengi (Shadcn border rengi)
    - rounded-2xl: Köşeleri daha fazla yuvarla
    - overflow-hidden: Butonlar köşelerden taşmasın
    - border: En dışa çerçeve çiz
*/}
               <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden">
                  {/* 1. Buton (Sol Üst) */}
                  <Button
                     variant="secondary"
                     className="w-full rounded-sm shadow-none border-none bg-accent hover:bg-accent text-foreground"
                  >
                     Satyn al
                  </Button>

                  {/* 2. Buton (Sağ Üst) */}
                  <Button
                     variant="secondary"
                     className="w-full rounded-sm shadow-none border-none bg-accent hover:bg-accent text-foreground"
                  >
                     Teswirler
                  </Button>

                  {/* 3. Buton (Sol Alt) */}
                  <Button
                     variant="secondary"
                     className="w-full rounded-sm shadow-none border-none bg-accent hover:bg-accent text-foreground"
                  >
                     Paýlaş
                  </Button>

                  {/* 4. Buton (Sağ Alt - Kapat) */}
                  <DrawerClose asChild>
                     <Button
                        variant="secondary"
                        className="w-full rounded-sm shadow-none border-none bg-accent hover:bg-destructive hover:text-destructive-foreground text-foreground"
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
