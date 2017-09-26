const NO_IMAGE = 'http://admin.getsimp.com/default-user.jpg';

angular
	.module('app.controllers', ['ng-token-auth', 'ngMap', 'ionic.native', 'ngMessages'])

	.controller('appController', ['$auth', '$scope', '$state', 'Message',
		function($auth, $scope, $state, Message) {
			$scope.messageCount = 0;
			$scope.user = $auth.user;
			$scope.logout = () => $auth.signOut().then($state.go('login'));
			$scope.$on('$ionicView.afterEnter', () => {
				Message.getMessages()
					.success(() => $scope.messageCount = Message.unviewedCount());
			});

	    setInterval(() => {
	      console.log('update notification task executing every 30 seconds');
				Message.getMessages()
					.success(() => $scope.messageCount = Message.unviewedCount());
	    }, 30000);  //120000 --> 2min //30000 --> 30segs
	}])

	.controller('lawsController', ['$auth', '$scope', 'Law', 
		function($auth, $scope, Law) {
			$scope.laws = Law.all();
			$scope.$on('$ionicView.afterEnter', () => {
				Law.getLaws()
					.success(() => $scope.laws = Law.all());
			});
			$scope.openFile = (law) => {
				window.open(law.file_url, '_blank');
			};
	}])

	.controller('infosController', ['$auth', '$scope', 'Info', 
		function($auth, $scope, Info) {
			$scope.infos = Info.all();
			$scope.$on('$ionicView.afterEnter', () => {
				Info.getInfos()
					.success(() => $scope.infos = Info.all());
			});
			$scope.openFile = (info) => {
				window.open(info.file_url, '_blank');
			};
	}])

	.controller('infoDetailsController', ['$scope', 'info', 'Info', 'infoId',
		function ($scope, info, Info, infoId) {
			$scope.info = info;
			$scope.$on('$ionicView.afterEnter', () => {
				Info.getInfos()
					.success(() => $scope.info = Info.get(infoId));
			});
	}])

	.controller('communityController', ['$auth', '$scope', 'Info', 
		function($auth, $scope, Info) {
	}])

	.controller('messagesController', ['$auth', '$scope', 'Message', 
		function($auth, $scope, Message) {
			$scope.messages = Message.all();
			$scope.$on('$ionicView.afterEnter', () => {
				Message.getMessages()
					.success(() => $scope.messages = Message.all());
				Message.markAllAsViewed();
			});
			$scope.messageDetails = (message) => {
				Message.markAsRead(message.id)
					.success(() => {});
			}
	}])

	.controller('helpController', ['$auth', '$scope', '$ionicPopup', '$ionicLoading', 'Assistance',
		function($auth, $scope, $ionicPopup, $ionicLoading, Assistance) {
			$scope.address = $auth.user.address;
			$scope.assistance = {user_id: $auth.user.id, address: $scope.address, town_id: $auth.user.town_id}

			$scope.needHelp = () => {
				$ionicPopup.show({
					cssClass: 'shipment-popup',
					templateUrl: 'templates/needHelp.html',
					title: 'Ayuda!',
					scope: $scope,
					buttons: [
						{ text: 'Cancelar', type: 'button-dark' },
						{ text: '<b>Pedir ayuda</b>', type: 'button-calm',
							onTap: () => {
								$scope.requestHelp();
							}
						}
					]
				});
			};
			
			$scope.requestHelp = () => {
				$ionicLoading.show({
					template: '<p class="item-icon-left">Estamos avisando a alguien para que pueda asistirte...<ion-spinner icon="crescent"/></p>'
				});
				$scope.assistance.id = undefined;
				Assistance.create($scope.assistance)
					.success(assistance => {
						$scope.assistance = assistance;
						$ionicLoading.hide();

						$ionicPopup.show({
							cssClass: 'shipment-popup',
							templateUrl: 'templates/waitingAssistance.html',
							title: 'Asistencia',
							scope: $scope,
							buttons: [
								{ text: 'Cancelar asistencia', type: 'button-calm',
									onTap: () => {
										$scope.cancelAssistance();
									}
								}
							]
						});
					});
			};

			$scope.cancelAssistance = () => {
				Assistance.cancel($scope.assistance)
					.success(assistance => {
						$scope.assistance = {id: undefined, state: undefined, user_id: $auth.user.id, address: $scope.address, town_id: $auth.user.town_id};
					});
				};
	}])


