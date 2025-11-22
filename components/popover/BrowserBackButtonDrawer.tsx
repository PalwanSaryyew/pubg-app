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
import { Badge } from "@/components/ui/badge";
import { WebApp } from "@twa-dev/types";
import { webApp as Webapp } from "@/lib/webApp";
import { ProductCardProps } from "../product/ProductCard";
import { ProductPhotosCarousel } from "../product/ProductPhotosCarousel";

// TWA Tip Tanımlamaları (shareMessage özelliğini ekliyoruz)
const isTwaAvailable = (
   app: WebApp
): app is WebApp & {
   BackButton: unknown;
   initData: string;
   shareMessage: (msgId: string, callback?: (result: boolean) => void) => void;
} => {
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
   const [isSharing, setIsSharing] = React.useState(false); // Paylaşım butonu loading durumu

   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

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

   // --- GÜNCELLENMİŞ PAYLAŞIM FONKSİYONU ---
   const handleSmartShare = async () => {
      if (!isTwaAvailable(webApp)) {
         alert("Bu özellik sadece Telegram içinde çalışır.");
         return;
      }

      // Kullanıcı ID'sini TWA verisinden alıyoruz
      const userId = webApp.initDataUnsafe?.user?.id;

      if (!userId) {
         alert("Kullanıcı bilgisi alınamadı.");
         return;
      }

      setIsSharing(true);

      try {
         const response = await fetch("/api/share/prepare", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               productId: id,
               title: name,
               price: price,
               description: description,
               imageUrl: imageUrls[0],
               userId: userId, // 👈 BURADA BACKEND'E ID GÖNDERİYORUZ
            }),
         });

         if (!response.ok) {
            throw new Error("API Hatası");
         }

         const data = await response.json();

         if (data.preparedMessageId) {
            webApp.shareMessage(data.preparedMessageId, (result) => {
               if (result) {
                  console.log("Mesaj başarıyla paylaşıldı!");
               }
            });
         } else {
            console.error("Mesaj ID alınamadı");
         }
      } catch (error) {
         console.error("Paylaşım hatası:", error);
      } finally {
         setIsSharing(false);
      }
   };
   // -------------------------------------------------------------

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

   // --- İÇERİK ---
   const DrawerLoadingContent = () => (
      <div className="flex-1 overflow-y-auto px-4">
         <div className="flex justify-center pt-4">
            <Skeleton className="h-64 w-full rounded-xl" />
         </div>
         <div className="mt-4 space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
         </div>
      </div>
   );

   const DrawerRealContent = () => (
      <div className="flex-1 overflow-y-auto px-4">
         <div className="flex justify-center pt-4">
            <ProductPhotosCarousel imageUrls={imageUrls} />
         </div>
         <DrawerHeader className="px-0 mt-4 text-left">
            <DrawerTitle className="text-2xl font-bold text-left">
               {name}
            </DrawerTitle>
            <div className="text-left mt-2">
               <Badge variant={"secondary"} className="text-sm">
                  {price} TMT
               </Badge>
            </div>
            <DrawerDescription className="mt-2 text-base text-left leading-relaxed">
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
            {isLoading && !isOpen ? (
               <DrawerLoadingContent />
            ) : (
               <DrawerRealContent />
            )}

            <DrawerFooter className="pt-2 bg-card rounded-t-4xl border-t">
               <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden">
                  <Button
                     variant="secondary"
                     disabled={isLoading && !isOpen}
                     className="w-full rounded-sm shadow-none border-none bg-popover hover:bg-secondary text-foreground"
                  >
                     Satyn al
                  </Button>

                  <Button
                     variant="secondary"
                     disabled={isLoading && !isOpen}
                     className="w-full rounded-sm shadow-none border-none bg-popover hover:bg-secondary text-foreground"
                  >
                     Teswirler
                  </Button>

                  {/* PAYLAŞ BUTONU */}
                  <Button
                     variant="secondary"
                     onClick={handleSmartShare} // Yeni fonksiyon
                     disabled={(isLoading && !isOpen) || isSharing}
                     className="w-full rounded-sm shadow-none border-none bg-popover hover:bg-secondary text-foreground"
                  >
                     {isSharing ? "Hazırlanıyor..." : "Paýlaş"}
                  </Button>

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
