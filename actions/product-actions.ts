"use server";

import prisma from "@/prisma/prismaConf"; // Prisma client'ının olduğu yer
import { revalidatePath } from "next/cache";

// Ürün listelemesini duraklat/devam ettir
export async function toggleProductStatus(
   productId: string,
   currentStatus: boolean
) {
   try {
      await prisma.product.update({
         where: { id: productId },
         data: { isPublished: !currentStatus }, // Veya isActive, şemana göre
      });
      revalidatePath("/myproducts");
      return { success: true };
   } catch (error) {
      return { success: false, error: "Durum güncellenemedi" };
   }
}

// Ürünü silme
export async function deleteProduct(productId: string) {
   try {
      await prisma.product.delete({
         where: { id: productId },
      });
      revalidatePath("/myproducts");
      return { success: true };
   } catch (error) {
      return { success: false, error: "Ürün silinemedi" };
   }
}
