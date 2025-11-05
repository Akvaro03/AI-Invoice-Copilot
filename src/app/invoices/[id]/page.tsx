"use client";
import AskPdfForm from "@/feature/invoices/components/AskPdfForm";
import { useParams } from "next/navigation";
function InvoiceDetails() {
  const params = useParams<{ id: string }>();
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <AskPdfForm idPDF={params.id} />
    </div>
  );
}

export default InvoiceDetails;
