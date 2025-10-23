"use client"; // 👈 This makes it a Client Component

import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import Link from "next/link"; // 👈 Import the Link component
import { usePathname } from "next/navigation"; // 👈 Import the hook
import { cn } from "@/lib/utils";

// 1. Add 'href' to the component's props
interface NavButtonProps {
  children: ReactNode;
  href: string; // The link the button navigates to (e.g., "/dashboard", "/")
}

const NavButton = ({ children, href }: NavButtonProps) => {
  // 2. Get the current path
  const currentPath = usePathname();

  // 3. Determine if the button is the active one
  const isActive = currentPath === href;

  // 4. Define the base and active classes
  const baseClasses =
    "flex-1 p-6 rounded-full shadow-inner transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl active:scale-95 ";

  // Class for when the button is NOT the current page
  const inactiveClasses = "bg-background text-primary";

  // Class for when the button IS the current page
  // We're inverting the colors here for a clear active state.
  const activeClasses = "bg-primary text-background shadow-2xl";

  return (
    // 5. Wrap the Button with the Link component
    <Link href={href} passHref className="flex-1 via-gray-500 flex">
      <Button
        className={cn`${baseClasses}  ${isActive ? activeClasses : inactiveClasses}`}
        size={"icon"}
      >
        {children}
      </Button>
    </Link>
  );
};

export default NavButton;