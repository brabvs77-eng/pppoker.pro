(function(){'use strict';let hfeButtonAdded=false;function addHFEButtonToElementorBar(){if(hfeButtonAdded){return;}
if(window.hfeEditorConfig&&window.hfeEditorConfig.isUAEPro){return;}
const $=window.jQuery;if(!$){return;}
setTimeout(()=>{if($('#hfe-dashboard-button').length>0){hfeButtonAdded=true;return;}
const targetContainer=$('#elementor-editor-wrapper-v2 header .MuiGrid-root:nth-child(3) .MuiStack-root');if(targetContainer.length){const existingButton=targetContainer.find('button').first();const buttonClasses=existingButton.length?existingButton.attr('class'):'MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium';const svgClasses=existingButton.find('svg').attr('class')||'MuiSvgIcon-root MuiSvgIcon-fontSizeMedium';const hfeWrapper=$('<div class="hfe-root" id="hfe-dashboard-button"></div>');const buttonContainer=$('<div class="relative"></div>');const iconUrl=window.hfeEditorConfig&&window.hfeEditorConfig.iconUrl?window.hfeEditorConfig.iconUrl:'/wp-content/plugins/header-footer-elementor/assets/images/settings/logo.svg';const hfeButton=$(`
                    <button type="button" class="${buttonClasses}" 
                            aria-label="Header Footer Elementor Dashboard" 
                            tabindex="0">
                        <img src="${iconUrl}" 
                             width="22" height="22" >
                    </button>
                `).on('click',function(){window.open('/wp-admin/admin.php?page=hfe#dashboard','_blank');});function getTooltipText(){return window.hfeEditorConfig&&window.hfeEditorConfig.strings&&window.hfeEditorConfig.strings.headerFooterBuilder?window.hfeEditorConfig.strings.headerFooterBuilder:'Header Footer Builder';}
hfeButton.hover(function(){const tooltipText=getTooltipText();$(this).attr('title',tooltipText);},function(){$(this).removeAttr('title');});buttonContainer.append(hfeButton);hfeWrapper.append(buttonContainer);targetContainer.children().last().after(hfeWrapper);hfeButtonAdded=true;}},500);}
function initializeHFEButton(){if(!window.elementor){return;}
addHFEButtonToElementorBar();}
window.addEventListener('elementor/frontend/init',()=>{setTimeout(initializeHFEButton,200);});if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>{setTimeout(initializeHFEButton,300);});}else{setTimeout(initializeHFEButton,300);}
window.addEventListener('load',()=>{setTimeout(initializeHFEButton,500);});})();