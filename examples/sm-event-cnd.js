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
	$.voCnd.setPostData('cnd_action','event'); // Set a key, value to send to the controller
	$.voCnd.setContentDom('.results-list ul.items','li'); // DOM block and item row
	$.voCnd.setLimit(10); // Set the pagination result limit
	
	// Set filters by external get process
	if( $.cndInput ){
		$.each($.cndInput, function(key,val){
			$.voCnd.filterArray[key] = val;
		});
	}
	
	//$.voCnd.setFilterPanel(1); // Set results to filter panel
	if($.voCnd.filterArray.search){
		$('#cnd-search').val($.voCnd.filterArray.search);
	}
	$.voCnd.ajaxBeforeSend = function()
	{
		$($.voCnd.settings.pagination).hide();
	};
	
	
	// Set cnd panel groups
	$.voCnd.customContentFunction = function( key, rowData, rowObject ){
		
		rowObject.setDataDisplay( rowData );
		//$('.title a',rowObject).attr('href','/event/'+rowData.slug).text(rowData.name);
		$('.info_title',rowObject).text(rowData.name);
		$('a.admin-link',rowObject).attr('href','/wp-admin/post.php?post='+rowData.id+'&action=edit');
		
		$('.title a,.image-wrap a',rowObject).attr('href','/event/'+rowData.slug);
		if( rowData.website ){
			$('.info-website a',rowObject).attr('href',rowData.website);
		}else{
			$('.info-website',rowObject).remove();	
		}
		if( rowData.speaker_slug ){ $('.speaker',rowObject).wrap('<a href="/'+rowData.speaker_slug+'"></a>'); }
		if( rowData.email ){ $('.email',rowObject).wrap('<a href="mailto:'+rowData.email+'"></a>'); }
		if( rowData.location_id ){ $('.location_parent_child', rowObject).text(''); }
		
		if( rowData.start_date ){
			if( (rowData.start_date == rowData.end_date) || rowData.end_date == '' ){
				$('.info-date',rowObject).text(rowData.start_date);
			}
		}else{
			$('.info-date',rowObject).hide();
		}
		
		if( rowData.map_link ){
			$('.event-map a', rowObject).attr('href',rowData.map_link);
		}else{
			$('.event-map', rowObject).remove();
		}
		
		if( rowData.photo ){
			$('img', rowObject).attr('src',rowData.photo);
		}
		
		$('.ministry-name',rowObject).attr('href','/ministries/'+rowData.ministry_slug).text(rowData.ministry);
		$('.info-location',rowObject).text(locationObj[rowData.location_id]);

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

		if( !rowData.contact && !rowData.email && !rowData.phone ){
			$('.event-contact',rowObject).hide();
		}
	};
	
	// This the ajax function that is called after the success function, no data is in here, just status info
	var $resultsDisplayNote = $('#content .all h2');
	var $ministryArea = $('#ministry-short');
	var ministryDefaultPhoto = $('.photo',$ministryArea).attr('src');
	var $ministrySeries = $('.series',$ministryArea);
	var ministryCache = 0;
	
	$.voCnd.ajaxSuccessFunction = function( data, status )
	{
		if( data.panel.length > 0 ){
			flattenObject(data.panel.location.array);
		}
		//$.log(searchObjectKeys(data.panel.location.array,81));
		$($.voCnd.settings.pagination).show();
		var displayNote = 'All Events';
		// Handle results display
		if( typeof($.voCnd.filterArray.ministry) == 'object' && $.voCnd.filterArray.ministry > 0 ){
			displayNote += ' by ' + $.voCnd.cache.panel['ministry'][$.voCnd.filterArray.ministry[0]].name;
		}
		
		$resultsDisplayNote.text(displayNote);
		
		if( data.ministry ){
			if( data.ministry.term_id != ministryCache ){
				ministryCache = data.ministry.term_id;
				$('.photo',$ministryArea).attr('src', ( data.ministry.photo ? data.ministry.photo : ministryDefaultPhoto ) );
				$('.name',$ministryArea).text( data.ministry.name );
				$('.description',$ministryArea).html( data.ministry.description );
			}
			$ministryArea.slideDown();
		}else{
			$ministryArea.slideUp();
		}
	};
	
	// Exception for tags
	// set cnd content events
	$.voCnd.init();
	
});