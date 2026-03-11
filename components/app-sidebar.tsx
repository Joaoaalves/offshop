'use client'

import {
    PackageIcon,
    PlusCircleIcon,
    ListIcon,
    TruckIcon,
    ShoppingCartIcon,
    FlameIcon,
    BanIcon,
    ScanBarcode,
    FileSpreadsheet
} from 'lucide-react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar'

const AppSideBar = () => {
    const pathname = usePathname()

    const isActive = (path: string) =>
        pathname === path

    const activeClasses =
        'bg-primary/10 text-primary font-bold'

    const defaultClasses =
        'hover:bg-muted/50 transition-colors'

    const getClasses = (path: string) =>
        isActive(path) ? activeClasses : defaultClasses

    return (
        <Sidebar className='z-20'>
            <SidebarContent>

                {/* Logo */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="#" className="font-bold">
                                        <PackageIcon />
                                        <span>Offshop - Gestão de Estoque</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* PRODUTOS */}
                <SidebarGroup>
                    <SidebarGroupLabel>Produtos</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link
                                        href="/produtos"
                                        className={getClasses('/produtos')}
                                    >
                                        <ListIcon />
                                        <span>Listar Produtos</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* FORNECEDORES */}
                <SidebarGroup>
                    <SidebarGroupLabel>Fornecedores</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link
                                        href="/fornecedores/criar"
                                        className={getClasses('/fornecedores/criar')}
                                    >
                                        <PlusCircleIcon />
                                        <span>Criar Fornecedor</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link
                                        href="/fornecedores"
                                        className={getClasses('/fornecedores')}
                                    >
                                        <TruckIcon />
                                        <span>Listar Fornecedores</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* MERCADO LIVRE */}
                <SidebarGroup>
                    <SidebarGroupLabel>Mercado Livre</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Vendas</SidebarGroupLabel>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href="/mercado-livre/vendas/anuncios"
                                            className={getClasses('/mercado-livre/vendas/anuncios')}
                                        >
                                            <ScanBarcode />
                                            <span>Anúncios</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href="/mercado-livre/vendas/catalogo"
                                            className={getClasses('/mercado-livre/vendas/catalogo')}
                                        >
                                            <FileSpreadsheet />
                                            <span>Disputa de Catálogo</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                        {/* <SidebarGroup>
                            <SidebarGroupLabel>Estoque</SidebarGroupLabel>
                            <SidebarMenu>

                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href="/mercado-livre/estoque/sugestoes-compra"
                                            className={getClasses('/mercado-livre/estoque/sugestoes-compra')}
                                        >
                                            <ShoppingCartIcon />
                                            <span>Sugestões de Compra</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>

                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href="/mercado-livre/estoque/sugestoes-queima"
                                            className={getClasses('/mercado-livre/estoque/sugestoes-queima')}
                                        >
                                            <FlameIcon />
                                            <span>Sugestões de Queima</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>

                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href="/mercado-livre/estoque/descontinuar"
                                            className={getClasses('/mercado-livre/estoque/descontinuar')}
                                        >
                                            <BanIcon />
                                            <span>Descontinuar</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup> */}


                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>
        </Sidebar>
    )
}

export default AppSideBar