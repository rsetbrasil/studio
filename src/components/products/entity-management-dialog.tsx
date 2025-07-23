
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type EntityManagementDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: string[];
  onAdd: (item: string) => void;
  onUpdate: (oldItem: string, newItem: string) => void;
};

export function EntityManagementDialog({
  isOpen,
  onClose,
  title,
  items,
  onAdd,
  onUpdate,
}: EntityManagementDialogProps) {
  const [editingItems, setEditingItems] = useState<Record<string, string>>({});
  const [newItem, setNewItem] = useState('');
  const { toast } = useToast();

  const handleInputChange = (oldItem: string, value: string) => {
    setEditingItems(prev => ({ ...prev, [oldItem]: value }));
  };

  const handleSave = (oldItem: string) => {
    const updatedValue = editingItems[oldItem];
    if (updatedValue && updatedValue.trim() !== '') {
      onUpdate(oldItem, updatedValue.trim());
      const { [oldItem]: _, ...rest } = editingItems;
      setEditingItems(rest);
      toast({ title: 'Item atualizado com sucesso!' });
    }
  };

  const handleAddNew = () => {
    if (newItem.trim() !== '' && !items.includes(newItem.trim())) {
      onAdd(newItem.trim());
      setNewItem('');
      toast({ title: 'Novo item adicionado!' });
    } else {
      toast({ title: 'Item inválido ou já existente.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Adicionar novo..."
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
            />
            <Button onClick={handleAddNew} size="icon">
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-64 pr-4">
            <div className="space-y-2">
              {items.map(item => (
                <div key={item} className="flex items-center gap-2">
                  <Input
                    value={editingItems[item] ?? item}
                    onChange={e => handleInputChange(item, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave(item)}
                  />
                  {editingItems[item] && (
                    <>
                     <Button onClick={() => handleSave(item)} size="icon" variant="outline">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => setEditingItems(prev => {
                          const {[item]: _, ...rest} = prev;
                          return rest;
                      })} size="icon" variant="ghost">
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
