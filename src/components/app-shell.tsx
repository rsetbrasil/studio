
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DollarSign,
  FileText,
  Home,
  Landmark,
  ListOrdered,
  LogOut,
  Package,
  PanelLeft,
  Settings,
  ShoppingCart,
  Tag,
  Truck,
  User,
  Users,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PDVRsetLogo } from "./icons";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Painel", roles: ["Administrador", "Gerente"] },
  { href: "/pos", icon: ShoppingCart, label: "Ponto de Venda", roles: ["Administrador", "Gerente", "Vendedor"] },
  { href: "/cash-register", icon: Landmark, label: "Caixa", roles: ["Administrador", "Gerente"] },
  { href: "/sales", icon: Tag, label: "Vendas", roles: ["Administrador", "Gerente"] },
  { href: "/reports", icon: FileText, label: "Relatórios", roles: ["Administrador", "Gerente"] },
  { href: "/orders", icon: ListOrdered, label: "Pedidos", roles: ["Administrador", "Gerente", "Vendedor"] },
  { href: "/products", icon: Package, label: "Produtos", roles: ["Administrador", "Gerente"] },
  { href: "/suppliers", icon: Truck, label: "Fornecedores", roles: ["Administrador", "Gerente"] },
  { href: "/financial", icon: DollarSign, label: "Financeiro", roles: ["Administrador", "Gerente"] },
  { href: "/users", icon: Users, label: "Usuários", roles: ["Administrador"] },
  { href: "/account", icon: Settings, label: "Configurações", roles: ["Administrador"] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const accessibleNavItems = React.useMemo(() => {
    if (!user) return [];
    return navItems.filter(item => item.roles.includes(user.role));
  }, [user]);

  const pageTitle =
    accessibleNavItems.find((item) => pathname.startsWith(item.href))?.label || "Página";

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <div className="flex h-14 items-center border-b px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <PDVRsetLogo className="h-6 w-6 text-primary" />
            <span>PDVRset</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start gap-1 px-4 text-sm font-medium">
            {accessibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  pathname.startsWith(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <div className="flex flex-col sm:pl-60 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Alternar Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu Principal</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <PDVRsetLogo className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">PDVRset</span>
                </Link>
                {accessibleNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 px-2.5 ${
                      pathname.startsWith(item.href)
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Painel</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative ml-auto flex items-center gap-2 md:grow-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/account" className="w-full h-full">Configurações</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Suporte</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild variant="outline" size="sm" onClick={logout}>
               <Link href="/login">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
