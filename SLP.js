// Dom Load
$(document).ready(()=>{makeSLP();})


const makeSLP = () => {
    
	$("a").hover(function(e) {
	console.log('mouse hover');
	//1. 마우스 오버 하면 일단 API 조회
	var searchText = $( this ).text();
	
	console.log('searchText : ',searchText);
		
	var arrText = searchText.trim().split('\n');
	//var ApiURL ="http://maestroai.shop/v1/api/btv/suers/";
    //var ApiURL ="https://dev-maestro.ifactshub.com/v1/api/btv/suers/";
	var ApiURL ="http://localhost:8080/v1/api/btv/suers/"; // 로컬 테스트
	
	//var ApiURL="https://cors-anywhere.herokuapp.com/http://maestroai.shop/v1/api/btv/suers/";
	//var ApiURL="https://cors.bridged.cc/http://maestroai.shop/v1/api/btv/suers/";
	
	

	
	//var ApiURL ="/v1/api/btv/suers/";
	var paramText = arrText[0];
	var paramURL = ApiURL.concat(paramText);
	console.log('paramURL : ',paramURL);
	var Result;
	$.ajax({	  		
			url: paramURL,
	 		//dataType: "jsonp",
			contentType: 'application/x-www-form-urlencoded; charset=utf-8',
			//async:false,
	 		//jsonpCallback: "myCallback",	  		
	 		//data: { keyword : arrText[0] , obj_type : '', relic_yn : '', callback_name : 'myCallback' },
	 		data: { keyword : arrText[0] , obj_type : '', relic_yn : '' },
	 		cache: false,
	 		beforeSend: function(xhr){
	 			xhr.setRequestHeader("Access-Control-Request-Method","GET");
	 			xhr.setRequestHeader("Access-Control-Request-Headers","content-type");
	 		},
	 		success: function(data)
	 		{
	 			//var parseData = parseJSON(data);
				
				var parseData = JSON.parse(data);
	 			
	 			console.log('data : ', parseData);
	 			var element = $( this );
	 			if(typeof parseData.movie == "undefined" || parseData.movie == null || parseData.movie == ""){
	 				console.log('영상 정보 없음 : ', parseData.movie);
	 			      	 $( document ).tooltip({
	 			      		hide: false,
	 			      		items: "li",
							content: function() {
	 			      			return "<video src='http://sldict.korean.go.kr/multimedia/multimedia_files/convert/20191016/628347/MOV000255289_700X466.mp4' controls muted autoplay loop width='300' height='300'></video>";   	        	    	 	
						 	}
	 	        		});
	 			      	
	 			}else{
	 				console.log('영상 정보 있음 : ', parseData.movie);
	 				$( document ).tooltip({
	 				  	hide: false,
		        	    items: "li",
		        	    content: function() {
		        	    	return "<video src='" +parseData.movie +"' controls muted autoplay loop width='300' height='300'></video>";  	        	    	
						}
		        	});
	 			}
	 		},
			error: function(request, status, error){
			console.log("code:"+request.status+" / "+"message:"+request.responseText+" / "+"error:"+error);
	      }
	});	
});
}