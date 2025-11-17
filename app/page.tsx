import ProductCard from "@/components/product/ProductCard";
import prisma from '@/prisma/prismaConf';

// Örnek ürün verisi
const sampleProducts = await prisma.product.findMany()

export default function page() {
   return (
      <div
         className="
      grid gap-2 px-4 
      grid-cols-2             /* Varsayılan: Tek Sütun */
      sm:grid-cols-3          /* sm (640px) ve üstü: İki Sütun */
      lg:grid-cols-4          /* lg (1024px) ve üstü: Üç Sütun (isteğe bağlı) */
      xl:grid-cols-5          /* xl (1280px) ve üstü: Dört Sütun (isteğe bağlı) */
    "
      >
         {/* ProductCard'lar burada listelenmeye devam ediyor */}
         {sampleProducts.map((sampleProduct) => (
            <ProductCard
               key={sampleProduct.id}
               id={sampleProduct.id}
               name={sampleProduct.title}
               description={sampleProduct.description}
               price={sampleProduct.price}
               imageUrls={sampleProduct.images}
            />
         ))}
      </div>
   );
}
