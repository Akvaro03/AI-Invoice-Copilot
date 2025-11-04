"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  MoreVertical,
  Calendar,
  DollarSign,
  Building2,
  ArrowUpDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ModalUpload } from "@/feature/invoices/components/modalUpload";

interface Invoice {
  id: string;
  number: string;
  company: string;
  date: Date;
  amount: number;
  status: "paid" | "pending" | "overdue";
  fileName: string;
}

const sampleInvoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2024-001",
    company: "Acme Corporation",
    date: new Date("2024-01-15"),
    amount: 2500.0,
    status: "paid",
    fileName: "factura_acme_enero.pdf",
  },
  {
    id: "2",
    number: "INV-2024-002",
    company: "TechStart Solutions",
    date: new Date("2024-01-20"),
    amount: 1850.5,
    status: "paid",
    fileName: "factura_techstart_enero.pdf",
  },
  {
    id: "3",
    number: "INV-2024-003",
    company: "Global Industries",
    date: new Date("2024-02-05"),
    amount: 3200.75,
    status: "pending",
    fileName: "factura_global_febrero.pdf",
  },
  {
    id: "4",
    number: "INV-2024-004",
    company: "Digital Marketing Pro",
    date: new Date("2024-02-10"),
    amount: 1500.0,
    status: "paid",
    fileName: "factura_digital_febrero.pdf",
  },
  {
    id: "5",
    number: "INV-2024-005",
    company: "Innovate Labs",
    date: new Date("2024-02-15"),
    amount: 4100.25,
    status: "overdue",
    fileName: "factura_innovate_febrero.pdf",
  },
  {
    id: "6",
    number: "INV-2024-006",
    company: "Cloud Services Inc",
    date: new Date("2024-03-01"),
    amount: 2800.0,
    status: "pending",
    fileName: "factura_cloud_marzo.pdf",
  },
  {
    id: "7",
    number: "INV-2024-007",
    company: "Design Studio",
    date: new Date("2024-03-08"),
    amount: 1950.5,
    status: "paid",
    fileName: "factura_design_marzo.pdf",
  },
  {
    id: "8",
    number: "INV-2024-008",
    company: "Consulting Group",
    date: new Date("2024-03-12"),
    amount: 5500.0,
    status: "pending",
    fileName: "factura_consulting_marzo.pdf",
  },
];

export default function InvoiceList() {
  const [invoices] = useState<Invoice[]>(sampleInvoices);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "overdue":
        return "bg-red-500/10 text-red-500 border-red-500/20";
    }
  };

  const getStatusText = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "Pagada";
      case "pending":
        return "Pendiente";
      case "overdue":
        return "Vencida";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    if (sortBy === "date") {
      return b.date.getTime() - a.date.getTime();
    }
    return b.amount - a.amount;
  });

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <>
      <ModalUpload />
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mis Facturas</h1>
          <p className="text-muted-foreground text-lg">
            Gestiona y revisa todas tus facturas
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-accent/20 p-2">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Total
              </h3>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-green-500/20 p-2">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Pagado
              </h3>
            </div>
            <p className="text-3xl font-bold">{formatCurrency(paidAmount)}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-yellow-500/20 p-2">
                <DollarSign className="w-5 h-5 text-yellow-500" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Pendiente
              </h3>
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(pendingAmount)}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Todas las facturas ({invoices.length})
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  Ordenar por {sortBy === "date" ? "fecha" : "monto"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("date")}>
                  Fecha
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("amount")}>
                  Monto
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            {sortedInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="rounded-lg bg-accent/20 p-3 flex-shrink-0">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">
                        {invoice.number}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn("border", getStatusColor(invoice.status))}
                      >
                        {getStatusText(invoice.status)}
                      </Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        <span>{invoice.company}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(invoice.date)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {invoice.fileName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:flex-col md:items-end justify-between md:justify-start">
                  <p className="text-2xl font-bold">
                    {formatCurrency(invoice.amount)}
                  </p>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Eye className="w-4 h-4" />
                        Ver factura
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Download className="w-4 h-4" />
                        Descargar PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
