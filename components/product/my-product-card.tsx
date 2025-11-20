"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Eye, 
  MessageSquare, 
  PauseCircle, 
  PlayCircle 
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { deleteProduct, toggleProductStatus } from "@/actions/product-actions"
import { toast } from "sonner" // Veya kullandığın toast kütüphanesi
import { Product } from "@/lib/generated/prisma/client"

interface MyProductCardProps {
  product: Product
}

export function MyProductCard({ product }: MyProductCardProps) {
  
  const handleToggleStatus = async () => {
    const result = await toggleProductStatus(product.id, product.isPublished)
    if (result.success) {
      toast.success(product.isPublished ? "Ürün listeden kaldırıldı" : "Ürün yayına alındı")
    } else {
      toast.error("Bir hata oluştu")
    }
  }

  const handleDelete = async () => {
    // İstersen buraya bir "Emin misin?" dialog'u ekleyebiliriz
    const confirmDelete = confirm("Bu ürünü silmek istediğine emin misin?")
    if (!confirmDelete) return

    const result = await deleteProduct(product.id)
    if (result.success) {
      toast.success("Ürün silindi")
    } else {
      toast.error("Silinirken hata oluştu")
    }
  }

  return (
    <Card className="overflow-hidden flex flex-col justify-between">
      <div className="relative h-48 w-full">
        {/* Ürün Resmi (Varsa) */}
        <Image
          src={product.images?.[0] || "/placeholder.png"} // Resim yoksa placeholder
          alt={product.title}
          fill
          className="object-cover"
        />
        {/* Durum Rozeti */}
        <div className="absolute top-2 right-2">
            <Badge variant={product.isPublished ? "default" : "secondary"}>
                {product.isPublished ? "Yayında" : "Duraklatıldı"}
            </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{product.price} TL</p>
      </CardHeader>

      <CardFooter className="flex gap-2 pt-4">
        {/* Ana Buton: Düzenle */}
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/dashboard/edit/${product.id}`}>
            <Edit className="w-4 h-4 mr-2" />
            Düzenle
          </Link>
        </Button>

        {/* Diğer İşlemler Menüsü */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
            
            <DropdownMenuItem asChild>
              <Link href={`/product/${product.id}`} className="cursor-pointer">
                <Eye className="w-4 h-4 mr-2" /> Görüntüle
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href={`/dashboard/comments/${product.id}`} className="cursor-pointer">
                <MessageSquare className="w-4 h-4 mr-2" /> Yorumlar
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleToggleStatus} className="cursor-pointer">
              {product.isPublished ? (
                 <><PauseCircle className="w-4 h-4 mr-2" /> Listeyi Duraklat</>
              ) : (
                 <><PlayCircle className="w-4 h-4 mr-2" /> Listeyi Yayınla</>
              )}
            </DropdownMenuItem>

            <DropdownMenuItem 
                onClick={handleDelete} 
                className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
            >
              <Trash className="w-4 h-4 mr-2" /> Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}