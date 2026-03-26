window.imagify=window.imagify||{};(function($,d,w,undefined){var Imagifybeat=function(){var $document=$(d),settings={suspend:false,suspendEnabled:true,screenId:'',url:'',lastTick:0,queue:{},mainInterval:60,tempInterval:0,originalInterval:0,minimalInterval:0,countdown:0,connecting:false,connectionError:false,errorcount:0,hasConnected:false,hasFocus:true,userActivity:0,userActivityEvents:false,checkFocusTimer:0,beatTimer:0};function initialize(){var options,hidden,visibilityState,visibilitychange;if(typeof w.pagenow==='string'){settings.screenId=w.pagenow;}
if(typeof w.ajaxurl==='string'){settings.url=w.ajaxurl;}
if(typeof w.imagifybeatSettings==='object'){options=w.imagifybeatSettings;if(!settings.url&&options.ajaxurl){settings.url=options.ajaxurl;}
if(options.interval){settings.mainInterval=options.interval;if(settings.mainInterval<15){settings.mainInterval=15;}else if(settings.mainInterval>120){settings.mainInterval=120;}}
if(options.minimalInterval){options.minimalInterval=parseInt(options.minimalInterval,10);settings.minimalInterval=options.minimalInterval>0&&options.minimalInterval<=600?options.minimalInterval*1000:0;}
if(settings.minimalInterval&&settings.mainInterval<settings.minimalInterval){settings.mainInterval=settings.minimalInterval;}
if(!settings.screenId){settings.screenId=options.screenId||'front';}
if('disable'===options.suspension){disableSuspend();}}
settings.mainInterval=settings.mainInterval*1000;settings.originalInterval=settings.mainInterval;if(typeof document.hidden!=='undefined'){hidden='hidden';visibilitychange='visibilitychange';visibilityState='visibilityState';}else if(typeof document.msHidden!=='undefined'){hidden='msHidden';visibilitychange='msvisibilitychange';visibilityState='msVisibilityState';}else if(typeof document.webkitHidden!=='undefined'){hidden='webkitHidden';visibilitychange='webkitvisibilitychange';visibilityState='webkitVisibilityState';}
if(hidden){if(document[hidden]){settings.hasFocus=false;}
$document.on(visibilitychange+'.imagifybeat',function(){if('hidden'===document[visibilityState]){blurred();w.clearInterval(settings.checkFocusTimer);}else{focused();if(document.hasFocus){settings.checkFocusTimer=w.setInterval(checkFocus,10000);}}});}
if(document.hasFocus){settings.checkFocusTimer=w.setInterval(checkFocus,10000);}
$(w).on('unload.imagifybeat',function(){settings.suspend=true;if(settings.xhr&&4!==settings.xhr.readyState){settings.xhr.abort();}});w.setInterval(checkUserActivity,30000);$document.ready(function(){settings.lastTick=time();scheduleNextTick();});}
function time(){return(new Date()).getTime();}
function isLocalFrame(frame){var origin,src=frame.src;if(src&&/^https?:\/\//.test(src)){origin=w.location.origin?w.location.origin:w.location.protocol+'//'+w.location.host;if(src.indexOf(origin)!==0){return false;}}
try{if(frame.contentWindow.document){return true;}}catch(e){}
return false;}
function checkFocus(){if(settings.hasFocus&&!document.hasFocus()){blurred();}else if(!settings.hasFocus&&document.hasFocus()){focused();}}
function setErrorState(error,httpStatus){var trigger;if(error){switch(error){case'abort':break;case'timeout':trigger=true;break;case'error':if(503===httpStatus&&settings.hasConnected){trigger=true;break;}
case'parsererror':case'empty':case'unknown':settings.errorcount++;if(settings.errorcount>2&&settings.hasConnected){trigger=true;}
break;}
if(trigger&&!hasConnectionError()){settings.connectionError=true;$document.trigger('imagifybeat-connection-lost',[error,httpStatus]);if(w.wp.hooks){w.wp.hooks.doAction('imagifybeat.connection-lost',error,httpStatus);}}}}
function clearErrorState(){settings.hasConnected=true;if(hasConnectionError()){settings.errorcount=0;settings.connectionError=false;$document.trigger('imagifybeat-connection-restored');if(w.wp.hooks){w.wp.hooks.doAction('imagifybeat.connection-restored');}}}
function connect(){var ajaxData,imagifybeatData;if(settings.connecting||settings.suspend){return;}
settings.lastTick=time();imagifybeatData=$.extend({},settings.queue);settings.queue={};$document.trigger('imagifybeat-send',[imagifybeatData]);if(w.wp.hooks){w.wp.hooks.doAction('imagifybeat.send',imagifybeatData);}
ajaxData={data:imagifybeatData,interval:settings.tempInterval?settings.tempInterval / 1000:settings.mainInterval / 1000,_nonce:typeof w.imagifybeatSettings==='object'?w.imagifybeatSettings.nonce:'',action:'imagifybeat',screen_id:settings.screenId,has_focus:settings.hasFocus};if('customize'===settings.screenId){ajaxData.wp_customize='on';}
settings.connecting=true;settings.xhr=$.ajax({url:settings.url,type:'post',timeout:60000,data:ajaxData,dataType:'json'}).always(function(){settings.connecting=false;scheduleNextTick();}).done(function(response,textStatus,jqXHR){var newInterval;if(!response){setErrorState('empty');return;}
clearErrorState();if(response.nonces_expired){$document.trigger('imagifybeat-nonces-expired');if(w.wp.hooks){w.wp.hooks.doAction('imagifybeat.nonces-expired');}}
if(response.imagifybeat_interval){newInterval=response.imagifybeat_interval;delete response.imagifybeat_interval;}
if(response.imagifybeat_nonce&&typeof w.imagifybeatSettings==='object'){w.imagifybeatSettings.nonce=response.imagifybeat_nonce;delete response.imagifybeat_nonce;}
$document.trigger('imagifybeat-tick',[response,textStatus,jqXHR]);if(w.wp.hooks){w.wp.hooks.doAction('imagifybeat.tick',response,textStatus,jqXHR);}
if(newInterval){interval(newInterval);}}).fail(function(jqXHR,textStatus,error){setErrorState(textStatus||'unknown',jqXHR.status);$document.trigger('imagifybeat-error',[jqXHR,textStatus,error]);if(w.wp.hooks){w.wp.hooks.doAction('imagifybeat.error',jqXHR,textStatus,error);}});}
function scheduleNextTick(){var delta=time()-settings.lastTick,interv=settings.mainInterval;if(settings.suspend){return;}
if(!settings.hasFocus&&settings.suspendEnabled){interv=120000;}else if(settings.countdown>0&&settings.tempInterval){interv=settings.tempInterval;settings.countdown--;if(settings.countdown<1){settings.tempInterval=0;}}
if(settings.minimalInterval&&interv<settings.minimalInterval){interv=settings.minimalInterval;}
w.clearTimeout(settings.beatTimer);if(delta<interv){settings.beatTimer=w.setTimeout(function(){connect();},interv-delta);}else{connect();}}
function blurred(){settings.hasFocus=false;}
function focused(){settings.userActivity=time();settings.suspend=false;if(!settings.hasFocus){settings.hasFocus=true;scheduleNextTick();}}
function userIsActive(){settings.userActivityEvents=false;$document.off('.imagifybeat-active');$('iframe').each(function(i,frame){if(isLocalFrame(frame)){$(frame.contentWindow).off('.imagifybeat-active');}});focused();}
function checkUserActivity(){var lastActive=settings.userActivity?time()-settings.userActivity:0;if(lastActive>300000&&settings.hasFocus){blurred();}
if(settings.suspendEnabled&&lastActive>600000){settings.suspend=true;}
if(!settings.userActivityEvents){$document.on('mouseover.imagifybeat-active keyup.imagifybeat-active touchend.imagifybeat-active',function(){userIsActive();});$('iframe').each(function(i,frame){if(isLocalFrame(frame)){$(frame.contentWindow).on('mouseover.imagifybeat-active keyup.imagifybeat-active touchend.imagifybeat-active',function(){userIsActive();});}});settings.userActivityEvents=true;}}
function hasFocus(){return settings.hasFocus;}
function hasConnectionError(){return settings.connectionError;}
function connectNow(){settings.lastTick=0;scheduleNextTick();}
function disableSuspend(){settings.suspendEnabled=false;}
function enableSuspend(){settings.suspendEnabled=true;}
function interval(speed,ticks){var newInterval,oldInterval=settings.tempInterval?settings.tempInterval:settings.mainInterval;if(speed){switch(speed){case'fast':case 5:newInterval=5000;break;case 15:newInterval=15000;break;case 30:newInterval=30000;break;case 60:newInterval=60000;break;case 120:newInterval=120000;break;case'long-polling':settings.mainInterval=0;return 0;default:newInterval=settings.originalInterval;}
if(settings.minimalInterval&&newInterval<settings.minimalInterval){newInterval=settings.minimalInterval;}
if(5000===newInterval){ticks=parseInt(ticks,10)||30;ticks=ticks<1||ticks>30?30:ticks;settings.countdown=ticks;settings.tempInterval=newInterval;}else{settings.countdown=0;settings.tempInterval=0;settings.mainInterval=newInterval;}
if(newInterval!==oldInterval){scheduleNextTick();}}
return settings.tempInterval?settings.tempInterval / 1000:settings.mainInterval / 1000;}
function resetInterval(){return interval(settings.originalInterval);}
function enqueue(handle,data,noOverwrite){if(handle){if(noOverwrite&&this.isQueued(handle)){return false;}
settings.queue[handle]=data;return true;}
return false;}
function isQueued(handle){if(handle){return Object.prototype.hasOwnProperty.call(settings.queue,handle);}}
function dequeue(handle){if(handle){delete settings.queue[handle];}}
function getQueuedItem(handle){if(handle){return this.isQueued(handle)?settings.queue[handle]:undefined;}}
initialize();return{hasFocus:hasFocus,connectNow:connectNow,disableSuspend:disableSuspend,enableSuspend:enableSuspend,interval:interval,resetInterval:resetInterval,hasConnectionError:hasConnectionError,enqueue:enqueue,dequeue:dequeue,isQueued:isQueued,getQueuedItem:getQueuedItem};};w.imagify.beat=new Imagifybeat();})(jQuery,document,window);