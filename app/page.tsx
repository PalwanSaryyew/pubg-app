import ProductCard from "@/components/product/ProductCard";

// Örnek ürün verisi
const sampleProducts = [
   {
      id: "1",
      name: "betinden gowy pubg akk",
      description:
         "eylen beylen seylen anry bari ol bul odur budur garynja yorunja Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio sed laboriosam eligendi laudantium itaque deleniti, iusto minima aliquam quidem amet!" ,
      price: "1.299,00 TMT",
      imageUrl: "/acc.jpg",
   },
   {
      id: "2",
      name: "gowy pubg akk",
      description: "eylen beylen seylen anry bari ol bul",
      price: "1.299,00 TMT",
      imageUrl: "/acc.jpg",
   },
   {
      id: "3",
      name: "gowy pubg akk",
      description: "eylen beylen seylen anry bari ol bul",
      price: "1.299,00 TMT",
      imageUrl: "/acc.jpg",
   },
   {
      id: "4",
      name: "gowy pubg akk",
      description: "eylen beylen seylen anry bari ol bul",
      price: "1.299,00 TMT",
      imageUrl: "/acc.jpg",
   },
   {
      id: "5",
      name: "gowy pubg akk",
      description: "eylen beylen seylen anry bari ol bul",
      price: "1.299,00 TMT",
      imageUrl: "/acc.jpg",
   },
   {
      id: "6",
      name: "gowy pubg akk",
      description: "eylen beylen seylen anry bari ol bul",
      price: "1.299,00 TMT",
      imageUrl: "/acc.jpg",
   },

   {
      id: "7",
      name: "gowy pubg akk",
      description: "eylen beylen seylen anry bari ol bul",
      price: "1.299,00 TMT",
      imageUrl: "/acc.jpg",
   },

   {
      id: "8",
      name: "gowy pubg akk",
      description: "eylen beylen seylen anry bari ol bul",
      price: "1.299,00 TMT",
      imageUrl: "/acc.jpg",
   },

   {
      id: "9",
      name: "gowy pubg akk",
      description: "eylen beylen seylen anry bari ol bul",
      price: "1.299,00 TMT",
      imageUrl: "/acc.jpg",
   },
];

export default function page() {
   return (
      <div
         className="
      grid gap-6 px-4 
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
               name={sampleProduct.name}
               description={sampleProduct.description}
               price={sampleProduct.price}
               imageUrl={sampleProduct.imageUrl}
            />
         ))}
      </div>
   );
}
