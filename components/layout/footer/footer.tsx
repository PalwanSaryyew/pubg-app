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
      <div className="bg-secondary/75 backdrop-blur-2xl fixed flex items-center justify-around gap-2 bottom-0 right-0 left-0 h-16 px-2 border-t">
         <NavButton href="/notifications">
            <Mailbox />
         </NavButton>
         <NavButton href="/myproducts">
            <ClipboardList />
         </NavButton>
         <NavButton href="/">
            <LayoutGrid />
         </NavButton>
         <NavButton href="/addproduct">
            <Plus />
         </NavButton>
         <NavButton href="/profile">
            <UserRound />
         </NavButton>
      </div>
   );
};

export default Footer;
