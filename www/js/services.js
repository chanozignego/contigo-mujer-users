angular.module('app.services', [])


.service('Shipment', ['$http', '$auth', 'BASE',
function($http, $auth, BASE) {
	let shipments = [];

	const getShipments = () => {
		return $http.get(BASE + `/users/${$auth.user.id}/shipments`)
		.success(data => shipments = data)
		.error(() => console.log("Shipments fetch fail"));
	}

	return {
		get: id => shipments.filter(s => s.id == id)[0],
		all: () => shipments,
		currentShipment: () => shipments[0],
		create: shipment => {
			return $http.post(BASE + `/shipments`, shipment)
				.success(data => {
					// So that new shipment became the current one
					shipments = [data.resource].concat(shipments);
					return data.resource;
				})
				.error(() => console.error("Error creating shipment"));
		},
		rate: (shipment, rating) => {
			return $http.post(`${BASE}/shipments/${shipment.id}/rate`, {rating})
				.error(() => console.error("Error rating shipment"));
		},
		getShipments
	}
}])

.service('Law', ['$http', '$auth', 'BASE', function($http, $auth, BASE) {
	let laws = [];
	const getLaws = () => {
		return $http.get(BASE + `/laws`)
			.success((data) => laws = data)
			.error(() => console.log("Laws fetch fail"));
	}

	return {
		get: id => laws.filter(s => s.id == id)[0],
		all: () => laws,
		getLaws
	}
}])

.service('Info', ['$http', '$auth', 'BASE', function($http, $auth, BASE) {
	let infos = [];
	const getInfos = () => {
		return $http.get(BASE + `/infos`)
			.success((data) => infos = data)
			.error(() => console.log("Laws fetch fail"));
	}

	return {
		get: id => infos.filter(s => s.id == id)[0],
		all: () => infos,
		getInfos
	}
}])

.service('Town', ['$http', '$auth', 'BASE', function($http, $auth, BASE) {
	let towns = [];
	const getTowns = () => {
		return $http.get(BASE + `/towns`)
			.success((data) => towns = data)
			.error(() => console.log("Towns fetch fail"));
	}

	return {
		get: id => towns.filter(s => s.id == id)[0],
		all: () => towns,
		getTowns
	}
}])

.service('Assistance', ['$http', '$auth', 'BASE', function($http, $auth, BASE) {
	let assistances = [];
	const getAssistances = () => {
		return $http.get(BASE + `/assistances`)
			.success((data) => assistances = data)
			.error(() => console.log("Assistances fetch fail"));
	}

	return {
		get: id => assistances.filter(s => s.id == id)[0],
		all: () => assistances,
		currentAssistance: () => assistances[0],
		create: assistance => {
			return $http.post(BASE + `/assistances`, assistance)
				.success(data => {
					// So that new shipment became the current one
					assistances = [data.resource].concat(assistances);
					return data.resource;
				})
				.error(() => console.error("Error creating assistance"));
		},
		cancel: assistance => {
			return $http.put(BASE + `/assistances/${assistance.id}/cancel`, assistance)
				.success(data => {
					// So that new shipment became the current one
					assistances = [data.resource].concat(assistances);
					return data.resource;
				})
				.error(() => console.error("Error creating assistance"));
		},
		getAssistances
	}
}])

.service('Offer', ['$http', 'BASE',
function($http, BASE) {
	let offers = [];
	let last = 0;

	const getOffersForShipment = (shipmentId) => {
		if (last != shipmentId) {
			last = shipmentId;
			return $http.get(BASE + `/shipments/${shipmentId}/offers`)
				.success(data => offers = data)
				.error(() => console.log(`Offers fetch for Shipment's id ${shipmentId} fail`));
		} else {
			return Promise.resolve();
		}
	}

	return {
		get: id => offers.filter(o => o.id == id)[0],
		all: () => offers,
		reject: id => {
			return $http.put(`${BASE}/offers/${id}/reject`)
				.success(() => offers = offers.filter(o => o.id != id))
		},
		accept: id => $http.put(`${BASE}/offers/${id}/accept`),
		getOffersForShipment
	}
}])

.service('Price', ['$http', 'BASE',
function($http, BASE) {
	let valuation = {};

	const getValuation = () => {
		return $http.get(BASE + `/laws`)
			.success(data => valuation = data)
			.error(() => console.log(`Valuation fetch fail`));
	}

	return {
		calculate: (shipment) => {
			const type = shipment.shipment_type;
			const distance = shipment.distance;

			const base = Number(valuation.base_price);
			const perKm = Number(valuation.price_per_km);
			const typeCoef = Number(valuation[`${type}_coefficient`]);
			const motoCoef = Number(valuation.motorcycle_coefficient);

			return (base + distance*perKm)*typeCoef*motoCoef;
		},
		getValuation
	}
}])

.service('Fetcher', ['Shipment', 'Offer', 'Price',
function(Shipment, Offer, Price) {
	return {
		initApp: () => {
			return Price.getValuation()
				.then(() => Shipment.getShipments())
				.then(() => {
					const shipping = Shipment.currentShipment();
					if (shipping) {
						return Offer.getOffersForShipment(shipping.id);
					}
				});
		}
	}
}]);
