"use strict";function UCManagerAdminCats(){var g_catClickReady=false;var g_catFieldRightClickReady=true;var g_maxCatHeight=450;var g_manager,g_objAjaxDataAdd=null;var g_objListCats;this.events={onRemoveSelectedCategory:function(){},onHeightChange:function(){},onOpenCategoryDialog:function(){}};var g_temp={isInited:false};var t=this;function _______________INIT______________(){}
function validateInited(){if(g_temp.isInited==false)
throw new Error("The categories is not inited");}
function initCats(objManager){if(g_temp.isInited==true)
throw new Error("Can't init cat object twice");g_manager=objManager;g_objListCats=jQuery("#list_cats");g_temp.isInited=true;if(!g_ucAdmin)
g_ucAdmin=new UniteAdminUC();initEvents();try{g_objListCats.sortable({axis:'y',start:function(event,ui){g_catClickReady=false;},update:function(){updateCatOrder();}});}catch(error){trace("error occured in jquery sortable!");trace(error);}
initAddCategoryDialog();initEditCategoryDialog();initDeleteCategoryDialog();}
function _______________GETTERS______________(){}
function getCatByID(catID){var objCat=jQuery("#category_"+catID);return(objCat);}
function getCatData(catID){var objCat=getCatByID(catID);if(objCat.length==0)
return(null);var data={};data.id=catID;data.title=objCat.data("title");data.isweb=objCat.data("isweb");data.isweb=g_ucAdmin.strToBool(data.isweb);return(data);}
this.isCatSelected=function(catID){var selectedCatID=t.getSelectedCatID();if(catID==selectedCatID)
return(true);return(false);};function _______________SETTERS______________(){}
function removeCategoryFromHtml(catID){jQuery("#category_"+catID).remove();}
this.selectFirstCategory=function(){var arrCats=getArrCats();if(arrCats.length==0)
return(false);var firstCat=arrCats[0];var catID=jQuery(firstCat).data("id");t.selectCategory(catID);}
this.runCategoryAction=function(action,catID){if(!catID)
var catID=t.getSelectedCatID();switch(action){case"add_category":openAddCategoryDialog();break;case"edit_category":openEditCategoryDialog(catID);break;case"delete_category":openDeleteCategoryDialog(catID);break;default:return(false);break;}
return(true);}
function enableCatButtons(){}
function disableCatButtons(){}
function updateCatOrder(){var arrSortCats=jQuery("#list_cats").sortable("toArray");var arrSortIDs=[];for(var i=0;i<arrSortCats.length;i++){var catHtmlID=arrSortCats[i];var catID=catHtmlID.replace("category_","");arrSortIDs.push(catID);}
var data={cat_order:arrSortIDs};g_manager.ajaxRequestManager("update_cat_order",data,g_uctext.updating_categories_order);}
function _______________ADD_CATEGORY______________(){}
function addCategory(){var data={};data.catname=jQuery("#uc_dialog_add_category_catname").val();if(g_objAjaxDataAdd&&typeof(data)=="object"){jQuery.extend(data,g_objAjaxDataAdd);}
g_ucAdmin.dialogAjaxRequest("uc_dialog_add_category","add_category",data,function(response){var html=response.htmlCat;jQuery("#list_cats").append(html);var htmlSelectCats=response.htmlSelectCats;jQuery("#select_item_category").html(htmlSelectCats);t.events.onHeightChange();});}
function openAddCategoryDialog(){g_ucAdmin.openCommonDialog("#uc_dialog_add_category",function(){jQuery("#uc_dialog_add_category_catname").val("").focus();});}
function initAddCategoryDialog(){jQuery("#uc_dialog_add_category_action").on("click",addCategory);jQuery("#uc_dialog_add_category_catname").keyup(function(event){if(event.keyCode==13)
addCategory();});}
function _______________EDIT_CATEGORY______________(){}
function openEditCategoryDialog(catID){if(catID==-1)
return(false);var cat=getCatByID(catID);if(cat.length==0){trace("category with id: "+catID+" don't exists");return(false);}
if(jQuery.isNumeric(catID)==false)
return(false);var dialogEdit=jQuery("#uc_dialog_edit_category");var isCustom=dialogEdit.data("custom");dialogEdit.data("catid",catID);if(!isCustom){jQuery("#span_catdialog_id").html(catID);var title=cat.data("title");jQuery("#uc_dialog_edit_category_title").val(title).focus();}
var options={minWidth:900};g_ucAdmin.openCommonDialog("#uc_dialog_edit_category",function(){if(!isCustom)
jQuery("#uc_dialog_edit_category_title").select();else{t.events.onOpenCategoryDialog(dialogEdit,catID);}},options);}
function updateCategoryTitle(){var dialogEdit=jQuery("#uc_dialog_edit_category");var catID=dialogEdit.data("catid");var cat=getCatByID(catID);var newTitle=jQuery("#uc_dialog_edit_category_title").val();var data={catID:catID,title:newTitle};if(g_objAjaxDataAdd&&typeof(data)=="object"){jQuery.extend(data,g_objAjaxDataAdd);}
g_ucAdmin.dialogAjaxRequest("uc_dialog_edit_category","update_category",data,function(response){t.updateTitle(catID,newTitle);});}
this.updateTitle=function(catID,newTitle){var objCat=getCatByID(catID);var numItems=objCat.data("numaddons");var newTitleShow=newTitle;if(numItems&&numItems!=undefined&&numItems>0)
newTitleShow+=" ("+numItems+")";objCat.html("<span>"+newTitleShow+"</span>");objCat.data("title",newTitle);};function initEditCategoryDialog(){var objEditDialog=jQuery("#uc_dialog_edit_category");if(objEditDialog.length==0)
return(false);var isCustom=objEditDialog.data("custom");if(isCustom)
return(false);jQuery("#uc_dialog_edit_category_action").on("click",updateCategoryTitle);jQuery("#uc_dialog_edit_category_title").doOnEnter(updateCategoryTitle);}
function _______________DELETE_CATEGORY______________(){}
function deleteCategory(){var dialogDelete=jQuery("#uc_dialog_delete_category");var catID=dialogDelete.data("catid");var data={};data.catID=catID;var selectedCatID=t.getSelectedCatID();var isSelectedRemoved=(catID==selectedCatID);if(g_objAjaxDataAdd&&typeof(data)=="object"){jQuery.extend(data,g_objAjaxDataAdd);}
g_ucAdmin.dialogAjaxRequest("uc_dialog_delete_category","remove_category",data,function(response){removeCategoryFromHtml(catID);var htmlSelectCats=response.htmlSelectCats;jQuery("#select_item_category").html(htmlSelectCats);if(isSelectedRemoved==true){t.events.onRemoveSelectedCategory();t.selectFirstCategory();}
t.events.onHeightChange();});}
function openDeleteCategoryDialog(catID){if(catID==-1)
return(false);var cat=getCatByID(catID);if(cat.length==0){trace("category with id: "+catID+" don't exists");return(false);}
var dialogDelete=jQuery("#uc_dialog_delete_category");dialogDelete.data("catid",catID);var title=cat.data("title");jQuery("#uc_dialog_delete_category_catname").html(title);g_ucAdmin.openCommonDialog("#uc_dialog_delete_category");}
function initDeleteCategoryDialog(){jQuery("#uc_dialog_delete_category_action").on("click",deleteCategory);}
function _______________EVENTS______________(){}
function onCatListItemClick(event){if(g_ucAdmin.isRightButtonPressed(event))
return(true);if(g_catClickReady==false)
return(false);if(jQuery(this).hasClass("selected-item"))
return(false);var catID=jQuery(this).data("id");t.selectCategory(catID);}
function onCatListItemDblClick(event){if(g_ucAdmin.isRightButtonPressed(event))
return(true);if(g_catClickReady==false)
return(false);var catID=jQuery(this).data("id");t.runCategoryAction("edit_category",catID);}
function onCatListItemMousedown(event){if(g_ucAdmin.isRightButtonPressed(event))
return(true);g_catClickReady=true;}
function onCategoryContextMenu(event){g_catFieldRightClickReady=false;var objCat=jQuery(this);var catID=objCat.data("id");if(catID==0||catID=="all")
return(false);var objMenu=jQuery("#rightmenu_cat");objMenu.data("catid",catID);g_manager.showMenuOnMousePos(event,objMenu);}
function onCatsFieldContextMenu(event){event.preventDefault();if(g_catFieldRightClickReady==false){g_catFieldRightClickReady=true;return(true);}
var objMenu=jQuery("#rightmenu_catfield");g_manager.showMenuOnMousePos(event,objMenu);}
function onActionByttonClick(){var objButton=jQuery(this);if(!g_ucAdmin.isButtonEnabled(objButton))
return(false);var action=objButton.data("action");t.runCategoryAction(action);}
function initEvents(){jQuery(".uc-cat-action-button").on("click",onActionByttonClick);jQuery("#list_cats").on("mouseover","li",function(){jQuery(this).addClass("item-hover");});jQuery("#list_cats").on("mouseout","li",function(){jQuery(this).removeClass("item-hover");});jQuery("#list_cats").on("click","li",onCatListItemClick);jQuery("#list_cats").on("dblclick","li",onCatListItemDblClick);jQuery("#list_cats").on("mousedown","li",onCatListItemMousedown);jQuery("#list_cats").on("contextmenu","li",onCategoryContextMenu);jQuery("#cats_section").on("contextmenu",onCatsFieldContextMenu);}
this._______________EXTERNAL_GETTERS______________=function(){}
this.getSelectedCatID=function(){var objCat=g_objListCats.find("li.selected-item");if(objCat.length==0)
return(-1);var catID=objCat.data("id");return(catID);};this.getSelectedCatData=function(){var selectedCatID=t.getSelectedCatID();if(selectedCatID==-1)
return(null);var data=getCatData(selectedCatID);return(data);};this.isSomeCatSelected=function(){var selectedCatID=t.getSelectedCatID();if(selectedCatID==-1)
return(false);return(true);};this.getCatsHeight=function(){var catsWrapper=jQuery("#cats_section .cat_list_wrapper");var catHeight=catsWrapper.height();if(catHeight>g_maxCatHeight)
catHeight=g_maxCatHeight;return(catHeight);};function getArrCats(){var arrCats=jQuery("#list_cats li").get();return(arrCats);}
this.getNumCats=function(){var numCats=jQuery("#list_cats li").length;return(numCats);};this.getMouseOverCat=function(){var arrCats=getArrCats();for(var index in arrCats){var objCat=arrCats[index];objCat=jQuery(objCat);var isMouseOver=objCat.ismouseover();if(isMouseOver==true)
return(objCat);}
return(null);};this._______________EXTERNAL_SETTERS______________=function(){}
this.setObjAjaxAddData=function(objData){g_objAjaxDataAdd=objData;};this.setHeight=function(height){jQuery("#cats_section").css("height",height+"px");};this.setHtmlListCats=function(htmlCats){jQuery("#list_cats").html(htmlCats);};this.selectCategory=function(catID){var fullCatID="#category_"+catID;var cat=jQuery(fullCatID);if(cat.length==0){return(false);}
cat.removeClass("item-hover");if(cat.hasClass("selected-item"))
return(false);jQuery("#list_cats li").removeClass("selected-item");cat.addClass("selected-item");g_manager.onCatSelect(catID);return(true);};this.getContextMenuCatID=function(){var catID=jQuery("#rightmenu_cat").data("catid");return(catID);};this.destroy=function(){jQuery("#button_add_category").off("click");jQuery("#button_remove_category").off("click");jQuery("#button_edit_category").off("click");var objListItems=jQuery("#list_cats").find("li");objListItems.off("mouseover");objListItems.off("mouseout");objListItems.off("click");objListItems.off("dblclick");objListItems.off("mousedown");jQuery("#list_cats").off("contextmenu");jQuery("#cats_section").off("contextmenu");};this.init=function(objManager){initCats(objManager);};}