.controller('signUpCtrl', ['$scope', '$auth', '$state', '$ionicLoading', '$ionicPopup', 'Town',
	function ($scope, $auth, $state, $ionicLoading, $ionicPopup, Town) {
		$scope.user = { name: "", email: "", password: "" };
		$scope.towns = Town.all();
		$scope.$on('$ionicView.afterEnter', () => {
			Town.getTowns()
				.success(() => $scope.towns = Town.all());
		});
		$scope.goToSecondStep = () => {
			$ionicPopup.show({
				cssClass: 'shipment-popup',
				templateUrl: 'templates/signUpAddressStep.html',
				title: 'Tu dirección',
				scope: $scope,
				buttons: [
					{ text: 'Cancelar', type: 'button-dark' },
					{ text: '<b>Continuar</b>', type: 'button-calm',
						onTap: () => {
							$scope.goToThirdStep();
						}
					}
				]
			});
		};

		$scope.goToThirdStep = () => {
			$ionicPopup.show({
				cssClass: 'shipment-popup',
				templateUrl: 'templates/signUpAppearanceStep.html',
				title: 'Apariencia',
				scope: $scope,
				buttons: [
					{ text: 'Cancelar', type: 'button-dark' },
					{ text: '<b>Registrarme</b>', type: 'button-calm',
						onTap: () => {
							$scope.signUp();
						}
					}
				]
			});
		};

		$scope.signUp = () => {
			$ionicLoading.show({
				template: '<p class="item-icon-left">Registrando usuario...<ion-spinner icon="crescent"/></p>'
			});
			$auth.submitRegistration($scope.user)
				.then(() => $state.go("tabs.help"))
				.catch(err => {
					console.error("Sign Up error", err)
					$ionicPopup.alert({
						cssClass: 'shipment-alert',
						title: 'Error al registrar usuario',
						template: 'Hubo un problema al registrar el usuario. Intente de nuevo',
						okType: 'button-positive button-clear'
					});
				})
				.finally(() => $ionicLoading.hide());
		};

}])

.controller('splashCtrl', ['$auth', 'Fetcher', '$state', '$timeout', '$ionicHistory',
function($auth, Fetcher, $state, $timeout, $ionicHistory) {
	$ionicHistory.nextViewOptions({
		disableAnimate: true,
		disableBack: true
	});
	$auth.validateUser()
		.then(() => Fetcher.initApp())
		.then(() => $state.go('tabs.help'))
		.catch(() => $timeout(() => $state.go('login',{}, {reload: true}), 1200));
}])

