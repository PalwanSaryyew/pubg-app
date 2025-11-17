// AddProductForm.tsx   
'use client'
import { useWebApp } from "@/context/WebAppContext";
import { ReactNode, forwardRef, Ref, useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "../ui/button";

interface AddProductFormProps {
    children: ReactNode;
    filesToUpload: File[]; // Hala resimleri FormData'ya eklemek için kullanıyoruz
}

const AddProductForm = forwardRef(
    ({ children, filesToUpload }: AddProductFormProps, ref: Ref<HTMLFormElement>) => {
        const webApp = useWebApp(); 
        const router = useRouter(); 
        const [statusMessage, setStatusMessage] = useState<string | null>(null);
        const [isSubmitting, setIsSubmitting] = useState(false);

        const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
            // Form, yalnızca "Tabşyr" butonuna basıldığında tetiklenmeli.
            // Dosya seçimi artık bu fonksiyonu otomatik olarak çağırmıyor.
            event.preventDefault();
            
            if (isSubmitting) return; 

            // Hata kontrolü: En az bir resim seçili mi?
            if (filesToUpload.length === 0) {
                 setStatusMessage("❌ Hata: Lütfen en az bir resim yükleyin.");
                 return;
            }
            
            setIsSubmitting(true);
            setStatusMessage("Ürün bilgileri gönderiliyor...");

            const form = event.currentTarget; 
            const formData = new FormData(form); 
            
            formData.append('initData', webApp ? webApp.initData : '...');

            // Formdaki metin verilerini ve seçilen resimleri (filesToUpload) FormData'ya ekle
            formData.delete('images'); 
            filesToUpload.forEach((file) => {
                // file.name, route.ts'deki dosya adı oluşturma mantığına yardımcı olur.
                formData.append('images', file, file.name); 
            });
            
            try {
                // ... (API Çağrısı ve Yanıt Yönetimi aynı kalır)
                const response = await fetch("/api/addproduct", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // BAŞARILI DURUM: Sadece burada yönlendirme yapılır.
                    setStatusMessage("✅ Başarılı! Ürün kaydedildi. Yönlendiriliyorsunuz...");
                    
                    // Yönlendirme, sadece ürünün ana kaydı başarıyla tamamlandığında gerçekleşir.
                    setTimeout(() => {
                        router.push("/myproducts"); 
                    }, 1500); 

                } else {
                    const error = await response.json();
                    const errorMessage = error.error || "Bilinmeyen bir hata oluştu.";
                    setStatusMessage(`❌ Hata: ${errorMessage}`);
                    console.error("API isteği hatası:", error);
                }

            } catch (error) {
                setStatusMessage("❌ Ağ Hatası: Sunucuya erişilemiyor veya işlem tamamlanamadı.");
                console.error("İletişim hatası:", error);
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
            <>
                <form onSubmit={handleSubmit} ref={ref}>
                    {children}
                    
                    {/* Yükleme ve Hata Mesajı Gösterme */}
                    {statusMessage && (
                        <p 
                            className={`mt-4 p-2 text-center rounded ${
                                statusMessage.includes('Başarılı') 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}
                        >
                            {statusMessage}
                        </p>
                    )}
                    
                    {/* BUTON: Yönlendirmeyi tetikleyen tek nokta */}
                    <div className="mt-4">
                        <Button type="submit" className="w-full" disabled={isSubmitting || filesToUpload.length === 0}>
                            {isSubmitting ? 'Gönderiliyor...' : 'Tabşyr'}
                        </Button>
                    </div>
                </form>
            </>
        );
    }
);

AddProductForm.displayName = 'AddProductForm';
export default AddProductForm;