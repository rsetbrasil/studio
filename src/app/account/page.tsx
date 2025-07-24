
"use client";

import React, { useState, useEffect } from "react";
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
import { ResetProductsDialog } from "@/components/account/reset-products-dialog";
import { useSales } from "@/context/SalesContext";
import { useOrders } from "@/context/OrdersContext";
import { useFinancial } from "@/context/FinancialContext";
import { useCashRegister } from "@/context/CashRegisterContext";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/context/ProductsContext";
import { useCompany, type CompanyInfo } from "@/context/CompanyContext";

export default function AccountPage() {
  const { companyInfo, updateCompanyInfo, isMounted } = useCompany();
  const [localCompanyInfo, setLocalCompanyInfo] = useState<CompanyInfo>(companyInfo);
  
  const [isResetDataDialogOpen, setResetDataDialogOpen] = useState(false);
  const [isResetProductsDialogOpen, setResetProductsDialogOpen] = useState(false);

  const { resetSales } = useSales();
  const { resetOrders } = useOrders();
  const { resetTransactions } = useFinancial();
  const { resetHistory } = useCashRegister();
  const { resetProducts } = useProducts();
  const { toast } = useToast();
  
  useEffect(() => {
    if(isMounted) {
      setLocalCompanyInfo(companyInfo);
    }
  }, [companyInfo, isMounted]);

  const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalCompanyInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    updateCompanyInfo(localCompanyInfo);
    toast({
      title: "Informações da Empresa Salvas!",
      description: "Os dados foram atualizados com sucesso.",
    });
  };

  const handleResetData = () => {
    resetSales();
    resetOrders();
    resetTransactions();
    resetHistory();
    setResetDataDialogOpen(false);
    toast({
      title: "Dados Operacionais Redefinidos!",
      description: "As informações de vendas, pedidos, financeiro e caixa foram zeradas.",
    });
  };

  const handleResetProducts = () => {
    resetProducts();
    setResetProductsDialogOpen(false);
    toast({
      title: "Produtos Redefinidos!",
      description: "Todos os dados de produtos, categorias e unidades de medida foram zerados.",
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
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>
              Essas informações serão exibidas nos comprovantes de venda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tradeName">Nome Fantasia</Label>
                <Input name="tradeName" id="tradeName" value={localCompanyInfo.tradeName} onChange={handleCompanyInfoChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="businessName">Razão Social</Label>
                <Input name="businessName" id="businessName" value={localCompanyInfo.businessName} onChange={handleCompanyInfoChange} />
              </div>
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input name="address" id="address" value={localCompanyInfo.address} onChange={handleCompanyInfoChange} />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="cityStateZip">Cidade/Estado - CEP</Label>
                <Input name="cityStateZip" id="cityStateZip" value={localCompanyInfo.cityStateZip} onChange={handleCompanyInfoChange} />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input name="phone" id="phone" value={localCompanyInfo.phone} onChange={handleCompanyInfoChange} />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input name="cnpj" id="cnpj" value={localCompanyInfo.cnpj} onChange={handleCompanyInfoChange} />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="ie">Inscrição Estadual (IE)</Label>
                <Input name="ie" id="ie" value={localCompanyInfo.ie} onChange={handleCompanyInfoChange} />
              </div>
            </form>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
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
          <CardContent className="space-y-4">
            <div>
              <Button variant="destructive" onClick={() => setResetProductsDialogOpen(true)}>
                Zerar Cadastro de Produtos
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Esta ação irá apagar permanentemente todos os produtos, categorias e unidades de medida. Outros dados como vendas e financeiro não serão afetados.
              </p>
            </div>
            <div>
              <Button variant="destructive" onClick={() => setResetDataDialogOpen(true)}>
                Zerar Dados Operacionais
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Esta ação irá apagar permanentemente todas as vendas, pedidos, transações financeiras e histórico de caixa. O cadastro de produtos não será afetado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <ResetDataDialog
        isOpen={isResetDataDialogOpen}
        onClose={() => setResetDataDialogOpen(false)}
        onConfirm={handleResetData}
      />
      <ResetProductsDialog
        isOpen={isResetProductsDialogOpen}
        onClose={() => setResetProductsDialogOpen(false)}
        onConfirm={handleResetProducts}
      />
    </AppShell>
  );
}
