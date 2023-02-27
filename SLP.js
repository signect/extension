class Signforus{
	
	/* 변수와 상수 (Variables & Constants)
    -------------------------------------------------------------------------
     */
	apiURL;	/* 접속 API URL */
	objectScript; /* UI 컴포넌트 경로 */
	
	mLeft;	/*왼쪽 좌표*/
	mTop;	/*상단 좌표*/
	
	suerActive;	/*수어 Active 상태*/
	playVideo;	/*비디오 Play 여부*/
	textEvent;	/*Text 이벤트*/
	
	/* Singleton 메소드 class/instance
    -------------------------------------------------------------------------
     */
	
	/* Singleton class 객체 가져가기*/
	static getClass(isServer){
		Signforus.getInstance(isServer);
		return this;
	}
	/* Singleton instance 가져가기*/
	static getInstance(isServer){
		Signforus.instance = Signforus.instance == undefined? new Signforus(isServer): Signforus.instance;
		return Signforus.instance;
	}
	
	/* Event 메소드
    -------------------------------------------------------------------------
     */
	/* Key Down 이벤트*/
	static evtControlKeyDown(){
		Signforus.controlKey = true;
	}
	/* Key Up 이벤트*/
	static evtControlKeyUp(){
		Signforus.controlKey = false;
	}
	/* Mouse Up 이벤트  */
	static evtMouseUp(evt){
		Signforus.getInstance().setEnabled();
		var selectTxt = window.getSelection();
       	var range = selectTxt.getRangeAt(0);
		var {startOffset, endOffset} = range;
		if(startOffset === endOffset || selectTxt.baseNode.data == undefined){
			Signforus.getInstance().setDisabled();
			return;
		}
		var searchText = selectTxt.baseNode.data.substring(startOffset, endOffset);
		var arrText = searchText.trim().split('\n');
		Signforus.execute(evt, arrText[0]);
	}
	
	/* 외부 오픈 메소드
    -------------------------------------------------------------------------
     */
	/* 수어 서비스 가능여부 */
	static isEnabled(){
		return (Signforus.controlKey==true) && !(this.textEvent==undefined?false:this.textEvent);
	}
	/* 수어 서비스 실행 */
	static execute(evt, text){
		var me = Signforus.getInstance();
		if(!me.posibleSignforus()){
			me.setDisabled();
			return;
		}
		me.eventSetting(evt);	//	마우스 이벤트 위치
		me.ajaxCallforText(text);		//	ajax 호출
	}
	
	static stop(){
		var me = Signforus.getInstance();
		me.videoPlayEnded();
	}
	
	/* class 내부용 메소드
    -------------------------------------------------------------------------
     */ 
	
	/* 생성자 */
	constructor(isServer){
		
		if("oper" == isServer){
			this.apiURL = "http://signforus.co.kr/v1/api/btv/suers/"; // 운영 테스트
			this.objectScript = "http://signforus.co.kr/tmpl/assets/js/signforus_object.js";
		}else{
			this.apiURL = "http://localhost:8080/v1/api/btv/suers/"; // 개발 테스트
			this.objectScript = "http://localhost:8080/tmpl/assets/js/signforus_object.js";
		}
		
		$.getScript(this.objectScript, function(response, status){
			//alert("loaded component!");
			
			var tgbtn = document.getElementById('tg_suer');	//	inner button tooltip

			/*버튼 tooltip On */
			const t_turnOn = ((evt) => {
				var ttBox = document.getElementById('signforus_tooltip');
			    const boundBox = evt.target.getBoundingClientRect();
			    const coordX = boundBox.left;
			    const coordY = boundBox.top;
			    ttBox.style.left = (coordX).toString() + "px";
			    ttBox.style.top = (coordY + 60).toString() + "px";
			    
			    if(Signforus.getInstance().isActiveSignforus()){ 
					ttBox.innerHTML ="Sign On";
				}else{ 
					ttBox.innerHTML ="Sign Off";
				}
			    ttBox.style.visibility = "visible";
			});
			/*버튼 tooltip Off */
			const t_turnOff = (() => {
				var ttBox = document.getElementById('signforus_tooltip');
				ttBox.style.visibility = "hidden";
			});

			tgbtn.addEventListener("mouseover", t_turnOn, false);
			tgbtn.addEventListener("mouseout", t_turnOff, false);
			/*button tooltip end */
			
			
			/* 수어 버튼 클릭*/
			tgbtn.addEventListener("click", function(){
				var me = Signforus.getInstance();
				var actvice = me.isActiveSignforus();
				if(!actvice){ 
					me.activeStyleBtn();
					tgbtn.style.backgroundColor = 'aliceblue';
				}else{ 
					me.inactiveStyleBtn();
					tgbtn.style.backgroundColor = 'transparent';
				}
			});
			
		});
	}
	
	/* 마우스 위치 */
	eventSetting(evt){
		var me = Signforus.getInstance();
		/*const boundBox = evt.target.getBoundingClientRect();
	    const coordX = boundBox.left;
	    const coordY = boundBox.top;
		this.mLeft = coordX;
		this.mTop = coordY;*/
		const x = evt.pageX;
		const y = evt.pageY;
		this.mLeft = x;
		this.mTop = y;
	}
	
	/* Video Play 여부 */
	isActiveSignforus(){
		var me = Signforus.getInstance();
		return me.suerActive == undefined ? false : me.suerActive;
	}
	
	/* Video Play 여부 */
	isPlayingSignforus(){
		var me = Signforus.getInstance();
		return me.playVideo == undefined ? false : me.playVideo;
	}
	
	/* Signforus 실행가능여부 */
	posibleSignforus() {
		return Signforus.instance.isActiveSignforus() && !Signforus.instance.isPlayingSignforus();
	}
	
	/* ajax 호출 */
	ajaxCallforText(text){
		var me = Signforus.getInstance();
		var paramURL = this.apiURL.concat(text);
		console.log('paramURL : ',paramURL);
		var Result;
		
		$.ajax({	  		
			url: paramURL,
	 		data: { keyword : text , obj_type : '', relic_yn : '' },
	 		cache: false,
	 		success: function(data)
	 		{
	 			if(typeof data !== 'object'){
	 				var parseData = JSON.parse(data);
	 			}else{
	 				var parseData = data;
	 			}
	 			console.log('data : ', parseData);
	 			me.playVideoStart(parseData.movie, text);
	 			me.textEvent = false;	//	Event 단어 차단 허용
	 		},
			error: function(request, status, error){
				console.log("code:"+request.status+" / "+"message:"+request.responseText+" / "+"error:"+error);
				me.textEvent = false;	//	Event 단어 차단 허용
			}
		});
	}
	
	/* Video 실행 메소드 */
	playVideoStart(videoURL, text){
		var video = 'http://sldict.korean.go.kr/multimedia/multimedia_files/convert/20191016/628347/MOV000255289_700X466.mp4';	//	없다 영상
		var videoTxt = '없다';
		if(typeof videoURL != "undefined" && videoURL != null && videoURL != ""){
			video = videoURL;
			videoTxt = text;
		}
		Signforus.instance.activeStyleBtn();
		var suer_div = $('#div_suer');
		suer_div.html('<input type="hidden" id="video" value=""/><video id="videoPlay" width="300px" controls muted autoplay ></video>');
		$("#text_suer").text(videoTxt);
		document.getElementById('videoPlay').addEventListener('ended', Signforus.instance.videoPlayEnded, false);
		Signforus.instance.showVideoPlayer(video);
	}
	
	/* Video start */
	showVideoPlayer(videoPath) {
		var me = Signforus.getInstance();
		$("#videoPlay").attr("src", videoPath);
		
		var left = (me.mLeft - 250).toString() + "px";
	    var top = (me.mTop + 60).toString() + "px";
	    
		$('#view_box').css("left",left);
		$('#view_box').css("top",top);
		$('#view_box').css("display","block");
		me.playVideo = true;
	}
	
	/* Video End 이벤트 */
	videoPlayEnded() {
		var me = Signforus.getInstance();
		var viewBox = document.getElementById('view_box');
		viewBox.style.display = 'none';
		me.playVideo = false;
		me.textEvent = false;
	}
	
	/* 수어 Off */
	inactiveStyleBtn() {
		var me = Signforus.getInstance();
		var viewBox = document.getElementById('view_box');
		viewBox.style.display = 'none';
		var tgbtn = document.getElementById('tg_suer');
		tgbtn.style.backgroundColor = 'transparent';
		me.suerActive = false;
		me.playVideo = false;
		me.textEvent = false;
	}
	
	/* 수어 On */
	activeStyleBtn() {
		var me = Signforus.getInstance();
		var viewBox = document.getElementById('view_box');
		var tgbtn = document.getElementById('tg_suer');
		tgbtn.style.backgroundColor = 'aliceblue';
		me.suerActive = true;
	}
	
	setEnabled(){
		var me = Signforus.getInstance();
		me.textEvent = true;
	}
	
	setDisabled(){
		var me = Signforus.getInstance();
		me.textEvent = false;
	}
}

Window.Signforus = Signforus.getClass("localhost");

const Signact = () => {
	const signforus = Window.Signforus; 
	$("li").hover(function(e) {
		/*mouse enter, mouse over*/
		var searchText = e.currentTarget.outerText;
		var id = e.currentTarget.id;
		
		console.log('searchText : ',searchText);
			
		var arrText = searchText.trim().split('\n');
		
		signforus.execute(e, arrText[0]);
	}, function(e){
		/*mouse leave, mouse out*/
		signforus.stop();
	});
}

// Dom Load
$(document).ready(()=>{
	window.addEventListener("keydown", evt => {
		if("Control" == evt.key){
			Window.Signforus.evtControlKeyDown();
		}
	});
	window.addEventListener("keyup", evt => {
		if("Control" == evt.key){
			Window.Signforus.evtControlKeyUp();
		}
	});
	
	window.addEventListener("mouseup", e => {
		if(Window.Signforus.isEnabled()){
			Window.Signforus.evtMouseUp(e);
		}
	});
	
	Signact();
});
