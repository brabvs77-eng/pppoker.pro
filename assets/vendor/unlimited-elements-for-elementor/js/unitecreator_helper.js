"use strict";function UniteCreatorHelper(){if(!g_ucAdmin)
g_ucAdmin=new UniteAdminUC();this.getRandomString=g_ucAdmin.getRandomString
this.putIncludes=function(windowElement,includes,onLoaded){var objWindow=jQuery(windowElement.document);var arrHandles={};jQuery.each(includes,function(index,include){var handle=prepareIncludeHandle(include);if(include.handle==="jquery")
return;arrHandles[handle]=include;});var isFirstJS=true;jQuery.each(includes,function(event,include){if(include.type==="css"){loadIncludeFile(include);}else{if(isFirstJS===true){isFirstJS=false;loadIncludeFile(include);}}});checkAllFilesLoaded();function prepareIncludeHandle(include){return"uc_include_"+include.type+"_"+include.handle;}
function checkAllFilesLoaded(){if(jQuery.isEmptyObject(arrHandles)===false)
return;if(typeof onLoaded==="function")
onLoaded();}
function loadIncludeFile(objInclude){var handle=prepareIncludeHandle(objInclude);var type=objInclude.type;var url=objInclude.url;var isModule=objInclude.is_module===true;if(objInclude.handle==="jquery"){checkAllFilesLoaded();onJsFileLoaded();return;}
var data={objWindow:objWindow,name:"uc_include_file",replaceID:handle,ismodule:isModule,};data.onload=function(obj,handle){var objDomInclude=jQuery(obj);objDomInclude.data("isloaded",true);if(arrHandles.hasOwnProperty(handle)===true){delete arrHandles[handle];checkAllFilesLoaded();}
var tagName=objDomInclude.prop("tagName").toLowerCase();if(tagName==="script")
onJsFileLoaded();};var objDomInclude=objWindow.find("#"+handle);if(objDomInclude.length===0){loadDOMIncludeFile(type,url,data);}else{var isLoaded=objDomInclude.data("isloaded");if(isLoaded===true){if(arrHandles.hasOwnProperty(handle)===true)
delete arrHandles[handle];var tagName=objDomInclude.prop("tagName").toLowerCase();if(tagName==="script")
onJsFileLoaded();}else{var timeoutHandle=setInterval(function(){var isLoaded=objDomInclude.data("isloaded");if(isLoaded===true){clearInterval(timeoutHandle);if(arrHandles.hasOwnProperty(handle)===true)
delete arrHandles[handle];checkAllFilesLoaded();var tagName=objDomInclude.prop("tagName").toLowerCase();if(tagName==="script")
onJsFileLoaded();}},100);}}}
function onJsFileLoaded(){for(var index in arrHandles){var include=arrHandles[index];if(include.type==="js"){loadIncludeFile(include);return;}}}};function loadDOMIncludeFile(type,url,data){if(!url)
return;var objWindow=g_ucAdmin.getVal(data,"objWindow");var name=g_ucAdmin.getVal(data,"name");var replaceID=g_ucAdmin.getVal(data,"replaceID");var isModule=g_ucAdmin.getVal(data,"ismodule");var noRand=g_ucAdmin.getVal(data,"norand");var onload=g_ucAdmin.getVal(data,"onload");if(!noRand){var rand=Math.floor((Math.random()*100000)+1);var char=(url.indexOf("?")===-1)?"?":"&";url+=char+"rand="+rand;}
if(replaceID)
objWindow.find("#"+replaceID).remove();switch(type){case"js":var objTag=jQuery("<script />").attr("src",url).attr("type",(isModule===true)?"module":null);objWindow.find("script:first").before(objTag);break;case"css":var objTag=jQuery("<link />").attr("rel","stylesheet").attr("type","text/css").attr("href",url);objWindow.find("head").append(objTag);break;default:throw Error("Include type \""+type+"\" is not implemented.");}
if(replaceID)
objTag.attr("id",replaceID);if(name)
objTag.attr("name",name);if(onload){objTag.attr("onload",function(){onload(jQuery(this),replaceID);});}}}