function isThousands(e){if(Math.floor(e/3)*3==e)return true;return false}function formatMoney(e,t,n,r){e=parseFloat(e);if(!isNaN(e)){e=parseFloat(e);var i=t;if(e>=0){var s=Math.round(e*100-Math.floor(e)*100);s=""+(s+"0").substring(0,2);e=""+Math.floor(e)}else{var s=Math.abs(Math.round(e*100-Math.ceil(e)*100));s=""+(s+"0").substring(0,2);e=""+Math.abs(Math.ceil(e));i+="-"}for(x=0;x<e.length;x++){i+=e.substring(x,x+1);if(isThousands(e.length-x-1)&&e.length-x-1!=0){i+=n}}i+=r+s}else{i=+"0.00"}return i}(function($){function toIntegersAtLease(e){return e<10?"0"+e:e}Date.prototype.toJSON=function(e){return this.getUTCFullYear()+"-"+toIntegersAtLease(this.getUTCMonth())+"-"+toIntegersAtLease(this.getUTCDate())};var escapeable=/["\\\x00-\x1f\x7f-\x9f]/g;var meta={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};$.quoteString=function(e){if(escapeable.test(e)){return'"'+e.replace(escapeable,function(e){var t=meta[e];if(typeof t==="string"){return t}t=e.charCodeAt();return"\\u00"+Math.floor(t/16).toString(16)+(t%16).toString(16)})+'"'}return'"'+e+'"'};$.toJSON=function(e,t){var n=typeof e;if(n=="undefined")return"undefined";else if(n=="number"||n=="boolean")return e+"";else if(e===null)return"null";if(n=="string"){return $.quoteString(e)}if(n=="object"&&typeof e.toJSON=="function")return e.toJSON(t);if(n!="function"&&typeof e.length=="number"){var r=[];for(var i=0;i<e.length;i++){r.push($.toJSON(e[i],t))}if(t)return"["+r.join(",")+"]";else return"["+r.join(", ")+"]"}if(n=="function"){throw new TypeError("Unable to convert object of type 'function' to json.")}var r=[];for(var s in e){var o;n=typeof s;if(n=="number")o='"'+s+'"';else if(n=="string")o=$.quoteString(s);else continue;var u=$.toJSON(e[s],t);if(typeof u!="string"){continue}if(t)r.push(o+":"+u);else r.push(o+": "+u)}return"{"+r.join(", ")+"}"};$.compactJSON=function(e){return $.toJSON(e,true)};$.evalJSON=function(src){return eval("("+src+")")};$.secureEvalJSON=function(src){var filtered=src;filtered=filtered.replace(/\\["\\\/bfnrtu]/g,"@");filtered=filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]");filtered=filtered.replace(/(?:^|:|,)(?:\s*\[)+/g,"");if(/^[\],:{}\s]*$/.test(filtered))return eval("("+src+")");else throw new SyntaxError("Error parsing JSON, source is not valid.")}})(jQuery);var sabramediaSpinnerSmall='<span class="pending-spinner"></span>';String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")};String.prototype.ltrim=function(){return this.replace(/^\s+/,"")};String.prototype.rtrim=function(){return this.replace(/\s+$/,"")};(function(e){function t(t){var n=[];var r;e.each(t,function(e,t){n.push(e+"="+escape(t))});r=n.join("&");return r}function n(t){var n=[];var r;e.each(t,function(e,t){n[t.name]=t.value});r=n;return r}e.voAjax=function(n,r){function i(){var r="";if(n.dataContainer){r+=e(n.dataContainer).serializeRowData()}if(n.dataObject){if(n.dataContainer){r+="&"}r+=t(n.dataObject)}return r}function s(t){if(n.spinner){e(r).after(sabramediaSpinnerSmall)}var i=true;if(n.verifyAction){i=confirm(n.verifyAction)}if(!i){return false}if(n.beforeSend){e.each(n.beforeSend,function(e,n){n(t,r)})}}function o(t,i){e(".pending-spinner").remove();if(n.success){e.each(n.success,function(n,s){if(e.isFunction(s)){s(t,i,r)}})}else{}if(t.warning){e.voMessage.alert(t.warning)}if(t.message){e.voMessage.dock(t.message)}}function u(t,r){if(n.complete){e.each(n.complete,function(n,i){if(e.isFunction(i)){i(t,r)}})}}if(typeof tinyMCE!="undefined"){}if(typeof editAreaLoader!="undefined"){e("textarea#content-js").append(editAreaLoader.getValue("content-js"))}return e.ajax({type:"POST",url:n.actionController,dataType:"json",data:i(),beforeSend:s,success:o,complete:u,global:n.global})};e.fn.serializeRowData=function(){var n="";if(e.metadata){e.metadata.setType("attr","data-json");jsonObject=e("[data-json]",this).andSelf().metadata();n+=t(jsonObject)+"&"}if(e(this).data("postdata")){n+=t(e(this).data("postdata"))+"&"}var r=e(this).find(":input");var i=n+r.serialize();return i};e.fn.setDataDisplay=function(t){if(t){object=e(this);e.each(t,function(t,n){if(typeof n!="object"){var r=e("."+t,object).attr("type");if(e("."+t,object).is("select")){r="select"}switch(r){case"text":e("."+t,object).val(n);break;case"textarea":e("."+t,object).val(n);break;case"radio":var i=e(':radio[name="'+t+'"][value="'+n+'"]',object);if(i.length){i.attr("checked","checked")}break;case"checkbox":if(n==true){n=1}if(n==false){n=0}if(n){e("."+t,object).attr("checked","checked")}else{e("."+t,object).removeAttr("checked")}break;case"select":e("."+t+' option[value="'+n+'"]',object).attr("selected","selected");break;default:e("."+t,object).text(n);break}}});return this}};e.fn.setDataDisplayHTML5=function(t,n){if(t){object=e(this);e.each(t,function(t,r){if(typeof r!="object"){var i=!n?'[data-field-name="'+t+'"]':'[name="'+t+'"]';e(i,object).each(function(n,i){var s=e(i,object).attr("type");if(e(i,object).is("select")){s="select"}switch(s){case"text":e(i,object).val(r);break;case"textarea":e(i,object).val(r);break;case"radio":var o=e(':radio[name="'+t+'"][value="'+r+'"]',object);if(o.length){o.attr("checked","checked")}break;case"checkbox":if(r==true){r=1}if(r==false){r=0}if(r){e(i,object).attr("checked","checked")}else{e(i,object).removeAttr("checked")}break;case"select":e(i,object).find('option[value="'+r+'"]').attr("selected","selected");break;case"hidden":e(i,object).val(r);break;default:e(i,object).text(r);break}})}});return this}};e.extend({voMessage:{alert:function(t){var n=Math.floor(Math.random()*11);var r=e('<div id="vo-dialog'+n+'" />');r.append('<span class="ui-icon ui-icon-alert" style="float:left; margin:2px 7px 20px 0;"></span>'+t);r.appendTo("body");r.dialog({title:"Virtual Office Alert",bgiframe:true,resizable:false,height:200,width:300,modal:true,overlay:{backgroundColor:"#000",opacity:.5},buttons:{Ok:function(){e(this).dialog("close");e(this).dialog("destroy");e("#vo-dialog"+n).remove()}}})},dock:function(t){e("#dock-container").hide();e("#dock-container #ajax-message").empty().append(t);e("#dock-container").fadeIn("normal");setTimeout("$('#dock-container').fadeOut('slow')",4e3)},debug:function(e){if(window.console){console.log(e)}else{if(typeof e!="string"){e="Your browser doesn't support advanced debugging. Try Firefox and Firebug!"}}}},log:function(t){e.voMessage.debug(t)}});e.fn.comments=function(t){var t=t||false;var n=e([]);this.each(function(r,i){var s=i.firstChild;var o=e(this).attr("id");while(s){if(s.nodeType===8){n=n.add(s.nodeValue)}else if(t&&s.nodeType===1){n=n.add(e(s).comments(true))}s=s.nextSibling}});return n};e.fn.compare=function(e){if(this.length!=e.length){return false}var t=this.sort(),n=e.sort();for(var r=0;e[r];r++){if(t[r]!==n[r]){return false}}return true};e.voCnd={settings:{controller:null,panel:"#cnd-navigation",pagination:".cnd-pagination",contentDom:"",contentDomRow:"",filterPanel:0,initContent:1,slideUpOnPaginate:1},hierarchyArray:{},cache:{panel:{}},filterArray:{},data:{},panelGroups:{},customContentFunction:{},ajaxCompleteFunction:function(e,t){},resultTotal:"",_currentXhr:null,init:function(){e.voCnd.filterArray["init"]=1;e.voAjax({actionController:e.voCnd.settings.controller,dataObject:e.extend(e.voCnd.data,{"vo-action":"init",filter_conditions:e.toJSON(e.voCnd.filterArray)}),beforeSend:[e.voCnd.ajaxBeforeSend,e.voCnd.waitingForResults],success:[e.voCnd.ajaxSuccessFunction,e.voCnd.setInterface],complete:[e.voCnd.ajaxCompleteFunction]});e.voCnd.filterArray["init"]=0},setPaginationMessage:function(){if(e.voCnd.resultTotal){var t=Math.ceil(e.voCnd.resultTotal/e.voCnd.filterArray["limit"]);var n=e.voCnd.filterArray["page"]+1;e("span.results .current-page",e.voCnd.settings.pagination).text(n);e("span.results .total-page",e.voCnd.settings.pagination).text(t);e("span.results .total-item",e.voCnd.settings.pagination).text(e.voCnd.resultTotal);if(e.voCnd.filterArray["page"]==0){e("button.previous",e.voCnd.settings.pagination).hide()}else{e("button.previous",e.voCnd.settings.pagination).show()}if(t==1||t==n){e("button.next",e.voCnd.settings.pagination).hide();if(t==1){e(e.voCnd.settings.pagination).hide()}}else{e("button.next",e.voCnd.settings.pagination).show();e(e.voCnd.settings.pagination).show()}}},setPagination:function(){if(!e.voCnd.filterArray["page"]){e.voCnd.filterArray["page"]=0}e.voCnd.setPaginationMessage();e("button",e.voCnd.settings.pagination).unbind("click").click(function(t){if(e.voCnd.settings.slideUpOnPaginate){var n=e(e.voCnd.settings.pagination).offset();e("html, body").animate({scrollTop:n.top},"slow")}var r=e.voCnd.resultTotal?e.voCnd.resultTotal:e(e.voCnd.settings.pagination+":first .total-item").text();if(e(t.currentTarget).is(".previous")){var i=e.voCnd.filterArray["page"]-1;if(i+1>0){e.voCnd.filterArray["page"]=i}else{e.voCnd.filterArray["page"]=Math.floor(r/e.voCnd.filterArray["limit"])}e.voCnd.getResults()}else{var s=e.voCnd.filterArray["page"]+1;if(s*e.voCnd.filterArray["limit"]<r){e.voCnd.filterArray["page"]=s}else{e.voCnd.filterArray["page"]=0}e.voCnd.getResults()}e.voCnd.setPaginationMessage()})},setPostData:function(t,n){e.voCnd.data[t]=n},setFilterPanel:function(t){e.voCnd.settings.filterPanel=t},setLimit:function(t){if(t){e.voCnd.filterArray.limit=t}else if(!isNaN(parseInt(e("#pagination-limit",e.voCnd.settings.pagination).text()))){e.voCnd.filterArray.limit=parseInt(e("#pagination-limit",e.voCnd.settings.pagination).text())}else{e.voCnd.filterArray.limit=12}},getResults:function(){if(e.voCnd._currentXhr){e.voCnd._currentXhr.abort()}e.voCnd._currentXhr=e.voAjax({actionController:e.voCnd.settings.controller,dataObject:e.extend(e.voCnd.data,{"vo-action":null,filter_conditions:e.toJSON(e.voCnd.filterArray)}),beforeSend:[e.voCnd.ajaxBeforeSend,e.voCnd.waitingForResults],success:[e.voCnd.ajaxSuccessFunction,e.voCnd.filterResults],complete:[e.voCnd.ajaxCompleteFunction]})},reset:function(){e.each(e.voCnd.filterArray,function(t,n){if(e.inArray(t,["page","limit","init"])==-1){e.voCnd.filterArray[t]=[]}});e(e.voCnd.settings.panel+" .ui-state-active").removeClass("ui-state-active");e(e.voCnd.settings.panel+" option:selected").removeAttr("selected");e.voCnd.filterArray["page"]=0;e.voCnd.getResults()},setController:function(t){e.voCnd.settings.controller=t},setContentDom:function(t,n){e.voCnd.settings.contentDom=t;e.voCnd.settings.contentDomRow=n},preload:function(){},setPanelGroup:function(t){e.voCnd.panelGroups[t.group]=e.extend({displayName:t.displayName?t.displayName:t.group,description:t.description,optionLabel:t.optionLabel,ui:t.ui,multiDimension:t.multiDimension?1:0,dataFormatSingle:t.dataFormatSingle,filter:t.filter,filterEffect:t.filterEffect},e.voCnd.panelGroups[t.group]||{})},setGroupDefault:function(t,n){if(typeof e.voCnd.filterArray[t]!="object"){e.voCnd.filterArray[t]=[]}e.voCnd.filterArray[t].push(n);e.voCnd.panelGroups[t]=e.extend({defaultValue:n},e.voCnd.panelGroups[t]||{})},group:function(t,n,r){var i=this;this.menuClose=function(n){e("h3 span",t).removeClass("ui-icon-triangle-1-s");e("h3 span",t).addClass("ui-icon-triangle-1-e");e(".cnd-list",t).slideUp("fast")};this.menuOpen=function(n){e("h3 span",t).removeClass("ui-icon-triangle-1-e");e("h3 span",t).addClass("ui-icon-triangle-1-s");e(".cnd-list",t).slideDown("fast")};this.itemClick=function(i){var s=e(this).closest("li");var o=s.is(".ui-has-child");if(s.is(".ui-state-disabled")){i.stopPropagation()}else{if(!s.is(".ui-state-active")){if(r.dataFormatSingle){e.voCnd.filterArray[n]=[s.attr("rel")];e(t).find(".cnd-button.cancel").show()}else{if((clearItemId=e.inArray(e(".crumb-current",t).attr("rel"),e.voCnd.filterArray[n]))!=-1){e.voCnd.filterArray[n].splice(clearItemId,1)}e.voCnd.filterArray[n].push(s.attr("rel"));if(e.voCnd.filterArray[n].length>0){e(t).find(".cnd-button.cancel").show()}}e.voCnd.filterArray["page"]=0;if(r.dataFormatSingle){e("li",t).removeClass("ui-state-active");e(".handle",t).removeClass("ui-state-active")}if(s.is(".tier-1")){e("li.ui-has-child ul",t).not(s).slideUp("fast")}if(o){e("ul:first",s).slideDown("fast")}s.addClass("ui-state-active");e(".handle:first",s).addClass("ui-state-active");e.voCnd.getResults()}else{e(t).find(".cnd-button.cancel").show();var u=s.attr("rel");if((clearCategoryId=e.inArray(u,e.voCnd.filterArray[n]))!=-1){e.voCnd.filterArray[n].splice(clearCategoryId,1)}if(s.is(".ui-has-child")){e("ul",s).slideUp("fast")}e.voCnd.filterArray["page"]=0;if(r.dataFormatSingle||e.voCnd.filterArray[n].length<1){if(e(".crumb-current",t).attr("rel")){e.voCnd.filterArray[n]=[e(".crumb-current",t).attr("rel")]}e(t).find(".cnd-button.cancel").hide()}s.removeClass("ui-state-active");e(".handle:first",s).removeClass("ui-state-active");e.voCnd.getResults()}}};this.reset=function(r){e(this).hide();e("li.ui-state-active",t).removeClass("ui-state-active");if(e(".crumb-current",t).attr("rel")){e.voCnd.filterArray[n]=[e(".crumb-current",t).attr("rel")]}else{e.voCnd.filterArray[n]=[]}e.voCnd.getResults()};this.filterResults=function(i){var s=false;var o;if(r.ui!="single_menu_dropdown"){o=e("ul.cnd-list li",t)}else{o=e("select.cnd-select option",t)}if(typeof i=="object"&&i.length>0){var u=typeof i[0];o.each(function(t,o){var a=u=="number"?parseInt(e(o).attr("rel")):e(o).attr("rel");if(e.inArray(a,i)!=-1){if(r.filterEffect=="hide"){e(o).show();e(o).parents("."+n).show()}else{e(o).removeClass("ui-state-disabled");e(o).removeAttr("disabled")}}else{if(r.filterEffect=="hide"){e(o).hide()}else{if(e(o).attr("rel")!=-1){e(o).addClass("ui-state-disabled");e(o).attr("disabled","disabled")}}if((clearCategoryId=e.inArray(a,e.voCnd.filterArray[n]))!=-1){e.voCnd.filterArray[n].splice(clearCategoryId,1);s=true}}})}else{if(i=="showall"){if(r.filterEffect=="hide"){o.show()}else{o.removeClass("ui-state-disabled");o.removeAttr("disabled")}}}if(s){e.voCnd.getResults()}};this.formatHierarchyMenuSlider=function(s,o){function f(t,r){if(typeof i!="string"){var i=""}if(!r){r=1}e.each(t,function(t,s){var o=e(s.children).length>0?true:false;i+='<li rel="'+s.id+'" class="'+n+" tier-"+r+(o?" ui-has-child":"")+'"><div class="handle">'+s.name+"</div>";if(o){var u=r+1;i+="<ul"+(u>1?' style="display:none;"':"")+">";i+=f(s.children,u);i+="</ul>"}i+="</li>"});return i}if(typeof e.voCnd.cache.panel[n]!="object"){e.voCnd.cache.panel[n]=o.panel[n]["array"]?o.panel[n]["array"]:o.panel[n]}e("h3",t).prepend(e("<span>"+r.displayName+"</span>"));var u=o.panel[n]["array"]?o.panel[n]["array"]:o.panel[n];var a=document.createDocumentFragment();var l=e(f(u));e.each(e.voCnd.filterArray[n],function(t,n){e("li[rel="+n+"]",l).addClass("ui-state-active").find(".handle").addClass("ui-state-active").parents("ul").show()});e(".cnd-list",t).append(l).find("div.handle").click(i.itemClick).end()};this.formatHierarchyMenuPortal=function(s,o){function u(t,n,r){if(typeof n=="undefined"||n==0){return{parent:null,categoryArray:{children:t}}}else{if(typeof i!="object"){var i={}}e.each(t,function(s,o){if(o.id==n){r=typeof r=="object"?r:null;if(e(o.children).length>0){i={parent:r,categoryArray:o}}else{if(r!=null){i={parent:r.parentObject,categoryArray:r}}else{i={parent:null,categoryArray:{children:t}}}}return false}else{if(e(o.children).length>0&&typeof i.categoryArray!="object"){var a=o;a.id=o.id;a.parentObject=r;i=u(o.children,n,a)}}});return i}}if(typeof e.voCnd.hierarchyArray[n]!="object"){e.voCnd.hierarchyArray[n]=o.panel[n]["array"]?o.panel[n]["array"]:o.panel[n];e("h3",t).append('<span class="crumb-parent" />');e("h3",t).append('<span class="crumb-current" />');e("h3 span.crumb-parent",t).unbind("click").click(function(){e.voCnd.filterArray[n]=[];if(e(this).attr("rel")>0){e.voCnd.filterArray[n].push(e(this).attr("rel"))}e.voCnd.filterArray["page"]=0;e(t).find(".cnd-button.cancel").hide();e.voCnd.getResults();i.formatHierarchyMenuPortal(e(this).attr("rel"));return false})}var a=u(e.voCnd.hierarchyArray[n],s);var f=a.categoryArray;var l=a.parent?a.parent:null;if(s>0){if(f.name){e("h3 span.crumb-current",t).html("> "+f.name).attr("rel",f.id).css("display","block")}}else{e("h3 span.crumb-current",t).empty().removeAttr("rel").hide()}if(l){e("h3 span.crumb-parent",t).text(l.name).attr("rel",l.id)}else{e("h3 span.crumb-parent",t).text(r.displayName).attr("rel",0)}e("li",t).remove();if(f.children){var c=document.createDocumentFragment();e.each(f.children,function(s,o){var u=e('<li rel="'+o.id+'" class="'+n+' ui-state-default"><span>'+o.name+"</span></li>");if(e.inArray(o.id,e.voCnd.filterArray[n])!=-1){u.addClass("ui-state-active");if(!r.dataFormatSingle){e(t).find(".cnd-button.cancel").show()}}if(e(o.children).length>0){u.click(function(){e.voCnd.filterArray[n]=[];e.voCnd.filterArray[n].push(e(this).attr("rel"));e.voCnd.filterArray["page"]=0;e.voCnd.getResults();i.formatHierarchyMenuPortal(e(this).attr("rel"));e(".cnd-list li.ui-state-active",t).removeClass("ui-state-active");e(".cnd-list li[rel="+e(this).attr("rel")+"]",t).unbind("hover").removeClass("ui-state-hover").addClass("ui-state-active");return false})}else{if(!r.dataFormatSingle){if((clearParent=e.inArray(f.id,e.voCnd.filterArray[n]))!=-1){e.voCnd.filterArray[n].splice(clearParent,1)}}u.click(i.itemClick)}c.appendChild(u.get(0))});e(".cnd-list",t).append(c)}};this.formatSingleDimension=function(s){if(typeof e.voCnd.cache.panel[n]!="object"){e.voCnd.cache.panel[n]=s.panel[n]["array"]?s.panel[n]["array"]:s.panel[n]}e("h3",t).prepend(e("<span>"+r.displayName+"</span>"));if(r.description){e("h3",t).after("<p>"+r.description+"</p>")}var o=s.panel[n]["array"]?s.panel[n]["array"]:s.panel[n];var u=document.createDocumentFragment();e.each(o,function(t,r){var s=e('<li rel="'+r.id+'" class="'+n+' ui-state-default"><span>'+r.name+"</span></li>");if(e.inArray(r.id,e.voCnd.filterArray[n])!=-1){s.addClass("ui-state-active")}e(s).click(i.itemClick);u.appendChild(s.get(0))});e(".cnd-list",t).append(u)};this.formatSingleDimensionDropdown=function(i){if(typeof e.voCnd.cache.panel[n]!="object"){e.voCnd.cache.panel[n]=i.panel[n]["array"]?i.panel[n]["array"]:i.panel[n]}e("h3",t).prepend(e("<span>"+r.displayName+"</span>"));if(r.description){e("h3",t).after("<p>"+r.description+"</p>")}var s=i.panel[n]["array"]?i.panel[n]["array"]:i.panel[n];var o=document.createDocumentFragment();e.each(s,function(t,r){var i=e('<option rel="'+r.id+'" class="'+n+' ui-state-default">'+r.name+"</option>");if(e.inArray(t,e.voCnd.filterArray[n])!=-1){i.addClass("ui-state-active")}o.appendChild(i.get(0))});e(".cnd-select",t).append(o)};return this},setInterface:function(t,n){e.voCnd.resultTotal=t.resultTotal;e.voCnd.setPagination();e.each(t.panel,function(t,n){e.voCnd.setPanelGroup({group:t,displayName:n.display_name,description:n.description,optionLabel:n.option_label,ui:n.type?n.type:"single_menu",multiDimension:n.multi_dimension?n.multi_dimension:0,dataFormatSingle:n.filter_select_limit?1:0,filter:n.filter_panel?1:0,filterEffect:n.filter_effect?n.filter_effect:"disable"})});if(e.isFunction(e.fn.on)){e(e.voCnd.settings.panel).on("change",".cnd-select",function(){var t=e(":selected",this).attr("rel");if(t!=-1){e.voCnd.filterArray[e(this).data("group-name")]=[t]}else{e.voCnd.filterArray[e(this).data("group-name")]=[]}e.voCnd.getResults()})}else{e.log("The $.fn.on() function is not supported. Upgrade jQuery to 1.7 or higher.")}var r=document.createDocumentFragment();e.each(t.panel,function(n){var i=e.voCnd.panelGroups[n];if(typeof e.voCnd.filterArray[n]!="object"){i.defaultValue=e.voCnd.filterArray[n]?e.voCnd.filterArray[n]:[];e.voCnd.filterArray[n]=e.voCnd.filterArray[n]?e.voCnd.filterArray[n]:[]}object=e('<div id="cnd-'+n+'" class="cnd-header" />');groupObject=new e.voCnd.group(object,n,i);e("li",object).remove();var s=e('<div class="ui-state-default ui-corner-all cnd-button collapse"><span class="ui-icon ui-icon-triangle-1-s" /></div>').toggle(groupObject.menuClose,groupObject.menuOpen);var o=e('<div class="ui-state-default ui-corner-all cnd-button cancel"><span class="ui-icon ui-icon-cancel" /></div>').hide().bind("click",groupObject.reset);e("<h3 />").addClass("ui-corner-all").appendTo(object).append(o).append(s);switch(i.ui){case"single_menu":e('<ul class="cnd-list"></ul>').appendTo(object);groupObject.formatSingleDimension(t);break;case"single_menu_dropdown":var u=i.optionLabel?i.optionLabel:" --- Choose "+i.displayName+" --- ";e('<select class="cnd-select"><option rel="-1">'+u+"</option></select>").data("group-name",n).appendTo(object);groupObject.formatSingleDimensionDropdown(t);break;case"hierarchy_menu_slider":e('<ul class="cnd-list"></ul>').appendTo(object);groupObject.formatHierarchyMenuSlider(i.defaultValue?i.defaultValue:0,t);break;case"hierarchy_menu_portal":e('<ul class="cnd-list"></ul>').appendTo(object);groupObject.formatHierarchyMenuPortal(i.defaultValue?i.defaultValue:0,t);break;case"range_slider":break}if(typeof t.panelFilter[n]=="object"||t.panelFilter[n]=="showall"){object.show();if(i.filter){groupObject.filterResults(t.panelFilter[n])}}else{object.hide()}r.appendChild(object.get(0))});e(e.voCnd.settings.panel).empty().append(r);if(e.voCnd.settings.initContent){e.voCnd.setContent(t.content)}e(".waiting-for-results").hide();e(e.voCnd.settings.contentDom).fadeIn("fast")},waitingForResults:function(){e(e.voCnd.settings.contentDom).hide();e(".no-results").hide();e(".waiting-for-results").show()},filterResults:function(t){e.voCnd.resultTotal=t.resultTotal;e.voCnd.setPaginationMessage();e.each(e.voCnd.panelGroups,function(n,r){var i=new e.voCnd.group(e("#cnd-"+n),n,r);if(typeof t.panelFilter[n]=="object"||t.panelFilter[n]=="showall"){e("#cnd-"+n).show();if(r.filter){i.filterResults(t.panelFilter[n])}}else{e("#cnd-"+n).hide()}});e(".waiting-for-results").hide();if(t.content_html){e(e.voCnd.settings.contentDom).replaceWith(e(t.content_html).filter("ul"))}else{e.voCnd.setContent(t.content)}},setContent:function(t){var n=this;var r=e(n.settings.contentDom).comments();e(n.settings.contentDomRow,n.settings.contentDom).remove();if(e(t).length>0){e(".no-results").hide();var i=document.createDocumentFragment();e.each(t,function(t,n){var s=r.clone();s.setDataDisplay(n);e.voCnd.customContentFunction(t,n,s);i.appendChild(s.get(0))});e(n.settings.contentDom).append(i);e(e.voCnd.settings.contentDom).fadeIn("fast")}else{e(".no-results").show()}}};e.voSlugFormat=function(e){var t=e.replace(/[^a-zA-Z0-9\s\-]/g,"");t=t.trim().replace(/\s+/g,"-");return t.toLowerCase()}})(jQuery);