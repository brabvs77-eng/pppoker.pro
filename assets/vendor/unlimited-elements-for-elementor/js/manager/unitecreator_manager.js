"use strict";function UCManagerAdmin(){var g_objWrapper=null;var t=this;var g_objCats,g_arrPlugins=[],g_arrPluginsObj=[];var g_arrActionsFunctions=[];var g_objItems=new UCManagerAdminItems();var g_objActions,g_type,g_name,g_passData,g_customOptions={},g_objAjaxDataAdd=null;var g_minHeight=450;var g_temp={hasCats:true,updateHeight:true};this.events={ITEM_HIDE_EMPTY_TEXT:"hide_empty_text",ITEM_MOUSEOVER:"item_mouseover",ITEM_MOUSEOUT:"item_mouseout",ITEM_SELECTION_CHANGE:"item_selection_change"};function ___________GENERAL_FUNCTIONS________________(){}
this.triggerEvent=function(eventName,params){if(!params)
var params=null;g_objWrapper.trigger(eventName,params);}
this.onEvent=function(eventName,func){g_objWrapper.on(eventName,func);}
this.updateGlobalHeight=function(catHeight,itemsHeight){setManagerWidthClass();if(g_temp.updateHeight==false)
return(true);if(!catHeight||catHeight===null){if(g_objCats)
var catHeight=g_objCats.getCatsHeight();else
var catHeight=0;}
if(!itemsHeight)
var itemsHeight=g_objItems.getItemsMaxHeight();var maxHeight=catHeight;if(itemsHeight>maxHeight)
maxHeight=itemsHeight;maxHeight+=20;if(maxHeight<g_minHeight)
maxHeight=g_minHeight;g_objItems.setHeight(maxHeight);if(g_objCats)
g_objCats.setHeight(maxHeight);}
function setManagerWidthClass(){g_objItems.updateWrapperSizeClass();}
this.setTotalHeight=function(totalHeight){g_objItems.setHeight(totalHeight);if(g_objCats){var catHeight=totalHeight+50;g_objCats.setHeight(catHeight);}}
function validateInited(){var isInited=g_objWrapper.data("inited");if(isInited===true)
throw new Error("Can't init manager twice");g_objWrapper.data("inited",true);}
function validateNotInited(){if(!g_objWrapper)
return(false);var isInited=g_objWrapper.data("inited");if(isInited===true)
throw new Error("The manager has to be not inited for this operation");}
this.destroy=function(){g_objWrapper.add("#manager_shadow_overlay").off("contextmenu");g_objWrapper.find(".unite-context-menu li a").off("mouseup");g_objWrapper.find("#button_items_operation").off("click");if(g_objCats)
g_objCats.destroy();g_objItems.destroy();g_objActions.destroy();g_objWrapper.html("");g_objWrapper=null;}
this.___________PLUGINS_EXTERNAL________________=function(){}
this.addPlugin=function(plugin){validateNotInited();g_arrPlugins.push(plugin);}
this.addActionFunction=function(func){if(typeof func!="function")
throw new Error("the action function should be a function type");g_arrActionsFunctions.push(func);};this.getActionFunctions=function(){return(g_arrActionsFunctions);};this.___________EXTERNAL_GETTERS________________=function(){}
this.getCustomOption=function(name){if(g_customOptions.hasOwnProperty(name)==false)
return(undefined);var value=g_customOptions[name];return(value);};this.getItemsData=function(){if(typeof g_objActions.getItemsData!="function")
throw new Error("get items data function not exists in this type");var arrItems=g_objActions.getItemsData();return(arrItems);}
this.getItemsDataJson=function(){var data=t.getItemsData();if(typeof data!="object")
return("");var dataJson=JSON.stringify(data);return(dataJson);}
this.getObjCats=function(){return(g_objCats);}
this.getObjItems=function(){return(g_objItems);}
this.getObjWrapper=function(){return(g_objWrapper);}
this.getMouseOverItem=function(){if(g_objCats){var catItem=g_objCats.getMouseOverCat();if(catItem)
return(catItem);}
var item=g_objItems.getMouseOverItem();return(item);}
this.isItemsAreaEnabled=function(){if(!g_objCats)
return(true);if(g_objCats&&g_objCats.isSomeCatSelected()==false)
return(false);return(true);}
this.___________EXTERNAL_SETTERS________________=function(){}
this.showMenuOnMousePos=function(event,objMenu){var objOffset=g_objWrapper.offset();var managerY=objOffset.top;var managerX=objOffset.left;var menuX=Math.round(event.pageX-managerX);var menuY=Math.round(event.pageY-managerY);var menuHeight=objMenu.height();var menuEndY=menuY+menuHeight;var parentHeight=g_objWrapper.height();if(menuEndY>parentHeight)
menuY=menuY-menuHeight;jQuery("#manager_shadow_overlay").show();objMenu.css({"left":menuX+"px","top":menuY+"px"}).show();}
this.hideContextMenus=function(){jQuery("#manager_shadow_overlay").hide();jQuery("ul.unite-context-menu").hide();};this.isHasCats=function(){return(g_temp.hasCats);};function onContextMenuClick(){var objLink=jQuery(this);var action=objLink.data("operation");var objMenu=objLink.parents("ul.unite-context-menu");var menuType=objMenu.data("type");var data=null;switch(menuType){case"category":data=g_objCats.getContextMenuCatID();break;}
var actionFound=false;if(g_objCats)
actionFound=g_objCats.runCategoryAction(action,data);if(actionFound==false)
t.runItemAction(action,data);t.hideContextMenus();}
function initContextMenus(){g_objWrapper.add("#manager_shadow_overlay").on("contextmenu",function(event){event.preventDefault();});g_objWrapper.find(".unite-context-menu li a").mouseup(onContextMenuClick);}
function initPlugins(){if(g_arrPlugins.length==0)
return(false);jQuery.each(g_arrPlugins,function(index,pluginClass){if(typeof eval(pluginClass)!="function")
throw new Error("Plugin "+pluginClass+" not found");var objPlugin=eval("new "+pluginClass+"()");objPlugin.init(t);});}
function initManager(selectedCatID){g_objWrapper=jQuery("#uc_managerw");if(g_objWrapper.length==0)
return(false);g_type=g_objWrapper.data("type");g_name=g_objWrapper.data("managername");g_passData=g_objWrapper.data("passdata");var objText=g_objWrapper.data("text");if(objText&&typeof objText=="object"){jQuery.extend(g_uctext,objText);g_objWrapper.removeAttr("data-text");}
if(g_type=="inline")
g_minHeight=210;validateInited();var objCatsSection=jQuery("#cats_section");if(objCatsSection.length==0){g_temp.hasCats=false;g_objCats=null;}else{g_objCats=new UCManagerAdminCats();}
if(!g_ucAdmin)
g_ucAdmin=new UniteAdminUC();if(g_temp.hasCats==true)
initCategories();switch(g_type){case"addons":g_objActions=new UCManagerActionsAddons();break;case"inline":g_objActions=new UCManagerActionsInline();break;case"pages":g_objActions=new UCManagerActionsPages();break;default:throw new Error("Wrong manager type: "+g_type);break;}
if(g_objActions)
g_objActions.init(t);g_objItems.validateInited();if(g_objCats){if(selectedCatID){var isSelected=g_objCats.selectCategory(selectedCatID);if(isSelected===false)
g_objCats.selectFirstCategory();}
else
g_objCats.selectFirstCategory();}
t.updateGlobalHeight();initPlugins();};function ___________CATEGORIES________________(){}
function initCategories(){g_objCats.init(t);g_objCats.events.onRemoveSelectedCategory=function(){t.clearItemsPanel();};g_objCats.events.onHeightChange=function(){t.updateGlobalHeight();};}
function ___________ITEMS_FUNCTIONS________________(){}
function updateBottomOperations(){var numSelected=g_objItems.getNumItemsSelected();var numCats=0;if(g_objCats)
var numCats=g_objCats.getNumCats();jQuery("#num_items_selected").html(numSelected);if(numCats<=1){jQuery("#item_operations_wrapper").hide();return(false);}
jQuery("#item_operations_wrapper").show();if(numSelected>0){jQuery("#select_item_category").prop("disabled","");jQuery("#item_operations_wrapper").removeClass("unite-disabled");jQuery("#button_items_operation").removeClass("button-disabled");}else{jQuery("#select_item_category").prop("disabled","disabled");jQuery("#button_items_operation").addClass("button-disabled");jQuery("#item_operations_wrapper").addClass("unite-disabled");}
jQuery("#select_item_category option").show();var arrOptions=jQuery("#select_item_category option").get();var firstSelected=false;var selectedCatID=g_objCats.getSelectedCatID();for(var index in arrOptions){var objOption=jQuery(arrOptions[index]);var value=objOption.prop("value");if(value==selectedCatID)
objOption.hide();else
if(firstSelected==false){objOption.prop("selected","selected");firstSelected=true;}}}
this.runItemAction=function(action,data){g_objActions.runItemAction(action,data);};this.onCatSelect=function(catID){g_objActions.runItemAction("get_cat_items",catID);g_objItems.unselectAllItems("selectCategory");};this.ajaxRequestManager=function(action,data,status,funcSuccess){jQuery("#status_loader").show();jQuery("#status_text").show().html(status);if(g_objAjaxDataAdd&&typeof(data)=="object"){jQuery.extend(data,g_objAjaxDataAdd);}
g_ucAdmin.ajaxRequest(action,data,function(response){jQuery("#status_loader").hide();jQuery("#status_text").hide();if(typeof funcSuccess=="function")
funcSuccess(response);g_objItems.checkSelectRelatedItems();});}
function onBottomOperationsClick(){var arrIDs=g_objItems.getSelectedItemIDs();if(arrIDs.length==0)
return(false);var selectedCatID=g_objCats.getSelectedCatID();var targetCatID=jQuery("#select_item_category").val();if(targetCatID==selectedCatID){alert("Can't move addons to same category");return(false);}
var data={};data.targetCatID=targetCatID;data.selectedCatID=selectedCatID;data.arrAddonIDs=arrIDs;g_objActions.runItemAction("move_items",data);}
this.setCustomOptions=function(options){g_customOptions=options;};this.setItemsFromData=function(arrItems){if(typeof g_objActions.setItemsFromData!="function")
throw new Error("set items from data function not exists in this type");g_objActions.setItemsFromData(arrItems);};this.clearItemsPanel=function(){g_objItems.clearItemsPanel();}
this.setObjAjaxAddData=function(objData){g_objAjaxDataAdd=objData;}
this.___________EXTERNAL_INIT________________=function(){}
this.initBottomOperations=function(){g_objWrapper.find("#button_items_operation").on("click",onBottomOperationsClick);}
this.initItems=function(){g_objItems.initItems(t);g_objItems.events.onItemSelectionChange=function(){updateBottomOperations();t.triggerEvent(t.events.ITEM_SELECTION_CHANGE);};g_objItems.events.onHeightChange=function(itemsHeight){t.updateGlobalHeight(null,itemsHeight);};initContextMenus();if(g_temp.hasCats==false)
g_objItems.updatePanelView();};this.getManagerName=function(){return(g_name);};this.getManagerPassData=function(){return(g_passData);}
this.setNotUpdateHeight=function(){g_temp.updateHeight=false;}
this.initManager=function(selectedCatID){initManager(selectedCatID);};};