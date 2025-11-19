// components/product/InfiniteProductList.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/generated/prisma/client";

// API'nin beklediği tiplerden biri.
interface ProductData {
    products: Product[];
}   

// Sunucudan gelen ilk verileri ve API URL'sini alır.
interface InfiniteProductListProps {
    initialProducts: Product[];
    apiUrl: string;
}

const PRODUCTS_PER_PAGE = 20; // API rotasıyla eşleşmelidir (varsayılan 'limit').

export default function InfiniteProductList({ initialProducts, apiUrl }: InfiniteProductListProps) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [page, setPage] = useState(2); // Başlangıçta 1. sayfa yüklendi, sonraki sayfa 2
    const [hasMore, setHasMore] = useState(initialProducts.length === PRODUCTS_PER_PAGE); // Daha fazla veri olup olmadığı
    const [isLoading, setIsLoading] = useState(false);
    
    // Sonsuz kaydırma için tetikleyici görevi görecek div elementi.
    const loaderRef = useRef<HTMLDivElement>(null); 

    // API'den bir sonraki sayfayı çeken asenkron fonksiyon
    const loadMoreProducts = useCallback(async () => {
        if (!hasMore || isLoading) return;

        setIsLoading(true);
        try {
            // API rotasına limit ve sayfa parametrelerini gönderiyoruz.
            const response = await fetch(`${apiUrl}/api/getall?limit=${PRODUCTS_PER_PAGE}&page=${page}`);

            if (!response.ok) {
                console.error("Daha fazla ürün yüklenirken hata oluştu.");
                setIsLoading(false);
                return;
            }

            const data: ProductData = await response.json();
            
            setProducts((prevProducts) => [...prevProducts, ...data.products]);
            setPage((prevPage) => prevPage + 1);

            // Gelen ürün sayısı istenen limitten az ise, daha fazla veri yoktur.
            if (data.products.length < PRODUCTS_PER_PAGE) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Veri çekme hatası:", error);
            // Burada kullanıcıya bir hata mesajı gösterebilirsiniz.
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, page, hasMore, isLoading]); // Bağımlılıkları ekliyoruz.

    // Intersection Observer'ı kur
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // Eğer tetikleyici alan görünüyorsa ve daha fazla veri varsa, loadMoreProducts'ı çağır
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMoreProducts();
                }
            },
            {
                root: null, // viewport'ı kök olarak kullan
                rootMargin: "0px",
                threshold: 1.0,
            }
        );

        const currentLoader = loaderRef.current;

        if (currentLoader) {
            observer.observe(currentLoader);
        }

        // Bileşen unmount edildiğinde observer'ı temizle
        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [loadMoreProducts, hasMore, isLoading]);


    return (
        <>
            <div
                className="
                    grid gap-2 px-4 
                    grid-cols-2              /* Varsayılan: İki Sütun */
                    sm:grid-cols-3           /* sm (640px) ve üstü: Üç Sütun */
                    md:grid-cols-4           /* md (768px) ve üstü: Dört Sütun */
                    lg:grid-cols-5           /* lg (1024px) ve üstü: Beş Sütun */
                    xl:grid-cols-6           /* xl (1280px) ve üstü: Altı Sütun */
                "
            >
                {/* Yüklenen tüm ürünleri listele */}
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.title}
                        description={product.description}
                        price={product.price}
                        imageUrls={product.images}
                    />
                ))}
            </div>

            {/* Tetikleyici ve Yüklenme Durumu Alanı */}
            {hasMore && (
                <div ref={loaderRef} className="col-span-full py-6 text-center">
                    {isLoading ? (
                        <p className="text-blue-500 font-semibold">Ürünler yükleniyor...</p>
                    ) : (
                        // LoaderRef bu div'e bağlandı. Kullanıcı bu alanı gördüğünde yeni veri çekilecek.
                        <p className="text-gray-400">Daha fazla ürün yüklenmek üzere.</p>
                    )}
                </div>
            )}
            
            {!hasMore && products.length > 0 && (
                <div className="col-span-full py-10 text-center text-gray-500">
                    Tüm ürünlere ulaştınız!
                </div>
            )}
            
            {products.length === 0 && (
                <div className="col-span-full text-center py-10 text-xl text-gray-500">
                    Hiçbir ürün bulunamadı.
                </div>
            )}
        </>
    );
}