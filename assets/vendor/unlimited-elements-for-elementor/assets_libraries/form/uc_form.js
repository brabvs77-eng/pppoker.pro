"use strict";function UnlimitedElementsForm(){var t=this;var ueInputFieldSelector,ueNumberSelector,ueNumberErrorSelector,ueOptionFieldSelector,elementorElementSelector;var g_objCalcInputs;var g_allowedSymbols,g_parents=[];function trace(str){console.log(str);}
function showCustomError(objError,errorText,consoleErrorText){objError.text(errorText);objError.show();var objErrorParent=objError.parents(".debug-wrapper");if(!objErrorParent.length)
throw new Error(consoleErrorText);objErrorParent.addClass("ue_error_true");throw new Error(consoleErrorText);}
function getFormulaNames(expr,objError){var regex=/\[(.*?)\]/g;var matches=expr.match(regex);var names;if(matches)
names=matches.map(match=>match.substring(1,match.length-1));if(names==undefined)
return(false);names.forEach(function(name,index){for(var i=0;i<name.length;i++){var currentChar=name[i];if(currentChar===" "){var errorText='Unlimited Elements Form Error: Name option must not contain spaces inside. Found in name: '+name;var consoleErrorText="Space character in name found";showCustomError(objError,errorText,consoleErrorText);}}});expr=expr.replace(/\s+/g,"");var unmatches=expr.replace(regex,"").split(/[\[\]]/);unmatches=unmatches[0].replace(g_allowedSymbols,"").split(/[\[\]]/);if(unmatches[0].length>0){var errorText='Unlimited Elements Form Error: Input Name should be surrounded by square parentheses inside Formula';var consoleErrorText="Missing square parentheses inside Formula";showCustomError(objError,errorText,consoleErrorText);}
return(names);}
function replaceNamesWithValues(expr,objError,objCalcInput){var names=getFormulaNames(expr,objError);if(names==undefined||names==false)
return(expr);names.forEach(function(name,index){var objInpput=jQuery(ueInputFieldSelector+'[name="'+name+'"]');if(!objInpput.length){var errorText='Unlimited Elements Form Error: couldn"t find Number Field Widget with name: '+name;var consoleErrorText="Invalid Number Field Widget Name";showCustomError(objError,errorText,consoleErrorText);}
if(objInpput.length>1){var errorText='Unlimited Elements Form Error: Name option must be unique. Found '+objInpput.length+' Number Field Widgets with name: '+name;var consoleErrorText="Invalid Number Field Widget Name";showCustomError(objError,errorText,consoleErrorText);}
for(var i=0;i<name.length;i++){var currentChar=name[i];if(currentChar===currentChar.toUpperCase()&&currentChar!==currentChar.toLowerCase()){var errorText='Unlimited Elements Form Error: Name option must not contain Uppercase characters. Found in name: '+name;var consoleErrorText="Uppercase in name found";showCustomError(objError,errorText,consoleErrorText);}
if(currentChar===" "){var errorText='Unlimited Elements Form Error: Name option must not contain spaces inside. Found in name: '+name;var consoleErrorText="Space character in name found";showCustomError(objError,errorText,consoleErrorText);}}
var dataDateMode=objCalcInput.data("date-mode");if(dataDateMode==true)
objCalcInput.attr("type","date");var inputType=objInpput.attr("type");var inputValue;if(inputType!="date"){inputValue=objInpput.val();if(inputValue.length==0)
inputValue=0;var dataSeparateThousandsFormat=objInpput.data("separate-thousands-format");if(dataSeparateThousandsFormat=="de-DE"){inputValue=Number(inputValue.replace(".","").replace(",",""));}else{inputValue=Number(inputValue.toString().replace(",",''));}
if(inputValue<0)
inputValue="("+inputValue+")";}else{inputValue=new Date(objInpput.val()).getTime();}
expr=expr.replace(name,inputValue);expr=expr.replace('[','');expr=expr.replace(']','');});return(expr);}
function validateExpression(expr){var matches=expr.match(g_allowedSymbols);var result="";if(matches)
result=matches.join('');expr=result;return(expr);}
function getResult(expr,objError,objCalcInput){expr=expr.replace(/\s+/g,"");expr=replaceNamesWithValues(expr,objError,objCalcInput);var result;var dataLookupTableMode=objCalcInput.data("lookup-table");if(dataLookupTableMode==true){result=getClosestValue(objCalcInput,objError);return(result);}
var dataDateMode=objCalcInput.data("date-mode");if(dataDateMode==true){result=new Date(eval(expr));return(result);}
expr=validateExpression(expr);var errorText=`Unlimited Elements Form Error: wrong math operation: ${expr}`;var consoleErrorText=`Invalid operation: ${expr}`;try{result=eval(expr);objError.hide();}
catch{showCustomError(objError,errorText,consoleErrorText);}
if(isNaN(result)==true){showCustomError(objError,errorText,consoleErrorText);}
return result;}
function getFractionalResult(result,objCalcInput){var dataCharNum=objCalcInput.data("char-num");var dataPeriod=objCalcInput.data("dot-instead-coma");if(dataPeriod==true){objCalcInput.attr("type","text");return(result.toFixed(dataCharNum));}else{return(result.toFixed(dataCharNum))}}
function formatResultNumber(result,objCalcInput){var dataDateMode=objCalcInput.data("date-mode");if(dataDateMode==true){result=result.toISOString().split('T')[0]
return(result);}
var dataFormat=objCalcInput.data("format");if(dataFormat=="round")
return(Math.round(result))
if(dataFormat=="floor")
return(Math.floor(result))
if(dataFormat=="ceil")
return(Math.ceil(result))
if(dataFormat=="fractional")
return(getFractionalResult(result,objCalcInput));}
function getValueWithSeparatedThousands(val,objCalcInput){var dataSeparateThousands=objCalcInput.data("separate-thousands");if(!dataSeparateThousands)
return(val)
if(dataSeparateThousands==false)
return(val);var inputType=objCalcInput.attr("type");if(inputType!="text")
objCalcInput.attr("type","text");var dataSeparateThousandsFormat=objCalcInput.data("separate-thousands-format");if(!dataSeparateThousandsFormat)
dataSeparateThousandsFormat="en-US";val=val.toString().split(".");if(val.length>1&&dataSeparateThousandsFormat=="en-US")
val=parseFloat(val[0]).toLocaleString(dataSeparateThousandsFormat)+'.'+val[1];else
val=parseFloat(val[0]).toLocaleString(dataSeparateThousandsFormat)
return(val);}
function setResult(objCalcInput,objError){var dataFormula=objCalcInput.data("formula");if(dataFormula==undefined)
return(false);var result=getResult(dataFormula,objError,objCalcInput);result=formatResultNumber(result,objCalcInput);result=getValueWithSeparatedThousands(result,objCalcInput);objCalcInput.val(result);var dataRemoveReadonlyCalcMode=objCalcInput.data("remove-readonly-for-calc-mode");var inputType=objCalcInput.attr("type");if(dataRemoveReadonlyCalcMode==false||inputType!="number")
objCalcInput.attr('readonly','');}
function onInputChange(objCalcInput){objCalcInput.trigger("input_calc");}
function getParentInput(dataName){dataName=dataName.replace('[','');dataName=dataName.replace(']','');var objInput=jQuery(ueInputFieldSelector+'[name="'+dataName+'"]');return(objInput);}
function assignParentsForLookupTable(objParent,parentAttrName){var parentIdAttribute=objParent.attr("id");var objFormula=objParent.find("[data-formula]");var dataXField=objFormula.data("field-name-x");var dataYField=objFormula.data("field-name-y");var objXField=getParentInput(dataXField);var objYField=getParentInput(dataYField);objXField.attr(parentAttrName,parentIdAttribute);objYField.attr(parentAttrName,parentIdAttribute);}
function removeDuplicatesFromArray(arr){var uniqueArray=[];jQuery.each(arr,function(index,value){if(jQuery.inArray(value,uniqueArray)===-1){var valueArray=value.split(",");var valueArrayNum=valueArray.length;uniqueArray.push(value);}});return uniqueArray;}
function assignParentNumberField(objParent,objError){var objFormula=objParent.find("[data-formula]");var expr=objFormula.data("formula");var parentIdAttribute=objParent.attr("id");var parentAttrName="data-parent-formula-input";var dataLookup=objFormula.data("lookup-table");if(dataLookup==true){assignParentsForLookupTable(objParent,parentAttrName);return(false);}
var names=getFormulaNames(expr,objError);if(names==undefined||names==false)
return(false);for(let i=0;i<names.length;i++){var objInpput=getParentInput(names[i]);var parentAttr=objInpput.attr(parentAttrName);g_parents.push(parentIdAttribute);g_parents=removeDuplicatesFromArray(g_parents);var objParentLookupTableInputByXField=jQuery('[data-field-name-x="'+names[i]+'"]');var objParentLookupTableInputByYField=jQuery('[data-field-name-y="'+names[i]+'"]');var isXFiledForLookupTable=objParentLookupTableInputByXField&&objParentLookupTableInputByXField.length>0;var isYFiledForLookupTable=objParentLookupTableInputByYField&&objParentLookupTableInputByYField.length>0;if(parentAttr!==undefined&&isXFiledForLookupTable==true||parentAttr!==undefined&&isYFiledForLookupTable==true){g_parents.push(parentAttr);}
objInpput.attr(parentAttrName,g_parents);}}
function getLookupTable(csvData){csvData=csvData.split('\n').map(function(row){return row.split(',');});return(csvData);}
function euclideanDistance(x1,y1,x2,y2){return Math.sqrt(Math.pow(x1-x2,2)+Math.pow(y1-y2,2));}
function getClosestValue(objCalcInput,objError){var dataX=objCalcInput.data("field-name-x");var dataY=objCalcInput.data("field-name-y");var objXField=getParentInput(dataX);var objYField=getParentInput(dataY);var csvData=objCalcInput.data("csv");var xValue=objXField.val();var yValue=objYField.val();var lookupTable=getLookupTable(csvData);if(!xValue){var errorText='Unlimited Elements Form Error: no x-value found.';var consoleErrorText='Unlimited Elements Form Error: no x-value found.';showCustomError(objError,errorText,consoleErrorText);}
if(!yValue){var errorText='Unlimited Elements Form Error: no y-value found.';var consoleErrorText='Unlimited Elements Form Error: no y-value found.';showCustomError(objError,errorText,consoleErrorText);}
objError.hide();var closestValue=null;var closestDistance=Infinity;for(var row=1;row<lookupTable.length;row++){for(var col=1;col<lookupTable[row].length;col++){var tableValue=lookupTable[row][col];var tableX=lookupTable[0][col];var tableY=lookupTable[row][0];var distance=euclideanDistance(xValue,yValue,tableX,tableY);if(distance<closestDistance){closestDistance=distance;closestValue=tableValue;}}}
return+closestValue;}
function getParentCalcInput(objInput){var parentsArray=objInput.attr("data-parent-formula-input");var objParentsArray=[];if(parentsArray!=undefined){parentsArray=parentsArray.split(",");parentsArray.forEach(function(id,index){var parentId=id;var objParentCalcInput=jQuery("#"+parentId).find("[data-calc-mode='true']");objParentsArray.push(objParentCalcInput);});return(objParentsArray);}}
function showField(objFieldWidget,classHidden,elementorHiddenClass){objFieldWidget.removeClass(classHidden);var objParentElementorElement=objFieldWidget.closest(elementorElementSelector);objParentElementorElement.removeClass(elementorHiddenClass);}
function hideField(objFieldWidget,classHidden,elementorHiddenClass){objFieldWidget.addClass(classHidden);var objParentElementorElement=objFieldWidget.closest(elementorElementSelector);objParentElementorElement.addClass(elementorHiddenClass);}
function getConditions(visibilityCondition,condition,objFieldValue,fieldValue){switch(condition){case"=":visibilityCondition=objFieldValue==fieldValue;break;case">":visibilityCondition=objFieldValue>fieldValue;break;case">=":visibilityCondition=objFieldValue>=fieldValue;break;case"<":visibilityCondition=objFieldValue<fieldValue;break;case"<=":visibilityCondition=objFieldValue<=fieldValue;break;case"!=":visibilityCondition=objFieldValue!=fieldValue;break;}
return(visibilityCondition);}
function getOperators(operator,visibilityOperator){switch(operator){case"and":visibilityOperator="&&";break;case"or":visibilityOperator="||";break;}
return(visibilityOperator);}
function getNames(arrNames,fieldName){arrNames=[];arrNames.push(fieldName);return(arrNames);}
function equalConditionInputNameError(objField,arrNames,classError){var inputName=objField.attr("name");var isNamesEqual=arrNames.indexOf(inputName)!=-1;if(isNamesEqual==true){var conditionStyles='color:red;font-size:12px;padding:5px;border:1px solid #CE5F5F;border-radius:5px;width:100%';var errorHtml="<div class="+classError+" style='"+conditionStyles+"'>Unlimited Field Error: can't set condition. Condition Item Name equals Field Name: [ "+inputName+" ]. Please use different names.</div>";jQuery(errorHtml).insertBefore(objField.parent());}}
function setVisibilityInEditor(objFieldWidget,classError,classHidden){var hiddenHtml="<div class="+classError+">Unlimited Field is hidden due to Visibility Condition Options. <br> This message shows only in editor.</div>";var objError=objFieldWidget.find("."+classError);if(objFieldWidget.hasClass(classHidden)==true){if(!objError||!objError.length)
objFieldWidget.prepend(hiddenHtml);}else{if(objError&&objError.length)
objError.remove();}}
function checkInvisibleInputsInFormula(){if(!g_objCalcInputs.length)
return(false);g_objCalcInputs.each(function(){var objCalcInput=jQuery(this);var objCalcWidget=objCalcInput.parents(ueNumberSelector);var objError=objCalcWidget.find(ueNumberErrorSelector);var formula=objCalcInput.data('formula');if(!formula)
return(true);var names=getFormulaNames(formula,objError);if(names==undefined||names==false)
return(false);names.forEach(function(name,index){var objInpput=jQuery(ueInputFieldSelector+'[name="'+name+'"]');});});}
function recalculateParentInputs(objParentCalkInputs){if(objParentCalkInputs!=undefined){objParentCalkInputs.forEach(function(parent,index){onInputChange(parent);});}}
function setConditionVisualInEditor(obj,operator,fieldName,condition,fieldValue,conditionsNum,conditions){var conditionClass="ue-form-condition";var conditionStyles='color:#000;font-size:12px;padding:5px;border:1px solid grey;background-color:lightgrey;border-radius:5px;width:100%;margin-top:5px';var conditionHtml=`<div class="${conditionClass}" data-condition="['${operator}', '${fieldName}', '${condition}', '${fieldValue}']" style="${conditionStyles}">Visibility Condition: "${operator} ${fieldName} ${condition} ${fieldValue}"</div>`;var objCondition=obj.find(`[data-condition="['${operator}', '${fieldName}', '${condition}', '${fieldValue}']"]`);var objAllConditions=obj.find(`.${conditionClass}`);var visualConditionsNum=objAllConditions.length;if(!objCondition||!objCondition.length){obj.append(conditionHtml);if(visualConditionsNum>conditionsNum){objAllConditions.each(function(){var objCondition=jQuery(this);var dataCondition=objCondition.data("condition").replace(/'/g,'"');var currentConditionAttr=JSON.parse(dataCondition);var currentOperator=currentConditionAttr[0];var currentFieldName=currentConditionAttr[1];var currentCondition=currentConditionAttr[2];var currentFieldValue=currentConditionAttr[3];for(let i=0;i<conditionsNum;i++){var conditionArray=conditions[i];var operator=conditionArray.operator;var fieldName=conditionArray.field_name;var condition=conditionArray.condition;var fieldValue=parseInt(conditionArray.field_value);if(operator==currentOperator&&fieldName==currentFieldName&&condition==currentCondition&&fieldValue==currentFieldValue)
return(true);}});}}}
t.setVisibility=function(conditionArray,widgetId){var objFieldWidget=jQuery("#"+widgetId);var classHidden="ucform-has-conditions";var elementorHiddenClass="elementor-hidden-desktop elementor-hidden-tablet elementor-hidden-mobile";var classError="ue-error";var conditions=conditionArray.visibility_conditions;var conditionsNum=conditions.length;if(conditionsNum==0)
return(false);var totalVisibilityCondition;var arrNames;for(let i=0;i<conditionsNum;i++){var conditionArray=conditions[i];var condition=conditionArray.condition;var fieldName=conditionArray.field_name;var fieldValue=parseInt(conditionArray.field_value);var operator=conditionArray.operator;var id=conditionArray._id;var objField=jQuery(ueInputFieldSelector+'[name="'+fieldName+'"]');var isInEditor=objField.data("editor");var objFieldValue=parseInt(objField.val());var visibilityCondition=getConditions(visibilityCondition,condition,objFieldValue,fieldValue);var visibilityOperator=getOperators(operator,visibilityOperator);if(i==0)
totalVisibilityCondition=visibilityCondition;if(i>0)
totalVisibilityCondition+=visibilityOperator+visibilityCondition;arrNames=getNames(arrNames,fieldName);var objInputField=objFieldWidget.find(ueInputFieldSelector);equalConditionInputNameError(objInputField,arrNames,classError);if(isInEditor=="yes")
setConditionVisualInEditor(objFieldWidget,operator,fieldName,condition,fieldValue,conditionsNum,conditions);}
var isInEditor=objField.data("editor");if(eval(totalVisibilityCondition)==true){showField(objFieldWidget,classHidden,elementorHiddenClass);if(isInEditor=="yes"){}}
if(eval(totalVisibilityCondition)==false){hideField(objFieldWidget,classHidden,elementorHiddenClass);if(isInEditor=="yes"){}}
checkInvisibleInputsInFormula();}
t.init=function(){if(!g_objCalcInputs.length)
return(false);g_objCalcInputs.each(function(){var objCalcInput=jQuery(this);var objCalcWidget=objCalcInput.parents(ueNumberSelector);var objError=objCalcWidget.find(ueNumberErrorSelector);assignParentNumberField(objCalcWidget,objError);setResult(objCalcInput,objError);objCalcInput.on('input_calc',function(){var objInput=jQuery(this);setResult(objInput,objError);var objParentCalkInputs=getParentCalcInput(objInput);if(objParentCalkInputs!=undefined){objParentCalkInputs.forEach(function(parent,index){var objParentError=parent.find(ueNumberErrorSelector);setResult(parent,objParentError);});}});});var objAllInputFields=jQuery(ueInputFieldSelector);objAllInputFields.on('input',function(){var objInput=jQuery(this);var objParentCalkInputs=getParentCalcInput(objInput);recalculateParentInputs(objParentCalkInputs);});objAllInputFields.each(function(){var objInput=jQuery(this);var objParentCalkInputs=getParentCalcInput(objInput);var dataCalcMode=objInput.data("calc-mode");if(dataCalcMode===false)
return(true);recalculateParentInputs(objParentCalkInputs);});}
function initVars(){ueInputFieldSelector=".ue-input-field";ueNumberSelector=".ue-number, .ue-content";ueNumberErrorSelector=".ue-number-error";ueOptionFieldSelector=".ue-option-field";elementorElementSelector=".elementor-element";g_objCalcInputs=jQuery(ueInputFieldSelector+'[data-calc-mode="true"]');g_allowedSymbols=/Math\.[a-zA-Z]+|\d+(?:\.\d+)?|[-+*/().,]+/g;}
initVars();}
var g_ucUnlimitedForms=new UnlimitedElementsForm();g_ucUnlimitedForms.init();jQuery(document).on('elementor/popup/show',(event,id,objPopup)=>{var g_ucUnlimitedForms=new UnlimitedElementsForm();g_ucUnlimitedForms.init();});