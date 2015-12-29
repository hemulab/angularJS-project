var courses = [
	{course:'语文', icon:'i1'},
	{course:'数学', icon:'i2'},
	{course:'英语', icon:'i3'},
	{course:'物理', icon:'i4'},
	{course:'化学', icon:'i5'},
	{course:'生物', icon:'i6'},
	{course:'政治', icon:'i7'},
	{course:'历史', icon:'i8'},
	{course:'地理', icon:'i9'}
];
var hubs = [
	{name:'组卷中心', id:'group'},
	{name:'试卷中心', id:'paper'},
	{name:'个人中心', id:'user'}
];
var indexApp = angular.module('index', []).
	controller('indexCtrl', function($scope){
		$scope.dialogIsShown = false;
		$scope.showDialog = function() {
			$scope.dialogIsShown = true;
		};
		$scope.hideDialog = function() {
			$scope.dialogIsShown = false;
		};
		$scope.courses = courses;
	});


var systemApp = angular.module('system', ['ngRoute']).
	controller('systemCtrl', ['$scope','$route','$routeParams','$location',function($scope, $route, $routeParams, $location){
		$scope.$route = $route;
		$scope.$location = $location;
     	$scope.$routeParams = $routeParams;
     	$scope.hubs = hubs;
		$scope.courses = courses;
		$scope.listIsShown = false;
		$scope.changeNowCourse = function(e) {
			var e = e || window.event,
				targ = e.target || e.srcElement;
			$scope.nowCourse = targ.innerHTML;
			$scope.listIsShown = false;
		};
		$scope.showCourseList = function() {
			$scope.listIsShown = true;
		};
	}]).
	config(function($routeProvider) {
	  	$routeProvider.
	  	when('/group-hub', {
		    templateUrl: 'partials/group-hub.html',
		    controller: 'grouprHubCtrl'
	  	}).
	  	when('/paper-hub', {
		    templateUrl: 'partials/paper-hub.html',
		    controller: 'paperHubCtrl'
	  	}).
	  	when('/user-hub/:name',{
	  		templateUrl:'partials/user-hub.html',
	  		controller: 'userRecordCtrl'
	  	}).
	  	otherwise({redirectTo:'/user-hub/saved'});
	}).
	controller('userRecordCtrl', ['$scope','$routeParams', function($scope, $routeParams){
		var name = $routeParams.name, detail;
		var set = [
			{name:'saved', data:''},
			{name:'downloaded', data:''},
			{name:'question', data:''},
			{name:'paper', data:''}
		];
		set.forEach(function(item,i,context){
			if(item.name == name){
				detail = item;
				return;
			}
		});
		$scope.detail = detail;
		$scope.hubContent = 'partials/user-hub-record.html';
		if(name == 'question'||name == 'paper'){
			$scope.hubContent = 'partials/user-hub-collection.html';
		}
	}]);
