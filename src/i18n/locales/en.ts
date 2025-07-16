export default {
  common: {
    back: 'Back',
    continue: 'Continue',
    seeAvailableProducts: 'See Available Products',
    explore: 'Explore Products',
    chat: 'Chat',
    details: 'View details',
    available: 'Available',
    ratings: 'ratings',
    location: 'Location',
    price: 'Price',
    quantity: 'Quantity',
    delivery: 'Delivery',
    pickup: 'Pickup',
    profile: 'Profile',
    settings: 'Settings',
    now: 'Now',
    rating: 'rating',
    views: 'views',
    interested: 'interested buyers',
    negotiations: 'negotiations',
    bags: 'bags',
    bag: 'bag',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    all: 'All',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    publish: 'Publish',
    draft: 'Draft',
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    management: 'Management Panel',
    logisticsControl: 'Control and monitor your entire logistics operation in real time'
  },
  menu: {
    dashboard: 'Dashboard',
    buy: 'Buy',
    products: 'Products',
    favorites: 'Favorites',
    negotiations: 'Negotiations',
    myProducts: 'My Products',
    addProduct: 'Add Product',
    finances: 'Finances'
  },
  auth: {
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember me',
    noAccount: 'Don\'t have an account?',
    hasAccount: 'Already have an account?',
    createAccount: 'Create Account',
    buyer: 'Buyer',
    seller: 'Seller',
    corporateEmail: 'Corporate Email',
    corporateEmailPlaceholder: 'Ex: name.surname@company.com',
    createPassword: 'Create Password',
    confirmPasswordPlaceholder: 'Confirm your password',
    rememberDays: 'Remember me for 7 days',
    invalidCredentials: 'Invalid credentials',
    accessDenied: 'Access denied',
    chooseAccountType: 'Choose your account type:',
    createBuyerAccount: 'Create Buyer Account',
    createSellerAccount: 'Create Seller Account',
    startBuying: 'Create your account to start buying on the platform',
    startSelling: 'Create your account to start selling on the platform'
  },
  dashboard: {
    buyer: {
      welcome: 'Welcome to your Buyer Dashboard',
      totalPurchases: 'Total Purchases',
      activeBids: 'Active Bids',
      favoriteProducts: 'Favorite Products',
      pendingDeliveries: 'Pending Deliveries',
      actions: {
        newPurchase: 'Start New Purchase',
        newPurchaseDesc: 'Browse available products and make offers',
        viewFavorites: 'View Favorites',
        viewFavoritesDesc: 'Check your saved products',
        buyProducts: 'Start New Sale',
        buyProductsDesc: 'Add a new product for sale',
      }
    },
    seller: {
      welcome: 'Welcome to your Seller Dashboard',
      revenue: 'Total Revenue',
      activeListings: 'Active Listings',
      activeNegotiations: 'Active Negotiations',
      customers: 'Total Customers',
      actions: {
        newProduct: 'Add New Product',
        newProductDesc: 'List a new product for sale',
        viewMessages: 'View Messages',
        viewMessagesDesc: 'Check your negotiations'
      }
    },
    status: {
      completed: 'Completed',
      pending: 'Pending',
      info: 'Information'
    },
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity'
  },
  seller: {
    products: {
      title: 'My Products',
      addNew: 'Add New Product',
      search: 'Search products...',
      empty: {
        title: 'No products yet',
        description: 'Start by adding your first product'
      },
      status: {
        draft: 'Draft',
        pending: 'Pending Review',
        active: 'Active',
        inactive: 'Inactive',
        sold_out: 'Sold Out'
      },
      deleteConfirmation: 'Are you sure you want to delete this product?',
      productFlow: {
        steps: {
          basic: 'Basic Info',
          specifications: 'Specifications',
          images: 'Images',
          pricing: 'Pricing',
          location: 'Location'
        },
        basic: {
          title: 'Basic Information',
          name: 'Product Name',
          namePlaceholder: 'Enter product name',
          type: 'Product Type',
          selectType: 'Select product type',
          types: {
            soy: 'Soy',
            corn: 'Corn',
            wheat: 'Wheat'
          },
          description: 'Description',
          descriptionPlaceholder: 'Describe your product'
        },
        specifications: {
          title: 'Product Specifications',
          humidity: 'Humidity',
          protein: 'Protein Content',
          purity: 'Purity',
          certification: 'Certification'
        },
        images: {
          title: 'Product Images',
          dragDrop: 'Drag and drop images here or click to select',
          formats: 'Supported formats: JPG, PNG (max 5MB)',
          maxImages: 'Maximum 5 images',
          sizeError: 'Image size exceeds 5MB limit'
        },
        pricing: {
          title: 'Pricing Information',
          price: 'Price per Bag',
          pricePerBag: 'Enter price per bag in BRL',
          available: 'Available Quantity',
          bags: 'bags'
        },
        location: {
          title: 'Location Information',
          address: 'Product Location',
          addressPlaceholder: 'Enter the location where the product is stored',
          addressHelp: 'This helps buyers find products near them'
        }
      }
    },
    finances: {
      title: 'Finances',
      revenue: 'Total Revenue',
      sales: 'Total Sales',
      customers: 'Total Customers',
      avgOrder: 'Average Order',
      recentTransactions: 'Recent Transactions'
    }
  },
activity: {
  seller: {
    newProposal: 'New Purchase Proposal',
    saleConcluded: 'Sale Completed',
    infoRequest: 'Information Request'
  },
  buyer: {
    proposalSent: 'Purchase Proposal Sent',
    purchaseConcluded: 'Purchase Completed',
    infoRequestSent: 'Information Request Sent'
  },
  timeAgo: {
    minutes: '{{count}} minutes ago',
    hours: '{{count}} hours ago'
  }
},
buyFlow: {
  steps: {
    delivery: 'Delivery',
    location: 'Location',
    product: 'Product',
    quantity: 'Quantity',
    date: 'Date'
  },
  deliveryType: {
    title: 'Choose Delivery Method',
    delivery: {
      title: 'Delivery',
      description: 'We deliver to your address'
    },
    pickup: {
      title: 'Pickup',
      description: 'Pick up at seller\'s location'
    }
  },
  address: {
    delivery: {
      title: 'Delivery Address',
      zipcode: 'ZIP Code',
      street: 'Street',
      number: 'Number',
      complement: 'Complement',
      optional: 'Optional',
      neighborhood: 'Neighborhood',
      city: 'City',
      state: 'State'
    },
    pickup: {
      title: 'Pickup Location',
      city: 'City',
      state: 'State',
      radius: 'Search Radius',
      radiusDescription: 'Show products within {{radius}}km radius'
    }
  },
  product: {
    title: 'Select Product Type',
    types: {
      grain: 'Grains',
      coffee: 'Coffee',
      liquid: 'Liquids'
    },
    grainTypes: {
      soy: {
        name: 'Soy',
        description: 'High quality soy'
      },
      corn: {
        name: 'Corn',
        description: 'Premium corn varieties'
      },
      wheat: {
        name: 'Wheat',
        description: 'Superior wheat grains'
      }
    }
  },
  quantity: {
    title: 'Quantity',
    placeholder: 'Enter quantity',
    description: 'Minimum quantity may vary by seller'
  },
  date: {
    title: 'Delivery Date',
    description: 'When would you like to {{type}} your order?',
    receive: 'receive',
    pickup: 'pick up'
  }
},
  negotiations: {
    title: 'Negotiations',
    empty: {
      title: 'No negotiations yet',
      description: 'Start a conversation with sellers to negotiate prices and conditions.',
      buyer: {
        title: 'No negotiations yet',
        description: 'Browse products and start negotiating with sellers.'
      }
    },
    filters: {
      all: 'All Negotiations',
      pending: 'Pending',
      active: 'Active',
      completed: 'Completed'
    },
    status: {
      new: 'New',
      pending: 'Pending',
      active: 'Active',
      completed: 'Completed'
    },
    initialMessage: "Hi! I'm interested in purchasing {{quantity}} {{product}}. I would like to arrange {{deliveryInfo}} for {{date}}."
  },
  mobilePrompt: {
    title: 'Get the Igrib App',
    description: 'Download our mobile app for a better experience with advanced features and real-time notifications.',
  }
};