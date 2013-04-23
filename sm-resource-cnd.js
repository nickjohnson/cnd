(function ($)
{
$(document).ready(function(){
	// Set controller
	$.voCnd.setController('../wp-content/plugins/sabramedia-cnd/controller.php');
	$.voCnd.setPostData('cnd_action','resource'); // Set a key, value to send to the controller
	$.voCnd.setContentDom('.results-list ul.items','li'); // DOM block and item row
	$.voCnd.setLimit(12); // Set the pagination result limit
	
	// Set filters by external get process
	if( $.cndInput ){
		$.each($.cndInput, function(key,val){
			$.voCnd.filterArray[key] = val;
		});
	}

	// Set cnd panel groups
	$.voCnd.customContentFunction = function( key, rowData, rowObject ){
		var baseURL = '/clients/grolink';
		var templateFolder = baseURL + '/wp-content/themes/skeleton_childtheme';

		rowData.item_price = rowData.item_price != null ? formatMoney(rowData.item_price,'$',',','.') : 'Free';
		rowData.item_detail = ! rowData.multiple_formats ? rowData.item_detail : 'Multiple Formats';
		var tempVigor = rowData.vigor;
		switch (tempVigor) {
			case '3':
				//rowData.vigor = 'vigor-three.jpg';
				rowData.vigor = '3';
				break;
			default :
				//rowData.vigor = 'other.jpg';
				rowData.vigor = 'other';
				break; 
		}

		rowObject.setDataDisplay( rowData );
		$.log(rowData);
		$('.title a,.image-wrap a',rowObject).attr('href',baseURL+'/mums/'+rowData.slug);
		$('.title span',rowObject).text(rowData.name);
		$('.product-flower-type span',rowObject).text(rowData.flower_type);
		$('.product-response span',rowObject).text(rowData.response_time);
		$('.culture-info-link a',rowObject).attr('href',baseURL+'/culture-info/'+rowData.culture_info_post);
		//$('.product-vigor img',rowObject).attr('src', templateFolder + '/images/' + rowData.vigor);
		$('.product-vigor span',rowObject).text(tempVigor);
		$('.product-color span',rowObject).text(rowData.color_name);
		$('a.admin-link',rowObject).attr('href','/wp-admin/post.php?post='+rowData.id+'&action=edit');
		$('a.thumbnail',rowObject).attr('href',baseURL+'/mums/'+rowData.slug);
		if( rowData.photo ){
			$('.event-image img', rowObject).attr('src',rowData.photo);
		}else if( rowData.series_photo ){
			$('.event-image img', rowObject).attr('src',rowData.series_photo);
		}
		
		if( rowData.season_name ){
			$('.product-season span',rowObject).text(rowData.season_name);
		} else {
			$('li.product-season',rowObject).remove(); // Remove list item if season is not set
		}
	};
	
	// This the ajax function that is called after the success function, no data is in here, just status info
	var $resultsDisplayNote = $('#content .all h2');
	var loadOnce = 0;
	$.voCnd.ajaxSuccessFunction = function( data, status )
	{
		$($.voCnd.settings.pagination).show();
		var displayNote = 'All Messages';
		// Handle results display
		/*if( typeof($.voCnd.filterArray.presenter) == 'object' && $.voCnd.filterArray.presenter > 0 ){
			displayNote += ' by ' + $.voCnd.cache.panel['presenter'][$.voCnd.filterArray.presenter[0]].name;
		}
		if( typeof($.voCnd.filterArray.event) == 'object' && $.voCnd.filterArray.event.length > 0  ){
			$.log($.voCnd.filterArray);
			displayNote += ' at ' + $.voCnd.cache.panel['event'][$.voCnd.filterArray.event[0]].name;
		}*/
		
		$resultsDisplayNote.text(displayNote);
	};
//	var api;
//	var loadOnce;
//	$.voCnd.ajaxCompleteFunction = function()
//	{
//		var $pane = $('ul.cnd-list');
//
//		if( ! loadOnce ){
//			$pane.jScrollPane({
//				horizontalDragMinWidth: 20,
//				horizontalDragMaxWidth: 20,
//				verticalDragMinHeight: 20,
//				verticalDragMaxHeight: 20
//			});
//			api = $pane.data('jsp');
//			loadOnce = 1;
//		}else{
//			$pane.each(function(){
//				var api = $(this).data('jsp');
//				api.reinitialise();
//				api.scrollToElement('.ui-state-active');
//			});
//			//api.reinitialise();
//		}
//	};
	
	$('.results-sorting li').click(function(){
		if( ! $(this).is('.ui-state-active') ){
			switch( $('a',this).attr('class') ){
			case 'sort-vigor':
				$.voCnd.filterArray.orderby = ['vigor ASC'];
				break;
			case 'sort-date':
				$.voCnd.filterArray.orderby = ['post_date DESC'];
				break
				
			case 'sort-title':
				$.voCnd.filterArray.orderby = ['post_name ASC'];
				break;
			}
			
			$.voCnd.getResults();
			$('.results-sorting li').removeClass('ui-state-active');
			$(this).addClass('ui-state-active');
		}else{
			delete($.voCnd.filterArray.orderby);
			$.voCnd.getResults();
			$(this).removeClass('ui-state-active');
		}
	});

	$.voCnd.ajaxBeforeSend = function()
	{
		$($.voCnd.settings.pagination).hide();
	};
	
	// Exception for tags
	// set cnd content events
	$.voCnd.init();
	
});
})(jQuery);