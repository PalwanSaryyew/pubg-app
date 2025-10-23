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

export function ProductPhotosCarousel() {
   return (
      <Carousel className="relative">
         <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
               <CarouselItem key={index}>
                  <Card className="m-0 p-0 overflow-clip rounded-lg shadow-md">
                     <CardContent className="relative w-full aspect-video">
                        <Image
                           fill
                           src={"/acc.jpg"}
                           alt={"/acc.jpg"}
                           className="object-cover"
                        />
                     </CardContent>
                  </Card>
               </CarouselItem>
            ))}
         </CarouselContent>
         <CarouselPrevious className="absolute -left-5 top-1/2 -translate-y-1/2 " variant={'secondary'} />
         <CarouselNext className="absolute -right-5 top-1/2 -translate-y-1/2 " variant={'secondary'} />
      </Carousel>
   );
}
