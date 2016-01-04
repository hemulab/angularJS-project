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
		$scope.nowCourse = '高中语文';
		$scope.sortBarPath = 'partials/user-hub-sortBar.html';
		$scope.changeNowCourse = function(e) {
			var e = e || window.event,
				targ = e.target || e.srcElement;
			$scope.nowCourse = targ.innerHTML;
			$scope.listIsShown = false;
		};
		$scope.toggleCourseList = function() {
			$scope.listIsShown = !$scope.listIsShown;
		};
	}]).
	config(function($routeProvider) {
	  	$routeProvider.
	  	when('/group-hub', {redirectTo:'/group-hub/manual'}).
	  	when('/group-hub/:method', {
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
		cleanActive();
		makeHubActiveAndChangeTitle($scope,'user');
		var name = $routeParams.name, detail;
		makeUserSideActive(name);
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
		switch(name){
			case 'downloaded':
			$scope.hubContent = 'partials/user-hub-downloadedRecord.html';
			break;
			case 'question':
			$scope.hubContent = 'partials/user-hub-questionCollection.html';
			break;
			case 'paper':
			$scope.hubContent = 'partials/user-hub-paperCollection.html';
			break;
			default:
			$scope.hubContent = 'partials/user-hub-savedRecord.html';
		}
	}]).
	controller('grouprHubCtrl', ['$scope','$routeParams', function($scope, $routeParams){
		cleanActive();
		makeHubActiveAndChangeTitle($scope,'group');
		var method = $routeParams.method, detail;
		makeGroupChooseActive(method);
	}])
	;

function cleanActive(){
	var actived = document.getElementsByClassName('active');
	for(var i = actived.length; i--;){
		actived[i].className = actived[i].className.replace(' active', '');
	}
}
function makeHubActiveAndChangeTitle ($s, hubId) {
	var hub = document.getElementsByClassName(hubId)[0];
	hub.className += ' active';
	document.title = hub.innerHTML + ' | 万方在线组卷系统';
}
function makeUserSideActive(name){
	var activedElem = document.getElementsByClassName('user-sideBar')[0].getElementsByClassName(name)[0],
		activedElemParent = activedElem.parentNode;
	activedElem.className += ' active';
	activedElemParent.className += ' active';
}
function makeGroupChooseActive (method) {
	var activedElem = document.getElementsByClassName(method)[0];
	activedElem.className += ' active';
}