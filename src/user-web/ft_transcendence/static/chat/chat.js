function chatFunction() {
	document.addEventListener('DOMContentLoaded', function() {
	    var actionMenuBtn = document.getElementById('action_menu_btn');
	    var actionMenu = document.querySelector('.action_menu');

	    actionMenuBtn.addEventListener('click', function() {
	        if (actionMenu.style.display === 'block') {
	            actionMenu.style.display = 'none';
	        } else {
	            actionMenu.style.display = 'block';
	        }
	    });
	});
}

//$(document).ready(function(){
//	$('#action_menu_btn').click(function(){
//		$('.action_menu').toggle();
//	});
//});

