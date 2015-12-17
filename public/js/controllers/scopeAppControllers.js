//Controller da página inicial de login
	scopeApp.controller('loginController', ['userService','$rootScope','$routeParams','$scope','$window','$cookies','$http', function(userService,$rootScope,$routeParams,$scope,$window,$cookies,$http) {
	    $scope.token = $cookies.get('scopeToken');

	    $scope.erroMessage = $routeParams.erroLogin
	    console.log($routeParams.erroLogin)

	    $scope.logar = function(login,password){
	    	userService.logar(login,password)
        }
	}]);

	//Controller da página de Cadastro
	scopeApp.controller('userController', ['userService','$scope', '$http', function(userService,$scope,$http) {
	   	$scope.cadastrarUser = function(user){
		  	$http.post('/user/cadastrar',$scope.user)
				.success(function(data) {
					if(data.success == 'false')
					{
						console.log(data)
						 $scope.erroMessage = data.message
						return false;
					}
					console.log($scope.user.login+'+ -- >'+$scope.user.password)
					userService.logar($scope.user.login,$scope.user.password);
				})
				.error(function(data) {
				    console.log('Error: ' + data);
				});
	   	}
	}]);

