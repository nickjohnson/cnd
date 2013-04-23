/**
 * jQuery Sabramedia Library - Used for Sabramedia Virtual Office Framework
 * Click and Discover Branch
 * Copyright (C) 2008 - 2013 Sabramedia, LLC
 * http://sabramedia.com
 *
 * @author Nick Johnson {@link http://nickjohnson.com}
 */

/*
 * jQuery JSON Plugin
 * version: 1.0 (2008-04-17)
 *
 * This document is licensed as free software under the terms of the
 * MIT License: http://www.opensource.org/licenses/mit-license.php
 *
 * Brantley Harris technically wrote this plugin, but it is based somewhat
 * on the JSON.org website's http://www.json.org/json2.js, which proclaims:
 * "NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.", a sentiment that
 * I uphold.  I really just cleaned it up.
 *
 * It is also based heavily on MochiKit's serializeJSON, which is 
 * copywrited 2005 by Bob Ippolito.
 */
 

(function($){function toIntegersAtLease(n){return n<10?'0'+n:n;}Date.prototype.toJSON=function(date){return this.getUTCFullYear()+'-'+toIntegersAtLease(this.getUTCMonth())+'-'+toIntegersAtLease(this.getUTCDate());};var escapeable=/["\\\x00-\x1f\x7f-\x9f]/g;var meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'};$.quoteString=function(string){if(escapeable.test(string)){return'"'+string.replace(escapeable,function(a){var c=meta[a];if(typeof c==='string'){return c;}c=a.charCodeAt();return'\\u00'+Math.floor(c/16).toString(16)+(c%16).toString(16);})+'"';}return'"'+string+'"';};$.toJSON=function(o,compact){var type=typeof(o);if(type=="undefined")return"undefined";else if(type=="number"||type=="boolean")return o+"";else if(o===null)return"null";if(type=="string"){return $.quoteString(o);}if(type=="object"&&typeof o.toJSON=="function")return o.toJSON(compact);if(type!="function"&&typeof(o.length)=="number"){var ret=[];for(var i=0;i<o.length;i++){ret.push($.toJSON(o[i],compact));}if(compact)return"["+ret.join(",")+"]";else
return"["+ret.join(", ")+"]";}if(type=="function"){throw new TypeError("Unable to convert object of type 'function' to json.");}var ret=[];for(var k in o){var name;type=typeof(k);if(type=="number")name='"'+k+'"';else if(type=="string")name=$.quoteString(k);else
continue;var val=$.toJSON(o[k],compact);if(typeof(val)!="string"){continue;}if(compact)ret.push(name+":"+val);else
ret.push(name+": "+val);}return"{"+ret.join(", ")+"}";};$.compactJSON=function(o){return $.toJSON(o,true);};$.evalJSON=function(src){return eval("("+src+")");};$.secureEvalJSON=function(src){var filtered=src;filtered=filtered.replace(/\\["\\\/bfnrtu]/g,'@');filtered=filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']');filtered=filtered.replace(/(?:^|:|,)(?:\s*\[)+/g,'');if(/^[\],:{}\s]*$/.test(filtered))return eval("("+src+")");else
throw new SyntaxError("Error parsing JSON, source is not valid.");};})(jQuery);


/* Global Variables */
var sabramediaSpinnerSmall = '<span class="pending-spinner"></span>';
String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g,""); };
String.prototype.ltrim = function() { return this.replace(/^\s+/,""); };
String.prototype.rtrim = function() { return this.replace(/\s+$/,""); };

