"use strict";function UniteCreatorIncludes(){var t=this;var g_objListJs,g_objListCss,g_objIncludesWrapper;var g_parent;if(0==1){g_parent=new UniteCreatorAdmin();}
var g_temp={funcOnDelete:null,funcOnInputBlur:null};if(!g_ucAdmin)
var g_ucAdmin=new UniteAdminUC();this.getIncludesTabData=function(){var arrJS=[];var arrJSLib=[];var arrCSS=[];var inputJsLib=jQuery("#uc-js-libraries input[type='checkbox']");var rowsJs=jQuery("#uc-js-includes li");var rowsCSS=jQuery("#uc-css-includes li");jQuery.each(inputJsLib,function(index,input){var objInput=jQuery(input);var isChecked=objInput.is(":checked");if(isChecked==false)
return(true);var libName=objInput.data("include");arrJSLib.push(libName);});jQuery.each(rowsJs,function(index,row){var objRow=jQuery(row);var data=getIncludeData(objRow,true);arrJS.push(data);});jQuery.each(rowsCSS,function(index,row){var objRow=jQuery(row);var data=getIncludeData(objRow,true);arrCSS.push(data);});var output={arrJS:arrJS,arrJSLib:arrJSLib,arrCSS:arrCSS};return(output);}
this.getArrAllIncludesUrls=function(){var data=t.getIncludesTabData();var arrIncludes=[];jQuery.each(data.arrJS,function(index,include){arrIncludes.push(include.url);});jQuery.each(data.arrCSS,function(index,include){arrIncludes.push(include.url);});return(arrIncludes);}
function getHtmlCondition(objCondition){if(!objCondition)
return("");var html="";if(objCondition.name=="never_include")
html="<span class='uc-condition-never'>"+g_uctext.never_include+"</span>";else
html="when "+objCondition.name+" = "+objCondition.value;return(html);}
function getHtmlStateText(item){if(!item)
return(null);var text="";var params=g_ucAdmin.getVal(item,"params");var includeAfterFrontend=g_ucAdmin.getVal(params,"include_after_elementor_frontend");includeAfterFrontend=g_ucAdmin.strToBool(includeAfterFrontend);if(includeAfterFrontend==true)
text+="include after <b>elementor-frontend.js</b>";var includeHandle=g_ucAdmin.getVal(params,"include_handle");if(includeHandle){if(text)
text+=", ";text+="handle: <b>"+includeHandle+"</b>";}
var module=g_ucAdmin.getVal(params,"include_as_module");if(module){if(text)
text+=", ";text+=" type: <b>module</b>";}
return(text);}
function updateInputExtraHTML(objRow,rowParams){var objText=objRow.find(".uc-includes-state-text");var item={params:rowParams};var html=getHtmlStateText(item);objText.show();objText.html(html);}
function getIncludeListHTML(item){var url="";var objCondition=null;if(item){if(typeof item=="string")
url=item;else{url=url=item.url;if(item.hasOwnProperty("condition")){objCondition=item.condition;if(typeof objCondition!="object")
objCondition=null;}}}
var title="";var objInfo=g_ucAdmin.pathinfo(url);var filename=objInfo.basename;var conditionStyle=" style='display:none'";var htmlCondition="";if(objCondition){htmlCondition=getHtmlCondition(objCondition);conditionStyle="";}
var htmlStateText=getHtmlStateText(item);var attributesStyle=" style='display:none'";if(htmlStateText)
attributesStyle="";var html='<li>';html+='<div class="uc-includes-handle"></div>';html+='<input type="text" class="uc-includes-url" value="'+url+'">';html+='<input type="text" class="uc-includes-filename" value="'+filename+'" readonly>';html+='<div class="uc-includes-icon uc-includes-delete" title="'+g_uctext.delete_include+'"></div>';html+='<div class="uc-includes-icon uc-includes-add" title="'+g_uctext.add_include+'"></div>';html+='<div class="uc-includes-icon uc-includes-settings" title="'+g_uctext.include_settings+'"></div>';html+='<div class="unite-clear"></div>';html+='<div class="uc-condition-container" '+conditionStyle+'>'+htmlCondition+'</div>';html+='<div class="uc-includes-state-text" '+attributesStyle+'>'+htmlStateText+'</div>';html+='</li>';var objHtml=jQuery(html);if(objCondition)
objHtml.data("condition",objCondition);var objParams=g_ucAdmin.getVal(item,"params");if(objParams)
objHtml.data("params",objParams);return(objHtml)}
function addIncludesListItem(objList,item){var objItem=getIncludeListHTML(item);objList.append(objItem);return(objItem);}
function updateIncludesListItem(objInput,url){objInput.val(url);objInput.trigger("change");}
function getEmptyIncludeInput(objList){var objInputs=objList.find("input");var returnInput=null;jQuery.each(objInputs,function(index,input){var objInput=jQuery(input);var val=objInput.val();val=jQuery.trim(val);if(val==""){returnInput=objInput;return(false);}});return(returnInput);}
this.addIncludesFromAssets=function(objItem){switch(objItem.type){case"js":var objList=jQuery("#uc-js-includes");break;case"css":var objList=jQuery("#uc-css-includes");break;default:return(false);break;}
var url=objItem.full_url;var filename=objItem.file;var objInput=getEmptyIncludeInput(objList);if(objInput==null)
addIncludesListItem(objList,url,filename);else{updateIncludesListItem(objInput,url);}}
this.removeIncludeByAsset=function(itemData){var url=itemData.full_url;switch(itemData.type){case"js":var inputs=jQuery("#uc-js-includes input");break;case"css":var inputs=jQuery("#uc-css-includes input");break;default:return(false);break;}
jQuery.each(inputs,function(index,input){var objInput=jQuery(input);var inputUrl=objInput.val();inputUrl=jQuery.trim(inputUrl);if(inputUrl==url){var listItem=objInput.parents("li");deleteIncludesListItem(listItem);}});}
function getIncludesListNumItems(objList){var items=objList.children("li");var numItems=items.length;return(numItems);}
function getIncludeData(objRow,noFilename){var data={};data.url=objRow.find(".uc-includes-url").val();data.url=jQuery.trim(data.url);if(noFilename!==true){data.filename=objRow.find(".uc-includes-filename").val();data.filename=jQuery.trim(data.filename);}
data.condition=objRow.data("condition");if(!data.condition&&typeof data.condition!="object")
data.condition=null;var objParams=objRow.data("params");if(!objParams)
objParams=null;data.params=objParams;return(data);}
function clearIncludesTabInputs(){g_objIncludesWrapper.find("input").each(function(inedx,input){var objInput=jQuery(input);var initval=objInput.data("initval");if(initval==undefined)
initval="";objInput.val(initval);});}
function onAddClick(){var objButton=jQuery(this);var objList=objButton.parents("ul");var objItem=addIncludesListItem(objList);var objInput=objItem.find("input");objInput.focus();}
function onDeleteClick(){var objButton=jQuery(this);var objItem=objButton.parents("li");deleteIncludesListItem(objItem);if(typeof g_temp.funcOnDelete=="function")
g_temp.funcOnDelete();}
function deleteIncludesListItem(objItem){var objList=objItem.parents("ul");objItem.remove();var numItems=getIncludesListNumItems(objList);if(numItems==0)
addIncludesListItem(objList);}
function initIncludeList(objList){var data=objList.data("init");if(!data||typeof data!="object"||data.length==0){addIncludesListItem(objList);return(false);}
jQuery.each(data,function(index,item){addIncludesListItem(objList,item);});}
function onInputUrlChange(){var objInput=jQuery(this);if(typeof g_temp.funcOnInputBlur=="function")
g_temp.funcOnInputBlur(objInput);var objInputFilename=objInput.siblings(".uc-includes-filename");var url=objInput.val();var info=g_ucAdmin.pathinfo(url);var filename=info.basename;objInputFilename.val(filename);}
function ______________SETTINGS_DIALOG_____________(){}
function dialogSettings_fillParams(arrParams,objData){var objDialog=jQuery("#uc_dialog_unclude_settings");var objValueContainer=jQuery("#uc_dialog_include_value_container");objValueContainer.hide();var selectParams=jQuery("#uc_dialog_include_attr");selectParams.html("");g_ucAdmin.addOptionToSelect(selectParams,"","["+g_uctext.always+"]");g_ucAdmin.addOptionToSelect(selectParams,"never_include","["+g_uctext.never_include+"]");jQuery.each(arrParams,function(index,param){g_ucAdmin.addOptionToSelect(selectParams,param.name,param.name);});if(objData.condition){var paramName=objData.condition.name;var selectedValue="";if(paramName&&paramName!="never_include"){if(arrParams.hasOwnProperty(paramName)==false)
paramName="never_include";else{var param=arrParams[paramName];var selectedValue=objData.condition.value;}}
selectParams.val(paramName);updateSettingsDialogValues(arrParams,selectedValue);}
var objInputs=objDialog.find("input[type='checkbox'],input[type='text']");var objParams=g_ucAdmin.getVal(objData,"params");if(!objParams)
objParams=null;jQuery.each(objInputs,function(index,input){var type=input.type.toLowerCase();var objInput=jQuery(input);var name=objInput.prop("name");var value=g_ucAdmin.getVal(objParams,name);switch(type){default:case"text":objInput.val(value);break;case"checkbox":value=g_ucAdmin.strToBool(value);objInput.prop("checked",value);break;}});}
function dialogSettings_fillValuesSelect(objParam,selectedValue){var objSelectValues=jQuery("#uc_dialog_include_values");objSelectValues.html("");var arrValues=[];switch(objParam.type){case"uc_radioboolean":g_ucAdmin.addOptionToSelect(objSelectValues,objParam.true_value,objParam.true_value);g_ucAdmin.addOptionToSelect(objSelectValues,objParam.false_value,objParam.false_value);arrValues.push(objParam.true_value);arrValues.push(objParam.false_value);break;case"uc_dropdown":jQuery.each(objParam.options,function(optionName,optionValue){g_ucAdmin.addOptionToSelect(objSelectValues,optionValue,optionName);arrValues.push(optionValue);});break;}
if(selectedValue){if(jQuery.isArray(selectedValue))
var isFound=true;else
var isFound=(jQuery.inArray(selectedValue,arrValues)!=-1)
if(isFound==true)
objSelectValues.val(selectedValue);}}
function updateInputCondition(objRow,paramName,paramValue){var objCondition=objRow.find(".uc-condition-container");if(jQuery.trim(paramName)==""){objCondition.html("").hide();objRow.removeData("condition");}
else{var data={name:paramName,value:paramValue};objRow.data("condition",data);objCondition.show();var htmlCondition=getHtmlCondition(data);objCondition.html(htmlCondition);}}
function openIncludeSettingsDialog(){var objRow=jQuery(this).parents("li");var objList=objRow.parents("ul");var listType=objList.data("type");var data=getIncludeData(objRow);var objDialog=jQuery("#uc_dialog_unclude_settings");objDialog.data("objRow",objRow);if(listType=="js"){objDialog.addClass("uc-include-type-js");}else{objDialog.removeClass("uc-include-type-js");}
var buttonOpts={};buttonOpts[g_uctext.update]=function(){var paramName=jQuery("#uc_dialog_include_attr").val();var paramValue=jQuery("#uc_dialog_include_values").val();updateInputCondition(objRow,paramName,paramValue);var rowParams={};var objInputs=objDialog.find("input[type='checkbox'],input[type='text']");jQuery.each(objInputs,function(index,input){var type=input.type.toLowerCase();var name=input.name;switch(type){case"checkbox":var objCheckbox=jQuery(input);var isChecked=objCheckbox.is(":checked");if(isChecked==true)
rowParams[name]=true;break;default:case"text":rowParams[name]=input.value;break;}});updateInputExtraHTML(objRow,rowParams);objRow.data("params",rowParams);objDialog.dialog("close");}
buttonOpts[g_uctext.cancel]=function(){objDialog.dialog("close");};var title=g_uctext.include_settings+": "+data.filename;objDialog.dialog({dialogClass:"unite-ui",buttons:buttonOpts,title:title,minWidth:700,modal:true,open:function(){var arrParams=g_parent.getControlParams();dialogSettings_fillParams(arrParams,data);}});}
function updateSettingsDialogValues(objParams,selectedValue){var paramName=jQuery("#uc_dialog_include_attr").val();if(paramName==""||paramName=="never_include"){jQuery("#uc_dialog_include_value_container").hide();return(true);}
jQuery("#uc_dialog_include_value_container").show();if(!objParams)
var objParams=g_parent.getControlParams();if(objParams.hasOwnProperty(paramName)==false)
throw new Error("param: "+paramName+" not found");var objParam=objParams[paramName];dialogSettings_fillValuesSelect(objParam,selectedValue);}
function initSettingsDialog(){jQuery("#uc_dialog_include_attr").change(function(){updateSettingsDialogValues();});}
function ______________INIT_____________(){}
function initEvents(){g_objIncludesWrapper.on("click",".uc-includes-add",onAddClick);g_objIncludesWrapper.on("click",".uc-includes-delete",onDeleteClick);g_objIncludesWrapper.on("click",".uc-includes-settings",openIncludeSettingsDialog);g_objIncludesWrapper.on("blur",".uc-includes-url",onInputUrlChange);g_objIncludesWrapper.on("change",".uc-includes-url",onInputUrlChange);}
function init(){g_objIncludesWrapper=jQuery("#uc_includes_wrapper");g_objListJs=jQuery("#uc-js-includes");g_objListCss=jQuery("#uc-css-includes");clearIncludesTabInputs();initIncludeList(g_objListJs);initIncludeList(g_objListCss);g_objIncludesWrapper.find("ul").sortable({handle:".uc-includes-handle"});initSettingsDialog();initEvents();}
this.initIncludesTab=function(objParent){g_parent=objParent;init();}
this.eventOnDelete=function(func){g_temp.funcOnDelete=func;}
this.eventOnInputBlur=function(func){g_temp.funcOnInputBlur=func;}}