.controller('sendCtrl', ['$scope', '$auth', '$ionicPopup', 'Price', 'Shipment', '$state', '$cordovaDatePicker', '$ionicLoading', 'NgMap',
function ($scope, $auth, $ionicPopup, Price, Shipment, $state, $cordovaDatePicker, $ionicLoading, NgMap) {
	const now =  new Date();
	function formatTime(time) {
		return (time < 10) ? `0${time}` : time;
	}
	function resetShipment() {
		$scope.shipment = {
			start_address: null,
			start_address_latitude: null,
			start_address_longitude: null,
			start_address_specifications: null,
			end_address: null,
			end_address_latitude: null,
			end_address_longitude: null,
			end_address_specifications: null,
			shipment_type: "envelope", // Or package,
			distance: 0,
			suggested_price: 0,
			pick_inmediatly: false,
			pick_time: true,
			suggested_pick_time: `${formatTime(now.getHours())}:${formatTime(now.getMinutes())}`
		};
		NgMap.getMap().then(map => map.directionsRenderers[0].set('directions', null));
	}
	resetShipment();

	// Magia para que funcionen los clicks del autocomplete de google places
	// https://github.com/driftyco/ionic/issues/6387
	$scope.disableTap = () => {
    const container = angular.element(document.getElementsByClassName('pac-container'));
		container.css('pointer-events', 'auto');
    container.attr('data-tap-disabled', 'true');
	}

	$scope.addressForm = {
		myAddresses: $auth.user.addresses || [],
		address: null,
		floor: null,
		specifications: null,
		setAddress: function() { // Dont use arrow function, because "this" must NOT be bound to "scope"
			const address = this.getPlace();
			$scope.addressForm.address = address.name;
			$scope.addressForm.latitude = address.geometry.location.lat();
			$scope.addressForm.longitude = address.geometry.location.lng();
		},
		confirmMyAddress: (address) => {
			$scope.addressForm.confirmAddress(address);
			$scope.addressForm.setDistance();
			$scope.addressForm.setPrice();
			$scope.addressForm.closeAddressPopup();
		},
		setDistance: () => {
			const start = new google.maps.LatLng($scope.shipment.start_address_latitude, $scope.shipment.start_address_longitude);
			const end = new google.maps.LatLng($scope.shipment.end_address_latitude, $scope.shipment.end_address_longitude);
			const distance = google.maps.geometry.spherical.computeDistanceBetween(start, end);
			$scope.shipment.distance = distance / 1000;
		},
		setPrice: () => {
			$scope.shipment.suggested_price = Price.calculate($scope.shipment);
		}
	}

	function setUpAddressForm(title, onConfirm) {
		$scope.addressForm.confirmAddress = onConfirm;

		if ($scope.addressForm.myAddresses.length > 0) {
			const addressPopup = $ionicPopup.show({
				cssClass: 'address-popup',
				templateUrl: 'templates/address.html',
				title: title,
				scope: $scope
			});

			$scope.addressForm.closeAddressPopup = () => addressPopup.close();

			$scope.addressForm.formPopup = () => {
				const formPopup = $ionicPopup.show({
					cssClass: 'form-popup',
					templateUrl: 'templates/addressForm.html',
					title: title,
					scope: $scope,
					buttons: [
						{
							text: 'Cancelar',
							type: 'button-dark',
							onTap: () => {
								$scope.addressForm.closeAddressPopup();
							}
						},
						{
							text: '<b>Confirmar</b>',
							type: 'button-calm',
							onTap: () => {
								$scope.addressForm.confirmAddress();
								$scope.addressForm.setDistance();
								$scope.addressForm.setPrice();
								$scope.addressForm.address = null;
								$scope.addressForm.floor = null;
								$scope.addressForm.specifications = null;
								addressPopup.close();
							}
						}
					]
				});
			};
		} else {
			const formPopup = $ionicPopup.show({
				cssClass: 'form-popup',
				templateUrl: 'templates/addressForm.html',
				title: title,
				scope: $scope,
				buttons: [
					{ text: 'Cancelar', type: 'button-dark' },
					{
						text: '<b>Confirmar</b>',
						type: 'button-calm',
						onTap: () => {
							$scope.addressForm.confirmAddress();
							$scope.addressForm.setDistance();
							$scope.addressForm.setPrice();
							$scope.addressForm.address = null;
							$scope.addressForm.floor = null;
							$scope.addressForm.specifications = null;
						}
					}
				]
			});
		}
	}

	$scope.starForm = () => {
		const confirmStartAddress = (myAddress) => {
			if (myAddress) {
				$scope.shipment.start_address = myAddress.street_number;
				$scope.shipment.start_address_latitude = myAddress.latitude;
				$scope.shipment.start_address_longitude = myAddress.longitude;
				$scope.shipment.start_address_specifications = myAddress.specifications;
			} else {
				const form = $scope.addressForm;
				if (form.address && form.floor) {
					$scope.shipment.start_address = `${form.address}, ${form.floor}`;
				}
				$scope.shipment.start_address_latitude = form.latitude;
				$scope.shipment.start_address_longitude = form.longitude;
				$scope.shipment.start_address_specifications = form.specifications;
			}
		}

		setUpAddressForm('Origen', confirmStartAddress);
	}

	$scope.endForm = () => {
		const confirmEndAddress = (myAddress) => {
			if (myAddress) {
				$scope.shipment.end_address = myAddress.street_number;
				$scope.shipment.end_address_latitude = myAddress.latitude;
				$scope.shipment.end_address_longitude = myAddress.longitude;
				$scope.shipment.end_address_specifications = myAddress.specifications;
			} else {
				const form = $scope.addressForm;
				if (form.address && form.floor) {
					$scope.shipment.end_address = `${form.address}, ${form.floor}`;
				}
				$scope.shipment.end_address_latitude = form.latitude;
				$scope.shipment.end_address_longitude = form.longitude;
				$scope.shipment.end_address_specifications = form.specifications;
			}
		}

		setUpAddressForm('Destino', confirmEndAddress);
	}

	$scope.shipmentForm = () => {
		if ($scope.shipment.start_address && $scope.shipment.end_address) {
			$ionicPopup.show({
				cssClass: 'shipment-popup',
				templateUrl: 'templates/shipmentForm.html',
				title: 'Confirmar Pedido',
				scope: $scope,
				buttons: [
					{ text: 'Cancelar', type: 'button-dark' },
					{
						text: '<b>Confirmar</b>',
						type: 'button-calm',
						onTap: () => {
							$scope.confirmShipment();
						}
					}
				]
			});
		} else {
			$ionicPopup.alert({
				cssClass: 'shipment-alert',
				title: 'Debe verificar los siguientes campos para crear un envío',
				template: '<ul><li>Dirección origen</li><li>Dirección destino</li></ul>',
				okType: 'button-positive button-clear'
			});
		}
	}

	$scope.confirmShipment = () => {
		// TODO mostramos un popup de reminder, con 'no volver a mostrar'
		$ionicLoading.show({
			template: '<p class="item-icon-left">Creando su pedido...<ion-spinner icon="crescent"/></p>'
		});
		Shipment.create($scope.shipment)
			.success(shipment => {
				$ionicLoading.hide();
				resetShipment();
				$state.go('tabs.shipping');
			});
	}

	$scope.setType = type => $scope.shipment.shipment_type = type;

	$scope.pickInmediatly = () => {
		$scope.shipment.pick_inmediatly = true;
		const now =  new Date();
		$scope.shipment.suggested_pick_time = `${formatTime(now.getHours())}:${formatTime(now.getMinutes())}`;
		$scope.shipment.pick_time = null;
	};

	$scope.pickTime = () => {
		$scope.shipment.pick_inmediatly = false;
		$scope.shipment.pick_time = true;
	};

	$scope.openTimePicker = () => {
		$cordovaDatePicker.show({
			mode: 'time',
			date: new Date(),
			doneButtonLabel: 'Aceptar',
			cancelButtonLabel: 'Cancelar',
			doneButtonColor: '#20BFA9', // $positive color
			okText: 'Aceptar',
			cancelText: 'Cancelar',
			is24Hour: true
		}).then(time => {
			$scope.shipment.suggested_pick_time = `${formatTime(time.getHours())}:${formatTime(time.getMinutes())}`;
		})
	};
}])

