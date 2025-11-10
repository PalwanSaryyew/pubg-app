// context/WebAppContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { WebApp } from "@twa-dev/sdk";

const WebAppContext = createContext<WebApp | null>(null);

export const useWebApp = () => useContext(WebAppContext);

export const WebAppProvider = ({ children }: { children: React.ReactNode }) => {
   const [webApp, setWebApp] = useState<WebApp | null>(null);

   useEffect(() => {
      const initWebApp = async () => {
         if (typeof window === "undefined") return;
         const sdk = (await import("@twa-dev/sdk")).default;
         await sdk.ready();
         sdk.setHeaderColor(sdk.themeParams.header_bg_color);
         sdk.setBottomBarColor(sdk.themeParams.bottom_bar_bg_color);
         sdk.setBackgroundColor(sdk.themeParams.bg_color);
         sdk.requestFullscreen();
         setWebApp(sdk);
      };
      initWebApp();
   }, []);

   return (
      <WebAppContext.Provider value={webApp}>
         {children}
      </WebAppContext.Provider>
   );
};  