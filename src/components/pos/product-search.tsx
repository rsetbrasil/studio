
"use client";

import React, { useState, useMemo, forwardRef } from 'react';
import { useProducts, type Product } from '@/context/ProductsContext';
import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandInput } from '@/components/ui/command';
import { formatBRL } from '@/lib/utils';
import { Search } from 'lucide-react';

type ProductSearchProps = {
  onProductSelect: (product: Product) => void;
};

export const ProductSearch = forwardRef<HTMLInputElement, ProductSearchProps>(
  ({ onProductSelect }, ref) => {
    const { products: allProducts } = useProducts();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
      if (!searchTerm) return [];
      const lowercasedTerm = searchTerm.toLowerCase();
      return allProducts.filter((product) =>
        product.name.toLowerCase().includes(lowercasedTerm) ||
        String(product.id).toLowerCase().includes(lowercasedTerm)
      );
    }, [searchTerm, allProducts]);

    const handleSelect = (value: string) => {
      // The value is in the format "product.name product.id"
      const productId = value.split(' ').pop();
      const product = allProducts.find((p) => p.id === productId);
      
      if (product) {
        onProductSelect(product);
      }
      setSearchTerm(''); // Clear input after selection
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            setSearchTerm('');
        }
    }

    return (
        <Command shouldFilter={false} className="relative flex-1 min-w-[300px] overflow-visible">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <CommandInput
                    ref={ref}
                    placeholder="Buscar produto por nome ou código..."
                    className="w-full text-base h-10 pl-10"
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    onKeyDown={handleKeyDown}
                />
            </div>
            
            {searchTerm && filteredProducts.length > 0 && (
                <div className="absolute top-full mt-2 w-full z-10">
                    <CommandList className="rounded-lg border bg-card text-card-foreground shadow-md">
                        <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                        <CommandGroup>
                            {filteredProducts.map((product) => (
                            <CommandItem
                                key={product.id}
                                value={`${product.name} ${product.id}`}
                                onSelect={handleSelect}
                            >
                                <div className="flex justify-between w-full">
                                <span>{product.name}</span>
                                <span className="text-muted-foreground">
                                    Estoque: {product.stock} | {formatBRL(product.packPrice)}
                                </span>
                                </div>
                            </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </div>
            )}
        </Command>
    );
  }
);

ProductSearch.displayName = 'ProductSearch';
