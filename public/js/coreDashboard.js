	// create the module and name it scotchApp
	var scopeDashboardApp = angular.module('scopeDashboardApp', ['ngCookies','ngMaterial','ngRoute','geolocation']);


	scopeDashboardApp.config(['$routeProvider',function($routeProvider){
		$routeProvider
			.when('/',{
				templateUrl: 'views/dashboard/_home.html',
				controller: 'dashboardController'
			})
			.when('/rooms',{
				templateUrl: 'views/dashboard/_rooms.html',
				controller: 'dashboardRoomsController'
			})
			.when('/room/:id',{
				templateUrl: 'views/dashboard/_chat.html',
				controller: 'dashboardChatController'
			})
			.when('/criar-sala',{
				templateUrl: 'views/dashboard/_criar-sala.html',
				controller: 'dashboardCriarSalaController'
			})
			.when('/views/*',{
				redirectTo:'/'
			})
			.otherwise({
				redirectTo:'/'
			});
		
	}]);


	