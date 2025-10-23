import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { BrowserBackButtonDrawer } from "../popover/BrowserBackButtonDrawer";

export interface ProductCardProps {
   id: string;
   name: string;
   description: string;
   price: string;
   imageUrl: string;
}

export default function ProductCard({
   id,
   name,
   description,
   price,
   imageUrl,
}: ProductCardProps) {
   return (
      <BrowserBackButtonDrawer
         id={id}
         name={name}
         description={description}
         price={price}
         imageUrl={imageUrl}
      >
         <Card className="w-full overflow-hidden pt-0 pb-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="p-0">
               <div className="relative w-full aspect-video">
                  <Image
                     fill
                     src={imageUrl}
                     alt={name}
                     className="object-cover"
                  />
               </div>
               <CardTitle className="text-lg sm:text-xl font-bold leading-tight truncate px-2">
                  {name}
               </CardTitle>
               {/* <CardAction>Card Action</CardAction> */}
            </CardHeader>
            <CardContent className="px-2">
               <CardDescription className="text-sm sm:text-base line-clamp-2">
                  {description}
               </CardDescription>
            </CardContent>
            <CardFooter className="text-lg px-4 md:text-2xl font-extrabold text-primary">
               {price}
            </CardFooter>
         </Card>
      </BrowserBackButtonDrawer>
   );
}
