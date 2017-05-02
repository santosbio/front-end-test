var url = window.location.href, 
token, 
access_token = '096021ee4e026675edf41b8de559eb0f3d8b7818e547a1e193e9961ba4e2da0f', 
the_shots,
vueApp,
singleShotID;

function searchComponent(the_shots) {
	vueApp = new Vue({
	    el: '#app',
	    data: {
	        searchString: "",
	        shots: the_shots
	    },
	    computed: {
	        filteredShots: function () {
	            var shots_array = this.shots,
	                searchString = this.searchString;

	            if(!searchString){
	                return shots_array;
	            }

	            searchString = searchString.trim().toLowerCase();

	            shots_array = shots_array.filter(function(item){
	                if(item.title.toLowerCase().indexOf(searchString) !== -1){
	                    return item;
	                }
	            })

	            return shots_array;
	        }
	    }
	});

	// Exibe o conteúdo
	$('#logado').css({'display': 'block'});

	// Seta as URLs dos shots
	$("#logado .shots .shot a").each(function(){
		
		var shotID = $(this).attr('data-id');
		var newURL = '/shot?id='+shotID;
		$(this).attr('href', newURL);
		
	});
}

function detailsComponent(the_shots) {

	vueApp = new Vue({
	    el: '#app',
	    data: {
	        title: the_shots.title,
	        description: the_shots.description.replace(/(<([^>]+)>)/ig,""),
	        user: the_shots.user.name,
	        likes_count: the_shots.likes_count,
	        images: the_shots.images.normal,
	        id: the_shots.id
	    }
	});

	// Exibe o conteúdo
	$('#logado').css({'display': 'block'});

	// verifica se o item já foi curtido
	var myLikeURL = 'https://api.dribbble.com/v1/shots/'+singleShotID+'/like';

	$.ajax({
	  url: myLikeURL,
	  beforeSend: function(jqxhr) {
	    jqxhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
	  },
	  statusCode: {
	    404: function() {
	      $('.likeShot').removeClass('liked')
	    },
	    200: function() {
	      $('.likeShot').addClass('liked');
	    }
	  }
	});

}

function likeShot() {
	// verifica se o item já foi curtido
	var myLikeURL = 'https://api.dribbble.com/v1/shots/'+singleShotID+'/like';

	$.ajax({
	  type: 'POST',
	  url: myLikeURL,
	  data: { oauth: localStorage.getItem('token')},
	  beforeSend: function(jqxhr) {
	    jqxhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
	  },
	  success: function(res) {
	  	// $('.likeShot').addClass('liked');
	  },
	  error: function(jqxhr) {
	    // $('.likeShot').removeClass('liked');
	  }
	});
}


function typePage() {
	// Verifica se o usuário está na página de detalhes do shot (IF) ou na página inicial (ELSE)
	if ($('.single-shot').length) {

		var tmp = url.split('?id=');
		singleShotID = tmp[1];

		if (!localStorage.getItem('singleShotID')) {
			localStorage.setItem('singleShotID', tmp[1]);
			
		}

		var urlShot = 'https://api.dribbble.com/v1/shots/'+singleShotID;

		$.ajax({
		  type: 'GET',
		  url: urlShot,
		  beforeSend: function(jqxhr) {
		    jqxhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		  },
		  success: function(res) {
		  	the_shots = res;
		  	detailsComponent(the_shots);
		  },
		  error: function(jqxhr) {
		    
		  }
		});
	} else {
		// Verifica se o usuário autorizou o aplicativo, e carrega os shots
		if (!localStorage.getItem('token')) {
			var tmp = url.split('?code=');
			token = tmp[1];
			localStorage.setItem('token', token);
		} else {
			$('#login').css({'display': 'none'});

			$.ajax({
			  type: 'GET',
			  url: 'https://api.dribbble.com/v1/user',
			  beforeSend: function(jqxhr) {
			    jqxhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
			  },
			  success: function(res) {
			  	localStorage.setItem('userID', res.id);
			  },
			  error: function(jqxhr) {
			    
			  }
			});

			$.ajax({
			  type: 'GET',
			  url: 'https://api.dribbble.com/v1/shots/?per_page=40&list=debuts',
			  beforeSend: function(jqxhr) {
			    jqxhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
			  },
			  success: function(res) {
			  	the_shots = res;
			  	searchComponent(the_shots);
			  },
			  error: function(jqxhr) {
			    
			  }
			});
		}
	}
}







$(function(){
	
	typePage();

	// Exibe as imagens maiores
	$(document).on('click', '.larger-images', function(e){
		e.preventDefault();
		$('.container-shot').removeClass('col-md-4').removeClass('col-lg-3').addClass('col-md-6').addClass('col-lg-6');

		$('.smaller-images').removeClass('selected');
		$(this).addClass('selected');

		$("#logado .shots .shot a img").each(function(){
			if ($(this).attr('data-hidpi')) {
				var newURL = $(this).attr('data-hidpi');
				$(this).attr('src', newURL);
			}
		});
	});

	// Exibe as imagens no tamanho regular
	$(document).on('click', '.smaller-images', function(e){
		e.preventDefault();
		$('.container-shot').removeClass('col-md-6').removeClass('col-lg-6').addClass('col-md-4').addClass('col-lg-3');
		$('.larger-images').removeClass('selected');
		$(this).addClass('selected');

		$("#logado .shots .shot a img").each(function(){
			
			var newURL = $(this).attr('data-normal');
			$(this).attr('src', newURL);
			
		});
	});

	// Curte/Descurte o shot
	$(document).on('click', '.likeShot', function(e){
		e.preventDefault();

		if($(this).hasClass('liked')) {
			$(this).removeClass('liked');
			var tmpLike = parseInt($(this).find('small').text())-1;
			$(this).find('small').text(tmpLike);
		} else {
			$(this).addClass('liked');
			var tmpLike = parseInt($(this).find('small').text())+1;
			$(this).find('small').text(tmpLike);
		}

		likeShot();

	});
});