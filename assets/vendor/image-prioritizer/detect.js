export const name='Image Prioritizer';const externalBackgroundImages=[];export async function initialize({log:_log,onLCP}){const log=_log||console.log;onLCP((metric)=>{handleLCPMetric(metric,log);},{reportAllChanges:true,});}
function handleLCPMetric(metric,log){for(const entry of metric.entries){if(!entry.url||!(entry.element instanceof HTMLElement)||entry.element instanceof HTMLImageElement||entry.element instanceof HTMLVideoElement){continue;}
if(entry.url.startsWith('data:')){continue;}
if(entry.element.style.backgroundImage){continue;}
if(entry.url.length>500){log(`Skipping very long URL: ${ entry.url }`);return;}
if(entry.element.tagName.length>100){log(`Skipping very long tag name: ${ entry.element.tagName }`);return;}
const id=entry.element.getAttribute('id');if(typeof id==='string'&&id.length>100){log(`Skipping very long ID: ${ id }`);return;}
const className=entry.element.getAttribute('class');if(typeof className==='string'&&className.length>500){log(`Skipping very long className: ${ className }`);return;}
const externalBackgroundImage={url:entry.url,tag:entry.element.tagName,id,class:className,};log('Detected external LCP background image:',externalBackgroundImage);externalBackgroundImages.push(externalBackgroundImage);}}
export async function finalize({extendRootData,log:_log}){const log=_log||console.log;if(externalBackgroundImages.length===0){return;}
const lcpElementExternalBackgroundImage=externalBackgroundImages.pop();log('Sending external background image for LCP element:',lcpElementExternalBackgroundImage);extendRootData({lcpElementExternalBackgroundImage});}