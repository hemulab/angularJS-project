var courses = [
	{course:'语文', icon:'i1', id:'Chinese'},
	{course:'数学', icon:'i2', id:'Math'},
	{course:'英语', icon:'i3', id:'English'},
	{course:'物理', icon:'i4', id:'Physics'},
	{course:'化学', icon:'i5', id:'Chemistry'},
	{course:'生物', icon:'i6', id:'biology'},
	{course:'政治', icon:'i7', id:'politics'},
	{course:'历史', icon:'i8', id:'history'},
	{course:'地理', icon:'i9', id:'geography'}
];
var hubs = [
	{name:'组卷中心', id:'group'},
	{name:'试卷中心', id:'paper'},
	{name:'个人中心', id:'user'}
];
var groupSortSet = [
	{title:'年级',choices:[
		'全部','高一','高二','高三'
	]},
	{title:'类型',choices:[
		'全部','同步练习','综合测试','高考模拟','高考真题','竞赛选拔'
	]},
	{title:'题型',choices:[
		'全部','选择题','填空题','解答题'
	]},
	{title:'难度',choices:[
		'全部','容易','较易','一般','较难','困难'
	]},
	{title:'地区',choices:[
		'全部','北京'
	]},
	{title:'年份',choices:[
		'全部','2013'
	]}
];
var indexApp = angular.module('index', []).
	controller('indexCtrl', ['$scope', function($scope){
		$scope.dialogShown = false;
		$scope.dialogDisplay=function() {
			$scope.dialogShown = !$scope.dialogShown
		};
		$scope.dialog = {
			className:'chooseCourse',
			title:'首次登录请选择题库',
			url:'partials/dialog-content-index.html'
		};
		$scope.views = {
			courses: courses
		};
	}]);

var paperViewApp = angular.module('paperView', []).
	controller('paperViewCtrl', ['$scope', function($scope){
		$scope.winClose = function() {
		    window.opener=null;
		    window.close();
		    //Scripts may close only the windows that were opened by it.
		};
	}]);

