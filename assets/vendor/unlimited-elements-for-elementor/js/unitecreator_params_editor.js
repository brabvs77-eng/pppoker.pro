"use strict";function UniteCreatorParamsEditor(){var t=this;var g_objWrapper,g_objTableBody,g_objEmptyParams,g_type;var g_objDialog=new UniteCreatorParamsDialog(),g_buttonAddParam;var g_buttonAddImageBase,g_objLastParam,g_objCatsWrapper,g_objCopyCatSection;var g_objParamsDialogSpecial;if(!g_ucAdmin)
var g_ucAdmin=new UniteAdminUC();this.events={UPDATE:"update",BULK:"bulk"};var g_temp={hasCats:false,isItemsType:false,funcOnUpdate:function(){},DEFAULT_CAT:"cat_general_general",CLASS_MOVE_MODE:"uc-move-mode",LOCAL_STORAGE_KEY:"uc_param_cat_copied",HOUR_IN_MS:60*60*1000,counter:0};function ______________GETTERS______________(){}
function getRowData(objRow){var data=objRow.data("paramdata");if(g_temp.hasCats==true){var catid=objRow.data("catid");if(catid)
data["__attr_catid__"]=catid;}
var objReturn={};jQuery.extend(objReturn,data);return(objReturn);}
function getParamsRows(isSelected){if(!g_objTableBody)
throw new Error("The params editor is not inited yet");var selector="tr";if(isSelected===true)
selector="tr.uc-selected";var rows=g_objTableBody.find(selector);return(rows);}
function isParamDataExists(key,value){var rows=getParamsRows();for(var i=0;i<rows.length;i++){var objRow=jQuery(rows[i]);var objParam=getRowData(objRow);if(objParam[key]==value)
return(true);}
return(false);}
function isParamTypeExists(type){var isExists=isParamDataExists("type",type);return(isExists);}
function isParamNameExists(name){var isExists=isParamDataExists("name",name);return(isExists);}
function getDuplicateNewName(name){var newName=name+"_copy";var isExists=isParamNameExists(newName);if(isExists==false)
return(newName);var counter=1;do{counter++;newName=newName+counter;isExists=isParamNameExists(newName);}while(isExists==true);return(newName);}
function getParamsRow(rowIndex){var rows=getParamsRows();if(rowIndex>=rows.length)
throw new Error("Row with index: "+rowIndex+" not found");var objRow=jQuery(rows[rowIndex]);return(objRow);}
function getNumParams(){var rows=getParamsRows();return rows.length;}
function getTypeTitle(type){var typeTitle=type;if(g_uctext.hasOwnProperty(type))
typeTitle=g_uctext[type];return(typeTitle);}
this.getParamsData=function(paramsType,isAssoc,filterCatID){var rows=getParamsRows();var arrParams=[];jQuery.each(rows,function(index,row){var objRow=jQuery(row);var objParam=getRowData(objRow);if(filterCatID){var paramCatID=g_ucAdmin.getVal(objParam,"__attr_catid__");if(paramCatID!=filterCatID)
return(true);}
if(paramsType=="control"){switch(objParam.type){case"uc_dropdown":case"uc_radioboolean":case"uc_checkbox":case"uc_multiple_select":break;default:return(true);break;}}
arrParams.push(objParam);});if(isAssoc==true){var objParams={};jQuery.each(arrParams,function(index,param){var name=param.name;objParams[name]=param;});return(objParams);}else
return(arrParams);};this.getCatData=function(){return getCatsData();}
function getParamRowHtml_getConditionTextRow(objParam,suffix){var conditionText="";var conditionAttribute=g_ucAdmin.getVal(objParam,"condition_attribute"+suffix);if(!conditionAttribute){return(null);}
var conditionOperator=g_ucAdmin.getVal(objParam,"condition_operator"+suffix);var conditionValue=g_ucAdmin.getVal(objParam,"condition_value"+suffix);conditionText=conditionAttribute;if(conditionOperator=="equal")
conditionText+=" = ";else
conditionText+=" != ";conditionText+=conditionValue;if(!conditionValue)
conditionText+="[null]";return(conditionText);}
function getParamRowHtml_getConditionText(objParam){var textRow1=getParamRowHtml_getConditionTextRow(objParam,"");if(!textRow1)
return(null);var textRow2=getParamRowHtml_getConditionTextRow(objParam,"2");var text=textRow1;if(textRow2)
text+=" and "+textRow2;return(text);}
function getParamRowHtml(objParam){var typeTitle=getTypeTitle(objParam.type);var html="<tr>";var paramError=null;if(objParam.hasOwnProperty("param_error"))
paramError=objParam["param_error"];var textRowAdd="";var linkClass="";var linkTitle="";if(paramError){linkTitle="title='"+paramError+"'";linkClass=" unite-color-red";textRowAdd="class='unite-color-red' title='"+paramError+"'";}
var isAdminLabel=g_ucAdmin.getVal(objParam,"admin_label",false,g_ucAdmin.getvalopt.FORCE_BOOLEAN);var adminLabelClass=(isAdminLabel==true)?" label-active":"";var enableCondition=g_ucAdmin.getVal(objParam,"enable_condition",false,g_ucAdmin.getvalopt.FORCE_BOOLEAN);var conditionText=null;if(enableCondition==true){var conditionAttribute=g_ucAdmin.getVal(objParam,"condition_attribute");if(!conditionAttribute)
enableCondition=false;else
conditionText=getParamRowHtml_getConditionText(objParam);}
var tabText=null;var tabName=g_ucAdmin.getVal(objParam,"tabname");tabName=jQuery.trim(tabName);if(tabName)
tabText=tabName;html+=" <td class='uc-hide-on-movemode uc-table-nowrap'><div class='uc-table-row-handle'></div><div class='uc-table-admin-label"+adminLabelClass+"' title='Admin Label'></div></td>";html+=" <td class='uc-show-on-movemode'> <input type='checkbox' class='uc-check-param-move' data-name='"+objParam.name+"'> </td>";html+=" <td>";html+="<a class='uc-button-edit-param"+linkClass+"' "+linkTitle+" href='javascript:void(0)'>"+objParam.title+"</a>";if(enableCondition)
html+="<div class='uc-text-condition' title='"+g_uctext["display_condition"]+"'>"+conditionText+"</div>";if(tabText)
html+="<div class='uc-text-tab'>"+tabText+"</div>";html+="</td>";html+=" <td "+textRowAdd+">"+objParam.name+"</td>";html+=" <td "+textRowAdd+">"+typeTitle+"</td>";html+=" <td>"
switch(objParam.type){case"uc_checkbox":var checked="";if(objParam.is_checked=="true")
checked=" checked ";html+="<input type='checkbox' "+checked+" readonly>";html+="<span>"+objParam.text_near+"</span>";break;case"uc_dropdown":html+="<select>";var options=objParam.options;var defaultValue=objParam.default_value;if(typeof options=="object"){jQuery.each(options,function(name,value){var selected="";if(value==defaultValue)
selected="selected='selected'";html+="<option val='"+value+"' "+selected+">"+name+"</option>";});}
html+="</select>"
break;case"uc_radioboolean":var trueChecked=" checked";var falseChecked="";if(objParam.default_value==objParam.false_value){trueChecked="";falseChecked=" checked";}
html+="<label><input type='radio' "+trueChecked+" name="+objParam.name+"></input>"+objParam.true_name+"</label>";html+="<label><input type='radio' "+falseChecked+" name="+objParam.name+"></input>"+objParam.false_name+"</label>";break;case"uc_number":var unit=objParam.unit;if(unit=="other")
unit=objParam.unit_custom;html+="<input type='text' class='unite-input-number' readonly value='"+objParam.default_value+"'>&nbsp;"+unit;break;case"uc_colorpicker":html+="<input type='text' class='input-color unite-float-left' readonly value='"+objParam.default_value+"'>";html+="<div class='colorpicker-bar' style='background-color:"+objParam.default_value+"'></div>";break;case"uc_textarea":case"uc_editor":html+="<textarea readonly>"+objParam.default_value+"</textarea>";break;case"uc_image":html+="<input type='text' class='unite-input-image' readonly value=''>";html+="<a disabled readonly class='unite-button-secondary button-disabled'>"+g_uctext.choose_image+"</a>";break;case"uc_mp3":html+="<input type='text' class='unite-input-image' readonly value=''>";html+="<a disabled readonly class='unite-button-secondary button-disabled'>"+g_uctext.choose_audio+"</a>";break;default:var defaultValue="";if(objParam.hasOwnProperty("default_value"))
defaultValue=objParam.default_value;html+="<input type='text' readonly value='"+defaultValue+"'>";break;}
html+=" </td>"
var deleteClass="";if(paramError)
deleteClass=" unite-bold";html+=" <td class='uc-table-nowrap'>";html+="  <a href='javascript:void(0)' class='unite-button-secondary uc-button-delete-param "+deleteClass+"' title='"+g_uctext.delete_op+"' ><i class='far fa-trash-alt'></i></a>";html+="  <a href='javascript:void(0)' class='unite-button-secondary uc-button-duplicate-param' title='"+g_uctext.duplicate_op+"'><i class='far fa-clone'></i></a>";html+="  <a href='javascript:void(0)' class='unite-button-secondary uc-button-bulk-param' title='"+g_uctext.bulk+"'><i class='far fa-copy'></i></a>";html+=" </td>";html+="</tr>";return(html);}
function getCatParamsData(catid){var arrParams=t.getParamsData(null,false,catid);return(arrParams);}
function ______________CATS______________(){}
function getNumCatRows(paramCatID){var objCatIDs=getCatIDs();var objNumbers={};var objRows=getParamsRows();jQuery.each(objRows,function(index,row){var objRow=jQuery(row);var catID=objRow.data("catid");if(!catID)
catID=g_temp.DEFAULT_CAT;if(objCatIDs.hasOwnProperty(catID)==false)
catID=g_temp.DEFAULT_CAT;var numCats=g_ucAdmin.getVal(objNumbers,catID);if(!numCats)
numCats=0;numCats++;objNumbers[catID]=numCats;});var arrCatIDs=getCatIDs();jQuery.each(arrCatIDs,function(catID){if(objNumbers.hasOwnProperty(catID)==false)
objNumbers[catID]=0;});if(paramCatID){var catNumber=g_ucAdmin.getVal(objNumbers,paramCatID);if(!catNumber)
catNumber=0;return(catNumber);}
return(objNumbers);}
function getCurrentCat(){if(g_temp.hasCats==false)
return(null);var objCat=g_objCatsWrapper.find(".uc-attr-list-sections li.uc-active");if(objCat.length==0||objCat.length>1)
return(null);return(objCat);}
function getCurrentCatData(name){var objCat=getCurrentCat();var data=getCatData(objCat);if(name=="id")
return(data.id);if(name=="title")
return(data.title)
return(data);}
function getCatIDs(tab){var objIDs={};var objRows=g_objCatsWrapper.find(".uc-attr-list-sections li");jQuery.each(objRows,function(index,row){var objRow=jQuery(row);var catID=objRow.data("id");objIDs[catID]=true;});return(objIDs);}
function getCatByID(catID){if(!catID)
return(null);var cat=jQuery("#"+catID);if(cat.length==0)
return(null);return(cat);}
function getCatData(objRow,includeTab){var objTitle=objRow.find(".uc-attr-list__section-title");var title=objTitle.html();title=jQuery.trim(title);var catID=objRow.data("id");var data={};var conditionsData=getConditionsCatData(catID);if(conditionsData&&jQuery.isEmptyObject(conditionsData)==false&&typeof conditionsData=="object")
jQuery.extend(data,conditionsData);data["id"]=catID;data["title"]=title;if(includeTab===true)
data["tab"]=getCatTab(objRow);return(data);}
function getCatTab(objRow){var objList=objRow.parents(".uc-attr-list-sections");var tab=objList.data("tab");return(tab);}
function getCatsData_tab(objCats,name){var objList=jQuery("#uc_attr_list_sections_"+name);var objlistItems=objList.children("li");var tab=objList.data("tab");jQuery.each(objlistItems,function(index,item){var objItem=jQuery(item);var data=getCatData(objItem);data.tab=tab;objCats.push(data);});return(objCats);}
function getCatsData(){if(g_temp.hasCats==false)
return(null);var objCats=[];objCats=getCatsData_tab(objCats,"content");objCats=getCatsData_tab(objCats,"style");return(objCats);}
function updateCatNumItems(objCat,numItems){if(!objCat)
return(false);var objNumItems=objCat.find(".uc-attr-list__section-numitems");g_ucAdmin.validateDomElement(objNumItems,"num items object of category");var html="("+numItems+")";objNumItems.html(html);}
function updateCurrentCatNumItems(){var objNumParams=getNumCatRows();for(var catID in objNumParams){var numParams=objNumParams[catID];var objCat=getCatByID(catID);if(!objCat)
continue;updateCatNumItems(objCat,numParams);}}
function renameCategory(objCat,newTitle,isMoveToEnd){if(typeof objCat=="string")
objCat=getCatByID(objCat);g_ucAdmin.validateDomElement(objCat,"category");var objTitle=objCat.find(".uc-attr-list__section-title");objTitle.html(newTitle);if(isMoveToEnd===true){var objParent=objCat.parent();objParent.append(objCat);}}
function updateParamsVisibilityByCats(){if(g_temp.hasCats==false)
return(false);var currentCatID=getCurrentCatData("id");var objRows=getParamsRows();jQuery.each(objRows,function(index,row){var objRow=jQuery(row);var catID=objRow.data("catid");if(currentCatID==catID)
objRow.show();else
objRow.hide();});}
function addCatToTab(tab,catTitle,catID,objData){var data=jQuery.extend({},objData);delete data.id;delete data.tab;delete data.title;var objCat=getCatByID(catID);if(objCat){renameCategory(objCat,catTitle,true);updateCatConditionsData(catID,data);return(false);}
if(!catID)
var catID="cat_"+tab+"_"+g_ucAdmin.getRandomString(8);if(catTitle.length>60){g_temp.counter++;catTitle="Long Category "+g_temp.counter;}
var html="<li id='"+catID+"' data-id='"+catID+"'>";html+="<span class=\"uc-attr-list__section-title\">";html+=g_ucAdmin.htmlspecialchars(catTitle);html+="</span>";html+="<span class=\"uc-attr-list__section-numitems\"></span>";html+="<i class=\"uc-attr-list-sections__icon-edit fas fa-pen uc-hide-on-movemode\" title=\""+g_uctext.edit_section+"\"></i>";html+="<i class=\"uc-attr-list-sections__icon-delete fas fa-trash uc-hide-on-movemode\" title=\""+g_uctext.delete_section+"\"></i>";html+="<i class=\"uc-attr-list-sections__icon-copy fas fa-copy uc-hide-on-movemode\" title=\""+g_uctext.copy_section+"\"></i>";html+="<i class=\"uc-attr-list-sections__icon-move fas fa-bullseye uc-show-on-movemode\" title=\"Move Here\"></i>";html+="</li>";var objCat=jQuery(html);var objList=jQuery("#uc_attr_list_sections_"+tab);g_ucAdmin.validateNotEmpty(objList,"list sections");objList.append(objCat);updateCatConditionsData(catID,data);return(catID);}
function isMoveMode(){var isMoveMode=g_objWrapper.hasClass(g_temp.CLASS_MOVE_MODE);return(isMoveMode);}
function switchCatMoveMode(isMove){if(isMove===undefined)
var isMove=true;if(isMove==true){g_objWrapper.addClass(g_temp.CLASS_MOVE_MODE);}
else
g_objWrapper.removeClass(g_temp.CLASS_MOVE_MODE);clearAllMoveCheckboxes();}
function selectCategory(objCat){if(objCat.hasClass("uc-active"))
return(true);var isMove=isMoveMode();if(isMove==true)
return(true);var objActiveCat=g_objCatsWrapper.find(".uc-attr-list-sections li.uc-active");objActiveCat.removeClass("uc-active");objCat.addClass("uc-active");updateParamsVisibilityByCats();}
function onCatClick(){var objCat=jQuery(this);selectCategory(objCat);}
function onEditCatIconClick(){var objCurrentCat=getCurrentCat();if(objCurrentCat==null)
return(false);openAddEditCatDialog(null,objCurrentCat);}
function onDeleteCatIconClick(event){event.stopPropagation();var objCurrentCat=getCurrentCat();var catData=getCatData(objCurrentCat,true);var catID=catData.id;var numRows=getNumCatRows(catID);if(numRows>0){alert(g_uctext.delete_section_error);return(false);}
if(catID==g_temp.DEFAULT_CAT){alert(g_uctext.delete_default_section_error);return(false);}
var objSelectCat=objCurrentCat.prev();if(objSelectCat.length==0)
objSelectCat=objCurrentCat.next();if(objSelectCat.length==0)
objSelectCat=getCatById(g_temp.DEFAULT_CAT);objCurrentCat.remove();selectCategory(objSelectCat);}
function clearAllMoveCheckboxes(){var objCheckboxes=g_objWrapper.find("input.uc-check-param-move");objCheckboxes.prop("checked","");updateCheckedParams();}
function updateCheckedParams(){var objCheckboxes=g_objWrapper.find("input.uc-check-param-move");var hasSelected=false;var numSelected=0;jQuery.each(objCheckboxes,function(index,checkbox){var objCheckbox=jQuery(checkbox);var isChecked=objCheckbox.is(":checked");var objParam=objCheckbox.parents("tr");if(isChecked){objParam.addClass("uc-selected");hasSelected=true;numSelected++;}
else
objParam.removeClass("uc-selected");});if(hasSelected==true)
g_objWrapper.addClass("uc-has-selected");else
g_objWrapper.removeClass("uc-has-selected");var objNumSelected=jQuery("#uc_attr_cats_selected_text_number");objNumSelected.html(numSelected);}
function onMoveParamsClick(){var objButton=jQuery(this);var objCatRow=objButton.parents("li");if(objCatRow.length==0)
return(false);var catData=getCatData(objCatRow,false);var catID=catData.id;var objSelectedRows=getParamsRows(true);jQuery.each(objSelectedRows,function(index,row){var objRow=jQuery(row);objRow.data("catid",catID);});clearAllMoveCheckboxes();updateParamsVisibilityByCats();triggerEvent(t.events.UPDATE);switchCatMoveMode(false);}
function initCatsEvents(){var objAddButtons=g_objCatsWrapper.find(".uc-attr-cats__button-add");objAddButtons.on("click",onCatAddSectionClick);var buttonAddSectionDialog=jQuery("#uc_dialog_attribute_category_button_addsection");buttonAddSectionDialog.on("click",onDialogAddSectionClick);var inputTitleDialog=jQuery("#uc_dialog_attribute_category_addsection .uc-section-title");g_ucAdmin.validateDomElement(inputTitleDialog,"dialog input");inputTitleDialog.doOnEnter(onDialogAddSectionClick);var objListContent=jQuery("#uc_attr_list_sections_content");var objListStyle=jQuery("#uc_attr_list_sections_style");objListContent.sortable();objListStyle.sortable();g_objCatsWrapper.on("click",".uc-attr-list-sections li",onCatClick);g_objCatsWrapper.on("click",".uc-attr-list-sections__icon-edit",onEditCatIconClick);g_objCatsWrapper.on("click",".uc-attr-list-sections__icon-delete",onDeleteCatIconClick);g_objCatsWrapper.on("click",".uc-attr-list-sections__icon-copy",onCopyCatIconClick);var objButtonSwitchMoveMode=jQuery("#uc_attr_button_switch_move_mode");objButtonSwitchMoveMode.on("click",function(){switchCatMoveMode()});var objButtonStopMoveMode=jQuery("#uc_attr_button_stop_move_mode");objButtonStopMoveMode.on("click",function(){switchCatMoveMode(false)});g_objWrapper.on("click",".uc-check-param-move",updateCheckedParams);var objClearSelected=jQuery("#uc_attr_cats_selected_clear");objClearSelected.on("click",clearAllMoveCheckboxes);g_objWrapper.on("click",".uc-attr-list-sections__icon-move",onMoveParamsClick);var objCatsDialog=jQuery("#uc_dialog_attribute_category_addsection");g_objParamsDialogSpecial=new UniteCreatorParamsDialog();g_objParamsDialogSpecial.initSectionsConditions(objCatsDialog,t);}
function onUpdateInternal(){if(g_temp.hasCats==false)
return(true);updateCurrentCatNumItems();}
function initCatsFromData(arrParamsCats){if(!arrParamsCats)
return(false);if(jQuery.isArray(arrParamsCats)==false)
return(false);jQuery.each(arrParamsCats,function(index,objCat){var tab=g_ucAdmin.getVal(objCat,"tab");var title=g_ucAdmin.getVal(objCat,"title");var id=g_ucAdmin.getVal(objCat,"id");addCatToTab(tab,title,id,objCat);});}
function ______________COPY_CATEGORY______________(){}
function onCopyCatIconClick(){var objIcon=jQuery(this);var objCatRow=objIcon.parents("li");var catData=getCatData(objCatRow);var catTitle=catData.title;var catID=catData.id;var arrParams=getCatParamsData(catID);var objSaveData={};objSaveData["title"]=catTitle;objSaveData["params"]=arrParams;var currentTimeStamp=Date.now();var expireTime=currentTimeStamp+g_temp.HOUR_IN_MS;objSaveData["expire"]=expireTime;var strSaveData=g_ucAdmin.encodeObjectForSave(objSaveData);try{window.localStorage.setItem(g_temp.LOCAL_STORAGE_KEY,strSaveData);}catch(e){alert("local storage not available in your site");return(null);}
showBottomCopySection(catTitle);}
function showBottomCopySection(title){var objName=g_objCopyCatSection.find(".uc-attr-cats-copied-section__name");objName.html(title);g_objCopyCatSection.show();}
function copySectionGetStoredData(){try{var strData=window.localStorage.getItem(g_temp.LOCAL_STORAGE_KEY);}catch(e){return(null);}
if(!strData)
return(null);var jsonData=g_ucAdmin.decodeContent(strData);var objData=JSON.parse(jsonData);return(objData);}
function clearCopiedSection(){try{window.localStorage.removeItem(g_temp.LOCAL_STORAGE_KEY);}catch(e){return(null);}
g_objCopyCatSection.hide();}
function pasteCopiedSection(){var objButton=jQuery(this);var tab=objButton.data("tab");var objData=copySectionGetStoredData();if(!objData)
return(false);var title=g_ucAdmin.getVal(objData,"title");var catID=addCatToTab(tab,title,null,objData);var params=g_ucAdmin.getVal(objData,"params");if(!params)
params=[];jQuery.each(params,function(index,param){param["__attr_catid__"]=catID;addParamRow(param);});clearCopiedSection();var objCat=getCatByID(catID);selectCategory(objCat);}
function initCopiedSectionEvents(){jQuery("#uc_attr_cats_copied_section_clear").on("click",clearCopiedSection);jQuery("#uc_attr_cats_copied_section_paste_content").on("click",pasteCopiedSection);jQuery("#uc_attr_cats_copied_section_paste_style").on("click",pasteCopiedSection);}
function initCopyCatSection(){if(g_temp.hasCats==false)
return(false);g_objCopyCatSection=jQuery("#uc_attr_cats_copied_section");if(g_objCopyCatSection.length==0)
return(false);initCopiedSectionEvents();var objData=copySectionGetStoredData();var title=g_ucAdmin.getVal(objData,"title");var expire=g_ucAdmin.getVal(objData,"expire");if(!expire){clearCopiedSection();return(false);}
var currentTime=jQuery.now();if(currentTime>expire){clearCopiedSection();return(false);}
if(!title)
return(false);if(objData)
showBottomCopySection(title);}
function ______________CAT_DIALOG______________(){}
function openAddEditCatDialog(tab,objCatRow){var isEditMode=false;if(objCatRow){var catData=getCatData(objCatRow,true);isEditMode=true;}
var dialogID="uc_dialog_attribute_category_addsection";var objDialog=jQuery("#"+dialogID);if(isEditMode==false){var dialogTitle=objDialog.data("title_add");var buttonText=objDialog.data("button_add");objDialog.data("tab",tab);objDialog.data("is_edit",false);objDialog.data("catid",null);}
else{var dialogTitle=objDialog.data("title_edit");var buttonText=objDialog.data("button_update");objDialog.data("is_edit",true);objDialog.data("catid",catData.id);}
var dialogOptions={title:dialogTitle};g_ucAdmin.openCommonDialog(objDialog,function(){var objError=objDialog.find(".uc-error-message");objError.html("").hide();var objInput=objDialog.find(".uc-section-title");var objButton=objDialog.find(".uc-button-add-section");if(isEditMode==true){var catTitle=catData.title;var objInputTitle=objDialog.find(".uc-section-title");objInputTitle.val(catTitle);}else{objInput.val("");}
objButton.html(buttonText);g_objParamsDialogSpecial.handleSectionConditions(catData);objInput.focus();},dialogOptions);}
function onCatAddSectionClick(){var objButton=jQuery(this);var tab=objButton.data("sectiontab");openAddEditCatDialog(tab);}
function getDialogConditionsData(objDialog){var objData={};var objWrapper=objDialog.find(".uc-dialog-param");if(objWrapper.length==0)
return(false);var objInputs=objWrapper.find("input,select");jQuery.each(objInputs,function(index,input){var objInput=jQuery(input);var type=g_ucAdmin.getInputType(objInput);switch(type){case"checkbox":var value=objInput.is(":checked");break;case"select":var value=objInput.val();break;default:trace(objInput);throw new Error("Wrong input type: "+type);break;}
var name=objInput.prop("name");objData[name]=value;});return(objData);}
function onDialogAddSectionClick(){var dialogID="uc_dialog_attribute_category_addsection";var objDialog=jQuery("#"+dialogID);var objInput=objDialog.find(".uc-section-title");var catTitle=objInput.val();var objError=objDialog.find(".uc-error-message");catTitle=jQuery.trim(catTitle);var conditionsData=getDialogConditionsData(objDialog);if(!catTitle){var textError=objError.data("error_empty");objError.show().html(textError);objInput.focus();return(false);}
objError.hide();var isEdit=objDialog.data("is_edit");if(isEdit===true){var catID=objDialog.data("catid");renameCategory(catID,catTitle);updateCatConditionsData(catID,conditionsData);}else{var tab=objDialog.data("tab");var catID=addCatToTab(tab,catTitle,null,conditionsData);}
objDialog.dialog("close");}
function updateCatConditionsData(catID,catData){var objCat=getCatByID(catID);if(!objCat)
return(false);objCat.data("catdata",catData);}
function getConditionsCatData(catID){var objCat=getCatByID(catID);var data=objCat.data("catdata");if(!data)
var data={};return(data);}
function ______________ACTIONS______________(){}
function addParamRow(objParam,rowBefore,noEventTrigger){if(!rowBefore)
var rowBefore=null;var html=getParamRowHtml(objParam);var objRow=jQuery(html).data("paramdata",objParam);if(rowBefore){objRow.insertAfter(rowBefore);}else{g_objTableBody.append(objRow);g_objEmptyParams.hide();}
if(g_temp.hasCats==true){var objCatIDs=getCatIDs();var currentCatID=getCurrentCatData("id");var catID=g_ucAdmin.getVal(objParam,"__attr_catid__");if(!catID)
catID=currentCatID;if(objCatIDs.hasOwnProperty(catID)==false)
catID=currentCatID;objRow.data("catid",catID);if(catID!=currentCatID&&objCatIDs.hasOwnProperty(catID))
objRow.hide();}
g_objLastParam=objParam;if(noEventTrigger!==true)
triggerEvent(t.events.UPDATE);}
function updateParamRow(rowIndex,objParam){if(typeof rowIndex=="object")
var objRow=rowIndex;else
var objRow=getParamsRow(rowIndex);var html=getParamRowHtml(objParam);var objNewRow=jQuery(html).data("paramdata",objParam);if(g_temp.hasCats==true){var catID=objRow.data("catid");objNewRow.data("catid",catID);}
objRow.replaceWith(objNewRow);g_objLastParam=objParam;triggerEvent(t.events.UPDATE);}
function removeParamRow(objRow){objRow.remove();var numParams=getNumParams();if(numParams==0)
g_objEmptyParams.show();g_objLastParam=null;triggerEvent(t.events.UPDATE);}
function duplicateParamRow(objRow){var rowData=getRowData(objRow);var name=rowData.name;rowData.name=getDuplicateNewName(name);addParamRow(rowData,objRow);}
function ______________EVENTS______________(){}
function triggerEvent(eventName,params){if(!params)
var params=null;g_objWrapper.trigger(eventName,params);}
this.onEvent=function(eventName,func){g_objWrapper.on(eventName,func);};function onDeleteParamClick(){var objRow=jQuery(this).parents("tr");removeParamRow(objRow);}
function onEditParamClick(){var objRow=jQuery(this).parents("tr");var paramData=getRowData(objRow);switch(paramData.type){case"uc_imagebase":alert("no edit yet, sorry. will be in the future working on it...");return(false);break;}
var rowIndex=objRow.index();g_objDialog.open(paramData,rowIndex,function(objParam,rowIndex){updateParamRow(rowIndex,objParam);},g_type);}
this.onAddParamButtonClick=function(data){if(!data)
var data=null;g_objDialog.open(data,null,function(objParam){addParamRow(objParam);},g_type);};function onDuplicateParamClick(){var objRow=jQuery(this).parents("tr");duplicateParamRow(objRow);}
function onBulkParamClick(){var objRow=jQuery(this).parents("tr");var paramData=getRowData(objRow);var data={};var rowIndex=objRow.index();data["param_type"]=g_type;data["param_position"]=rowIndex;data["param_data"]=paramData;triggerEvent(t.events.BULK,data);}
function initEvents(){g_objWrapper.on("click",".uc-button-delete-param",onDeleteParamClick);g_objWrapper.on("click",".uc-button-edit-param",onEditParamClick);g_objWrapper.on("click",".uc-button-duplicate-param",onDuplicateParamClick);g_objWrapper.on("click",".uc-button-bulk-param",onBulkParamClick);g_objTableBody.sortable({handle:".uc-table-row-handle"});g_buttonAddParam.on("click",function(){t.onAddParamButtonClick();});t.onEvent(t.events.UPDATE,function(){onUpdateInternal();g_temp.funcOnUpdate();});if(g_temp.hasCats==true){initCatsEvents();}}
function initParamsFromObject(arrParams){if(!arrParams)
return(false);jQuery.each(arrParams,function(index,objParam){addParamRow(objParam,null,true);});if(arrParams.length==0)
g_objEmptyParams.show();else
g_objEmptyParams.hide();triggerEvent(t.events.UPDATE);}
function ______________ITEMS_TYPE______________(){}
function onAddImageBaseClick(){var isEnabled=g_ucAdmin.isButtonEnabled(g_buttonAddImageBase);if(isEnabled==false)
return(false);var isExists=isParamTypeExists("uc_imagebase");if(isExists==true)
return(false);var objParam={};objParam["type"]="uc_imagebase";objParam["name"]="imagebase_fields";objParam["title"]="Image Base Fields";addParamRow(objParam);}
function initItemsType(){g_buttonAddImageBase=g_objWrapper.find(".uc-button-add-imagebase");g_buttonAddImageBase.on("click",onAddImageBaseClick);t.onEvent(t.events.UPDATE,function(){var isImageBaseExists=isParamTypeExists("uc_imagebase");if(isImageBaseExists==true){g_ucAdmin.disableButton(g_buttonAddImageBase);}else{g_ucAdmin.enableButton(g_buttonAddImageBase);}});}
this.onUpdateEvent=function(func){g_temp.funcOnUpdate=func;}
this.getLastUpdatedParam=function(){return(g_objLastParam);}
this.getControlParams=function(){var arrData=t.getParamsData("control",true);return(arrData);};this.init=function(objWrapper,objParams,objDialog,arrParamsCats){g_objWrapper=objWrapper;g_objCatsWrapper=g_objWrapper.find(".uc-attr-cats-wrapper");if(g_objCatsWrapper.length){g_temp.hasCats=true;initCatsFromData(arrParamsCats);}
else
g_objCatsWrapper=null;var type=objWrapper.data("type");if(type=="items")
g_temp.isItemsType=true;g_type=type;g_objTableBody=g_objWrapper.find(".uc-table-params tbody");g_objEmptyParams=g_objWrapper.find(".uc-text-empty-params");g_buttonAddParam=g_objWrapper.find(".uc-button-add-param");g_objDialog=objDialog;initEvents();if(g_temp.isItemsType==true)
initItemsType();initParamsFromObject(objParams);initCopyCatSection();};}