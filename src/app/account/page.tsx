
"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResetDataDialog } from "@/components/account/reset-data-dialog";
import { useSales } from "@/context/SalesContext";
import { useOrders } from "@/context/OrdersContext";
import { useFinancial } from "@/context/FinancialContext";
import { useToast } from "@/hooks/use-toast";

export default function AccountPage() {
  const [isResetDialogOpen, setResetDialogOpen] = useState(false);
  const { resetSales } = useSales();
  const { resetOrders } = useOrders();
  const { resetTransactions } = useFinancial();
  const { toast } = useToast();

  const handleResetData = () => {
    resetSales();
    resetOrders();
    resetTransactions();
    setResetDialogOpen(false);
    toast({
      title: "Dados Redefinidos!",
      description: "As informações de vendas, pedidos e financeiro foram zeradas.",
    });
  };

  return (
    <AppShell>
      <div className="p-4 sm:px-6 sm:py-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais aqui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">Primeiro nome</Label>
                  <Input id="first-name" defaultValue="Admin" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Último nome</Label>
                  <Input id="last-name" defaultValue="User" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" defaultValue="admin@pdvrset.com" />
              </div>
            </form>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Salvar</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>
              Atualize sua senha. É recomendado usar uma senha forte e única.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </form>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Atualizar Senha</Button>
          </CardFooter>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
            <CardDescription>
              Ações irreversíveis. Tenha certeza antes de prosseguir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => setResetDialogOpen(true)}>
              Zerar Dados do Sistema
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Esta ação irá apagar permanentemente todas as vendas, pedidos e transações financeiras. Os produtos não serão afetados.
            </p>
          </CardContent>
        </Card>
      </div>
      <ResetDataDialog
        isOpen={isResetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleResetData}
      />
    </AppShell>
  );
}
