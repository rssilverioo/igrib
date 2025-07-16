'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  MessageCircle
} from 'lucide-react';
import PageTransition from '../PageTransition';
import AnimatedNumber from '../AnimatedNumber';

const SellerDashboard = () => {
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
      title: t('seller.products.activeListings'),
      value: 15,
      change: '+8.2%',
      isPositive: true,
      icon: Package
    },
    {
      title: t('seller.finances.activeNegotiations'),
      value: 28,
      change: '+23.1%',
      isPositive: true,
      icon: MessageCircle
    },
    {
      title: t('seller.finances.customers'),
      value: 245,
      change: '+18.4%',
      isPositive: true,
      icon: Users
    }
  ];

  const recentActivity = [
    {
      id: 1,
      title: t('activity.seller.newProposal'),
      description: `Soja Orgânica Premium - 500 ${t('common.bags')}`,
      time: t('activity.timeAgo.minutes', { count: 5 }),
      status: 'pending'
    },
    {
      id: 2,
      title: t('activity.seller.saleConcluded'),
      description: `Milho Premium - 200 ${t('common.bags')}`,
      time: t('activity.timeAgo.hours', { count: 2 }),
      status: 'completed'
    }
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
          className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('dashboard.seller.welcome')}
        </motion.h1>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.title}
              className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow"
              variants={item}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-50 rounded-lg">
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
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
              <p className="mt-4 text-xl sm:text-2xl font-semibold text-gray-900">
                <AnimatedNumber
                  value={stat.value}
                  prefix={stat.prefix}
                  decimals={stat.decimals}
                />
              </p>
              <p className="text-sm sm:text-base text-gray-600">{stat.title}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <motion.div 
            className="bg-white rounded-xl shadow-md overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {t('dashboard.recentActivity')}
              </h2>
            </div>
            <motion.div 
              className="divide-y"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                  variants={item}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : activity.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {t(`dashboard.status.${activity.status}`)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl shadow-md p-4 sm:p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">
              {t('dashboard.quickActions')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button 
                className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 mb-2" />
                <p className="font-medium text-gray-900">{t('dashboard.seller.actions.newProduct')}</p>
                <p className="text-sm text-gray-600">{t('dashboard.seller.actions.newProductDesc')}</p>
              </motion.button>
              <motion.button 
                className="p-4 border rounded-lg hover:bg-gray-50 text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 mb-2" />
                <p className="font-medium text-gray-900">{t('dashboard.seller.actions.viewMessages')}</p>
                <p className="text-sm text-gray-600">{t('dashboard.seller.actions.viewMessagesDesc')}</p>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SellerDashboard;