.controller('shippingCtrl', ['$scope', 'Shipment', 'Offer', '$state',
function ($scope, Shipment, Offer, $state) {
	$scope.hideNavBar = true;
	$scope.showTabs = true;

	$scope.offerDetails = (id) => {
		$state.go('tabs.shippingOfferDetails', {id});
	}

	$scope.$on('$ionicView.beforeEnter', () => {
		$scope.shipment = Shipment.currentShipment();
		if ($scope.shipment) {
			Offer.getOffersForShipment($scope.shipment.id)
				.then(() => $scope.offers = Offer.all());
		}
	})
}])

.controller('shipmentsCtrl', ['$scope', 'Shipment',
function ($scope, Shipment) {
	$scope.shipments = Shipment.all();
	$scope.$on('$ionicView.afterEnter', () => {
		Shipment.getShipments()
			.success(() => $scope.shipments = Shipment.all());
	})
}])

.controller('profileCtrl', ['$scope', '$auth', '$state', '$cordovaCamera', '$http', '$ionicLoading', '$ionicPopup', 'Town',
function ($scope, $auth, $state, $cordovaCamera, $http, $ionicLoading, $ionicPopup, Town) {
	$scope.$on('$ionicView.beforeEnter', () => {
		$scope.user = {
			id: $auth.user.id,
			name: $auth.user.name,
			email: $auth.user.email,
			phone: $auth.user.phone,
			street: $auth.user.street,
			number: $auth.user.number,
			apartment: $auth.user.apartment,
			town_id: $auth.user.town_id,
			age: $auth.user.age,
			height: $auth.user.height,
			//picture: $auth.user.picture || NO_IMAGE
		};
	})

	$scope.towns = Town.all();
	$scope.$on('$ionicView.afterEnter', () => {
		Town.getTowns()
			.success(() => $scope.towns = Town.all());
	});

	$scope.updateUser = () => {
		$ionicLoading.show({
			template: '<p class="item-icon-left">Actualizando perfil...<ion-spinner icon="crescent"/></p>'
		});
		$auth.updateAccount($scope.user)
			.then(() => $state.go('tabs.profile'))
			.catch(() => {
				console.log('Update user error');
				$ionicPopup.alert({
					cssClass: 'shipment-alert',
					title: 'Error al editar perfil',
					template: 'Hubo un problema al querer actualizar su perfil. Intente de nuevo',
					okType: 'button-positive button-clear'
				});
			})
			.finally(() => $ionicLoading.hide());
	}

	$scope.updatePicture = () => {
		$cordovaCamera.getPicture({
      quality: 100,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			destinationType: Camera.DestinationType.DATA_URL,
      saveToPhotoAlbum: false
    })
		.then(picture => {
			picture = `data:image/jpeg;base64,${picture}`;
			return $auth.updateAccount({picture})
				.success(data => {
					$scope.picture = data.picture;
				});
		})
		.catch(err => console.error(err));
	}
}])