/* Sabramedia jQuery Begins */
(function ($)
{

// ## Sabramedia VO Ajax Wrapper ## //
	$.voAjax = function( settings , thisUpdateField )
	{
		
	// Data Preparation
	
		// if tinyMCE variable set then we need to trigger the new values.
		if(typeof(tinyMCE) != 'undefined'){
			//tinyMCE.triggerSave();
		}
		
		// This doesn't work... I know how to get it to work now, think iframe.
		if(typeof(editAreaLoader) != 'undefined'){
			$('textarea#content-js').append(editAreaLoader.getValue('content-js'));
		}
		
	// Methods
		function getSerializedData()
		{
			var serializedData = '';
			// Set data here. Important to set after this just in case we need to do an preparation.
			if(settings.dataContainer){
				serializedData += $(settings.dataContainer).serializeRowData();
			}
			
			if(settings.dataObject){
				if(settings.dataContainer){ serializedData += '&'; } // Appending character if both are set
				serializedData += serializeJSON(settings.dataObject);
			}
			return serializedData;
		};
		
		function beforeSend( xhr )
		{
			if(settings.spinner){
				$(thisUpdateField).after(sabramediaSpinnerSmall);
			}
			
			var verify = true;
			if(settings.verifyAction){
				verify = confirm(settings.verifyAction);
			}
			
			if( !verify ){
				return false;
			}
			
			// Disable all sibling fields only dataObject is not passed and rowData is used
			// $('button').attr('disabled','disabled');
	
			// Iterate through custom fields
			if(settings.beforeSend){
				$.each(settings.beforeSend,function(i,customFunction){
					// Pass field object of event handler
					customFunction(xhr,thisUpdateField);
				});
			}
		};
		
		function success( data, status )
		{
			$('.pending-spinner').remove();
			if(settings.success){
				$.each(settings.success,function(i,customFunction){
					// Pass field object of event handler
					if($.isFunction( customFunction )){
						customFunction( data, status, thisUpdateField );
					}
				});
			}else{
//				$(thisUpdateField)
//					.focus()
//					.siblings('.temp-message').remove().end()
//					.parent('li').removeAttr('style').end();
			}
			
			if(data.warning){
				$.voMessage.alert( data.warning );
			}
			if(data.message){
				$.voMessage.dock( data.message );
			}
		};
		
		function complete( xhr, status)
		{
			// Re-enable disabled fields upon success
			// $('button').removeAttr('disabled');
			if(settings.complete){
				$.each(settings.complete,function(i,customFunction){
					// Pass field object of event handler
					if($.isFunction( customFunction )){
						customFunction( xhr, status );
					}
				});
			}
		};

	// Ajax initializes here
		
		return $.ajax({
			type:'POST',
			url:settings.actionController,
			dataType:'json',
			data:getSerializedData(),
			beforeSend:beforeSend,
			success:success,
			complete:complete,
			global:settings.global
		});
	};
	
	/**
	* serializeJSON()
	* Turns JSON object into a serialized string in the form of: key=val&key2=val2 
	*
	* @param object literal object
	* @return string serialized for Ajax
	*/
	function serializeJSON(dataObject)
	{
		var dataArray = [];
		var retval;
		
		$.each(dataObject,function(key,data){
			dataArray.push(key + '=' + escape(data));
		});
		
		retval = dataArray.join('&');
		return retval;
	};
	
	function simplifyInputData(dataObject)
	{
		var object = [];
		var retval;
		
		$.each(dataObject,function(key,data){
			
			object[data.name] = data.value;
		});
		
		retval = object;
		return retval;
	};
	
	/** 
	* serializeRowData()
	* Accesses this elements parent element data-json attribute and all sibling element form-type
	* fields, then serializes data for sending via Ajax XHR.<b>
	*
	* @return string serialized data to send via Ajax
	* @dependency metadata
	*/
	$.fn.serializeRowData = function()
	{
		// Gets all json data contained in the parent tag's data-json wrapper 
		var metaData='';
		if($.metadata){
			$.metadata.setType('attr','data-json');
			jsonObject = $('[data-json]',this).andSelf().metadata();
			metaData += serializeJSON(jsonObject)+'&';
		}
		if($(this).data('postdata')){
			metaData += serializeJSON($(this).data('postdata'))+'&';
		}
		// Gets all form type fields based on the current field's containing parent,
		// Then it serializes the data for passing to the ajax controller.
		var inputData = $(this).find(':input');
		
		// Concatentate the jsonData and the inputData
		var serialData = metaData+inputData.serialize();
		//return jsonData;
		// Optional dual-type data object
		
		return serialData;
	};
		
	// Takes JSON returned data and places data in fields or tags with data.key == '.class'
	$.fn.setDataDisplay = function( data )
	{
		if(data){
			object = $(this);
			$.each(data, function( key, val ){
				if(typeof(val) != 'object'){
					var input_type = $('.'+key, object).attr('type');

					if($('.'+key, object).is('select')){
						input_type = 'select';
					}

					switch (input_type) {
						case 'text':
							$('.'+key, object).val(val);
						break;
						case 'textarea':
							$('.'+key, object).val(val);
						break;
						case 'radio':
							var $thisRadio = $(':radio[name="'+key+'"][value="'+val+'"]', object );
							if( $thisRadio.length ){
								$thisRadio.attr('checked','checked');
							}
						break;
						case 'checkbox':
							if(val == true){ val=1; }
							if(val == false){ val=0; }
							if( val ){
								$('.'+ key, object).attr('checked','checked');
							}else{
								$('.'+ key, object).removeAttr('checked');
							}
						break;
						case 'select':
							$('.'+key+' option[value="'+val+'"]', object).attr('selected','selected');
						break;
						default:
							$('.'+key, object).text(val);
						break;
					}
					//$('.'+key, object).text(val);
				}
			});
			return this;
		}
	};

	// This function makes use of the data- attribute which is much more logical than using class.
	$.fn.setDataDisplayHTML5 = function( data, form )
	{
		if(data){

			object = $(this);
			$.each(data, function( key, val ){
				if(typeof(val) != 'object'){
					// The form variable is true if the markup block is form input tags only.
					var fieldSelector = !form ? '[data-field-name="'+key+'"]' : '[name="'+key+'"]';

					$(fieldSelector, object).each(function(i, selector){
						var input_type = $(selector, object).attr('type');

						if($(selector, object).is('select')){
							input_type = 'select';
						}

						switch(input_type) {
							case 'text':
								$(selector, object).val(val);
							break;
							case 'textarea':
								$(selector, object).val(val);
							break;
							case 'radio':
								var $thisRadio = $(':radio[name="'+key+'"][value="'+val+'"]', object );
								if( $thisRadio.length ){
									$thisRadio.attr('checked','checked');
								}
							break;
							case 'checkbox':
								if(val == true){ val=1; }
								if(val == false){ val=0; }
								if( val ){
									$(selector, object).attr('checked','checked');
								}else{
									$(selector, object).removeAttr('checked');
								}
							break;
							case 'select':
								$(selector, object).find('option[value="'+val+'"]').attr('selected','selected');
							break;
							case 'hidden':
								$(selector, object).val(val);
							break;
							default:
								$(selector, object).text(val);
							break;
						}
					});

					//$('.'+key, object).text(val);
				}
			});
			return this;
		}
	};
		
	$.extend({
	/**
	* @name voMessage
	* @desc Standard method for bringing basic messages to system users.
	*/
		voMessage : {
			// Replaces standard alert with a nicer popup
			alert : function( message )
			{
				var randomId = Math.floor(Math.random()*11);
				var $dialog = $('<div id="vo-dialog'+randomId+'" />');
				$dialog.append('<span class="ui-icon ui-icon-alert" style="float:left; margin:2px 7px 20px 0;"></span>' + message);
				$dialog.appendTo('body'); 
				
				$dialog.dialog({
					title: 'Virtual Office Alert',
					bgiframe: true,
					resizable: false,
					height:200,
					width:300,
					modal: true,
					overlay: {
						backgroundColor: '#000',
						opacity: 0.5
					},
					buttons: {
						'Ok': function() {
							$(this).dialog('close');
							$(this).dialog('destroy');
							$('#vo-dialog'+randomId).remove();
						}
					}
				});
				
			},
			
			// Footer alert
			dock : function( message )
			{
				$("#dock-container").hide();
				$("#dock-container #ajax-message").empty().append( message );
				$("#dock-container").fadeIn('normal');
				setTimeout("$('#dock-container').fadeOut('slow')",4000);
			},
			
			// Safer way to post to Firebug console
			debug : function( message )
			{
				if(window.console){
					console.log(message);
				}else{
					if(typeof message != 'string'){
						message = 'Your browser doesn\'t support advanced debugging. Try Firefox and Firebug!';
					}
					//alert(message);
				}
			}
		},
		
		/**
		* @name log
		* @desc Alias of $.voMessage.debug(); 
		*/
		
		log : function( message )
		{
			$.voMessage.debug( message );
		}
	});

	/*	Blog Entry:
		jQuery Comments() Plug-in To Access HTML Comments For DOM Templating
		
		Author:
		Ben Nadel / Kinky Solutions
		
		Link:
		http://www.bennadel.com/index.cfm?dax=blog:1563.view
		
	*/
	
	$.fn.comments = function( blnDeep ){
		var blnDeep = (blnDeep || false);
		var jComments = $( [] );
	 
		// Loop over each node to search its children for
		// comment nodes and element nodes (if deep search).
		this.each(
			function( intI, objNode ){
				var objChildNode = objNode.firstChild;
				var strParentID = $( this ).attr( "id" );
				// Keep looping over the top-level children
				// while we have a node to examine.
				while (objChildNode){
					// Check to see if this node is a comment.
					if (objChildNode.nodeType === 8){
						// We found a comment node. Add it to
						// the nodes collection wrapped in a
						// DIV (as we may have HTML).
						/*jComments = jComments.add(
							"<div rel='" + strParentID + "'>" +
							objChildNode.nodeValue +
							"</div>"
							);*/
						
						jComments = jComments.add(objChildNode.nodeValue); // Nick modifed this
					} else if (
						blnDeep &&
						(objChildNode.nodeType === 1)
						) {
	 
						// Traverse this node deeply.
						jComments = jComments.add(
							$( objChildNode ).comments( true )
							);
					}
					// Move to the next sibling.
					objChildNode = objChildNode.nextSibling;
				}
			}
			);
		// Return the jQuery comments collection.
		return( jComments );
	};
	
	// For comparing two arrays.. thanks David @ stackflow
	$.fn.compare = function(t) {
	    if (this.length != t.length) { return false; }
	    var a = this.sort(),
	        b = t.sort();
	    for (var i = 0; t[i]; i++) {
	        if (a[i] !== b[i]) { 
	                return false;
	        }
	    }
	    return true;
	};

	
	
	/*
	 * voCnd - The backbone for click and discover interaction
	 * @version 1.0
	 * @updated 4/10/2013
	 */
	
	$.voCnd = {
		'settings':
			{
				controller : null,
				panel :'#cnd-navigation',
				pagination :'.cnd-pagination',
				contentDom : '',
				contentDomRow : '',
				filterPanel : 0,
				initContent : 1,
				slideUpOnPaginate : 1,
				pageNumbers : false
			},
		hierarchyArray : {}, // Cached arrays for mult-dimensional catgories
		cache : {'panel':{}}, // Added to accommodate panel state caching, deprecate the above eventually.
		filterArray : {}, // sent via ajax to controller
		data : {}, // Set externally to be sent via ajax to controller
		panelGroups : {},
		customContentFunction : {},
		ajaxCompleteFunction : function( data, status ){},
		resultTotal : '', // resultTotal set in setInterface() and filterResults()
		_currentXhr : null,


		'init' :
			function()
			{
				$.voCnd.filterArray['init'] = 1;
				$.voAjax({
					'actionController': $.voCnd.settings.controller,
					'dataObject':$.extend($.voCnd.data,{'vo-action':'init','filter_conditions':$.toJSON($.voCnd.filterArray)}),
					'beforeSend':[$.voCnd.ajaxBeforeSend,$.voCnd.waitingForResults],
					'success':[$.voCnd.ajaxSuccessFunction,$.voCnd.setInterface],
					'complete':[$.voCnd.ajaxCompleteFunction]
				});
				$.voCnd.filterArray['init'] = 0;
			},

		'setPaginationMessage' :
			function()
			{
				if($.voCnd.resultTotal){
					var totalPage = Math.ceil( ($.voCnd.resultTotal / $.voCnd.filterArray['limit']));
					var currentPage = ($.voCnd.filterArray['page'] + 1);
					$('span.results .current-page',$.voCnd.settings.pagination).text( currentPage );
					$('span.results .total-page',$.voCnd.settings.pagination).text( totalPage );
					$('span.results .total-item',$.voCnd.settings.pagination).text($.voCnd.resultTotal);

					if( $.voCnd.settings.pageNumbers ){
						var fragment = '';
						for(i=0;i<totalPage;i++){
							fragment += '<span style="padding-left:5px;"'+ (($.voCnd.filterArray['page'] == i) ? ' class="ui-state-active" ' : '')+' data-page-number="'+i+'">'+(i+1)+'</span>';
						}
						$('span.page-numbers',$.voCnd.settings.pagination).empty().append(fragment);
					}

					if($.voCnd.filterArray['page'] == 0 ){
						$('button.previous',$.voCnd.settings.pagination).hide();
					}else{
						$('button.previous',$.voCnd.settings.pagination).show();
					}

					if( totalPage == 1 || (totalPage == currentPage) ){
						$('button.next',$.voCnd.settings.pagination).hide();
						if(totalPage == 1){ $($.voCnd.settings.pagination).hide(); }
					}else{
						$('button.next',$.voCnd.settings.pagination).show();
						$($.voCnd.settings.pagination).show();
					}
				}
			},

		'setPagination' :
			function()
			{
				if(!$.voCnd.filterArray['page']){ $.voCnd.filterArray['page'] = 0; }

				$.voCnd.setPaginationMessage();
				$('button',$.voCnd.settings.pagination).click(function(e){
					if( $.voCnd.settings.slideUpOnPaginate ){
						var offset = $($.voCnd.settings.pagination).offset();
						$('html, body').animate({scrollTop:offset.top}, 'slow'); // scroll to to on pagination
					}
					var resultTotal = $.voCnd.resultTotal ? $.voCnd.resultTotal : $($.voCnd.settings.pagination+':first .total-item').text();

					if($(e.currentTarget).is('.previous')){
						var previousPage = $.voCnd.filterArray['page'] - 1;
						if( previousPage + 1 > 0 ){
							$.voCnd.filterArray['page'] = previousPage;
						}else{
							$.voCnd.filterArray['page'] = Math.floor( resultTotal / $.voCnd.filterArray['limit'] ); // go to last page
						}
						$.voCnd.getResults();
					}else{
						// page * limit < results
						var nextPage = $.voCnd.filterArray['page'] + 1;

						if( nextPage * $.voCnd.filterArray['limit'] < resultTotal ){

							$.voCnd.filterArray['page'] = nextPage;
						}else{
							$.voCnd.filterArray['page'] = 0;
						}
						$.voCnd.getResults();
					}

					$.voCnd.setPaginationMessage();
				});

				$('span.page-numbers',$.voCnd.settings.pagination).on('click','span',function(e){
					if( $.voCnd.settings.slideUpOnPaginate ){
						var offset = $($.voCnd.settings.pagination).offset();
						$('html, body').animate({scrollTop:offset.top}, 'slow'); // scroll to to on pagination
					}

					$.voCnd.filterArray['page'] = parseInt($(this).text())-1;
					$.voCnd.getResults();
					$.voCnd.setPaginationMessage();
				});

			},
		setPostData :
			function( key, value )
			{
				$.voCnd.data[key] = value;
			},

		'setFilterPanel' :
			function( boolean )
			{
				$.voCnd.settings.filterPanel = boolean;
			},

		'setLimit' :
			function( limit )
			{

				// For true customizabliity in SEO friendly versions I will need to get the limit from the DOM
				if( limit ){
					$.voCnd.filterArray.limit = limit;
				}else if( ! isNaN(parseInt($('.pagination-limit',$.voCnd.settings.pagination).text())) ){
					// Default if the limit is not set
					$.voCnd.filterArray.limit = parseInt($('.pagination-limit',$.voCnd.settings.pagination).text());
				}else{
					$.voCnd.filterArray.limit = 12;
				}
			},

		'getResults' :
			function()
			{
				// **Key efficiency logic - abort other ajax requests in favor of current
				// speeds up response
				if($.voCnd._currentXhr){ $.voCnd._currentXhr.abort(); }
				$.voCnd._currentXhr = $.voAjax({
					'actionController': $.voCnd.settings.controller,
					'dataObject':$.extend($.voCnd.data,{'vo-action':null,'filter_conditions':$.toJSON($.voCnd.filterArray)}),
					'beforeSend':[$.voCnd.ajaxBeforeSend,$.voCnd.waitingForResults],
					'success':[$.voCnd.ajaxSuccessFunction,$.voCnd.filterResults],
					'complete':[$.voCnd.ajaxCompleteFunction]
				});
			},

		'reset' :
			function()
			{
				$.each($.voCnd.filterArray, function(key,val){
					if( $.inArray(key, ['page','limit','init']) == -1){
						$.voCnd.filterArray[key] = [];
					}
				});
				$($.voCnd.settings.panel + ' .ui-state-active').removeClass('ui-state-active');
				$($.voCnd.settings.panel + ' option:selected').removeAttr('selected');
				$.voCnd.filterArray['page'] = 0;
				$.voCnd.getResults();
			},

		'setController' :
			function( location )
			{
				$.voCnd.settings.controller = location;
			},

		'setContentDom' :
			function( contentDom, contentDomRow )
			{
				$.voCnd.settings.contentDom = contentDom;
				$.voCnd.settings.contentDomRow = contentDomRow;
			},

		'preload' :
			function()
			{

			},

		'setPanelGroup' :
			function( callerSettings )
			{
				// groupName, groupDisplayName , multiDimension, defaultValue
				// Build the group object, but don't overwrite it proecedurally.
				// The interface conrtoller gets precedence over the Ajax data settings for group.
				$.voCnd.panelGroups[callerSettings.group] = $.extend({
					'displayName' : (callerSettings.displayName ? callerSettings.displayName : callerSettings.group ),
					'description' : callerSettings.description,
					'optionLabel' : callerSettings.optionLabel,
					'ui' : callerSettings.ui,
					'multiDimension' : (callerSettings.multiDimension ? 1 : 0), // if true then treat the group like a categoric hierarchy
					'dataFormatSingle' : callerSettings.dataFormatSingle,
					'filter' : callerSettings.filter,
					'filterEffect' : callerSettings.filterEffect
				},$.voCnd.panelGroups[callerSettings.group] || {});
			},
		'setGroupDefault' :
			function( groupName, id )
			{
				if(typeof($.voCnd.filterArray[groupName]) != 'object'){
					$.voCnd.filterArray[groupName] = [];
				}
				$.voCnd.filterArray[groupName].push(id);
				$.voCnd.panelGroups[groupName] = $.extend({'defaultValue':id},$.voCnd.panelGroups[groupName] || {});
			},

		// Group class
		'group' :
			function( domObject, groupName, groupSettings )
			{
				var thisGroup= this;

				this.menuClose =
					function( e )
					{
						$('h3 span',domObject).removeClass('ui-icon-triangle-1-s');
						$('h3 span',domObject).addClass('ui-icon-triangle-1-e');
						$('.cnd-list',domObject).slideUp('fast');
					};

				this.menuOpen =
					function( e )
					{
						$('h3 span',domObject).removeClass('ui-icon-triangle-1-e');
						$('h3 span',domObject).addClass('ui-icon-triangle-1-s');
						$('.cnd-list',domObject).slideDown('fast');
					};

				this.itemClick =
					function( e )
					{
					var $thisObject = $(this).closest('li'); // Makes sure it is an li that gets the effects
					var hasChild = $thisObject.is('.ui-has-child');
					if($thisObject.is('.ui-state-disabled')){
						e.stopPropagation();
					}else{
						// Click on
						if(!$thisObject.is('.ui-state-active')){
							if(groupSettings.dataFormatSingle){
								$.voCnd.filterArray[groupName] = [$thisObject.attr('rel')];
								$(domObject).find('.cnd-button.cancel').show();
							}else{
							// Format interface so group data is sent as an array
								if((clearItemId = $.inArray($('.crumb-current',domObject).attr('rel'), $.voCnd.filterArray[groupName])) != -1){
									$.voCnd.filterArray[groupName].splice(clearItemId,1);
								}
								$.voCnd.filterArray[groupName].push($thisObject.attr('rel'));

								// Show filter-cancel button
								if($.voCnd.filterArray[groupName].length  > 0){
									$(domObject).find('.cnd-button.cancel').show();
								}
							}
							$.voCnd.filterArray['page'] = 0;

							// Simulate toggle unbind current event and bind another
							/*$(this)
								.unbind('click')
								.bind('click',thisGroup.itemClickOff);*/
							if(groupSettings.dataFormatSingle){
								$('li',domObject).removeClass('ui-state-active');
								$('.handle',domObject).removeClass('ui-state-active');
							}

							if( $thisObject.is('.tier-1') ){
								$('li.ui-has-child ul',domObject).not($thisObject).slideUp('fast');
							}

							if( hasChild ){
								$('ul:first',$thisObject).slideDown('fast');
							}

							$thisObject.addClass('ui-state-active');
							$('.handle:first',$thisObject).addClass('ui-state-active');


							$.voCnd.getResults(); // Remember with new parameters we need to set page to 0
						}else{
						// Click off
							$(domObject).find('.cnd-button.cancel').show();

							// Remove the clicked item id
							var clickedItem = $thisObject.attr('rel');

							/*if(groupSettings.dataFormatSingle){
								$.voCnd.filterArray[groupName] = 0;
							}else{*/
								if((clearCategoryId = $.inArray(clickedItem,$.voCnd.filterArray[groupName])) != -1){
									$.voCnd.filterArray[groupName].splice(clearCategoryId,1);
								}
								if( $thisObject.is('.ui-has-child') ){
									$('ul',$thisObject).slideUp('fast');
								}
							//}
							$.voCnd.filterArray['page'] = 0;

							// Remove filter-cancel button
							if(groupSettings.dataFormatSingle || $.voCnd.filterArray[groupName].length  < 1){
								if($('.crumb-current',domObject).attr('rel')){
									/*if(groupSettings.dataFormatSingle){
										$.voCnd.filterArray[groupName] = $('.crumb-current',domObject).attr('rel');
									}else{*/
										$.voCnd.filterArray[groupName] = [$('.crumb-current',domObject).attr('rel')];
									//}
								}
								$(domObject).find('.cnd-button.cancel').hide();
							}

							// Set class to off
							$thisObject.removeClass('ui-state-active');
							$('.handle:first',$thisObject).removeClass('ui-state-active');
							$.voCnd.getResults(); // Remember with new parameters we need to set page to 0
						}
					}
				};

				this.reset =
					function( e )
					{
						$(this).hide();
						$('li.ui-state-active', domObject)
							.removeClass('ui-state-active');

						if($('.crumb-current',domObject).attr('rel')){
							/*if(groupSettings.dataFormatSingle){
								$.voCnd.filterArray[groupName] = $('.crumb-current',domObject).attr('rel');
							}else{*/
								$.voCnd.filterArray[groupName] = [$('.crumb-current',domObject).attr('rel')];
							//}
						}else{
							$.voCnd.filterArray[groupName] = [];
						}
						$.voCnd.getResults();
					};
				/**
				 * filterResults turns group items on or off based on returned panelFilter data.
				 */
				this.filterResults =
					function( groupFilter )
					{
/**/						// Hack: If results are filtered out, e.g. brand, then we need to remove them from query
						// and go get results again. This should be done on php side eventually
						var rerunResults = false;
						var $elementArray;
						if( groupSettings.ui != 'single_menu_dropdown' ){
							$elementArray = $('ul.cnd-list li', domObject);
						}else{
							// Handle <select> dropdown formatting here.
							$elementArray = $('select.cnd-select option', domObject);
						}

						if( typeof(groupFilter) == 'object' && groupFilter.length > 0 ){
							var typeCast = typeof(groupFilter[0]);
							$elementArray.each(function(i, item){
								// For instances where we use string as an ID.
								var itemId = ( typeCast == 'number' ? parseInt( $(item).attr('rel') ) : $(item).attr('rel') );
								if($.inArray(itemId, groupFilter) != -1){
									if(groupSettings.filterEffect == 'hide'){
										$(item).show();
										// This is only for the slide down hierarchy display method
										// Ideally for hierarchy child filter sends back
										// parents, if not, this will make sure the parent structure shows.
										$(item).parents('.'+groupName).show();
									}else{
										$(item).removeClass('ui-state-disabled');
										$(item).removeAttr('disabled');
									}
								}else{
									if(groupSettings.filterEffect == 'hide'){
										$(item).hide();
									}else{
										if($(item).attr('rel') != -1 ){
											$(item).addClass('ui-state-disabled');
											$(item).attr('disabled','disabled');
										}
									}

									// Remove filter ids
									if((clearCategoryId = $.inArray(itemId, $.voCnd.filterArray[groupName]) ) != -1){
										$.voCnd.filterArray[groupName].splice(clearCategoryId,1);
										rerunResults = true;
									}
								}
							});
						}else{
							if(groupFilter == 'showall'){
								if(groupSettings.filterEffect == 'hide'){
									$elementArray.show();
								}else{
									$elementArray.removeClass('ui-state-disabled');
									$elementArray.removeAttr('disabled');
								}
							}
						}
						if(rerunResults){ $.voCnd.getResults(); }
					};

				this.formatHierarchyMenuSlider =
				function( cid, data )
				{
					if(typeof($.voCnd.cache.panel[groupName]) != 'object'){

						$.voCnd.cache.panel[groupName] = (data.panel[groupName]['array'] ? data.panel[groupName]['array'] : data.panel[groupName] ); // cache the hierarchy
					}

					$('h3',domObject).prepend($('<span>'+groupSettings.displayName+'</span>'));

					var panelArray = (data.panel[groupName]['array'] ? data.panel[groupName]['array'] : data.panel[groupName] ); // Backward compat
					var fragment = document.createDocumentFragment();
					//////////////////////

					function printCategoryHierarchy( categoryArray, tier )
					{
						// If cid is set then start looking for the id
						if( typeof(retVal) != 'string' ){ var retVal = ''; };
						if( !tier ){ tier = 1; }

						$.each(categoryArray, function(key, category){
							var hasChildren = $(category.children).length > 0 ? true : false;
							retVal += '<li rel="'+category.id+'" class="'+groupName+' tier-'+tier+(hasChildren ? ' ui-has-child' : '')+'"><div class="handle">'+category.name+'</div>';

							if( hasChildren ){
								var i = tier + 1;
								retVal += '<ul'+( i > 1 ? ' style="display:none;"' : '' )+'>';
								retVal += printCategoryHierarchy( category.children, i );
								retVal += '</ul>';
							}
							retVal += '</li>';

						});

						return retVal;
					};

					var $categoryStructure = $(printCategoryHierarchy( panelArray ));

					// Activate any li's onload
					$.each($.voCnd.filterArray[groupName], function(key, filterId){
						$('li[rel='+filterId+']', $categoryStructure).addClass('ui-state-active')
							.find('.handle').addClass('ui-state-active')
							.parents('ul').show();
					});

					$('.cnd-list',domObject)
						.append( $categoryStructure )
						.find('div.handle').click( thisGroup.itemClick ).end();
				};

				this.formatHierarchyMenuPortal =
				function( cid, data )
				{
					// Initialize cache and breadcrumb dom here
					if(typeof($.voCnd.hierarchyArray[groupName]) != 'object'){

						$.voCnd.hierarchyArray[groupName] = (data.panel[groupName]['array'] ? data.panel[groupName]['array'] : data.panel[groupName] ); // cache the hierarchy

						$('h3',domObject).append('<span class="crumb-parent" />');
						$('h3',domObject).append('<span class="crumb-current" />');

						// Events

						// Current Category and Parent
						$('h3 span.crumb-parent',domObject).unbind('click').click(function(){
							/*if(groupSettings.dataFormatSingle){
								if($(this).attr('rel') > 0){
									$.voCnd.filterArray[groupName] = $(this).attr('rel');
								}else{
									$.voCnd.filterArray[groupName] = '';
								}
							}else{*/
								$.voCnd.filterArray[groupName] = [];
								if($(this).attr('rel') > 0){
									$.voCnd.filterArray[groupName].push($(this).attr('rel'));
								}
							//}

							$.voCnd.filterArray['page'] = 0;
							$(domObject).find('.cnd-button.cancel').hide();
							$.voCnd.getResults();
							thisGroup.formatHierarchyMenuPortal( $(this).attr('rel') );
							return false;
						});
					}

					function getCategoryStructure(categoryArray, cid, parentObject)
					{
					// first level if there will be no parent object, the return category array

						if(typeof(cid) == 'undefined' || cid == 0 ){
							return {'parent':null,'categoryArray':{'children':categoryArray}};
						}else{
						// If cid is set then start looking for the id
							if(typeof(retVal) != 'object'){ var retVal = {}; };
							$.each(categoryArray, function(key, category){
								if( category.id == cid ){
									parentObject = typeof(parentObject) == 'object' ? parentObject : null;

									// If this category has no children, then step back up the branch
									if($(category.children).length > 0){
										retVal = {'parent':parentObject,'categoryArray':category};
									}else{
										if(parentObject != null){
											retVal = {'parent':parentObject.parentObject,'categoryArray':parentObject};
										}else{
											retVal = {'parent':null,'categoryArray':{'children':categoryArray}};
										}
									}
									return false;
								}else{

									if( $(category.children).length > 0 && typeof(retVal.categoryArray) != 'object' ){
										var parent = category;
										parent.id = category.id;
										parent.parentObject = parentObject; // (parent's parent) allows for stepping back up the branch
										retVal = getCategoryStructure(category.children, cid, parent);
									}
								}
							});

							return retVal;
						}
					};

					var categoryStructure = getCategoryStructure($.voCnd.hierarchyArray[groupName],cid);

					var category = categoryStructure.categoryArray;
					var parent = categoryStructure.parent ? categoryStructure.parent : null;

						if(cid > 0){
							// $.voMessage.debug(category.name);
							if(category.name){
								$('h3 span.crumb-current',domObject).html('&gt; '+category.name).attr('rel',category.id).css('display','block');
							}
						}else{
							$('h3 span.crumb-current',domObject).empty().removeAttr('rel').hide();
						}

						if(parent){
							$('h3 span.crumb-parent',domObject).text(parent.name).attr('rel',parent.id);
						}else{

							$('h3 span.crumb-parent',domObject).text(groupSettings.displayName).attr('rel',0);
						}

						$('li',domObject).remove();
						if( category.children ){
							var fragment = document.createDocumentFragment();

							$.each(category.children, function(i,child){

								var newList = $('<li rel=\"'+child.id+'\" class="'+groupName+' ui-state-default"><span>'+child.name+'</span></li>');

								//if(!groupSettings.dataFormatSingle){
									if($.inArray(child.id,$.voCnd.filterArray[groupName]) != -1){
										newList.addClass('ui-state-active');
										if(!groupSettings.dataFormatSingle){
											$(domObject).find('.cnd-button.cancel').show();
										}
									}
								/*}else{
									if(child.id == $.voCnd.filterArray[groupName]){
										newList.addClass('ui-state-active');
										$(domObject).find('.cnd-button.cancel').show();
									}
								}*/

								if($(child.children).length > 0 ){
									newList.click(function(){
									// If the single data format is set, then set the ajax data as a string rather than an array
										/*if(groupSettings.dataFormatSingle){
											$.voCnd.filterArray[groupName] = $(this).attr('rel');
										}else{*/
											$.voCnd.filterArray[groupName] = [];
											$.voCnd.filterArray[groupName].push($(this).attr('rel'));
										//}
										$.voCnd.filterArray['page'] = 0;
										//$.voMessage.debug($.voCnd.filterArray[groupName]);
										$.voCnd.getResults();
										thisGroup.formatHierarchyMenuPortal($(this).attr('rel'));
										//
										$('.cnd-list li.ui-state-active',domObject).removeClass('ui-state-active');
										$('.cnd-list li[rel='+$(this).attr('rel')+']',domObject).unbind('hover').removeClass('ui-state-hover').addClass('ui-state-active');
										return false;
									});
								}else{
									// Removing the parent only matters on array formatted ajax data
									if(!groupSettings.dataFormatSingle){
										// !! Important, remove the parent id from the array.
										if((clearParent = $.inArray(category.id,$.voCnd.filterArray[groupName])) != -1){
											$.voCnd.filterArray[groupName].splice(clearParent,1);
										}
									}
									newList.click(thisGroup.itemClick);
								}
								fragment.appendChild( newList.get(0) );
							});

							$('.cnd-list', domObject).append( fragment );
						}
				};

				this.formatSingleDimension =
					function( data )
					{
						if(typeof($.voCnd.cache.panel[groupName]) != 'object'){
							$.voCnd.cache.panel[groupName] = (data.panel[groupName]['array'] ? data.panel[groupName]['array'] : data.panel[groupName] ); // cache the hierarchy
						}
						$('h3',domObject).prepend($('<span>'+groupSettings.displayName+'</span>'));

						if( groupSettings.description ){
							$('h3',domObject).after('<p>'+groupSettings.description+'</p>');
						}

						var panelArray = (data.panel[groupName]['array'] ? data.panel[groupName]['array'] : data.panel[groupName] ); // Backward compat
						var fragment = document.createDocumentFragment();

						$.each(panelArray, function( liKey, liData ){
							var newList = $('<li rel=\"'+liData.id+'\" class="'+groupName+' ui-state-default"><span>'+liData.name+'</span></li>');

							// For onload, if the id is in the filterArray, the add an active state
							if($.inArray( liData.id, $.voCnd.filterArray[groupName] ) != -1){
								newList.addClass('ui-state-active');
							}

							// NOT SURE why this code was hid conditionally on the data format being single.
							// Keep it around for a while until I remember whay I did this..
							/*if( ! groupSettings.dataFormatSingle ){
								if($.inArray( liKey, $.voCnd.filterArray[groupName] ) != -1){
									newList.addClass('ui-state-active');
									$(domObject).find('.cnd-button.cancel').show();
								}
							}*/
							$(newList).click( thisGroup.itemClick );
							fragment.appendChild( newList.get(0) );
						});

						$('.cnd-list',domObject).append( fragment );
					};

				this.formatSingleDimensionDropdown =
					function( data )
					{
						if(typeof($.voCnd.cache.panel[groupName]) != 'object'){
							$.voCnd.cache.panel[groupName] = (data.panel[groupName]['array'] ? data.panel[groupName]['array'] : data.panel[groupName] ); // cache the hierarchy
						}
						$('h3',domObject).prepend($('<span>'+groupSettings.displayName+'</span>'));
						if( groupSettings.description ){
							$('h3',domObject).after('<p>'+groupSettings.description+'</p>');
						}

						var panelArray = (data.panel[groupName]['array'] ? data.panel[groupName]['array'] : data.panel[groupName] ); // Backward compat
						var fragment = document.createDocumentFragment();

						$.each(panelArray, function( liKey, liData ){
							var newList = $('<option rel=\"'+liData.id+'\" class="'+groupName+' ui-state-default">'+liData.name+'</option>');

							// For onload, if the id is in the filterArray, the add an active state
							if($.inArray( liKey, $.voCnd.filterArray[groupName] ) != -1){
								newList.addClass('ui-state-active');
							}

							//$(newList).click( thisGroup.itemClick );
							fragment.appendChild( newList.get(0) );
						});

						$('.cnd-select',domObject).append( fragment );
					};

				return this;
			},

		'setInterface' :
			function(data, status)
			{
				$.voCnd.resultTotal = data.resultTotal;
				$.voCnd.setPagination();

			// Set panel dynamically from ajax feed
				$.each(data.panel, function(groupName, groupSettings){
					$.voCnd.setPanelGroup({
						'group':groupName,
						'displayName':groupSettings.display_name,
						'description':groupSettings.description,
						'optionLabel':groupSettings.option_label,
						'ui':(groupSettings.type ? groupSettings.type : 'single_menu'), // single_menu, hierarchy_menu_slider, hierarchy_menu_portal, range_slider
						'multiDimension':(groupSettings.multi_dimension ? groupSettings.multi_dimension : 0),
						'dataFormatSingle':(groupSettings.filter_select_limit ? 1 : 0),
						'filter':(groupSettings.filter_panel ? 1 : 0),
						'filterEffect':(groupSettings.filter_effect ? groupSettings.filter_effect : 'disable')
					});
				});

				// Set a live event here that will handle dropdown menus
				if($.isFunction($.fn.on)){
					$($.voCnd.settings.panel).on('change','.cnd-select',function(){
						var thisID = $(':selected',this).attr('rel');
						if( thisID != -1 ){
							$.voCnd.filterArray[$(this).data('group-name')] = [thisID];
						}else{
							$.voCnd.filterArray[$(this).data('group-name')] = [];
						}

						$.voCnd.getResults();
					});
				}else{
					$.log('The $.fn.on() function is not supported. Upgrade jQuery to 1.7 or higher.');
				}

				// Set Each Panel Group
				var fragment = document.createDocumentFragment();
				$.each(data.panel, function(groupName){
					var groupSettings = $.voCnd.panelGroups[groupName];

					if( typeof($.voCnd.filterArray[groupName]) != 'object'){
						groupSettings.defaultValue = $.voCnd.filterArray[groupName] ? $.voCnd.filterArray[groupName] : [];
						$.voCnd.filterArray[groupName] = $.voCnd.filterArray[groupName] ? $.voCnd.filterArray[groupName] : [];
					}
					// else{
						//groupSettings.defaultValue = $.voCnd.filterArray[groupName] ? $.voCnd.filterArray[groupName] : "";
						//$.voCnd.filterArray[groupName] = $.voCnd.filterArray[groupName] ? $.voCnd.filterArray[groupName] : "";
					//}*/

					object = $('<div id="cnd-'+ groupName +'" class="cnd-header" />');
					groupObject = new $.voCnd.group( object, groupName, groupSettings );

					$('li',object).remove();
					var collapseButton = $('<div class="ui-state-default ui-corner-all cnd-button collapse"><span class="ui-icon ui-icon-triangle-1-s" /></div>')
											.toggle(groupObject.menuClose, groupObject.menuOpen );
					var cancelButton = $('<div class="ui-state-default ui-corner-all cnd-button cancel"><span class="ui-icon ui-icon-cancel" /></div>')
											.hide()
											.bind('click',groupObject.reset);

					$('<h3 />')
						.addClass('ui-corner-all')
						//.text( groupSettings.displayName ) for now I am doing this in the singleDim and multiDim functions
						.appendTo(object)
						.append(cancelButton)
						.append(collapseButton);

					// Load group's item list
					switch( groupSettings.ui ){
						case 'single_menu':
							$('<ul class="cnd-list"></ul>').appendTo(object);
							groupObject.formatSingleDimension( data );
						break;

						case 'single_menu_dropdown':
							var option_default = groupSettings.optionLabel ? groupSettings.optionLabel : ' --- Choose '+groupSettings.displayName+' --- ';
							$('<select class="cnd-select"><option rel="-1">'+option_default+'</option></select>').data('group-name',groupName).appendTo(object);
							groupObject.formatSingleDimensionDropdown( data );
						break;

						case 'hierarchy_menu_slider':
							$('<ul class="cnd-list"></ul>').appendTo(object);
							groupObject.formatHierarchyMenuSlider((groupSettings.defaultValue ? groupSettings.defaultValue : 0), data);
						break;

						case 'hierarchy_menu_portal':
							$('<ul class="cnd-list"></ul>').appendTo(object);
							groupObject.formatHierarchyMenuPortal((groupSettings.defaultValue ? groupSettings.defaultValue : 0), data);
						break;

						case 'range_slider':
							//
						break;
					}

					if(typeof(data.panelFilter[groupName]) == 'object' || data.panelFilter[groupName] == 'showall'){
						object.show();
						if(groupSettings.filter){
							groupObject.filterResults( data.panelFilter[groupName] );
						}
					}else{
						object.hide();
					}
					fragment.appendChild( object.get(0) );
				});

				$($.voCnd.settings.panel).empty().append(fragment);

				// Set Content
				if( $.voCnd.settings.initContent ){
					$.voCnd.setContent(data.content);
				}
				$('.waiting-for-results').hide();
				$($.voCnd.settings.contentDom).fadeIn('fast');
			},
		'waitingForResults' :
			function()
			{
				$($.voCnd.settings.contentDom).hide();
				$('.no-results').hide();
				$('.waiting-for-results').show();
			},

		'filterResults' :
			function( data )
			{
				$.voCnd.resultTotal = data.resultTotal;
				$.voCnd.setPaginationMessage();
				// Set Each Panel Group
				$.each($.voCnd.panelGroups, function(groupName, groupSettings){
					var groupObject = new $.voCnd.group( $('#cnd-'+ groupName), groupName, groupSettings );
					if(typeof(data.panelFilter[groupName]) == 'object' || data.panelFilter[groupName] == 'showall'){
						$('#cnd-'+ groupName).show();
						if(groupSettings.filter){
							groupObject.filterResults( data.panelFilter[groupName] );
						}
					}else{
						$('#cnd-'+ groupName).hide();
					}
				});

				// Set Content
				$('.waiting-for-results').hide();
				// Slower but more flexible for interface developers
				if(data.content_html){
					$($.voCnd.settings.contentDom).replaceWith($(data.content_html).filter('ul'));
				}else{
				// Faster because unformatted Json data is sent and is formatted by javascript.
					$.voCnd.setContent(data.content);
				}
				//$($.voCnd.settings.contentDom).fadeIn('fast');
			},

		'setContent':
			function( content )
			{
			var thisObject = this;
				var $rowTemplate = $(thisObject.settings.contentDom).comments();
				$(thisObject.settings.contentDomRow,thisObject.settings.contentDom).remove();

				if($(content).length > 0 ){
					$('.no-results').hide();
					var fragment = document.createDocumentFragment();
					$.each(content, function(key, contentItem){
						// Set list display
							var $newRow = $rowTemplate.clone();
							$newRow.setDataDisplay( contentItem );
							$.voCnd.customContentFunction( key, contentItem, $newRow );
							fragment.appendChild($newRow.get(0));
					});

					$(thisObject.settings.contentDom).append( fragment );

					$($.voCnd.settings.contentDom).fadeIn('fast');
				}else{
					$('.no-results').show();
				}
			}
	};
	
	$.voSlugFormat = function( slug )
	{
		var newSlug = slug.replace(/[^a-zA-Z0-9\s\-]/g,'');
		newSlug = newSlug.trim().replace(/\s+/g,'-');
		return newSlug.toLowerCase();
	};
})(jQuery);

