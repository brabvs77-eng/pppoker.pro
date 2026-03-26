function UEDynamicFilters(){var g_objFilters,g_filtersData,g_urlBase;var g_urlAjax,g_lastGridAjaxCall,g_cache={},g_objBody;var g_remote=null,g_lastSyncGrids,g_initFiltersCounter=0;var t=this;var g_showDebug=false;var g_debugInitMode=false;var g_isGutenberg=false;var g_types={PAGINATION:"pagination",LOADMORE:"loadmore",TERMS_LIST:"terms_list",SEARCH:"search",SELECT:"select",SUMMARY:"summary",GENERAL:"general",GENERAL_MOBILE_DRAWER:"mobilefilters"};var g_vars={CLASS_DIV_DEBUG:"uc-div-ajax-debug",CLASS_GRID:"uc-filterable-grid",CLASS_GRID_NOREFRESH:"uc-grid-norefresh",DEBUG_AJAX_OPTIONS:false,CLASS_CLICKED:"uc-clicked",CLASS_HIDDEN:"uc-filter-hidden",CLASS_INITING:"uc-filter-initing",CLASS_INITING_HIDDEN:"uc-initing-filter-hidden",CLASS_SKIP_REFRESH:"uc-filters-norefresh",CLASS_REFRESH_SOON:"uc-ajax-refresh-soon",EVENT_SET_HTML_ITEMS:"uc_ajax_sethtml",CLASS_FILTER_INITED:"ucfilters--filter-inited",ATTRIBUTE_URLADD:"ajaxurladd",GRID_DATA_SKIP_HTML:"skip_set_html",EVENT_BEFORE_REFRESH:"uc_before_ajax_refresh",EVENT_AJAX_REFRESHED:"uc_ajax_refreshed",EVENT_AJAX_REFRESHED_BODY:"uc_ajax_refreshed_body",EVENT_UPDATE_ACTIVE_FILTER_ITEMS:"update_active_filter_items",EVENT_UNSELECT_FILTER:"uc_unselect_filter",EVENT_SILENT_FILTER_CHANGE:"uc_silent_filter_change",EVENT_DOM_UPDATED:"uc_dom_updated",EVENT_INIT_FILTER:"init_filter",EVENT_INIT_FILTER_TYPE:"init_filter_type",EVENT_GET_FILTER_DATA:"get_filter_data",EVENT_FILTER_RELOADED:"uc_ajax_reloaded",ACTION_CLEAR_FILTERS:"clear_filters",ACTION_REFRESH_GRID:"uc_refresh",ACTION_GET_FILTERS_URL:"uc_get_filters_url",ACTION_FILTER_CHANGE:"uc_filter_change",ACTION_FILTER_UNSELECT_BY_KEY:"unselect_by_key",REFRESH_MODE_PAGINATION:"pagination",REFRESH_MODE_LOADMORE:"loadmore",trashold_handle:null,class_widget_wrapper:"elementor-widget",class_widget_container:"elementor-widget-container",current_postid:null};var g_options={is_cache_enabled:true,urlkey_taxsap:"~"};function trace(str){console.log(str);}
function ________GENERAL_______________(){}
function addUrlParam(url,param,value){if(url){if(url.indexOf("?")==-1)
url+="?";else
url+="&";}
if(typeof value=="undefined")
url+=param;else
url+=param+"="+value;return(url);}
function getVal(obj,name,defaultValue){if(!defaultValue)
var defaultValue="";var val="";if(!obj||typeof obj!="object")
val=defaultValue;else if(obj.hasOwnProperty(name)==false){val=defaultValue;}else{val=obj[name];}
return(val);}
function strToBool(str){switch(typeof str){case"boolean":return(str);break;case"undefined":return(false);break;case"number":if(str==0)
return(false);else
return(true);break;case"string":str=str.toLowerCase();if(str=="true"||str=="1")
return(true);else
return(false);break;}
return(false);};function getOffsetsDistance(offset1,offset2){var dx=offset2.left-offset1.left;var dy=offset2.top-offset1.top;return Math.sqrt(dx*dx+dy*dy);}
function roundToOneDecimal(num){if(num%1!==0){return num.toFixed(1);}else{return num.toFixed(0);}}
function getClosestByOffset(objParents,objElement,isVertical){if(objParents.length==0){throw new Error("get closest by offset error - grids not found");}
if(g_showDebug==true){trace("get closest grids for");trace(objElement)
trace("parents");trace(objParents);}
var objClosest=null;var minDiff=1000000;var elementOffset=objElement.offset();jQuery.each(objParents,function(index,parent){var objParent=jQuery(parent);var objGrid=jQuery(parent);var distance=0;var isVisible=objParent.is(":visible");var constantHeight=null;if(isVisible==false){objParent=objParent.parent();}
var parentOffset=objParent.offset();if(isVertical==true){var offsetY=elementOffset.top;var parentY=parentOffset.top;if(parentY<offsetY)
parentY+=objParent.height();var distance=Math.abs(offsetY-parentY);}else{var parentOffset=objParent.offset();var distance=getOffsetsDistance(parentOffset,elementOffset);}
if(g_showDebug==true){trace(objParent);trace("distance: "+distance);trace("is vertical: "+isVertical);}
if(distance<minDiff){minDiff=distance;objClosest=objGrid;}});if(g_showDebug==true){trace("filter: ");trace(objElement);trace("Closest grid found:");trace(objClosest);}
return(objClosest);}
function getAllGrids(type){if(type=="loaded_only")
var objGrids=jQuery("."+g_vars.CLASS_GRID).not(".ucfilters--grid-inited");else
var objGrids=jQuery("."+g_vars.CLASS_GRID);return(objGrids);}
function getGridFromParentContainers(objSource){var objParents=objSource.parents();var objGrid=null;if(g_showDebug==true){trace("get from parent containers");trace(objParents);}
objParents.each(function(){var objParent=jQuery(this);objGrid=objParent.find("."+g_vars.CLASS_GRID);if(objGrid.length>=1)
return(false);});return(objGrid);}
function getClosestGrid(objSource){var objGrids=getAllGrids();if(objGrids.length==0)
return(null);if(g_showDebug==true){trace("get closest grids");trace(objSource);trace(objGrids);}
if(objGrids.length==1)
return(objGrids);var group=objSource.data("connectgroup");if(group){var objGridsGroup=objGrids.filter("[data-filtergroup="+group+"]");if(objGridsGroup.length>0){if(objGridsGroup.length==1)
return(objGridsGroup);objGrids=objGridsGroup;}}else{var objGrid=getGridFromParentContainers(objSource);if(objGrid&&objGrid.length==1)
return(objGrid);}
if(objGrid&&objGrid.length>1)
objGrids=objGrid;var objSingleGrid=getClosestByOffset(objGrids,objSource,true);if(objSingleGrid&&objSingleGrid.length==1)
return(objSingleGrid);var objFirstGrid=jQuery(objGrids[0]);return(objFirstGrid);}
function bindFilterToGrid(objGrid,objFilter){var arrFilters=objGrid.data("filters");var objTypes=objGrid.data("filter_types");if(!arrFilters)
arrFilters=[];if(!objTypes)
objTypes={};var type=getFilterType(objFilter);if(objTypes.hasOwnProperty(type)){switch(type){case g_types.LOADMORE:trace("Double filter not allowed");trace("existing Filters:");trace(arrFilters);trace("Second Filter");trace(objFilter);trace("Grid:");trace(objGrid);showElementError(objFilter,"Double load more button for one grid not allowed")
return(false);break;}}
objTypes[type]=true;var filterID=objFilter.attr("id");var objElementorStickySpacer=objFilter.closest(".elementor-sticky__spacer");if(objElementorStickySpacer.length)
return(true);var objExistingFilter=arrFilters.filter(function(objFilterInArray){return objFilterInArray.attr("id")==filterID;});if(objExistingFilter&&objExistingFilter.length)
throw new Error("Can't bind filter to grid, it's already exists: "+filterID);arrFilters.push(objFilter);var isInitAfter=objFilter.data("initafter");if(!isInitAfter)
isInitAfter=isSpecialFilterInitAfter(objFilter,objGrid);if(isInitAfter===true)
addFilterToInitAfter(objFilter,objGrid);objGrid.data("filters",arrFilters);objGrid.data("filter_types",objTypes);}
function getElementWidgetID(objElement){if(!objElement||objElement.length===0)
throw new Error("Element not found");var objWidget=objElement.closest("."+g_vars.class_widget_wrapper);if(objWidget.length===0)
throw new Error("Element parent not found with class: "+g_vars.class_widget_wrapper);var widgetID=objWidget.data("id");if(!widgetID)
throw new Error("widget id not found");return widgetID;}
function getGridFromElementorElementID(elementID){var selector="."+g_vars.class_widget_wrapper+"[data-id='"+elementID+"']";var objElement=g_objBody.find(selector);if(objElement.length==0)
return(null);var objGrid=objElement.find("."+g_vars.CLASS_GRID);if(objGrid.length!=1)
return(null);return(objGrid);}
function getGroupWidgets(arrSyncedGrids,objElement){var group=objElement.data("filtergroup");if(!group)
return(arrSyncedGrids);var objGrids=jQuery("."+g_vars.CLASS_GRID);if(objGrids.length<2)
return(arrSyncedGrids);var elementID=objElement.attr("id");var objDataGrids=objGrids.filter("[data-filtergroup='"+group+"']:not(#"+elementID+")");if(objDataGrids.length==0)
return(arrSyncedGrids);jQuery.each(objDataGrids,function(index,grid){var objGrid=jQuery(grid);arrSyncedGrids.push(objGrid);});return(arrSyncedGrids);}
function getSyncedWidgetData(objElement){var arrSyncedGrids=[];if(g_remote)
arrSyncedGrids=g_remote.getSyncedElements(objElement);if(!arrSyncedGrids)
arrSyncedGrids=[];arrSyncedGrids=getGroupWidgets(arrSyncedGrids,objElement);if(!arrSyncedGrids||arrSyncedGrids.length==0)
return(false);var arrWidgetIDs=[];var objGrids=null;for(var index in arrSyncedGrids){var objGrid=arrSyncedGrids[index];if(objGrid.hasClass(g_vars.CLASS_GRID)==false){var message="Please enable ajax on all synced widgets";var message2="Please enable ajax on this synced widget, it's missing class: "+g_vars.CLASS_GRID;showElementError(objGrid,message2);showAjaxError(message);throw new Error(message);return(false);}
var objWidgetID=getElementWidgetID(objGrid);if(!objGrids)
objGrids=objGrid;else
objGrids=objGrids.add(objGrid);arrWidgetIDs.push(objWidgetID);}
var strWidgetIDs=arrWidgetIDs.toString();var objOutput={};objOutput["ids"]=strWidgetIDs;objOutput["grids"]=objGrids;return(objOutput);}
function getElementLayoutData(objElement,addSyncedGrids){var widgetID=getElementWidgetID(objElement);var objWidget=objElement.parents("."+g_vars.class_widget_wrapper);var objSyncedData=null;if(addSyncedGrids){var objSyncedData=getSyncedWidgetData(objElement);if(g_showDebug&&objSyncedData){trace("sync data");trace(objSyncedData);}}else{if(g_showDebug)
trace("skip sync grid");}
if(g_isGutenberg==false){var objLayout=objWidget.parents(".elementor");if(objLayout.length==0)
throw new Error("layout not found");var layoutID=objLayout.data("elementor-id");if(!layoutID)
layoutID=objLayout.data("id");}else{var layoutID=g_vars.current_postid;}
var output={};output["widgetid"]=widgetID;output["layoutid"]=layoutID;if(objSyncedData){output["synced_widgetids"]=objSyncedData["ids"];output["synced_grids"]=objSyncedData["grids"];}
return(output);}
function showElementError(objElement,error){var objParent=objElement.parent();var objError=objParent.find(".uc-filers-error-message");if(objError.length==0){objParent.append("<div class='uc-filers-error-message' style='color:red;position:absolute;top:-24px;left:0px;background-color:rgba(230, 230, 230, 0.8);padding:3px;font-size:12px;'></div>");var objError=objParent.find(".uc-filers-error-message");objParent.css("border","1px solid red !important");}
objError.append(error);objError.css("top",-objError.height()-5);}
function getGridEmptyMessage(objGrid){var gridID=objGrid.attr("id");if(!gridID)
return(null);var objEmptyMessage=jQuery("#"+gridID+"_empty_message");if(objEmptyMessage.length==0)
return(null);return(objEmptyMessage);}
function getGridActiveFilterItems(objGrid){var arrActiveItems=objGrid.data("active_filters_items");if(!arrActiveItems)
return(null);if(arrActiveItems.length==0)
return(null);return(arrActiveItems);}
function getSelectedFilters(objFilters,roleArg){if(!objFilters)
var objFilters=objGrid.data("filters");if(!objFilters)
return(false);var arrSelectedFilters=[];jQuery.each(objFilters,function(index,filter){var objFilter=jQuery(filter);var isSelected=objFilter.hasClass("uc-has-selected");if(!roleArg&&isSelected==true){arrSelectedFilters.push(objFilter);return(true);}
var role=objFilter.data("role");if(role==roleArg){var isSelected=objFilter.hasClass("uc-has-selected");if(isSelected)
arrSelectedFilters.push(objFilter);}});return(arrSelectedFilters);}
function ________FILTERS_______________(){}
function getFiltersParent(objFilters){var objParent=objFilters.parents(".elementor");if(objFilters.length>1&&objParent.length>1)
objParent=objFilters.parents("body");if(objParent.length>1){objParent=jQuery(objParent[0]);}
if(objParent.length==0)
objParent=objFilters.parents("body");return(objParent);}
function getFilterWrapper(objFilter){var objParent=objFilter.parent();var objElementorParent=objParent.parents(".elementor-widget-container");if(objElementorParent.length==1)
return(objElementorParent);if(objParent.hasClass("uc-checkbox-filter-accordion-container"))
objParent=objParent.parent();return(objParent);}
function getFilterType(objFilter,getGeneralType){if(objFilter.hasClass("uc-filter-pagination"))
return(g_types.PAGINATION);if(objFilter.hasClass("uc-filter-load-more"))
return(g_types.LOADMORE);var filterType=objFilter.data("filtertype")
if(filterType==g_types.GENERAL&&getGeneralType===true){var generalType=objFilter.data("generaltype");return(generalType);}
if(filterType)
return(filterType);trace("Filter type not found: ");trace(objFilter);throw new Error("wrong filter type");}
function clearAllFilters(objGrid){clearChildFilters(objGrid,null,true,null,true);}
function getGridFilters(objGrid){var objFilters=objGrid.data("filters");if(!objFilters)
return(null);if(objFilters.length==0)
return(null);return(objFilters);}
function clearChildFilters(objGrid,objCurrentFilter,isHideChildren,termID,isClearAll){var objFilters=getGridFilters(objGrid);if(!objFilters)
return(false);var currentFilterID=null;if(objCurrentFilter)
var currentFilterID=objCurrentFilter.attr("id");jQuery.each(objFilters,function(index,filter){var objFilter=jQuery(filter);var filterID=objFilter.attr("id");if(filterID==currentFilterID)
return(true);var role=objFilter.data("role");if(role!="child"&&role!="main"&&role!="term_child"){if(isClearAll==true){clearFilter(objFilter);}
return(true);}
var isHide=false;var isShow=false;switch(role){case"term_child":if(isHideChildren==true)
isHide=true;var linkedTermID=objFilter.data("childterm");if(linkedTermID==termID){objFilter.removeClass(g_vars.CLASS_HIDDEN);objFilter.removeClass(g_vars.CLASS_INITING);objFilter.removeClass(g_vars.CLASS_INITING_HIDDEN);}else{isHide=true;}
break;case"child":if(isHideChildren==true)
isHide=true;else{objFilter.removeClass(g_vars.CLASS_HIDDEN);objFilter.addClass(g_vars.CLASS_INITING);objFilter.addClass(g_vars.CLASS_INITING_HIDDEN);}
break;default:if(isClearAll==true){clearFilter(objFilter);}
return(true);break;}
if(isHide==true)
objFilter.addClass(g_vars.CLASS_HIDDEN);clearFilter(objFilter);});}
function clearFilter(objFilter){var type=getFilterType(objFilter);switch(type){case g_types.TERMS_LIST:var objSelectedItems=objFilter.find(".ue_taxonomy_item.uc-selected");objSelectedItems.removeClass("uc-selected");var objAll=objFilter.find(".ue_taxonomy_item.uc-item-all");objAll.addClass("uc-selected");break;case g_types.SELECT:var objSelect=objFilter.find("select");objSelect.val("");break;default:case g_types.SEARCH:case g_types.GENERAL:objFilter.trigger("clear_filter");break;}}
function unselectFilterItem(objGrid,key){var objFilters=getGridFilters(objGrid);if(!objFilters)
return(false);jQuery.each(objFilters,function(index,filter){var objFilter=jQuery(filter);objFilter.trigger(g_vars.ACTION_FILTER_UNSELECT_BY_KEY,[key]);});}
function isFilterSkipAction(objFilter){var objParentSkipRefresh=objFilter.parents("."+g_vars.CLASS_SKIP_REFRESH);if(objParentSkipRefresh.length)
return(true);return(false);}
function hasChildFilters(objGrid){var objFilters=getGridFilters(objGrid);if(!objFilters)
return(false);for(var index in objFilters){var objFilter=objFilters[index];var role=objFilter.data("role");if(role=="child")
return(true);}
return(false);}
function checkTriggerSkipAction(objFilter,objGrid){var isSkipAction=isFilterSkipAction(objFilter);if(isSkipAction==false)
return(false);if(g_showDebug==true)
trace("skip refresh - silent change triggered");var filterRole=objFilter.data("role");objGrid.trigger(g_vars.EVENT_SILENT_FILTER_CHANGE);if(filterRole=="main"&&hasChildFilters(objGrid)){if(g_showDebug==true)
trace("refresh children only");objGrid.data(g_vars.GRID_DATA_SKIP_HTML,true);refreshAjaxGrid(objGrid);}
return(true);}
function ________PAGINATION_FILTER______(){}
function getPaginationSelectedData(objPagination){var objCurrentLink=objPagination.find("a.current");if(objCurrentLink.length==0)
return(null);var url=objCurrentLink.attr("href");if(!url)
return(null);var numPage=objCurrentLink.text();if(jQuery.isNumeric(numPage)==false)
numPage=null;numPage=Number(numPage);if(numPage===1)
numPage=null;var output={};output["url"]=url;output["page"]=numPage;return(output);}
function onAjaxPaginationLinkClick(event){var objLink=jQuery(this);var objPagination=objLink.parents(".uc-filter-pagination");var objLinkCurrent=objPagination.find(".current");if(objLink.hasClass("next")){var nextLink=objLinkCurrent.next();var objNextLink=jQuery(nextLink);objNextLink.trigger("click");return(false);}
if(objLink.hasClass("prev")){var prevLink=objLinkCurrent.prev();var objPrevLink=jQuery(prevLink);objPrevLink.trigger("click");return(false);}
objLinkCurrent.removeClass("current");objLink.addClass("current");var objGrid=objPagination.data("grid");if(!objGrid||objGrid.length==0)
throw new Error("Grid not found!");event.preventDefault();objPagination.addClass(g_vars.CLASS_CLICKED);if(g_showDebug==true){trace("click on pagination!!!, no grid refresh");trace(objLink);}else{refreshAjaxGrid(objGrid,g_vars.REFRESH_MODE_PAGINATION);}
return(false);}
function ________LOAD_MORE_______________(){}
function getLoadMoreUrlData(objFilter){var objData=objFilter.find(".uc-filter-load-more__data");var nextOffset=objData.data("nextoffset");if(!nextOffset)
nextOffset=null;var numItems=objFilter.data("numitems");if(!numItems)
numItems=null;var isSingleGridOnly=objFilter.data("affect_single_grid");var data={};data.offset=nextOffset;data.numItems=numItems;data.singlegrid=isSingleGridOnly;return(data);}
function onLoadMoreClick(){var objLink=jQuery(this);var objLoadMore=objLink.parents(".uc-filter-load-more");var objData=objLoadMore.find(".uc-filter-load-more__data");var isMore=objData.data("more");if(isMore==false)
return(false);var objGrid=objLoadMore.data("grid");if(!objGrid||objGrid.length==0)
throw new Error("Grid not found!");objLoadMore.addClass(g_vars.CLASS_CLICKED);refreshAjaxGrid(objGrid,g_vars.REFRESH_MODE_LOADMORE);}
function ________SELECT_______________(){}
function initSelectFilter(objFilter){var objSelected=objFilter.find(".uc-selected");if(objSelected.length==0)
return(false);var value=objSelected.attr("value");var objSelect=objFilter.find("select");objSelect.val(value);}
function ________TERMS_LIST_______________(){}
function termsFilterUnselectByKey(event,key){var objFilter=jQuery(this);var selectedTerm=getTermsListSelectedTerm(objFilter);if(!selectedTerm)
return(false);var selectedKey=getVal(selectedTerm,"key");if(selectedKey!=key)
return(false);clearFilter(objFilter);setNoRefreshFilter(objFilter);}
function onTermsLinkClick(event){var className="uc-selected";event.preventDefault();var objLink=jQuery(this);if(objLink.hasClass("uc-grid-filter")){var objTermsFilter=objLink;}else{var objTermsFilter=objLink.parents(".uc-grid-filter");}
var filterType=getFilterType(objTermsFilter);if(filterType==g_types.SELECT){var objLink=objTermsFilter.find("option:selected");}
if(filterType==g_types.TERMS_LIST){var objActiveLinks=objLink.siblings("."+className).not(objLink);objActiveLinks.removeClass(className);objLink.addClass(className);}
var objGrid=objTermsFilter.data("grid");if(!objGrid||objGrid.length==0)
throw new Error("Grid not found");var filterRole=objTermsFilter.data("role");var termID=objLink.data("id");var isRefresh=false;if(!termID){var objHiddenItems=objTermsFilter.find(".uc-item-hidden");if(objHiddenItems.length)
isRefresh=true;}
var isHideChildren=false;if(!termID)
isHideChildren=true;if(isRefresh==false)
setNoRefreshFilter(objTermsFilter);if(filterRole=="main")
clearChildFilters(objGrid,objTermsFilter,isHideChildren,termID);var isSkipAction=checkTriggerSkipAction(objTermsFilter,objGrid);if(isSkipAction==true)
return(false);if(g_showDebug==true){trace("refresh grid - on term click");}
refreshAjaxGrid(objGrid);}
function getTermsListSelectedTerm(objFilter){if(!objFilter)
return(null);var filterType=getFilterType(objFilter);var objSelected=objFilter.find(".uc-selected");if(filterType==g_types.SELECT){var objSelected=objFilter.find("option:selected");}else{var objSelected=objFilter.find(".uc-selected");}
if(objSelected.length==0){if(g_showDebug==true){trace("no selected found, skipping...");}
return(null);}
if(filterType==g_types.TERMS_LIST&&objSelected.hasClass("uc-item-hidden")==true){if(g_showDebug==true){trace("the selected object");trace(objSelected);trace("the term is hidden, skipping...");}
return(null);}
if(objSelected.length>1)
objSelected=jQuery(objSelected[0]);var objTerm=getFilterElementData(objSelected);return(objTerm);}
function termListSelectItems(objFilter,arrTerms){var objSelected=objFilter.find(".uc-selected");objSelected.removeClass("uc-selected");jQuery.each(arrTerms,function(index,term){var termID=getVal(term,"id");var objItem=objFilter.find("a.ue_taxonomy_item[data-id='"+termID+"']");if(objItem.length==0)
return(true);objItem.addClass("uc-selected");});}
function ________GENERAL_FILTER_______________(){}
function initGeneralFilter(objFilter){objFilter.on(g_vars.ACTION_FILTER_CHANGE,onGeneralFilterChange);}
function onGeneralFilterChange(event,params){event.stopPropagation();var isRefresh=getVal(params,"refresh");var objFilter=jQuery(this);var filterType=objFilter.data("filtertype");if(filterType!="general"){trace(objFilter);throw new Error("Not a general filter on action: "+g_vars.ACTION_FILTER_CHANGE);return(false);}
if(isRefresh!==true)
setNoRefreshFilter(objFilter);var objGrid=objFilter.data("grid");if(!objGrid||objGrid.length==0){trace(objGrid);throw new Error("Wrong filter change");return(false);}
var filterRole=objFilter.data("role");if(filterRole=="main"){var isHideChildren=false;var objData=getGeneralFilterData(objFilter);if(!objData)
isHideChildren=true;clearChildFilters(objGrid,objFilter,isHideChildren);}
var isSkipAction=checkTriggerSkipAction(objFilter,objGrid);if(isSkipAction==true)
return(false);if(g_showDebug==true){trace("refresh grid - on general filter change");trace(objFilter);}
refreshAjaxGrid(objGrid);return(false);}
function selectFilterItemsByTerms(objFilters,arrTerms){if(!objFilters||objFilters.length==0)
return(false);if(!arrTerms||arrTerms.length==0)
return(false);jQuery.each(objFilters,function(index,filter){var objFilter=jQuery(filter);selectFilterItems(objFilter,arrTerms);});}
function selectFilterItems(objFilter,arrTerms){var type=getFilterType(objFilter);switch(type){case g_types.TERMS_LIST:termListSelectItems(objFilter,arrTerms);break;case g_types.GENERAL:objFilter.trigger("uc_select_items",arrTerms);break;}}
function getGeneralFilterData(objFilter){var filterDataObj={};objFilter.trigger(g_vars.EVENT_GET_FILTER_DATA,filterDataObj);var filterData=getVal(filterDataObj,"output");return(filterData);}
function ________INIT_FILTERS_______________(){}
function initTermsRelatedFilter(objFilter){objFilter.on(g_vars.ACTION_FILTER_UNSELECT_BY_KEY,termsFilterUnselectByKey);}
function getFilterTaxIDs(objFilter,objIDs){var type=getFilterType(objFilter);if(type==g_types.SELECT)
var objItems=objFilter.find(".uc-select-filter__option");else
var objItems=objFilter.find(".ue_taxonomy_item");if(objItems.length==0)
return(objIDs);jQuery.each(objItems,function(index,item){var objItem=jQuery(item);var taxID=objItem.data("id");if(!taxID)
return(true);objIDs[taxID]=true;});return(objIDs);}
function getTermDsList(objIDs){var strIDs="";for(var id in objIDs){if(jQuery.isNumeric(id)==false)
continue;if(strIDs)
strIDs+=",";strIDs+=id;}
return(strIDs);}
function ________DATA_______________(){}
function buildTermsQuery_handleTerm(objTerm,arrTax1){var taxonomy=objTerm["taxonomy"];var slug=objTerm["slug"];var objTax=getVal(arrTax1,taxonomy);if(!objTax)
objTax={};objTax[slug]=true;arrTax1[taxonomy]=objTax;return(arrTax1);}
function buildTermsQuery_getStrSlugs(objSlugs,isGroup){var strSlugs="";var moreThenOne=false;var isEndSlugFound=false;for(var slug in objSlugs){if(slug==="__ucand__"){isEndSlugFound=true;continue}
if(strSlugs){moreThenOne=true;strSlugs+=".";}
strSlugs+=slug;}
var addAnd=(moreThenOne==true&&isGroup!==true||isEndSlugFound);if(addAnd)
strSlugs+=".*";return(strSlugs);}
function buildTermsQuery(arrTerms){var isDebug=false;var query="";var arrTax={};var arrGroupTax={};if(isDebug==true){trace("arr terms");trace(arrTerms);}
jQuery.each(arrTerms,function(index,objTerm){if(jQuery.isArray(objTerm)&&objTerm.length!=0){jQuery.each(objTerm,function(index,groupTerm){arrGroupTax=buildTermsQuery_handleTerm(groupTerm,arrGroupTax);});}else{arrTax=buildTermsQuery_handleTerm(objTerm,arrTax);}});if(isDebug==true){trace("first arr tax");trace(arrTax);}
if(jQuery.isEmptyObject(arrTax)&&jQuery.isEmptyObject(arrGroupTax))
return(null);if(isDebug==true){trace("build group");trace(arrGroupTax);}
jQuery.each(arrGroupTax,function(taxonomy,objSlugs){var strSlugs=buildTermsQuery_getStrSlugs(objSlugs,true);var strAdd="|"+strSlugs+"|";var objTax=getVal(arrTax,taxonomy);if(!objTax){objTax={};strAdd=strSlugs;}
objTax[strAdd]=true;arrTax[taxonomy]=objTax;});if(isDebug==true){trace("group built");trace(arrTax);}
jQuery.each(arrTax,function(taxonomy,objSlugs){var strSlugs=buildTermsQuery_getStrSlugs(objSlugs);var strTax=taxonomy+g_options.urlkey_taxsap+strSlugs;if(query)
query+=";";query+=strTax;});if(isDebug==true){trace("query");trace(query);}
return(query);}
function getFilterElementData(objElement){var id=objElement.data("id");var slug=objElement.data("slug");var taxonomy=objElement.data("taxonomy");var title=objElement.data("title");var key=objElement.data("key");var type=objElement.data("type");if(!taxonomy)
return(null);var objTerm={"type":type,"id":id,"slug":slug,"taxonomy":taxonomy,"title":title,"key":key};return(objTerm);}
function ________AJAX_CACHE_________(){}
function getAjaxCacheKeyFromUrl(ajaxUrl){var key=ajaxUrl;key=key.replace(g_urlAjax,"");key=key.replace(g_urlBase,"");key=replaceAll(key,"/","");key=replaceAll(key,"?","_");key=replaceAll(key,"&","_");key=replaceAll(key,"=","_");return(key);}
function getAjaxCacheKey(ajaxUrl,action,objData){if(g_options.is_cache_enabled==false)
return(false);if(jQuery.isEmptyObject(objData)==false)
return(false);if(action)
return(false);var cacheKey=getAjaxCacheKeyFromUrl(ajaxUrl);if(!cacheKey)
return(false);return(cacheKey);}
function cacheAjaxResponse(ajaxUrl,action,objData,response){var cacheKey=getAjaxCacheKey(ajaxUrl,action,objData);if(!cacheKey)
return(false);if(g_cache.length>100)
return(false);g_cache[cacheKey]=response;}
function ________AJAX_RESPONSE_______________(){}
function operateAjax_setHtmlDebug(response,objGrid){var htmlDebug=getVal(response,"html_debug");if(!htmlDebug)
return(false);var gridParent=objGrid.parents("."+g_vars.class_widget_container);var objDebug=gridParent.find(".uc-debug-query-wrapper");if(objDebug.length==0)
return(false);objDebug.replaceWith(htmlDebug);}
function operateAjax_setHtmlGrid(response,objGrid,isLoadMore){if(g_showDebug==true){trace("set html grid, response: ");trace(response);trace("obj grid:");trace(objGrid);}
if(objGrid.length==0)
return(false);if(objGrid.data(g_vars.GRID_DATA_SKIP_HTML)===true){if(g_showDebug==true)
trace("skip set html");objGrid.data(g_vars.GRID_DATA_SKIP_HTML,false);return(false);}
var objItemsWrapper=getGridItemsWrapper(objGrid);var objItemsWrapper2=getGridItemsWrapper(objGrid,true);if(g_showDebug==true){trace("items wrapper 1: ");trace(objItemsWrapper);trace("items wrapper 2:");trace(objItemsWrapper2);}
if(!objItemsWrapper||objItemsWrapper.length==0)
throw new Error("Missing items wrapper: .uc-items-wrapper");operateAjax_setHtmlDebug(response,objGrid);if(response.hasOwnProperty("html_items")==false)
return(false);var htmlItems=getVal(response,"html_items");var htmlItems2=null;if(objItemsWrapper2)
htmlItems2=getVal(response,"html_items2");var gridID=objGrid.attr("id");htmlItems=replaceAll(htmlItems,"%uc_widget_id%",gridID);if(htmlItems2)
htmlItems2=replaceAll(htmlItems2,"%uc_widget_id%",gridID);var isCustomRefresh=objGrid.data("custom-sethtml");var objEmptyMessage=getGridEmptyMessage(objGrid);if(objEmptyMessage){if(htmlItems=="")
objEmptyMessage.show();else
objEmptyMessage.hide();}
var queryDataOriginal=getVal(response,"query_data");var queryIDs=getVal(response,"query_ids");var queryData=jQuery.extend({},queryDataOriginal);if(isLoadMore==true){var currentQueryData=objGrid.attr("querydata");var objCurrentData=jQuery.parseJSON(currentQueryData);var currentNumPosts=getVal(objCurrentData,"count_posts");queryData.count_posts+=currentNumPosts;var currentQueryIDs=objGrid.data("postids");if(queryIDs&&currentQueryIDs)
queryIDs=currentQueryIDs+","+queryIDs;}
if(queryData){objGrid.removeAttr("querydata");var jsonData=JSON.stringify(queryData);objGrid.attr("querydata",jsonData);objGrid.data("querydata",queryData);}
objGrid.removeAttr("data-postids");objGrid.attr("data-postids",queryIDs);objGrid.data("postids",queryIDs);if(isCustomRefresh==true){objGrid.trigger(g_vars.EVENT_SET_HTML_ITEMS,[htmlItems,isLoadMore,htmlItems2]);return(false);}
if(!htmlItems2)
htmlItems2="";if(isLoadMore===true){if(g_showDebug==true){trace("append load more");}
objItemsWrapper.append(htmlItems);if(objItemsWrapper)
objItemsWrapper.append(htmlItems2);}else{objItemsWrapper.html(htmlItems);if(objItemsWrapper2&&objItemsWrapper2.length)
objItemsWrapper2.html(htmlItems2);}}
function operateAjax_setHtmlSyngGrids(response,objGrid,isLoadMore){var objSyncWidgetsResponse=getVal(response,"html_sync_widgets");if(g_showDebug==true){trace("set html sync grids");trace(objSyncWidgetsResponse);}
var queryData=getVal(response,"query_data");if(!objSyncWidgetsResponse)
return(false);jQuery.each(objSyncWidgetsResponse,function(elementID,childResponse){var objGridWidget=getGridFromElementorElementID(elementID);if(!objGridWidget)
return(true);objGridWidget.removeClass(g_vars.CLASS_REFRESH_SOON);childResponse.query_data=queryData;operateAjax_setHtmlGrid(childResponse,objGridWidget,isLoadMore);objGridWidget.trigger(g_vars.EVENT_AJAX_REFRESHED);g_objBody.trigger(g_vars.EVENT_AJAX_REFRESHED_BODY,[objGridWidget]);});}
function operateAjax_setHtmlWidgets(response,objFilters){if(!objFilters)
return(false);if(objFilters.length==0)
return(false);var objHtmlWidgets=getVal(response,"html_widgets");if(!objHtmlWidgets)
return(false);if(objHtmlWidgets.length==0)
return(false);var objHtmlDebug=getVal(response,"html_widgets_debug");jQuery.each(objFilters,function(index,objFilter){var widgetID=getElementWidgetID(objFilter);if(!widgetID)
return(true);var html=getVal(objHtmlWidgets,widgetID);if(!html)
return(true);var objHtml=jQuery(html);var htmlInner=objHtml.html();var filterClassName=objHtml.attr("class");filterClassName+=" "+g_vars.CLASS_FILTER_INITED;objFilter.attr("class",filterClassName);objFilter.removeClass(g_vars.CLASS_INITING);objFilter.removeClass(g_vars.CLASS_REFRESH_SOON);objFilter.html(htmlInner);var htmlDebug=null;if(objHtmlDebug)
var htmlDebug=getVal(objHtmlDebug,widgetID);if(htmlDebug){var objParent=objFilter.parents("."+g_vars.class_widget_container);var objDebug=objParent.find(".uc-div-ajax-debug");if(objDebug.length)
objDebug.replaceWith(htmlDebug);}
objFilter.trigger(g_vars.EVENT_FILTER_RELOADED);});}
function scrollToGridTop(objGrid){var gapTop=150;var gridOffset=objGrid.offset().top;var gridTop=gridOffset-gapTop;if(gridTop<0)
gridTop=0;var currentPos=jQuery(window).scrollTop();if(currentPos<=gridOffset)
return(false);window.scrollTo({top:gridTop,behavior:'smooth'});}
function operateAjaxRefreshResponse(response,objGrid,objFilters,isLoadMore,isNoScroll){operateAjax_setHtmlGrid(response,objGrid,isLoadMore);operateAjax_setHtmlWidgets(response,objFilters);operateAjax_setHtmlSyngGrids(response,objGrid,isLoadMore);objGrid.trigger(g_vars.EVENT_AJAX_REFRESHED);g_objBody.trigger(g_vars.EVENT_AJAX_REFRESHED_BODY,[objGrid]);if(isLoadMore==false&&isNoScroll!==true){setTimeout(function(){scrollToGridTop(objGrid);},200);}}
function replaceAll(text,from,to){return text.split(from).join(to);};function getResponseFromAjaxCache(ajaxUrl,action,objData){var cacheKey=getAjaxCacheKey(ajaxUrl,action,objData);if(!cacheKey)
return(false);var response=getVal(g_cache,cacheKey);return(response);}
function ________AJAX_______________(){}
function setNoRefreshFilter(objFilter){objFilter.data("uc_norefresh",true);}
function showAjaxError(message){alert(message);}
function getDebugObject(){var objGrid=g_lastGridAjaxCall;if(!objGrid)
return(null);var objDebug=objGrid.find("."+g_vars.CLASS_DIV_DEBUG);if(objDebug.length)
return(objDebug);objGrid.after("<div class='"+g_vars.CLASS_DIV_DEBUG+"' style='padding:10px;display:none;background-color:#D8FCC6'></div>");var objDebug=jQuery("body").find("."+g_vars.CLASS_DIV_DEBUG);return(objDebug);}
function showAjaxDebug(str){trace("Ajax Error! - Check the debug");str=jQuery.trim(str);if(!str||str.length==0)
return(false);var objStr=jQuery(str);if(objStr.find("header").length||objStr.find("body").length){str="Wrong ajax response!";}
var objDebug=getDebugObject();if(!objDebug||objDebug.length==0){alert(str);throw new Error("debug not found");}
objDebug.show();objDebug.html(str);}
function ajaxRequest(ajaxUrl,action,objData,onSuccess){if(g_debugInitMode===true){trace("debug init mode - skip request");return(false);}
if(g_showDebug==true){trace("ajax request");trace(ajaxUrl);}
if(!objData)
var objData={};if(typeof objData!="object")
throw new Error("wrong ajax param");var responseFromCache=getResponseFromAjaxCache(ajaxUrl,action,objData);if(responseFromCache){setTimeout(function(){onSuccess(responseFromCache);},300);return(false);}
var ajaxData={};ajaxData["action"]="unlimitedelements_ajax_action";ajaxData["client_action"]=action;var ajaxtype="get";if(jQuery.isEmptyObject(objData)==false){ajaxData["data"]=objData;ajaxtype="post";}
var ajaxOptions={type:ajaxtype,url:ajaxUrl,success:function(response){if(!response){showAjaxError("Empty ajax response!");return(false);}
if(typeof response!="object"){try{response=jQuery.parseJSON(response);}catch(e){showAjaxDebug(response);showAjaxError("Ajax Error!!! not ajax response");return(false);}}
if(response==-1){showAjaxError("ajax error!!!");return(false);}
if(response==0){showAjaxError("ajax error, action: <b>"+action+"</b> not found");return(false);}
if(response.success==undefined){showAjaxError("The 'success' param is a must!");return(false);}
if(response.success==false){showAjaxError(response.message);return(false);}
cacheAjaxResponse(ajaxUrl,action,objData,response);if(typeof onSuccess=="function"){onSuccess(response);}},error:function(jqXHR,textStatus,errorThrown){switch(textStatus){case"parsererror":case"error":showAjaxDebug(jqXHR.responseText);break;}}}
if(ajaxtype=="post"){ajaxOptions.dataType='json';ajaxOptions.data=ajaxData}
var handle=jQuery.ajax(ajaxOptions);return(handle);}
function getGridItemsWrapper(objGrid,isSecond){var classItems="uc-items-wrapper";if(isSecond==true)
classItems="uc-items-wrapper2";if(objGrid.hasClass(classItems))
return(objGrid);var objItemsWrapper=objGrid.find("."+classItems);if(objItemsWrapper.length==0&&isSecond==false)
throw new Error("Missing items wrapper - with class: uc-items-wrapper");if(objItemsWrapper.length==0)
return(null);return(objItemsWrapper);}
function showAjaxLoader(objElement){objElement.addClass("uc-ajax-loading");}
function hideAjaxLoader(objElement){objElement.removeClass("uc-ajax-loading");}
function showMultipleAjaxLoaders(objElements,isShow){if(!objElements)
return(false);if(objElements.length==0)
return(false);jQuery.each(objElements,function(index,objElement){objElement=jQuery(objElement);if(isShow==true){showAjaxLoader(objElement);}
else
hideAjaxLoader(objElement);});}
function refreshAjaxGrid(objGrid,refreshType){var isLoadMore=(refreshType==g_vars.REFRESH_MODE_LOADMORE);var isFiltersInit=(refreshType=="filters"||refreshType=="filters_children");var isLoadMoreMode=(refreshType==g_vars.REFRESH_MODE_LOADMORE||refreshType==g_vars.REFRESH_MODE_PAGINATION);var objFilters=objGrid.data("filters");if(!objFilters)
return(false);if(objFilters.length==0)
return(false);if(objGrid.hasClass(g_vars.CLASS_GRID_NOREFRESH))
return(false);var params={};if(refreshType=="filters_children")
params["filters_init_type"]="children";var objAjaxOptions=getGridAjaxOptions(objFilters,objGrid,isFiltersInit,isLoadMoreMode,params);if(!objAjaxOptions){trace("ajax options are null");return(false);}
var ajaxUrl=objAjaxOptions["ajax_url"];var urlReplace=objAjaxOptions["url_replace"];var arrTerms=objAjaxOptions["terms"];if(g_vars.DEBUG_AJAX_OPTIONS==true){trace("DEBUG AJAX OPTIONS");trace(objAjaxOptions);return(false);}
var behave=objGrid.data("filterbehave");var isSetUrl=(behave=="mixed"||behave=="mixed_back");if(isFiltersInit==false&&isSetUrl===true){if(behave=="mixed_back"){var gridID=objGrid.attr("id");var isStateEmpty=jQuery.isEmptyObject(history.state);var objState={"ucaction":"change","ajaxurl":ajaxUrl,"gridid":gridID,selected_terms:arrTerms};if(isStateEmpty){var ajaxUrlInitial=objGrid.data("initajaxurl");objState["ajaxurl"]=ajaxUrlInitial;history.replaceState(objState,null,urlReplace);}
history.pushState(objState,null,urlReplace);}
else
history.replaceState({},null,urlReplace);}
initGrid_setActiveFiltersData(objGrid,objAjaxOptions);doGridAjaxRequest(ajaxUrl,objGrid,objFilters,isLoadMore,isFiltersInit);}
function doGridAjaxRequest(ajaxUrl,objGrid,objFilters,isLoadMore,isFiltersInit){var objEmptyMessage=getGridEmptyMessage(objGrid);if(isLoadMore!==true&&isFiltersInit!==true){showAjaxLoader(objGrid);if(objEmptyMessage)
showAjaxLoader(objEmptyMessage);}
var objFiltersToReload=objFilters.filter(function(objFilter){return objFilter.hasClass(g_vars.CLASS_REFRESH_SOON);});showMultipleAjaxLoaders(objFiltersToReload,true);if(g_lastSyncGrids&&isLoadMore!==true){showMultipleAjaxLoaders(g_lastSyncGrids,true);}
g_lastGridAjaxCall=objGrid;objGrid.trigger(g_vars.EVENT_BEFORE_REFRESH);var lastAjaxHandle=objGrid.data("last_ajax_refresh_handle");if(lastAjaxHandle){lastAjaxHandle.abort();}
var ajaxHandle=ajaxRequest(ajaxUrl,null,null,function(response){if(isLoadMore!==true){hideAjaxLoader(objGrid);if(objEmptyMessage)
hideAjaxLoader(objEmptyMessage);}
showMultipleAjaxLoaders(objFilters,false);if(g_lastSyncGrids)
showMultipleAjaxLoaders(g_lastSyncGrids,false);operateAjaxRefreshResponse(response,objGrid,objFilters,isLoadMore);onAfterGridRefresh(objGrid);});objGrid.data("last_ajax_refresh_handle",ajaxHandle);}
function onAfterGridRefresh(objGrid){var isInitRefesh=objGrid.data("init_refresh_child_filters");if(isInitRefesh===true){objGrid.removeData("init_refresh_child_filters");var objFilters=objGrid.data("filters");var arrSelectedMain=getSelectedFilters(objFilters,"main");if(arrSelectedMain.length)
refreshAjaxGrid(objGrid,"filters_children");}}
function ________STATE_RELATED_______________(){}
function changeToHistoryState(state){if(g_showDebug==true){trace("change to history");trace(state);}
var ajaxUrl=getVal(state,"ajaxurl");var gridID=getVal(state,"gridid");var arrTerms=getVal(state,"selected_terms");if(!gridID)
return(false);if(!ajaxUrl)
return(false);var objGrid=jQuery("#"+gridID);var objFilters=objGrid.data("filters");if(!objFilters)
return(false);selectFilterItemsByTerms(objFilters,arrTerms);var responseFromCache=getResponseFromAjaxCache(ajaxUrl);if(!responseFromCache){doGridAjaxRequest(ajaxUrl,objGrid,objFilters);return(false);}
operateAjaxRefreshResponse(responseFromCache,objGrid,objFilters,false,true);}
function onPopState(){if(!history.state)
return(true);var action=getVal(history.state,"ucaction");if(!action)
return(true);switch(action){case"change":changeToHistoryState(history.state);break;default:throw new Error("Wrong history action: "+action);break;}}
function ________RUN_______________(){}
function getGridUrlFiltersString(objGrid){var objAjaxOptions=getGridAjaxOptions_simple(objGrid);if(!objAjaxOptions)
return("");var strFilters=getVal(objAjaxOptions,"filters_string");return(strFilters);}
function getGridAjaxOptions_simple(objGrid){var objFilters=objGrid.data("filters");if(!objFilters)
return(null);var objAjaxOptions=getGridAjaxOptions(objFilters,objGrid,false,false,{getonly:true});if(!objAjaxOptions)
return(null);return(objAjaxOptions);}
function isElementHiddenByDisplayNone(objElement){var element=objElement[0];var hidden=window.getComputedStyle(element).display=="none";return hidden;};function getGridAjaxOptions(objFilters,objGrid,isFiltersInitMode,isLoadMoreMode,params){if(!isLoadMoreMode)
var isLoadMoreMode=false;if(g_showDebug){trace("getGridAjaxOptions");trace("Filters:");trace(objFilters);trace("grid:");trace(objGrid);trace("is init: "+isFiltersInitMode);trace("params: ");trace(params);}
var objVisibleFilters=objFilters.filter(function(objFilter){var objParent=getFilterWrapper(objFilter);var isHidden=isElementHiddenByDisplayNone(objParent);return(!isHidden);});if(objVisibleFilters.length<objFilters.length){if(objVisibleFilters.length==0){if(g_showDebug)
trace("no visible filters");var objFilters=[];}
else{var objFirstFilter=jQuery(objVisibleFilters[0]);var visibleFilterType=getFilterType(objFirstFilter,true);if(visibleFilterType!=g_types.GENERAL_MOBILE_DRAWER){var objFilters=objVisibleFilters;if(g_showDebug){trace("Visible Filters: ");trace(objFilters);}}}}
if(!objFilters||objFilters.length==0)
return(null);var urlReplace=g_urlBase;var urlAjax=g_urlBase;var strRefreshIDs="";var isReplaceMode=false;var page=null;var offset=null;var numItems=null;var arrTerms=[];var objTaxIDs={};var strSelectedTerms="";var search="";var price_from,price_to;var orderby=null;var orderby_metaname=null;var orderby_metatype=null;var orderdir=null;var addSyncedGrids=true;var arrAllFiltersData;var arrFiltersForInit=[];var urlAddFromFilters="";var isGetUrlOnly=getVal(params,"getonly");var initModeType=getVal(params,"filters_init_type");var initModeChildrens=false;if(isFiltersInitMode==true&&initModeType=="children")
initModeChildrens=true;var wasInitMode=objGrid.data("was_init_mode");var arrFilterIDs={};jQuery.each(objFilters,function(index,objFilter){var id=objFilter.attr("id");if(arrFilterIDs.hasOwnProperty(id)==true){trace("problematic filter: ");trace(objFilter);trace("original filter found: ");trace(arrFilterIDs[id]);trace("filters list: ");trace(objFilters);throw new Error("Duplicate Filter ID found: "+id);}
arrFilterIDs[id]=objFilter;var isNoRefresh=objFilter.data("uc_norefresh");var filterRole=objFilter.data("role");var type=getFilterType(objFilter);if(g_showDebug==true){trace("filter: "+type+", role: "+filterRole);trace(objFilter);}
var urlAdd=objFilter.attr(g_vars.ATTRIBUTE_URLADD);if(urlAdd)
urlAddFromFilters=addUrlParam(urlAddFromFilters,urlAdd);switch(type){case g_types.PAGINATION:if(isFiltersInitMode==false){var isClicked=objFilter.hasClass(g_vars.CLASS_CLICKED);if(isClicked==true){var paginationData=getPaginationSelectedData(objFilter);var paginationPage=getVal(paginationData,"page");if(paginationPage)
page=paginationPage;if(g_showDebug){trace("pagination data");trace(paginationData);}
objFilter.removeClass(g_vars.CLASS_CLICKED);}}
break;case g_types.LOADMORE:if(isFiltersInitMode==true)
return(true);var isClicked=objFilter.hasClass(g_vars.CLASS_CLICKED);if(isClicked==true){var loadMoreData=getLoadMoreUrlData(objFilter);offset=loadMoreData.offset;numItems=loadMoreData.numItems;var isSingleGrid=loadMoreData.singlegrid;if(isSingleGrid==true)
addSyncedGrids=false;if(!offset)
urlAjax=null;objFilter.removeClass(g_vars.CLASS_CLICKED);}
break;case g_types.TERMS_LIST:case g_types.SELECT:var objTerm=getTermsListSelectedTerm(objFilter);if(objTerm){if(isFiltersInitMode==false){arrTerms.push(objTerm);}
else{if(initModeChildrens==true&&filterRole!="child")
arrTerms.push(objTerm);var termID=objTerm.id;if(strSelectedTerms)
strSelectedTerms+=",";strSelectedTerms+=termID;}}
var modeReplace=objFilter.data("replace-mode");if(modeReplace===true)
isReplaceMode=true;if(isLoadMoreMode==true)
isNoRefresh=true;if(g_showDebug==true){trace("Selected Term: ");trace(objTerm);}
break;case g_types.SUMMARY:isNoRefresh=true;break;case g_types.SEARCH:isNoRefresh=true;var objInput=objFilter.find("input");search=objInput.val();search=search.trim();break;case g_types.GENERAL:var generalType=objFilter.data("generaltype");if(generalType==g_types.GENERAL_MOBILE_DRAWER)
return(true);var generalIsNoRefresh=objFilter.data("norefresh");if(generalIsNoRefresh===true)
isNoRefresh=true;var filterData=getGeneralFilterData(objFilter);var dataTerms=getVal(filterData,"terms");if(dataTerms&&dataTerms.length){if(dataTerms.length==1)
arrTerms.push(dataTerms[0]);else{var operator=getVal(filterData,"operator");if(operator=="and"){var firstTerm=dataTerms[0];var objOperatorTerm={taxonomy:firstTerm.taxonomy,slug:"__ucand__",id:null};dataTerms.push(objOperatorTerm);}
arrTerms.push(dataTerms);}}
if(g_showDebug==true){trace("Filter Data:");trace(filterData);}
if(generalType=="price"){var priceFromArg=getVal(filterData,"price_from");var priceToArg=getVal(filterData,"price_to");if(priceFromArg)
price_from=roundToOneDecimal(priceFromArg);if(priceToArg)
price_to=roundToOneDecimal(priceToArg);}
var argOrderby=getVal(filterData,"orderby");if(argOrderby&&argOrderby!="default"){orderby=argOrderby;orderby_metaname=getVal(filterData,"metaname");orderby_metatype=getVal(filterData,"metatype");}
var argOrderDir=getVal(filterData,"orderdir");if(argOrderDir&&argOrderDir!="default")
orderdir=argOrderDir;if(isLoadMoreMode==true)
isNoRefresh=true;break;default:throw new Error("Unknown filter type: "+type);break;}
if(isFiltersInitMode==true){var isInit=objFilter.data("initafter");if(isInit!=true){isNoRefresh=true;}
if(initModeChildrens==false&&filterRole=="child")
isNoRefresh=true;if(initModeChildrens==true&&filterRole!="child")
isNoRefresh=true;if(isNoRefresh==false)
arrFiltersForInit.push(objFilter);}
var isFilterHidden=objFilter.hasClass(g_vars.CLASS_HIDDEN);if(isFilterHidden==true)
isNoRefresh=true;objFilter.data("uc_norefresh",false);var isMainFilter=(filterRole=="main");var isTermChild=(filterRole=="term_child");var isRefresh=true;if(isFiltersInitMode==false&&(isMainFilter===true||isTermChild==true))
isRefresh=false;if(isNoRefresh===true)
isRefresh=false;if(isRefresh==true){var filterWidgetID=getElementWidgetID(objFilter);objTaxIDs=getFilterTaxIDs(objFilter,objTaxIDs);if(strRefreshIDs)
strRefreshIDs+=",";strRefreshIDs+=filterWidgetID;if(!isGetUrlOnly)
objFilter.addClass(g_vars.CLASS_REFRESH_SOON);}});var urlAddition_filtersTest="";var strTaxIDs=getTermDsList(objTaxIDs);if(isFiltersInitMode==true){if(!strTaxIDs&&arrFiltersForInit.length==0)
urlAjax=null;else{if(urlAddition_filtersTest)
urlAddition_filtersTest+="&";urlAddition_filtersTest+="modeinit=true";}}
if(strTaxIDs&&(arrTerms.length||isFiltersInitMode==true||wasInitMode===true)){if(urlAddition_filtersTest)
urlAddition_filtersTest+="&";urlAddition_filtersTest+="testtermids="+strTaxIDs;}
g_lastSyncGrids=null;if(urlAjax==null)
return(null);var dataLayout=getElementLayoutData(objGrid,addSyncedGrids);var widgetID=dataLayout["widgetid"];var layoutID=dataLayout["layoutid"];if(addSyncedGrids==false){var syncedWidgetIDs=false;g_lastSyncGrids=null;}else{var syncedWidgetIDs=getVal(dataLayout,"synced_widgetids");g_lastSyncGrids=getVal(dataLayout,"synced_grids");}
var urlFilterString="";var urlAddition="ucfrontajaxaction=getfiltersdata&layoutid="+layoutID+"&elid="+widgetID;urlAjax=addUrlParam(urlAjax,urlAddition);if(g_isGutenberg==true)
urlAjax=addUrlParam(urlAjax,"platform=gutenberg");if(syncedWidgetIDs)
urlAjax+="&syncelids="+syncedWidgetIDs;if(urlAddition_filtersTest)
urlAjax=addUrlParam(urlAjax,urlAddition_filtersTest);if(price_from){urlAjax+="&ucpricefrom="+price_from;if(g_showDebug==true){trace("add price from");trace(urlAjax);}}
if(price_to){urlAjax+="&ucpriceto="+price_to;if(g_showDebug==true){trace("add price to");trace(urlAjax);}}
if(page){urlAjax+="&ucpage="+page;urlReplace=addUrlParam(urlReplace,"ucpage="+page);}
if(numItems)
urlAjax+="&uccount="+numItems;if(arrTerms.length){var strTerms=buildTermsQuery(arrTerms);if(strTerms)
urlAjax+="&ucterms="+strTerms;urlReplace=addUrlParam(urlReplace,"ucterms="+strTerms);urlFilterString=addUrlParam(urlFilterString,"ucterms="+strTerms);}
if(orderby){urlAjax+="&ucorderby="+orderby;urlReplace=addUrlParam(urlReplace,"ucorderby="+orderby);if(orderby_metaname){urlAjax+="&ucorderby_meta="+orderby_metaname;urlReplace=addUrlParam(urlReplace,"ucorderby_meta="+orderby_metaname);}
if(orderby_metatype){urlAjax+="&ucorderby_metatype="+orderby_metatype;urlReplace=addUrlParam(urlReplace,"ucorderby_metatype="+orderby_metatype);}}
if(orderdir){urlAjax+="&ucorderdir="+orderdir;urlReplace=addUrlParam(urlReplace,"ucorderdir="+orderdir);}
if(isFiltersInitMode&&strSelectedTerms)
urlAjax+="&ucinitselectedterms="+strSelectedTerms;if(strRefreshIDs)
urlAjax+="&addelids="+strRefreshIDs;if(isReplaceMode==true)
urlAjax+="&ucreplace=1";if(search){search=encodeURIComponent(search);urlAjax+="&ucs="+search;urlFilterString=addUrlParam(urlFilterString,"ucs="+search);urlReplace+="&ucs="+search;}
if(objGrid.hasClass("uc-avoid-duplicates")&&isLoadMoreMode==true){var strExcludePostIDs=getExcludePostIDs();if(strExcludePostIDs){urlAjax+="&ucexclude="+strExcludePostIDs;offset=null;urlFilterString=addUrlParam(urlFilterString,"ucexclude="+strExcludePostIDs);}}
if(offset){urlAjax+="&ucoffset="+offset;urlFilterString=addUrlParam(urlFilterString,"offset="+offset);}
if(urlAddFromFilters){urlAjax+=addUrlParam(urlAjax,urlAddFromFilters);urlFilterString=addUrlParam(urlFilterString,urlAddFromFilters);}
if(urlFilterString)
urlFilterString=urlFilterString.substring(1);if(isFiltersInitMode==true)
objGrid.data("was_init_mode",true);if(g_showDebug==true){trace("url ajax: "+urlAjax);}
var output={};output["ajax_url"]=urlAjax;output["url_replace"]=urlReplace;output["terms"]=arrTerms;output["search"]=search;output["filters_string"]=urlFilterString;if(g_showDebug==true){trace("output: ");trace(output);trace("End getGridAjaxOptions function");}
return(output);}
function getExcludePostIDs(){var objGrids=jQuery(".uc-avoid-duplicates");var strIDs="";jQuery.each(objGrids,function(index,grid){var objGrid=jQuery(grid);var postIDs=objGrid.data("postids");if(!postIDs)
return(true);if(strIDs)
strIDs+=",";strIDs+=postIDs;});return(strIDs);}
function ________INIT_______________(){}
function initGlobals(){if(typeof g_strFiltersData==="undefined")
return(false);g_filtersData=JSON.parse(g_strFiltersData);if(jQuery.isEmptyObject(g_filtersData)){trace("filters error - filters data not found");return(false);}
g_urlBase=getVal(g_filtersData,"urlbase");g_urlAjax=getVal(g_filtersData,"urlajax");var platform=getVal(g_filtersData,"platform");if(platform=="gutenberg"){g_isGutenberg=true;g_vars.class_widget_wrapper="ue-widget-root";g_vars.class_widget_container="ue-widget-root";g_vars.current_postid=getVal(g_filtersData,"postid");}
var objUrlKeys=getVal(g_filtersData,"urlkeys");var taxSap=getVal(objUrlKeys,"tax_sap");if(taxSap)
g_options.urlkey_taxsap=taxSap;var isShowDebug=getVal(g_filtersData,"debug");if(isShowDebug==true)
g_showDebug=true;if(g_showDebug==true)
trace("Show Filters Debug");if(!g_urlBase){trace("ue filters error - base url not inited");return(false);}
if(!g_urlAjax){trace("ue filters error - ajax url not inited");return(false);}
return(true);}
function initFilter(objFilter,type){var objGrid=getClosestGrid(objFilter);var error="Filter Parent not found! Please put the posts element on the page, and turn on 'Enable Post Filtering' option on it";if(!objGrid){showElementError(objFilter,error);return(null);}
var isAjax=objGrid.data("ajax");if(isAjax==false){showElementError(objFilter,error);return(false);}
objFilter.data("grid",objGrid);bindFilterToGrid(objGrid,objFilter);if(g_showDebug==true)
objFilter.attr("data-showdebug",true);switch(type){case g_types.TERMS_LIST:initTermsRelatedFilter(objFilter);break;case g_types.SELECT:initSelectFilter(objFilter);initTermsRelatedFilter(objFilter);break;case g_types.GENERAL:initGeneralFilter(objFilter);break;}
objFilter.trigger(g_vars.EVENT_INIT_FILTER);}
function initFilterEventsByTypes(arrTypes,arrGeneralTypes,objFilters,objParent){if(!arrTypes||arrTypes.length==0)
return(false);if(g_showDebug==true){trace("Init filter events for parent");trace(arrTypes);trace(objParent);}
for(var type in arrTypes){switch(type){case g_types.PAGINATION:objParent.on("click",".uc-filter-pagination a",onAjaxPaginationLinkClick);break;case g_types.LOADMORE:objParent.on("click",".uc-filter-load-more__link",onLoadMoreClick);break;case g_types.TERMS_LIST:objParent.on("click",".ue_taxonomy.uc-grid-filter a.ue_taxonomy_item",onTermsLinkClick);break;case g_types.SEARCH:break;case g_types.SELECT:objParent.on("change",".uc-select-filter__select",onTermsLinkClick);break;case g_types.SUMMARY:break;case g_types.GENERAL:break;default:trace("init by type - unrecognized type: "+type);break;}}
if(!arrGeneralTypes||arrGeneralTypes.length==0)
return(false);for(var generalType in arrGeneralTypes){var objFirstFilter=arrGeneralTypes[generalType];objFirstFilter.trigger(g_vars.EVENT_INIT_FILTER_TYPE,[objParent]);}}
function initGrid_setInitFiltersAfterLoad(objGrid){var objFilters=objGrid.data("filters");if(!objFilters)
return(false);if(objFilters.length==0)
return(false);var arrSelectedMain=getSelectedFilters(objFilters,"main");if(arrSelectedMain.length==0)
return(false);jQuery.each(objFilters,function(index,filter){var objFilter=jQuery(filter);var isSelected=objFilter.hasClass("uc-has-selected");var role=objFilter.data("role");if(role!="child")
return(true);var objGrid=objFilter.data("grid");addFilterToInitAfter(objFilter,objGrid);});}
function addFilterToInitAfter(objFilter,objGrid){var role=objFilter.data("role");var key="filters_init_after";if(role=="child")
key="filters_init_after_children";objFilter.data("initafter",true);var arrFiltersInitAfter=objGrid.data(key);if(!arrFiltersInitAfter)
arrFiltersInitAfter=[];arrFiltersInitAfter.push(objFilter);if(g_showDebug==true)
trace("Add init after: "+key+" | "+objFilter.attr("id"));objGrid.data(key,arrFiltersInitAfter);}
function isSpecialFilterInitAfter(objFilter,objGrid){var type=getFilterType(objFilter);if(type!=g_types.PAGINATION)
return(false);var offsetPagination=objFilter.offset();var offsetGrid=objGrid.offset();if(offsetPagination.top<offsetGrid.top){if(g_showDebug==true)
trace("Set pagination to ajax init");return(true);}
return(false);}
function initFilters(objFilters){if(g_showDebug==true){trace("init filters");if(objFilters.length==0)
trace("no filters found");else
trace(objFilters);}
var numFilters=objFilters.length;if(numFilters==0)
return(false);var arrTypes={};var arrGeneralTypes={};var objParent=getFiltersParent(objFilters);jQuery.each(objFilters,function(index,filter){var objFilter=jQuery(filter);var type=getFilterType(objFilter);if(numFilters===1){objFilter.attr("data-singlefilter",true);}
initFilter(objFilter,type);arrTypes[type]=true;if(type==g_types.GENERAL){var generalType=objFilter.data("generaltype");if(!generalType){trace(objFilter);throw new Error("The filter is missing generaltype data");}
if(arrGeneralTypes.hasOwnProperty(generalType)==false)
arrGeneralTypes[generalType]=objFilter;}
objFilter.addClass(g_vars.CLASS_FILTER_INITED);});initFilterEventsByTypes(arrTypes,arrGeneralTypes,objFilters,objParent);}
function initGrid_setAjaxUrl(objGrid){var behave=objGrid.data("filterbehave");if(behave!="mixed_back")
return(false);var objFilters=objGrid.data("filters");if(!objFilters)
return(false);if(objFilters.length==0)
return(false);var objAjaxOptions=getGridAjaxOptions(objFilters,objGrid,false,false,{getonly:true});var ajaxUrlInit=getVal(objAjaxOptions,"ajax_url");objGrid.data("initajaxurl",ajaxUrlInit);}
function initGrid_setActiveFiltersData(objGrid,objAjaxOptions){if(!objAjaxOptions)
var objAjaxOptions=getGridAjaxOptions_simple(objGrid);var arrTerms=getVal(objAjaxOptions,"terms");if(jQuery.isArray(arrTerms))
arrTerms=arrTerms.flat();var search=getVal(objAjaxOptions,"search");if(search)
search=search.trim();if(search){var objSearch={type:"search","key":"search|"+search,"title":search};if(!arrTerms)
var arrTerms=[];arrTerms.push(objSearch);}
objGrid.data("active_filters_items",arrTerms);objGrid.trigger(g_vars.EVENT_UPDATE_ACTIVE_FILTER_ITEMS,[arrTerms]);}
function initGrids(){var objGrids=getAllGrids("loaded_only");if(objGrids.length==0)
return(false);if(g_showDebug==true){trace("init grids");trace(objGrids);}
jQuery.each(objGrids,function(index,grid){var objGrid=jQuery(grid);initGrid_setAjaxUrl(objGrid);initGrid_setInitFiltersAfterLoad(objGrid);initGrid_setActiveFiltersData(objGrid);var objInitFilters=objGrid.data("filters_init_after");var isMainFiltersRefreshed=false;if(objInitFilters&&objInitFilters.length>0){isMainFiltersRefreshed=true;if(g_showDebug==true){trace("ajax init Filters");trace(objInitFilters);}
refreshAjaxGrid(objGrid,"filters");}
var objInitFiltersChildren=objGrid.data("filters_init_after_children");if(objInitFiltersChildren&&objInitFiltersChildren.length>0){if(isMainFiltersRefreshed==false){if(g_showDebug==true){trace("ajax init child Filters");trace(objInitFiltersChildren);}
refreshAjaxGrid(objGrid,"filters_children");}
else
objGrid.data("init_refresh_child_filters",true);}
objGrid.addClass("ucfilters--grid-inited");});return(objGrids);}
function initGridsEvents(objGrids){if(!objGrids||objGrids.length==0)
return(false);objGrids.on(g_vars.ACTION_REFRESH_GRID,function(){var objGrid=jQuery(this);if(g_showDebug==true){trace("Refresh grid - by event:"+g_vars.ACTION_REFRESH_GRID);console.trace();}
refreshAjaxGrid(objGrid);});objGrids.on(g_vars.ACTION_GET_FILTERS_URL,function(){var objGrid=jQuery(this);var urlFilters=getGridUrlFiltersString(objGrid);return(urlFilters);});objGrids.on(g_vars.ACTION_CLEAR_FILTERS,function(){var objGrid=jQuery(this);var arrActiveFilterItems=getGridActiveFilterItems(objGrid);if(!arrActiveFilterItems)
return(null);clearAllFilters(objGrid,null,true);objGrid.trigger(g_vars.ACTION_REFRESH_GRID);});objGrids.on(g_vars.EVENT_UNSELECT_FILTER,function(event,key){var objGrid=jQuery(this);unselectFilterItem(objGrid,key);objGrid.trigger(g_vars.ACTION_REFRESH_GRID);});}
function initGeneralEvents(){addEventListener('popstate',onPopState);g_objBody.on(g_vars.EVENT_DOM_UPDATED,runInitFilters);}
function validateGrid(objGrid){var isAjax=objGrid.data("ajax");if(isAjax==="'true'")
showElementError(objGrid,"This grid configured wrong way, missing |raw in html attributes");}
function validateGrids(){var objGrids=getAllGrids("loaded_only");jQuery.each(objGrids,function(index,grid){var objGrid=jQuery(grid);validateGrid(objGrids);});}
function runInitFilters(){validateGrids();var objFilters=jQuery(".uc-grid-filter, .uc-filter-pagination").not("."+g_vars.CLASS_FILTER_INITED);var objFiltersLoading=objFilters.filter(".uc-waitforload");if(objFiltersLoading.length&&g_initFiltersCounter<2){if(g_showDebug==true){trace(objFiltersLoading);trace("Wait for Load!");}
setTimeout(runInitFilters,500);g_initFiltersCounter++;objFilters=null;objFiltersLoading=null;return(false);}
g_initFiltersCounter=0;initFilters(objFilters);var objGrids=initGrids();initGridsEvents(objGrids);}
function init(){g_objBody=jQuery("body");var success=initGlobals();if(success==false){if(typeof window.ueFiltersTimeoutCounter!="undefined")
window.ueFiltersTimeoutCounter++;else
window.ueFiltersTimeoutCounter=0;if(window.ueFiltersTimeoutCounter==3){trace("Failed to init filters");return(false);}
setTimeout(init,200);return(false);}
if(typeof UERemoteConnection=="function")
g_remote=window.ueRemoteConnection;runInitFilters();initGeneralEvents();}
this.isElementInViewport=function(objElement){var elementTop=objElement.offset().top;var elementBottom=elementTop+objElement.outerHeight();var viewportTop=jQuery(window).scrollTop();var viewportBottom=viewportTop+jQuery(window).height();return(elementBottom>viewportTop&&elementTop<viewportBottom);}
this.runWithTrashold=function(func,trashold){if(!trashold)
var trashold=500;if(g_vars.trashold_handle)
clearTimeout(g_vars.trashold_handle);g_vars.trashold_handle=setTimeout(func,trashold);};this.getFilterElementData=function(objElement){var objData=getFilterElementData(objElement);return(objData);}
this.getFilterGridQueryData=function(objFilter){var objGrid=objFilter.data("grid");if(!objGrid)
return(null);var queryData=objGrid.attr("querydata");if(!queryData)
return(null);var objData=jQuery.parseJSON(queryData);if(g_showDebug==true){console.log("getQueryData (filter, grid, querydata): ",objFilter,objGrid,queryData);}
return(objData);}
this.getFilterItemKey=function(objItem){if(!objItem||objItem.length==0)
return(null);var key=objItem.data("key");if(key)
return(key);key="term|"+objItem.data("taxonomy")+"|"+objItem.data("slug");return(key);}
this.getVal=function(obj,name,defaultValue){return getVal(obj,name,defaultValue);}
function construct(){if(!jQuery){trace("Filters not loaded, jQuery not loaded");return(false);}
jQuery("document").ready(function(){setTimeout(init,200);});}
construct();}
g_ucDynamicFilters=new UEDynamicFilters();