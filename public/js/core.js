	// create the module and name it scotchApp
	var scopeApp = angular.module('scopeApp', ['ngCookies','ngMaterial','ngRoute']);

	scopeApp.config(['$routeProvider',function($routeProvider){
		$routeProvider
			.when('/',{
				templateUrl: 'views/login/_login.html',
				controller: 'loginController'
			})
			.when('/cadastrar',{
				templateUrl: 'views/login/_cadastro.html',
				controller: 'userController'
			})
			.otherwise({
				redirectTo:'/'
			});
	}]);

	

	