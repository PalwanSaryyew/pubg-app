// app/page.tsx
import InfiniteProductList from "@/components/product/InfiniteProductList";
import { getProducts } from "@/lib/data"; // Yeni fonksiyonu import et

const INITIAL_LIMIT = 20;

export default async function Page() {
   // Doğrudan Prisma'dan ilk veriyi çek
   const initialProducts = await getProducts({ limit: INITIAL_LIMIT, page: 1 });

   // Client Component'in daha sonraki sayfaları çekmesi için API URL'sini ilet
   const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

   return (
      <InfiniteProductList initialProducts={initialProducts} apiUrl={apiUrl} />
   );
}