var systemApp = angular.module('system', ['ngRoute']).
	controller('systemCtrl', ['$scope', '$location',function($scope, $location){
		$scope.views = {
			title: '',
			hubs: hubs,
			courses: courses,
			nowCourse: null,
			changeNowCourse: function(e) {
				var e = e || window.event,
					targ = e.target || e.srcElement;
				$scope.views.nowCourse = targ.innerHTML;
				$scope.views.listIsShown = false;
			},
			isActiveHub: function(e) {
				var path = $location.path();	
				if( path.indexOf(e.id) == 1 ) {
					if( path.indexOf('preview')>-1 ) return false;
					$scope.views.title = e.name;
					return true;
				}
				else if( e.id== 'group' && path.indexOf('preview')>-1 ) {
					$scope.views.title = '试卷预览';
					return true;
				}
				else return false;
			},
			sortBarPath: 'partials/user-hub-sortBar.html',
			groupSortSet: groupSortSet
		};
		$scope.views.nowCourse = $scope.views.nowCourse || function() {
			var url = window.location.href,
				grade = url.slice(url.lastIndexOf('/')+1, url.indexOf('-')), gradeCN='',
				course = url.slice(url.indexOf('-')+1), courseCN='';
			if(grade === 'junior') gradeCN='初中';
			else if(grade === 'senior') gradeCN='高中';
			courses.forEach(function(item, index) {
				if(course === item.id) return courseCN = item.course;
			});
			if(gradeCN.length && course.length){
				return gradeCN+courseCN;
			}
		}();//应使用localStorage
	}]).
	config(function($routeProvider) {
	  	$routeProvider.
	  	when('/group-hub', {redirectTo:'/group-hub/manual'}).
	  	when('/group-hub/:method', {
		    templateUrl: 'partials/group-hub.html',
		    controller: 'groupHubCtrl'
	  	}).
	  	when('/paper-hub', {
		    templateUrl: 'partials/paper-hub.html',
		    controller: 'paperHubCtrl'
	  	}).
	  	when('/user-hub/:name',{
	  		templateUrl:'partials/user-hub.html',
	  		controller: 'userHubCtrl'
	  	}).
	  	when('/paper-preview',{
	  		templateUrl:'partials/paper-preview.html',
	  		controller: 'paperPreviewCtrl'
	  	}).
	  	otherwise({redirectTo:'/user-hub/saved'});
	}).
	controller('userHubCtrl', ['$scope','$routeParams', function($scope, $routeParams){
		var name = $routeParams.name, detail;
		var set = [
			{name:'saved', data:''},
			{name:'downloaded', data:''},
			{name:'question', data:''},
			{name:'paper', data:''}
		];
		$scope.userHub = {
			saved: true,
			downloaded: false,
			question: false,
			paper: false
		};
		set.forEach(function(item,i,context){
			if(item.name == name){
				$scope.userHub[item.name] = true;
				detail = item;
			}else{
				$scope.userHub[item.name] = false;
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
		};
	}]).
	controller('groupHubCtrl', ['$scope','$routeParams', function($scope, $routeParams){
		var method = $routeParams.method, detail;
		if(method === 'auto'){
			$scope.hubContent = 'partials/group-hub-auto.html';
			$scope.autoActive = true;
		}else{
			$scope.hubContent = 'partials/group-hub-manual.html';
			$scope.autoActive = false;
		}
		var dataSet = [
			{
				title:'集合与常用逻辑用语',
				nodes:[
					{
						title:'集合的概念',
						list:[
							{
								title:'命题及关系',
								link:'#'
							},
							{
								title:'充分条件与必要条件',
								link:'#'
							},
							{
								title:'简单的逻辑连接词',
								link:'#'
							}
						]
					}
				]
			}
		]
		$scope.tables = dataSet;
		$scope.resize = function() {
			var btn = document.getElementById('group-resize'),
				leftPart = document.getElementById('group-sideBar'),
				rightPart = document.getElementById('group-container'),
				line = document.getElementById('group-resize-line'),
				title = document.getElementById('group-sideBar-title'),
				minWidth = 180, maxWidth = 800;

			btn.onmousedown = function(ev) {
			    var oEvent = ev || event;
			    var disX = oEvent.clientX;

			    document.onmousemove = function(ev) {
			        var oEvent = ev || event;
			        var fixed = oEvent.clientX - 8;
			        leftPart.style.width = ( fixed>minWidth ? ( fixed<maxWidth ? fixed : maxWidth ) : minWidth)+ 'px';
			        rightPart.style.marginLeft = leftPart.style.width;
			        line.style.left = parseInt(leftPart.style.width) + 1 + 'px';
			    };

			    document.onmouseup = function() {
			        document.onmousemove = null;
			        document.onmouseup = null;
			    };
			    return false;
			};
		};
		$scope.choosePoint = function(e) {
			var e = e || window.event,
				targ = e.target || e.srcElement;
			var choosedElme = document.getElementsByClassName('choosed')[0];
			if(choosedElme) choosedElme.className = choosedElme.className.replace(' choosed','');
			if(angular.lowercase(targ.tagName) === 'span'){
				targ.parentNode.className += ' choosed';
				$scope.nowPointTitle = targ.innerHTML;
			}
		};
		$scope.points =[];
		$scope.addToPoints = function(i) {
			if(!i.nodes && !i.list){
				if($scope.points.indexOf(i)== -1) $scope.points.push(i);
			}
			else if(!i.nodes && i.list){
				for (var j = 0, len = i.list.length; j < len; j++) {
					if($scope.points.indexOf(i.list[j])== -1) $scope.points.push(i.list[j]);
				};
			}
			else  if(i.nodes){
				for (var j = 0, len1 = i.nodes.length; j < len1; j++) {
					for (var k = 0, len2 = i.nodes[j].list.length; k < len2; k++) {
						if($scope.points.indexOf(i.nodes[j].list[k])== -1) $scope.points.push(i.nodes[j].list[k]);
					};
				};
			}
		};
		$scope.deletePoint = function(index) {
			$scope.points.splice(index, 1);
		};
		$scope.choice = [
			{num:'0', previousNum:'0',grade:'easy'},
			{num:'0', previousNum:'0',grade:'littleEasy'},
			{num:'0', previousNum:'0',grade:'middle'},
			{num:'0', previousNum:'0',grade:'littleHard'},
			{num:'0', previousNum:'0',grade:'hard'}
		];
		$scope.saveNum = function(index) {
			$scope.points[index].choice.sum=0;
			$scope.points[index].choice.forEach(function(i) {
				i.previousNum = i.num;
				$scope.points[index].choice.sum+=parseInt(i.previousNum);
			});
		};
	}]).
	controller('paperHubCtrl', ['$scope','$routeParams', function($scope, $routeParams){
		
	}]).
	controller('paperPreviewCtrl', ['$scope', function($scope){
		$scope.dialogShown = false;
		$scope.dialogDisplay=function() {
			$scope.dialogShown = !$scope.dialogShown;
		};
		$scope.savePaper = function() {
			$scope.dialog = {
				className:'savePaper',
				title:'保存试卷',
				url:'partials/dialog-content.html'
			}
		};
		$scope.downloadPaper = function() {
			$scope.dialogDisplay();
			$scope.dialog = {
				className:'downloadPaper',
				title:'下载Word试卷',
				url:'partials/dialog-content-downloadPaper.html'
			}
		};
		$scope.downloadAnswerCard = function() {
			$scope.dialogDisplay();
			$scope.dialog = {
				className:'downloadAnswerCard',
				title:'下载答题卡',
				url:'partials/dialog-content-downloadAnswerCard.html'
			}
		};
		$scope.paperAnalysis = function() {
			$scope.dialogDisplay();
			$scope.dialog = {
				className:'paperAnalysis',
				title:'试卷分析',
				url:'partials/dialog-content-paperAnalysis.html'
			}
		};
		$scope.replaceQuestion = function() {
			$scope.dialogDisplay();
			$scope.dialog = {
				className:'replaceQuestion',
				title:'试题替换——准备替换当前第'+'题【ID:】',
				url:'partials/dialog-content-replaceQuestion.html'
			}
		};
		$scope.paperSetting = function() {
			$scope.dialogDisplay();
			$scope.dialog = {
				className:'paperSetting',
				title:'试卷设置',
				url:'partials/dialog-content-paperSetting.html'
			}
		};
	}]);