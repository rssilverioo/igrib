'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Store,
  Heart,
  HandshakeIcon,
  User,
  Settings,
  BarChart,
  Package,
  ChevronDown,
  LayoutDashboard,
  PlusCircle,
  Menu,
  X,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { signOut } from 'next-auth/react';
import { Building2, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { t } = useTranslation();
  const { user, isSeller, isAdmin, activeOrg } = useCurrentUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const buyerMenuItems = [
    { icon: LayoutDashboard, label: t('menu.dashboard'), path: '/dashboard/buyer' },
    { icon: ShoppingBag, label: t('menu.buy'), path: '/dashboard/buy' },
    { icon: Heart, label: t('menu.favorites'), path: '/dashboard/favorites' },
    { icon: HandshakeIcon, label: t('menu.negotiations'), path: '/dashboard/negotiations' },
    { icon: FileText, label: t('menu.contracts'), path: '/dashboard/contracts' },
  ];

  const sellerMenuItems = [
    { icon: LayoutDashboard, label: t('menu.dashboard'), path: '/dashboard/seller' },
    { icon: Package, label: t('menu.myProducts'), path: '/dashboard/seller/products' },
    { icon: PlusCircle, label: t('menu.addProduct'), path: '/dashboard/seller/products/new' },
    { icon: HandshakeIcon, label: t('menu.negotiations'), path: '/dashboard/negotiations' },
    { icon: FileText, label: t('menu.contracts'), path: '/dashboard/contracts' },
    { icon: BarChart, label: t('menu.finances'), path: '/dashboard/seller/finances' },
  ];

  const adminMenuItems = [
    { icon: ShieldCheck, label: t('menu.admin'), path: '/dashboard/admin' },
    { icon: HandshakeIcon, label: t('menu.negotiations'), path: '/dashboard/negotiations' },
    { icon: FileText, label: t('menu.contracts'), path: '/dashboard/contracts' },
  ];

  const menuItems = isAdmin ? adminMenuItems : isSeller ? sellerMenuItems : buyerMenuItems;

const isActive = (path: string) => {
  // Rota exata → ativa
  if (pathname === path) return true;

  // Sub-rota → ativa apenas se não houver um item mais específico
  if (pathname.startsWith(path + '/')) {
    // Verifica se há um item mais específico no menu que poderia estar ativo
    const hasMoreSpecificItem = menuItems.some(
      (item) => item.path !== path && pathname.startsWith(item.path + '/')
    );
    return !hasMoreSpecificItem;
  }

  return false;
};

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const menuItemVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: -20,
      opacity: 0
    }
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg hover:bg-gray-100"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>
      )}

      {/* Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && isMobile && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={isMobile ? (isMobileMenuOpen ? "open" : "closed") : "open"}
        variants={sidebarVariants}
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-50 ${
          isMobile ? 'w-[280px]' : 'w-64'
        }`}
      >
        <div className="p-6">
          <Link href={`/dashboard/${isAdmin ? 'admin' : isSeller ? 'seller' : 'buyer'}`}>
              <img src="/images/logo-green.svg" width={100} height={20} />
          </Link>
        </div>

        {/* Organization info */}
        {activeOrg && (
          <div className="px-6 py-2 border-b border-gray-100">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{activeOrg.organizationName}</span>
            </div>
          </div>
        )}

        <div className="px-6 py-2">
          <LanguageSwitcher />
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <motion.ul
            initial="closed"
            animate="open"
            variants={{
              open: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="space-y-2"
          >
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              
              return (
                <motion.li
                  key={item.path}
                  variants={menuItemVariants}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-brand-light text-brand'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => isMobile && setIsMobileMenuOpen(false)}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-brand' : 'text-gray-600'}`} />
                    <span className={`font-medium ${active ? 'text-brand' : 'text-gray-600'}`}>
                      {item.label}
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        </nav>

        <div className="p-4 border-t space-y-2">
          <Link href="/dashboard/organization">
            <motion.div
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <Building2 className="h-5 w-5" />
              <span className="font-medium">{t('menu.organization') || 'Organizacao'}</span>
            </motion.div>
          </Link>
          <motion.div
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
          >
            <User className="h-5 w-5" />
            <div className="flex-1 min-w-0">
              <span className="font-medium block truncate">{user?.name || 'Perfil'}</span>
              <span className="text-xs text-gray-400 block truncate">{user?.email}</span>
            </div>
          </motion.div>
          <motion.button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-600">{t('common.settings')}</span>
            </div>
            <motion.div
              animate={{ rotate: isSettingsOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </motion.div>
          </motion.button>
          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pl-4"
              >
                <LanguageSwitcher />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sair</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;