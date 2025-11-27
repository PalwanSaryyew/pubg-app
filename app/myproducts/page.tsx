// /app/myproducts/page.tsx
"use client";
import { useWebApp } from "@/context/WebAppContext";
import { useEffect, useState } from "react";

import { Loader2, AlertTriangle } from "lucide-react";

import { MyProductCard } from "@/components/product/my-product-card";

// Ürün tipi (Prisma modelinize göre ayarlayın)
interface Product {
   id: string;
   title: string;
   description: string;
   images: string[];
   isPublished: boolean;
   price: number;
   createdAt: Date;
   updatedAt: Date;
   userId: string;
}

export default function MyProductsPage() {
   const webApp = useWebApp();
   const [products, setProducts] = useState<Product[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      // initData mevcut değilse Telegram ortamında değiliz demektir.
      if (!webApp?.initData) {
         setIsLoading(false);
         setError("Telegram ortamı tespit edilemedi.");
         return;
      }

      const fetchProducts = async () => {
         setIsLoading(true);
         setError(null);

         try {
            const response = await fetch("/api/myproducts", {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({ initData: webApp.initData }),
            });

            if (response.ok) {
               const data = await response.json();
               setProducts(data.products || []);
            } else {
               const errorData = await response.json();
               setError(
                  errorData.error || "Ürünler yüklenirken bir hata oluştu."
               );
            }
         } catch (err) {
            console.error(err);
            setError("Ağ hatası: Sunucuya erişilemiyor.");
         } finally {
            setIsLoading(false);
         }
      };

      fetchProducts();
   }, [webApp?.initData]); // initData değiştiğinde tekrar çek

   return (
      <div className="p-4 max-w-2xl mx-auto">
         <h1 className="text-2xl font-bold mb-6">Meniň Satlyk Hasaplarym</h1>

         {/* Yükleme ve Hata Durumları */}
         {isLoading && (
            <div className="flex justify-center items-center h-40">
               <Loader2 className="w-6 h-6 animate-spin mr-2" />
               <p>Önümler ýüklenýär...</p>
            </div>
         )}

         {error && (
            <div className="flex items-center p-4 rounded-lg bg-red-100 text-red-800">
               <AlertTriangle className="w-5 h-5 mr-2" />
               <p>Error: {error}</p>
            </div>
         )}

         {/* Ürün Listesi */}
         {!isLoading &&
            !error &&
            (products.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                     <MyProductCard key={product.id} product={product} />
                  ))}
               </div>
            ) : (
               <p className="text-center text-gray-500 mt-10">
                  Hiç hili satlyk hasap tapylmady. Täze hasap goşmak üçin Goş
                  düwmesine basyň.
               </p>
            ))}
      </div>
   );
}
