"use strict";function UniteCreatorParamsPanel(){var g_objWrapper,g_prefix="",g_type,g_arrConstants={};var g_objFiltersWrapper,g_activeFilter=null,g_objThumbSizes=null,g_objImageAddParams;var g_objChildKeys=null,g_objSkipParams=null,g_objAddKeys=null,g_objTemplateCode=null;var t=this;var g_constants={PARAM_CHILD_KEYS:"param_panel_child_keys"};var g_temp={funcOnClick:function(){}};var events={DELETE_VARIABLE:"delete_variable",EDIT_VARIABLE:"edit_variable"};if(!g_ucAdmin)
var g_ucAdmin=new UniteAdminUC();function validateInited(){if(!g_objWrapper)
throw new Error("The panel is not inited");}
function getPrefix(filter){if(typeof g_prefix=="string")
return(g_prefix);if(!filter||typeof g_prefix!="object")
return("");if(g_prefix.hasOwnProperty(filter)==false)
return("");var prefix=g_prefix[filter];return(prefix);}
function getTemplateCode(key,paramName,parentName){var strCode=g_ucAdmin.getVal(g_objTemplateCode,key);if(!strCode)
throw new Error("Template code with key: "+key+" not found");if(paramName)
strCode=g_ucAdmin.replaceAll(strCode,"[param_name]",paramName);if(parentName)
strCode=g_ucAdmin.replaceAll(strCode,"[param_prefix]",parentName);return(strCode);}
function ___________ADD_PARAMS___________(){}
function addImageBaseParams(objParam,filter){var arrParams=["image","thumb","description"];jQuery.each(arrParams,function(index,name){addParam(name,null,filter);});}
function addTextareaParam(objParam,filter){var name=objParam.name;addParam(name+"|raw",null,filter);}
function addChildParams(objParentParam,arrChildKeys,filter){var baseName=objParentParam.name;var parentName=baseName;var paramParent={name:parentName,is_parent:true,parent_open_onclick:true};var visual=g_ucAdmin.getVal(objParentParam,"visual");if(visual)
paramParent.visual=visual;addParam(paramParent,null,filter);jQuery.each(arrChildKeys,function(index,objChildParam){var objParamInsert=jQuery.extend({},objChildParam);if(typeof objChildParam=="string"){objParamInsert.name=objChildParam;objParamInsert.original_name=objChildParam;objParamInsert.noslashes=true;}else{objParamInsert.name=baseName+"."+objChildParam.name;objParamInsert.original_name=objChildParam.name;}
objParamInsert.parent_name=parentName;objParamInsert.is_child=true;addParam(objParamInsert,null,filter);});}
function addAddParams(objParentParam,arrAddKeys,filter){var parentName=objParentParam["name"];jQuery.each(arrAddKeys,function(index,objAddParam){var condition=g_ucAdmin.getVal(objAddParam,"condition");if(condition=="responsive"){var isResponsive=g_ucAdmin.getVal(objParentParam,"is_responsive");isResponsive=g_ucAdmin.strToBool(isResponsive);if(isResponsive==false)
return(true);}
var objParamInsert=jQuery.extend({},objAddParam);var rawVisual=g_ucAdmin.getVal(objParamInsert,"rawvisual");rawVisual=g_ucAdmin.strToBool(rawVisual);var paramInsertName=objParamInsert["name"];if(paramInsertName===null){paramInsertName=parentName;}
else
if(g_type!="item"&&rawVisual!==true){paramInsertName=parentName+"_"+objParamInsert["name"];}
paramInsertName=paramInsertName.replace("[parent_name]",parentName);var rawInsertText=g_ucAdmin.getVal(objParamInsert,"raw_insert_text");if(rawInsertText){rawInsertText=g_ucAdmin.replaceAll(rawInsertText,"[parent_name]",parentName);objParamInsert["raw_insert_text"]=rawInsertText;}
objParamInsert["name"]=paramInsertName;addParam(objParamInsert,null,filter);});}
function addParam(objParam,type,filter){if(typeof objParam=="string"){objParam={name:objParam,type:"uc_textfield"};}
if(type)
objParam.type=type;var paramType=g_ucAdmin.getVal(objParam,"type");var name=objParam.name;var isSkip=g_ucAdmin.getVal(g_objSkipParams,paramType);isSkip=g_ucAdmin.strToBool(isSkip);if(isSkip==true)
return(false);var rawInsertText=null;var paramVisual=null;var isTakeChildred=false;switch(paramType){case"uc_textfield":if(typeof objParam["font_editable"]!=="undefined")
name+="|raw";break;case"uc_hr":return(false);break;case"uc_imagebase":addImageBaseParams(objParam,filter);return(false);break;case"uc_textarea":addTextareaParam(objParam,filter);return(false);break;case"uc_posts_list":rawInsertText=getTemplateCode("no_items_code",name);paramVisual=name+" wrapping code";break;case"uc_font_override":if(g_type!="css")
return(false);rawInsertText="{{put_font_override('"+name+"','.selector',true)}}";paramVisual="{{"+name+"_font_override"+"}}";break;case"uc_dataset":if(g_type=="item")
isTakeChildred=true;else{rawInsertText=getTemplateCode("no_items_code",name);paramVisual=name+" wrapping code";}
break;case"uc_image":isTakeChildred=true;var mediaType=g_ucAdmin.getVal(objParam,"media_type");if(mediaType=="json")
isTakeChildred=false;break;default:isTakeChildred=true;break;}
if(isTakeChildred==true){var arrChildKeys=g_ucAdmin.getVal(g_objChildKeys,objParam.type);if(arrChildKeys){addChildParams(objParam,arrChildKeys,filter);return(false);}
var arrAddKeys=g_ucAdmin.getVal(g_objAddKeys,objParam.type);if(arrAddKeys){addAddParams(objParam,arrAddKeys,filter);return(false);}}
var originalName=g_ucAdmin.getVal(objParam,"original_name");switch(originalName){case"no_items_code":var childParamName=objParam.parent_name+"."+objParam.child_param_name;rawInsertText=getTemplateCode("no_items_code",childParamName,objParam.parent_name);break;}
if(!rawInsertText){rawInsertText=g_ucAdmin.getVal(objParam,"raw_insert_text");}
var paramClassType="uc-type-param";switch(objParam.type){case"uc_function":paramClassType="uc-type-function";break;case"uc_constant":paramClassType="uc-type-constant";break;}
var classFilter=getFilterClass(filter);var specialParamType="regular";var isParent=g_ucAdmin.getVal(objParam,"is_parent",false,g_ucAdmin.getvalopt.FORCE_BOOLEAN);if(isParent===true)
specialParamType="parent";else{var parentName=g_ucAdmin.getVal(objParam,"parent_name");if(parentName)
specialParamType="child";}
var ending="";switch(objParam.type){case"uc_joomla_module":case"uc_editor":ending="|raw";break;}
var prefix=getPrefix(filter);var textNoSlashes=prefix+name+ending;var textNoSlashesParent=prefix+name;if(specialParamType=="child")
textNoSlashesParent=prefix+parentName;var isNoSlashes=g_ucAdmin.getVal(objParam,"noslashes",false,g_ucAdmin.getvalopt.FORCE_BOOLEAN);if(isNoSlashes===true)
var text=textNoSlashes;else
var text="{{"+textNoSlashes+"}}";if(rawInsertText){rawInsertText=g_ucAdmin.replaceAll(rawInsertText,"[param_name]",textNoSlashes);rawInsertText=g_ucAdmin.replaceAll(rawInsertText,"[param_prefix]",textNoSlashesParent);rawInsertText=g_ucAdmin.htmlspecialchars(rawInsertText);}
var style="";if(g_activeFilter&&filter&&g_activeFilter!==filter)
style="style='display:none'";var htmlClass="uc-link-paramkey "+paramClassType+" "+classFilter;var htmlTip="";var tooltip=g_ucAdmin.getVal(objParam,"tooltip");var addHtml="";if(rawInsertText){addHtml+=" data-rawtext=\""+rawInsertText+"\"";}
var isRawVisual=g_ucAdmin.getVal(objParam,"rawvisual",false,g_ucAdmin.getvalopt.FORCE_BOOLEAN);if(isRawVisual===true){paramVisual=objParam.original_name;}
var visual=g_ucAdmin.getVal(objParam,"visual");if(visual)
paramVisual=visual;if(paramVisual){paramVisual=g_ucAdmin.replaceAll(paramVisual,"[param_name]",textNoSlashes);paramVisual=g_ucAdmin.replaceAll(paramVisual,"[param_prefix]",textNoSlashesParent);}
switch(specialParamType){case"parent":if(!tooltip)
tooltip="Show All Fields";var isOpenOnClick=g_ucAdmin.getVal(objParam,"parent_open_onclick");if(isOpenOnClick===true){addHtml=" data-openonclick='true'";text=textNoSlashes;}
if(paramVisual)
text=paramVisual;var html="<div class='uc-param-wrapper uc-param-parent uc-hover "+classFilter+"' "+style+" data-name='"+name+"' "+addHtml+">";html+="  <a data-name='"+name+"' data-text='"+text+"' href='javascript:void(0)' class='uc-link-paramkey "+classFilter+"' >"+text+"</a>";html+="  <div class='uc-icons-wrapper uc-icons-parent'>";html+="   <a class='uc-icon-show-children uc-tip' title='"+tooltip+"'></a>";html+="  </div>";html+="</div>";break;case"child":if(tooltip)
htmlTip=" title='"+tooltip+"'";htmlClass+=" ucparent-"+parentName+" uc-child-key uc-child-hidden";default:if(paramVisual==null)
paramVisual=text;var html="<a data-name='"+name+"' data-text='"+text+"' href='javascript:void(0)' class='"+htmlClass+"' "+style+htmlTip+addHtml+">"+paramVisual+"</a>";break;}
g_objWrapper.append(html);}
function ___________VARIABLES_CONSTANTS___________(){}
function addVariable(index,objVar,filter){if(typeof objVar!="object")
throw new Error("The variable should be object");var name=objVar.name;var prefix=getPrefix(filter);var text="{{"+prefix+name+"}}";var classFilter=getFilterClass(filter);var htmlClass="uc-link-paramkey uc-type-variable "+classFilter;var style="";if(g_activeFilter&&filter&&g_activeFilter!==filter)
style="style='display:none'";var html="<div class='uc-param-wrapper uc-variable-wrapper' data-name='"+name+"' data-index='"+index+"'>";html+="<a data-name='"+name+"' data-text='"+text+"' href='javascript:void(0)' class='"+htmlClass+"' "+style+">"+text+"</a>";html+="<div class='uc-icons-wrapper'>";html+="<div class='uc-icon-edit'></div>";html+="<div class='uc-icon-delete'></div>";html+="</div>";html+="</div>";g_objWrapper.append(html);}
function addConstants(argFilter){if(!g_arrConstants)
return(false);if(typeof g_arrConstants!="object")
return(false);if(g_arrConstants.length==0)
return(false);jQuery.each(g_arrConstants,function(filter,name){if(argFilter&&filter!=argFilter)
return(true);var arrConstants=g_arrConstants[filter];jQuery.map(arrConstants,function(name){if(typeof name=="object"){var isParent=g_ucAdmin.getVal(name,"is_parent",false,g_ucAdmin.getvalopt.FORCE_BOOLEAN);var arrChildParams=g_ucAdmin.getVal(name,"child_params");if(isParent==true&&arrChildParams)
addChildParams(name,arrChildParams,filter);}else
addParam(name,"uc_constant",filter);});});}
function ___________EVENTS___________(){}
function onParamClick(){var objParam=jQuery(this);var text=objParam.data("text");var rawText=objParam.data("rawtext");if(rawText)
text=rawText;var objParent=objParam.parents(".uc-param-parent");if(objParent.length!=0){var openOnClick=objParent.data("openonclick");if(openOnClick===true){var objIcon=objParent.find(".uc-icon-show-children");objIcon.trigger("click");return(false);}}
g_temp.funcOnClick(text,rawText);}
function triggerEvent(eventName,params){if(!params)
var params=null;g_objWrapper.trigger(eventName,params);}
function onEvent(eventName,func){g_objWrapper.on(eventName,func);}
function initEvents(){g_objWrapper.on("click","a.uc-link-paramkey",onParamClick);g_objWrapper.on("focus","a.uc-link-paramkey",function(){this.blur();});g_objWrapper.on("mouseenter",".uc-variable-wrapper",function(){jQuery(this).addClass("uc-hover");});g_objWrapper.on("mouseleave",".uc-variable-wrapper",function(){jQuery(this).removeClass("uc-hover");});g_objWrapper.on("click",".uc-variable-wrapper .uc-icon-edit",function(){var objLink=jQuery(this);var objVarWrapper=objLink.parents(".uc-variable-wrapper");var varIndex=objVarWrapper.data("index");triggerEvent(events.EDIT_VARIABLE,varIndex);});g_objWrapper.on("click",".uc-param-parent .uc-icon-show-children",function(){var objLink=jQuery(this);var objMenu=objLink.parents(".uc-icons-wrapper");var objParamWrapper=objLink.parents(".uc-param-wrapper");var paramName=objParamWrapper.data("name");var classChildren=".ucparent-"+paramName;var objChildren=g_objWrapper.find(classChildren);objMenu.hide();objChildren.removeClass("uc-child-hidden");});g_objWrapper.on("click",".uc-variable-wrapper .uc-icon-delete",function(){var objLink=jQuery(this);var objVarWrapper=objLink.parents(".uc-variable-wrapper");var varIndex=objVarWrapper.data("index");triggerEvent(events.DELETE_VARIABLE,varIndex);});}
this.removeAllParams=function(){g_objWrapper.html("");}
function ___________FILTERS___________(){}
function getFilterClass(filter,addDot){if(!filter)
return("");var prefix="";if(addDot===true)
prefix=".";filter=filter.replace(".","_");filter=filter.replace("|e","");var classFilter=prefix+"uc-filter-"+filter;return(classFilter);}
function onFilterTabClick(){var activeClass="uc-filter-active";var objFilter=jQuery(this);if(objFilter.hasClass(activeClass))
return(false);var otherFitlers=g_objFiltersWrapper.find("a").not(objFilter);otherFitlers.removeClass(activeClass);objFilter.addClass(activeClass);g_activeFilter=objFilter.data("filter");var classFilter=getFilterClass(g_activeFilter,true);var objFilterKeys=g_objWrapper.find(classFilter);var objOtherKeys=g_objWrapper.find("a.uc-link-paramkey").add(g_objWrapper.find(".uc-param-wrapper")).not(objFilterKeys);objOtherKeys.hide();objFilterKeys.show().css({"display":"block"});}
function initFilterTabs(){var objFilterWrapper=g_objWrapper.siblings(".uc-params-panel-filters");if(objFilterWrapper.length==0)
return(false);g_objFiltersWrapper=objFilterWrapper;var objActiveFilter=g_objFiltersWrapper.find("a.uc-filter-active");if(objActiveFilter.length==0)
throw new Error("Must have at least one active filter!!!");g_activeFilter=objActiveFilter.data("filter");g_objFiltersWrapper.delegate("a","click",onFilterTabClick);}
this.setParams=function(arrParams,arrVariables,filter){if(!filter)
t.removeAllParams();addConstants(filter);jQuery.each(arrParams,function(index,param){addParam(param,null,filter);});if(arrVariables&&typeof arrVariables=="object"){jQuery.each(arrVariables,function(index,objVar){addVariable(index,objVar,filter);});}}
this.onParamClick=function(func){g_temp.funcOnClick=func;};this.onEditVariable=function(func){onEvent(events.EDIT_VARIABLE,func);}
this.onDeleteVariable=function(func){onEvent(events.DELETE_VARIABLE,func);};function initGlobalSetting(name,data){if(!data||data.length==0)
return(false);g_ucAdmin.storeGlobalData(name,data);}
this.initGlobalSetting_ThumbSizes=function(objThumbSizes){initGlobalSetting("param_panel_thumb_sizes",objThumbSizes);};this.initGlobalSetting_ImageAddParams=function(objParams){initGlobalSetting("param_panel_image_add_params",objParams);};this.initGlobalSetting_SkipParams=function(objSkipParams){initGlobalSetting("panel_skip_params",objSkipParams);}
this.initGlobalSetting_ChildKeys=function(objChildKeys,objAddKeys){initGlobalSetting(g_constants.PARAM_CHILD_KEYS,objChildKeys);initGlobalSetting("param_panel_add_keys",objAddKeys);};this.getGlobalSetting_SkipParams=function(){var objGlobalSetting=g_ucAdmin.getGlobalData("panel_skip_params");return(objGlobalSetting);}
this.getGlobalSetting_ChildKeys=function(){var objGlobalSetting=g_ucAdmin.getGlobalData(g_constants.PARAM_CHILD_KEYS);return(objGlobalSetting);}
this.updateGlobalSetting_ChildKeys=function(objKeys){g_ucAdmin.storeGlobalData(g_constants.PARAM_CHILD_KEYS,objKeys);}
this.initGlobalSetting_TemplateCode=function(objTemplateCode){initGlobalSetting("param_panel_template_code",objTemplateCode);};this.init=function(objWrapper,type,prefix,arrConstants){g_objWrapper=objWrapper;g_type=type;if(prefix)
g_prefix=prefix;initFilterTabs();if(arrConstants&&typeof arrConstants=="object")
t.initConstants(arrConstants,"all");g_objThumbSizes=g_ucAdmin.getGlobalData("param_panel_thumb_sizes");if(!g_objThumbSizes)
g_objThumbSizes=null;g_objImageAddParams=g_ucAdmin.getGlobalData("param_panel_image_add_params");if(!g_objImageAddParams)
g_objImageAddParams=null;g_objChildKeys=g_ucAdmin.getGlobalData("param_panel_child_keys");if(!g_objChildKeys)
g_objChildKeys=null;g_objSkipParams=this.getGlobalSetting_SkipParams();if(!g_objSkipParams)
g_objSkipParams=null;g_objAddKeys=g_ucAdmin.getGlobalData("param_panel_add_keys");if(!g_objAddKeys)
g_objAddKeys=null;g_objTemplateCode=g_ucAdmin.getGlobalData("param_panel_template_code");if(!g_objTemplateCode)
g_objTemplateCode=null;initEvents();};this.initConstants=function(arrConstants,filter){if(!arrConstants||typeof arrConstants!="object")
return(false);if(!g_arrConstants)
g_arrConstants={};if(!filter)
filter="all";g_arrConstants[filter]=arrConstants;}}