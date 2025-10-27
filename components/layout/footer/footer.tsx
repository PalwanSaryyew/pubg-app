import {
   ClipboardList,
   LayoutGrid,
   Mailbox,
   Plus,
   UserRound,
} from "lucide-react";
import { Button } from "../../ui/button";
import NavButton from "./navButton";

const Footer = () => {
   return (
      <div className="bg-secondary/75 backdrop-blur-2xl fixed flex items-center justify-around gap-2 bottom-0 right-0 left-0 h-16 px-4 border-t">
         <NavButton href="/notifications">
            <Mailbox className="scale-125"/>
         </NavButton>
         <NavButton href="/myproducts">
            <ClipboardList className="scale-125"/>
         </NavButton>
         <NavButton href="/">
            <LayoutGrid className="scale-125"/>
         </NavButton>
         <NavButton href="/addproduct">
            <Plus className="scale-125"/>
         </NavButton>
         <NavButton href="/profile">
            <UserRound className="scale-125"/>
         </NavButton>
      </div>
   );
};

export default Footer;