.controller('loginCtrl', ['$scope', '$auth', '$state', '$ionicLoading', 'Fetcher', '$ionicPopup',
function ($scope, $auth, $state, $ionicLoading, Fetcher, $ionicPopup) {
	$scope.user = {
		email: "",
		password: ""
	};

	$scope.login = () => {
		$ionicLoading.show({
			template: '<p class="item-icon-left">Iniciando sesión...<ion-spinner icon="crescent"/></p>'
		});
		$auth.submitLogin($scope.user)
			.then(() => {
				Fetcher.initApp();
				$state.go("tabs.help")
			})
			.catch((err) => {
				console.error("login error", err);
				$ionicPopup.alert({
					cssClass: 'shipment-alert',
					title: 'Error al iniciar sesión',
					template: 'Email o contraseña incorrecto. Intente de nuevo',
					okType: 'button-positive button-clear'
				});
			})
			.finally(() => $ionicLoading.hide());
	};
}])


.controller('offerDetailsCtrl', ['$scope', 'shipment', 'offer',
function ($scope, shipment, offer) {
	$scope.shipment = shipment;
	$scope.offer = offer;
}])

.controller('shipmentDetailsCtrl', ['$scope', 'shipment', 'Offer', '$state',
function ($scope, shipment, Offer, $state, $ionicView) {
	$scope.hideNavBar = false;
	$scope.shipment = shipment;

	$scope.offerDetails = (id) => {
		$state.go('tabs.shipmentOfferDetails', {shipmentId: shipment.id, offerId: id});
	}

	$scope.$on('$ionicView.beforeEnter', () => {
		Offer.getOffersForShipment(shipment.id)
			.then(() => $scope.offers = Offer.all());
	})
}])
