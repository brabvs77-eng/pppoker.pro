var WpmlTemplateCompiler=function(usInstance,templates){var compiledTemplates={};return{getTemplate:function(temp){if(!templates.hasOwnProperty(temp)){throw'No such template: '+temp;}
if(compiledTemplates[temp]===undefined){var template=templates[temp];if(template instanceof Array){template=template.join("\n");}
compiledTemplates[temp]=usInstance.template(template);}
return compiledTemplates[temp];}};};