// /app/myproducts/page.tsx
'use client'
import { useWebApp } from "@/context/WebAppContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Loader2, AlertTriangle } from "lucide-react";
import Image from "next/image";

// Ürün tipi (Prisma modelinize göre ayarlayın)
interface Product {
    id: string;
    title: string;
    description: string;
    images: string[];
    createdAt: string;
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
                const response = await fetch('/api/myproducts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ initData: webApp.initData }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setProducts(data.products || []);
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || "Ürünler yüklenirken bir hata oluştu.");
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
                    <p>Ürünler ýüklenýär...</p>
                </div>
            )}

            {error && (
                <div className="flex items-center p-4 rounded-lg bg-red-100 text-red-800">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <p>Hata: {error}</p>
                </div>
            )}
            
            {/* Ürün Listesi */}
            {!isLoading && !error && (
                products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 mt-10">
                        Hiç hili satlyk hasap tapylmady. Täze hasap goşmak üçin Goş düwmesine basyň.
                    </p>
                )
            )}
        </div>
    );
}

// Küçük bir yardımcı bileşen (Card)
const ProductCard = ({ product }: { product: Product }) => {
    // İlk resmi veya varsayılan resmi kullan
    const imageUrl = product.images[0] || "/placeholder.png"; 

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
                <AspectRatio ratio={16 / 9} className="rounded-t-lg overflow-hidden bg-gray-100">
                    <Image 
                        src={imageUrl} 
                        alt={product.title} 
                        className="w-full h-full object-cover" 
                    />
                </AspectRatio>
            </CardContent>
            <CardHeader>
                <CardTitle className="truncate">{product.title}</CardTitle>
                <CardDescription className="line-clamp-2">{product.description}</CardDescription>
            </CardHeader>
            <CardFooter className="text-sm text-gray-500">
                Goşulan wagty: {new Date(product.createdAt).toLocaleDateString('tr-TR')}
            </CardFooter>
        </Card>
    );
};