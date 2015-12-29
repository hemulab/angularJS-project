window.onload = function() {
	(function(userAgent){   
	    this.browser = {   
	        version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],   
	        safari: /webkit/.test( userAgent ),   
	        opera: /opera/.test( userAgent ),   
	        msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),   
	        mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent )   
	    };   
	})(navigator.userAgent.toLowerCase()); 
	if(browser.msie&&browser.version<9){
		document.write("请使用IE9及以上版本浏览器或其它现代浏览器打开本系统。")
    } 
};