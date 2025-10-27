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

export function AddProductField() {
   return (
      <div className="w-full max-w-md">
         <form>
            <FieldGroup>
               <FieldSet>
                  <FieldLegend>PUBG Hasaby </FieldLegend>
                  <FieldDescription>
                     hasabyňyzy satlyga çykarmak üçin maglumatlary giriziň we
                     suratlary ýükläň.
                  </FieldDescription>
                  <FieldGroup>
                     <Field>
                        <FieldLabel htmlFor="add-title">
                           Gysgaça ady
                        </FieldLabel>
                        <Input
                           id="add-title"
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
                        <Button variant={'secondary'} size={"sm"}>
                           <Upload /> Ýükle
                        </Button>
                     </CardFooter>
                  </AspectRatio>
               </FieldSet>
               <FieldSet>
                  <FieldGroup>
                     <Field>
                        <FieldLabel htmlFor="add-description">
                           Giňişleýin düşündiriş
                        </FieldLabel>
                        <Textarea
                           id="add-description"
                           placeholder="Goşmaça maglumatlary şu ýere giriziň..."
                           className="resize-none"
                        />
                     </Field>
                  </FieldGroup>
               </FieldSet>
               <Field orientation="horizontal">
                  <Button type="submit" className="w-full">
                     Tabşyr
                  </Button>
               </Field>
            </FieldGroup>
         </form>
      </div>
   );
}
