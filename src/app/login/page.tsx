
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useCompany } from '@/context/CompanyContext';
import { useToast } from '@/hooks/use-toast';
import { AppLogo } from '@/components/icons';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();
  const { companyInfo } = useCompany();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const loggedInUser = login(username, password);
    if (loggedInUser) {
      if (loggedInUser.role === 'Vendedor') {
        router.push('/pdv');
      } else {
        router.push('/painel');
      }
    } else {
      toast({
        title: 'Falha no Login',
        description: 'Usuário ou senha inválidos. Por favor, tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
               <AppLogo className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-2xl">{companyInfo.systemName}</CardTitle>
          <CardDescription>
            Digite seu usuário e senha para acessar o painel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Seu usuário"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
