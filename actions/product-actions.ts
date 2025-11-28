// actions/product-actions.ts
"use server";

import prisma from "@/prisma/prismaConf";
import { revalidatePath } from "next/cache";

export async function toggleProductStatus(
   productId: string,
   currentStatus: boolean
) {
   try {
      await prisma.product.update({
         where: { id: productId },
         data: { isPublished: !currentStatus },
      });
      // Sunucu önbelleğini temizle
      revalidatePath("/myproducts");
      return { success: true };
   } catch (error) {
      console.error("Status update error:", error);
      return { success: false, error: "Veritabanı hatası" };
   }
}

export async function deleteProduct(productId: string) {
   try {
      await prisma.product.delete({
         where: { id: productId },
      });
      revalidatePath("/myproducts");
      return { success: true };
   } catch (error) {
      console.error("Delete product error:", error);
      return { success: false, error: "Silme işlemi başarısız" };
   }
}
