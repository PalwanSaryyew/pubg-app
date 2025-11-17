// AddProductForm.tsx 
'use client'
import { useWebApp } from "@/context/WebAppContext";
import { ReactNode } from "react";

const AddProductForm = ({ children }: { children: ReactNode }) => {
    const webApp = useWebApp(); 

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget; 
        const formData = new FormData(form); 
        
        // initData'yı manuel olarak FormData'ya eklemeliyiz,
        // çünkü bu bir form alanı değil.
        
            formData.append('initData', webApp ? webApp.initData : '...');
        

        try {
            // FormData kullanırken Content-Type başlığını manuel ayarlamıyoruz!
            const response = await fetch("/api/addproduct", {
                method: "POST",
                // headers: {
                //    "Content-Type": "application/json", // KALDIRILDI!
                // },
                body: formData, // JSON.stringify yerine doğrudan FormData'yı gönderiyoruz
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Ürün başarıyla gönderildi!", data);
                // Başarı durumunda kullanıcıya bildirim gösterilebilir
            } else {
                const error = await response.json();
                console.error("API isteği hatası:", error);
                // Hata durumunda kullanıcıya bildirim gösterilebilir
            }

        } catch (error) {
            console.error("İletişim hatası:", error);
        }
    };

    return <form onSubmit={handleSubmit}>{children}</form>;
};

export default AddProductForm;