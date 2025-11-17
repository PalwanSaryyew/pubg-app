import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

export function ProductPhotosCarousel({ imageUrls }: { imageUrls: string[] }) {
    return (
        // Karoselin dış konteyneri.
        <Carousel className="relative w-[80%] mx-auto"> {/* karoselin TAM genişliğini sabitledik */}
            <CarouselContent>
                {imageUrls.map((url, index) => (
                    // Buradaki w-full (veya diğer fraksiyonel sınıflar), Carousel'in görünüm alanına göre ayarlanır.
                    // Tailwind'deki 'basis-full' sınıfını kullanarak her slaytın tam genişlikte olmasını sağlayın.
                    <CarouselItem key={index} className="basis-full"> 
                        <Card className="m-0 p-0 overflow-clip rounded-lg shadow-md">
                            {/* w-full aspect-video: İçeriğin boyutunu sabitler (örneğin 16:9). */}
                            <CardContent className="relative w-full aspect-video"> 
                                <Image
                                    fill
                                    src={url}
                                    alt={`Product Photo ${index + 1}`}
                                    className="object-cover"
                                    // Next.js Image için resimlerin yüklendiği alanları tanımlamak gerekebilir (eğer bunlar harici URL'lerse)
                                    // sizes="(max-width: 768px) 100vw, 300px" // Örnek sizes prop'u
                                />
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            {/* Navigasyon Okları */}
            <CarouselPrevious className="absolute -left-5 top-1/2 -translate-y-1/2 " variant={'secondary'} />
            <CarouselNext className="absolute -right-5 top-1/2 -translate-y-1/2 " variant={'secondary'} />
        </Carousel>
    );
}