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
import { ImagePlus, Upload } from "lucide-react";
import AddProductForm from "./AddProductForm";
import { useRef } from "react"; // useRef hook'unu ekleyin

export default function AddProductField() {
    // Gizli dosya girişine erişmek için bir ref oluşturun
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Butona tıklandığında dosya girişini tetikleme fonksiyonu
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <AddProductForm>
                <FieldGroup>
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

                    <FieldSet>
                        <AspectRatio
                            ratio={16 / 9}
                            className="bg-popover rounded-lg border-dashed border-2 grid py-2"
                        >
                            <div className="justify-center flex items-end mb-1">
                                <ImagePlus color="gray" size={35} />
                            </div>
                            <CardHeader className="gap-0 divide-y-0">
                                <CardTitle className="text-center text-sm">
                                    Suratlary ýükläň
                                </CardTitle>
                                <CardDescription className="text-center text-xs ">
                                    Azyndan 1 surat bolmaly. Birinji ýüklenen surat esasy
                                    surat bolar.
                                </CardDescription>
                            </CardHeader>
                            <CardFooter className="flex justify-center">
                                {/* Dosya yükleme butonu, gizli input'u tetikler */}
                                <Button 
                                    type="button" 
                                    variant={"secondary"} 
                                    size={"sm"}
                                    onClick={handleUploadClick} // Tıklama olayını ekle
                                >
                                    <Upload className="w-4 h-4 mr-2" /> Ýükle
                                </Button>
                                {/* GİZLİ DOSYA YÜKLEME INPUT'U */}
                                <input
                                    type="file"
                                    name="images" // ÖNEMLİ: FormData'nın dosyaları yakalaması için bir 'name' verin.
                                    id="images"
                                    ref={fileInputRef} // Ref'i ekle
                                    multiple // Birden çok dosya yüklemeye izin ver
                                    accept="image/*" // Yalnızca resim dosyalarını kabul et
                                    className="sr-only" // Görünmez yap
                                />
                            </CardFooter>
                        </AspectRatio>
                    </FieldSet>
                    
                    {/* ... diğer alanlar */}
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
                    {/* ... diğer alanlar */}
                    
                    <Field orientation="horizontal">
                        <Button type="submit" className="w-full">
                            Tabşyr
                        </Button>
                    </Field>
                </FieldGroup>
            </AddProductForm>
        </div>
    );
}