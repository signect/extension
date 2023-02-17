// Dom Load
$(document).ready(()=>{makeAlert();})

//$(document).ready(()=>{makeSLP();})

//$(document).ready(alert('capcom'));




const makeAlert = () => {
    //alert('capcom');
	
	
	$("li").hover(function(e) {
		
		var searchText = $( this ).text();
		
		alert(searchText);
		
	});
}