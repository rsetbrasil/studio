
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, UserRole } from '@/context/UsersContext';

type UserDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userData: Omit<User, 'id'>) => void;
  user?: User | null;
};

const roles: UserRole[] = ["Administrador", "Gerente", "Vendedor"];

export function UserDialog({ isOpen, onClose, onConfirm, user }: UserDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Vendedor');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  const isEditing = !!user;

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setRole(user.role || 'Vendedor');
      } else {
        setName('');
        setEmail('');
        setRole('Vendedor');
      }
      setPassword('');
      setConfirmPassword('');
    }
  }, [user, isOpen]);

  const handleConfirm = () => {
    if (!name || !email || !role) {
      toast({
        title: "Campos Obrigatórios",
        description: "Nome, e-mail e nível de acesso são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!isEditing && !password) {
        toast({
            title: "Senha Obrigatória",
            description: "A senha é obrigatória para novos usuários.",
            variant: "destructive",
        });
        return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "Os campos de senha e confirmação de senha devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    const userData: Omit<User, 'id'> = {
      name,
      email,
      role,
    };

    if (password) {
      userData.password = password;
    }

    onConfirm(userData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do usuário abaixo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Nível de Acesso</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" placeholder={isEditing ? 'Deixe em branco para manter' : ''} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirmPassword" className="text-right">Confirmar Senha</Label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={handleConfirm}>
            {user ? 'Salvar Alterações' : 'Adicionar Usuário'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
