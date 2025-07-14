
"use client";

import React, { useState, useMemo, forwardRef } from 'react';
import { Search } from 'lucide-react';
import { useProducts, type Product } from '@/context/ProductsContext';
import { Input } from '@/components/ui/input';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { formatBRL } from '@/lib/utils';

type ProductSearchProps = {
  onProductSelect: (product: Product) => void;
};

export const ProductSearch = forwardRef<HTMLInputElement, ProductSearchProps>(
  ({ onProductSelect }, ref) => {
    const { products: allProducts } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');
    const [isPopoverOpen, setPopoverOpen] = useState(false);

    const filteredProducts = useMemo(() => {
      if (!searchTerm) return [];
      return allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(product.id).includes(searchTerm)
      ).slice(0, 10); // Limit results for performance
    }, [searchTerm, allProducts]);

    const handleSelect = (product: Product) => {
      setSearchTerm('');
      setPopoverOpen(false);
      onProductSelect(product);
    };

    return (
      <Popover open={isPopoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={ref}
              type="text"
              placeholder="Buscar produto por nome ou código..."
              className="w-full text-base pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value) {
                  setPopoverOpen(true);
                } else {
                  setPopoverOpen(false);
                }
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
              <CommandGroup>
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={`${product.name} ${product.id}`}
                    onSelect={() => handleSelect(product)}
                  >
                    <div className="flex justify-between w-full">
                      <span>{product.name}</span>
                      <span className="text-muted-foreground">
                        Estoque: {product.stock} | {formatBRL(product.price)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

ProductSearch.displayName = 'ProductSearch';
