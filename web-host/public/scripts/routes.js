'use strict';

app
  .constant('ROUTES', {
    'app': {
      abstract: true,
      url: '/app',
      templateUrl: 'views/app.html',
      authRequired: true
    },
    'app.overview': {
      url: '/overview',
      controller: 'OverviewCtrl',
      templateUrl: 'views/pages/overview.html',
      authRequired: true
    },

    'app.categories': {
      abstract: true,
      url: '/categories',
      template: '<div ui-view></div>',
      authRequired: true
    },
    'app.categories.list': {
      url: '/list',
      controller: 'CategoriesCtrl',
      templateUrl: 'views/pages/categories/list.html',
      authRequired: true
    },
    'app.categories.new': {
      url: '/new',
      controller: 'CategoriesCtrl',
      templateUrl: 'views/pages/categories/new.html',
      authRequired: true
    },
    'app.categories.edit': {
      url: '/edit/:id',
      controller: 'CategoriesCtrl',
      templateUrl: 'views/pages/categories/edit.html',
      authRequired: true
    },
    'app.categories.show': {
      url: '/show/:id',
      controller: 'CategoriesCtrl',
      templateUrl: 'views/pages/categories/show.html',
      authRequired: true
    },

    'app.products': {
      abstract: true,
      url: '/products',
      template: '<div ui-view></div>',
      authRequired: true
    },
    'app.products.list': {
      url: '/list',
      controller: 'ProductsCtrl',
      templateUrl: 'views/pages/products/list.html',
      authRequired: true
    },
    'app.products.new': {
      url: '/new',
      controller: 'ProductsCtrl',
      templateUrl: 'views/pages/products/new.html',
      authRequired: true
    },
    'app.products.edit': {
      url: '/edit/:id',
      controller: 'ProductsCtrl',
      templateUrl: 'views/pages/products/edit.html',
      authRequired: true
    },
    'app.products.show': {
      url: '/show/:id',
      controller: 'ProductsCtrl',
      templateUrl: 'views/pages/products/show.html',
      authRequired: true
    },

    'app.orders': {
      abstract: true,
      url: '/orders',
      template: '<div ui-view></div>',
      authRequired: true
    },
    'app.orders.list': {
      url: '/list',
      controller: 'OrdersCtrl',
      templateUrl: 'views/pages/orders/list.html',
      authRequired: true
    },
    'app.orders.new': {
      url: '/new/:productId',
      controller: 'NewOrderCtrl',
      templateUrl: '',
      authRequired: true
    },
    'app.orders.show': {
      url: '/show/:id',
      controller: 'OrdersCtrl',
      templateUrl: 'views/pages/orders/show.html',
      authRequired: true
    },

    'app.users': {
      abstract: true,
      url: '/users',
      template: '<div ui-view></div>',
      authRequired: true
    },
    'app.users.list': {
      url: '/list',
      controller: 'UsersCtrl',
      templateUrl: 'views/pages/users/list.html',
      authRequired: true
    },
    'app.users.new': {
      url: '/new',
      controller: 'UsersCtrl',
      templateUrl: 'views/pages/users/new.html',
      authRequired: true
    },
    'app.users.edit': {
      url: '/edit/:id',
      controller: 'UsersCtrl',
      templateUrl: 'views/pages/users/edit.html',
      authRequired: true
    },
    'app.users.show': {
      url: '/show/:id',
      controller: 'UsersCtrl',
      templateUrl: 'views/pages/users/show.html',
      authRequired: true
    },

    'app.profile': {
      url: '/profile',
      controller: 'ProfileCtrl',
      templateUrl: 'views/pages/profile.html',
      authRequired: true
    },

    'core': {
      abstract: true,
      url: '/core',
      template: '<div ui-view></div>',
      containerClass: 'core'
    },
    'core.login': {
      url: '/login',
      controller: 'AuthCtrl',
      templateUrl: 'views/pages/login.html',
      containerClass: 'core'
    },
    'core.forgotpass': {
      url: '/forgotpass',
      controller: 'ForgotPasswordCtrl',
      templateUrl: 'views/pages/forgotpass.html'
    }
  });
