
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
  codigo: string;
  nome: string;
  categoria: string;
  unidade_medida: string;
  preco_compra_fardo: string;
  preco_venda_fardo: string;
  unidades_por_fardo: string;
  estoque_fardo: string;
};

type ProductFormData = Omit<Product, 'id' | 'price' | 'code'>;

const bulkProducts: Omit<Product, 'id' | 'price'>[] = [
    { code: 523, name: 'SPRIT FRESH LIMÃO 12X510ML', category: 'ÀGUAS', unitOfMeasure: 'FARDO', cost: 40.32, packPrice: 43.9, unitsPerPack: 12, stock: 10 },
    { code: 524, name: 'SPRIT LATA 06X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 13.37, packPrice: 14.45, unitsPerPack: 6, stock: 240 },
    { code: 525, name: 'SPRIT LATA MERCEARIA', category: 'REFRIGERANTES', unitOfMeasure: 'UNIDADE', cost: 2.22, packPrice: 3.5, unitsPerPack: 1, stock: 2 },
    { code: 526, name: 'SPRIT LATA ZERO 6X350ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 13.38, packPrice: 14.45, unitsPerPack: 6, stock: 154 },
    { code: 527, name: 'SPRIT MINI PET 12X250ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 20.64, packPrice: 21.6, unitsPerPack: 12, stock: 100 },
    { code: 528, name: 'SPRIT ZERO 6X2L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 43.8, packPrice: 46.7, unitsPerPack: 6, stock: 12 },
    { code: 529, name: 'STELLA L/N 330ML MERCEARIA', category: 'CERVEJAS', unitOfMeasure: 'UNIDADE', cost: 4.91, packPrice: 6, unitsPerPack: 1, stock: 6 },
    { code: 530, name: 'STELLA GOLD L/N 24X330ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 123, packPrice: 125.9, unitsPerPack: 24, stock: 73 },
    { code: 531, name: 'STELLA L/N 24X330ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 117, packPrice: 120.9, unitsPerPack: 24, stock: 43 },
    { code: 532, name: 'STELLA LATA 8X350ML', category: 'CERVEJAS', unitOfMeasure: 'FARDO', cost: 33.26, packPrice: 35.9, unitsPerPack: 8, stock: 6 },
    { code: 533, name: 'SUCO CITRUS 12X330ML', category: 'SUCOS', unitOfMeasure: 'FARDO', cost: 0, packPrice: 18.9, unitsPerPack: 12, stock: 0 },
    { code: 534, name: 'SUCO DEL VALLE FRUTAS CITRICAS 6X450ML', category: 'SUCOS', unitOfMeasure: 'FARDO', cost: 0, packPrice: 17.1, unitsPerPack: 6, stock: 0 },
    { code: 535, name: 'SUCO DEL VALLE UVA 6X450ML', category: 'SUCOS', unitOfMeasure: 'FARDO', cost: 0, packPrice: 17.3, unitsPerPack: 6, stock: 0 },
    { code: 536, name: 'SUCO DEL VALLE UVA LATA 6X290ML', category: 'Padrão', unitOfMeasure: 'Fardo', cost: 0, packPrice: 20.2, unitsPerPack: 6, stock: 0 },
    { code: 537, name: 'SUCO TAMPICO 12X330ML', category: 'SUCOS', unitOfMeasure: 'FARDO', cost: 22.52, packPrice: 23.4, unitsPerPack: 12, stock: 158 },
    { code: 538, name: 'SUCO TAMPICO 6X2L', category: 'SUCOS', unitOfMeasure: 'FARDO', cost: 43.64, packPrice: 46.9, unitsPerPack: 6, stock: 34 },
    { code: 539, name: 'SUKITA LARANJA 12X1L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 45, packPrice: 46.9, unitsPerPack: 12, stock: 7 },
    { code: 540, name: 'SUKITA LARANJA 6X2L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 0, packPrice: 35.9, unitsPerPack: 6, stock: 0 },
    { code: 541, name: 'TAMPICO 330ML UNIDADE MERCEARIA', category: 'SUCOS', unitOfMeasure: 'UNIDADE', cost: 1.92, packPrice: 3, unitsPerPack: 1, stock: 9 },
    { code: 542, name: 'TEQUILA BALLENA 750ML', category: 'TEQUILA', unitOfMeasure: 'UNIDADE', cost: 110.9, packPrice: 116.9, unitsPerPack: 1, stock: 98 },
    { code: 543, name: 'TEQUILA BALLENA CHOCOLATE 750ML', category: 'TEQUILA', unitOfMeasure: 'UNIDADE', cost: 115.95, packPrice: 119.9, unitsPerPack: 1, stock: 18 },
    { code: 544, name: 'TEQUILA JOSE CUERVO OURO 750ML', category: 'TEQUILA', unitOfMeasure: 'UNIDADE', cost: 83.95, packPrice: 86.9, unitsPerPack: 1, stock: 0 },
    { code: 545, name: 'TEQUILA JOSE CUERVO PRATA 750ML', category: 'TEQUILA', unitOfMeasure: 'UNIDADE', cost: 82, packPrice: 86.9, unitsPerPack: 1, stock: 0 },
    { code: 546, name: 'TORCIDA BACON 35G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 0, packPrice: 1.35, unitsPerPack: 1, stock: 0 },
    { code: 547, name: 'TORCIDA CAMARAO 35G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 1.1, packPrice: 1.35, unitsPerPack: 1, stock: 74 },
    { code: 548, name: 'TORCIDA CEBOLA 35G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 1.1, packPrice: 1.35, unitsPerPack: 1, stock: 89 },
    { code: 549, name: 'TORCIDA CHURRASCO 35G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 1.1, packPrice: 1.35, unitsPerPack: 1, stock: 95 },
    { code: 550, name: 'TORCIDA COSTELA COM LIMÃO 35G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 1.1, packPrice: 1.35, unitsPerPack: 1, stock: 73 },
    { code: 551, name: 'TORCIDA PIMENTA MEXICANA 35G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 1.1, packPrice: 1.35, unitsPerPack: 1, stock: 71 },
    { code: 552, name: 'TORCIDA QUEIJO 38G', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 1.1, packPrice: 1.35, unitsPerPack: 1, stock: 82 },
    { code: 553, name: 'TORCIDA UNIDADE MERCEARIA', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 1.1, packPrice: 2, unitsPerPack: 1, stock: 19 },
    { code: 554, name: 'TOTAL SABOR COLA 12X250ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 11.5, packPrice: 11.9, unitsPerPack: 12, stock: 24 },
    { code: 555, name: 'TOTAL SABOR COLA 6X2L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 20.5, packPrice: 21.6, unitsPerPack: 6, stock: 9 },
    { code: 556, name: 'TOTAL SABOR GUARANA 12X250ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 11.5, packPrice: 11.9, unitsPerPack: 12, stock: 55 },
    { code: 557, name: 'TOTAL SABOR GUARANA 2L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 20.5, packPrice: 21.5, unitsPerPack: 6, stock: 42 },
    { code: 558, name: 'TOTAL SABOR LARANJA 12X250ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 11.5, packPrice: 11.9, unitsPerPack: 12, stock: 16 },
    { code: 559, name: 'TOTAL SABOR LARANJA 2L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 20.5, packPrice: 21.5, unitsPerPack: 6, stock: 30 },
    { code: 560, name: 'TOTAL SABOR UVA 12X250ML', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 0, packPrice: 11.9, unitsPerPack: 12, stock: 6 },
    { code: 561, name: 'TOTAL SABOR UVA 2L', category: 'REFRIGERANTES', unitOfMeasure: 'FARDO', cost: 20.5, packPrice: 21.5, unitsPerPack: 6, stock: 10 },
    { code: 562, name: 'TREVO PAPELIN PARA CIGARRO 35UNI', category: 'TABACARIA', unitOfMeasure: 'UNIDADE', cost: 0, packPrice: 44.7, unitsPerPack: 1, stock: 15 },
    { code: 563, name: 'TREVO PAPELIN PARA CIGARRO MERCEARIA', category: 'TABACARIA', unitOfMeasure: 'UNIDADE', cost: 1.19, packPrice: 1.5, unitsPerPack: 1, stock: 27 },
    { code: 564, name: 'TRIDENT CANELA 21UNI', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 29, packPrice: 32.9, unitsPerPack: 1, stock: 18 },
    { code: 565, name: 'TRIDENT FRESH INTENSE 21UNI', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 33, packPrice: 33.9, unitsPerPack: 1, stock: 0 },
    { code: 566, name: 'TRIDENT HORTELÃ 21UNI', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 32, packPrice: 32.9, unitsPerPack: 1, stock: 28 },
    { code: 567, name: 'TRIDENT MELÃNCIA 21UNI', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 32, packPrice: 32.9, unitsPerPack: 1, stock: 19 },
    { code: 568, name: 'TRIDENT MENTA 21UNI', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 31, packPrice: 32.9, unitsPerPack: 1, stock: 525 },
    { code: 569, name: 'TRIDENT MORANGO 21UNI', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 29, packPrice: 32.9, unitsPerPack: 1, stock: 53 },
    { code: 570, name: 'TRIDENT TUTTI FRUT 21UNI', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 29, packPrice: 32.9, unitsPerPack: 1, stock: 11 },
    { code: 571, name: 'TRIDENT UNIDADE MERCEARIA', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 1.57, packPrice: 2.5, unitsPerPack: 1, stock: 13 },
    { code: 572, name: 'TUFF UNIDADE MERCEARIA', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 1.56, packPrice: 2.5, unitsPerPack: 1, stock: 5 },
    { code: 573, name: 'TWIX CHOCOLATE', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 55, packPrice: 56, unitsPerPack: 1, stock: 5 },
    { code: 574, name: 'TWIX CHOCOLATE MERCEARIA 1NU', category: 'BOMBONIERE', unitOfMeasure: 'UNIDADE', cost: 3.05, packPrice: 3.5, unitsPerPack: 1, stock: 15 },
    { code: 575, name: 'VINHO CAMPESTRE 12X900ML', category: 'VINHOS', unitOfMeasure: 'CAIXA', cost: 40.5, packPrice: 42.9, unitsPerPack: 12, stock: 93 },
    { code: 576, name: 'VINHO OGAUCHO 12X900ML', category: 'VINHOS', unitOfMeasure: 'CAIXA', cost: 120, packPrice: 124.9, unitsPerPack: 12, stock: 20 },
    { code: 577, name: 'VINHO OGAUCHO UNIDADE', category: 'VINHOS', unitOfMeasure: 'UNIDADE', cost: 10, packPrice: 0, unitsPerPack: 1, stock: 0 },
    { code: 578, name: 'VINHO PERGOLA 12X1L', category: 'VINHOS', unitOfMeasure: 'CAIXA', cost: 250, packPrice: 264.9, unitsPerPack: 12, stock: 20 },
    { code: 579, name: 'VINHO PERGOLA UNIDADE', category: 'VINHOS', unitOfMeasure: 'UNIDADE', cost: 20.83, packPrice: 22.9, unitsPerPack: 1, stock: 31 },
    { code: 580, name: 'VINHO QUINTA DO MORG. BRANCO SECO 12X750ML', category: 'VINHOS', unitOfMeasure: 'CAIXA', cost: 139.95, packPrice: 144.9, unitsPerPack: 12, stock: 2 },
    { code: 581, name: 'VINHO QUINTA DO MORG. BRANCO SECO UNIDADE', category: 'VINHOS', unitOfMeasure: 'UNIDADE', cost: 11.66, packPrice: 12.3, unitsPerPack: 1, stock: 13 },
    { code: 582, name: 'VINHO QUINTA DO MORG. BRANCO SUAVE 12X750ML', category: 'VINHOS', unitOfMeasure: 'CAIXA', cost: 0, packPrice: 144.9, unitsPerPack: 12, stock: 2 },
    { code: 583, name: 'VINHO QUINTA DO MORG. BRANCO SUAVE UNIDADE', category: 'VINHOS', unitOfMeasure: 'UNIDADE', cost: 0, packPrice: 0, unitsPerPack: 1, stock: 12 },
    { code: 584, name: 'VINHO QUINTA DO MORG. ROSADO SUAVE 12X750ML', category: 'VINHOS', unitOfMeasure: 'CAIXA', cost: 0, packPrice: 144.9, unitsPerPack: 12, stock: 0 },
    { code: 585, name: 'VINHO QUINTA DO MORG. ROSADO SUAVE UNIDADE', category: 'VINHOS', unitOfMeasure: 'UNIDADE', cost: 0, packPrice: 0, unitsPerPack: 1, stock: 0 },
    { code: 586, name: 'VINHO QUINTA DO MORGADO 12X750ML', category: 'VINHOS', unitOfMeasure: 'CAIXA', cost: 139.95, packPrice: 143.9, unitsPerPack: 12, stock: 17 },
    { code: 587, name: 'VINHO QUINTA DO MORGADO TINTO SECO 12X750ML', category: 'VINHOS', unitOfMeasure: 'CAIXA', cost: 0, packPrice: 144.9, unitsPerPack: 12, stock: 0 },
    { code: 588, name: 'VINHO QUINTA DO MORGADO TINTO SECO UNIDADE', category: 'VINHOS', unitOfMeasure: 'UNIDADE', cost: 0, packPrice: 12.3, unitsPerPack: 1, stock: 0 },
    { code: 589, name: 'VINHO QUINTA DO MORGADO UNIDADE', category: 'VINHOS', unitOfMeasure: 'UNIDADE', cost: 11.66, packPrice: 12.2, unitsPerPack: 1, stock: 42 },
    { code: 590, name: 'VINHO RESERVADO CHILENO CABERNET 750ML', category: 'VINHOS', unitOfMeasure: 'UNIDADE', cost: 25.95, packPrice: 28.9, unitsPerPack: 1, stock: 21 },
    { code: 591, name: 'VINHO SAO BRAZ 12X900ML', category: 'VINHOS', unitOfMeasure: 'CAIXA', cost: 57.5, packPrice: 59.7, unitsPerPack: 12, stock: 96 },
    { code: 592, name: 'VINHO SAO BRAZ PINK 12X900ML', category: 'VINHOS', unitOfMeasure: 'CAIXA', cost: 54.5, packPrice: 56.9, unitsPerPack: 12, stock: 73 },
    { code: 593, name: 'VINHO VALE REAL 12X900ML', category: 'VINHOS', unitOfMeasure: 'CAIXA', cost: 35.56, packPrice: 36.9, unitsPerPack: 12, stock: 65 },
    { code: 594, name: 'VODKA ABSOLUT 1L', category: 'VODKAS', unitOfMeasure: 'UNIDADE', cost: 60, packPrice: 62.9, unitsPerPack: 1, stock: 98 },
    { code: 595, name: 'VODKA INTENCION 6X900ML', category: 'VODKAS', unitOfMeasure: 'FARDO', cost: 0, packPrice: 137.4, unitsPerPack: 6, stock: 0 },
    { code: 596, name: 'VODKA INTENCION 900ML UNIDADE', category: 'VODKAS', unitOfMeasure: 'UNIDADE', cost: 0, packPrice: 23.9, unitsPerPack: 1, stock: 0 },
    { code: 597, name: 'VODKA ORLOFF CX', category: 'VODKAS', unitOfMeasure: 'CAIXA', cost: 274.2, packPrice: 286.8, unitsPerPack: 12, stock: 3 },
    { code: 598, name: 'VODKA ORLOFF UNIDADE', category: 'VODKAS', unitOfMeasure: 'UNIDADE', cost: 22.85, packPrice: 24.9, unitsPerPack: 1, stock: 1 },
    { code: 599, name: 'VODKA SKYY 750ML', category: 'VODKAS', unitOfMeasure: 'UNIDADE', cost: 30, packPrice: 33.9, unitsPerPack: 1, stock: 6 },
    { code: 600, name: 'VODKA SMIRNOFF 1L CAIXA', category: 'VODKAS', unitOfMeasure: 'CAIXA', cost: 312, packPrice: 330, unitsPerPack: 12, stock: 2 },
    { code: 601, name: 'VODKA SMIRNOFF 1L UNIDADE', category: 'VODKAS', unitOfMeasure: 'UNIDADE', cost: 26, packPrice: 28.9, unitsPerPack: 1, stock: 19 },
    { code: 602, name: 'WHISCK BLACK WHITE CAIXA 12X1L', category: 'WHISCKS', unitOfMeasure: 'CAIXA', cost: 618, packPrice: 642, unitsPerPack: 12, stock: 1 },
    { code: 603, name: 'WHISCK BLACK WHITE UNIDADE', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 51.8, packPrice: 54.5, unitsPerPack: 1, stock: 13 },
    { code: 604, name: 'WHISCK GOLD LABEL ED LIMITADA 12X750ML CAIXA', category: 'WHISCKS', unitOfMeasure: 'CAIXA', cost: 2430.12, packPrice: 2494.8, unitsPerPack: 12, stock: 60 },
    { code: 605, name: 'WHISCK GOLD LABEL ED LIMITADA 750ML', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 205.51, packPrice: 208.9, unitsPerPack: 1, stock: 101 },
    { code: 606, name: 'WHISK BLACK LABEL CAIXA', category: 'Padrão', unitOfMeasure: 'Fardo', cost: 0, packPrice: 175.08, unitsPerPack: 1, stock: 0 },
    { code: 607, name: 'WHISKY BALLANTINES', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 53.21, packPrice: 57.9, unitsPerPack: 1, stock: 0 },
    { code: 608, name: 'WHISKY BALLANTINES CX 12X1L', category: 'WHISCKS', unitOfMeasure: 'CAIXA', cost: 638.53, packPrice: 670.8, unitsPerPack: 12, stock: 10 },
    { code: 609, name: 'WHISKY BLACK LABEL UNIDADE', category: 'Padrão', unitOfMeasure: 'Fardo', cost: 0, packPrice: 147.90, unitsPerPack: 1, stock: 0 },
    { code: 610, name: 'WHISKY BLONDE LEMONADE LATA 6X269ML', category: 'WHISCKS', unitOfMeasure: 'FARDO', cost: 54.78, packPrice: 58.9, unitsPerPack: 6, stock: 1 },
    { code: 611, name: 'WHISKY BUCHANAN´S 12X1L CAIXA', category: 'WHISCKS', unitOfMeasure: 'CAIXA', cost: 1756.71, packPrice: 1780.8, unitsPerPack: 12, stock: 9 },
    { code: 612, name: 'WHISKY BUCHANAN´S 1L UNIDADE', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 146.39, packPrice: 149.9, unitsPerPack: 1, stock: 27 },
    { code: 613, name: 'WHISKY DOUBLE BLACK 1L', category: 'Padrão', unitOfMeasure: 'Fardo', cost: 0, packPrice: 169.90, unitsPerPack: 1, stock: 0 },
    { code: 614, name: 'WHISKY GOLD LABEL 750ML', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 220, packPrice: 225.9, unitsPerPack: 1, stock: 173 },
    { code: 615, name: 'WHISKY GOLD LABEL CAIXA 6X750ML', category: 'WHISCKS', unitOfMeasure: 'CAIXA', cost: 1320, packPrice: 1349.4, unitsPerPack: 6, stock: 21 },
    { code: 616, name: 'WHISKY GREEN LABEL 750ML', category: 'WHISCKS', unitOfMeasure: 'MEIO FARDO', cost: 319, packPrice: 349, unitsPerPack: 1, stock: 14 },
    { code: 617, name: 'WHISKY JACK DANIEL´S MÃÇA VERDE CAIXA', category: 'WHISCKS', unitOfMeasure: 'CAIXA', cost: 1404, packPrice: 1462.8, unitsPerPack: 12, stock: 20 },
    { code: 618, name: 'WHISKY JACK DANIELS FIRE 1X1L', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 117, packPrice: 122.9, unitsPerPack: 1, stock: 17 },
    { code: 619, name: 'WHISKY JACK DANIELS FIRE CAIXA', category: 'WHISCKS', unitOfMeasure: 'CAIXA', cost: 1404, packPrice: 1438.8, unitsPerPack: 12, stock: 3 },
    { code: 620, name: 'WHISKY JACK DANIELS HONEY 1X1L', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 117, packPrice: 122.9, unitsPerPack: 1, stock: 8 },
    { code: 621, name: 'WHISKY JACK DANIELS HONEY CAIXA', category: 'WHISCKS', unitOfMeasure: 'CAIXA', cost: 1404, packPrice: 1438.8, unitsPerPack: 12, stock: 3 },
    { code: 622, name: 'WHISKY JACK DANIEL´S MÃÇA VERDE 1L UNIDADE', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 117, packPrice: 122.9, unitsPerPack: 1, stock: 6 },
    { code: 623, name: 'WHISKY JACK DANIEL´S TRADICIONAL 1L', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 117, packPrice: 122.9, unitsPerPack: 1, stock: 6 },
    { code: 624, name: 'WHISKY JACK DANIEL´S TRADICIONAL CAIXA', category: 'WHISCKS', unitOfMeasure: 'CAIXA', cost: 1404, packPrice: 1438.8, unitsPerPack: 12, stock: 7 },
    { code: 625, name: 'WHISKY RED LABEL', category: 'WHISCKS', unitOfMeasure: 'UNIDADE', cost: 74.4, packPrice: 77.9, unitsPerPack: 1, stock: 49 },
    { code: 626, name: 'WHISKY ROYAL SALUTE 21 ANOS', category: 'Padrão', unitOfMeasure: 'Fardo', cost: 0, packPrice: 749.9, unitsPerPack: 1, stock: 0 },
    { code: 627, name: 'YORGUTE ISIS 170G MERCEARIA', category: 'YORGUT', unitOfMeasure: 'UNIDADE', cost: 2.9, packPrice: 3.9, unitsPerPack: 1, stock: 7 },
    { code: 628, name: 'YPIOCA 150 700ML', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 49.95, packPrice: 51.9, unitsPerPack: 1, stock: 97 },
    { code: 629, name: 'YPIOCA 160 700ML', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 70.63, packPrice: 74.9, unitsPerPack: 1, stock: 10 },
    { code: 630, name: 'YPIOCA 5 CHAVES 700ML', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 76.66, packPrice: 79.9, unitsPerPack: 1, stock: 40 },
    { code: 631, name: 'YPIOCA EMPALHADA OURO 965ML', category: 'PADRÃO', unitOfMeasure: 'UNID', cost: 34.33, packPrice: 36.9, unitsPerPack: 1, stock: 37 },
    { code: 632, name: 'YPIOCA EMPALHADA OURO CX', category: 'Padrão', unitOfMeasure: 'Fardo', cost: 0, packPrice: 430.8, unitsPerPack: 1, stock: 1 },
    { code: 633, name: 'YPIOCA EMPALHADA PRATA 700ML', category: 'Padrão', unitOfMeasure: 'Fardo', cost: 0, packPrice: 32.9, unitsPerPack: 1, stock: 0 },
    { code: 634, name: 'YPIOCA GUARANA CX 12X1L', category: 'CACHAÇA', unitOfMeasure: 'CAIXA', cost: 214.08, packPrice: 218.9, unitsPerPack: 12, stock: 4 },
    { code: 635, name: 'YPIOCA GUARANA UNIDADE', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 17.84, packPrice: 19.9, unitsPerPack: 1, stock: 31 },
    { code: 636, name: 'YPIOCA LIMA LIMÃO CX 12X1L', category: 'CACHAÇA', unitOfMeasure: 'CAIXA', cost: 204.95, packPrice: 209.9, unitsPerPack: 12, stock: 18 },
    { code: 637, name: 'YPIOCA LIMA LIMÃO UNIDADE', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 17.08, packPrice: 17.7, unitsPerPack: 1, stock: 13 },
    { code: 638, name: 'YPIOCA MESTRE OURO CX 12X965ML', category: 'CACHAÇA', unitOfMeasure: 'CAIXA', cost: 289.95, packPrice: 308.9, unitsPerPack: 12, stock: 2 },
    { code: 639, name: 'YPIOCA MESTRE OURO UNIDADE', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 24.16, packPrice: 25.9, unitsPerPack: 1, stock: 28 },
    { code: 640, name: 'YPIOCA MESTRE PRATA CX 12X965ML', category: 'CACHAÇA', unitOfMeasure: 'CAIXA', cost: 209.95, packPrice: 214.9, unitsPerPack: 12, stock: 2 },
    { code: 641, name: 'YPIOCA MESTRE PRATA UNIDADE', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 17.49, packPrice: 18.3, unitsPerPack: 1, stock: 27 },
    { code: 642, name: 'YPIOCA MINI BAR 3X165ML', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 30.1, packPrice: 45.9, unitsPerPack: 1, stock: 43 },
    { code: 643, name: 'YPIOCA OURO CX', category: 'CACHAÇA', unitOfMeasure: 'CAIXA', cost: 186, packPrice: 189.9, unitsPerPack: 12, stock: 37 },
    { code: 644, name: 'YPIOCA OURO UNIDADE', category: 'CACHAÇA', unitOfMeasure: 'UNIDADE', cost: 15.5, packPrice: 16.5, unitsPerPack: 1, stock: 15 },
    { code: 645, name: 'YPIOCA PRATA CAIXA', category: 'CACHAÇA', unitOfMeasure: 'CAIXA', cost: 130.18, packPrice: 133.9, unitsPerPack: 12, stock: 107 },
    { code: 646, name: 'YPIOCA PRATA UNIDADE', category: 'CACHAÇA', unitOfMeasure: 'Fardo', cost: 10.85, packPrice: 11.5, unitsPerPack: 1, stock: 2 },
    { code: 647, name: 'YPORAN 12X500ML', category: 'ÀGUAS', unitOfMeasure: 'FARDO', cost: 7.35, packPrice: 7.9, unitsPerPack: 12, stock: 59 },
    { code: 648, name: 'YPORAN 6X1,5ML', category: 'ÀGUAS', unitOfMeasure: 'FARDO', cost: 9, packPrice: 9.7, unitsPerPack: 6, stock: 33 },
    { code: 649, name: 'ZOIÃO DOIDÃO', category: 'PADRÃO', unitOfMeasure: 'CART', cost: 0, packPrice: 369, unitsPerPack: 1, stock: 0 }
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
        String(product.code).includes(lowercasedTerm)
    );
  }, [products, searchTerm]);

  const handleExport = () => {
    const csvData = Papa.unparse(
      filteredProducts.map((p) => ({
        codigo: p.code,
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
            code: Number(row.codigo) || 0,
            name: row.nome || "",
            category: row.categoria || "Sem Categoria",
            unitOfMeasure: row.unidade_medida || "Unidade",
            cost: Number(String(row.preco_compra_fardo).replace(',','.')) || 0,
            packPrice: Number(String(row.preco_venda_fardo).replace(',','.')) || 0,
            unitsPerPack: Number(row.unidades_por_fardo) || 1,
            stock: Number(row.estoque_fardo) || 0,
          })).filter(p => p.name.trim() !== "");

          await loadProducts(parsedProducts as Omit<Product, 'id' | 'price'>[]);
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
                  placeholder="Buscar por código ou nome..."
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
                  <TableHead>Código</TableHead>
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
                        {product.code}
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

    