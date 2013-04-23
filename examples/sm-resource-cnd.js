$(document).ready(function(){
	
	Object.size = function (obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };
    
	// Set controller
	$.voCnd.setController('/sabramedia/controller/cnd.php');
	$.voCnd.setPostData('cnd_action','resource'); // Set a key, value to send to the controller
	$.voCnd.setContentDom('.results-list ul.items','li'); // DOM block and item row
	$.voCnd.setLimit(10); // Set the pagination result limit
	
	// Set filters by external get process
	if( $.cndInput ){
		$.each($.cndInput, function(key,val){
			$.voCnd.filterArray[key] = val;
		});
	}

	// Set cnd panel groups
	$.voCnd.customContentFunction = function( key, rowData, rowObject ){
		rowData.item_price = rowData.item_price != null ? formatMoney(rowData.item_price,'$',',','.') : 'Free';
		rowData.item_detail = ! rowData.multiple_formats ? rowData.item_detail : 'Multiple Formats';
		
		rowObject.setDataDisplay( rowData );
		$('.title a,.image-wrap a',rowObject).attr('href','/resource/'+rowData.slug);
		$('.title a',rowObject).text(rowData.name);
		$('a.admin-link',rowObject).attr('href','/wp-admin/post.php?post='+rowData.id+'&action=edit');
		$('a.thumbnail',rowObject).attr('href','/resource/'+rowData.slug);
		if( rowData.photo ){
			$('img', rowObject).attr('src',rowData.photo);
		}else if( rowData.series_photo ){
			$('img', rowObject).attr('src',rowData.series_photo);
		}
		
		// Check for multiple presenters
		if( ! rowData.presenter_array ){
			$('.presenter',rowObject).html('<a href="/profile/'+rowData.presenter_slug+'" class="presenter">'+rowData.presenter_name+'</a>');
		}else{
			var presenterHtmlArray = [];
			$.each( rowData.presenter_array, function(id, presenter){
				presenterHtmlArray.push('<a href="/profile/'+presenter.slug+'" class="presenter">'+presenter.name+'</a>');
			});
			$('.presenter',rowObject).replaceWith(presenterHtmlArray.join(', ',presenterHtmlArray));
		}
	};
	
	// This the ajax function that is called after the success function, no data is in here, just status info
	var $resultsDisplayNote = $('#content .all h2');
	var $presenterArea = $('#presenter-short');
	var presenterDefaultPhoto = $('.photo',$presenterArea).attr('src');
	var $presenterSeries = $('.series',$presenterArea);
	var $seriesRowTemplate = $('li', $presenterSeries).comments();
	var $seriesSliderItemWrap = $('<li />');
	var presenterCache = 0;
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
		
		if( data.presenter ){
			if( data.presenter.term_id != presenterCache ){
				presenterCache = data.presenter.term_id;
				$('.photo',$presenterArea).attr('src', ( data.presenter.photo ? data.presenter.photo : presenterDefaultPhoto ) );
				$('.name',$presenterArea).text( data.presenter.name );
				$('.bio',$presenterArea).html( data.presenter.description );	
			}
			$presenterArea.slideDown();
		}else{
			$presenterArea.slideUp();
		}
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
			case 'sort-price':
				$.voCnd.filterArray.orderby = ['item_price ASC'];
				break;
			case 'sort-date':
				$.voCnd.filterArray.orderby = ['post_date DESC'];
				break
				
			case 'sort-title':
				$.voCnd.filterArray.orderby = ['name ASC'];
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