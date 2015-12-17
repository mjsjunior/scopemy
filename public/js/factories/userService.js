scopeApp.factory('userService', function($http,$mdBottomSheet,$rootScope,$cookies,$window){

		var userService = {}

		userService.logar = function acessar(login,password){
								$http.post('/api/auth',{login:login,password:password})
								    .success(function(data) {
								    	if(!data.success){
								    		$window.location.href = '#/?erroLogin=Usuario e senha não encontrados!';
								    		return false;
								    	}
								        $cookies.put('scopeToken',data.token);
								        var token = $cookies.get('scopeToken');
								        console.log(token);
								        $http.get('/dashboard',{headers: {'x-access-token':token}}).success(function(data){
								       	 $window.location.href = '/dashboard';
								    	});
								    })
								    .error(function(data) {
								        console.log('Error: ');
								        console.log(data);
								    });
								}



		return userService;

})