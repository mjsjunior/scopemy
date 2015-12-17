scopeDashboardApp.factory('gservice', function($http,$mdBottomSheet,$rootScope){
	//Meu objeto, nele teremos as funções 
	var googleMapService = {}

    // Localização inicial do mapa ao ser carregado- BRASILIA DF
     var lat = -15.7942287;
     var lng = -47.8821658;

	googleMapService.init = function(div,zoom){
        var myLatLng = {lat: lat, lng: lng};

        var map = new google.maps.Map(document.getElementById(div), {
		    center: myLatLng,
		    zoom: zoom,
		    mapTypeControlOptions: {
			        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			        position: google.maps.ControlPosition.TOP_CENTER
			    },
			    zoomControl: true,
				    zoomControlOptions: {
				    position: google.maps.ControlPosition.LEFT_CENTER
				}
	  	});

        if (navigator.geolocation) {
	    	navigator.geolocation.getCurrentPosition(function(position) {
	    	//Cria objeto latLng
	      	var pos = {
		        lat: position.coords.latitude,
		        lng: position.coords.longitude
	      	};
	      	//Posiciona o mapa
	      	map.setCenter(pos);

		    }, function() {
		      handleLocationError(true, infoWindow, map.getCenter());
		    });
		} else {
		    // Browser doesn't support Geolocation
		    handleLocationError(false, infoWindow, map.getCenter());
		}

		//Exibe as salas
        $http.get('/api/rooms').success(function(data){
        	exibirSalas(data,map)
        })
        
	}

	googleMapService.initNewRoom = function(div,zoom){
        var myLatLng = {lat: lat, lng: lng};
        // Caso não tenha nenhum mapa,crio o mapa na div informada com as localizações do user
       
        var mapNew = new google.maps.Map(document.getElementById(div), {
			    center: {lat: -15.7942287, lng: -47.8821658},
			    zoom: 3,
			    mapTypeControl: true,
			    mapTypeControlOptions: {
			        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			        position: google.maps.ControlPosition.TOP_CENTER
			    },
			    zoomControl: true,
				    zoomControlOptions: {
				    position: google.maps.ControlPosition.LEFT_CENTER
				}
		});

       
        if (navigator.geolocation) {
	        var pos = {lat: -15.7942287, lng: -47.8821658}
	   	  	mapNew.setCenter(pos);
	    	var salaMarker = new google.maps.Marker({
	    	 	position:pos,
	    	 	map:mapNew,
	    	 	draggable: true,
	    	 	animation: google.maps.Animation.BOUNCE,
	    	 	icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
	    	});

	   	  	navigator.geolocation.getCurrentPosition(function(position) {
		      	pos = {
			        lat: position.coords.latitude,
			        lng: position.coords.longitude
		      	};
		      	mapNew.setCenter(pos);
		      	salaMarker.setPosition(pos);
		      	mapNew.setZoom(13);

		    }, function() {
		      console.log('Nao compartilhado localização....')
		    });




	        	//caso não modifique o marker de lgar vai com posição inicial dele
	        	$rootScope.novaSalaLat = pos.lat
				$rootScope.novaSalaLng = pos.lng

	   			//google.maps.event.addListener(salaMarker, 'dragend', function(evt){
				// 	$rootScope.novaSalaLat = evt.latLng.lat().toFixed(3);
				// 	$rootScope.novaSalaLng = evt.latLng.lng().toFixed(3);
				//     document.getElementById('current').innerHTML = '<p>Marker dropped: Current Lat: ' + evt.latLng.lat().toFixed(3) + ' Current Lng: ' + evt.latLng.lng().toFixed(3) + '</p>';
				// });

				google.maps.event.addListener(mapNew, 'click', function(event) {
					salaMarker.setPosition(event.latLng);
				  	$rootScope.novaSalaLat = event.latLng.lat().toFixed(3);
					$rootScope.novaSalaLng = event.latLng.lng().toFixed(3);
					console.log(event.latLng);
				});




	  	} else {
		    // Browser doesn't support Geolocation
		    handleLocationError(false, infoWindow, map.getCenter());
		}

        $http.get('/api/rooms').success(function(data){
        	exibirSalas(data,mapNew)
        })
        
	}

	var exibirSalas = function(salas,mapa){

		//Passo em todas as salas
		markers = [] // usado para agrupar os markers
	 	salas.forEach(function(sala,index){
	 		var  contentString = 'Titulo: '+sala.title
        	var salaMarker = new google.maps.Marker({
        		position:{lat: sala.location.coordinates[0],lng:sala.location.coordinates[1]},
        		map:mapa,
        		title: sala.title,
        		icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        	});

			salaMarker.addListener('click', function() {
				exibirInformacoesSala(sala)
			});

			markers.push(salaMarker)
        })
	 	var mcOptions = {gridSize: 50, maxZoom: 15};
        var markerCluster = new MarkerClusterer(mapa, markers,mcOptions);
	}


	var exibirInformacoesSala = function(sala){
    	$mdBottomSheet.show({
    	preserveScope:true,
	    template: '<md-bottom-sheet class="md-list md-has-header" ng-cloak>'+
					  '<md-subheader>'+sala.title+'</md-subheader>'+
					  '<md-button class="md-raised md-primary" ng-click="acessarSala(\''+sala._id+'\')"> Acessar Sala </md-button>'+
					'</md-bottom-sheet>',
	      controller: 'exibirSalaController'
	    }).then(function(clickedItem) {
	      $scope.alert = clickedItem['name'] + ' clicked!';
	    });
	}
	












	// // Initializes the map
 //    var initialize = function(latitude, longitude) {

 //        // Uses the selected lat, long as starting point
 //        var myLatLng = {lat: selectedLat, lng: selectedLong};

 //        // Loop through each location in the array and place a marker
 //        locations.forEach(function(n, i){
 //            var marker = new google.maps.Marker({
 //                position: n.latlon,
 //                map: map,
 //                title: "Big Map",
 //                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
 //            });

 //            // For each marker created, add a listener that checks for clicks
 //            google.maps.event.addListener(marker, 'click', function(e){

 //                // When clicked, open the selected marker's message
 //                currentSelectedMarker = n;
 //                n.message.open(map, marker);
 //            });
 //        });

 //        // Set initial location as a bouncing red marker
 //        var initialLocation = new google.maps.LatLng(latitude, longitude);
 //        var marker = new google.maps.Marker({
 //            position: initialLocation,
 //            animation: google.maps.Animation.BOUNCE,
 //            map: map,
 //            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
 //        });
 //        lastMarker = marker;

 //    };


	//Retornamos o objeto com todas as funções configuradas
	return googleMapService
})