// AddProductField.tsx
'use client'
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { AspectRatio } from "../ui/aspect-ratio";
import { ImagePlus, Upload, X } from "lucide-react"; // X ikonunu ekledik
import AddProductForm from "./AddProductForm";
import { useRef, useState, ChangeEvent } from "react"; // useState ve ChangeEvent ekledik
import Image from "next/image";

// Dosya önizleme türü
interface PreviewFile extends File {
    preview: string; // URL.createObjectURL ile oluşturulan önizleme URL'si
}

export default function AddProductField() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Seçilen ve önizlemesi yapılacak dosyaların listesi
    const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([]);
    
    // Yükleme formuna referans veriyoruz ki, dosya seçimi sonrası göndermeyi tetikleyebilelim.
    const formRef = useRef<HTMLFormElement>(null); 

    // Kullanıcı bir dosya seçtiğinde çalışacak event handler
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(event.target.files || []) as PreviewFile[];
        
        if (newFiles.length === 0) return;

        const filesWithPreview: PreviewFile[] = newFiles.map(file => 
            Object.assign(file, {
                preview: URL.createObjectURL(file)
            })
        );

        // Yeni seçilen dosyaları mevcut listeye ekle
        setSelectedFiles(prevFiles => [...prevFiles, ...filesWithPreview]);

        // ESKİ KOD KALDIRILDI: formRef.current?.dispatchEvent(new Event('submit', ...));
        // Yönlendirmeyi engellemek için otomatik gönderimi kaldırdık.

        // Input'u temizle ki, kullanıcı aynı dosyaları tekrar seçebilsin
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Önizlemeden dosya kaldırma
    const removeFile = (fileName: string) => {
        setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
        // Dosya input'unu da temizlemek gerekebilir (zorunlu değil, sadece görsel tutarlılık için)
        if (fileInputRef.current) {
             fileInputRef.current.value = '';
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Form'a ref veriyoruz */}
            <AddProductForm ref={formRef} filesToUpload={selectedFiles}>
                <FieldGroup>
                    {/* ... (Başlık ve Açıklama Alanları - Değişmedi) ... */}
                    <FieldSet>
                        <FieldLegend>PUBG Hasaby </FieldLegend>
                        <FieldDescription>
                            hasabyňyzy satlyga çykarmak üçin maglumatlary giriziň we
                            suratlary ýükläň.
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
                    {/* ... (Başlık ve Açıklama Alanları - Değişmedi) ... */}

                    {/* RESİM YÜKLEME VE ÖNİZLEME ALANI */}
                    <FieldSet>
                        {/* Önizleme Kapsayıcısı */}
                        {selectedFiles.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {selectedFiles.map((file, index) => (
                                    <div key={file.name} className="relative aspect-square">
                                        <Image 
                                            src={file.preview} 
                                            alt={`Önizleme ${index + 1}`} 
                                            className="w-full h-full object-cover rounded-md border border-gray-200"
                                        />
                                        {/* Kaldırma butonu */}
                                        <button 
                                            type="button"
                                            onClick={() => removeFile(file.name)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 leading-none shadow-md hover:bg-red-600 transition-colors"
                                        >
                                            <X size={12} />
                                        </button>
                                        {/* Ana Resim etiketi */}
                                        {index === 0 && (
                                             <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs font-bold px-1 rounded-sm">Esasy</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Yükleme Alanı */}
                        <AspectRatio
                            ratio={16 / 9}
                            className="bg-popover rounded-lg border-dashed border-2 grid py-2 cursor-pointer"
                            onClick={handleUploadClick} // Tıklama olayını ekle
                        >
                            <div className="justify-center flex items-end mb-1">
                                <ImagePlus color="gray" size={35} />
                            </div>
                            <CardHeader className="gap-0 divide-y-0">
                                <CardTitle className="text-center text-sm">
                                    Suratlary ýükläň
                                </CardTitle>
                                <CardDescription className="text-center text-xs ">
                                    Azyndan 1 surat bolmaly. Toplam {selectedFiles.length} surat seçildi.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="flex justify-center">
                                <Button 
                                    type="button" 
                                    variant={"secondary"} 
                                    size={"sm"}
                                    // Buton tıklaması yerine AspectRatio'yu kullandık, ancak buton da çalışmalı
                                    onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                                >
                                    <Upload className="w-4 h-4 mr-2" /> Seç
                                </Button>
                                <input
                                    type="file"
                                    name="images" 
                                    id="images"
                                    ref={fileInputRef} 
                                    multiple // Birden çok dosya yüklemeye izin ver
                                    accept="image/*" 
                                    className="sr-only" 
                                    onChange={handleFileChange} // Dosya seçildiğinde otomatik yüklemeyi tetikle
                                />
                            </CardFooter>
                        </AspectRatio>
                    </FieldSet>
                    
                    {/* ... (Açıklama Alanı - Değişmedi) ... */}
                     <FieldSet>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="description">
                                    Giňişleýin düşündiriş
                                </FieldLabel>
                                <Textarea
                                    minLength={20}
                                    maxLength={1000}
                                    id="description"
                                    name="description"
                                    placeholder="Goşmaça maglumatlary şu ýere giriziň..."
                                    className="resize-none"
                                />
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                    {/* ... (Açıklama Alanı - Değişmedi) ... */}
                    
                    <Field orientation="horizontal">
                         {/* Formu göndermek için bu butonu kullanabiliriz (metin verileri için) */}
                        <Button type="submit" className="w-full" disabled={selectedFiles.length === 0}>
                            Tabşyr (Metin ve Kayıt)
                        </Button>
                    </Field>
                </FieldGroup>
            </AddProductForm>
        </div>
    );
}