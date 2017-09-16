// Ionic Starter App

angular.module('app', [
  'ionic',
  'ng-token-auth',
  'app.controllers',
  'app.routes',
  'app.directives',
  'app.services'
])

//.constant('BASE', 'http://0.0.0.0:3000/api/v1')
//.constant('BASE', 'http://192.168.0.29:3000/api/v1')
.constant('BASE', 'http://contigomujer.cl/api/v1')

.config(function($ionicConfigProvider, $sceDelegateProvider, $authProvider, $httpProvider, BASE){

  $ionicConfigProvider.backButton.text("");
  $ionicConfigProvider.views.transition("ios");
  $ionicConfigProvider.tabs.style("standard");
  $ionicConfigProvider.tabs.position("bottom");
  $ionicConfigProvider.navBar.alignTitle("center");
  $ionicConfigProvider.navBar.positionPrimaryButtons("left");
  $ionicConfigProvider.navBar.positionSecondaryButtons("right");
  $ionicConfigProvider.spinner.icon("ios");
  $ionicConfigProvider.form.toggle("large");
  $ionicConfigProvider.form.checkbox("circle");

  $sceDelegateProvider.resourceUrlWhitelist([ 'self','*://www.youtube.com/**', '*://player.vimeo.com/video/**']);

  $authProvider.configure({
    apiUrl: BASE,
    emailSignInPath: '/auth/users/sign_in',
    accountUpdatePath: '/auth/users',
    signOutUrl: '/auth/users/sign_out',
    emailRegistrationPath: '/auth/users',
    tokenValidationPath: '/auth/users/validate_token',
    handleLoginResponse: user => user,
    storage: 'localStorage'
  });

  $httpProvider.interceptors.push(() => {
    return {
      request: config => {
        config.headers['device-token'] = window.device_token;
        return config;
      }
    };
  });
})

.run(function($ionicPlatform, $cordovaPush, $rootScope) {
  // Translations, i18n, locale
  const translations = {
    envelope: 'Sobre',
    package: 'Paquete',
    pending: 'Pendiente',
    waiting_carriers_assignment: 'Esperando asignación',
    waiting_user_confirmation: 'Esperando confirmación',
    waiting_carrier: 'Esperando Mensajero',
    in_progress: 'En progreso',
    delivered: 'Entregado',
    canceled: 'Cancelado',
    motorcycle: 'Moto',
    bicycle: 'Bicicleta'
  };

  $rootScope.getText = text => translations[text];

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    // Push notifications
    const push = $cordovaPush.init({
      android: {
        senderID: "853375102946"
      }
    });

    if (push.on) {
      push.on('registration', data => {
        console.log(data);
        window.device_token = data.registrationId;
      });

      push.on('notification', data => {
        console.log(data);
        // data.message,
        // data.title,
        // data.count,
        // data.sound,
        // data.image,
        // data.additionalData
      });

      push.on('error', error => {
        console.log(error);
        // e.message
      });
    }
  });
});
