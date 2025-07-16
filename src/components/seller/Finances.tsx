'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import PageTransition from '../PageTransition';
import AnimatedNumber from '../AnimatedNumber';

const Finances = () => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('seller.finances.revenue'),
      value: 125430,
      prefix: 'R$ ',
      decimals: 2,
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign
    },
    {
      title: t('seller.finances.sales'),
      value: 534,
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingCart
    },
    {
      title: t('seller.finances.customers'),
      value: 245,
      change: '+23.1%',
      isPositive: true,
      icon: Users
    },
    {
      title: t('seller.finances.avgOrder'),
      value: 234.89,
      prefix: 'R$ ',
      decimals: 2,
      change: '-2.4%',
      isPositive: false,
      icon: TrendingUp
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      customer: 'João Silva',
      product: 'Soja Orgânica Premium',
      amount: 'R$ 5.400,00',
      date: '2024-03-15',
      status: 'completed'
    },
    {
      id: 2,
      customer: 'Maria Santos',
      product: 'Milho Premium',
      amount: 'R$ 2.850,00',
      date: '2024-03-14',
      status: 'pending'
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold text-gray-900 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('seller.finances.title')}
        </motion.h1>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.title}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              variants={item}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-50 rounded-lg">
                  <stat.icon className="h-6 w-6 text-green-600" />
                </div>
                <div className={`flex items-center ${
                  stat.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="text-sm font-medium">{stat.change}</span>
                  {stat.isPositive ? (
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 ml-1" />
                  )}
                </div>
              </div>
              <p className="mt-4 text-2xl font-semibold text-gray-900">
                <AnimatedNumber
                  value={stat.value}
                  prefix={stat.prefix}
                  decimals={stat.decimals}
                />
              </p>
              <p className="text-gray-600">{stat.title}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="bg-white rounded-xl shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('seller.finances.recentTransactions')}
            </h2>
          </div>
          <motion.div 
            className="divide-y"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {recentTransactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                className="p-6 hover:bg-gray-50 transition-colors"
                variants={item}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.customer}</p>
                    <p className="text-sm text-gray-600">{transaction.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{transaction.amount}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Finances;