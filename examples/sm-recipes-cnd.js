(function ($)
{
	var qs = (function(a) {
		if (a == "") return {};
		var b = {};
		for (var i = 0; i < a.length; ++i)
		{
			var p=a[i].split('=');
			if (p.length != 2) continue;
			b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
		}
		return b;
	})(window.location.search.substr(1).split('&'));

$(document).ready(function(){
	var locationObj = {};
	Object.size = function (obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };
    
    function flattenObject( obj )
	{
		$.each(obj, function(j,node){
			locationObj[j] = node.br.join(", ");
			if( Object.size(node.children) > 0 ){
				flattenObject( node.children );
			}
		});
	};
    
	// Set controller
	$.voCnd.setController('/sabramedia/controller/cnd.php');
	$.voCnd.setPostData('cnd_action','recipe'); // Set a key, value to send to the controller
	$.voCnd.setContentDom('.results-list ul.items','li'); // DOM block and item row
	$.voCnd.setLimit(9); // Set the pagination result limit
	$.voCnd.settings['slideUpOnPaginate'] = false; // Set whether the windows slides on pagination
	
	// Set filters by external get process
//	if( $.cndInput ){
//		$.each($.cndInput, function(key,val){
//			$.voCnd.filterArray[key] = val;
//		});
//	}

	$.each(qs,function(key,val){
		$.voCnd.filterArray[key] = [val];
	});
	
	//$.voCnd.setFilterPanel(1); // Set results to filter panel
	if($.voCnd.filterArray.search){
		$('#cnd-search').val($.voCnd.filterArray.search);
	}

	$.voCnd.ajaxBeforeSend = function()
	{
		//$($.voCnd.settings.pagination).hide();
	};

	$.voCnd.customContentFunction = function( key, rowData, rowObject ){
		
		rowObject.setDataDisplay( rowData );
		//$('.title a',rowObject).attr('href','/event/'+rowData.slug).text(rowData.name);		
		//$('a.admin-link',rowObject).attr('href','/wp-admin/post.php?post='+rowData.id+'&action=edit');
		
		$('.recipe-title',rowObject).text(rowData.name);
		$('.recipe-air-date',rowObject).text(rowData.recipe_air_date);
		$('a',rowObject).attr('href','/recipe/'+rowData.slug);

		if( rowData.cooks_array ){
			var cooksArray = [];
			$.each(rowData.cooks_array, function(i,cook){
				cooksArray.push(cook.name);
			});

			$('.cooks', rowObject).text(cooksArray.join(', '));
		}else{
			$('.cooks', rowObject).text(rowData.cooks_name);
		}

		if( rowData.episodes_options ){
			var episodeAirArray = [];
			// Episode air dates
			$.each(rowData.episodes_options.episode_, function(i,airDate){
				episodeAirArray.push(airDate.air_date);
			});

			$('.episodes', rowObject).text(rowData.episodes_options.episode_name + ', '+rowData.episodes_name);
			$('.recipe-air-date', rowObject).text(episodeAirArray.join(', '));
		}
			
		// icon handling here
		/* if(rowData.opportunity_categories_name){
			$icon = $('.icon', rowObject);
			$icon.attr('src', $icon.attr('src').replace('[name]',rowData.opportunity_categories_name.replace(/\s+/g, '-').toLowerCase()));
		}else{
			$icon = $('.icon', rowObject);
			$icon.attr('src', $icon.attr('src').replace('[name]','default'));
		} */
		
		if( rowData.photo ){
			$('img', rowObject).attr('src',rowData.photo);
		}
		
		// $('.recipe-title',rowObject).attr('href','/recipe/'+rowData.recipe_slug).text(rowData.recipe);
	};
	
	var loadOnce;
	$resetResults = $('.reset').click(function(){
		$.voCnd.reset();
	});
	
	$.voCnd.ajaxSuccessFunction = function( data, status ){
		if(loadOnce){
			$resetResults.fadeIn('fast');
		}
		loadOnce = true;
	};
	
	$.voCnd.init();
	
});
})(jQuery);