// ## MONEY FORMATTING ## //
function isThousands( position )
{
	if (Math.floor(position/3)*3==position) return true;
	return false;
};

function formatMoney(theNumber,theCurrency,theThousands,theDecimal)
{
	theNumber = parseFloat(theNumber);
	
	if( !isNaN(theNumber) ){
	theNumber = parseFloat(theNumber);
	var theOutput = theCurrency;
	if( theNumber >= 0 ){
		var theDecimalDigits = Math.round((theNumber*100)-(Math.floor(theNumber)*100));
		theDecimalDigits= ""+ (theDecimalDigits + "0").substring(0,2);
		theNumber = ""+Math.floor(theNumber);
		
	}else{
		var theDecimalDigits = Math.abs(Math.round((theNumber*100)-(Math.ceil(theNumber)*100)));
		theDecimalDigits= ""+ (theDecimalDigits + "0").substring(0,2);
		theNumber = ""+Math.abs(Math.ceil(theNumber));
		theOutput += "-"; 
	}
	
	for (x=0; x<theNumber.length; x++) {
		theOutput += theNumber.substring(x,x+1);
		if (isThousands(theNumber.length-x-1) && (theNumber.length-x-1!=0)) {
			theOutput += theThousands;
		};
	};
	
	theOutput += theDecimal + theDecimalDigits;
	}else{
		theOutput = +'0.00';
	}
	return theOutput;
};