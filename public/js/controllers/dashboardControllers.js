//Controller da página de inicial do aplicativo
scopeDashboardApp.controller('dashboardController', ['$route','$scope','$rootScope', '$cookies','$http','$mdSidenav','gservice', function($scope,$route,$rootScope,$cookies,$http,$mdSidenav,gservice) {
	console.log('Dashboard');



	$('#salaTitle').html('<img src="/images/logo.png" alt="" class="logo" style="max-height:40px;max-width:150px">');
	$http.get('/api/me').success(function(data){
		console.log('User atualizado!');
		$scope.user = data.user;
		$cookies.put('scopeUser',JSON.stringify(data.user));
	})

    gservice.init('mapa',3);

    var teste = function(){
    	console.log('teste controller');
    }

}]);

scopeDashboardApp.controller('exibirSalaController', function($scope,$mdBottomSheet,gservice,salaService,$window) {
	$scope.acessarSala = function(sala_id)
	{
		$mdBottomSheet.hide();
		$window.location.href = "/dashboard#/room/"+sala_id
	}
});


scopeDashboardApp.controller('indexController', function($http,$timeout,$mdSidenav,$scope,$mdBottomSheet,gservice,salaService,$window) {
	$scope.showEditarPhoto = false;
	$http.get('/api/me').success(function(data){
		$scope.user = data.user
	})

	$scope.editarPhoto = function(user){
		console.log(user);
		$scope.showEditarPhoto = !$scope.showEditarPhoto;

	}

	 $scope.toggleLeft = buildDelayedToggler('left');


	 function buildDelayedToggler(navID) {
      return debounce(function() {
        $mdSidenav(navID)
          .toggle()
      }, 200);
    }

     function debounce(func, wait, context) {
      var timer;
      return function debounced() {
        var context = $scope,
            args = Array.prototype.slice.call(arguments);
        $timeout.cancel(timer);
        timer = $timeout(function() {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }

});

scopeDashboardApp.controller('dashboardChatController',function($route,$cookies,$routeParams,$rootScope,$scope,$http,salaService){
	sala = salaService.getSala($routeParams.id);

	console.log(sala);
	
	$scope.comments = []

	var socket = io.connect('http://192.168.1.107:3000');

	user = $cookies.get('scopeUser');
	user = JSON.parse(user);

	sala.success(function(data){
		console.log(data.title)
		initChat(data)
	})

	var initChat = function iniChat(data){
		console.log(data);
		$scope.title = data.title;
		$('#salaTitle').text(data.title);

		// on connection to server, ask for user's name with an anonymous callback
		// listener, whenever the server emits 'updatechat', this updates the chat body

		socket.on('updatechat', function (user, data) {
			console.log('UPDATE CHAT !!')

			$scope.$apply(function() {
				$scope.comments.push({user:user,data:data})
			});

			var objDiv = document.getElementById("conversation");
			objDiv.scrollTop = objDiv.scrollHeight;
		});

		socket.on('connect', function(){
			socket.emit('adduser',user.name,data);
		});


		socket.on('totalUsuarios', function(total){
			console.log('Nessa sala tem: '+total);
		});

		$('#data').keypress(function(e) {
			if(e.which == 13) {
				enviarMensagem($scope.mensagem)
	
				return false;
			}
		});
	}

	$scope.enviarMensagem = function(mensagem){
		enviarMensagem($scope.mensagem)
	}

	var enviarMensagem =  function(mensagem){
		
		var us = $cookies.get('scopeUser');
		var user = JSON.parse(us);

		if(mensagem.length <= 0)
			return false;

		socket.emit('sendchat',user,mensagem);
		$scope.mensagem = ''
	}

})


//This is forceing the menu to redraw. Avoiding rendering issues
var forceRedraw = function(element){
	console.log('redraw');
	console.log(element)
	if (!element) { return; }
	var n = document.createTextNode(' ');
	var disp = element.style.display;

	element.appendChild(n);
	element.style.display = 'none';

	setTimeout(function(){
		element.style.display = disp;
		n.parentNode.removeChild(n);
	},20);
}




scopeDashboardApp.controller('dashboardCriarSalaController',function($scope,gservice,salaService,$rootScope){

	$scope.criarSala = function(sala){
		sala.lat = $rootScope.novaSalaLat;
		sala.lng = $rootScope.novaSalaLng;
		console.log(sala)

		salaService.add(sala);
	}

    gservice.initNewRoom('new-mapa',15);

});