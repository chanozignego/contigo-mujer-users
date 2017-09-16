angular
	.module('app.directives', ['ionic.native'])

	.directive('shipmentCard', function(){
		return {
			scope: {
				shipment: '='
			},
			templateUrl: 'templates/shipmentCard.html',
			controller: ($scope) => {
				$scope.noImage = NO_IMAGE;
			}
		};
	})

	.directive('lawCard', function(){
		return {
			scope: {
				law: '='
			},
			templateUrl: 'templates/lawCard.html',
			controller: ($scope) => {
				$scope.noImage = NO_IMAGE;
			}
		};
	})
	.directive('infoCard', function(){
		return {
			scope: {
				info: '='
			},
			templateUrl: 'templates/infoCard.html',
			controller: ($scope) => {
				$scope.noImage = NO_IMAGE;
			}
		};
	})
	.directive('messageCard', function(){
		return {
			scope: {
				message: '='
			},
			templateUrl: 'templates/messageCard.html',
			controller: ($scope) => {
				$scope.noImage = NO_IMAGE;
				$scope.getMessageText = (message) => {
					var text = "";
					if (message.message_type == "answer_question") {
						text = "Respondieron una pregunta tuya"
					}
					return text;
				};
		    $scope.getMessageDate = (message) => {
		    	var date = new Date(message.created_at)
		    	var year = $scope.formatDateNumber(date.getFullYear());
		    	var month = $scope.formatDateNumber(date.getMonth() + 1);
		    	var day = $scope.formatDateNumber(date.getDate());
		    	var hour = $scope.formatDateNumber(date.getHours());
		    	var minutes = $scope.formatDateNumber(date.getMinutes());

		      //return new Date(message.created_at).toUTCString()
		      return `${day}/${month}/${year} ${hour}:${minutes}hs`
		    };
		    $scope.formatDateNumber = (date) => {
		    	if (date < 10) {
		    		return `0${date}`;
		    	} else {
		    		return date;
		    	}
		    };
			}
		};
	})



.directive('offerCard', function(){
	return {
		scope: {
			offer: '='
		},
		templateUrl: 'templates/offerCard.html',
		controller: ($scope, $ionicPopup, $ionicHistory, Offer, Shipment, $ionicLoading) => {
			$scope.noImage = NO_IMAGE;
			$scope.rate = 0;

			$scope.showAcceptReject = $scope.offer.shipment.status === "waiting_user_confirmation" && $scope.offer.status === "waiting_confirmation";
			$scope.showRate = $scope.offer.shipment.status === "finalize" && !$scope.offer.shipment.is_rated;

			$scope.reject = () => {
				$ionicLoading.show({
					template: '<p class="item-icon-left">Rechazando oferta...<ion-spinner icon="crescent"/></p>'
				});
				Offer.reject($scope.offer.id)
					.success(() => $ionicHistory.goBack())
					.finally(() => $ionicLoading.hide());
			}

			$scope.accept = () => {
				$ionicLoading.show({
					template: '<p class="item-icon-left">Aceptando oferta...<ion-spinner icon="crescent"/></p>'
				});
				Offer.accept($scope.offer.id)
					.success(() => $ionicHistory.goBack())
					.finally(() => $ionicLoading.hide());
			};

			$scope.rateForm = () => {
				$ionicPopup.show({
					cssClass: 'rate-popup',
					templateUrl: 'templates/rateForm.html',
					title: 'Calificar envío',
					scope: $scope,
					buttons: [
						{ text: 'Cancelar' },
						{
							text: '<b>Calificar</b>',
							type: 'button-calm',
							onTap: () => {
								$scope.rateShipment();
								$scope.rate = 0;
							}
						}
					]
				});
			}

			$scope.setRate = newRate => $scope.rate = newRate;
			$scope.rateShipment = () => {
				$ionicLoading.show({
					template: '<p class="item-icon-left">Calificando...<ion-spinner icon="crescent"/></p>'
				});
				Shipment.rate($scope.offer.shipment, $scope.rate)
					.success(() => $scope.offer.shipment.is_rated = true)
					.finally(() => $ionicLoading.hide());
			};
		}
	};
})

.directive('facebookLogin', function(){
	return {
		template: '<button ng-click="fbLogin()" class="button button-calm button-small button-block icon-left ion-social-facebook facebook-login">INICIAR CON FACEBOOK</button>',
		controller: ($scope, $cordovaFacebook, $http, $state, BASE, $ionicLoading) => {

			function getProfile(data) {
				const uid = data.authResponse.userID;
				const fields = "id,email,first_name,last_name,picture.type(large)"
				return $cordovaFacebook.api(`${uid}/?fields=${fields}`, ['public_profile', 'email']);
			}

			$scope.fbLogin = () => {
				$cordovaFacebook.getLoginStatus()
					.then(data => {
						if (data.status === "connected") {
							return getProfile(data);
						} else {
							return $cordovaFacebook.login(["public_profile", "email"])
								.then(data => {
									return getProfile(data);
								})
						}
					})
          .then(profile => {
						const data = {
							facebook_uid: profile.id,
							first_name: profile.first_name,
							last_name: profile.last_name,
							picture: profile.picture && profile.picture.data.url,
							email: profile.email
						}
						$ionicLoading.show({
							template: '<p class="item-icon-left">Iniciando sesión...<ion-spinner icon="crescent"/></p>'
						});
						return $http.post(`${BASE}/auth/users/sign_up_with_facebook`, data)
							.success(() => $state.go('tabs.laws'))
							.finally(() => $ionicLoading.hide());
					})
					.catch(err => console.error(err));
			}
		}
	};
})

.directive('hideTabs', function() {
  const style = angular.element('<style>').html(
    '.has-tabs.no-tabs:not(.has-tabs-top) { bottom: 0; }\n' +
    '.no-tabs.has-tabs-top { top: 44px; }');
  document.body.appendChild(style[0]);

	return {
    restrict: 'A',
    compile: (element, attr) => {
      const tabBar = document.querySelector('.tab-nav');

      return ($scope, $element, $attr) => {
				// Use directive hide-tabs for hiding
				// Define showTabs in controller and attach to scope for showing even if the directive is active
				// becasue shipmentsDetails is reused in tab shipping(show) and in shipments details(hide)
				if (!$scope.showTabs) {
					const scroll = $element[0].querySelector('.scroll-content');
					$scope.$on('$ionicView.beforeEnter', function() {
						tabBar.classList.add('slide-away');
						scroll.classList.add('no-tabs');
					})
					$scope.$on('$ionicView.beforeLeave', function() {
						tabBar.classList.remove('slide-away');
						scroll.classList.remove('no-tabs')
					});
				}
      }
    }
  };
});

