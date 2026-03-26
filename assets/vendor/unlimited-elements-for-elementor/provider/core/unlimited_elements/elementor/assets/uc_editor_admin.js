function UniteCreatorElementorEditorAdmin(){var t=this;var g_arrPreviews;var g_handle=null;var g_objSettingsPanel;var g_objAddonParams,g_objAddonParamsItems,g_lastAddonName;var g_numRepeaterItems=0;var g_windowFront,g_searchDataID,g_searchData,g_frontAPI,g_objBody;var g_temp={startTime:0};function rawurldecode(str){return decodeURIComponent(str+'');}
function utf8_decode(str_data){var tmp_arr=[],i=0,ac=0,c1=0,c2=0,c3=0;str_data+='';while(i<str_data.length){c1=str_data.charCodeAt(i);if(c1<128){tmp_arr[ac++]=String.fromCharCode(c1);i++;}else if(c1>191&&c1<224){c2=str_data.charCodeAt(i+1);tmp_arr[ac++]=String.fromCharCode(((c1&31)<<6)|(c2&63));i+=2;}else{c2=str_data.charCodeAt(i+1);c3=str_data.charCodeAt(i+2);tmp_arr[ac++]=String.fromCharCode(((c1&15)<<12)|((c2&63)<<6)|(c3&63));i+=3;}}
return tmp_arr.join('');}
function base64_decode(data){var b64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var o1,o2,o3,h1,h2,h3,h4,bits,i=0,ac=0,dec="",tmp_arr=[];if(!data){return data;}
data+='';do{h1=b64.indexOf(data.charAt(i++));h2=b64.indexOf(data.charAt(i++));h3=b64.indexOf(data.charAt(i++));h4=b64.indexOf(data.charAt(i++));bits=h1<<18|h2<<12|h3<<6|h4;o1=bits>>16&0xff;o2=bits>>8&0xff;o3=bits&0xff;if(h3==64){tmp_arr[ac++]=String.fromCharCode(o1);}else if(h4==64){tmp_arr[ac++]=String.fromCharCode(o1,o2);}else{tmp_arr[ac++]=String.fromCharCode(o1,o2,o3);}}while(i<data.length);dec=tmp_arr.join('');dec=utf8_decode(dec);return dec;}
function trace(str){console.log(str);}
function a________AUDIO_CONTROL_________(){}
function onChooseAudioClick(){var objButton=jQuery(this);var objInput=objButton.siblings("input[type='text']");var objText=objButton.siblings(".uc-audio-control-text");var frame=wp.media({title:"Select Audio File",multiple:false,library:{type:"audio"},button:{text:'Choose'}});frame.on('select',function(){var objSettings=frame.state().get('selection').first().toJSON();var urlFile=objSettings.url;objInput.val(urlFile);objInput.trigger("input");});frame.open();}
function getObjElementorPanel(){var objPanel=jQuery("#elementor-panel");return(objPanel);}
function initAudioControl(){var objPanel=getObjElementorPanel();objPanel.on("click",".uc-button-choose-audio",onChooseAudioClick);}
function getVal(obj,name,defaultValue){if(!defaultValue)
var defaultValue="";var val="";if(!obj||typeof obj!="object")
val=defaultValue;else if(obj.hasOwnProperty(name)==false){val=defaultValue;}else{val=obj[name];}
return(val);}
function htmlspecialchars(string){if(!string)
return(string);return string.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");};function a________POST_TYPE_SELECT_________(){}
function changePostTaxonomySelect(selectPostType,dataPostTypes){var objPanel=getObjElementorPanel();var prefix=selectPostType.data("settingprefix");var settingKey=prefix+"_taxonomy";var selectPostTaxonomy=objPanel.find("select[data-setting='"+settingKey+"']");selectPostTaxonomy.attr("multiple",true);selectPostTaxonomy.css("height","50px");var objInputWrapper=selectPostTaxonomy.parents(".elementor-control-input-wrapper");objInputWrapper.addClass("uc-notip");var postType=selectPostType.val();var selectedTax=selectPostTaxonomy.val();var objSettings=getLastOpenedWidgetSettings();var realValue=getVal(objSettings,settingKey);if(typeof realValue=="object"){selectedTax=realValue;selectPostTaxonomy.val(realValue);}
var objTax=getVal(dataPostTypes,postType);if(!objTax)
return(true);var objOptions=selectPostTaxonomy.find("option");var firstVisibleOption=null;var numVisible=0;jQuery.each(objOptions,function(index,option){var objOption=jQuery(option);var optionTax=objOption.prop("value");var taxFound=objTax.hasOwnProperty(optionTax);if(taxFound==true&&firstVisibleOption==null)
firstVisibleOption=optionTax;if(taxFound==true){objOption.show();numVisible++;}
else
objOption.hide();});if(numVisible>4)
selectPostTaxonomy.css("height","80px");if(typeof selectedTax!="string"&&selectedTax.length)
selectedTax=selectedTax[0];var isCurrentTaxRelevant=objTax.hasOwnProperty(selectedTax);if(isCurrentTaxRelevant==false&&firstVisibleOption){selectPostTaxonomy.val(firstVisibleOption).trigger("change");}}
function onPostTypeSelectChange_fillCategorySelect(objSelectPostCategory,selectPostType,dataPostTypes,placeholder,isInit){var arrPostTypes=selectPostType.val();if(jQuery.isArray(arrPostTypes)==false){arrPostTypes=[arrPostTypes];}
var selectedCatID=objSelectPostCategory.select2("val");if(isInit==true){var widgetSettings=getLastOpenedWidgetSettings();var settingName=objSelectPostCategory.data("setting");var initValues=getVal(widgetSettings,settingName);if(initValues&&Array.isArray(initValues)&&initValues.length!=selectedCatID.length){selectedCatID=initValues;}}
var options=[];for(var index in arrPostTypes){var postType=arrPostTypes[index];var objPostType=getVal(dataPostTypes,postType);if(!objPostType)
continue;var objCats=objPostType["cats"];jQuery.each(objCats,function(catID,catText){var catShowText=htmlspecialchars(catText);options.push({text:catShowText,id:catID});});}
objSelectPostCategory.empty().select2({data:options,placeholder:placeholder});if(jQuery.isEmptyObject(selectedCatID)==false){objSelectPostCategory.val(selectedCatID);objSelectPostCategory.trigger("change");}}
function onPostTypeSelectChange(event,paramSelect){var isInit=false;if(paramSelect&&event==null){var selectPostType=paramSelect;isInit=true;}
else
var selectPostType=jQuery(this);var dataPostTypes=selectPostType.data("arrposttypes");if(typeof dataPostTypes=="string"){dataPostTypes=t.decodeContent(dataPostTypes);dataPostTypes=JSON.parse(dataPostTypes);}
var settingType=selectPostType.data("settingtype");if(settingType=="select_post_taxonomy"){changePostTaxonomySelect(selectPostType,dataPostTypes);return(false);}
var objPanel=getObjElementorPanel();var prefix=selectPostType.data("settingprefix");var objSelectPostCategory=objPanel.find("select[data-setting='"+prefix+"_category']");var objSelectExcludeTerms=objPanel.find("select[data-setting='"+prefix+"_exclude_terms']");onPostTypeSelectChange_fillCategorySelect(objSelectPostCategory,selectPostType,dataPostTypes,"All Terms",isInit);onPostTypeSelectChange_fillCategorySelect(objSelectExcludeTerms,selectPostType,dataPostTypes,"Select Terms To Exclude",isInit);}
function initPostTypeSelectControl(){var objPanel=getObjElementorPanel();objPanel.on("change",".unite-setting-post-type",onPostTypeSelectChange);}
function postSelectOnLoad(){var objPanel=getObjElementorPanel();var objSetting=jQuery(".unite-setting-post-type");if(objSetting.length==0)
return(true);var isInited=objSetting.data("isinited");if(isInited==true)
return(true);objSetting.data("isinited",true);setTimeout(function(){onPostTypeSelectChange(null,objSetting);},500);}
function a________SPECIAL_SELECTS_________(){}
this.decodeContent=function(value){return rawurldecode(base64_decode(value));}
function getSelect2AjaxOptions(action,postType,taxonomySettingName,objSelect){var optionsAjax={};optionsAjax["url"]=ajaxurl;optionsAjax["dataType"]="json";optionsAjax["cache"]=true;optionsAjax["data"]=function(params){params["q"]=getVal(params,"term");if(postType)
params["post_type"]=postType;if(taxonomySettingName){var isAllTax=objSelect.data("isalltax");var objSettingTaxonomy=getElementorControlByName(taxonomySettingName);if(objSettingTaxonomy){if(isAllTax===true){var arrAllTax=objSettingTaxonomy.children("option:visible").map(function(){return jQuery(this).val();}).get();params["taxonomy"]=arrAllTax;}else
params["taxonomy"]=objSettingTaxonomy.val();}}
var objData={action:"unlimitedelements_ajax_action",nonce:g_ucNonce,client_action:action,data:params}
return(objData);};var options={ajax:optionsAjax,minimumInputLength:1,allowClear:true,dir:"ltr"};return(options);}
function getElementorControlByName(controlName){if(!controlName)
return(null);var objWrapper=jQuery("#elementor-controls");if(objWrapper.length==0)
return(null);var selector="*[data-setting=\""+controlName+"\"]";var objControl=objWrapper.find(selector);if(objControl.length==0)
return(null);return(objControl);}
function postIDsSelect_checkEditButton(objSelect,data,arrData){var value=objSelect.val();var type=objSelect.data("datatype");if(type=="terms"||type=="users")
return(false);var objWrapper=objSelect.parents(".elementor-control-input-wrapper");var objButtonEdit=objWrapper.find(".uc-button-edit-wrapper");if(objButtonEdit.length)
objButtonEdit.remove();if(!value||value=="")
return(false);if(jQuery.isArray(value))
return(false);if(jQuery.isNumeric(value)==false)
return(false);if(typeof g_ucAdminUrl=="undefined")
return(false);switch(type){case"post":default:var buttonText="Edit Post";var urlEdit=g_ucAdminUrl+"post.php?post="+value+"&action=edit";break;case"elementor_template":var buttonText="Edit Template";var urlEdit=g_ucAdminUrl+"post.php?post="+value+"&action=elementor";break;}
var htmlButton="<div class='uc-button-edit-wrapper'><a href='"+urlEdit+"' target='_blank'>"+buttonText+"</a></div>";objWrapper.append(htmlButton);}
function initPostIDsSelect_initObject(objSelect,arrInitData){var data=objSelect.data();var postType=null;var taxonomy=null;var isWoo=objSelect.data("woo");if(isWoo=="yes")
postType="product";var type=objSelect.data("datatype");if(type=="elementor_template")
postType="elementor_template";var action="get_posts_list_forselect";if(type=="terms"){action="get_terms_list_forselect";}
if(type=="users"){action="get_users_list_forselect";}
var taxonomyName=objSelect.data("taxonomyname");var options=getSelect2AjaxOptions(action,postType,taxonomyName,objSelect);var placeholder=objSelect.data("placeholdertext");if(placeholder){placeholder=placeholder.replace("--"," ");options["placeholder"]=placeholder;}
if(arrInitData){options["data"]=arrInitData;}
objSelect.select2(options);objSelect.select2Sortable();if(!arrInitData){objSelect.on("change",function(event){postIDsSelect_checkEditButton(objSelect);});return(false);}
objSelect.data("stop_trigger_oninit",true);objSelect.on("change",function(event){postIDsSelect_checkEditButton(objSelect);var stopOnInit=objSelect.data("stop_trigger_oninit");if(!stopOnInit)
return(true);event.stopPropagation();event.stopImmediatePropagation();objSelect.data("stop_trigger_oninit",false);});var arrInitIDs=[];for(var key in arrInitData){var item=arrInitData[key];arrInitIDs.push(item.id);}
objSelect.val(arrInitIDs).trigger("change");}
function initPostIDsSelect(objSelect){var widgetSettings=getLastOpenedWidgetSettings();var settingName=objSelect.data("setting");var isSingle=objSelect.data("issingle");var dataType=objSelect.data("datatype");if(isSingle===true)
objSelect.removeAttr("multiple");var initValue=getVal(widgetSettings,settingName);if(jQuery.isArray(initValue)==false&&jQuery.isNumeric(initValue))
initValue=[initValue];if(jQuery.isEmptyObject(initValue)){initPostIDsSelect_initObject(objSelect);return(false);}
if(jQuery.isArray(initValue)==false&&dataType!="terms"){initPostIDsSelect_initObject(objSelect);return(false);}
objSelect.hide();var loaderText=objSelect.data("loadertext");loaderText=t.decodeContent(loaderText);var objParent=objSelect.parent();objParent.append("<span class='uc-panel-ajax-loader'>"+loaderText+"</span>");var objLoader=objParent.find(".uc-panel-ajax-loader");var ajaxData={post_ids:initValue};var action="get_select2_post_titles";if(dataType=="terms")
action="get_select2_terms_titles";if(dataType=="users")
action="get_select2_users_titles";ajaxRequest(action,ajaxData,function(response){objLoader.remove();var arrSelectData=getVal(response,"select2_data");initPostIDsSelect_initObject(objSelect,arrSelectData);});}
function templateButtonSet(objButton,objSelectTemplate){var value=objSelectTemplate.val();if(value==""||value=="__none__"){objButton.hide();return(false);}
if(!g_ucAdminUrl)
return(false);objButton.show();value=value.replace("jet_","");var urlEdit=g_ucAdminUrl+"post.php?post="+value+"&action=elementor";objButton.attr("href",urlEdit);}
function initTemplateButton(objButton){var selectID=objButton.data("selectid");var objPanel=getObjElementorPanel();var objSelectTemplate=objPanel.find("select[data-setting='"+selectID+"']");if(objSelectTemplate.length==0)
return(false);templateButtonSet(objButton,objSelectTemplate);objSelectTemplate.on("change",function(){templateButtonSet(objButton,objSelectTemplate);});}
function initSpecialSelects(){var objSelects=g_objSettingsPanel.find(".unite-setting-special-select");if(objSelects.length==0)
return(false);jQuery.each(objSelects,function(index,select){var objSelect=jQuery(select);var isInited=objSelect.data("isinited");if(isInited===true)
return(true);objSelect.data("isinited",true);var settingType=objSelect.data("settingtype");switch(settingType){case"post_ids":initPostIDsSelect(objSelect);break;case"template_button":initTemplateButton(objSelect);break;}});}
function onSettingsPanelInit(){initSpecialSelects();postSelectOnLoad();g_objBody.trigger("uc_settings_panel_change");}
function initEvents(){g_objSettingsPanel.bind("DOMSubtreeModified",function(){if(g_handle)
clearTimeout(g_handle);g_handle=setTimeout(onSettingsPanelInit,50);});}
function a________LOAD_INCLUDES_________(){}
function getVal(obj,name,defaultValue,opt){if(!defaultValue)
var defaultValue="";var val="";if(!obj||typeof obj!="object")
val=defaultValue;else if(obj.hasOwnProperty(name)==false){val=defaultValue;}else{val=obj[name];}
return(val);}
function loadDOMIncludeFile(type,url,data){if(!url)
return(false);var replaceID=getVal(data,"replaceID");var name=getVal(data,"name");var onload=getVal(data,"onload");var iframeWindow=getVal(data,"iframe");var isModule=getVal(data,"ismodule");var noRand=getVal(data,"norand");if(!noRand){var rand=Math.floor((Math.random()*100000)+1);if(url.indexOf("?")==-1)
url+="?rand="+rand;else
url+="&rand="+rand;}
if(replaceID)
jQuery("#"+replaceID).remove();var objWindow=window;if(iframeWindow)
objWindow=iframeWindow;switch(type){case"js":var tag=objWindow.document.createElement('script');tag.src=url;if(isModule===true)
tag.type="module";if(typeof onload=="function"){tag.onload=function(){onload(jQuery(this),replaceID);};}
var firstScriptTag=objWindow.document.getElementsByTagName('script')[0];firstScriptTag.parentNode.insertBefore(tag,firstScriptTag);tag=jQuery(tag);if(name)
tag.attr("name",name);break;case"css":var objHead=jQuery(objWindow.document).find("head");objHead.append("<link>");var tag=objHead.children(":last");var attributes={rel:"stylesheet",type:"text/css",href:url};if(name)
attributes.name=name;if(typeof onload=="function"){attributes.onload=function(){onload(jQuery(this),replaceID);};}
tag.attr(attributes);break;default:throw Error("Undefined include type: "+type);break;}
if(replaceID)
tag.attr({id:replaceID});return(tag);};function putIncludes(windowIframe,objIncludes,funcOnLoaded){var isLoadOneByOne=true;var handlePrefix="uc_include_";var arrHandles={};jQuery.each(objIncludes,function(event,objInclude){var handle=handlePrefix+objInclude.type+"_"+objInclude.handle;if(!(objInclude.type=="js"&&objInclude.handle=="jquery"))
arrHandles[handle]=objInclude;});var isAllFilesLoaded=false;function checkAllFilesLoaded(){if(isAllFilesLoaded==true)
return(false);if(!jQuery.isEmptyObject(arrHandles))
return(false);isAllFilesLoaded=true;if(!funcOnLoaded)
return(false);funcOnLoaded();}
function onJsFileLoaded(){for(var index in arrHandles){var objInclude=arrHandles[index];if(objInclude.type=="js"){loadIncludeFile(objInclude);return(false);}}}
function loadIncludeFile(objInclude){var url=objInclude.url;var handle=handlePrefix+objInclude.type+"_"+objInclude.handle;var type=objInclude.type;var isModule=false;if(objInclude.hasOwnProperty("is_module")&&objInclude.is_module==true&&type=="js")
isModule=true;if(objInclude.handle=="jquery"){checkAllFilesLoaded();if(isLoadOneByOne)
onJsFileLoaded();return(true);}
var data={replaceID:handle,name:"uc_include_file",iframe:windowIframe,ismodule:isModule};data.onload=function(obj,handle){var objDomInclude=jQuery(obj);objDomInclude.data("isloaded",true);if(arrHandles.hasOwnProperty(handle)==true){delete arrHandles[handle];checkAllFilesLoaded();}
if(isLoadOneByOne){var tagName=objDomInclude.prop("tagName").toLowerCase();if(tagName=="script")
onJsFileLoaded();}};var objDomInclude=jQuery("#"+handle);if(objDomInclude.length==0){objDomInclude=loadDOMIncludeFile(type,url,data);}
else{var isLoaded=objDomInclude.data("isloaded");if(isLoaded==true){if(arrHandles.hasOwnProperty(handle)==true)
delete arrHandles[handle];if(isLoadOneByOne){var tagName=objDomInclude.prop("tagName").toLowerCase();if(tagName=="script")
onJsFileLoaded();}}else{var timeoutHandle=setInterval(function(){var isLoaded=objDomInclude.data("isloaded");if(isLoaded==true){clearInterval(timeoutHandle);if(arrHandles.hasOwnProperty(handle)==true)
delete arrHandles[handle];checkAllFilesLoaded();if(isLoadOneByOne){var tagName=objDomInclude.prop("tagName").toLowerCase();if(tagName=="script")
onJsFileLoaded();}}},100);}}}
if(isLoadOneByOne==false){jQuery.each(objIncludes,function(event,objInclude){loadIncludeFile(objInclude);});}else{var isFirstJS=true;jQuery.each(objIncludes,function(event,objInclude){if(objInclude.type=="css")
loadIncludeFile(objInclude);else{if(isFirstJS==true){loadIncludeFile(objInclude);isFirstJS=false;}}});}
checkAllFilesLoaded();}
this.ucLoadJSAndRun=function(iframeWindow,jsonIncludes,funcRun){var objIncludes=jQuery.parseJSON(jsonIncludes);if(!objIncludes||objIncludes.length==0){funcRun();return(false);}
putIncludes(iframeWindow,objIncludes,function(){funcRun();});}
function ____________BACKGROUNDS______________(){}
function searchElementorData(data,id){if(id&&id==window.ucLastElementorModelID){var objSettings=getVal(window.ucLastElementorModel,"settings");var objSettingsAttributes=getVal(objSettings,"attributes");return(objSettingsAttributes);}
if(id){g_searchDataID=id;g_searchData=null;}
if(!g_searchDataID)
return(false);if(!data)
return(false);var models=getVal(data,"models");if(models&&jQuery.isArray(models)){searchElementorData(models);}
jQuery.each(data,function(index,item){var attributes=getVal(item,"attributes");var elType=getVal(attributes,"elType");var elID=getVal(attributes,"id");var elements=getVal(attributes,"elements");if(g_searchDataID==elID){var objSettings=getVal(attributes,"settings");g_searchData=getVal(objSettings,"attributes");return(false);}
if(elType!="widget"&&typeof elements=="object"&&elements.length>0){searchElementorData(elements);return(true);}});var settingsOutput={};if(g_searchData&&jQuery.isArray(g_searchData)==false)
settingsOutput=jQuery.extend({},g_searchData);return(settingsOutput);}
function getSettingsFromElementor(id){var objSettings=getVal(window.ucLastElementorModel,"settings");var cid=getVal(objSettings,"cid");var attributes=getVal(objSettings,"attributes");if(cid&&attributes)
return(attributes);if(typeof elementor=="undefined")
return(null);var elements=getVal(elementor,"elements");if(!elements)
return(null);var objSettings=searchElementorData(elements,id);if(!objSettings)
return(null);var cid=getVal(objSettings,"cid");var attributes=getVal(objSettings,"attributes");if(!cid&&!attributes)
return(objSettings);return(attributes);}
function ajaxRequest(action,data,funcSuccess,funcError){if(!data)
var data={};var objData={};objData.action="unlimitedelements_ajax_action";objData.nonce=g_ucNonce;objData.client_action=action;objData.data=data;var ajaxOptions={type:"post",url:ajaxurl,dataType:'json',data:objData,success:function(response){if(typeof funcSuccess=="function")
funcSuccess(response);else
trace(response);},error:function(jqXHR,textStatus,errorThrown){trace("unlimited ajax error");switch(textStatus){case"parsererror":case"error":trace(jqXHR.responseText);break;}
if(typeof funcError=="function")
funcError(textStatus);}}
jQuery.ajax(ajaxOptions);}
function getRepeaterData(objData){var models=getVal(objData,"models");if(!models||jQuery.isEmptyObject(models))
return([]);var settings=[];jQuery.each(models,function(index,model){var attributes=getVal(model,"attributes");settings.push(attributes);});return(settings);}
function getBGSettingsData(type,objSettings){if(!objSettings)
return({});var objSettingsData={};for(key in objSettings){if(key.indexOf(type)===-1)
continue;var shortKey=key.replace(type+"_","");var objData=objSettings[key];if(typeof objData=="object"&&objData.hasOwnProperty("model")&&objData.hasOwnProperty("_byId")){objData=getRepeaterData(objData);}
objSettingsData[shortKey]=objData;}
return(objSettingsData);}
function loadBGWidget(bgType,objSettings,funResponse){var settingsData=getBGSettingsData(bgType,objSettings);var data={addontype:"bg_addon",name:bgType,elementor_settings:settingsData};ajaxRequest("get_addon_output_data",data,function(response){funResponse(response,objSettings);});}
function applyBackgroundToElement(objElement,response,settingsData){var objIframeWindow=jQuery("#elementor-preview-iframe");if(objIframeWindow.length==0)
return(false);var frameWindow=objIframeWindow[0];var arrIncludes=getVal(response,"includes");var location=getVal(settingsData,"uc_background_location");var classFront="uc-bg-front";putIncludes(frameWindow.contentWindow,arrIncludes,function(){var contentHTML=getVal(response,"html");var objBackgroundOverlay=objElement.children(".unlimited-elements-background-overlay");if(objBackgroundOverlay.length==1){objBackgroundOverlay.html(contentHTML);if(location=="front")
objBackgroundOverlay.addClass(classFront);else
objBackgroundOverlay.removeClass(classFront);}else{var addClass="";if(location=="front")
addClass=" "+classFront;var html="<div class='unlimited-elements-background-overlay"+addClass+"'>";html+=contentHTML;html+="</div>";objElement.prepend(html);}
var objVideoContainer=objElement.children(".elementor-background-video-container");if(objVideoContainer.length==1){var objBackgroundOverlay=objElement.children(".unlimited-elements-background-overlay");objBackgroundOverlay.insertAfter(objVideoContainer);}});}
function checkElementBackground(element,objSettings){var backgroundType=getVal(objSettings,"uc_background_type");if(!backgroundType||backgroundType=="__none__"){var objBackgroundOverlay=element.children(".unlimited-elements-background-overlay");if(objBackgroundOverlay.length)
objBackgroundOverlay.remove();return(false);}
loadBGWidget(backgroundType,objSettings,function(response,settingsData){applyBackgroundToElement(element,response,settingsData);});}
function onFrontElementReady(element){var objElement=jQuery(element);var type=objElement.data("element_type");switch(type){case"section":case"container":break;default:return(true);break;}
var id=objElement.data("id");if(window.ucLastElementorModelID&&id!=window.ucLastElementorModelID)
return(true);var objSettings=getSettingsFromElementor(id);checkElementBackground(element,objSettings);}
function getLastOpenedWidgetSettings(){if(!window.ucLastElementorModelID)
return(null);var settings=getSettingsFromElementor(window.ucLastElementorModelID);return(settings);}
function onElementorSectionPanelChange(event,model){window.ucLastElementorModelID=model.id;window.ucLastElementorModel=model.attributes;}
function initBackgrounds(){elementor.hooks.addAction("panel/open_editor/section",onElementorSectionPanelChange);elementor.hooks.addAction("panel/open_editor/container",onElementorSectionPanelChange);elementor.hooks.addAction("panel/open_editor/widget",onElementorSectionPanelChange);if(typeof elementorFrontend!="undefined"){elementorFrontend.hooks.addAction('frontend/element_ready/section',onFrontElementReady);elementorFrontend.hooks.addAction('frontend/element_ready/container',onFrontElementReady);}}
function checkRemoveLoader(){var hasLoadingClass=jQuery("body").hasClass("elementor-panel-loading");if(hasLoadingClass==false)
return(false);var timePass=Date.now()-g_temp.startTime;if(timePass>10000)
jQuery("body").removeClass("elementor-panel-loading");}
function onElementorOpenWidget(event,model){checkRemoveLoader();window.ucLastElementorModelID=model.id;window.ucLastElementorModel=model.attributes;window.lastWidgetType=getVal(model.attributes,"widgetType");g_frontAPI.triggerEvent("open_widget_settings",window.ucLastElementorModel);}
this.runAjaxAction=function(action){var data={widget_name:window.lastWidgetType};var ajaxAction;switch(action){case"reinstall_widget":ajaxAction="update_addon_from_catalog";var widgetTitle=jQuery("#elementor-panel-header-title").text();widgetTitle=widgetTitle.replace("Edit ","");if(confirm("Do you really want to reinstall \""+widgetTitle+"\" widget?")==false)
return(false);break;}
if(!ajaxAction){alert("no action");return(false);}
ajaxRequest(ajaxAction,data,function(response){switch(action){case"reinstall_widget":alert("widget updated, please refresh the page");break;}});}
this.ajaxRequest=function(action,ajaxData,response){ajaxRequest(action,ajaxData,response);}
this.initFrontEndInteraction=function(windowFront,elementorFrontend){if(typeof elementorFrontend=="undefined")
return(false);if(typeof elementorFrontend.hooks=="undefined"){setTimeout(function(){t.initFrontEndInteraction(windowFront,elementorFrontend);},300);return(false);}
g_frontAPI=new UniteCreatorElementorFrontAPI();g_windowFront=windowFront;g_windowFront.g_ueSettingsAPI=g_frontAPI;if(typeof g_ucHasBackgrounds!=="undefined"&&g_ucHasBackgrounds===true)
initBackgrounds();g_temp.startTime=Date.now();elementor.hooks.addAction("panel/open_editor/widget",onElementorOpenWidget);if(elementor.channels){elementor.channels.data.on("element:destroy",function(model){g_frontAPI.triggerEvent("after_delete_element",model.id);});}}
function ____________INIT______________(){}
this.init=function(){g_objBody=jQuery("body");g_objSettingsPanel=jQuery("#elementor-panel");initAudioControl();initPostTypeSelectControl();initEvents();}}
function UniteCreatorElementorFrontAPI(){var g_objAdmin;function trace(str){console.log(str);}
this.triggerEvent=function(eventName,model,options){var data={};data.model=model;jQuery(window).trigger("ue_event_"+eventName,data);}
this.onEvent=function(eventName,func){jQuery(window).on("ue_event_"+eventName,func);}
this.initAPI=function(objAdmin){g_objAdmin=objAdmin;}}
var g_objUCElementorEditorAdmin=new UniteCreatorElementorEditorAdmin();jQuery(document).ready(function(){g_objUCElementorEditorAdmin.init();});