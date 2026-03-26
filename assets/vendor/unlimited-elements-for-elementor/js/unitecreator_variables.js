"use strict";function UniteCreatorVariables(){var t=this;var g_arrVarsMain=[],g_arrVarsItem=[],g_arrVarsItem2=[];this.types={MAIN:"main",ITEM:"item"};if(!g_ucAdmin)
var g_ucAdmin=new UniteAdminUC();function validateType(type){switch(type){case t.types.MAIN:case t.types.ITEM:break;default:throw new Error("Wrong variables type: "+type);break;}}
function validateIndex(arrItems,index){if(index>=arrItems.length)
throw new Error("The var: "+index+" don't exists in the collection");}
function getArrByType(type){validateType(type);switch(type){case t.types.MAIN:return(g_arrVarsMain);break;case t.types.ITEM:return(g_arrVarsItem);break;}}
this.add=function(type,objVar){var arrVars=getArrByType(type);arrVars.push(objVar);}
this.update=function(type,index,objVar){var arrVars=getArrByType(type);validateIndex(arrVars,index);arrVars[index]=objVar;}
this.deleteVar=function(type,index){var arrItems=getArrByType(type);validateIndex(arrItems,index);arrItems.splice(index,1);}
this.getVariable=function(type,index){validateType(type);var arrItems=getArrByType(type);validateIndex(arrItems,index);var objVar=arrItems[index];return(objVar);}
this.addFromArray=function(type,arrVars){validateType(type);if(typeof arrVars!="object")
return(false);jQuery.each(arrVars,function(index,objVar){t.add(type,objVar);});}
this.getArrVars=function(type){var objVars=getArrByType(type);var arrVars=g_ucAdmin.objToArray(objVars);return(arrVars);}}