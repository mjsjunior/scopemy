scopeDashboardApp.factory('salaService', function($http,$mdBottomSheet,$rootScope,$window){

		var salaService = {}

		salaService.add = function(sala){
			$http.post('/api/room',sala).success(function(data){
				console.log(data);
				console.log('Criada com sucesso...');
				$window.location.href = "#/room/"+data._id
			})
		}

		salaService.getSala = function(id){
			return $http.get('/api/room?id='+id).success(function(data){
				console.log('Resultado da busca...');
				return data;
			})
		}


		return salaService;

})