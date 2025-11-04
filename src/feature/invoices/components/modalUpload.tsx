import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import UploadFormInvoice from "./uploadForm";
import useUploadForm from "../hooks/useUploadForm";

export function ModalUpload() {
  const { saveFile } = useUploadForm();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent
        className="
        !max-w-none            /* pisa sm:max-w-[425px] de shadcn */
        w-[95vw] h-[95vh]      /* fallback en mobile */
        sm:w-[80vw] sm:h-[80vh]/* 80% de la ventana desde sm+ */
        p-0 overflow-hidden    /* que el contenido use todo el espacio */
        "
      >
        <form id="upload-form" onSubmit={saveFile}>
          <UploadFormInvoice />
        </form>
      </DialogContent>
    </Dialog>
  );
}
