
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useProducts, type Product } from "@/context/ProductsContext";
import { useSales } from "@/context/SalesContext";
import { useOrders } from "@/context/OrdersContext";
import { formatBRL } from "@/lib/utils";
import { PlusCircle, Pencil, Search, Download, Upload, Trash } from "lucide-react";
import { ProductDialog } from "@/components/products/product-dialog";
import { DeleteProductDialog } from "@/components/products/delete-product-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type CsvProductImport = {
  id: string;
  nome: string;
  categoria: string;
  unidade_medida: string;
  preco_compra_fardo: string;
  preco_venda_fardo: string;
  unidades_por_fardo: string;
  estoque_fardo: string;
};

type ProductFormData = Omit<Product, 'id' | 'price'>;

const bulkProducts: ProductFormData[] = [
    { name: "AGUA DE COCO MAIS COCO 1L", category: "ÀGUAS", unitOfMeasure: "UNIDADE", cost: 13.64, packPrice: 15.9, unitsPerPack: 1, stock: 0 },
    { name: "AGUA DE COCO SOCOCO FRUTAS 200ML", category: "ÀGUAS", unitOfMeasure: "UNIDADE", cost: 2.46, packPrice: 3.9, unitsPerPack: 1, stock: 8 },
    { name: "AGUA DE COCO SOCOCO MARACUJA 200ML", category: "ÀGUAS", unitOfMeasure: "UNIDADE", cost: 2.46, packPrice: 3.9, unitsPerPack: 1, stock: 3 },
    { name: "AGUA DE COCO SOCOCO MELANCIA 200ML", category: "ÀGUAS", unitOfMeasure: "UNIDADE", cost: 2.46, packPrice: 3.9, unitsPerPack: 1, stock: 6 },
    { name: "AGUA DE COCO SOCOCO TANGERINA 200ML", category: "ÀGUAS", unitOfMeasure: "UNIDADE", cost: 2.46, packPrice: 3.9, unitsPerPack: 1, stock: 2 },
    { name: "AGUA SERRA GRANDE 1,5L", category: "ÀGUAS", unitOfMeasure: "FARDO", cost: 0, packPrice: 0.03, unitsPerPack: 6, stock: 0 },
    { name: "AGUA SERRA GRANDE 12X510ML", category: "ÀGUAS", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 12, stock: 0 },
    { name: "AGUA SERRA GRANDE 5L", category: "ÀGUAS", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0 },
    { name: "AGUA SERRA GRANDE COM GÁS 12X510ML", category: "ÀGUAS", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 12, stock: 0 },
    { name: "AGUÁ CRYSTAL COM GAS 12X500ML", category: "ÀGUAS", unitOfMeasure: "FARDO", cost: 19.32, packPrice: 20, unitsPerPack: 12, stock: 10 },
    { name: "AMENDOIM CROKISSIMO SANTA HELENA 36UNID", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 18.5, packPrice: 19.95, unitsPerPack: 1, stock: 13 },
    { name: "AMENDOIM DORI CART JAPONES 10X5", category: "BOMBONIERE", unitOfMeasure: "CAIXA", cost: 33, packPrice: 34.9, unitsPerPack: 50, stock: 2 },
    { name: "AMENDOIM JAPONES 145G 4UND", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0 },
    { name: "AMSTEL LATA 12X350ML", category: "CERVEJAS", unitOfMeasure: "FARDO", cost: 33.12, packPrice: 34.9, unitsPerPack: 12, stock: 0 },
    { name: "APEROL 1L", category: "APERITIVO", unitOfMeasure: "UNIDADE", cost: 36.95, packPrice: 39.9, unitsPerPack: 1, stock: 29 },
    { name: "ATITUTTY DE CAJU 12X300ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 10.75, packPrice: 11.5, unitsPerPack: 12, stock: 67 },
    { name: "ATITUTTY GUARANA 12X300ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 10.75, packPrice: 11.5, unitsPerPack: 12, stock: 25 },
    { name: "ATITUTTY UVA 12X300ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 10.75, packPrice: 11.5, unitsPerPack: 12, stock: 17 },
    { name: "BACON MINEIRO FD12X35G", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 11.3, packPrice: 11.8, unitsPerPack: 12, stock: 48 },
    { name: "BALA DORI YOGURTE MORANGO", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0 },
    { name: "BALA ICEKISS CEREJA", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 6.8, packPrice: 7.3, unitsPerPack: 1, stock: 28 },
    { name: "BALA ICEKISS EUCALIPTO", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 6.8, packPrice: 7.3, unitsPerPack: 1, stock: 24 },
    { name: "BALA ICEKISS EXT FORTE ", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 6.8, packPrice: 7.3, unitsPerPack: 1, stock: 29 },
    { name: "BALA ICEKISS MENTA ", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 6.8, packPrice: 7.3, unitsPerPack: 1, stock: 31 },
    { name: "BALA ICEKISS SORTIDA ", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 6.8, packPrice: 7.3, unitsPerPack: 1, stock: 12 },
    { name: "BALA MEL SAMS 500ML", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 7.5, packPrice: 8, unitsPerPack: 1, stock: 2 },
    { name: "BALA PIPPER SAMS 500G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 8.8, unitsPerPack: 1, stock: 0 },
    { name: "BALA SANTA RITA MAST MENTA 500G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 6.8, packPrice: 7.2, unitsPerPack: 1, stock: 8 },
    { name: "BALA SANTA RITA MAST SORT 500G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 6.8, packPrice: 7.2, unitsPerPack: 1, stock: 30 },
    { name: "BALY MAÇÃ VERDE 6X2L", category: "ENÈRGETICOS", unitOfMeasure: "FARDO", cost: 66.25, packPrice: 68.9, unitsPerPack: 6, stock: 12 },
    { name: "BALY MELÂNCIA 6X2L", category: "ENÈRGETICOS", unitOfMeasure: "FARDO", cost: 66.18, packPrice: 68.9, unitsPerPack: 6, stock: 69 },
    { name: "BALY MORANGO E PESSÊGO 6X2L", category: "ENÈRGETICOS", unitOfMeasure: "FARDO", cost: 66.23, packPrice: 68.9, unitsPerPack: 6, stock: 13 },
    { name: "BALY TRADICIONAL 6X2L", category: "ENÈRGETICOS", unitOfMeasure: "FARDO", cost: 66.25, packPrice: 68.9, unitsPerPack: 6, stock: 18 },
    { name: "BANDEJA DE DOCINHOS 12UNI", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 0, packPrice: 9, unitsPerPack: 1, stock: 0 },
    { name: "BATON GAROTO UNIDADE MERCEARIA", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 1.18, packPrice: 2, unitsPerPack: 1, stock: 6 },
    { name: "BEATS CAIPIRINHA LATA 8X269ML", category: "DRINKS", unitOfMeasure: "FARDO", cost: 0, packPrice: 34.9, unitsPerPack: 8, stock: 0 },
    { name: "BEATS GT LATA 8X269ML", category: "DRINKS", unitOfMeasure: "FARDO", cost: 32, packPrice: 33.9, unitsPerPack: 8, stock: 0 },
    { name: "BEATS RED MIX L/N 12X269ML", category: "DRINKS", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 12, stock: 0 },
    { name: "BEATS RED MIX LATA 8X269ML", category: "DRINKS", unitOfMeasure: "FARDO", cost: 38.34, packPrice: 39.9, unitsPerPack: 8, stock: 0 },
    { name: "BEATS TROPICAL LATA 8X269ML", category: "DRINKS", unitOfMeasure: "FARDO", cost: 32.09, packPrice: 34.9, unitsPerPack: 8, stock: 0 },
    { name: "BECKS LATA 8X350ML", category: "CERVEJAS", unitOfMeasure: "UNID", cost: 0, packPrice: 0, unitsPerPack: 8, stock: 0 },
    { name: "BISC AMORI CHOCOLATE 36X125G", category: "BOMBONIERE", unitOfMeasure: "CAIXA", cost: 65.9, packPrice: 67.9, unitsPerPack: 36, stock: 9 },
    { name: "BOHEMIA LATA 12X3350ML", category: "CERVEJAS", unitOfMeasure: "FARDO", cost: 31.75, packPrice: 32.9, unitsPerPack: 12, stock: 194 },
    { name: "BOMBOM GAROTO SORTIDO CX 250G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 13.5, unitsPerPack: 1, stock: 0 },
    { name: "BOMBOM LACTA SORTIDO CX 250G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 11, packPrice: 11.9, unitsPerPack: 1, stock: 30 },
    { name: "BOMBOM NESTLE SORTIDO CX 251G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 11, packPrice: 11.9, unitsPerPack: 1, stock: 0 },
    { name: "BOMBOM SERENATA DE AMOR ", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 37.07, packPrice: 41.9, unitsPerPack: 1, stock: 16 },
    { name: "BOMBOM SONHO DE VALSA", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 44, packPrice: 45.5, unitsPerPack: 1, stock: 10 },
    { name: "BOMBOM SONHO/OURO", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 13.5, unitsPerPack: 1, stock: 0 },
    { name: "BOMBOM SORTIDO OURO BRANCO 1KG", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 44, packPrice: 45.5, unitsPerPack: 1, stock: 11 },
    { name: "BRAHAMA 350ML LATA MERCEARIA", category: "CERVEJAS", unitOfMeasure: "UNIDADE", cost: 3.25, packPrice: 4.5, unitsPerPack: 1, stock: 8 },
    { name: "BRAHMA DUPLO MALTE LATA 12X350ML", category: "CERVEJAS", unitOfMeasure: "FARDO", cost: 38.5, packPrice: 39.5, unitsPerPack: 12, stock: 1356 },
    { name: "BRAHMA L/N 24X330ML", category: "CERVEJAS", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 24, stock: 0 },
    { name: "BRAHMA CHOPP LATA 24X350ML", category: "BOMBONIERE", unitOfMeasure: "CAIXA", cost: 108, packPrice: 110.9, unitsPerPack: 24, stock: 312 },
    { name: "BUDWEISER L/N 330ML MERCEARIA", category: "CERVEJAS", unitOfMeasure: "UNIDADE", cost: 4.91, packPrice: 6, unitsPerPack: 1, stock: 8 },
    { name: "BUDWEISER LATA 12X350ML", category: "CERVEJAS", unitOfMeasure: "FARDO", cost: 39.5, packPrice: 41.5, unitsPerPack: 12, stock: 88 },
    { name: "BUDWEISER LATA ZERO 8X350ML", category: "CERVEJAS", unitOfMeasure: "FARDO", cost: 27.27, packPrice: 28.8, unitsPerPack: 8, stock: 8 },
    { name: "CABARE ICE FRUTAS VERMELHA 12X275ML", category: "VODKAS", unitOfMeasure: "FARDO", cost: 68, packPrice: 70.9, unitsPerPack: 12, stock: 56 },
    { name: "CABARE ICE LIMÃO 12X275ML", category: "VODKAS", unitOfMeasure: "FARDO", cost: 67.66, packPrice: 69.9, unitsPerPack: 12, stock: 300 },
    { name: "CACHAÇA VALE REAL PRATA 12X48OML", category: "CACHAÇA", unitOfMeasure: "FARDO", cost: 23.7, packPrice: 25.9, unitsPerPack: 12, stock: 29 },
    { name: "CACHAÇA 51 OURO CAIXA", category: "CACHAÇA", unitOfMeasure: "CAIXA", cost: 144.78, packPrice: 146.5, unitsPerPack: 1, stock: 75 },
    { name: "CACHAÇA 51 OURO UNIDADE", category: "CACHAÇA", unitOfMeasure: "UNIDADE", cost: 12.06, packPrice: 12.65, unitsPerPack: 1, stock: 24 },
    { name: "CACHAÇA 51 PRATA CAIXA ", category: "CACHAÇA", unitOfMeasure: "CAIXA", cost: 115, packPrice: 117.5, unitsPerPack: 12, stock: 62 },
    { name: "CACHAÇA 51 PRATA UNIDADE", category: "CACHAÇA", unitOfMeasure: "UNIDADE", cost: 9.58, packPrice: 10.5, unitsPerPack: 1, stock: 24 },
    { name: "CACHAÇA BANANAZINHA 900ML", category: "CACHAÇA", unitOfMeasure: "UNIDADE", cost: 35, packPrice: 38.9, unitsPerPack: 1, stock: 2 },
    { name: "CACHAÇA CABARE AMBURANA 700ML", category: "CACHAÇA", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 37.7, unitsPerPack: 1, stock: 0 },
    { name: "CACHAÇA CABARE OURO 700ML", category: "CACHAÇA", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 35.4, unitsPerPack: 1, stock: 0 },
    { name: "CACHAÇA CABARE PRATA 700ML", category: "CACHAÇA", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0 },
    { name: "CACHAÇA CARANGUEJO 12X480ML", category: "CACHAÇA", unitOfMeasure: "FARDO", cost: 28, packPrice: 29.9, unitsPerPack: 12, stock: 74 },
    { name: "CACHAÇA D OURO OURO 12X480ML", category: "CACHAÇA", unitOfMeasure: "FARDO", cost: 30.5, packPrice: 31.4, unitsPerPack: 12, stock: 21 },
    { name: "CACHAÇA D OURO PRATA 12X480ML", category: "CACHAÇA", unitOfMeasure: "FARDO", cost: 29.82, packPrice: 30.7, unitsPerPack: 12, stock: 81 },
    { name: "CACHAÇA VALE REAL OURO 12X480ML", category: "CACHAÇA", unitOfMeasure: "FARDO", cost: 25.01, packPrice: 25.9, unitsPerPack: 12, stock: 8 },
    { name: "CAJUINA LATA MERCEARIA", category: "REFRIGERANTES", unitOfMeasure: "UNIDADE", cost: 2.66, packPrice: 4, unitsPerPack: 1, stock: 2 },
    { name: "CAJUINA MINI MERCEARIA", category: "REFRIGERANTES", unitOfMeasure: "UNIDADE", cost: 1.56, packPrice: 2.5, unitsPerPack: 1, stock: 11 },
    { name: "CAJUINA SÃO GERALDO 2L", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 49.08, packPrice: 52.9, unitsPerPack: 6, stock: 1 },
    { name: "CAJUINA SÃO GERALDO 6X1L", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 31.92, packPrice: 33.9, unitsPerPack: 6, stock: 17 },
    { name: "CAJUINA SÃO GERALDO LATA 12X3350ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 32, packPrice: 33.4, unitsPerPack: 12, stock: 34 },
    { name: "CAJUINA SÃO GERALDO LATA ZERO 12X350ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 31.5, packPrice: 32.9, unitsPerPack: 12, stock: 1 },
    { name: "CAJUINA SÃO GERALDO MINI 12X200ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 20, packPrice: 21.5, unitsPerPack: 12, stock: 19 },
    { name: "CAMPARI 900ML CAIXA", category: "APERITIVO", unitOfMeasure: "CAIXA", cost: 528, packPrice: 546, unitsPerPack: 12, stock: 3 },
    { name: "CAMPARI 900ML UNIDADE", category: "APERITIVO", unitOfMeasure: "UNIDADE", cost: 44, packPrice: 46.5, unitsPerPack: 1, stock: 27 },
    { name: "CARVÃO VEGETAL VICTOR 3KL", category: "CARVÃO", unitOfMeasure: "UNIDADE", cost: 7, packPrice: 7.7, unitsPerPack: 1, stock: 0 },
    { name: "CAVALO BRANCO 1L UNIDADE", category: "WHISCKS", unitOfMeasure: "UNIDADE", cost: 55.75, packPrice: 58.9, unitsPerPack: 1, stock: 17 },
    { name: "CAVALO BRANCO CAIXA 12X1L", category: "WHISCKS", unitOfMeasure: "CAIXA", cost: 669, packPrice: 694.8, unitsPerPack: 12, stock: 16 },
    { name: "CEBOLITOS 10X21GR", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 8.6, packPrice: 9.4, unitsPerPack: 1, stock: 16 },
    { name: "CEBOLITOS 45G UNIDADE", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 3.05, packPrice: 3.4, unitsPerPack: 1, stock: 0 },
    { name: "CEBOLITOS UNIDADE MERCEARIA", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 3.4, packPrice: 4, unitsPerPack: 1, stock: 3 },
    { name: "CHANDON 1,5L BRUT ROSE", category: "CHAMPANHE", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0 },
    { name: "CHANDON BRUT ROSE 750ML", category: "CHAMPANHE", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0 },
    { name: "CHANDON PASSION ROSE 750ML", category: "CHAMPANHE", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0 },
    { name: "CHEETOS UNIDADE MERCEARIA", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 2.4, packPrice: 3.5, unitsPerPack: 1, stock: 5 },
    { name: "CHEETOS BOLA QUEIJO SUIÇO 33G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 2.4, packPrice: 2.6, unitsPerPack: 1, stock: 38 },
    { name: "CHEETOS CRUNCHY 48G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 2.4, packPrice: 2.6, unitsPerPack: 1, stock: 9 },
    { name: "CHEETOS LUA 35G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 2.4, packPrice: 2.6, unitsPerPack: 1, stock: 12 },
    { name: "CHEETOS ONDA REQUEIJÃO 10 UNIDADES", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 8.6, packPrice: 9.4, unitsPerPack: 1, stock: 11 },
    { name: "CHEETOS ONDA REQUEIJÃO 40G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 2.4, packPrice: 2.6, unitsPerPack: 1, stock: 39 },
    { name: "CHEETOS PIMENTA MEXICANA 47G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 2.4, packPrice: 2.6, unitsPerPack: 1, stock: 49 },
    { name: "CHICLE BIGBIG HORTELÃ 315G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 7.5, packPrice: 7.8, unitsPerPack: 1, stock: 3 },
    { name: "CHICLE BIGBIG MORANGO 315G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 7.5, packPrice: 7.8, unitsPerPack: 1, stock: 1 },
    { name: "CHICLE BIGBIG TUTTI FRUT 315G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 7.5, packPrice: 7.8, unitsPerPack: 1, stock: 3 },
    { name: "CHICLE BIGBIG UVA 315G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 7.5, packPrice: 7.8, unitsPerPack: 1, stock: 4 },
    { name: "CHICLE CLISS CARTELA HORTELÃ 12X1", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 7.5, packPrice: 8.5, unitsPerPack: 1, stock: 8 },
    { name: "CHICLE CLISS CARTELA MENTA 12X1", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 7.5, packPrice: 8.9, unitsPerPack: 1, stock: 12 },
    { name: "CHICLE CLISS CARTELA TUTTI FRUT 12X1", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 7.9, unitsPerPack: 12, stock: 0 },
    { name: "CHICLE PLUTONITA BABA DE BRUXA", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 6.9, packPrice: 7.1, unitsPerPack: 1, stock: 5 },
    { name: "CHICLE PLUTONITA CABEÇA DE ABOBORA 180G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 6.9, packPrice: 7.1, unitsPerPack: 1, stock: 9 },
    { name: "CHIVAS 12 ANOS", category: "WHISCKS", unitOfMeasure: "UNIDADE", cost: 94.8, packPrice: 97.9, unitsPerPack: 1, stock: 0 },
    { name: "CHOC BATON GAROTO BRANCO 30X16G", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 33.77, packPrice: 35.9, unitsPerPack: 30, stock: 53 },
    { name: "CHOC BATON GAROTO LEITE 30X160G", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 34, packPrice: 36.9, unitsPerPack: 30, stock: 34 },
    { name: "CHOC BIS AO LEITE 16UND", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 4.82, packPrice: 5.99, unitsPerPack: 1, stock: 95 },
    { name: "CHOC CROCANTE GAROTO 30X25G", category: "BOMBONIERE", unitOfMeasure: "CAIXA", cost: 0, packPrice: 57.9, unitsPerPack: 30, stock: 0 },
    { name: "CHOC GAROTO CARIBE 30X28G", category: "BOMBONIERE", unitOfMeasure: "CAIXA", cost: 0, packPrice: 60.9, unitsPerPack: 30, stock: 0 },
    { name: "CHOC MMS AO LEITE 18X45GR", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 57.98, packPrice: 59.5, unitsPerPack: 18, stock: 0 },
    { name: "CHOC MMS TUBO 12X30G", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 42.5, packPrice: 43.7, unitsPerPack: 12, stock: 1 },
    { name: "CHOC NESTLE CHOKITO 30X32G", category: "BOMBONIERE", unitOfMeasure: "CAIXA", cost: 58.61, packPrice: 59.9, unitsPerPack: 30, stock: 9 },
    { name: "CHOC NESTLE LOLLO 30X32GR", category: "BOMBONIERE", unitOfMeasure: "CAIXA", cost: 59.02, packPrice: 60.9, unitsPerPack: 30, stock: 4 },
    { name: "CHOC NESTLE PRESTIGIO 30X33G", category: "BOMBONIERE", unitOfMeasure: "CAIXA", cost: 0, packPrice: 58.9, unitsPerPack: 30, stock: 0 },
    { name: "CHOC SNICKERS 20X45G", category: "BOMBONIERE", unitOfMeasure: "CAIXA", cost: 59, packPrice: 60.9, unitsPerPack: 20, stock: 21 },
    { name: "CHOC SNICKERS BRANCO 20X42G", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 56.9, packPrice: 59.9, unitsPerPack: 20, stock: 2 },
    { name: "CHOC SNICKERS DARK 20X42GR", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 57.6, packPrice: 59.9, unitsPerPack: 20, stock: 3 },
    { name: "CHOCOCANDY DISPLAY 11G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 12.5, packPrice: 13.5, unitsPerPack: 1, stock: 9 },
    { name: "CHUP DOCE DE LEITE 1,5K", category: "BOMBONIERE", unitOfMeasure: "CAIXA", cost: 0, packPrice: 23.6, unitsPerPack: 1, stock: 0 },
    { name: "CIGARRO CLEAN BY CLICK", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 87.5, packPrice: 88.5, unitsPerPack: 12, stock: 1 },
    { name: "CIGARRO CLUB ONE BRANCO", category: "TABACARIA", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 27.9, unitsPerPack: 1, stock: 0 },
    { name: "CIGARRO CLUB ONE VERMELHO", category: "TABACARIA", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 27.9, unitsPerPack: 1, stock: 1 },
    { name: "CIGARRO CRETEC MENTHOL CARTEIRA", category: "TABACARIA", unitOfMeasure: "UNIDADE", cost: 17.4, packPrice: 19.4, unitsPerPack: 1, stock: 10 },
    { name: "CIGARRO DUNHILL", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 133.04, packPrice: 136.8, unitsPerPack: 10, stock: 16 },
    { name: "CIGARRO DUNHILL AZUL", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 98, packPrice: 100.9, unitsPerPack: 10, stock: 5 },
    { name: "CIGARRO DUNHILL DOUBLE REFRESH", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 132.2, packPrice: 134.4, unitsPerPack: 10, stock: 1 },
    { name: "CIGARRO DUNHILL PRATA", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 98, packPrice: 105.9, unitsPerPack: 10, stock: 0 },
    { name: "CIGARRO DUNHILL RED", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 99, packPrice: 108.5, unitsPerPack: 10, stock: 4 },
    { name: "CIGARRO GIFT BRANCO", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 26, packPrice: 28.9, unitsPerPack: 10, stock: 0 },
    { name: "CIGARRO GIFT VERMELHO", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 26, packPrice: 28.9, unitsPerPack: 10, stock: 60 },
    { name: "CIGARRO GLOBAL MERCEARIA", category: "TABACARIA", unitOfMeasure: "UNIDADE", cost: 7.08, packPrice: 9, unitsPerPack: 1, stock: 4 },
    { name: "CIGARRO GUDANG GARAM CARTEIRA", category: "TABACARIA", unitOfMeasure: "UNIDADE", cost: 24, packPrice: 26, unitsPerPack: 1, stock: 40 },
    { name: "CIGARRO GUDANG GARAN CARTEIRA", category: "TABACARIA", unitOfMeasure: "UNIDADE", cost: 24, packPrice: 26, unitsPerPack: 1, stock: 8 },
    { name: "CIGARRO K-LINT SILVER", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 58.36, packPrice: 59.9, unitsPerPack: 10, stock: 29 },
    { name: "CIGARRO KENT AZUL", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 102.98, packPrice: 112.9, unitsPerPack: 10, stock: 55 },
    { name: "CIGARRO KENT PRATA", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 109.5, packPrice: 112.9, unitsPerPack: 10, stock: 11 },
    { name: "CIGARRO LUCKY STRIKE DOUBLEICE", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 118, packPrice: 121.2, unitsPerPack: 10, stock: 30 },
    { name: "CIGARRO LUCKY STRIKE VERMELHO BOX", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 69.3, packPrice: 73.8, unitsPerPack: 10, stock: 39 },
    { name: "CIGARRO MARLBORO RED BOX", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 81.29, packPrice: 81.9, unitsPerPack: 10, stock: 35 },
    { name: "CIGARRO NISE BRANCO", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 27, packPrice: 29.9, unitsPerPack: 10, stock: 20 },
    { name: "CIGARRO NISE VERMELHO", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 31, packPrice: 32.9, unitsPerPack: 10, stock: 37 },
    { name: "CIGARRO PANDORA BRANCO", category: "TABACARIA", unitOfMeasure: "UNIDADE", cost: 27, packPrice: 29.9, unitsPerPack: 1, stock: 103 },
    { name: "CIGARRO PANDORA VERMELHO", category: "TABACARIA", unitOfMeasure: "UNIDADE", cost: 26, packPrice: 29.9, unitsPerPack: 1, stock: 47 },
    { name: "CIGARRO PONCIO IGNITE", category: "TABACARIA", unitOfMeasure: "UNIDADE", cost: 20, packPrice: 21, unitsPerPack: 1, stock: 10 },
    { name: "CIGARRO ROTHMANS AZUL", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 83.61, packPrice: 89.3, unitsPerPack: 10, stock: 43 },
    { name: "CIGARRO ROTHMANS BOX WHITE BLUE", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 72.22, packPrice: 75.2, unitsPerPack: 1, stock: 23 },
    { name: "CIGARRO ROTHMANS GLOBAL AZUL BOX", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 70.8, packPrice: 72.8, unitsPerPack: 1, stock: 54 },
    { name: "CIGARRO ROTHMANS GLOBAL VERMELHO BOX", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 70.8, packPrice: 72.8, unitsPerPack: 1, stock: 19 },
    { name: "CIGARRO ROTHMANS INTER 2 CAPS BOX", category: "TABACARIA", unitOfMeasure: "UNIDADE", cost: 103.9, packPrice: 108.3, unitsPerPack: 1, stock: 28 },
    { name: "CIGARRO ROTHMANS INTERNACIONAL", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 99.9, packPrice: 104.25, unitsPerPack: 10, stock: 38 },
    { name: "CIGARRO ROTHMANS PRATA", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 87.4, packPrice: 89.3, unitsPerPack: 10, stock: 16 },
    { name: "CIGARRO ROTHMANS VERMELHO", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 82.06, packPrice: 89.3, unitsPerPack: 10, stock: 55 },
    { name: "CIGARRO ROTHMANS WHITE RED BOX", category: "TABACARIA", unitOfMeasure: "MAÇO", cost: 66, packPrice: 75.2, unitsPerPack: 1, stock: 16 },
    { name: "COCA COLA 1,5 ZERO", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 37.86, packPrice: 39.9, unitsPerPack: 6, stock: 72 },
    { name: "COCA COLA 1,5L", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 38.88, packPrice: 40.9, unitsPerPack: 6, stock: 81 },
    { name: "COCA COLA 1L", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 35.1, packPrice: 37.5, unitsPerPack: 6, stock: 12 },
    { name: "COCA COLA 1L ZERO", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 33.42, packPrice: 35.9, unitsPerPack: 6, stock: 90 },
    { name: "COCA COLA 2L", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 52.5, packPrice: 54.9, unitsPerPack: 6, stock: 63 },
    { name: "COCA COLA 2L MERCEARIA", category: "REFRIGERANTES", unitOfMeasure: "UNIDADE", cost: 8.76, packPrice: 12, unitsPerPack: 1, stock: 2 },
    { name: "COCA COLA 2L ZERO", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 49.47, packPrice: 52.9, unitsPerPack: 6, stock: 138 },
    { name: "COCA COLA 2L ZERO MERCEARIA", category: "REFRIGERANTES", unitOfMeasure: "UNIDADE", cost: 8.24, packPrice: 12, unitsPerPack: 1, stock: 3 },
    { name: "COCA COLA 600 NORMAL", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 43.08, packPrice: 44.9, unitsPerPack: 12, stock: 84 },
    { name: "COCA COLA 600 ZERO", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 40.2, packPrice: 41.9, unitsPerPack: 12, stock: 105 },
    { name: "COCA COLA CAFE LATA 220ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0 },
    { name: "COCA COLA LATA 350ML MERCEARIA", category: "REFRIGERANTES", unitOfMeasure: "UNIDADE", cost: 2.82, packPrice: 4.5, unitsPerPack: 1, stock: 7 },
    { name: "COCA COLA LATA 6X350ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 16.83, packPrice: 17.7, unitsPerPack: 6, stock: 365 },
    { name: "COCA COLA LATA ZERO 6X350ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 16.43, packPrice: 17.45, unitsPerPack: 6, stock: 1310 },
    { name: "COCA COLA LATA ZERO MERCEARIA", category: "REFRIGERANTES", unitOfMeasure: "UNIDADE", cost: 2.72, packPrice: 4.5, unitsPerPack: 1, stock: 13 },
    { name: "COCA COLA LS RETORNAVEL", category: "REFRIGERANTES", unitOfMeasure: "CAIXA", cost: 42.72, packPrice: 46.9, unitsPerPack: 12, stock: 32 },
    { name: "COCA COLA MINI MERCEARIA", category: "REFRIGERANTES", unitOfMeasure: "UNIDADE", cost: 2.09, packPrice: 3.5, unitsPerPack: 1, stock: 11 },
    { name: "COCA COLA MINI PET 12X250ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 25.44, packPrice: 27, unitsPerPack: 12, stock: 6 },
    { name: "COCA COLA MINI PET 6X250ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 0, packPrice: 15, unitsPerPack: 6, stock: 0 },
    { name: "COCA COLA VZ LATA 310ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 37.8, packPrice: 39, unitsPerPack: 3, stock: 1 },
    { name: "COROTE AZUL 500ML", category: "VODKAS", unitOfMeasure: "UNIDADE", cost: 3.83, packPrice: 4, unitsPerPack: 1, stock: 19 },
    { name: "COROTE BLUEBERRY 500ML", category: "VODKAS", unitOfMeasure: "UNIDADE", cost: 3.83, packPrice: 4, unitsPerPack: 1, stock: 3 },
    { name: "COROTE CEREJA 500ML", category: "VODKAS", unitOfMeasure: "UNIDADE", cost: 3.83, packPrice: 4, unitsPerPack: 1, stock: 5 },
    { name: "COROTE LIMÃO 500ML", category: "VODKAS", unitOfMeasure: "UNIDADE", cost: 3.83, packPrice: 4, unitsPerPack: 1, stock: 5 },
    { name: "COROTE PESSEGO 500ML", category: "VODKAS", unitOfMeasure: "UNIDADE", cost: 3.83, packPrice: 4, unitsPerPack: 1, stock: 4 },
    { name: "COROTE SABORES 12X500ML", category: "VODKAS", unitOfMeasure: "FARDO", cost: 45, packPrice: 48, unitsPerPack: 12, stock: 6 },
    { name: "COROTE SKOL BEATS 12X500ML", category: "VODKAS", unitOfMeasure: "FARDO", cost: 45, packPrice: 48, unitsPerPack: 12, stock: 5 },
    { name: "COROTE UVC 500ML", category: "VODKAS", unitOfMeasure: "UNIDADE", cost: 3.83, packPrice: 4, unitsPerPack: 1, stock: 1 },
    { name: "COROTE VERMELHO 500ML", category: "VODKAS", unitOfMeasure: "UNIDADE", cost: 3.83, packPrice: 4, unitsPerPack: 1, stock: 1 },
    { name: "CRYSTAL AGUA SEM GAS 12X500ML", category: "ÀGUAS", unitOfMeasure: "FARDO", cost: 17.4, packPrice: 18, unitsPerPack: 12, stock: 1 },
    { name: "CRYSTAL AGUA S/GAS 1,5L", category: "ÀGUAS", unitOfMeasure: "FARDO", cost: 17.04, packPrice: 18, unitsPerPack: 6, stock: 2 },
    { name: "DEVASSA LATA 12X350ML", category: "CERVEJAS", unitOfMeasure: "FARDO", cost: 36.72, packPrice: 38.9, unitsPerPack: 12, stock: 4 },
    { name: "DEVASSA LATA PURO MALTE 12X350ML", category: "CERVEJAS", unitOfMeasure: "FARDO", cost: 38.88, packPrice: 40.9, unitsPerPack: 12, stock: 1 },
    { name: "EISENBAHN PILSEN 12X350ML", category: "CERVEJAS", unitOfMeasure: "FARDO", cost: 40, packPrice: 42, unitsPerPack: 12, stock: 1 },
    { name: "FANTA GUARANA 2L", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 37.38, packPrice: 39.9, unitsPerPack: 6, stock: 3 },
    { name: "FANTA LARANJA 2L", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 38.04, packPrice: 40.9, unitsPerPack: 6, stock: 1 },
    { name: "FANTA LARANJA LATA 6X350ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 16.83, packPrice: 17.7, unitsPerPack: 6, stock: 2 },
    { name: "FESTVAL CAJU 12X200ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 18, packPrice: 19.9, unitsPerPack: 12, stock: 1 },
    { name: "FESTVAL UVA 12X200ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 18, packPrice: 19.9, unitsPerPack: 12, stock: 1 },
    { name: "FONTES DE MINAS 5L", category: "ÀGUAS", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0 },
    { name: "FONTES DE MINAS AGUA S/GAS 1,5L", category: "ÀGUAS", unitOfMeasure: "FARDO", cost: 16.92, packPrice: 17.5, unitsPerPack: 6, stock: 1 },
    { name: "GAROTO BOMBOM SORTIDO 250G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 11.9, unitsPerPack: 1, stock: 0 },
    { name: "GUARANA ANTARTICA 1,5L", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 37, packPrice: 38.9, unitsPerPack: 6, stock: 2 },
    { name: "GUARANA ANTARTICA 1L", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 33.42, packPrice: 35.9, unitsPerPack: 6, stock: 0 },
    { name: "GUARANA ANTARTICA 2L", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 47.88, packPrice: 49.9, unitsPerPack: 6, stock: 2 },
    { name: "GUARANA ANTARTICA 600ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 42.24, packPrice: 43.9, unitsPerPack: 12, stock: 6 },
    { name: "GUARANA ANTARTICA LATA 6X350ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 16.43, packPrice: 17.4, unitsPerPack: 6, stock: 15 },
    { name: "GUARANA ANTARTICA LATA ZERO 6X350ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 16.43, packPrice: 17.4, unitsPerPack: 6, stock: 0 },
    { name: "GUARANA KUAT 2L", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 35.82, packPrice: 37.9, unitsPerPack: 6, stock: 2 },
    { name: "HEINEKEN LONG NECK 24X330ML", category: "CERVEJAS", unitOfMeasure: "CAIXA", cost: 128.88, packPrice: 135, unitsPerPack: 24, stock: 6 },
    { name: "HEINEKEN LATA 12X350ML", category: "CERVEJAS", unitOfMeasure: "FARDO", cost: 40.08, packPrice: 42.9, unitsPerPack: 12, stock: 7 },
    { name: "HEINEKEN LONG NECK 6X330ML", category: "CERVEJAS", unitOfMeasure: "FARDO", cost: 0, packPrice: 32.9, unitsPerPack: 6, stock: 0 },
    { name: "HEINEKEN LONG NECK MERCEARIA", category: "CERVEJAS", unitOfMeasure: "UNIDADE", cost: 5.37, packPrice: 5.99, unitsPerPack: 1, stock: 3 },
    { name: "JACK DANIELS MEL 1L", category: "WHISCKS", unitOfMeasure: "UNIDADE", cost: 105, packPrice: 109.9, unitsPerPack: 1, stock: 4 },
    { name: "JACK DANIELS N 7 1L", category: "WHISCKS", unitOfMeasure: "UNIDADE", cost: 95, packPrice: 99.9, unitsPerPack: 1, stock: 10 },
    { name: "JOHNIE WALKER RED LABEL 1L", category: "WHISCKS", unitOfMeasure: "UNIDADE", cost: 79, packPrice: 81.9, unitsPerPack: 1, stock: 10 },
    { name: "KIT KAT BRANCO 24X41G", category: "BOMBONIERE", unitOfMeasure: "CAIXA", cost: 0, packPrice: 64.9, unitsPerPack: 24, stock: 0 },
    { name: "KIT KAT AO LEITE 24X41G", category: "BOMBONIERE", unitOfMeasure: "CAIXA", cost: 0, packPrice: 64.9, unitsPerPack: 24, stock: 0 },
    { name: "KRISPY KREAM CHOCOLATE 10X5", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0 },
    { name: "LEITE DE COCO SOCOCO 200ML", category: "MANTIMENTOS", unitOfMeasure: "UNIDADE", cost: 4.4, packPrice: 4.9, unitsPerPack: 1, stock: 8 },
    { name: "LIMONADA CLight 1L", category: "SUCOS", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 5, unitsPerPack: 1, stock: 0 },
    { name: "MENTOS SABORES 12X3", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 24, packPrice: 25, unitsPerPack: 3, stock: 1 },
    { name: "MOUSSE DE LIMÃO E MARACUJÁ 10X5", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0 },
    { name: "NESCAU 2,0", category: "ACHOCOLATADOS", unitOfMeasure: "UNIDADE", cost: 13, packPrice: 13.5, unitsPerPack: 1, stock: 2 },
    { name: "NESCAU 400G", category: "ACHOCOLATADOS", unitOfMeasure: "UNIDADE", cost: 6.2, packPrice: 6.5, unitsPerPack: 1, stock: 1 },
    { name: "NESTLE CHOCOLATE CLASSIC 1KG", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 25, packPrice: 26.9, unitsPerPack: 1, stock: 3 },
    { name: "OLD PARR 1L", category: "WHISCKS", unitOfMeasure: "UNIDADE", cost: 105, packPrice: 109.9, unitsPerPack: 1, stock: 11 },
    { name: "OVALTINE 200G", category: "ACHOCOLATADOS", unitOfMeasure: "UNIDADE", cost: 5.9, packPrice: 6.2, unitsPerPack: 1, stock: 0 },
    { name: "OVALTINE 400G", category: "ACHOCOLATADOS", unitOfMeasure: "UNIDADE", cost: 10, packPrice: 10.5, unitsPerPack: 1, stock: 0 },
    { name: "PAÇOQUITA SANTA HELENA 24X21G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 22, packPrice: 23.5, unitsPerPack: 1, stock: 2 },
    { name: "PAÇOQUITA SANTA HELENA 400G", category: "BOMBONIERE", unitOfMeasure: "UNIDADE", cost: 12, packPrice: 12.5, unitsPerPack: 1, stock: 0 },
    { name: "PAÇOQUITA SANTA HELENA 50X16G", category: "BOMBONIERE", unitOfMeasure: "CAIXA", cost: 20, packPrice: 21.5, unitsPerPack: 50, stock: 11 },
    { name: "PARMALAT CHOCOLATE 200ML", category: "ACHOCOLATADOS", unitOfMeasure: "UNIDADE", cost: 1.5, packPrice: 1.8, unitsPerPack: 1, stock: 1 },
    { name: "PEPSI 2L", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 35.82, packPrice: 37.9, unitsPerPack: 6, stock: 0 },
    { name: "PEPSI LATA 6X350ML", category: "REFRIGERANTES", unitOfMeasure: "FARDO", cost: 16.43, packPrice: 17.4, unitsPerPack: 6, stock: 0 },
    { name: "PIRAQUÊ CREAM CRACKER 200G", category: "MANTIMENTOS", unitOfMeasure: "UNIDADE", cost: 3, packPrice: 3.3, unitsPerPack: 1, stock: 1 },
    { name: "PIRAQUÊ MAISENA 200G", category: "MANTIMENTOS", unitOfMeasure: "UNIDADE", cost: 3, packPrice: 3.3, unitsPerPack: 1, stock: 1 },
    { name: "PITU 900ML", category: "CACHAÇA", unitOfMeasure: "UNIDADE", cost: 10, packPrice: 10.5, unitsPerPack: 1, stock: 1 },
    { name: "PITU CAIXA 12X900ML", category: "CACHAÇA", unitOfMeasure: "CAIXA", cost: 120, packPrice: 126, unitsPerPack: 12, stock: 1 },
    { name: "PORTO SEGURO AGUA DE COCO 1L", category: "ÀGUAS", unitOfMeasure: "UNIDADE", cost: 5, packPrice: 5.5, unitsPerPack: 1, stock: 0 },
    { name: "PRINGLES ORIGINAL 12X124G", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 168, packPrice: 175, unitsPerPack: 12, stock: 0 },
    { name: "SALGADINHO BACONZITOS 10X5", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0 },
    { name: "SALGADINHO CEBOLITOS 10X5", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0 },
    { name: "SALGADINHO CHEETOS 10X5", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0 },
    { name: "SALGADINHO DORITOS 10X5", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0 },
    { name: "SALGADINHO FANTA 10X5", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0 },
    { name: "SALGADINHO FOFURA 10X5", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0 },
    { name: "SALGADINHO RUFFLES 10X5", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0 },
    { name: "SALGADINHO SKOL 10X5", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0 },
    { name: "SALGADINHO TOP 10X5", category: "BOMBONIERE", unitOfMeasure: "FARDO", cost: 0, packPrice: 0, unitsPerPack: 50, stock: 0 },
    { name: "SKOL LATA 12X350ML", category: "CERVEJAS", unitOfMeasure: "FARDO", cost: 28, packPrice: 29.9, unitsPerPack: 12, stock: 28 },
    { name: "SKOL PURO MALTE 12X350ML", category: "CERVEJAS", unitOfMeasure: "FARDO", cost: 30, packPrice: 31.9, unitsPerPack: 12, stock: 0 },
    { name: "SKOL BEATS SENSE 8X269ML", category: "DRINKS", unitOfMeasure: "FARDO", cost: 28.8, packPrice: 29.9, unitsPerPack: 8, stock: 0 },
    { name: "SKOL BEATS SPIRIT 8X269ML", category: "DRINKS", unitOfMeasure: "FARDO", cost: 28.8, packPrice: 29.9, unitsPerPack: 8, stock: 0 },
    { name: "SKOL BEATS ULTIMATE 8X269ML", category: "DRINKS", unitOfMeasure: "FARDO", cost: 28.8, packPrice: 29.9, unitsPerPack: 8, stock: 0 },
    { name: "SUCO DEL VALLE LARANJA 1L", category: "SUCOS", unitOfMeasure: "UNIDADE", cost: 5, packPrice: 5.5, unitsPerPack: 1, stock: 0 },
    { name: "SUCO DEL VALLE UVA 1L", category: "SUCOS", unitOfMeasure: "UNIDADE", cost: 5, packPrice: 5.5, unitsPerPack: 1, stock: 0 },
    { name: "SUCO DEL VALLE UVA 6X1L", category: "SUCOS", unitOfMeasure: "FARDO", cost: 30, packPrice: 33, unitsPerPack: 6, stock: 0 },
    { name: "SUCO PRATICO CAJU 1L", category: "SUCOS", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 6, unitsPerPack: 1, stock: 0 },
    { name: "SUCO PRATICO UVA 1L", category: "SUCOS", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 6, unitsPerPack: 1, stock: 0 },
    { name: "SUCO TANG LARANJA 25G", category: "SUCOS", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 1, unitsPerPack: 1, stock: 0 },
    { name: "SUCO TANG UVA 25G", category: "SUCOS", unitOfMeasure: "UNIDADE", cost: 0, packPrice: 1, unitsPerPack: 1, stock: 0 },
    { name: "VINHO SANTA HELENA 750ML", category: "VINHOS", unitOfMeasure: "UNIDADE", cost: 25, packPrice: 27, unitsPerPack: 1, stock: 0 },
    { name: "VODKA SMIRNOFF 1L", category: "VODKAS", unitOfMeasure: "UNIDADE", cost: 35, packPrice: 37, unitsPerPack: 1, stock: 1 },
    { name: "WHISCK BUCHANANS 12ANOS 1L", category: "WHISCKS", unitOfMeasure: "UNIDADE", cost: 120, packPrice: 125, unitsPerPack: 1, stock: 0 },
    { name: "YPIOCA EMPALHADA PRATA 700ML", category: "CACHAÇA", unitOfMeasure: "FARDO", cost: 0, packPrice: 32.9, unitsPerPack: 1, stock: 0 },
    { name: "YPIOCA GUARANA CX 12X1L", category: "CACHAÇA", unitOfMeasure: "CAIXA", cost: 214.08, packPrice: 218.9, unitsPerPack: 12, stock: 4 },
    { name: "YPIOCA GUARANA UNIDADE", category: "CACHAÇA", unitOfMeasure: "UNIDADE", cost: 17.84, packPrice: 19.9, unitsPerPack: 1, stock: 37 },
    { name: "YPIOCA LIMA LIMÃO CX 12X1L", category: "CACHAÇA", unitOfMeasure: "CAIXA", cost: 204.95, packPrice: 209.9, unitsPerPack: 12, stock: 18 },
    { name: "YPIOCA LIMA LIMÃO UNIDADE", category: "CACHAÇA", unitOfMeasure: "UNIDADE", cost: 17.08, packPrice: 17.7, unitsPerPack: 1, stock: 19 },
    { name: "YPIOCA MESTRE OURO CX 12X965ML", category: "CACHAÇA", unitOfMeasure: "CAIXA", cost: 289.9, packPrice: 295.9, unitsPerPack: 12, stock: 3 },
];

export default function ProductsPage() {
  const { products, addProduct, updateProduct, loadProducts, deleteProduct, isMounted } = useProducts();
  const { sales } = useSales();
  const { orders } = useOrders();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenDialog = (product: Product | null = null) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingProduct(null);
    setDialogOpen(false);
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeletingProduct(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (deletingProduct) {
      await deleteProduct(deletingProduct.id, sales, orders);
    }
    handleCloseDeleteDialog();
  };

  const handleConfirm = async (productData: ProductFormData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await addProduct(productData);
    }
    handleCloseDialog();
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercasedTerm) ||
        String(product.id).includes(lowercasedTerm)
    );
  }, [products, searchTerm]);

  const handleExport = () => {
    const csvData = Papa.unparse(
      filteredProducts.map((p) => ({
        id: p.id,
        nome: p.name,
        categoria: p.category,
        unidade_medida: p.unitOfMeasure,
        preco_compra_fardo: p.cost,
        preco_venda_fardo: p.packPrice,
        unidades_por_fardo: p.unitsPerPack,
        estoque_fardo: p.stock,
      }))
    );

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "produtos.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleBulkImport = async () => {
    await loadProducts(bulkProducts);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          if (results.errors.length) {
            toast({
              title: "Erro na importação do CSV",
              description:
                "Verifique o formato do arquivo e tente novamente.",
              variant: "destructive",
            });
            console.error("CSV Parsing Errors:", results.errors);
            return;
          }
          
          const parsedProducts = (results.data as CsvProductImport[]).map(row => ({
            name: row.nome || "",
            category: row.categoria || "Sem Categoria",
            unitOfMeasure: row.unidade_medida || "Unidade",
            cost: Number(String(row.preco_compra_fardo).replace(',','.')) || 0,
            packPrice: Number(String(row.preco_venda_fardo).replace(',','.')) || 0,
            unitsPerPack: Number(row.unidades_por_fardo) || 1,
            stock: Number(row.estoque_fardo) || 0,
          })).filter(p => p.name.trim() !== "");

          await loadProducts(parsedProducts as ProductFormData[]);
        },
      });
      if (event.target) {
        event.target.value = "";
      }
    }
  };


  return (
    <>
      <div className="p-4 sm:px-6 sm:py-4">
        <Card>
           <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <CardTitle>Gestão de Produtos</CardTitle>
              <CardDescription>
                Visualize, adicione, importe e exporte seus produtos.
              </CardDescription>
            </div>
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:w-64"
                />
              </div>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="secondary" onClick={handleBulkImport}>
                Importar Lista Padrão
              </Button>
              <Button variant="outline" onClick={handleImportClick}>
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Estoque (Fardos)</TableHead>
                  <TableHead>Custo (Fardo)</TableHead>
                  <TableHead>Preço (Fardo)</TableHead>
                  <TableHead>Preço (Unit.)</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isMounted ? (
                  <>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><div className="flex gap-2"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-24" /></div></TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.id.substring(0, 5)}...
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{formatBRL(product.cost)}</TableCell>
                      <TableCell>{formatBRL(product.packPrice)}</TableCell>
                      <TableCell>{formatBRL(product.price)}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(product)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                         <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleOpenDeleteDialog(product)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Nenhum produto encontrado. Clique em "Importar Lista Padrão" para começar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ProductDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirm}
        product={editingProduct}
      />
      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        product={deletingProduct}
       />
    </>
  );
}
