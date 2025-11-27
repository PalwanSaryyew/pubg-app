// components/product/AddProductForm.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ImagePlus, Upload, X } from "lucide-react";
import { useRef, useState, ChangeEvent, FormEvent,  useEffect } from "react";
import Image from "next/image";
import { useWebApp } from "@/context/WebAppContext"; // Telegram WebApp Context'i
import { useRouter } from 'next/navigation';

// Dosya önizleme türü
interface PreviewFile extends File {
    preview: string; // URL.createObjectURL ile oluşturulan önizleme URL'si
}

export default function AddProductForm() {
    const webApp = useWebApp(); 
    const router = useRouter(); 
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null); // Gerekli değil, ancak tutarlılık için kalsın.

    // Durum Yönetimi
    const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([]);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ********** Dosya İşlemleri Mantığı **********

    // Kullanıcı bir dosya seçtiğinde çalışacak event handler
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(event.target.files || []) as PreviewFile[];

        if (newFiles.length === 0) return;

        // Dosya boyutunu ve sayısını kontrol et (Öneri)
        if (selectedFiles.length + newFiles.length > 6) {
             setStatusMessage("❌ Ýalňyş: Iň köp 6 surat ýükläp bilýäňiz.");
             return;
        }

        const filesWithPreview: PreviewFile[] = newFiles.map((file) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file),
            })
        );

        setSelectedFiles((prevFiles) => [...prevFiles, ...filesWithPreview]);
        setStatusMessage(null); // Dosya seçimi başarılıysa önceki hataları temizle.

        // Input'u temizle ki, kullanıcı aynı dosyaları tekrar seçebilsin
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Önizlemeden dosya kaldırma
    const removeFile = (fileName: string) => {
        // Kaldırılan dosyanın önizleme URL'sini serbest bırak
        const fileToRemove = selectedFiles.find(file => file.name === fileName);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.preview);
        }
        
        setSelectedFiles((prevFiles) =>
            prevFiles.filter((file) => file.name !== fileName)
        );
        setStatusMessage(null); 
    };
    
    // Bileşen unmount edildiğinde tüm önizleme URL'lerini temizle
    useEffect(() => {
        return () => {
            selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
        };
    }, [selectedFiles]); // selectedFiles değiştiğinde de eski URL'ler temizlenmeli, ancak unmount'ta tümünü temizlemek yeterli.

    const handleUploadClick = (e: React.MouseEvent) => {
         e.stopPropagation(); // Üstteki div'in de tıklamasını engelle
         fileInputRef.current?.click();
    };


    // ********** Form Gönderme Mantığı **********

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        if (isSubmitting) return; 

        if (selectedFiles.length === 0) {
            setStatusMessage("❌ Ýalňyş: Azyndan bir surat saýlaň.");
            return;
        }
        
        setIsSubmitting(true);
        setStatusMessage("Maglumatlar ugradylýar...");

        const form = event.currentTarget; 
        const formData = new FormData(form); 
        
        // Telegram initData'yı ekle
        formData.append('initData', webApp ? webApp.initData : '...');

        // Resimleri FormData'ya ekle
        // Not: <input name="images"> alanını silebiliriz, ancak burada formData.delete('images') yapmaya gerek yok.
        // Input alanı "sr-only" olduğu için sorun çıkarmaz.
        
        // Önemli: Input'tan gelen boş 'images' alanını sil ve kendi dosyalarımızı ekle
        formData.delete('images'); 
        selectedFiles.forEach((file) => {
            // 'file' objesi, File türünde olduğu için, burada 'file' ile 'file.name' doğru şekilde kullanılabilir.
            formData.append('images', file, file.name); 
        });
        
        try {
            const response = await fetch("/api/addproduct", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                // Başarılı Durum
                setStatusMessage("✅ Üstünlikli! Bildiriş goşuldy. Garaşyň...");
                setTimeout(() => {
                    router.push("/myproducts"); 
                }, 1500); 

            } else {
                const error = await response.json();
                const errorMessage = error.error || "Bilinmeyen bir hata oluştu.";
                setStatusMessage(`❌ Error: ${errorMessage}`);
                console.error("API isteği hatası:", error);
            }

        } catch (error) {
            setStatusMessage("❌ Tor ýalňyşlygy");
            console.error("İletişim hatası:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // ********** JSX Render **********

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} ref={formRef}>
                <FieldGroup>
                    {/* HESAP BİLGİLERİ */}
                    <FieldSet>
                        <FieldLegend>PUBG Hasaby </FieldLegend>
                        <FieldDescription>
                            hasabyňyzy satlyga çykarmak üçin maglumatlary giriziň we suratlary ýükläň.
                        </FieldDescription>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="title">Gysgaça ady</FieldLabel>
                                <Input
                                    id="title"
                                    name="title"
                                    minLength={5}
                                    maxLength={20}
                                    placeholder="20 simwoldan az"
                                    required
                                />
                            </Field>
                        </FieldGroup>
                    </FieldSet>

                    {/* FİYAT ALANI */}
                    <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="price">Bahasy (TMT)</FieldLabel>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number" // Sadece sayı girişi için
                                    min={1}
                                    step="0.01" // Kuruşlu fiyatlar için
                                    placeholder="Bahasyny giriziň"
                                    required
                                />
                            </Field>
                        </FieldGroup>
                    </FieldSet>

                    {/* RESİM YÜKLEME VE ÖNİZLEME ALANI */}
                    <FieldSet>
                        {/* Yükleme Alanı */}
                        <div
                            className="bg-popover rounded-lg border-dashed border-2 grid py-2 cursor-pointer min-h-[200px]"
                            onClick={handleUploadClick} // Her zaman butona tıklama işlevini çağır
                        >
                            {/* Önizleme Kapsayıcısı */}
                            {selectedFiles.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2 px-2">
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={file.name}
                                            className="relative aspect-square"
                                        >
                                            <Image
                                                src={file.preview}
                                                alt={`Önizleme ${index + 1}`}
                                                className="w-full h-full object-cover rounded-md border border-gray-200"
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                            {/* Kaldırma butonu */}
                                            <button
                                                type="button"
                                                onClick={(e) => { 
                                                    e.stopPropagation(); // Tıklandığında üstteki div'in click eventini engelle
                                                    removeFile(file.name);
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 leading-none shadow-md hover:bg-red-600 transition-colors z-10"
                                            >
                                                <X size={12} />
                                            </button>
                                            {/* Ana Resim etiketi */}
                                            {index === 0 && (
                                                <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs font-bold px-1 rounded-sm z-10">
                                                    Esasy
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="justify-center flex items-end mb-1">
                                        <ImagePlus color="gray" size={35} />
                                    </div>
                                    <CardHeader className="gap-0 divide-y-0">
                                        <CardTitle className="text-center text-sm">
                                            Suratlary ýükläň
                                        </CardTitle>
                                        <CardDescription className="text-center text-xs ">
                                            Azyndan 1 surat bolmaly.
                                        </CardDescription>
                                    </CardHeader>
                                </>
                            )}

                            <CardFooter className="flex justify-center mt-auto"> {/* mt-auto ile alta hizala */}
                                <Button
                                    type="button"
                                    variant={"secondary"}
                                    size={"sm"}
                                    onClick={handleUploadClick} // Sadece butonu tetikler
                                >
                                    <Upload className="w-4 h-4 mr-2" /> Saýla
                                </Button>
                                {/* Gizli Dosya Inputu */}
                                <input
                                    type="file"
                                    name="images" // name değeri FormData'ya bir giriş ekler, ancak biz manuel eklediğimiz için bu gerekli değil.
                                    id="images"
                                    ref={fileInputRef}
                                    multiple
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                />
                            </CardFooter>
                        </div>
                    </FieldSet>

                    {/* AÇIKLAMA ALANI */}
                    <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="description">Giňişleýin düşündiriş</FieldLabel>
                                <Textarea
                                    minLength={20}
                                    maxLength={10000}
                                    id="description"
                                    name="description"
                                    placeholder="Goşmaça maglumatlary şu ýere giriziň..."
                                    className="resize-none"
                                    required // Zorunlu alan ekledik
                                />
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                </FieldGroup>

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
                
                {/* BUTON: Gönderme işlemini tetikleyen tek nokta */}
                <div className="mt-4">
                    <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting || selectedFiles.length === 0}
                    >
                        {isSubmitting ? 'Ugradylýar...' : 'Tabşyr'}
                    </Button>
                </div>
            </form>
        </div>
    );
}