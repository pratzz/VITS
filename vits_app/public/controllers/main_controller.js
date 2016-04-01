angular.module('vit_app',['ngRoute']).
	config(function ($routeProvider) {
		$routeProvider

	

		
		.when('/estimation/:raspby',
			{
				templateUrl: 'partials/estimation.html',
				controller: 'estimationCtrl'
			})	

		.when('/strength/:raspby',
			{
				templateUrl: 'partials/strength.html',
				controller: 'strengthCtrl'
			})
	})



	
	.controller('estimationCtrl', function ($scope, $routeParams, $http)
	{
		var id = $routeParams.raspby;
		$http.get('/estimate/' + id).success(function (response){
			var data = response.Stolen;
			console.log(response);
		})
	})



	.controller('strengthCtrl', function ($scope, $routeParams, $http)
	{
		var id = $routeParams.raspby;
		$http.get('/strength/' + id).success(function (response){
			
			console.log(response);
		})

	});