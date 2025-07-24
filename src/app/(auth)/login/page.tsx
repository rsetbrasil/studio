
"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PDVRsetLogo } from "@/components/icons";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("vendedor@example.com");
  const [password, setPassword] = useState("vendedor123");
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = () => {
    const success = login(email, password);
    if (success) {
      toast({ title: "Login realizado com sucesso!" });
      router.push("/dashboard");
    } else {
      toast({
        title: "Credenciais inválidas",
        description: "Por favor, verifique seu e-mail e senha.",
        variant: "destructive",
      });
    }
  };
  
  const handleDemoAccess = () => {
    const success = login('admin@pdvrset.com', 'admin123');
     if (success) {
      toast({ title: "Acessando como Administrador" });
      router.push("/dashboard");
    } else {
       toast({
        title: "Falha no acesso Demo",
        description: "O usuário de demonstração não foi encontrado.",
        variant: "destructive",
      });
    }
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
             <PDVRsetLogo className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo ao PDVRset</CardTitle>
          <CardDescription>Insira suas credenciais para acessar sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button className="w-full" onClick={handleLogin}>
              Entrar
            </Button>
            <Button variant="secondary" className="w-full" onClick={handleDemoAccess}>
              Acessar como Admin (Demo)
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="#" className="underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
