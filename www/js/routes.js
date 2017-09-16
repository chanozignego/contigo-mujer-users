angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  // IMPORTANT: All resolves MUST NOT be async!! Bad ux
  $stateProvider

  // Tabs routes
  .state('tabs', {
    url: '/tabs',
    templateUrl: 'templates/menu.html',
    controller: 'appController',
    abstract: true,
    resolve: {
      initApp: ($auth, $state) => {
        return $auth.validateUser()
          .catch(() => $state.go('login', {}, {reload: true}));
      }
    },
  })

  .state('tabs.laws', {
    url: '/laws',
    views: {
      'menuContent': {
        templateUrl: 'templates/laws.html',
        controller: 'lawsController'
      }
    }
  })

  .state('tabs.infos', {
    url: '/infos',
    views: {
      'menuContent': {
        templateUrl: 'templates/infos.html',
        controller: 'infosController'
      }
    }
  })
  .state('tabs.infoDetails', {
    url: '/infos/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/infoDetails.html',
        controller: 'infoDetailsController'
      }
    },
    resolve: {
      info: (Info, $stateParams) => {Info.get($stateParams.id)},
      infoId: ($stateParams) => $stateParams.id
    }
  })
  .state('tabs.community', {
    url: '/community',
    views: {
      'menuContent': {
        templateUrl: 'templates/community.html',
        controller: 'communityController'
      }
    }
  })
  .state('tabs.messages', {
    url: '/messages',
    views: {
      'menuContent': {
        templateUrl: 'templates/messages.html',
        controller: 'messagesController'
      }
    }
  })

  .state('tabs.shipmentDetails', {
    url: '/shipments/:id',
    views: {
      'shipments': {
        templateUrl: 'templates/shipmentDetails.html',
        controller: 'shipmentDetailsCtrl'
      }
    },
    resolve: {
      shipment: (Shipment, $stateParams) => Shipment.get($stateParams.id)
    }
  })
  .state('tabs.shipmentOfferDetails', {
    url: '/shipments/:shipmentId/offers/:offerId',
    views: {
      'shipments': {
        templateUrl: 'templates/offerDetails.html',
        controller: 'offerDetailsCtrl'
      }
    },
    resolve: {
      shipment: (Shipment, $stateParams) => Shipment.get($stateParams.shipmentId),
      offer: (Offer, $stateParams) => Offer.get($stateParams.offerId)
    }
  })

  .state('tabs.help', {
    url: '/help',
    views: {
      'menuContent': {
        templateUrl: 'templates/help.html',
        controller: 'helpController'
      }
    }
  })
  .state('tabs.editProfile', {
    url: '/profile/edit',
    views: {
      'menuContent': {
        templateUrl: 'templates/editProfile.html',
        controller: 'editProfileCtrl'
      }
    }
  })

  // Profile
  // .state('tabs.profile', {
  //   url: '/profile',
  //   views: {
  //     'profile': {
  //       templateUrl: 'templates/profile.html',
  //       controller: 'profileCtrl'
  //     }
  //   }
  // })
  // .state('tabs.editProfile', {
  //   url: '/profile/edit',
  //   views: {
  //     'profile': {
  //       templateUrl: 'templates/editProfile.html',
  //       controller: 'editProfileCtrl'
  //     }
  //   }
  // })
  // Finish Tabs

  // Login
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  // Sign Up
  .state('signUp', {
    url: '/signup',
    templateUrl: 'templates/signUp.html',
    controller: 'signUpCtrl'
  })

  // Sign Up
  .state('splash', {
    url: '/splash',
    templateUrl: 'templates/splash.html',
    controller: 'splashCtrl'
  });

  $urlRouterProvider.otherwise('/splash');
});
