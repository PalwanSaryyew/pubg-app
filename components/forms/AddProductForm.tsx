"use client";
import { useWebApp } from "@/context/WebAppContext";
import { ReactNode } from "react";

const AddProductForm = ({ children }: { children: ReactNode }) => {
   const webApp = useWebApp();

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      if (!webApp) return;

      await fetch("/api/addproduct", {
         method: "POST",
         body: JSON.stringify({
            initData: webApp.initData,
            title: "Test Product",
            description: "This is a test product.",
         }),
      });
   };
   return <form onSubmit={(e) => handleSubmit(e)}>{children}</form>;
};

export default AddProductForm;
