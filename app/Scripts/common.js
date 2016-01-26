var courses = [
	{course:'语文', icon:'i1', id:'Chinese'},
	{course:'数学', icon:'i2', id:'Math'},
	{course:'英语', icon:'i3', id:'English'},
	{course:'物理', icon:'i4', id:'Physics'},
	{course:'化学', icon:'i5', id:'Chemistry'},
	{course:'生物', icon:'i6', id:'Biology'},
	{course:'政治', icon:'i7', id:'Politics'},
	{course:'历史', icon:'i8', id:'History'},
	{course:'地理', icon:'i9', id:'Geography'}
];
var groupSortSet = [
	{title:'年级', name: 'grade', choices:[
		'全部','高一','高二','高三'
	]},
	{title:'类型', name: 'type',choices:[
		'全部','同步练习','综合测试','高考模拟','高考真题','竞赛选拔'
	]},
	{title:'题型', name: 'questionTypeCN',choices:[
		'全部','选择题','填空题','解答题'
	]},
	{title:'难度', name: 'degreeCN',choices:[
		'全部','容易','较易','一般','较难','困难'
	]},
	{title:'地区', name: 'province',choices:[
		'全部','北京'
	]},
	{title:'年份', name: 'year',choices:[
		'全部','2013'
	]}
];
var paperSortSet = [
	{title:'年级', name: 'grade',choices:[
		'全部','高一','高二','高三'
	]},
	{title:'类型', name: 'type',choices:[
		'全部','同步练习','综合测试','高考模拟','高考真题','竞赛选拔'
	]},
	{title:'地区', name: 'province',choices:[
		'全部','北京'
	]},
	{title:'年份', name: 'year',choices:[
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

var systemApp = angular.module('system', ['ngRoute']).
	controller('systemCtrl', ['$scope', '$location', '$http', '$filter', function($scope, $location, $http, $filter){
		$scope.Math = window.Math;
		$scope.views = {
			title: '',
			hubs: [
				{name:'组卷中心', id:'group'},
				{name:'试卷中心', id:'paper'},
				{name:'个人中心', id:'user'}
			],
			courses: courses,
			nowCourse: null,
			/**
			 * 改变nowCourse的内容后，重设url
			 * @param  {event} e event事件
			 * @return {undefined}   页面刷新，无返回值
			 */
			changeNowCourse: function(e) {
				var e = e || window.event,
					targ = e.target || e.srcElement;
				var targString = targ.innerHTML,
					url = window.location.href,
					grade = url.indexOf('junior')>-1?'junior':url.indexOf('senior')?'senior':'undefined',
					course = url.slice(url.indexOf(grade)+grade.length+1, url.indexOf('#')),
					grade_new, course_new;
				
				if(targString.indexOf('初中')>-1) grade_new = 'junior';
				else if(targString.indexOf('高中')>-1) grade_new = 'senior';
				courses.forEach(function(item, index) {
					if(targString.indexOf(item.course)>-1) return course_new = item.id;
				});
				url = url.replace(grade, grade_new);
				window.location.href = url.replace(course, course_new);
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
			inBacket:{
				icon:'addBacket',
				text:'移入试题篮'
			},
			outBacket:{
				icon:'decBacket',
				text:'移出试题篮'
			},
			toggleToBacket:function(item) {
				if(item.toBacket == $scope.views.inBacket){
					item.toBacket = $scope.views.outBacket;
					$scope.backet.question[item.questionType].push(item.id);
					updateBacketAll();
				}
				else{
					item.toBacket = $scope.views.inBacket;
					$scope.backet.question[item.questionType].splice($scope.backet.question[item.questionType].indexOf(item.id), 1);
					updateBacketAll();
				};
			},
			inCollection:{
				icon:'addCollection',
				text:'收藏'
			},
			outCollection:{
				icon:'decCollection',
				text:'取消收藏'
			},
			toggleToCollection:function(item) {
				if(item.toCollection == $scope.views.inCollection){
					item.toCollection = $scope.views.outCollection;
				}
				else{
					item.toCollection = $scope.views.inCollection;
				};
			}
		};
		/**
		 * 根据url设置nowCourse的值(汉字)
		 * @return {string} nowCourse的值
		 */
		$scope.views.nowCourse = function() {
			var url = window.location.href,
				grade = url.indexOf('junior')>-1?'junior':url.indexOf('senior')?'senior':'undefined', gradeCN='',
				course = url.slice(url.indexOf(grade)+grade.length+1, url.indexOf('#')), courseCN='',courseInfo;
			if(grade === 'junior') gradeCN='初中';
			else if(grade === 'senior') gradeCN='高中';
			courses.forEach(function(item, index) {
				if(course === item.id) return courseInfo={courseIcon: item.icon,courseCN: item.course};
			});
			if(gradeCN.length && course.length){
				return {
					grade: grade,
					course: course,
					courseName: gradeCN+courseInfo.courseCN,
					courseIcon: courseInfo.courseIcon
				};
			}
		}();
		$scope.views.jsonUrlRoot = 'JSON/'+$scope.views.nowCourse.grade+'/'+$scope.views.nowCourse.course+'/';

		//pagination
		$scope.pagination = {
			filteredItems:[],
			itemsPerPage: 10,
			pagedItems: [],
			currentPage: 0,
			items: []
		}
		// init the filtered items
	    $scope.pagination.search = function () {
	        $scope.pagination.filteredItems = $filter('filter')($scope.pagination.items, $scope.views.search);
	        $scope.pagination.filteredItems = $filter('filter')($scope.pagination.filteredItems, $scope.multiSort.sortRule);
	        $scope.pagination.filteredItems = $filter('filter')($scope.pagination.filteredItems, $scope.views.limitTime);
	        $scope.pagination.currentPage = 0;
	        // now group by pages
	        $scope.pagination.groupToPages();
	    };
	    
	    // calculate page in place
	    $scope.pagination.groupToPages = function () {
	        $scope.pagination.pagedItems = [];
	        for (var i = 0; i < $scope.pagination.filteredItems.length; i++) {
	            if (i % $scope.pagination.itemsPerPage === 0) {
	                $scope.pagination.pagedItems[Math.floor(i / $scope.pagination.itemsPerPage)] = [ $scope.pagination.filteredItems[i] ];
	            } else {
	                $scope.pagination.pagedItems[Math.floor(i / $scope.pagination.itemsPerPage)].push($scope.pagination.filteredItems[i]);
	            }
	        }
	    };
	    
	    $scope.pagination.range = function (start, end) {
	        var ret = [];
	        if (!end) {
	            end = start;
	            start = 0;
	        }
	        for (var i = start; i < end; i++) {
	            ret.push(i);
	        }
	        return ret;
	    };
	    
	    $scope.pagination.prevPage = function () {
	        if ($scope.pagination.currentPage > 0) {
	            $scope.pagination.currentPage--;
	        }
	    };
	    
	    $scope.pagination.nextPage = function () {
	        if ($scope.pagination.currentPage < $scope.pagination.pagedItems.length - 1) {
	            $scope.pagination.currentPage++;
	        }
	    };
	    
	    $scope.pagination.setPage = function (n) {
	        $scope.pagination.currentPage = n;
	    };

	    // functions have been describe process the data for display
	    // $scope.pagination.search();

		$scope.backet = {
			question:{
				choice:[123,124,125],
				completion:[123,124,125],
				solution:[123,124,125]
			},
			cleanBacket: function(str) {
				var cleanId = [];
				if(str === 'all') {
					cleanId = this[str];
					this.question={choice:[],completion:[],solution:[]}
				}
				else{
					cleanId = this.question[str];
					this.question[str] = []
				}
				$scope.pagination.pagedItems.forEach(function(item, index) {
					item.forEach(function(subItem, subIndex) {
						if(cleanId.indexOf(subItem.id)>-1) subItem.toBacket = $scope.views.inBacket;
					})
				})
				updateBacketAll();
			}
		};
		function updateBacketAll(){
			$scope.backet.all = $scope.backet.question.choice.concat($scope.backet.question.completion).concat($scope.backet.question.solution);
		};
		updateBacketAll();

		$scope.multiSort = {
			sortSet:[],
			sortBy:{},
			sortByList:[],
			deleteSortItem: function(i) {
				for(obj in this.sortBy){
					if(this.sortBy.hasOwnProperty(obj)){
						var index = this.sortBy[obj].indexOf(i);
						if(index>-1) this.sortBy[obj].splice(index, 1);
					}
				}
				updateSortByList();
				$scope.pagination.search();
			},
			emptyChoose: function(item, first) {
				if(first) {
					if(this.sortBy[item.name].length===0) return true;
				}
				else return false;
			}
		}
		$scope.multiSort.sortRule = function(e) {
			if(e!==undefined){
				for(obj in $scope.multiSort.sortBy){
					if($scope.multiSort.sortBy.hasOwnProperty(obj)){
						if($scope.multiSort.sortBy[obj].length){
							if($scope.multiSort.sortBy[obj].indexOf(e[obj])===-1) return false;
						}
					}
				}
			}
			return true;
		};

		function updateSortByList () {
			$scope.multiSort.sortByList=[];
			for(obj in $scope.multiSort.sortBy){
				if($scope.multiSort.sortBy.hasOwnProperty(obj)){
					$scope.multiSort.sortByList=$scope.multiSort.sortByList.concat($scope.multiSort.sortBy[obj])
				}
			}
		}

		$scope.sortItemActive= function($first, item, choice) {
			if($first){ 
				$scope.multiSort.sortBy[item.name]=[];
				updateSortByList();
				item.firstSortItemActive = function(first) {
					if(first) return true;
					else return false;
				}
			}else{
				if($scope.multiSort.sortBy[item.name].indexOf(choice) === -1) $scope.multiSort.sortBy[item.name].push(choice);
				updateSortByList();
				item.firstSortItemActive = function(first) {
					return false;
				}
			}
		};

		//需改进数据分类
		$scope.views.ajaxContentQuestion = function(question, destination, callback) {
			for( o1 in question){
				if(question.hasOwnProperty(o1)){
					for(o2 in question[o1]){
						if(question[o1].hasOwnProperty(o2)){
							if(o2 === 'questionType'){
								destination[o2] = question[o1][o2];
								switch(question[o1][o2]){
									case 'completion':destination['questionTypeCN'] = groupSortSet[2].choices[2];break;
									case 'solution':destination['questionTypeCN'] = groupSortSet[2].choices[3];break;
									default:destination['questionTypeCN'] = groupSortSet[2].choices[1];break;
								}
							}
							else if(o2 === 'degree'){
								destination['degree'] = question[o1][o2];
								destination['degreeCN'] = groupSortSet[3].choices[question[o1][o2]];
							}
							else{destination[o2] = question[o1][o2]}
						}
					}
				}
			}
		};

		$scope.collection = {
			paper:[1, 2],
			question:[123, 124, 125]
		}
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
	  	when('/paper-preview/:paperId',{
	  		templateUrl:'partials/paper-preview.html',
	  		controller: 'paperPreviewCtrl'
	  	}).
	  	when('/paper-hub/:paperId',{
	  		templateUrl:'partials/paper-view.html',
	  		controller: 'paperViewCtrl'
	  	}).
	  	otherwise({redirectTo:'/user-hub/saved'});
	}).
	controller('userHubCtrl', ['$scope','$routeParams','$http', function($scope, $routeParams, $http){
		var name = $routeParams.name;
		var set = [
			{name:'saved', data:''},
			{name:'downloaded', data:''},
			{name:'question', data:''},
			{name:'paper', data:''}
		];
		$scope.userView = {
			userHub: {
				saved: true,
				downloaded: false,
				question: false,
				paper: false
			},
			sort:[
				{
					id:'today',
					name:'今天'
				},
				{
					id:'yesterday',
					name:'昨天'
				},
				{
					id:'thisWeek',
					name:'本周'
				},
				{
					id:'thisMonth',
					name:'本月'
				},
				{
					id:'all',
					name:'全部'
				}
			]
		}
		set.forEach(function(item,i,context){
			if(item.name == name){
				$scope.userView.userHub[item.name] = true;
			}else{
				$scope.userView.userHub[item.name] = false;
			}
		});
		Date.prototype.toFormatDateString = function() {
			var month = parseInt(this.getMonth())+1, day = this.getDate();
			month = month>9 ? month : '0'+month;
			day = day>9 ? day: '0'+day;
			return this.getFullYear()+'-'+ month +'-'+ day;
		};
		var today = new Date(),
			todayDate = today.toFormatDateString(),
			yesterday = new Date(today.getTime() - 1000*60*60*24),
			yesterdayDate = yesterday.toFormatDateString(),
			thisWeek = [], thisWeekDay = [], thisMonth;
		for(var i=7, day;i--;){
			day = new Date(today.getTime() - 1000*60*60*24*i),
			thisWeek.push(day.toFormatDateString());
			thisWeekDay.push(day.getDay());
		}
		thisWeek = thisWeek.splice(thisWeekDay.indexOf(1));
		thisMonth = todayDate.split('-');
		thisMonth.pop();
		thisMonth = thisMonth.join('-');
		$scope.views.filterTime = {
			today: todayDate,
			yesterday: yesterdayDate,
			thisWeek: function(item) {
				return thisWeek.indexOf(item.date)>-1;
			},
			thisMonth: thisMonth,
			all: undefined
		};
		function getPaper (obj, data) {
			$scope.userView.hubContent = 'partials/user-hub-'+obj+'.html';
			data[obj].forEach(function(item, index) {
				if($scope.collection.paper.indexOf(item.id)>-1){item.toCollection = $scope.views.outCollection}
				else {item.toCollection = $scope.views.inCollection};
				$http.get($scope.views.jsonUrlRoot+'paper'+item.id+'.json').success(function(paper) {
					item.title = paper.paperInfo.title;
					if(index === data[obj].length-1){
						$scope.pagination.items = data[obj];
						$scope.pagination.search();
					}
				})
			})
		}
		function getQuestion (obj, data) {
			$scope.userView.hubContent = 'partials/user-hub-'+obj+'.html';
			data[obj].forEach(function(item, index) {
				if($scope.backet.all.indexOf(item.id)>-1) {item.toBacket = $scope.views.outBacket}
				else item.toBacket = $scope.views.inBacket;
				if($scope.collection.question.indexOf(item.id)>-1){item.toCollection = $scope.views.outCollection}
				else {item.toCollection = $scope.views.inCollection};
				$http.get($scope.views.jsonUrlRoot+'question'+item.id+'.json').success(function(question) {
					$scope.views.ajaxContentQuestion(question, item);
					$http.get($scope.views.jsonUrlRoot+'paper'+question.questionInfo.paperSourceId+'.json').success(function(paper) {
						item.source = paper.paperInfo.title;
						if(index === data[obj].length-1){
							$scope.pagination.items = data[obj];
							$scope.pagination.search();
						}
					})
				})
			});
		}
		$http.get($scope.views.jsonUrlRoot+'user.json').success(function(data) {
			switch(name){
				case 'downloaded':
				getPaper('downloadedPaperRecord', data);
				break;
				case 'question':
				$scope.pagination.itemsPerPage = 5;
				getQuestion('questionCollection', data);
				break;
				case 'paper':
				getPaper('paperCollection', data);
				break;
				default:
				getPaper('savedPaperRecord', data);
				
			};
		});
	}]).filter('to_trusted', ['$sce', function($sce) {
		return function(text) {
			return $sce.trustAsHtml(text);	//使angular解析HTML
		}
	}]).
	controller('groupHubCtrl', ['$scope','$routeParams', '$http', '$timeout', function($scope, $routeParams, $http, $timeout){
		$scope.multiSort.sortSet = groupSortSet;
		$scope.groupView = {};
		$scope.pagination.items = [];
		$scope.pagination.search();
		var method = $routeParams.method, detail;
		if(method === 'auto'){
			$scope.groupView.hubContent = 'partials/group-hub-auto.html';
			$scope.groupView.autoActive = true;
		}else{
			$scope.groupView.hubContent = 'partials/group-hub-manual.html';
			$scope.groupView.autoActive = false;
		}
		$http.get($scope.views.jsonUrlRoot+'tables.json').success(function(dataSet) {
			$scope.groupView.tables = dataSet.tables;
		});
		$scope.groupView.resize = function() {
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
		$scope.groupView.choosePoint = function(e) {
			var e = e || window.event,
				targ = e.target || e.srcElement;
			var choosedElme = document.getElementsByClassName('choosed')[0];
			if(choosedElme) choosedElme.className = choosedElme.className.replace(' choosed','');
			if(angular.lowercase(targ.tagName) === 'span'){
				targ.parentNode.className += ' choosed';
				$scope.groupView.nowPointTitle = targ.innerHTML;
			}
		};
		$scope.groupView.points =[];
		$scope.groupView.pointsSum = {};
		$scope.groupView.pointsSum.calculate = function(type) {
			var sum = 0;
			$scope.groupView.points.forEach(function(item, index) {
				sum += item[type].sum;
			})
			return sum;
		};
		$scope.groupView.calculateSum = function() {
			$scope.groupView.pointsSum.choice= $scope.groupView.pointsSum.calculate('choice');
			$scope.groupView.pointsSum.completion= $scope.groupView.pointsSum.calculate('completion');
			$scope.groupView.pointsSum.solution= $scope.groupView.pointsSum.calculate('solution');
			$scope.groupView.pointsSum.sum= function() {
				return this.choice+this.completion+this.solution
			};
		}
		
		$scope.groupView.getQuestionReplace = function(item) {
			arr=[];
			if(item.questionList.length){
				item.questionList.forEach(function(el, index) {
					arr[index] = {id: el};
					if($scope.backet.all.indexOf(el)>-1) arr[index].toBacket = $scope.views.outBacket;
					else arr[index].toBacket = $scope.views.inBacket;
					if($scope.collection.question.indexOf(el)>-1){arr[index].toCollection = $scope.views.outCollection}
					else {arr[index].toCollection = $scope.views.inCollection};
					$http.get($scope.views.jsonUrlRoot+'question'+el+'.json').success(function(question) {
						$scope.views.ajaxContentQuestion(question, arr[index]);
						$http.get($scope.views.jsonUrlRoot+'paper'+question.questionInfo.paperSourceId+'.json').success(function(paper) {
							arr[index].source = paper.paperInfo.title;
						})
					});
				})
			}
			$scope.pagination.items = arr;
			$scope.pagination.search();
		};
		$scope.groupView.getQuestionAdd = function(item, arr) {
			if(item.questionList.length){
				item.questionList.forEach(function(el, index) {
					var arrLen = arr.length;
					arr[arrLen] = {id: el};
					if($scope.backet.all.indexOf(el)>-1) arr[arrLen].toBacket = $scope.views.outBacket;
					else arr[arrLen].toBacket = $scope.views.inBacket;
					if($scope.collection.question.indexOf(el)>-1){arr[arrLen].toCollection = $scope.views.outCollection}
					else {arr[arrLen].toCollection = $scope.views.inCollection};
					$http.get($scope.views.jsonUrlRoot+'question'+el+'.json').success(function(question) {
						$scope.views.ajaxContentQuestion(question, arr[arrLen]);
						$http.get($scope.views.jsonUrlRoot+'paper'+question.questionInfo.paperSourceId+'.json').success(function(paper) {
							arr[arrLen].source = paper.paperInfo.title;
						})
					});
				})
			}
			$scope.pagination.items = arr;
			$scope.pagination.search();
		};
		$scope.groupView.addToPoints = function(i) {
			var arr=[];
			if(!i.nodes && !i.list){
				$scope.groupView.getQuestionReplace(i);
				
				if($scope.groupView.points.indexOf(i)== -1) $scope.groupView.points.push(i);
			}
			else if(!i.nodes && i.list){
				for (var j = 0, len = i.list.length; j < len; j++) {
					(function(j){
						$scope.groupView.getQuestionAdd(i.list[j], arr)
					})(j);

					if($scope.groupView.points.indexOf(i.list[j])== -1) $scope.groupView.points.push(i.list[j]);
				};
			}
			else  if(i.nodes){
				for (var j = 0, len1 = i.nodes.length; j < len1; j++) {
					for (var k = 0, len2 = i.nodes[j].list.length; k < len2; k++) {
						(function(k) {
							$scope.groupView.getQuestionAdd(i.nodes[j].list[k], arr);
						})(k);
						if($scope.groupView.points.indexOf(i.nodes[j].list[k])== -1) $scope.groupView.points.push(i.nodes[j].list[k]);
					};
				};
			}
		};
		$scope.groupView.pageAddToBacket = function() {
            $timeout(function() {
				var el = document.getElementsByClassName('addBacket');
				for (var i = el.length - 1; i >= 0; i--) {
					angular.element(el[i].parentNode).triggerHandler('click');
				};
            }, 0);
		};
		$scope.groupView.deletePoint = function(index) {
			$scope.groupView.points.splice(index, 1);
		};
		function initSet(){
			this.list = [
				{num:0, previousNum:0, grade:'easy'},
				{num:0, previousNum:0, grade:'littleEasy'},
				{num:0, previousNum:0, grade:'middle'},
				{num:0, previousNum:0, grade:'littleHard'},
				{num:0, previousNum:0, grade:'hard'}
			];
			this.sum = 0;
		};
		$scope.groupView.initSet = function(index) {
			$scope.groupView.points[index].choice = new initSet();
			$scope.groupView.points[index].completion = new initSet();
			$scope.groupView.points[index].solution = new initSet();
		};
		$scope.groupView.saveNum = function(index) {
			var type = ['choice', 'completion', 'solution'];
			type.forEach(function(item) {
				$scope.groupView.points[index][item].sum=0;
				$scope.groupView.points[index][item].list.forEach(function(i) {
					i.previousNum = i.num;
					$scope.groupView.points[index][item].sum+=parseInt(i.previousNum);
				});
			})
		};
	}]).
	controller('paperHubCtrl', ['$scope','$routeParams','$http', function($scope, $routeParams, $http){
		$scope.multiSort.sortSet = paperSortSet;
		$scope.paperView = {};
		$http.get($scope.views.jsonUrlRoot+'paperAll.json').success(function(paper) {
			paper.allPaper.forEach(function(item) {
				if($scope.collection.question.indexOf(item.id)>-1){item.toCollection = $scope.views.outCollection}
				else {item.toCollection = $scope.views.inCollection};
			})
			$scope.paperView.allPaper = paper.allPaper;
			$scope.pagination.items = $scope.paperView.allPaper;
			console.log(paper.allPaper)
			$scope.pagination.search();
		})
	}]).
	controller('paperPreviewCtrl', ['$scope', '$routeParams', '$http', '$timeout', function($scope, $routeParams, $http, $timeout){
		$scope.dialogShown = false;
		$scope.dialogDisplay=function(str) {
			$scope.shownPart = str;
			$scope.dialogShown = !$scope.dialogShown;
		};
		$scope.shownPart = '';
		$scope.previewSideBar = {
			items:{
				title:[
					{
						name:"主标题",
						id:"mainTitle",
						content:"xxx-xxxx学年度xx学校xx月考卷",
						shown:true,
						writable:true
					},
					{
						name:"副标题",
						id:"subTitle",
						content:"试卷副标题",
						shown:true,
						writable:true
					},
					{
						name:"装订线",
						id:"line",
						content:"",
						shown:true,
						writable: false
					},
					{
						name:"保密标记",
						id:"secret",
						content:"绝密★启用前",
						shown:true,
						writable:true
					},
					{
						name:"试卷信息栏",
						id:"paperInfo",
						content:"考试范围：xxx；考试时间：100分钟；命题人：xxx",
						shown:true,
						writable:true
					},
					{
						name:"考生输入栏",
						id:"stuInput",
						content:"",
						shown:true,
						writable: false
					},
					{
						name:"誊分栏",
						id:"points",
						content:"",
						shown:true,
						writable: false
					},
					{
						name:"注意事项栏",
						id:"attention",
						content:"1. 答题前填好自己的姓名、班级、考号等信息；2. 请将答案正确填写在答题卡上。",
						shown:true,
						writable:true
					}
				],
				body:[
					{
						title:"第Ｉ卷 (选择题)",
						item:[
							{
								title:"一、单选题",
								content:[
									{
										title:"2012-2013",
										id:"123"
									},
									{
										title:"2012-2013",
										id:"124"
									},
									{
										title:"2012-2013",
										id:"125"
									}
								]
							}
						]
					},
					{
						title:"第ＩＩ卷 (非选择题)",
						item:[
							{
								title:"二、填空题",
								content:[
									{
										title:"2012-2013",
										id:"125"
									}
								]
							},
							{
								title:"三、解答题",
								content:[
									{
										title:"2012-2013",
										id:"125"
									}
								]
							}
						]
					}
				]
			},
			showItems: function(id) {
				var thisItem;
				$scope.previewSideBar.items.title.forEach(function(item, index) {
					if(item.id===id){ return thisItem = item }
				});
				return thisItem;
			}
		}
		
		$scope.paperPreviewDialog = [
			{
				className:'savePaper',
				title:'保存试卷',
				url:''
			},
			{
				className:'downloadPaper',
				title:'下载Word试卷',
				url:'partials/dialog-content-downloadPaper.html'
			},
			{
				className:'downloadAnswerCard',
				title:'下载答题卡',
				url:'partials/dialog-content-downloadAnswerCard.html'
			},
			{
				className:'paperAnalysis',
				title:'试卷分析',
				url:'partials/dialog-content-paperAnalysis.html'
			},
			{
				className:'replaceQuestion',
				title:'试题替换——准备替换当前第'+'题【ID:】',
				url:'partials/dialog-content-replaceQuestion.html'
			},
			{
				className:'paperSetting',
				title:'试卷设置',
				url:'partials/dialog-content-paperSetting.html'
			}
		];
		$scope.paperPreview = {
			question:{
				choice:[],
				completion:[],
				solution:[]
			},
			title:[
				{
					name:'choice',
					content:'选择题',
					rank:0
				},
				{
					name:'completion',
					content:'填空题',
					rank:1
				},
				{
					name:'solution',
					content:'解答题',
					rank:2
				}
			],
			moveUp: function(item, part) {
				if(item.rank != 0){
					var t = item.rank, prevItem, parentObj;
					if(item.hasOwnProperty('choices')){
						parentObj = $scope.paperPreview.question[part.name];
					}else{
						parentObj = $scope.paperPreview.title;
					}
					parentObj.forEach(function(i) {
						if(i.rank === item.rank-1) {
							return prevItem = i;
						}
					})
					
					item.rank -= 1;
					prevItem.rank += 1;
				}
			},
			moveDown: function(item, part) {
				if(item.rank != $scope.paperPreview.question[part.name].length-1){
					var t = item.rank, prevItem, parentObj;
					if(item.hasOwnProperty('choices')){
						parentObj = $scope.paperPreview.question[part.name];
					}else{
						parentObj = $scope.paperPreview.title;
					}
					parentObj.forEach(function(i) {
						if(i.rank === item.rank+1) {
							return prevItem = i;
						}
					})
					item.rank += 1;
					prevItem.rank -= 1;
				}
			},
			order: function() {
				var questionList = document.getElementsByClassName('paperContent-item-question');
				
				for (var i = questionList.length - 1; i >= 0; i--) {
					var orderedItem = questionList[i].getElementsByClassName('paperContent-item-order');
					if(orderedItem.length){
						questionList[i].removeChild(orderedItem[0]);
					}
					var div = document.createElement('div');
					div.className = 'paperContent-item-order';
					div.innerHTML = i+1+'.';
					questionList[i].insertBefore(div, questionList[i].childNodes[0]);
				};
			},
			titleOrder: function() {
				var typeList = document.getElementsByClassName('paperContent-questionType-title');
				var listNum = ['一','二','三','四','五','六','七','八','九','十'];
				for (var i = typeList.length - 1; i >= 0; i--) {
					var orderedItem = typeList[i].getElementsByClassName('paperContent-questionType-order');
					if(orderedItem.length){
						typeList[i].removeChild(orderedItem[0]);
					}
					var div = document.createElement('span');
					div.className = 'paperContent-questionType-order';
					div.innerHTML = listNum[i]+'、';
					typeList[i].insertBefore(div, typeList[i].childNodes[0]);
				};
			},
			init: function() {
				$timeout(function() {
					angular.element(document.getElementsByClassName('paperContent-container-operation')[0]).triggerHandler('click');
				},0)
			}
		}
		$scope.paperPreview.init();
		$scope.paperPreview.refreshContent = function() {
			$scope.paperPreview.question={
				choice:[],
				completion:[],
				solution:[]
			};
			for(obj in $scope.backet.question){
				if($scope.backet.question.hasOwnProperty(obj)){
					(function(obj) {
						$scope.backet.question[obj].forEach(function(item, index) {
							$http.get($scope.views.jsonUrlRoot+'question'+item+'.json').
								  success(function(question) {
								  	var newObj = {};
								  	newObj.title = question.questionContent.question;
								  	newObj.choices= question.questionContent.choices;
								  	newObj.rank = index;
								  	$scope.paperPreview.question[obj].push(newObj);
								  })
						})
					})(obj)
				}
			}
		};
		$scope.paperPreview.refreshContent();
	}]).controller('paperViewCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http){
		$scope.paperView={
			choice:[],
			completion:[],
			solution:[],
			all: function() {
				return this.choice.concat(this.completion).concat(this.solution);
			}
		};
		$http.get($scope.views.jsonUrlRoot+'paper'+$routeParams.paperId+'.json').
			  success(function(paper) {
			  	$scope.paperView.paperInfo = paper.paperInfo;
			  	paper.paperContent.forEach(function(item) {
			  		$http.get($scope.views.jsonUrlRoot+'question'+item.questionId+'.json').success(function(question) {
			  			var newObj = {};
			  			$scope.views.ajaxContentQuestion(question, newObj);
			  			newObj.questionType = question.questionInfo.questionType;
						if($scope.backet.all.indexOf(newObj.id)>-1) {newObj.toBacket = $scope.views.outBacket}
						else newObj.toBacket = $scope.views.inBacket;
						if($scope.collection.question.indexOf(newObj.id)>-1){newObj.toCollection = $scope.views.outCollection}
						else {newObj.toCollection = $scope.views.inCollection};
			  			$scope.paperView[question.questionInfo.questionType].push(newObj);
			  		});
			  	});
			  })
	}]);