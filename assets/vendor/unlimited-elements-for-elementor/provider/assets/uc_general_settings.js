if(typeof trace=="undefined"){function trace(str){console.log(str);}}
function UCGeneralSettings(){var t=this;var g_currentManager;var g_objCurrentSettings=null,g_objSettingsWrapper;var g_objTooltip,g_options,g_objVCDialogChoose;if(!g_ucAdmin)
var g_ucAdmin=new UniteAdminUC();function encodeContent(value){if(typeof value=="object")
value=JSON.stringify(value);return base64_encode(rawurlencode(value));}
function decodeContent(value){return rawurldecode(base64_decode(value));}
function escapeHtml(text){if(!text)
return(text);if(typeof text!="string")
return(text);return text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
function getOption(option){if(!g_options)
return(null);var value=g_ucAdmin.getVal(g_options,option);return(value);}
function parseVcSetting(param){var settingName=param.name;var objSettingWrapper=g_objSettingsWrapper.find("#uc_vc_setting_wrapper_"+settingName);if(objSettingWrapper.length==0)
throw new Error("the setting wrapper not found: "+settingName);var objValues=g_objCurrentSettings.getSettingsValues(objSettingWrapper);if(objValues.hasOwnProperty(settingName)==false)
throw new Error("Value for setting: "+settingName+" not found");var value=objValues[settingName];switch(param.type){case"uc_textarea":case"uc_editor":value=encodeContent(value);break;default:value=escapeHtml(value);break;}
return(value);}
this.initVCItems=function(){g_currentManager=new UCManagerAdmin();g_currentManager.initManager();}
this.initVCSettings=function(objDivInit){var objEditElement=jQuery("#vc_ui-panel-edit-element");if(objEditElement.length)
objEditElement.css("z-index","60000");var objParent=objDivInit.parents(".vc_edit-form-tab");if(objParent.length==0)
objParent=objDivInit.parents(".wpb_edit_form_elements");if(objParent.length==0)
throw new Error("settings container not found");var idPrefix=null;var objSettingsWrapper=objParent.find(".uc_vc_setting_wrapper:first-child");if(objSettingsWrapper.length)
idPrefix=objSettingsWrapper.data("idprefix");g_objSettingsWrapper=objParent;g_objCurrentSettings=new UniteSettingsUC();g_objCurrentSettings.setIDPrefix(idPrefix);g_objCurrentSettings.init(g_objSettingsWrapper);}
function openImportLayoutDialog(){jQuery("#dialog_import_layouts_file").val("");var options={minWidth:700};g_ucAdmin.openCommonDialog("#uc_dialog_import_layouts",null,options);}
function setPostEditorContent(text){if(typeof tinymce=="undefined")
return(false);var editor=tinymce.get('content');if(editor&&editor instanceof tinymce.Editor){editor.setContent(text);editor.save({no_events:true});}
else{jQuery('textarea#content').val(text);}
return(true);}
function setVCContent(content){if(typeof window.vc.storage=="undefined")
return(false);vc.storage.setContent(content);if(vc.app.status=="shown")
vc.app.show();else
vc.app.switchComposer();}
function checkDestroySettings(){setTimeout(function(){if(g_objCurrentSettings){g_objCurrentSettings.destroy();g_objCurrentSettings=null;}
if(g_currentManager){g_currentManager.destroy();}},200);}
function _______INIT_____(){}
function initVCAtts(){var objParse={parse:parseVcSetting};vc.atts.uc_textfield=objParse;vc.atts.uc_number=objParse;vc.atts.uc_textarea=objParse;vc.atts.uc_radioboolean=objParse;vc.atts.uc_checkbox=objParse;vc.atts.uc_dropdown=objParse;vc.atts.uc_colorpicker=objParse;vc.atts.uc_image=objParse;vc.atts.uc_mp3=objParse;vc.atts.uc_editor=objParse;vc.atts.uc_icon=objParse;vc.atts.uc_items={parse:function(param){if(!g_currentManager)
return("");var itemsData=g_currentManager.getItemsDataJson();itemsData=encodeContent(itemsData);return(itemsData);}};vc.atts.uc_fonts={parse:function(param){return(fontsData);}};}
function initPostTitle(objButton){var initPostTitle=objButton.data("init_post_title");if(!initPostTitle)
return(false);var inputTitle=jQuery("#title").val();if(!inputTitle)
jQuery("#title").val(initPostTitle);}
function initImportVcLayout(){var objButton=jQuery("#uc_button_import_layout");initPostTitle(objButton);g_ucAdmin.enableButton(objButton);if(objButton.length==0)
return(false);objButton.click(openImportLayoutDialog);jQuery("#uc_dialog_import_layouts_action").click(function(){var data={};var isOverwrite=jQuery("#dialog_import_layouts_file_overwrite").is(":checked");var objPostID=jQuery("#post_ID");var postID=null;if(objPostID.length)
postID=objPostID.val();data.postid=postID;data.title=jQuery("#title").val();data.overwrite_addons=isOverwrite;var objData=new FormData();var jsonData=JSON.stringify(data);objData.append("data",jsonData);g_ucAdmin.addFormFilesToData("dialog_import_layouts_form",objData);g_ucAdmin.dialogAjaxRequest("uc_dialog_import_layouts","import_vc_layout",objData,function(response){jQuery("#uc_dialog_import_layouts_success").show();if(response.url_reload){var url=response.url_reload;url=g_ucAdmin.convertAmpSign(url);location.href=url;}else{setVCContent(response.content);}});});}
function initSettingsDestroy(){var isFrontEditor=getOption("is_front_editor");var objEditElement=jQuery("#vc_ui-panel-edit-element");var objButtons=objEditElement.find(".vc_ui-panel-footer .vc_ui-button");if(isFrontEditor===true){var objCloseButton=objButtons.filter('[data-vc-ui-element="button-close"]');objCloseButton.click(checkDestroySettings);}else{objButtons.click(checkDestroySettings);}
var objTopButton=objEditElement.find(".vc_ui-panel-header-controls .vc_ui-close-button");objTopButton.click(checkDestroySettings);}
function initVCIntegration(){g_objVCDialogChoose=jQuery("#vc_ui-panel-add-element");g_currentManager=null;initVCAtts();if(g_ucVCOptions)
g_options=JSON.parse(g_ucVCOptions);initSettingsDestroy();initImportVcLayout();initThumbPresentation();}
function _______TOOLTIPS_THUMBS____(){}
function getPreviewImage(addonID){var obj=g_ucAdmin.getVal(vc_mapper,addonID);if(!obj)
return(null);var urlPreview=g_ucAdmin.getVal(obj,"preview");if(!urlPreview)
return(null);return(urlPreview);}
function initTooltips(categoryAllOnly){if(!vc_mapper)
return(false);if(g_objTooltip)
return(false);var html='<div id="uc_manager_addon_preview" class="uc-vcaddon-preview-wrapper" style="display:none"></div>';jQuery("body").append(html);g_objTooltip=jQuery("#uc_manager_addon_preview");jQuery("body").on("mouseenter",".vc_shortcode-link.uc-addon_nav",function(){var objAddonNav=jQuery(this);if(categoryAllOnly===true){var objParentAll=objAddonNav.parents(".vc_filter-all");if(objParentAll.length==0)
return(false);}
var addonID=objAddonNav.attr("id");var urlPreview=getPreviewImage(addonID);if(!urlPreview)
return(false);checkShowTooltip(objAddonNav,urlPreview);});jQuery("body").on("mouseleave",".vc_shortcode-link.uc-addon_nav",function(){g_objTooltip.hide();});}
function getNavItemPos(objItem){var offset=objItem.offset();return(offset);}
function checkShowTooltip(objItem,urlPreview){if(!g_objTooltip)
return(false);if(!urlPreview)
return(false);g_objTooltip.show();var gapTop=0;var gapLeft=10;var itemWidth=objItem.width();var tooltipHeight=g_objTooltip.height();var tooltipWidth=g_objTooltip.width();var pos=getNavItemPos(objItem);pos.top=pos.top-tooltipHeight+gapTop;pos.left=pos.left+itemWidth-gapLeft;var objCss={top:pos.top+"px",left:pos.left+"px"};objCss["background-image"]="url('"+urlPreview+"')";g_objTooltip.css(objCss);}
function initThumbs(){g_objVCDialogChoose.addClass("uc-vc-dialog-thumbs");g_objVCDialogChoose.find(".uc-addon_nav").each(function(index,item){var objItem=jQuery(item);var addonID=objItem.attr("id");var urlPreview=getPreviewImage(addonID);var style="";if(urlPreview)
style="style=\"background-image:url('"+urlPreview+"')\"";var spanTitle=objItem.find("span");if(spanTitle.length){objItem.prepend("<div "+style+"></div>");}else{var text=objItem.text();var html=objItem.html();html=html.replace(text,"<div "+style+"></div><span>"+text+"</span>");objItem.html(html);}});}
function initThumbPresentation(){if(!g_objVCDialogChoose||g_objVCDialogChoose.length==0)
return(false);var tooltipsType=getOption("thumbs_type");switch(tooltipsType){case"tooltip":initTooltips();break;case"thumb":initThumbs();initTooltips(true);break;}}
this.init=function(){if(typeof vc!="undefined"&&vc.atts){initVCIntegration();}}}
var g_ucObjGeneralSettings=new UCGeneralSettings();jQuery(document).ready(function(){g_ucObjGeneralSettings.init();});