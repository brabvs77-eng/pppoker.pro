"use strict";(function($){$.mlp={x:0,y:0};function documentHandler(){var $current=this===document?$(this):$(this).contents();$current.mousemove(function(e){jQuery.mlp={x:e.pageX,y:e.pageY}});}
$(documentHandler);$.fn.ismouseover=function(overThis){var result=false;this.eq(0).each(function(){var $current=$(this).is("iframe")?$(this).contents().find("body"):$(this);var offset=$current.offset();result=offset.left<=$.mlp.x&&offset.left+$current.outerWidth()>$.mlp.x&&offset.top<=$.mlp.y&&offset.top+$current.outerHeight()>$.mlp.y;});return result;};$.fn.doOnEnter=function(func){var object=jQuery(this);if(object.is("input")==false)
throw new Error("The do on enter event allowed only on inputs");if(typeof func!="function")
throw new Error("wrong function:"+func);object.keyup(function(event){if(event.keyCode==13)
func();});};})(jQuery);if(typeof window.addEvent=="undefined")
window.addEvent=function(){};function UniteAdminUC(){var t=this;var g_errorMessageID=null,g_hideMessageCounter=0,g_errorMessageHideFunc=null;var g_ajaxLoaderID=null,g_ajaxLoadingButtonID=null,g_ajaxHideButtonID=null,g_successMessageID=null;var g_colorPickerCallback=null;var g_providerAdmin=new UniteProviderAdminUC(),g_dialogActivation,g_generalSettings;g_providerAdmin.setParent(this);var g_temp={timer:null,trasholdHandle:null,trasholdDelay:500,debounceDelay:500,throttleDelay:50,};this.getvalopt={FORCE_BOOLEAN:"force_boolean",FORCE_NUMERIC:"force_numeric",TRIM:"trim"};this.__________GENERAL_FUNCTIONS_____=function(){};this.isDebugMode=function(){var debugMode=false;if(typeof g_ucDebugMode!="undefined"&&g_ucDebugMode===true)
debugMode=true;return(debugMode);}
this.debug=function(html){html+="<a href='javascript:jQuery(\"#div_debug\").hide()' class='unite-debug-close'>X</a>";jQuery("#div_debug").show().html(html);};this.trace=function(data,clear){if(clear&&clear==true)
console.clear();console.log(data);};this.getGeneralSetting=function(name){if(!g_generalSettings)
g_generalSettings=jQuery.parseJSON(g_ucGeneralSettings);var value=t.getVal(g_generalSettings,name);return(value);};this.isRightButtonPressed=function(event){if(event.buttons==2||event.button==2)
return(true);return(false);};this.insertToCodeMirror=function(cm,text){var doc=cm.getDoc();var cursor=doc.getCursor();doc.replaceSelection(text);};this.getRandomNumber=function(){var min=1;var max=1000000;return Math.floor(Math.random()*(max-min+1)+min);};this.getVal=function(obj,name,defaultValue,opt){if(!defaultValue)
var defaultValue="";var val="";if(!obj||typeof obj!="object")
val=defaultValue;else if(obj.hasOwnProperty(name)==false){val=defaultValue;}else{val=obj[name];}
switch(opt){case t.getvalopt.FORCE_BOOLEAN:val=t.strToBool(val);break;case t.getvalopt.TRIM:val=String(val);val=jQuery.trim(val);break;case t.getvalopt.FORCE_NUMERIC:val=jQuery.trim(val);if(typeof val=="string"){val.replace("px","");val=Number(val);}
break;}
return(val);}
this.addCssSetting=function(objSettings,objCss,name,cssName,suffix){if(!suffix)
var suffix="";var value=t.getVal(objSettings,name,null);if(value)
objCss[cssName]=value+suffix;return(objCss);};this.objSize=function(obj){var count=0;if(typeof obj=="object"){if(Object.keys){count=Object.keys(obj).length;}else if(window._){count=_.keys(obj).length;}else if(window.jQuery){count=jQuery.map(obj,function(){return 1;}).length;}else{for(var key in obj)if(obj.hasOwnProperty(key))count++;}}
return count;};this.isObjPropertyExists=function(object,name){if(typeof object!="object")
return(false);return object.hasOwnProperty(name);}
this.__________ARRAYS_____=function(){};this.isArrIncludesAnotherArrItem=function(source,second){var isContains=second.some(function(value){return source.includes(value);});return(isContains);}
this.__________STRINGS_____=function(){};this.getTextDiff=function(first,second){var start=0;while(start<first.length&&first[start]==second[start]){++start;}
var end=0;while(first.length-end>start&&first[first.length-end-1]==second[second.length-end-1]){++end;}
end=second.length-end;return second.substr(start,end-start);}
function rawurldecode(str){return decodeURIComponent(str+'');}
function rawurlencode(str){str=(str+'').toString();return encodeURIComponent(str).replace(/!/g,'%21').replace(/'/g,'%27').replace(/\(/g,'%28').replace(/\)/g,'%29').replace(/\*/g,'%2A');}
function utf8_decode(str_data){var tmp_arr=[],i=0,ac=0,c1=0,c2=0,c3=0;str_data+='';while(i<str_data.length){c1=str_data.charCodeAt(i);if(c1<128){tmp_arr[ac++]=String.fromCharCode(c1);i++;}else if(c1>191&&c1<224){c2=str_data.charCodeAt(i+1);tmp_arr[ac++]=String.fromCharCode(((c1&31)<<6)|(c2&63));i+=2;}else{c2=str_data.charCodeAt(i+1);c3=str_data.charCodeAt(i+2);tmp_arr[ac++]=String.fromCharCode(((c1&15)<<12)|((c2&63)<<6)|(c3&63));i+=3;}}
return tmp_arr.join('');}
this.base64_decode=function(data){var b64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var o1,o2,o3,h1,h2,h3,h4,bits,i=0,ac=0,dec="",tmp_arr=[];if(!data){return data;}
data+='';do{h1=b64.indexOf(data.charAt(i++));h2=b64.indexOf(data.charAt(i++));h3=b64.indexOf(data.charAt(i++));h4=b64.indexOf(data.charAt(i++));bits=h1<<18|h2<<12|h3<<6|h4;o1=bits>>16&0xff;o2=bits>>8&0xff;o3=bits&0xff;if(h3==64){tmp_arr[ac++]=String.fromCharCode(o1);}else if(h4==64){tmp_arr[ac++]=String.fromCharCode(o1,o2);}else{tmp_arr[ac++]=String.fromCharCode(o1,o2,o3);}}while(i<data.length);dec=tmp_arr.join('');dec=utf8_decode(dec);return dec;}
function utf8_encode(argString){if(argString===null||typeof argString==="undefined"){return"";}
var string=(argString+'');var utftext="",start,end,stringl=0;start=end=0;stringl=string.length;for(var n=0;n<stringl;n++){var c1=string.charCodeAt(n);var enc=null;if(c1<128){end++;}else if(c1>127&&c1<2048){enc=String.fromCharCode((c1>>6)|192)+String.fromCharCode((c1&63)|128);}else{enc=String.fromCharCode((c1>>12)|224)+String.fromCharCode(((c1>>6)&63)|128)+String.fromCharCode((c1&63)|128);}
if(enc!==null){if(end>start){utftext+=string.slice(start,end);}
utftext+=enc;start=end=n+1;}}
if(end>start){utftext+=string.slice(start,stringl);}
return utftext;}
this.base64_encode=function(data){var b64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var o1,o2,o3,h1,h2,h3,h4,bits,i=0,ac=0,enc="",tmp_arr=[];if(!data){return data;}
data=utf8_encode(data+'');do{o1=data.charCodeAt(i++);o2=data.charCodeAt(i++);o3=data.charCodeAt(i++);bits=o1<<16|o2<<8|o3;h1=bits>>18&0x3f;h2=bits>>12&0x3f;h3=bits>>6&0x3f;h4=bits&0x3f;tmp_arr[ac++]=b64.charAt(h1)+b64.charAt(h2)+b64.charAt(h3)+b64.charAt(h4);}while(i<data.length);enc=tmp_arr.join('');var r=data.length%3;return(r?enc.slice(0,r-3):enc)+'==='.slice(r||3);}
this.encodeContent=function(value){return t.base64_encode(rawurlencode(value));};this.getHash=function(str){if(!str)
return("");var asString=true;if(typeof str=="object")
str=JSON.stringify(str);else{if(typeof str!="string")
str=String(str);}
var i,l;var hval=0x811c9dc5;for(i=0,l=str.length;i<l;i++){hval^=str.charCodeAt(i);hval+=(hval<<1)+(hval<<4)+(hval<<7)+(hval<<8)+(hval<<24);}
if(asString){return("0000000"+(hval>>>0).toString(16)).substr(-8);}
return hval>>>0;};this.encodeObjectForSave=function(objData){var jsonData=JSON.stringify(objData);var strEncodedData=t.encodeContent(jsonData);return(strEncodedData);};this.decodeContent=function(value){return rawurldecode(t.base64_decode(value));};this.getRandomString=function(numChars){if(!numChars)
numChars=8;var text="";var possible="abcdefghijklmnopqrstuvwxyz0123456789";for(var i=0;i<numChars;i++)
text+=possible.charAt(Math.floor(Math.random()*possible.length));return text;};this.isStringAscii=function(str){var isAscii=/^[ -~\t\n\r]+$/.test(str);return(isAscii);}
this.getNameFromTitle=function(title){var name=title.trim();name=name.replace(/\W+/g,'_');name=name.toLowerCase();return(name);}
this.__________EVENTS_____=function(){};this.triggerEvent=function(eventName,opt1){eventName="unite_"+eventName;jQuery("body").trigger(eventName,opt1);};this.onEvent=function(eventName,func,objBody){eventName="unite_"+eventName;if(!objBody)
var objBody=jQuery("body");objBody.on(eventName,func);};this.offEvent=function(eventName){jQuery("body").off(eventName);};this.debounce=function(func,delay){var handle=null;return function(){var args=arguments;clearTimeout(handle);handle=setTimeout(()=>{func.apply(null,args);},delay||g_temp.debounceDelay);};};this.throttle=function(func,delay){var handle=null;return function(){if(handle===null){func.apply(null,arguments);handle=setTimeout(function(){handle=null;},delay||g_temp.throttleDelay);}};};this.runWithTrashold=function(func,event,objInput){clearTimeout(g_temp.trasholdHandle);g_temp.trasholdHandle=setTimeout(function(){func(event,objInput);},g_temp.trasholdDelay);};this.onChangeInputValue=function(objInput,func){objInput.keyup(function(){t.runWithTrashold(function(event){var value=objInput.val();var oldValue=objInput.data("uc_old_val");if(value!==oldValue)
func(event,objInput);objInput.data("uc_old_val",value);});});};this.__________HTML_RELATED_____=function(){};this.addOptionToSelect=function(objSelect,value,text,addDataName,addDataValue){var option=jQuery('<option>',{value:value,text:text});if(addDataName)
option.data(addDataName,addDataValue);objSelect.append(option);};this.addTextToInput=function(objInput,addText){var type=t.getInputType(objInput);if(type!="text"&&type!="textarea"){trace(objInput);throw new Error("wrong input type: "+type);}
var input=objInput[0];var cursorPos=undefined;if(typeof input.selectionStart!="undefined")
cursorPos=input.selectionStart;var value=objInput.val();if(cursorPos===undefined)
value+=addText;else
value=value.substr(0,cursorPos)+addText+value.substr(cursorPos);objInput.val(value);objInput.focus();if(cursorPos!==undefined){var newPos=cursorPos+addText.length;input.setSelectionRange(newPos,newPos);}};this.loadIncludeFile=function(type,url,data){var addProtocol=t.getVal(data,"addProtocol",false,t.getvalopt.FORCE_BOOLEAN);var replaceID=t.getVal(data,"replaceID");var name=t.getVal(data,"name");var onload=t.getVal(data,"onload");if(addProtocol===true)
url=location.protocol+"//"+url;var noRand=t.getVal(data,"norand");if(!noRand){var rand=Math.floor((Math.random()*100000)+1);if(url.indexOf("?")==-1)
url+="?rand="+rand;else
url+="&rand="+rand;}
if(replaceID)
jQuery("#"+replaceID).remove();switch(type){case"js":var tag=document.createElement('script');tag.src=url;if(typeof onload=="function"){tag.onload=function(){onload(jQuery(this),replaceID);};}
var firstScriptTag=document.getElementsByTagName('script')[0];firstScriptTag.parentNode.insertBefore(tag,firstScriptTag);tag=jQuery(tag);if(name)
tag.attr("name",name);break;case"css":jQuery("head").append("<link>");var tag=jQuery("head").children(":last");var attributes={rel:"stylesheet",type:"text/css",href:url};if(name)
attributes.name=name;if(typeof onload=="function"){attributes.onload=function(){onload(jQuery(this),replaceID);};}
tag.attr(attributes);break;default:throw Error("Undefined include type: "+type);break;}
if(replaceID)
tag.attr({id:replaceID});return(tag);};this.arrCssToStrCss=function(arrCss,selector,addBr){var strContent="";jQuery.each(arrCss,function(key,value){if(key=="inline-css")
strContent+=value;else
strContent+=key+":"+value+";";if(addBr===true)
strContent+="\n";});if(!strContent)
return("");if(!selector)
return(strContent);var strCss=selector+="{";if(addBr==true)
strCss+="\n";strCss+=strContent+"}";if(addBr===true)
strCss+="\n";return(strCss);};this.wrapCssInMobile=function(css,isTablet){if(isTablet==="tablet")
isTablet=true;if(!css)
return("");if(isTablet===true){var output="@media (max-width:780px){"+css+"}";}else{var output="@media (max-width:480px){"+css+"}";}
return(output);};this.printCssStyle=function(css,objID,objContainer){if(!objContainer)
var objContainer=jQuery("head");var styleID=null;if(objID)
styleID="unite_style_"+objID;jQuery("#"+styleID).remove();if(!css)
return(true);var html="<style id='"+styleID+"' type='text/css'>\n";html+=css+"\n";html+="</style>";objContainer.append(html);};this.enableButton=function(buttonID){jQuery(buttonID).removeClass("button-disabled");};this.disableButton=function(buttonID){jQuery(buttonID).addClass("button-disabled");};this.isButtonEnabled=function(buttonID){if(jQuery(buttonID).hasClass("button-disabled"))
return(false);return(true);};this.disableInput=function(objInput){objInput.addClass("setting-disabled").prop("disabled","disabled");};this.enableInput=function(objInput){objInput.removeClass("setting-disabled").prop("disabled","");};this.getInputType=function(objInput){if(objInput.is("input[type='text']"))
return("text");if(objInput.is("textarea"))
return("textarea");if(objInput.is("input[type='radio']"))
return("radio");if(objInput.is("select"))
return("select");if(objInput.is("input[type='checkbox']"))
return("checkbox");if(objInput.is("input[type='button']"))
return("button");if(objInput.is("input[type='number']"))
return("text");var inputType=objInput.data("inputtype");if(inputType)
return(inputType);var inputName=objInput.prop("name");if(!inputName)
inputName=objInput[0].tagname;trace(objInput);console.trace();throw new Error("Undefined input: "+inputName);}
this.isSimpleInputType=function(inputType){switch(inputType){case"text":case"textarea":case"radio":case"select":case"checkbox":return(true);break;}
return(false);}
this.showHideElement=function(objElement,isShow){if(isShow==true)
objElement.show();else
objElement.hide();}
this.setCursorPosition=function(objElement,pos){if(pos<0)
pos=0;var el=objElement[0];var range=document.createRange();var sel=window.getSelection();range.setStart(el.childNodes[0],pos);range.collapse(true);sel.removeAllRanges();sel.addRange(range);el.focus();}
this.__________MODIFY_CONTENT_____=function(){};this.replaceAll=function(text,from,to){return text.split(from).join(to);};this.objToArray=function(obj){if(typeof obj!="object")
throw new Error("objToArray error: not object");var arr=[];jQuery.each(obj,function(key,item){arr.push(item);});return(arr);}
this.strToBool=function(str){switch(typeof str){case"boolean":return(str);break;case"undefined":return(false);break;case"number":if(str==0)
return(false);else
return(true);break;case"string":str=str.toLowerCase();if(str=="true"||str=="1")
return(true);else
return(false);break;}
return(false);};this.boolToStr=function(str){if(typeof str=="string")
return(str);str=(str==true)?"true":"false";return(str);};this.rgb2hex=function(rgb){if(rgb.search("rgb")==-1||jQuery.trim(rgb)=='')return rgb;function hex(x){return("0"+parseInt(x).toString(16)).slice(-2);}
if(rgb.indexOf('-moz')>-1){var temp=rgb.split(' ');delete temp[0];rgb=jQuery.trim(temp.join(' '));}
if(rgb.split(')').length>2){var hexReturn='';var rgbArr=rgb.split(')');for(var i=0;i<rgbArr.length-1;i++){rgbArr[i]+=')';var temp=rgbArr[i].split(',');if(temp.length==4){rgb=temp[0]+','+temp[1]+','+temp[2];rgb+=')';}else{rgb=rgbArr[i];}
rgb=jQuery.trim(rgb);rgb=rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);hexReturn+="#"+hex(rgb[1])+hex(rgb[2])+hex(rgb[3])+" ";}
return hexReturn;}else{var temp=rgb.split(',');if(temp.length==4){rgb=temp[0]+','+temp[1]+','+temp[2];rgb+=')';}
rgb=rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);return"#"+hex(rgb[1])+hex(rgb[2])+hex(rgb[3]);}};this.convertHexToRGB=function(hex){var hex=parseInt(((hex.indexOf('#')>-1)?hex.substring(1):hex),16);return[hex>>16,(hex&0x00FF00)>>8,(hex&0x0000FF)];};this.stripslashes=function(str){return(str+'').replace(/\\(.?)/g,function(s,n1){switch(n1){case'\\':return'\\';case'0':return'\u0000';case'':return'';default:return n1;}});};this.stripTags=function(input,allowed){allowed=(((allowed||"")+"").toLowerCase().match(/<[a-z][a-z0-9]*>/g)||[]).join('');var tags=/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,commentsAndPhpTags=/<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;return input.replace(commentsAndPhpTags,'').replace(tags,function($0,$1){return allowed.indexOf('<'+$1.toLowerCase()+'>')>-1?$0:'';});};this.stripTagsKeepFormatting=function(input){return t.stripTags(input,"<b><br><i><em><strong><small><ins><sub><sup>");}
this.objectToEscepeHtmlString=function(obj){if(typeof obj!="object")
return(obj);var str=JSON.stringify(obj);str=t.htmlspecialchars(str);return(str);};this.htmlspecialchars=function(string){if(!string)
return(string);return string.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");};this.escapeDoubleQuote=function(str){if(!str)
return(str);return str.replace('"','\"');};this.capitalizeFirstLetter=function(str){str=str.substr(0,1).toUpperCase()+str.substr(1).toLowerCase();return(str);};this.getTransparencyFromRgba=function(rgba,inPercent){var temp=rgba.split(',');if(temp.length==4){inPercent=(typeof inPercent!=='undefined')?inPercent:true;return(inPercent)?temp[3].replace(/[^\d.]/g,""):temp[3].replace(/[^\d.]/g,"")*100;}
return false;};this.normalizeSizeValue=function(strValue){strValue=String(strValue);strValue.toLowerCase();if(jQuery.isNumeric(strValue))
strValue+="px";return(strValue);};this.removeLineBreaks=function(str,replaceSign){if(!replaceSign)
var replaceSign="";str.replace(/\s+/g,replaceSign);return(str);};this.convertAmpSign=function(str){var str=str.replace(/&amp;/g,'&');return(str);};this.filterObjectByKeys=function(obj,arrKeys){if(typeof obj!="object")
return(obj);if(jQuery.isArray(arrKeys)==false)
throw new Error("filterObjectByKeys error - arrKeys should be array");var outputObj={};jQuery.each(arrKeys,function(index,key){if(obj.hasOwnProperty(key))
outputObj[key]=obj[key];});return(outputObj);};this.__________PATHS_AND_URLS_____=function(){};this.pathinfo=function(path){var obj={};if(typeof path=="object"){trace(path);throw new Error("pathinfo error: path is object");}
obj.basename=path.replace(/\\/g,'/').replace(/.*\//,'');obj.filename=obj.basename.substr(0,obj.basename.lastIndexOf('.'));return(obj);}
this.stripPathSlashes=function(path){return path.replace(/^\/|\/$/g,'');};this.urlToFull=function(url,urlBase){if(!url)
return(url);if(!urlBase)
var urlBase=g_urlBaseUC;url=g_providerAdmin.urlAssetsToFull(url);if(!url)
return("");if(typeof url=="number")
url=String(url);if(typeof url!="string"){trace(url);throw new Error("url should be a string type");}
var urlSmall=url.toLowerCase();if(urlSmall.indexOf("http://")!==-1||urlSmall.indexOf("https://")!==-1)
return(url);if(url.indexOf(urlBase)!==-1)
return(url);url=jQuery.trim(url);if(!url||url=="")
return("");url=urlBase+url;return(url);}
this.urlToRelative=function(url,urlBase){if(!urlBase)
var urlBase=g_urlBaseUC;url=url.replace(urlBase,"");return(url);};this.getUrlView=function(view,options,isNoWindow){var urlBase=g_urlViewBaseUC;if(isNoWindow===true)
urlBase=g_urlViewBaseNowindowUC;var url=t.addUrlParam(urlBase,"view",view);if(options&&options!=""){if(typeof(options)=="object"){jQuery.each(options,function(key,value){if(typeof value=="object"){value=JSON.stringify(value);value=t.encodeContent(value);}
url+="&"+key+"="+value;});}
else
url+="&"+options;}
return(url);};this.getUrlCurrentView=function(options){var url=g_urlViewBaseUC+"&view="+g_view;if(options)
url+="&"+options;return(url);};this.__________VALIDATION_FUNCTIONS_____=function(){};this.validateObjProperty=function(obj,propertyName,objName){if(typeof obj!="object")
throw new Error("The object is empty (with property: "+elementName);if(typeof propertyName=="object"){jQuery(propertyName).each(function(index,pname){t.validateObjProperty(obj,pname,objName);});return(false);}
if(obj.hasOwnProperty(propertyName)==false){trace(obj);if(!objName)
objName="";throw new Error("The "+objName+" object should has property: "+propertyName);}};this.validateDomElement=function(obj,objName){if(typeof obj!="object"){trace(obj);trace(typeof obj);console.trace();throw new Error("The object: "+objName+" not inited well");}
if(obj.length==0)
throw new Error(objName+" not found!");};this.validateNotEmpty=function(val,fieldName){if(typeof val=="undefined"||jQuery.trim(val)=="")
throw new Error("Please fill <b>"+fieldName+"</b> field");};this.validateIsObject=function(val,fieldName){if(typeof val!=="object")
throw new Error("The field must be object: "+fieldName);};this.validateNameField=function(val,fieldName){var errorMessage="The field <b>"+fieldName+"</b> allow only english lowercase letters, numbers and underscore. Example: first_name ";var regex=/^[a-z0-9_]+$/;if(regex.test(val)==false)
throw new Error(errorMessage);}
this._____________DIALOGS__________=function(){};this.getCustomDialogOffset=function(objDialog,objButton){var extraY=0;var dpWidth=objDialog.outerWidth();var dpHeight=objDialog.outerHeight();var inputHeight=objButton.outerHeight();var doc=objDialog[0].ownerDocument;var docElem=doc.documentElement;var viewWidth=docElem.clientWidth+$(doc).scrollLeft();var viewHeight=docElem.clientHeight+$(doc).scrollTop();var offset=objButton.offset();offset.top+=inputHeight;offset.left-=Math.min(offset.left,(offset.left+dpWidth>viewWidth&&viewWidth>dpWidth)?Math.abs(offset.left+dpWidth-viewWidth):0);offset.top-=Math.min(offset.top,((offset.top+dpHeight>viewHeight&&viewHeight>dpHeight)?Math.abs(dpHeight+inputHeight-extraY):extraY));return offset;}
this.setAddImagePath=function(path,url){if(typeof g_providerAdmin.setPathSelectImages=="function")
g_providerAdmin.setPathSelectImages(path,path,url);};this.openAddImageDialog=function(title,onInsert,isMultiple,source){g_providerAdmin.setParent(t);g_providerAdmin.openAddImageDialog(title,onInsert,isMultiple,source);};this.openAddMp3Dialog=function(title,onInsert,isMultiple,source){g_providerAdmin.setParent(t);g_providerAdmin.openAddMp3Dialog(title,onInsert,isMultiple,source);};this.openAddPostDialog=function(title,onInsert,postType){g_providerAdmin.setParent(t);g_providerAdmin.openSelectArticleDialog(title,onInsert,postType);};this.openVideoDialog=function(callbackFunction,itemData){g_ugMediaDialog.openVideoDialog(callbackFunction,itemData);};this.dialogAjaxRequest=function(dialogID,action,data,funcSuccess,params){dialogID=dialogID.replace("#","");g_ucAdmin.setAjaxLoaderID(dialogID+"_loader");g_ucAdmin.setErrorMessageID(dialogID+"_error");g_ucAdmin.setSuccessMessageID(dialogID+"_success");g_ucAdmin.setAjaxHideButtonID(dialogID+"_action");var isNoClose=t.getVal(params,"noclose");g_ucAdmin.ajaxRequest(action,data,function(response){if(isNoClose!==true){setTimeout(function(){jQuery("#"+dialogID).dialog("close");},500);}
if(typeof(funcSuccess)=="function")
funcSuccess(response);});};this.panelAjaxRequest=function(settingID,action,data,funcSuccess,params){if(!params)
params={};params["noclose"]=true;t.dialogAjaxRequest(settingID,action,data,funcSuccess,params);};this.iframeDialogGetData=function(){var iframeID="unite-settings-dialog-iframe_iframe";var objIframe=jQuery("#"+iframeID);t.validateDomElement(objIframe,"Iframe object");var contents=objIframe.contents();if(!contents)
throw new Error("Can't reach iframe contents");if(typeof contents[0].getIframeData!="function")
throw new Error("getIframeData function not found in document - document.getIframeData = function()");var data=contents[0].getIframeData();return(data);};this.openIframeDialog=function(view,params,dialogOptions,onUpdateClick){var dialogID="unite-settings-dialog-iframe";var iframeID=dialogID+"_iframe";var objDialog=jQuery("#"+dialogID);if(objDialog.length==0){var htmlDialog='<div id="'+dialogID+'" title="select something" class="unite-inputs unite-dialog-iframe" style="display:none">';htmlDialog+='<iframe id="'+iframeID+'"></iframe>';htmlDialog+='</div>';jQuery("body").append(htmlDialog);objDialog=jQuery('#'+dialogID);}
var objIframe=jQuery("#"+iframeID);var contents=objIframe.contents();if(contents){contents.find("html").html("Loading...");}
var urlView=t.getUrlView(view,params,true);objIframe.attr("src",urlView);if(!dialogOptions)
dialogOptions={};if(onUpdateClick){var buttons={};buttons[g_uctext["update"]]=function(){var data=g_ucAdmin.iframeDialogGetData();onUpdateClick(data,objDialog);};dialogOptions.buttons=buttons;}
dialogOptions.close=function(){};dialogOptions.minWidth=1100;t.openCommonDialog(dialogID,null,dialogOptions);};this.openCommonDialog=function(id,onOpen,options,closeOnEmptyClick){if(typeof id=="object"){var id=id.prop("id");if(!id)
throw new Error("The dialog should have ID");id="#"+id;}
if(id.charAt(0)!="#")
id="#"+id;if(jQuery(id).length==0)
throw new Error("Dialog with ID: "+id+" don't exists!");var buttonOpts={};var noClose=t.getVal(options,"no_close_button");if(!noClose){buttonOpts[g_uctext.close]=function(){jQuery(id).dialog("close");};}
jQuery(id+"_loader").hide();jQuery(id+"_error").hide();jQuery(id+"_success").hide();jQuery(id+"_action").show();var dialogOptions={buttons:buttonOpts,minWidth:600,minHeight:300,modal:true,dialogClass:"unite-ui",open:function(){if(typeof onOpen=="function")
onOpen();if(closeOnEmptyClick===true){var objDialogWrapper=jQuery(id).parents(".ui-dialog");var objOverlay=objDialogWrapper.siblings(".ui-widget-overlay");objOverlay.on("click",function(){jQuery(id).dialog("close");objOverlay.off("click");});}}};if(options&&typeof options=="object")
dialogOptions=jQuery.extend(dialogOptions,options);jQuery(id).dialog(dialogOptions);};this.dialogAddLeftButton=function(objDialog,title,funcOnClick){var objButtonPane=objDialog.closest(".ui-dialog").find(".ui-dialog-buttonpane");var html="<div class=\"ui-dialog-buttonset unite-dialog-buttonset-left\">";html+="<button type=\"button\">"+title+"</button>";html+="</div>";var objButtonset=jQuery(html);objButtonPane.append(objButtonset);var objButton=objButtonset.children("button");if(typeof funcOnClick=="function")
objButton.on("click",funcOnClick);return(objButton);};this.__________AJAX_REQUEST_____=function(){};this.showErrorMessage=function(htmlError){if(g_errorMessageID!==null){switch(typeof g_errorMessageID){case"object":g_errorMessageID.show().html(htmlError);break;case"function":g_errorMessageID(htmlError);break;default:jQuery("#"+g_errorMessageID).show().html(htmlError);break;}}else
jQuery("#error_message").show().html(htmlError);showAjaxButton();};function hideErrorMessage(){if(g_errorMessageID!==null){switch(typeof g_errorMessageID){case"object":g_errorMessageID.hide();break;case"string":jQuery("#"+g_errorMessageID).hide();break;case"function":if(typeof g_errorMessageHideFunc=="function")
g_errorMessageHideFunc();break;}
if(g_hideMessageCounter>0){g_hideMessageCounter=0;g_errorMessageID=null;g_errorMessageHideFunc=null;}else
g_hideMessageCounter++;}else
jQuery("#error_message").hide();};this.setErrorMessageID=function(id){g_errorMessageID=id;g_hideMessageCounter=0;};this.setErrorMessageOnHide=function(func){g_errorMessageHideFunc=func;}
this.setSuccessMessageID=function(id){g_successMessageID=id;};this.showSuccessMessage=function(htmlSuccess){var id="#success_message";var delay=2000;if(g_successMessageID){id="#"+g_successMessageID;delay=500;}
if(htmlSuccess!=='Layout Updated'){jQuery(id).show().html(htmlSuccess);}else{var content='<i class="fal fa-check-circle" aria-hidden="true" style="color: green;"></i><span>'+'Saved Successfully'+'</span>';jQuery(id).show().html(content);}
setTimeout(t.hideSuccessMessage,delay);};this.hideSuccessMessage=function(){if(g_successMessageID){jQuery("#"+g_successMessageID).hide();g_successMessageID=null;}
else
jQuery("#success_message").slideUp("slow").fadeOut("slow");showAjaxButton();};this.setAjaxLoaderID=function(id){g_ajaxLoaderID=id;};var showAjaxLoader=function(){if(!g_ajaxLoaderID)
return;if(typeof(g_ajaxLoaderID)=="function")
g_ajaxLoaderID("show_loader");else
jQuery("#"+g_ajaxLoaderID).show();};var hideAjaxLoader=function(){if(!g_ajaxLoaderID)
return;if(typeof g_ajaxLoaderID=="function"){g_ajaxLoaderID("hide_loader");}else{jQuery("#"+g_ajaxLoaderID).hide();g_ajaxLoaderID=null;}};this.setAjaxLoadingButtonID=function(id){g_ajaxLoadingButtonID=id;};var showAjaxLoadingButton=function(){if(!g_ajaxLoadingButtonID)
return;var objButton=jQuery("#"+g_ajaxLoadingButtonID);objButton.prop("disabled",true).text(objButton.data("text-loading"));};var hideAjaxLoadingButton=function(){if(!g_ajaxLoadingButtonID)
return;var objButton=jQuery("#"+g_ajaxLoadingButtonID);objButton.prop("disabled",false).text(objButton.data("text-default"));g_ajaxLoadingButtonID=null;};this.setAjaxHideButtonID=function(buttonID){g_ajaxHideButtonID=buttonID;};function hideAjaxButton(){if(!g_ajaxHideButtonID)
return(false);if(typeof g_ajaxHideButtonID=="function"){g_ajaxHideButtonID("hide_button");}else{jQuery("#"+g_ajaxHideButtonID).hide();}}
function showAjaxButton(){if(!g_ajaxHideButtonID)
return(false);if(typeof g_ajaxHideButtonID=="function"){g_ajaxHideButtonID("show_button");}else{jQuery("#"+g_ajaxHideButtonID).show();g_ajaxHideButtonID=null;}}
this.addUrlParam=function(url,param,value){if(url.indexOf("?")==-1)
url+="?";else
url+="&";if(typeof value=="undefined")
url+=param;else
url+=param+"="+value;return(url);}
this.getUrlAjax=function(action,params){var url=g_urlAjaxActionsUC;url=t.addUrlParam(url,"action",g_pluginNameUC+"_ajax_action");if(typeof g_ucNonce=="string")
url=t.addUrlParam(url,"nonce",g_ucNonce);if(action)
url=t.addUrlParam(url,"client_action",action);if(params)
url=t.addUrlParam(url,params);return(url);}
this.addFormFilesToData=function(formID,objData){var objForm=jQuery("#"+formID);if(objForm.length==0)
throw new Error("form with ID: "+formID+" not found");var objFiles=objForm.find("input[type='file']");if(objFiles.length==0)
throw new Error("no file inputs found in form: "+formID);jQuery.each(objFiles,function(index,objFile){var fieldName=objFile.name;jQuery.each(objFile.files,function(index2,file){objData.append(fieldName,file);});});}
this.ajaxReturnCheck=function(response,successFunction){if(!response){t.showErrorMessage("Empty ajax response!");return(false);}
if(typeof response!="object"){try{response=jQuery.parseJSON(response);}catch(e){t.showErrorMessage("Ajax Error!!! not ajax response");t.debug(response);return(false);}}
if(response==-1){t.showErrorMessage("ajax error!!!");return(false);}
if(response==0){t.showErrorMessage("ajax error, action: <b>"+action+"</b> not found");return(false);}
if(response.success==undefined){t.showErrorMessage("The 'success' param is a must!");return(false);}
if(response.success==false){t.showErrorMessage(response.message);return(false);}
if(typeof successFunction=="function"){if(response.message&&g_successMessageID)
t.showSuccessMessage(response.message);successFunction(response);}
else{if(response.message)
t.showSuccessMessage(response.message);}
if(response.is_redirect)
location.href=response.redirect_url;}
this.ajaxRequest=function(action,data,successFunction){if(typeof data=="undefined")
var data={};var isRawMode=false;if(typeof data.append=="function"){isRawMode=true;var objData=data;objData.append("action",g_pluginNameUC+"_ajax_action");objData.append("client_action",action);if(typeof g_ucNonce=="string")
objData.append("nonce",g_ucNonce);}else{var objData={action:g_pluginNameUC+"_ajax_action",client_action:action,data:data};if(typeof g_ucNonce=="string")
objData.nonce=g_ucNonce;}
hideErrorMessage();showAjaxLoader();showAjaxLoadingButton();hideAjaxButton();var ajaxOptions={type:"post",url:g_urlAjaxActionsUC,dataType:'json',data:objData,success:function(response){hideAjaxLoader();hideAjaxLoadingButton();t.ajaxReturnCheck(response,successFunction);},error:function(jqXHR,textStatus,errorThrown){hideAjaxLoader();hideAjaxLoadingButton();var readyState=jqXHR.readyState;var showError=true;switch(textStatus){case"parsererror":case"error":var responseText=jqXHR.responseText;if(responseText!==undefined)
t.debug(jqXHR.responseText);else{if(readyState==0)
showError=false;}
break;}
if(showError==true)
t.showErrorMessage("Ajax Error!!! "+textStatus);}}
if(isRawMode==true){ajaxOptions.global=false;ajaxOptions.processData=false;ajaxOptions.contentType=false;}
var request=jQuery.ajax(ajaxOptions);return(request);};this.requestThumbUrl=function(urlImage,imageID,callbackFunction){var data={urlImage:urlImage,imageID:imageID};t.ajaxRequest("get_thumb_url",data,function(response){callbackFunction(response.urlThumb);});};function initVersionDialog(){jQuery("#uc_version_link").on("click",function(event){event.preventDefault();var objDialog=jQuery("#uc_dialog_version");var buttonOpts={};buttonOpts[g_uctext.cancel]=function(){objDialog.dialog("close");};objDialog.dialog({dialogClass:"unite-ui",buttons:buttonOpts,minWidth:900,modal:true,open:function(){var objContent=jQuery("#uc_dialog_version_content");var isContentLoaded=objContent.data("loaded");if(isContentLoaded===true)
return;t.ajaxRequest("get_version_text",{},function(response){var html="<pre>"+response.text+"</pre>";objContent.html(html);objContent.data("loaded",true);});},});});}
this.z_________TIMER_FUNCTIONS_______=function(){}
this.startTimer=function(){g_temp.timer=jQuery.now();};this.printTimer=function(){var currentTime=jQuery.now();if(!g_temp.timer){trace("timer not started!");return(false);}
var diff=currentTime-g_temp.timer;trace("time passed: "+diff);};this.printTimeStamp=function(stamp){if(!stamp)
var stamp=jQuery.now();var date1=new Date(stamp);trace(date1);}
this.z_________DATA_FUNCTIONS_______=function(){};this.storeGlobalData=function(key,value){key="unite_data_"+key;jQuery.data(document.body,key,value);};this.getGlobalData=function(key){key="unite_data_"+key;var value=jQuery.data(document.body,key);return(value);};this.__________THIRD_PARTY_____=function(){};this.getDropzoneSingleLineSettings=function(){var htmlTemplate='<div class="uc-dz-preview dz-file-preview">';htmlTemplate+='<div class="uc-dz-details">';htmlTemplate+=' <div class="uc-dz-filename"><span data-dz-name></span></div>';htmlTemplate+=' <div class="uc-dz-size" data-dz-size></div>';htmlTemplate+='</div>';htmlTemplate+='<div class="uc-dz-message uc-dz-error-message"><span data-dz-errormessage></span></div>';htmlTemplate+='<div class="uc-dz-loader"></div>';htmlTemplate+='</div>';var settings={createImageThumbnails:false,addRemoveLinks:true,previewTemplate:htmlTemplate,dictRemoveFile:"remove",dictCancelUpload:"cancel"};return(settings);}
this.clearProviderSetting=function(type,objInput,dataname){if(typeof g_providerAdmin.clearSetting!="function")
return(false);var response=g_providerAdmin.clearSetting(type,objInput,dataname);return(response);}
this.providerSettingSetValue=function(type,objInput,value){if(typeof g_providerAdmin.setSettingValue!="function")
return(false);var response=g_providerAdmin.setSettingValue(type,objInput,value);return(response);};this.initProviderSettingEvents=function(type,objInput){if(typeof g_providerAdmin.initSettingEvents!="function")
return(true);g_providerAdmin.initSettingEvents(type,objInput);};function ____________ACTIVATION____________(){};function activateProDialog(){g_dialogActivation.dialog({dialogClass:"uc-activation-dialog",width:700,height:500,modal:true,create:function(){g_dialogActivation.find('.popup-close').on("click",function(){jQuery('.activateProDialog').dialog('close');});},open:function(){g_dialogActivation.find('.uc-start').removeClass('hidden');g_dialogActivation.find('.uc-fail').addClass('hidden');g_dialogActivation.find('.uc-activated').addClass('hidden');},close:function(){g_dialogActivation.find('.uc-start').addClass('hidden');g_dialogActivation.find('.uc-fail').addClass('hidden');g_dialogActivation.find('.uc-activated').addClass('hidden');}});}
function onActivateButtonClick(){var objButton=jQuery(this);var codeType=objButton.data("codetype");var product=objButton.data("product");var objCode=jQuery("#uc_activate_pro_code");var code="";if(objCode.length){code=jQuery("#uc_activate_pro_code").val();code=jQuery.trim(code);}
g_ucAdmin.setAjaxLoaderID("uc_loader_activate_pro");g_ucAdmin.setAjaxHideButtonID("uc_button_activate_pro");g_ucAdmin.setErrorMessageID(function(message){g_dialogActivation.find('.uc-start').addClass('hidden');g_dialogActivation.find('.uc-fail').removeClass('hidden');g_dialogActivation.find('.popup-error').show().html(message);});var data={};data.code=code;data.codetype=codeType;if(product)
data.product=product;g_ucAdmin.ajaxRequest("activate_product",data,function(response){g_dialogActivation.find('.uc-start').addClass('hidden');g_dialogActivation.find('.uc-fail').addClass('hidden');g_dialogActivation.find('.uc-activated').removeClass('hidden');var activateDays=response["expire_days"];if(activateDays)
g_dialogActivation.find(".uc-activated .days").html(activateDays);else
g_dialogActivation.find(".uc-activated .days").hide();});}
function onActivateTryAgainClick(){g_dialogActivation.find('.uc-start').removeClass('hidden');g_dialogActivation.find('.uc-fail').addClass('hidden');g_dialogActivation.find('.uc-activated').addClass('hidden');jQuery("#uc_activate_pro_code").focus();}
function onDeactivateProductClick(){var objButton=jQuery(this);var product=objButton.data("product");g_ucAdmin.setErrorMessageID(function(message){alert("Error: "+message);});var data={};if(product)
data["product"]=product;g_ucAdmin.ajaxRequest("deactivate_product",data,function(response){confirm(response.message);});}
this.initActivationDialog=function(){g_dialogActivation=jQuery('.activateProDialog');if(g_dialogActivation.length==0)
g_dialogActivation=jQuery(".uc-activation-view");if(g_dialogActivation.length){jQuery(".uc-link-activate-pro").on("click",activateProDialog);jQuery("#uc_button_activate_pro").on("click",onActivateButtonClick);jQuery("#activation_link_try_again").on("click",onActivateTryAgainClick);}
jQuery(".uc-link-deactivate").on("click",onDeactivateProductClick);};this.__________CHECK_CATALOG_____=function(){};function handleCheckCatalog(){if(window.top!=window)
return(false);if(typeof g_ucCheckCatalog==="undefined")
return(false);if(g_ucCheckCatalog!==true)
return(false);t.setErrorMessageID(function(){});var data={};if(g_ucCatalogAddonType)
data["addontype"]=g_ucCatalogAddonType;setTimeout(function(){t.ajaxRequest("check_catalog",data,function(response){});},5000);}
this.__________GLOBAL_INIT_____=function(){};function initSettingShapesPicker(){if(typeof g_ucArrSvgShapes=="undefined")
return(false);if(typeof UniteSettingsUC=="undefined")
return(false);var objSettings=new UniteSettingsUC();var template="<div class='unite-iconpicker-inner-shape unite-shapecontent-[icon]'></div>";var params={};params["add_new"]=true;params["add_new_button_text"]="Add Shape";params["add_new_action"]="add_shape_addon";objSettings.iconPicker_addIconsType("shape",g_ucArrSvgShapes,template,params);var urlShapes=t.getUrlAjax("get_shapes_css");t.loadIncludeFile("css",urlShapes);}
this.fixModalDialogSelect2=function(){if(window.hasOwnProperty("fixModalDialogSelect2_run")==true)
return(false);window.fixModalDialogSelect2_run=true;jQuery.ui.dialog.prototype._allowInteraction=function(e){return(true);};}
this.globalInit=function(){g_providerAdmin.setParent(t);g_providerAdmin.init();if(typeof g_ugMediaDialog!="undefined")
g_ugMediaDialog.init();initVersionDialog();handleCheckCatalog();initSettingShapesPicker();};}
if(!g_ucAdmin)
var g_ucAdmin;function trace(data,clear){if(!g_ucAdmin)
g_ucAdmin=new UniteAdminUC();g_ucAdmin.trace(data,clear);}
function clearTrace(){console.clear();}
function debug(data){if(!g_ucAdmin)
g_ucAdmin=new UniteAdminUC();g_ucAdmin.debug(data);}
function debugLine(data){data+="   "+Math.random();var html=jQuery("#div_debug").html();html+="<br>";html+=data;jQuery("#div_debug").show().html(html);}
jQuery(document).ready(function(){if(!g_ucAdmin)
g_ucAdmin=new UniteAdminUC();g_ucAdmin.globalInit();});