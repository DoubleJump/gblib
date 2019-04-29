'use strict';/**
 * dat-gui JavaScript Controller Library
 * http://code.google.com/p/dat-gui
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.dat=t()}(this,function(){"use strict";function e(e,t){var n=e.__state.conversionName.toString(),o=Math.round(e.r),i=Math.round(e.g),r=Math.round(e.b),s=e.a,a=Math.round(e.h),l=e.s.toFixed(1),d=e.v.toFixed(1);if(t||"THREE_CHAR_HEX"===n||"SIX_CHAR_HEX"===n){for(var c=e.hex.toString(16);c.length<6;)c="0"+c;return"#"+c}return"CSS_RGB"===n?"rgb("+o+","+i+","+r+")":"CSS_RGBA"===n?"rgba("+o+","+i+","+r+","+s+")":"HEX"===n?"0x"+e.hex.toString(16):"RGB_ARRAY"===n?"["+o+","+i+","+r+"]":"RGBA_ARRAY"===n?"["+o+","+i+","+r+","+s+"]":"RGB_OBJ"===n?"{r:"+o+",g:"+i+",b:"+r+"}":"RGBA_OBJ"===n?"{r:"+o+",g:"+i+",b:"+r+",a:"+s+"}":"HSV_OBJ"===n?"{h:"+a+",s:"+l+",v:"+d+"}":"HSVA_OBJ"===n?"{h:"+a+",s:"+l+",v:"+d+",a:"+s+"}":"unknown format"}function t(e,t,n){Object.defineProperty(e,t,{get:function(){return"RGB"===this.__state.space?this.__state[t]:(V.recalculateRGB(this,t,n),this.__state[t])},set:function(e){"RGB"!==this.__state.space&&(V.recalculateRGB(this,t,n),this.__state.space="RGB"),this.__state[t]=e}})}function n(e,t){Object.defineProperty(e,t,{get:function(){return"HSV"===this.__state.space?this.__state[t]:(V.recalculateHSV(this),this.__state[t])},set:function(e){"HSV"!==this.__state.space&&(V.recalculateHSV(this),this.__state.space="HSV"),this.__state[t]=e}})}function o(e){if("0"===e||k.isUndefined(e))return 0;var t=e.match(G);return k.isNull(t)?0:parseFloat(t[1])}function i(e){var t=e.toString();return t.indexOf(".")>-1?t.length-t.indexOf(".")-1:0}function r(e,t){var n=Math.pow(10,t);return Math.round(e*n)/n}function s(e,t,n,o,i){return o+(e-t)/(n-t)*(i-o)}function a(e,t,n,o){e.style.background="",k.each($,function(i){e.style.cssText+="background: "+i+"linear-gradient("+t+", "+n+" 0%, "+o+" 100%); "})}function l(e){e.style.background="",e.style.cssText+="background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);",e.style.cssText+="background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",e.style.cssText+="background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",e.style.cssText+="background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);",e.style.cssText+="background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);"}function d(e,t,n){var o=document.createElement("li");return t&&o.appendChild(t),n?e.__ul.insertBefore(o,n):e.__ul.appendChild(o),e.onResize(),o}function c(e){U.unbind(window,"resize",e.__resizeHandler),e.saveToLocalStorageIfPossible&&U.unbind(window,"unload",e.saveToLocalStorageIfPossible)}function u(e,t){var n=e.__preset_select[e.__preset_select.selectedIndex];n.innerHTML=t?n.value+"*":n.value}function _(e,t,n){if(n.__li=t,n.__gui=e,k.extend(n,{options:function(t){if(arguments.length>1){var o=n.__li.nextElementSibling;return n.remove(),p(e,n.object,n.property,{before:o,factoryArgs:[k.toArray(arguments)]})}if(k.isArray(t)||k.isObject(t)){var i=n.__li.nextElementSibling;return n.remove(),p(e,n.object,n.property,{before:i,factoryArgs:[t]})}},name:function(e){return n.__li.firstElementChild.firstElementChild.innerHTML=e,n},listen:function(){return n.__gui.listen(n),n},remove:function(){return n.__gui.remove(n),n}}),n instanceof Q){var o=new W(n.object,n.property,{min:n.__min,max:n.__max,step:n.__step});k.each(["updateDisplay","onChange","onFinishChange","step"],function(e){var t=n[e],i=o[e];n[e]=o[e]=function(){var e=Array.prototype.slice.call(arguments);return i.apply(o,e),t.apply(n,e)}}),U.addClass(t,"has-slider"),n.domElement.insertBefore(o.domElement,n.domElement.firstElementChild)}else if(n instanceof W){var i=function(t){if(k.isNumber(n.__min)&&k.isNumber(n.__max)){var o=n.__li.firstElementChild.firstElementChild.innerHTML,i=n.__gui.__listening.indexOf(n)>-1;n.remove();var r=p(e,n.object,n.property,{before:n.__li.nextElementSibling,factoryArgs:[n.__min,n.__max,n.__step]});return r.name(o),i&&r.listen(),r}return t};n.min=k.compose(i,n.min),n.max=k.compose(i,n.max)}else n instanceof X?(U.bind(t,"click",function(){U.fakeEvent(n.__checkbox,"click")}),U.bind(n.__checkbox,"click",function(e){e.stopPropagation()})):n instanceof q?(U.bind(t,"click",function(){U.fakeEvent(n.__button,"click")}),U.bind(t,"mouseover",function(){U.addClass(n.__button,"hover")}),U.bind(t,"mouseout",function(){U.removeClass(n.__button,"hover")})):n instanceof Z&&(U.addClass(t,"color"),n.updateDisplay=k.compose(function(e){return t.style.borderLeftColor=n.__color.toString(),e},n.updateDisplay),n.updateDisplay());n.setValue=k.compose(function(t){return e.getRoot().__preset_select&&n.isModified()&&u(e.getRoot(),!0),t},n.setValue)}function h(e,t){var n=e.getRoot(),o=n.__rememberedObjects.indexOf(t.object);if(-1!==o){var i=n.__rememberedObjectIndecesToControllers[o];if(void 0===i&&(i={},n.__rememberedObjectIndecesToControllers[o]=i),i[t.property]=t,n.load&&n.load.remembered){var r=n.load.remembered,s=void 0;if(r[e.preset])s=r[e.preset];else{if(!r[re])return;s=r[re]}if(s[o]&&void 0!==s[o][t.property]){var a=s[o][t.property];t.initialValue=a,t.setValue(a)}}}}function p(e,t,n,o){if(void 0===t[n])throw new Error('Object "'+t+'" has no property "'+n+'"');var i=void 0;if(o.color)i=new Z(t,n);else{var r=[t,n].concat(o.factoryArgs);i=te.apply(e,r)}o.before instanceof I&&(o.before=o.before.__li),h(e,i),U.addClass(i.domElement,"c");var s=document.createElement("span");U.addClass(s,"property-name"),s.innerHTML=i.property;var a=document.createElement("div");a.appendChild(s),a.appendChild(i.domElement);var l=d(e,a,o.before);return U.addClass(l,_e.CLASS_CONTROLLER_ROW),i instanceof Z?U.addClass(l,"color"):U.addClass(l,N(i.getValue())),_(e,l,i),e.__controllers.push(i),i}function f(e,t){return document.location.href+"."+t}function m(e,t,n){var o=document.createElement("option");o.innerHTML=t,o.value=t,e.__preset_select.appendChild(o),n&&(e.__preset_select.selectedIndex=e.__preset_select.length-1)}function g(e,t){t.style.display=e.useLocalStorage?"block":"none"}function b(e){var t=e.__save_row=document.createElement("li");U.addClass(e.domElement,"has-save"),e.__ul.insertBefore(t,e.__ul.firstChild),U.addClass(t,"save-row");var n=document.createElement("span");n.innerHTML="&nbsp;",U.addClass(n,"button gears");var o=document.createElement("span");o.innerHTML="Save",U.addClass(o,"button"),U.addClass(o,"save");var i=document.createElement("span");i.innerHTML="New",U.addClass(i,"button"),U.addClass(i,"save-as");var r=document.createElement("span");r.innerHTML="Revert",U.addClass(r,"button"),U.addClass(r,"revert");var s=e.__preset_select=document.createElement("select");if(e.load&&e.load.remembered?k.each(e.load.remembered,function(t,n){m(e,n,n===e.preset)}):m(e,re,!1),U.bind(s,"change",function(){for(var t=0;t<e.__preset_select.length;t++)e.__preset_select[t].innerHTML=e.__preset_select[t].value;e.preset=this.value}),t.appendChild(s),t.appendChild(n),t.appendChild(o),t.appendChild(i),t.appendChild(r),se){var a=document.getElementById("dg-local-explain"),l=document.getElementById("dg-local-storage");document.getElementById("dg-save-locally").style.display="block","true"===localStorage.getItem(f(e,"isLocal"))&&l.setAttribute("checked","checked"),g(e,a),U.bind(l,"change",function(){e.useLocalStorage=!e.useLocalStorage,g(e,a)})}var d=document.getElementById("dg-new-constructor");U.bind(d,"keydown",function(e){!e.metaKey||67!==e.which&&67!==e.keyCode||ae.hide()}),U.bind(n,"click",function(){d.innerHTML=JSON.stringify(e.getSaveObject(),void 0,2),ae.show(),d.focus(),d.select()}),U.bind(o,"click",function(){e.save()}),U.bind(i,"click",function(){var t=prompt("Enter a new preset name.");t&&e.saveAs(t)}),U.bind(r,"click",function(){e.revert()})}function v(e){function t(t){return t.preventDefault(),e.width+=i-t.clientX,e.onResize(),i=t.clientX,!1}function n(){U.removeClass(e.__closeButton,_e.CLASS_DRAG),U.unbind(window,"mousemove",t),U.unbind(window,"mouseup",n)}function o(o){return o.preventDefault(),i=o.clientX,U.addClass(e.__closeButton,_e.CLASS_DRAG),U.bind(window,"mousemove",t),U.bind(window,"mouseup",n),!1}var i=void 0;e.__resize_handle=document.createElement("div"),k.extend(e.__resize_handle.style,{width:"6px",marginLeft:"-3px",height:"200px",cursor:"ew-resize",position:"absolute"}),U.bind(e.__resize_handle,"mousedown",o),U.bind(e.__closeButton,"mousedown",o),e.domElement.insertBefore(e.__resize_handle,e.domElement.firstElementChild)}function y(e,t){e.domElement.style.width=t+"px",e.__save_row&&e.autoPlace&&(e.__save_row.style.width=t+"px"),e.__closeButton&&(e.__closeButton.style.width=t+"px")}function w(e,t){var n={};return k.each(e.__rememberedObjects,function(o,i){var r={},s=e.__rememberedObjectIndecesToControllers[i];k.each(s,function(e,n){r[n]=t?e.initialValue:e.getValue()}),n[i]=r}),n}function x(e){for(var t=0;t<e.__preset_select.length;t++)e.__preset_select[t].value===e.preset&&(e.__preset_select.selectedIndex=t)}function E(e){0!==e.length&&ne.call(window,function(){E(e)}),k.each(e,function(e){e.updateDisplay()})}var C=Array.prototype.forEach,A=Array.prototype.slice,k={BREAK:{},extend:function(e){return this.each(A.call(arguments,1),function(t){(this.isObject(t)?Object.keys(t):[]).forEach(function(n){this.isUndefined(t[n])||(e[n]=t[n])}.bind(this))},this),e},defaults:function(e){return this.each(A.call(arguments,1),function(t){(this.isObject(t)?Object.keys(t):[]).forEach(function(n){this.isUndefined(e[n])&&(e[n]=t[n])}.bind(this))},this),e},compose:function(){var e=A.call(arguments);return function(){for(var t=A.call(arguments),n=e.length-1;n>=0;n--)t=[e[n].apply(this,t)];return t[0]}},each:function(e,t,n){if(e)if(C&&e.forEach&&e.forEach===C)e.forEach(t,n);else if(e.length===e.length+0){var o=void 0,i=void 0;for(o=0,i=e.length;o<i;o++)if(o in e&&t.call(n,e[o],o)===this.BREAK)return}else for(var r in e)if(t.call(n,e[r],r)===this.BREAK)return},defer:function(e){setTimeout(e,0)},debounce:function(e,t,n){var o=void 0;return function(){var i=this,r=arguments,s=n||!o;clearTimeout(o),o=setTimeout(function(){o=null,n||e.apply(i,r)},t),s&&e.apply(i,r)}},toArray:function(e){return e.toArray?e.toArray():A.call(e)},isUndefined:function(e){return void 0===e},isNull:function(e){return null===e},isNaN:function(e){function t(t){return e.apply(this,arguments)}return t.toString=function(){return e.toString()},t}(function(e){return isNaN(e)}),isArray:Array.isArray||function(e){return e.constructor===Array},isObject:function(e){return e===Object(e)},isNumber:function(e){return e===e+0},isString:function(e){return e===e+""},isBoolean:function(e){return!1===e||!0===e},isFunction:function(e){return"[object Function]"===Object.prototype.toString.call(e)}},S=[{litmus:k.isString,conversions:{THREE_CHAR_HEX:{read:function(e){var t=e.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);return null!==t&&{space:"HEX",hex:parseInt("0x"+t[1].toString()+t[1].toString()+t[2].toString()+t[2].toString()+t[3].toString()+t[3].toString(),0)}},write:e},SIX_CHAR_HEX:{read:function(e){var t=e.match(/^#([A-F0-9]{6})$/i);return null!==t&&{space:"HEX",hex:parseInt("0x"+t[1].toString(),0)}},write:e},CSS_RGB:{read:function(e){var t=e.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);return null!==t&&{space:"RGB",r:parseFloat(t[1]),g:parseFloat(t[2]),b:parseFloat(t[3])}},write:e},CSS_RGBA:{read:function(e){var t=e.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);return null!==t&&{space:"RGB",r:parseFloat(t[1]),g:parseFloat(t[2]),b:parseFloat(t[3]),a:parseFloat(t[4])}},write:e}}},{litmus:k.isNumber,conversions:{HEX:{read:function(e){return{space:"HEX",hex:e,conversionName:"HEX"}},write:function(e){return e.hex}}}},{litmus:k.isArray,conversions:{RGB_ARRAY:{read:function(e){return 3===e.length&&{space:"RGB",r:e[0],g:e[1],b:e[2]}},write:function(e){return[e.r,e.g,e.b]}},RGBA_ARRAY:{read:function(e){return 4===e.length&&{space:"RGB",r:e[0],g:e[1],b:e[2],a:e[3]}},write:function(e){return[e.r,e.g,e.b,e.a]}}}},{litmus:k.isObject,conversions:{RGBA_OBJ:{read:function(e){return!!(k.isNumber(e.r)&&k.isNumber(e.g)&&k.isNumber(e.b)&&k.isNumber(e.a))&&{space:"RGB",r:e.r,g:e.g,b:e.b,a:e.a}},write:function(e){return{r:e.r,g:e.g,b:e.b,a:e.a}}},RGB_OBJ:{read:function(e){return!!(k.isNumber(e.r)&&k.isNumber(e.g)&&k.isNumber(e.b))&&{space:"RGB",r:e.r,g:e.g,b:e.b}},write:function(e){return{r:e.r,g:e.g,b:e.b}}},HSVA_OBJ:{read:function(e){return!!(k.isNumber(e.h)&&k.isNumber(e.s)&&k.isNumber(e.v)&&k.isNumber(e.a))&&{space:"HSV",h:e.h,s:e.s,v:e.v,a:e.a}},write:function(e){return{h:e.h,s:e.s,v:e.v,a:e.a}}},HSV_OBJ:{read:function(e){return!!(k.isNumber(e.h)&&k.isNumber(e.s)&&k.isNumber(e.v))&&{space:"HSV",h:e.h,s:e.s,v:e.v}},write:function(e){return{h:e.h,s:e.s,v:e.v}}}}}],O=void 0,T=void 0,R=function(){T=!1;var e=arguments.length>1?k.toArray(arguments):arguments[0];return k.each(S,function(t){if(t.litmus(e))return k.each(t.conversions,function(t,n){if(O=t.read(e),!1===T&&!1!==O)return T=O,O.conversionName=n,O.conversion=t,k.BREAK}),k.BREAK}),T},L=void 0,B={hsv_to_rgb:function(e,t,n){var o=Math.floor(e/60)%6,i=e/60-Math.floor(e/60),r=n*(1-t),s=n*(1-i*t),a=n*(1-(1-i)*t),l=[[n,a,r],[s,n,r],[r,n,a],[r,s,n],[a,r,n],[n,r,s]][o];return{r:255*l[0],g:255*l[1],b:255*l[2]}},rgb_to_hsv:function(e,t,n){var o=Math.min(e,t,n),i=Math.max(e,t,n),r=i-o,s=void 0,a=void 0;return 0===i?{h:NaN,s:0,v:0}:(a=r/i,s=e===i?(t-n)/r:t===i?2+(n-e)/r:4+(e-t)/r,(s/=6)<0&&(s+=1),{h:360*s,s:a,v:i/255})},rgb_to_hex:function(e,t,n){var o=this.hex_with_component(0,2,e);return o=this.hex_with_component(o,1,t),o=this.hex_with_component(o,0,n)},component_from_hex:function(e,t){return e>>8*t&255},hex_with_component:function(e,t,n){return n<<(L=8*t)|e&~(255<<L)}},N="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},H=function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")},F=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}(),P=function e(t,n,o){null===t&&(t=Function.prototype);var i=Object.getOwnPropertyDescriptor(t,n);if(void 0===i){var r=Object.getPrototypeOf(t);return null===r?void 0:e(r,n,o)}if("value"in i)return i.value;var s=i.get;if(void 0!==s)return s.call(o)},j=function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)},D=function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t},V=function(){function t(){if(H(this,t),this.__state=R.apply(this,arguments),!1===this.__state)throw new Error("Failed to interpret color arguments");this.__state.a=this.__state.a||1}return F(t,[{key:"toString",value:function(){return e(this)}},{key:"toHexString",value:function(){return e(this,!0)}},{key:"toOriginal",value:function(){return this.__state.conversion.write(this)}}]),t}();V.recalculateRGB=function(e,t,n){if("HEX"===e.__state.space)e.__state[t]=B.component_from_hex(e.__state.hex,n);else{if("HSV"!==e.__state.space)throw new Error("Corrupted color state");k.extend(e.__state,B.hsv_to_rgb(e.__state.h,e.__state.s,e.__state.v))}},V.recalculateHSV=function(e){var t=B.rgb_to_hsv(e.r,e.g,e.b);k.extend(e.__state,{s:t.s,v:t.v}),k.isNaN(t.h)?k.isUndefined(e.__state.h)&&(e.__state.h=0):e.__state.h=t.h},V.COMPONENTS=["r","g","b","h","s","v","hex","a"],t(V.prototype,"r",2),t(V.prototype,"g",1),t(V.prototype,"b",0),n(V.prototype,"h"),n(V.prototype,"s"),n(V.prototype,"v"),Object.defineProperty(V.prototype,"a",{get:function(){return this.__state.a},set:function(e){this.__state.a=e}}),Object.defineProperty(V.prototype,"hex",{get:function(){return"HEX"!==!this.__state.space&&(this.__state.hex=B.rgb_to_hex(this.r,this.g,this.b)),this.__state.hex},set:function(e){this.__state.space="HEX",this.__state.hex=e}});var I=function(){function e(t,n){H(this,e),this.initialValue=t[n],this.domElement=document.createElement("div"),this.object=t,this.property=n,this.__onChange=void 0,this.__onFinishChange=void 0}return F(e,[{key:"onChange",value:function(e){return this.__onChange=e,this}},{key:"onFinishChange",value:function(e){return this.__onFinishChange=e,this}},{key:"setValue",value:function(e){return this.object[this.property]=e,this.__onChange&&this.__onChange.call(this,e),this.updateDisplay(),this}},{key:"getValue",value:function(){return this.object[this.property]}},{key:"updateDisplay",value:function(){return this}},{key:"isModified",value:function(){return this.initialValue!==this.getValue()}}]),e}(),z={HTMLEvents:["change"],MouseEvents:["click","mousemove","mousedown","mouseup","mouseover"],KeyboardEvents:["keydown"]},M={};k.each(z,function(e,t){k.each(e,function(e){M[e]=t})});var G=/(\d+(\.\d+)?)px/,U={makeSelectable:function(e,t){void 0!==e&&void 0!==e.style&&(e.onselectstart=t?function(){return!1}:function(){},e.style.MozUserSelect=t?"auto":"none",e.style.KhtmlUserSelect=t?"auto":"none",e.unselectable=t?"on":"off")},makeFullscreen:function(e,t,n){var o=n,i=t;k.isUndefined(i)&&(i=!0),k.isUndefined(o)&&(o=!0),e.style.position="absolute",i&&(e.style.left=0,e.style.right=0),o&&(e.style.top=0,e.style.bottom=0)},fakeEvent:function(e,t,n,o){var i=n||{},r=M[t];if(!r)throw new Error("Event type "+t+" not supported.");var s=document.createEvent(r);switch(r){case"MouseEvents":var a=i.x||i.clientX||0,l=i.y||i.clientY||0;s.initMouseEvent(t,i.bubbles||!1,i.cancelable||!0,window,i.clickCount||1,0,0,a,l,!1,!1,!1,!1,0,null);break;case"KeyboardEvents":var d=s.initKeyboardEvent||s.initKeyEvent;k.defaults(i,{cancelable:!0,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1,keyCode:void 0,charCode:void 0}),d(t,i.bubbles||!1,i.cancelable,window,i.ctrlKey,i.altKey,i.shiftKey,i.metaKey,i.keyCode,i.charCode);break;default:s.initEvent(t,i.bubbles||!1,i.cancelable||!0)}k.defaults(s,o),e.dispatchEvent(s)},bind:function(e,t,n,o){var i=o||!1;return e.addEventListener?e.addEventListener(t,n,i):e.attachEvent&&e.attachEvent("on"+t,n),U},unbind:function(e,t,n,o){var i=o||!1;return e.removeEventListener?e.removeEventListener(t,n,i):e.detachEvent&&e.detachEvent("on"+t,n),U},addClass:function(e,t){if(void 0===e.className)e.className=t;else if(e.className!==t){var n=e.className.split(/ +/);-1===n.indexOf(t)&&(n.push(t),e.className=n.join(" ").replace(/^\s+/,"").replace(/\s+$/,""))}return U},removeClass:function(e,t){if(t)if(e.className===t)e.removeAttribute("class");else{var n=e.className.split(/ +/),o=n.indexOf(t);-1!==o&&(n.splice(o,1),e.className=n.join(" "))}else e.className=void 0;return U},hasClass:function(e,t){return new RegExp("(?:^|\\s+)"+t+"(?:\\s+|$)").test(e.className)||!1},getWidth:function(e){var t=getComputedStyle(e);return o(t["border-left-width"])+o(t["border-right-width"])+o(t["padding-left"])+o(t["padding-right"])+o(t.width)},getHeight:function(e){var t=getComputedStyle(e);return o(t["border-top-width"])+o(t["border-bottom-width"])+o(t["padding-top"])+o(t["padding-bottom"])+o(t.height)},getOffset:function(e){var t=e,n={left:0,top:0};if(t.offsetParent)do{n.left+=t.offsetLeft,n.top+=t.offsetTop,t=t.offsetParent}while(t);return n},isActive:function(e){return e===document.activeElement&&(e.type||e.href)}},X=function(e){function t(e,n){H(this,t);var o=D(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n)),i=o;return o.__prev=o.getValue(),o.__checkbox=document.createElement("input"),o.__checkbox.setAttribute("type","checkbox"),U.bind(o.__checkbox,"change",function(){i.setValue(!i.__prev)},!1),o.domElement.appendChild(o.__checkbox),o.updateDisplay(),o}return j(t,I),F(t,[{key:"setValue",value:function(e){var n=P(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"setValue",this).call(this,e);return this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue()),this.__prev=this.getValue(),n}},{key:"updateDisplay",value:function(){return!0===this.getValue()?(this.__checkbox.setAttribute("checked","checked"),this.__checkbox.checked=!0,this.__prev=!0):(this.__checkbox.checked=!1,this.__prev=!1),P(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this)}}]),t}(),K=function(e){function t(e,n,o){H(this,t);var i=D(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n)),r=o,s=i;if(i.__select=document.createElement("select"),k.isArray(r)){var a={};k.each(r,function(e){a[e]=e}),r=a}return k.each(r,function(e,t){var n=document.createElement("option");n.innerHTML=t,n.setAttribute("value",e),s.__select.appendChild(n)}),i.updateDisplay(),U.bind(i.__select,"change",function(){var e=this.options[this.selectedIndex].value;s.setValue(e)}),i.domElement.appendChild(i.__select),i}return j(t,I),F(t,[{key:"setValue",value:function(e){var n=P(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"setValue",this).call(this,e);return this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue()),n}},{key:"updateDisplay",value:function(){return U.isActive(this.__select)?this:(this.__select.value=this.getValue(),P(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this))}}]),t}(),Y=function(e){function t(e,n){function o(){r.setValue(r.__input.value)}H(this,t);var i=D(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n)),r=i;return i.__input=document.createElement("input"),i.__input.setAttribute("type","text"),U.bind(i.__input,"keyup",o),U.bind(i.__input,"change",o),U.bind(i.__input,"blur",function(){r.__onFinishChange&&r.__onFinishChange.call(r,r.getValue())}),U.bind(i.__input,"keydown",function(e){13===e.keyCode&&this.blur()}),i.updateDisplay(),i.domElement.appendChild(i.__input),i}return j(t,I),F(t,[{key:"updateDisplay",value:function(){return U.isActive(this.__input)||(this.__input.value=this.getValue()),P(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this)}}]),t}(),J=function(e){function t(e,n,o){H(this,t);var r=D(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n)),s=o||{};return r.__min=s.min,r.__max=s.max,r.__step=s.step,k.isUndefined(r.__step)?0===r.initialValue?r.__impliedStep=1:r.__impliedStep=Math.pow(10,Math.floor(Math.log(Math.abs(r.initialValue))/Math.LN10))/10:r.__impliedStep=r.__step,r.__precision=i(r.__impliedStep),r}return j(t,I),F(t,[{key:"setValue",value:function(e){var n=e;return void 0!==this.__min&&n<this.__min?n=this.__min:void 0!==this.__max&&n>this.__max&&(n=this.__max),void 0!==this.__step&&n%this.__step!=0&&(n=Math.round(n/this.__step)*this.__step),P(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"setValue",this).call(this,n)}},{key:"min",value:function(e){return this.__min=e,this}},{key:"max",value:function(e){return this.__max=e,this}},{key:"step",value:function(e){return this.__step=e,this.__impliedStep=e,this.__precision=i(e),this}}]),t}(),W=function(e){function t(e,n,o){function i(){l.__onFinishChange&&l.__onFinishChange.call(l,l.getValue())}function r(e){var t=d-e.clientY;l.setValue(l.getValue()+t*l.__impliedStep),d=e.clientY}function s(){U.unbind(window,"mousemove",r),U.unbind(window,"mouseup",s),i()}H(this,t);var a=D(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n,o));a.__truncationSuspended=!1;var l=a,d=void 0;return a.__input=document.createElement("input"),a.__input.setAttribute("type","text"),U.bind(a.__input,"change",function(){var e=parseFloat(l.__input.value);k.isNaN(e)||l.setValue(e)}),U.bind(a.__input,"blur",function(){i()}),U.bind(a.__input,"mousedown",function(e){U.bind(window,"mousemove",r),U.bind(window,"mouseup",s),d=e.clientY}),U.bind(a.__input,"keydown",function(e){13===e.keyCode&&(l.__truncationSuspended=!0,this.blur(),l.__truncationSuspended=!1,i())}),a.updateDisplay(),a.domElement.appendChild(a.__input),a}return j(t,J),F(t,[{key:"updateDisplay",value:function(){return this.__input.value=this.__truncationSuspended?this.getValue():r(this.getValue(),this.__precision),P(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this)}}]),t}(),Q=function(e){function t(e,n,o,i,r){function a(e){e.preventDefault();var t=_.__background.getBoundingClientRect();return _.setValue(s(e.clientX,t.left,t.right,_.__min,_.__max)),!1}function l(){U.unbind(window,"mousemove",a),U.unbind(window,"mouseup",l),_.__onFinishChange&&_.__onFinishChange.call(_,_.getValue())}function d(e){var t=e.touches[0].clientX,n=_.__background.getBoundingClientRect();_.setValue(s(t,n.left,n.right,_.__min,_.__max))}function c(){U.unbind(window,"touchmove",d),U.unbind(window,"touchend",c),_.__onFinishChange&&_.__onFinishChange.call(_,_.getValue())}H(this,t);var u=D(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n,{min:o,max:i,step:r})),_=u;return u.__background=document.createElement("div"),u.__foreground=document.createElement("div"),U.bind(u.__background,"mousedown",function(e){document.activeElement.blur(),U.bind(window,"mousemove",a),U.bind(window,"mouseup",l),a(e)}),U.bind(u.__background,"touchstart",function(e){1===e.touches.length&&(U.bind(window,"touchmove",d),U.bind(window,"touchend",c),d(e))}),U.addClass(u.__background,"slider"),U.addClass(u.__foreground,"slider-fg"),u.updateDisplay(),u.__background.appendChild(u.__foreground),u.domElement.appendChild(u.__background),u}return j(t,J),F(t,[{key:"updateDisplay",value:function(){var e=(this.getValue()-this.__min)/(this.__max-this.__min);return this.__foreground.style.width=100*e+"%",P(t.prototype.__proto__||Object.getPrototypeOf(t.prototype),"updateDisplay",this).call(this)}}]),t}(),q=function(e){function t(e,n,o){H(this,t);var i=D(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n)),r=i;return i.__button=document.createElement("div"),i.__button.innerHTML=void 0===o?"Fire":o,U.bind(i.__button,"click",function(e){return e.preventDefault(),r.fire(),!1}),U.addClass(i.__button,"button"),i.domElement.appendChild(i.__button),i}return j(t,I),F(t,[{key:"fire",value:function(){this.__onChange&&this.__onChange.call(this),this.getValue().call(this.object),this.__onFinishChange&&this.__onFinishChange.call(this,this.getValue())}}]),t}(),Z=function(e){function t(e,n){function o(e){u(e),U.bind(window,"mousemove",u),U.bind(window,"touchmove",u),U.bind(window,"mouseup",r),U.bind(window,"touchend",r)}function i(e){_(e),U.bind(window,"mousemove",_),U.bind(window,"touchmove",_),U.bind(window,"mouseup",s),U.bind(window,"touchend",s)}function r(){U.unbind(window,"mousemove",u),U.unbind(window,"touchmove",u),U.unbind(window,"mouseup",r),U.unbind(window,"touchend",r),c()}function s(){U.unbind(window,"mousemove",_),U.unbind(window,"touchmove",_),U.unbind(window,"mouseup",s),U.unbind(window,"touchend",s),c()}function d(){var e=R(this.value);!1!==e?(p.__color.__state=e,p.setValue(p.__color.toOriginal())):this.value=p.__color.toString()}function c(){p.__onFinishChange&&p.__onFinishChange.call(p,p.__color.toOriginal())}function u(e){-1===e.type.indexOf("touch")&&e.preventDefault();var t=p.__saturation_field.getBoundingClientRect(),n=e.touches&&e.touches[0]||e,o=n.clientX,i=n.clientY,r=(o-t.left)/(t.right-t.left),s=1-(i-t.top)/(t.bottom-t.top);return s>1?s=1:s<0&&(s=0),r>1?r=1:r<0&&(r=0),p.__color.v=s,p.__color.s=r,p.setValue(p.__color.toOriginal()),!1}function _(e){-1===e.type.indexOf("touch")&&e.preventDefault();var t=p.__hue_field.getBoundingClientRect(),n=1-((e.touches&&e.touches[0]||e).clientY-t.top)/(t.bottom-t.top);return n>1?n=1:n<0&&(n=0),p.__color.h=360*n,p.setValue(p.__color.toOriginal()),!1}H(this,t);var h=D(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,n));h.__color=new V(h.getValue()),h.__temp=new V(0);var p=h;h.domElement=document.createElement("div"),U.makeSelectable(h.domElement,!1),h.__selector=document.createElement("div"),h.__selector.className="selector",h.__saturation_field=document.createElement("div"),h.__saturation_field.className="saturation-field",h.__field_knob=document.createElement("div"),h.__field_knob.className="field-knob",h.__field_knob_border="2px solid ",h.__hue_knob=document.createElement("div"),h.__hue_knob.className="hue-knob",h.__hue_field=document.createElement("div"),h.__hue_field.className="hue-field",h.__input=document.createElement("input"),h.__input.type="text",h.__input_textShadow="0 1px 1px ",U.bind(h.__input,"keydown",function(e){13===e.keyCode&&d.call(this)}),U.bind(h.__input,"blur",d),U.bind(h.__selector,"mousedown",function(){U.addClass(this,"drag").bind(window,"mouseup",function(){U.removeClass(p.__selector,"drag")})}),U.bind(h.__selector,"touchstart",function(){U.addClass(this,"drag").bind(window,"touchend",function(){U.removeClass(p.__selector,"drag")})});var f=document.createElement("div");return k.extend(h.__selector.style,{width:"122px",height:"102px",padding:"3px",backgroundColor:"#222",boxShadow:"0px 1px 3px rgba(0,0,0,0.3)"}),k.extend(h.__field_knob.style,{position:"absolute",width:"12px",height:"12px",border:h.__field_knob_border+(h.__color.v<.5?"#fff":"#000"),boxShadow:"0px 1px 3px rgba(0,0,0,0.5)",borderRadius:"12px",zIndex:1}),k.extend(h.__hue_knob.style,{position:"absolute",width:"15px",height:"2px",borderRight:"4px solid #fff",zIndex:1}),k.extend(h.__saturation_field.style,{width:"100px",height:"100px",border:"1px solid #555",marginRight:"3px",display:"inline-block",cursor:"pointer"}),k.extend(f.style,{width:"100%",height:"100%",background:"none"}),a(f,"top","rgba(0,0,0,0)","#000"),k.extend(h.__hue_field.style,{width:"15px",height:"100px",border:"1px solid #555",cursor:"ns-resize",position:"absolute",top:"3px",right:"3px"}),l(h.__hue_field),k.extend(h.__input.style,{outline:"none",textAlign:"center",color:"#fff",border:0,fontWeight:"bold",textShadow:h.__input_textShadow+"rgba(0,0,0,0.7)"}),U.bind(h.__saturation_field,"mousedown",o),U.bind(h.__saturation_field,"touchstart",o),U.bind(h.__field_knob,"mousedown",o),U.bind(h.__field_knob,"touchstart",o),U.bind(h.__hue_field,"mousedown",i),U.bind(h.__hue_field,"touchstart",i),h.__saturation_field.appendChild(f),h.__selector.appendChild(h.__field_knob),h.__selector.appendChild(h.__saturation_field),h.__selector.appendChild(h.__hue_field),h.__hue_field.appendChild(h.__hue_knob),h.domElement.appendChild(h.__input),h.domElement.appendChild(h.__selector),h.updateDisplay(),h}return j(t,I),F(t,[{key:"updateDisplay",value:function(){var e=R(this.getValue());if(!1!==e){var t=!1;k.each(V.COMPONENTS,function(n){if(!k.isUndefined(e[n])&&!k.isUndefined(this.__color.__state[n])&&e[n]!==this.__color.__state[n])return t=!0,{}},this),t&&k.extend(this.__color.__state,e)}k.extend(this.__temp.__state,this.__color.__state),this.__temp.a=1;var n=this.__color.v<.5||this.__color.s>.5?255:0,o=255-n;k.extend(this.__field_knob.style,{marginLeft:100*this.__color.s-7+"px",marginTop:100*(1-this.__color.v)-7+"px",backgroundColor:this.__temp.toHexString(),border:this.__field_knob_border+"rgb("+n+","+n+","+n+")"}),this.__hue_knob.style.marginTop=100*(1-this.__color.h/360)+"px",this.__temp.s=1,this.__temp.v=1,a(this.__saturation_field,"left","#fff",this.__temp.toHexString()),this.__input.value=this.__color.toString(),k.extend(this.__input.style,{backgroundColor:this.__color.toHexString(),color:"rgb("+n+","+n+","+n+")",textShadow:this.__input_textShadow+"rgba("+o+","+o+","+o+",.7)"})}}]),t}(),$=["-moz-","-o-","-webkit-","-ms-",""],ee={load:function(e,t){var n=t||document,o=n.createElement("link");o.type="text/css",o.rel="stylesheet",o.href=e,n.getElementsByTagName("head")[0].appendChild(o)},inject:function(e,t){var n=t||document,o=document.createElement("style");o.type="text/css",o.innerHTML=e;var i=n.getElementsByTagName("head")[0];try{i.appendChild(o)}catch(e){}}},te=function(e,t){var n=e[t];return k.isArray(arguments[2])||k.isObject(arguments[2])?new K(e,t,arguments[2]):k.isNumber(n)?k.isNumber(arguments[2])&&k.isNumber(arguments[3])?k.isNumber(arguments[4])?new Q(e,t,arguments[2],arguments[3],arguments[4]):new Q(e,t,arguments[2],arguments[3]):k.isNumber(arguments[4])?new W(e,t,{min:arguments[2],max:arguments[3],step:arguments[4]}):new W(e,t,{min:arguments[2],max:arguments[3]}):k.isString(n)?new Y(e,t):k.isFunction(n)?new q(e,t,""):k.isBoolean(n)?new X(e,t):null},ne=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(e){setTimeout(e,1e3/60)},oe=function(){function e(){H(this,e),this.backgroundElement=document.createElement("div"),k.extend(this.backgroundElement.style,{backgroundColor:"rgba(0,0,0,0.8)",top:0,left:0,display:"none",zIndex:"1000",opacity:0,WebkitTransition:"opacity 0.2s linear",transition:"opacity 0.2s linear"}),U.makeFullscreen(this.backgroundElement),this.backgroundElement.style.position="fixed",this.domElement=document.createElement("div"),k.extend(this.domElement.style,{position:"fixed",display:"none",zIndex:"1001",opacity:0,WebkitTransition:"-webkit-transform 0.2s ease-out, opacity 0.2s linear",transition:"transform 0.2s ease-out, opacity 0.2s linear"}),document.body.appendChild(this.backgroundElement),document.body.appendChild(this.domElement);var t=this;U.bind(this.backgroundElement,"click",function(){t.hide()})}return F(e,[{key:"show",value:function(){var e=this;this.backgroundElement.style.display="block",this.domElement.style.display="block",this.domElement.style.opacity=0,this.domElement.style.webkitTransform="scale(1.1)",this.layout(),k.defer(function(){e.backgroundElement.style.opacity=1,e.domElement.style.opacity=1,e.domElement.style.webkitTransform="scale(1)"})}},{key:"hide",value:function(){var e=this,t=function t(){e.domElement.style.display="none",e.backgroundElement.style.display="none",U.unbind(e.domElement,"webkitTransitionEnd",t),U.unbind(e.domElement,"transitionend",t),U.unbind(e.domElement,"oTransitionEnd",t)};U.bind(this.domElement,"webkitTransitionEnd",t),U.bind(this.domElement,"transitionend",t),U.bind(this.domElement,"oTransitionEnd",t),this.backgroundElement.style.opacity=0,this.domElement.style.opacity=0,this.domElement.style.webkitTransform="scale(1.1)"}},{key:"layout",value:function(){this.domElement.style.left=window.innerWidth/2-U.getWidth(this.domElement)/2+"px",this.domElement.style.top=window.innerHeight/2-U.getHeight(this.domElement)/2+"px"}}]),e}(),ie=function(e){if(e&&"undefined"!=typeof window){var t=document.createElement("style");return t.setAttribute("type","text/css"),t.innerHTML=e,document.head.appendChild(t),e}}(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid transparent}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n");ee.inject(ie);var re="Default",se=function(){try{return"localStorage"in window&&null!==window.localStorage}catch(e){return!1}}(),ae=void 0,le=!0,de=void 0,ce=!1,ue=[],_e=function e(t){var n=this,o=t||{};this.domElement=document.createElement("div"),this.__ul=document.createElement("ul"),this.domElement.appendChild(this.__ul),U.addClass(this.domElement,"dg"),this.__folders={},this.__controllers=[],this.__rememberedObjects=[],this.__rememberedObjectIndecesToControllers=[],this.__listening=[],o=k.defaults(o,{closeOnTop:!1,autoPlace:!0,width:e.DEFAULT_WIDTH}),o=k.defaults(o,{resizable:o.autoPlace,hideable:o.autoPlace}),k.isUndefined(o.load)?o.load={preset:re}:o.preset&&(o.load.preset=o.preset),k.isUndefined(o.parent)&&o.hideable&&ue.push(this),o.resizable=k.isUndefined(o.parent)&&o.resizable,o.autoPlace&&k.isUndefined(o.scrollable)&&(o.scrollable=!0);var i=se&&"true"===localStorage.getItem(f(this,"isLocal")),r=void 0;if(Object.defineProperties(this,{parent:{get:function(){return o.parent}},scrollable:{get:function(){return o.scrollable}},autoPlace:{get:function(){return o.autoPlace}},closeOnTop:{get:function(){return o.closeOnTop}},preset:{get:function(){return n.parent?n.getRoot().preset:o.load.preset},set:function(e){n.parent?n.getRoot().preset=e:o.load.preset=e,x(this),n.revert()}},width:{get:function(){return o.width},set:function(e){o.width=e,y(n,e)}},name:{get:function(){return o.name},set:function(e){o.name=e,titleRowName&&(titleRowName.innerHTML=o.name)}},closed:{get:function(){return o.closed},set:function(t){o.closed=t,o.closed?U.addClass(n.__ul,e.CLASS_CLOSED):U.removeClass(n.__ul,e.CLASS_CLOSED),this.onResize(),n.__closeButton&&(n.__closeButton.innerHTML=t?e.TEXT_OPEN:e.TEXT_CLOSED)}},load:{get:function(){return o.load}},useLocalStorage:{get:function(){return i},set:function(e){se&&(i=e,e?U.bind(window,"unload",r):U.unbind(window,"unload",r),localStorage.setItem(f(n,"isLocal"),e))}}}),k.isUndefined(o.parent)){if(o.closed=!1,U.addClass(this.domElement,e.CLASS_MAIN),U.makeSelectable(this.domElement,!1),se&&i){n.useLocalStorage=!0;var s=localStorage.getItem(f(this,"gui"));s&&(o.load=JSON.parse(s))}this.__closeButton=document.createElement("div"),this.__closeButton.innerHTML=e.TEXT_CLOSED,U.addClass(this.__closeButton,e.CLASS_CLOSE_BUTTON),o.closeOnTop?(U.addClass(this.__closeButton,e.CLASS_CLOSE_TOP),this.domElement.insertBefore(this.__closeButton,this.domElement.childNodes[0])):(U.addClass(this.__closeButton,e.CLASS_CLOSE_BOTTOM),this.domElement.appendChild(this.__closeButton)),U.bind(this.__closeButton,"click",function(){n.closed=!n.closed})}else{void 0===o.closed&&(o.closed=!0);var a=document.createTextNode(o.name);U.addClass(a,"controller-name");var l=d(n,a);U.addClass(this.__ul,e.CLASS_CLOSED),U.addClass(l,"title"),U.bind(l,"click",function(e){return e.preventDefault(),n.closed=!n.closed,!1}),o.closed||(this.closed=!1)}o.autoPlace&&(k.isUndefined(o.parent)&&(le&&(de=document.createElement("div"),U.addClass(de,"dg"),U.addClass(de,e.CLASS_AUTO_PLACE_CONTAINER),document.body.appendChild(de),le=!1),de.appendChild(this.domElement),U.addClass(this.domElement,e.CLASS_AUTO_PLACE)),this.parent||y(n,o.width)),this.__resizeHandler=function(){n.onResizeDebounced()},U.bind(window,"resize",this.__resizeHandler),U.bind(this.__ul,"webkitTransitionEnd",this.__resizeHandler),U.bind(this.__ul,"transitionend",this.__resizeHandler),U.bind(this.__ul,"oTransitionEnd",this.__resizeHandler),this.onResize(),o.resizable&&v(this),r=function(){se&&"true"===localStorage.getItem(f(n,"isLocal"))&&localStorage.setItem(f(n,"gui"),JSON.stringify(n.getSaveObject()))},this.saveToLocalStorageIfPossible=r,o.parent||function(){var e=n.getRoot();e.width+=1,k.defer(function(){e.width-=1})}()};return _e.toggleHide=function(){ce=!ce,k.each(ue,function(e){e.domElement.style.display=ce?"none":""})},_e.CLASS_AUTO_PLACE="a",_e.CLASS_AUTO_PLACE_CONTAINER="ac",_e.CLASS_MAIN="main",_e.CLASS_CONTROLLER_ROW="cr",_e.CLASS_TOO_TALL="taller-than-window",_e.CLASS_CLOSED="closed",_e.CLASS_CLOSE_BUTTON="close-button",_e.CLASS_CLOSE_TOP="close-top",_e.CLASS_CLOSE_BOTTOM="close-bottom",_e.CLASS_DRAG="drag",_e.DEFAULT_WIDTH=245,_e.TEXT_CLOSED="Close Controls",_e.TEXT_OPEN="Open Controls",_e._keydownHandler=function(e){"text"===document.activeElement.type||72!==e.which&&72!==e.keyCode||_e.toggleHide()},U.bind(window,"keydown",_e._keydownHandler,!1),k.extend(_e.prototype,{add:function(e,t){return p(this,e,t,{factoryArgs:Array.prototype.slice.call(arguments,2)})},addColor:function(e,t){return p(this,e,t,{color:!0})},remove:function(e){this.__ul.removeChild(e.__li),this.__controllers.splice(this.__controllers.indexOf(e),1);var t=this;k.defer(function(){t.onResize()})},destroy:function(){if(this.parent)throw new Error("Only the root GUI should be removed with .destroy(). For subfolders, use gui.removeFolder(folder) instead.");this.autoPlace&&de.removeChild(this.domElement);var e=this;k.each(this.__folders,function(t){e.removeFolder(t)}),U.unbind(window,"keydown",_e._keydownHandler,!1),c(this)},addFolder:function(e){if(void 0!==this.__folders[e])throw new Error('You already have a folder in this GUI by the name "'+e+'"');var t={name:e,parent:this};t.autoPlace=this.autoPlace,this.load&&this.load.folders&&this.load.folders[e]&&(t.closed=this.load.folders[e].closed,t.load=this.load.folders[e]);var n=new _e(t);this.__folders[e]=n;var o=d(this,n.domElement);return U.addClass(o,"folder"),n},removeFolder:function(e){this.__ul.removeChild(e.domElement.parentElement),delete this.__folders[e.name],this.load&&this.load.folders&&this.load.folders[e.name]&&delete this.load.folders[e.name],c(e);var t=this;k.each(e.__folders,function(t){e.removeFolder(t)}),k.defer(function(){t.onResize()})},open:function(){this.closed=!1},close:function(){this.closed=!0},onResize:function(){var e=this.getRoot();if(e.scrollable){var t=U.getOffset(e.__ul).top,n=0;k.each(e.__ul.childNodes,function(t){e.autoPlace&&t===e.__save_row||(n+=U.getHeight(t))}),window.innerHeight-t-20<n?(U.addClass(e.domElement,_e.CLASS_TOO_TALL),e.__ul.style.height=window.innerHeight-t-20+"px"):(U.removeClass(e.domElement,_e.CLASS_TOO_TALL),e.__ul.style.height="auto")}e.__resize_handle&&k.defer(function(){e.__resize_handle.style.height=e.__ul.offsetHeight+"px"}),e.__closeButton&&(e.__closeButton.style.width=e.width+"px")},onResizeDebounced:k.debounce(function(){this.onResize()},50),remember:function(){if(k.isUndefined(ae)&&((ae=new oe).domElement.innerHTML='<div id="dg-save" class="dg dialogue">\n\n  Here\'s the new load parameter for your <code>GUI</code>\'s constructor:\n\n  <textarea id="dg-new-constructor"></textarea>\n\n  <div id="dg-save-locally">\n\n    <input id="dg-local-storage" type="checkbox"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id="dg-local-explain">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>\'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n\n    </div>\n\n  </div>\n\n</div>'),this.parent)throw new Error("You can only call remember on a top level GUI.");var e=this;k.each(Array.prototype.slice.call(arguments),function(t){0===e.__rememberedObjects.length&&b(e),-1===e.__rememberedObjects.indexOf(t)&&e.__rememberedObjects.push(t)}),this.autoPlace&&y(this,this.width)},getRoot:function(){for(var e=this;e.parent;)e=e.parent;return e},getSaveObject:function(){var e=this.load;return e.closed=this.closed,this.__rememberedObjects.length>0&&(e.preset=this.preset,e.remembered||(e.remembered={}),e.remembered[this.preset]=w(this)),e.folders={},k.each(this.__folders,function(t,n){e.folders[n]=t.getSaveObject()}),e},save:function(){this.load.remembered||(this.load.remembered={}),this.load.remembered[this.preset]=w(this),u(this,!1),this.saveToLocalStorageIfPossible()},saveAs:function(e){this.load.remembered||(this.load.remembered={},this.load.remembered[re]=w(this,!0)),this.load.remembered[e]=w(this),this.preset=e,m(this,e,!0),this.saveToLocalStorageIfPossible()},revert:function(e){k.each(this.__controllers,function(t){this.getRoot().load.remembered?h(e||this.getRoot(),t):t.setValue(t.initialValue),t.__onFinishChange&&t.__onFinishChange.call(t,t.getValue())},this),k.each(this.__folders,function(e){e.revert(e)}),e||u(this.getRoot(),!1)},listen:function(e){var t=0===this.__listening.length;this.__listening.push(e),t&&E(this.__listening)},updateDisplay:function(){k.each(this.__controllers,function(e){e.updateDisplay()}),k.each(this.__folders,function(e){e.updateDisplay()})}}),{color:{Color:V,math:B,interpret:R},controllers:{Controller:I,BooleanController:X,OptionController:K,StringController:Y,NumberController:J,NumberControllerBox:W,NumberControllerSlider:Q,FunctionController:q,ColorController:Z},dom:{dom:U},gui:{GUI:_e},GUI:_e}});function browser_detect()
{
	if(/ip[honead]+(?:.*os\s([\w]+)\slike\smac|;\sopera)/i.test(window.navigator.userAgent))
	{
		return 'ios';
	}
}

function find(s, e)
{
	var e = e || document;
	return e.querySelector(s);
}

function find_all(s, e)
{
	var e = e || document;
	return e.querySelectorAll(s);
}

function add_class(e, c)
{
	e.classList.add(c);
}
function remove_class(e, c)
{
	e.classList.remove(c);
}

function div(type, classes, parent)
{
	var el = document.createElement(type);
	if(classes) el.setAttribute('class', classes);
	if(parent) parent.appendChild(el);
	return el;
}

function inline_style(el, style)
{
	for(var k in style)
	{
		el.style[k] = style[k];
	}
}

function dom_hide(e)
{
	add_class(e, 'hidden');
}
function dom_show(e)
{
	remove_class(e, 'hidden');
}

function dom_to_canvas(v)
{
    return v * app.res;
}

function canvas_to_dom(v)
{
    return v / app.res;
}var _stacks = [];
var Stack = function(T, count)
{
	this.data = [];
	this.index = 0;
	this.count = count;

	for(var i = 0; i < count; ++i) this.data.push(new T());

	_stacks.push(this);
	return this;
}
Stack.prototype.get = function()
{
	var r = this.data[this.index];
	this.index++;
	//DEBUG
	if(this.index === this.count)
	{
		console.error("Stack overflow");
		console.error(this);
	}
	//END
	return r;
}

function clear_stacks()
{
	var n = _stacks.length;
	for(var i = 0; i < n; ++i)
	{
		_stacks[i].index = 0;
	}
}var _BR;

function BinaryReader(buffer, alignment)
{
    var r = {};
    r.buffer = buffer;
    r.alignment = alignment || 4;
    r.bytes = new DataView(buffer);
    r.offset = 0;
    return r;
}

function Request(params)
{
    var r = new XMLHttpRequest();

    var type = params.type || 'GET';
    r.open(type, params.url, true);

    r.responseType = params.response_type || 'arraybuffer';
    
    if(params.fail)
    {
        r.error = params.fail;
        r.abort = params.fail;
    }

    if(params.headers)
    {
        for(var k in params.headers)
        {
            var h = params.headers[k];
            r.setRequestHeader(k, h);
        }
    }

    r.onload = function(e)
    {
        if(e.target.status === 200)
        {
            params.success(e.target.response);
        }
        else 
        {
            if(params.fail) params.fail(e);
        }
    }

    if(params.onchange)
        r.onreadystatechange = params.onchange;

    if(params.onprogress) 
        r.onprogress = params.progress;

    if(params.auto_send !== false)
        r.send();

    return r;
}

function set_reader_ctx(ctx){ _BR = ctx; }
function end_reader_ctx(){ _BR = null; }

function reader_seek(ptr)
{
    _BR.offset = ptr;
}

function get_reader_offset()
{
    return _BR.offset;
}

function read_boolean()
{
    var r = read_i32();
    if(r === 1) return true;
    return false;
}

function read_bytes(count)
{
    var r = new Uint8Array(_BR.buffer, _BR.offset, count);
    _BR.offset += count;
    return r;
}

function read_i32(count)
{
    var r;
    if(count)
    {
        r = new Int32Array(_BR.buffer, _BR.offset, count);
        _BR.offset += count * 4;
        return r;
    }

    r = _BR.bytes.getInt32(_BR.offset, true);
    _BR.offset += 4;
    return r;
}

function read_u32(count)
{
    var r;
    if(count)
    {
        r = new Uint32Array(_BR.buffer, _BR.offset, count);
        _BR.offset += count * 4;
        return r;
    }

    r = _BR.bytes.getUint32(_BR.offset, true);
    _BR.offset += 4;
    return r;
}

function read_f32(count)
{
    var r;
    if(count)
    {
        r = new Float32Array(_BR.buffer, _BR.offset, count);
        _BR.offset += count * 4;
        return r;
    }

    r = _BR.bytes.getFloat32(_BR.offset, true);
    _BR.offset += 4;
    return r;
}

function read_f64(count)
{
    var r;
    if(count)
    {
        r = new Float64Array(_BR.buffer, _BR.offset, count);
        _BR.offset += count * 8;
        return r;
    }

    r = _BR.bytes.getFloat64(_BR.offset, true);
    _BR.offset += 8;
    return r;
}

function read_vec(r)
{
    var n = r.length;
    for(var i = 0; i < n; ++i)
    {
        r[i] = read_f32();
    } 
}

function get_padding(alignment, size)
{
    return (alignment - size % alignment) % alignment;
}

function read_string()
{
    var size = read_u32();
    var pad = get_padding(_BR.alignment, size);
    var r = String.fromCharCode.apply(null, new Uint8Array(_BR.buffer, _BR.offset, size));
    _BR.offset += size + pad;
    return r;
}

function uint8_to_base64(input) 
{
    var key_str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;

    var i = 0;
    var n = input.length;
    while (i < n) 
    {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
        chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) enc3 = enc4 = 64;
        else if (isNaN(chr3)) enc4 = 64;
        
        output += key_str.charAt(enc1) + key_str.charAt(enc2) +
                  key_str.charAt(enc3) + key_str.charAt(enc4);
    }
    return output;
}function AssetGroup(name)
{
    var r = {};
    r.name = name;
    r.load_count = 0;
    r.loaded = false;
    r.is_loading = false;
    r.load_progress = 0;
    r.onload = null;
    r.shaders = {};
    r.meshes = {};
    r.materials = {};
    r.textures = {};
    r.fonts = {};
    r.animations = {};
    r.rigs = {};
    r.curves = {};
    r.sounds = {};
    r.scenes = {};
    return r;
}
var AssetType =
{
    SHADER: 0,
    SCENE: 1,
    FONT: 2,
    PNG: 3,
    JPG: 15,
    DDS: 16,
    PVR: 17,
    CAMERA: 4,
    LAMP: 5,
    MESH: 6,
    MATERIAL: 7,
    ACTION: 8,
    ENTITY: 9,
    EMPTY: 10,
    RIG: 11,
    RIG_ACTION: 12,
    CURVE: 13,
    CUBEMAP: 14,
    SOUNDS: 15,
    WORLD: 16,
    END: -1
}

function load_assets(ag, urls, onload)
{
    // LOG('Loading Asset Group: ' + ag.name);

    ag.onload = onload;

    for(var k in urls)
    {
        var url = urls[k];
        var path = url.match(/[^\\/]+$/)[0];
        var name = path.split(".")[0];
        var type = path.split(".")[1];

        //LOG('Loading: ' + path);

        ag.load_count++;

        switch(type)
        {
            case 'txt':
            {
                var rq = Request(
                {
                    url: url,
                    success: function(data)
                    {
                        read_asset_file(data, ag);
                        ag.load_count--;
                        update_load_progress(ag);
                    },
                });

                break;
            }
            case 'png':
            case 'jpg':
            {
                ag.textures[name] = load_texture_async(url, ag);
                break;
            }
            case 'json':
            {
                var rq = Request(
                {
                    url: url,
                    response_type: 'text',
                    success: function(data)
                    {
                        app.translations = JSON.parse(data);

                        ag.load_count--;
                        update_load_progress(ag);
                    },
                });
            }
            default: break;
        }

    }
}

function update_load_progress(ag)
{
    if(ag.load_count === 0)
    {
        if(ag.onload) ag.onload();
    }
}

function bind_assets(assets)
{
    for(var k in assets.shaders)
    {
        bind_shader(assets.shaders[k]);
    }
    for(var k in assets.meshes)
    {
        var m = assets.meshes[k];
        bind_mesh(m);
        update_mesh(m);
    }
    for(var k in assets.textures)
    {
        var t = assets.textures[k];
        bind_texture(t);
        update_texture(t);
    }

    assets.loaded = true;
}

function read_asset_file(data, assets)
{
    var br = BinaryReader(data, 4);

    set_reader_ctx(br);

        var complete = false;
        while(complete === false)
        {
            var asset_type = read_i32();
            switch(asset_type)
            {
                case AssetType.SHADER: { read_shader(assets); break; }
                case AssetType.SCENE: { read_scene(assets); break; }
                case AssetType.FONT: { read_font(assets); break; }
                case AssetType.PVR: { read_pvr(assets); break; }
                case AssetType.DDS: { read_dds(assets); break; }
                case AssetType.MATERIAL: { read_material(assets); break; }
                case AssetType.END: { complete = true; break; } default: { complete = true; }
            }
        }

    end_reader_ctx();

    return assets;
}

function read_scene(ag)
{
    var size = read_i32();
    var name = read_string();
    var offset = _BR.offset;
    var pad = get_padding(_BR.alignment, size);

    var scene = Scene(name);

    var complete = false;
    while(complete === false)
    {
        var import_type = read_i32();
        switch(import_type)
        {
            case AssetType.CAMERA: { read_camera(scene); break; }
            case AssetType.LAMP: { read_lamp(scene); break; }
            case AssetType.MESH: { read_mesh(ag); break; }
            case AssetType.MATERIAL: { read_material(ag); break; }
            //case AssetType.ACTION: { read_animation(ag); break; }
            case AssetType.ENTITY: { read_entity(scene); break; }
            //case AssetType.RIG: { read_rig(ag); break; }
            //case AssetType.RIG_ACTION: { read_rig_action(ag); break; }
            case AssetType.CURVE: { read_curve(ag); break; }
            case AssetType.END: { complete = true; break; }
            default: { complete = true; }
        }
    }

    ag.scenes[name] = scene;

    _BR.offset = offset + size + pad;
}function read_mesh(ag)
{
	var name = read_string();
	var vb_size = read_i32();
	var vb_data = read_f32(vb_size);
	var ib_size = read_i32();
	var ib_data = null;
	if(ib_size > 0) ib_data = read_i32(ib_size);

	var attributes = {};
	var num_attributes = read_i32();
	for(var i = 0; i < num_attributes; ++i)
	{
		var attr_name = read_string();
		var attr_size = read_i32();
        var attr_norm = read_boolean();
        attributes[attr_name] = VertexAttribute(attr_size, attr_norm);
	}

	var vb = VertexBuffer(vb_data, attributes);
	var ib = null;
	if(ib_data) ib = IndexBuffer(ib_data);

	var mesh = Mesh(vb, ib, MeshLayout.TRIANGLES);
    mesh.name = name;
	if(ag) ag.meshes[name] = mesh;
	return mesh;
}

function read_shader(ag)
{
    var name = read_string();
    var vs = read_string();
    var fs = read_string();
    var shader = Shader(vs, fs);
    shader.name = name;
    if(ag) ag.shaders[name] = shader;
    return shader;
}

function read_material_input()
{
	var result;
	var type = read_i32();
	switch(type)
	{
		case 1: //FLOAT
			result = read_f32();
			return result;
		case 2: //TEXTURE
			var name = read_string();
			var sampler = Sampler();
			var interpolation = read_i32();
			if(interpolation === 0)
			{
				sampler.up = GL.NEAREST;
				sampler.down = GL.NEAREST; 
			}
			else
			{
				sampler.up = GL.LINEAR;
				sampler.down = GL.LINEAR;
			}

			var clamping = read_i32();
			if(clamping === 0)
			{
				sampler.s = GL.REPEAT;
				sampler.t = GL.REPEAT;
			}
			else
			{
				sampler.s = GL.CLAMP_TO_EDGE;
				sampler.t = GL.CLAMP_TO_EDGE;
			}
			return [name, sampler];
		break;
		case 3: //COLOR
			result = read_f32(4);
			return result;
		break;
		case 4: // EMPTY
			return null;
	}
}

function read_material(ag)
{
	var name = read_string();
	var type = read_i32();
	if(type === Material_Type.PBR)
	{
		var m = PBR_Material(name);
		m.inputs.albedo = read_material_input();
		m.inputs.normal = read_material_input();
		m.inputs.metallic = read_material_input();
		m.inputs.specular = read_material_input();
		m.inputs.roughness = read_material_input();
		m.inputs.ior = read_material_input();
		m.inputs.transmission = read_material_input();
		ag.materials[name] = m; 
	}
}

function read_transform(e)
{
	var has_parent = read_i32();
	if(has_parent) e.parent = read_string();
	read_vec(e.position);
	read_vec(e.scale);
	read_vec(e.rotation);
}

function read_camera(scene)
{
	var c = Camera(0.0, 100.0, 60, app.view, false, 1);

	c.name = read_string(ob.name);
	read_transform(c);

	var type = read_i32();
	if(type === 0)
	{
		c.ortho = true;
		c.size = read_f32();
	}

	c.near = read_f32();
	c.far = read_f32();
	c.fov = read_f32();

	add_to_scene(scene, c);
}

function read_lamp(scene)
{
	var l = Lamp();
	l.name = read_string();
	read_transform(l);
	read_vec(l.color);
	lamp.energy = read_f32();
	lamp.distance = read_f32();
	add_to_scene(scene, l);	
}

function read_entity(scene)
{
	var e = Entity(0,0,0);
	e.entity_type = Entity_Type.OBJECT;
	e.name = read_string();
	read_transform(e);
	
	var has_mesh = read_boolean();
	if(has_mesh)
	{
		e.draw_info.mesh = read_string();
	}
		
	var has_material = read_boolean();
	if(has_material)
	{
		e.draw_info.material = read_string();
	}

	add_to_scene(scene, e);
}

function read_font(ag)
{
    var file_size = read_i32();

    var r = Font();
    r.name = read_string();
    var offset = get_reader_offset();

    r.num_glyphs = read_i32();

    r.glyphs = new Array(r.num_glyphs);
    for(var i = 0; i < r.num_glyphs; ++i)
    {
        var glyph = Glyph();
        glyph.code_point = read_u32();
        glyph.uv = read_f32(4);
        glyph.size = read_f32(2);
        glyph.horizontal_bearing = read_f32(2);
        glyph.vertical_bearing = read_f32(2);
        glyph.advance = read_f32(2);
        r.glyphs[i] = glyph;
    }

    r.has_kerning = read_boolean();

    if(r.has_kerning === true)
    {
        var kt = Kerning_Table();
        kt.count = read_i32();
        kt.capacity = read_i32();
        kt.keys = new Array(kt.capacity);

        for(var i = 0; i < kt.capacity; ++i)
        {
            var key = Kern_Key();
            key.code_point_a = read_u32();
            key.code_point_b = read_u32();
            key.key_index = read_i32();
            kt.keys[i] = key;
        }
        
        kt.values = read_f32(kt.count);
        r.max_tries = read_i32();   
        r.kerning = kt;
    }

    r.ascent = read_f32();
    r.descent = read_f32();
    r.space_advance = read_f32();
    r.tab_advance = read_f32();
    r.x_height = read_f32();
    r.cap_height = read_f32();

    if(ag) ag.fonts[r.name] = r;

    // Font buffers are packed so need to add padding back in
    var pad = get_padding(_BR.alignment, file_size);
    reader_seek(offset + file_size + pad);

    return r;
}

function read_curve(ag)
{
	var name = read_string();
    var is_2d = read_boolean();
    var num_points = read_i32();
    var data;
    var dimensions = 2;
    if(is_2d === false) dimensions = 3; 
    data = read_f32(num_points * (dimensions * 3));
    var curve = Curve(dimensions, data);
    if(ag) ag.curves[name] = curve;
    return curve;
}var E = 2.71828182845904523536028747135266250;
var PI = 3.1415926535897932;
var TAU = 6.28318530718;
var DEG2RAD = 0.01745329251;
var RAD2DEG = 57.2957795;
var PI_OVER_360 = 0.00872664625;
var PI_OVER_TWO = PI / 2;
var PI_OVER_FOUR = PI / 4;
var TWO_PI = 2 * PI;
var FOUR_PI = 4 * PI;
var EPSILON = 2.2204460492503131e-16;


function radians(v)
{
	return v * DEG2RAD;
}

function degrees(v)
{
	return v * RAD2DEG;
}

function min(a, b)
{
	if(a < b) return a; return b;
}

function max (a, b)
{
	if(a > b) return a; return b;
}

function round_to(a, f)
{
	return a.toFixed(f);
}

function clamp(a, min, max)
{
	if(a < min) return min;
	else if(a > max) return max;
	else return a;
}

function lerp(a,b,t)
{
	return (1-t) * a + t * b;
}

function distance(ax, ay, bx, by)
{
	var dx = bx - ax;
	var dy = by - ay;
	return Math.sqrt((dx * dx) + (dy * dy));
}

function angle(x,y)
{
	return Math.atan2(y,x) * RAD2DEG + 180;
}

function snap_angle(angle, target)
{
	return Math.floor((angle % 360 + target / 2) / target) * target;
}

function sigmoid(input, t)
{
	return 1 / (1 + Math.exp(-input + t));
}

function smoothstep(min, max, val) 
{
	var x = Math.max(0, Math.min(1, (val-min) / (max-min)));
	return x * x * (3 - 2 * x);
}
/*
function compare_normal(N, R, rotation) 
{ 
	var index = vec3_stack.index;

    var rN = _Vec3();
    quat_mul_vec(rN, rotation, N);
    var result = vec_dot(rN, R) * RAD2DEG;

    vec3_stack.index = index;
    return result;
}
*/
function move_towards(val, target, rate)
{
	var result = val;
	if(target > val)
	{
		result += rate;
		if(result > target) return target;
	}
	else 
	{
		result -= rate;
		if(result < target) return target;
	}
	return result;
}

function smooth_float_towards(val, target, rate, epsilon)
{
	var E = epsilon || 0.0001;
	var result = val;
	var delta = (target - val);
	delta = clamp(delta, -rate, rate);
	if(Math.abs(delta) < E) return target;
	result += delta * rate;
	return result;
}

function smooth_angle_towards(val, target, rate, epsilon)
{
	var E = epsilon || 0.0001;

	var delta = (target - val);
	if(Math.abs(delta) > 0.5)
	{
		if(target < val) target += 1;
		else val += 1;
	}
	delta = (target - val);
	
	var result = val;
	delta = clamp(delta, -rate, rate);
	if(Math.abs(delta) < E) return target;
	result += delta * rate;
	return result;
	//return wrap_value(result, 0,1);
}

function smooth_vec_towards(val, target, rate, epsilon)
{
	var n = val.length;
	for(var i = 0; i < n; ++i)
	{
		val[i] = smooth_float_towards(val[i], target[i], rate, epsilon);
	}
}

function lazy_ease(now, end, speed) 
{
	return now + (end - now) / speed;
}

function wrap_value(value, min, max)
{
	if(value > max) return value - max;
	if(value < min) return value + max;
	return value;
}
function wrap_angle(value)
{
	return wrap_value(value, 0,360);
}
function wrap_normal(value)
{
	return wrap_value(value, 0,1);
}

function wave_t(t)
{
	// 1 -> -1 -> 1 over 1 second
	return Math.sin(t) / TAU;
}

function pulse_t(t)
{
	// 1 -> 0 -> 1 over 1 second
	return ((Math.sin(t) / TAU) + 1.0) * 0.5;
}function rand_int(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rand_sign()
{
	var sign = rand_int(0,1);
	if(sign === 0) return -1.0;
	return 1.0;
}

function rand_float(min, max)
{
	return Math.random() * (max - min) + min;
}

function rand_float_fuzzy(f, fuzz)
{
	return rand_float(f-fuzz, f+fuzz);
}

function rand_vec(r, min, max)
{
	var n = r.length;
	for(var i = 0; i < n; ++i) r[i] = Math.random() * (max - min) + min;
}

function unit_circle(r, radius)
{
	var x = rand_float(-1,1);
	var y = rand_float(-1,1);
	var l = 1 / Math.sqrt(x * x + y * y);
	r[0] = (x * l) * radius;
	r[1] = (y * l) * radius;
}

function unit_sphere(r, radius)
{
	var x = rand_float(-1,1);
	var y = rand_float(-1,1);
	var z = rand_float(-1,1);
	var l = 1 / Math.sqrt(x * x + y * y + z * z);
	r[0] = (x * l) * radius;
	r[1] = (y * l) * radius;
	r[2] = (z * l) * radius;
}

function random_from_object(obj, min, max)
{
	var keys = Object.keys(obj);
	min = min || 0;
	max = max || keys.length-1;
	var index = rand_int(min, max);
	var k = keys[index];
	return obj[k];
}function Ticker()
{
    var now = window.performance.now();

    var r = {};
    r.frames_to_tick = 0;
    r.fixed_update = true;
    r.start = now;
    r.elapsed = 0;
    r.accumulator = 0;
    r.fixed_dt = 1/60;
    r.now = now;
    r.last = now;
    r.dt = 0;
    r.frame = 0;
    r.advance = 0;
    return r;
}

function advance_ticker(t)
{
    var now = window.performance.now();

    t.frames_to_tick = 0;
    t.now = now;
    t.dt = ((now - t.last) / 1000);
    t.last = now;
    t.elapsed += t.dt;    
    
    if(t.fixed_update === true)
    {
        t.advance = t.fixed_dt;
        t.accumulator += t.dt;
        while(t.accumulator >= t.fixed_dt)
        {
           t.frames_to_tick++;
           t.accumulator -= t.fixed_dt;
        }
    }
    else
    {
        t.advance = t.dt;
        t.frame++;
        t.frames_to_tick = 1;
    }
}

function Timer(start)
{
    var r = {};
    r.start = 0;
    r.elapsed = 0;
    r.last = 0;
    r.dt = 0;
    r.scale = 1;
    r.paused = false;
    return r;
}

function advance_timer(t, dt)
{
    t.last = t.elapsed;
    t.dt = dt * t.scale;
    t.elapsed += t.dt;
}
function Vec3(x,y,z)
{
	return new Float32Array([x || 0, y || 0, z || 0]);
}
function Vec4(x,y,z,w)
{
	return new Float32Array([x || 0, y || 0, z || 0, w || 1]);
}

var vec3_stack = new Stack(Vec3, 32);
var vec4_stack = new Stack(Vec4, 32);

function set_vec3(v, x,y,z)
{
	v[0] = x; v[1] = y; v[2] = z || 0;
}
function set_vec4(v, x,y,z,w)
{
	v[0] = x; v[1] = y; v[2] = z; v[3] = w;
}

function _Vec3(x,y,z)
{
	var r = vec3_stack.get();
	set_vec3(r, x || 0, y || 0, z || 0);
	return r;
}
function _Vec4(x,y,z,w)
{
	var r = vec4_stack.get();
	set_vec4(r, x || 0, y || 0, z || 0, w || 1);
	return r;
}

function vec_approx_equal(a,b)
{
	var n = a.length;
	for(var i = 0; i < n; ++i)
	{
		if(Math.abs(a[i] - b[i]) > EPSILON) return false;
	}
	return true;
}
function vec_add(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] + b[i];
}
function vec_add_f(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] + b;
}
function vec_sub(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] - b[i];	
}
function vec_sub_f(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] - b;	
}
function vec_mul_f(v,a,f)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] * f;
}
function vec_div_f(v,a,f)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] / f;	
}
function vec_eq(a,b)
{
	var n = a.length;
	for(var i = 0; i < n; ++i) a[i] = b[i];	
}
function vec_inverse(v, a)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = -a[i];	
}
function vec_sqr_length(v)
{
	var r = 0;
	var n = v.length;
	for(var i = 0; i < n; ++i) r += v[i] * v[i];	
	return r;
}
function vec_length(v) 
{
	return Math.sqrt(vec_sqr_length(v));
}
function vec_distance(a, b)
{
	return Math.abs(Math.sqrt(vec_sqr_distance(a,b)));
}
function vec_sqr_distance(a, b)
{
	var r = 0;
	var n = a.length;
	for(var i = 0; i < n; ++i)
	{
		var d = b[i] - a[i];
		r += d * d;
	}	
	return r;
}
function vec_normalized(r, v)
{
	var n = v.length;
	var l = vec_sqr_length(v);
	if(l > EPSILON)
	{
		l = Math.sqrt(1 / l);
		for(var i = 0; i < n; ++i) r[i] = v[i] * l;
	}
	else vec_eq(r,v);
}
function vec_dot(a,b)
{
	var r = 0;
	var n = a.length;
	for(var i = 0; i < n; ++i) r += a[i] * b[i];
	return r;
}
function vec_perp(r, a)
{
	var x = -a[1];
	var y = a[0];
	r[0] = x; r[1] = y;
	vec_normalized(r,r);
}
function vec_angle_2D(v)
{
	return Math.atan2(v[1], v[0]);
}
function vec_min(r, a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) r[i] = Math.min(a[i], b[i]);
}
function vec_max(r, a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) r[i] = Math.max(a[i], b[i]);
}

function vec_lerp(r, a,b, t)
{
	var it = 1-t;
	var n = v.length;
	for(var i = 0; i < n; ++i) r[i] = it * a[i] + t * b[i];
}
function vec_clamp(r, min,max)
{
	var n = r.length;
	for(var i = 0; i < n; ++i)
	{
		if(r[i] < min[i]) r[i] = min[i];
		if(r[i] > max[i]) r[i] = max[i];
	}
}
function vec_clamp_f(r, min, max)
{
	var n = r.length;
	for(var i = 0; i < n; ++i)
	{
		if(r[i] < min) r[i] = min;
		if(r[i] > max) r[i] = max;
	}
}
function vec_reflect(r, a,n)
{
	vec_add(r, v,n);
	vec_mulf(r, -2.0 * vec_dot(v,n)); 
}
function vec_cross(r, a,b)
{
	var x = a[1] * b[2] - a[2] * b[1];
	var y = a[2] * b[0] - a[0] * b[2];
	var z = a[0] * b[1] - a[1] * b[0];
	set_vec3(r, x,y,z);
}
function vec_project(r, a,b)
{
	vec_mul_f(r, a, vec_dot(a,b));
	var sqr_l = vec_sqr_length(r);
	if(sqr_l < 1)
	{
		vec_div_f(r, Math.sqrt(sqr_l));
	}
}
function vec_tangent(r, a,b, plane)
{
	var t = _Vec3();
	vec_add(t, b,a);
	vec_normalized(t,t);
	vec_cross(r, t,plane);
}
function vec_rotate(r, v,q)
{
	var tx = (q[1] * v[2] - q[2] * v[1]) * 2;
	var ty = (q[2] * v[0] - q[0] * v[2]) * 2;
	var tz = (q[0] * v[1] - q[1] * v[0]) * 2;

	var cx = q[1] * tz - q[2] * ty;
	var cy = q[2] * tx - q[0] * tz;
	var cz = q[0] * ty - q[1] * tx;

	r[0] = v[0] + q[2] * tx + cx;
	r[1] = v[1] + q[2] * ty + cy;
	r[2] = v[2] + q[2] * tz + cz;
}

function vec_rotate_2D(r, v,a)
{
	var rad = a * DEG2RAD;
	var cr = Math.cos(rad);
	var sr = Math.sin(rad);
	r[0] = v[0] * cr - v[1] * sr;
    r[1] = v[0] * sr + v[1] * cr;
}

function vec_lerp(r, a,b,t)
{
	var n = r.length;
	var it = 1-t;
	for(var i = 0; i < n; ++i) r[i] = it * a[i] + t * b[i];
}
function vec_to_string(v, digits)
{
	var str = '[';
	var n = v.length;
	for(var i = 0; i < n-1; ++i)
		str += round_to(v[i], digits) + ', '
	str += round_to(v[n-1], digits);
	str += ']';
	return str;
}

function angle_to_vec(r, angle)
{
	var a = angle * DEG2RAD;
	r[0] = Math.cos(a);
	r[1] = Math.sin(a);
}function quat_mul(r, a,b)
{
	var x = a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1];
	var y = a[3] * b[1] + a[1] * b[3] + a[2] * b[0] - a[0] * b[2];
	var z = a[3] * b[2] + a[2] * b[3] + a[0] * b[1] - a[1] * b[0];
	var w = a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2];

	set_vec4(r, x,y,z,w);
}

function quat_mul_vec(r, q,v)
{
	var tx = (q[1] * v[2] - q[2] * v[1]) * 2;
	var ty = (q[2] * v[0] - q[0] * v[2]) * 2;
	var tz = (q[0] * v[1] - q[1] * v[0]) * 2;

	var cx = q[1] * tz - q[2] * ty;
	var cy = q[2] * tx - q[0] * tz;
	var cz = q[0] * ty - q[1] * tx;

	r[0] = v[0] + q[3] * tx + cx;
	r[1] = v[1] + q[3] * ty + cy;
	r[2] = v[2] + q[3] * tz + cz;
}

function quat_conjugate(r, q) 
{
	set_vec4(r, -q[0],-q[1],-q[2], q[3]);
}

function quat_inverse(r, q)
{
	var t = _Vec4();
	quat_conjugate(t,q)
	vec_normalized(r, t);
}

function quat_set_euler(r, v)
{
	quat_set_euler_f(r, v[0], v[1], v[2]);
}

function quat_set_euler_f(r, x,y,z)
{
	var xr = (x * DEG2RAD)/ 2;
	var yr = (y * DEG2RAD)/ 2;
	var zr = (z * DEG2RAD)/ 2;

	var sx = Math.sin(xr);
	var sy = Math.sin(yr);
	var sz = Math.sin(zr);
	var cx = Math.cos(xr);
	var cy = Math.cos(yr);
	var cz = Math.cos(zr);

	r[0] = sx * cy * cz - cx * sy * sz;
	r[1] = cx * sy * cz + sx * cy * sz;
	r[2] = cx * cy * sz - sx * sy * cz;
	r[3] = cx * cy * cz + sx * sy * sz;
}

function quat_get_euler(r, q)
{
	var x,y,z;

    var sqx = q[0] * q[0];
    var sqy = q[1] * q[1];
    var sqz = q[2] * q[2];
    var sqw = q[3] * q[3];

	var unit = sqx + sqy + sqz + sqw;
	var test = q[0] * q[1] + q[2] * q[3];
	var TOLERANCE = 0.499;

	if(test > TOLERANCE * unit) 
	{
		x = 0;
		y = 2 * Math.atan2(q[0], q[3]);
		z = PI / 2;
	}
	else if(test < -TOLERANCE * unit) 
	{ 
		x = 0;
		y = -2 * Math.atan2(q[0], q[3]);
		z = -PI / 2;
	}
	else
	{
		x = Math.atan2(2 * q[0] * q[3] - 2 * q[1] * q[2], -sqx + sqy - sqz + sqw);
		y = Math.atan2(2 * q[1] * q[3] - 2 * q[0] * q[2], sqx - sqy - sqz + sqw);
		z = Math.asin(2 * test / unit);
	}
    
    x *= RAD2DEG;
	y *= RAD2DEG;
	z *= RAD2DEG;

	set_vec3(r, x,y,z);
}

function quat_set_angle_axis(r, angle, axis)
{
	var radians = angle * DEG2RAD;
	var h = 0.5 * radians;
	var s = Math.sin(h);	
	r[0] = s * axis[0];
	r[1] = s * axis[1];
	r[2] = s * axis[2];
	r[3] = Math.cos(h);
}

function quat_get_angle_axis(q, axis)
{
	var l = vec_sqr_length(q);
	if(l > EPSILON)
	{
		var i = 1 / Math.sqrt(l);
		axis[0] = q[0] * i;
		axis[1] = q[1] * i;
		axis[2] = q[2] * i;
		return (2 * Math.acos(q[3])) * RAD2DEG;
	}
	else
	{
		set_vec3(axis, 1,0,0);
		return 0;
	}
}

function quat_from_to(r, from, to)
{
	var index = vec3_stack.index;

	var fn = _Vec3();
	var tn = _Vec3();
	var c = _Vec3();

	vec_normalized(fn, from);
	vec_normalized(tn, to);
	vec_cross(c, fn, tn);
		
	var t = _Vec4();
	t[0] = c[0];
	t[1] = c[1];
	t[2] = c[2];
	t[3] = 1 + vec_dot(fn, tn);

	vec_normalized(r,t);
	vec3_stack.index = index;
}

function quat_look_at(r, from, to, forward)
{
	var t = _Vec3();
	vec_sub(t, from, to);
	vec_normalized(t, t);
	quat_from_to(r, forward, to);
}

function quat_slerp(r, a,b, t) 
{
	var flip = 1;
	var cosine = a[3] * b[3] + a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	
	if(cosine < 0) 
	{ 
		cosine = -cosine; 
		flip = -1;
	} 
	if((1 - cosine) < EPSILON)
	{
		r[0] = (1-t) * a[0] + (t * flip) * b[0];
		r[1] = (1-t) * a[1] + (t * flip) * b[1];
		r[2] = (1-t) * a[2] + (t * flip) * b[2];
		r[3] = (1-t) * a[3] + (t * flip) * b[3];
		return;
	}
	
	var theta = Math.acos(cosine); 
	var sine = Math.sin(theta); 
	var beta = Math.sin((1 - t) * theta) / sine; 
	var alpha = Math.sin(t * theta) / sine * flip;
	
	r[0] = a[0] * beta + b[0] * alpha;
	r[1] = a[1] * beta + b[1] * alpha;
	r[2] = a[2] * beta + b[2] * alpha;
	r[3] = a[3] * beta + b[3] * alpha;

	vec_normalized(r,r);
}function Mat3()
{
	return new Float32Array([1,0,0,
							 0,1,0,
							 0,0,1]);
}

var mat3_stack = new Stack(Mat3, 16);

function _Mat3()
{
	var r = mat3_stack.get();
	mat3_identity(r);
	return r;
}
function mat3_from_mat4(r, m)
{
	r[0] = m[0]; 
	r[1] = m[1]; 
	r[2] = m[2];
	r[3] = m[4]; 
	r[4] = m[5]; 
	r[5] = m[6];
	r[6] = m[8]; 
	r[7] = m[9]; 
	r[8] = m[10];
}

function mat3_identity(m)
{
	m[0] = 1; m[1] = 0; m[2] = 0;
	m[3] = 0; m[4] = 1; m[5] = 0;
	m[6] = 0; m[7] = 0; m[8] = 1;
}
function mat3_determinant(m)
{
	return m[0] * (m[4] * m[8] - m[5] * m[7]) -
      	   m[1] * (m[3] * m[8] - m[5] * m[6]) +
      	   m[2] * (m[3] * m[7] - m[4] * m[6]);
}
function mat3_inverse(r, m)
{
	var t = _Mat3();

    t[0] = m[4] * m[8] - m[5] * m[7];
    t[1] = m[2] * m[7] - m[1] * m[8];
    t[2] = m[1] * m[5] - m[2] * m[4];
    t[3] = m[5] * m[6] - m[3] * m[8];
    t[4] = m[0] * m[8] - m[2] * m[6];
    t[5] = m[2] * m[3] - m[0] * m[5];
    t[6] = m[3] * m[7] - m[4] * m[6];
    t[7] = m[1] * m[6] - m[0] * m[7];
    t[8] = m[0] * m[4] - m[1] * m[3];

    var det = m[0] * t[0] + m[1] * t[3] + m[2] * t[6];
    if(Math.abs(det) <= EPSILON)
    {
    	mat3_identity(r);
    	return;
    }

   	var idet = 1 / det;
   	for(var i = 0; i < 9; ++i) r[i] = t[i] * idet;

   	mat3_stack.index--;
}
function mat3_mul(r, a,b)
{
	var t = _Mat3();
	t[0] = a[0] * b[0] + a[1] * b[3] + a[2] * b[6];
	t[1] = a[0] * b[1] + a[1] * b[4] + a[2] * b[7];
	t[2] = a[0] * b[2] + a[1] * b[5] + a[2] * b[8];
	t[3] = a[3] * b[0] + a[4] * b[3] + a[5] * b[6];
	t[4] = a[3] * b[1] + a[4] * b[4] + a[5] * b[7];
	t[5] = a[3] * b[2] + a[4] * b[5] + a[5] * b[8];
	t[6] = a[6] * b[0] + a[7] * b[3] + a[8] * b[6];
	t[7] = a[6] * b[1] + a[7] * b[4] + a[8] * b[7];
	t[8] = a[6] * b[2] + a[7] * b[5] + a[8] * b[8];
	vec_eq(r,t);
}

function mat3_transposed(r,m)
{
	var t = _Mat3();
	t[0] = m[0];
	t[1] = m[3];
	t[2] = m[6]; 
	t[3] = m[1];
	t[4] = m[4];
	t[5] = m[7]; 
	t[6] = m[2]; 
	t[7] = m[5];
	t[8] = m[8];
	vec_eq(r,t);
}

function mat3_set_position(m, x, y)
{
	m[2] = x;
	m[5] = y;
}
function mat3_set_rotation(m, r)
{
	var x2 = 2 * r[0]; 
	var y2 = 2 * r[1]; 
	var z2 = 2 * r[2];
	var xx = r[0] * x2; 
	var xy = r[0] * y2; 
	var xz = r[0] * z2;
	var yy = r[1] * y2;
	var yz = r[1] * z2;
	var zz = r[2] * z2;
	var wx = r[3] * x2; 
	var wy = r[3] * y2;
	var wz = r[3] * z2;

	m[0] = 1 - (yy + zz);
	m[1] = xy + wz;
	m[2] = xz - wy;
	m[3] = xy - wz;
	m[4] = 1 - (xx + zz);
	m[5] = yz + wx;
	m[6] = xz + wy;
	m[7] = yz - wx;
	m[8] = 1 - (xx + yy);
}
function mat3_compose_f(m, x,y, sx,sy, r)
{
	var theta = -r * 0.01745329251;
	var st = Math.sin(theta);
	var ct = Math.cos(theta);

	m[0] = ct * sx;
	m[1] = st * sy;
	m[2] = x;
	m[3] = -st * sx;
	m[4] = ct * sy;
	m[5] = y;
	m[6] = 0;
	m[7] = 0;
	m[8] = 1;
}
function mat3_compose(m, p, s, r)
{
	mat3_compose_f(m, p[0], p[1], s[0], s[1], r);
}

function get_normal_matrix(r, model)
{
	mat3_from_mat4(r, model);
    mat3_inverse(r, r);
    mat3_transposed(r, r);
}function Mat4()
{
	return new Float32Array([1,0,0,0,
							 0,1,0,0,
							 0,0,1,0,
							 0,0,0,1]);
}

var mat4_stack = new Stack(Mat4, 16);

function _Mat4()
{
	var r = mat4_stack.get();
	mat4_identity(r);
	return r;
}

function mat4_identity(m)
{
	m[ 0] = 1; m[ 1] = 0; m[ 2] = 0; m[ 3] = 0;
	m[ 4] = 0; m[ 5] = 1; m[ 6] = 0; m[ 7] = 0;
	m[ 8] = 0; m[ 9] = 0; m[10] = 1; m[11] = 0;
	m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
}

function mat4_mul(r, a,b)
{
	var t = _Mat4();
	t[ 0] = a[ 0] * b[0] + a[ 1] * b[4] + a[ 2] * b[ 8] + a[ 3] * b[12];
	t[ 1] = a[ 0] * b[1] + a[ 1] * b[5] + a[ 2] * b[ 9] + a[ 3] * b[13];
	t[ 2] = a[ 0] * b[2] + a[ 1] * b[6] + a[ 2] * b[10] + a[ 3] * b[14];
	t[ 3] = a[ 0] * b[3] + a[ 1] * b[7] + a[ 2] * b[11] + a[ 3] * b[15];
	t[ 4] = a[ 4] * b[0] + a[ 5] * b[4] + a[ 6] * b[ 8] + a[ 7] * b[12];
	t[ 5] = a[ 4] * b[1] + a[ 5] * b[5] + a[ 6] * b[ 9] + a[ 7] * b[13];
	t[ 6] = a[ 4] * b[2] + a[ 5] * b[6] + a[ 6] * b[10] + a[ 7] * b[14];
	t[ 7] = a[ 4] * b[3] + a[ 5] * b[7] + a[ 6] * b[11] + a[ 7] * b[15];	
	t[ 8] = a[ 8] * b[0] + a[ 9] * b[4] + a[10] * b[ 8] + a[11] * b[12];
	t[ 9] = a[ 8] * b[1] + a[ 9] * b[5] + a[10] * b[ 9] + a[11] * b[13];
	t[10] = a[ 8] * b[2] + a[ 9] * b[6] + a[10] * b[10] + a[11] * b[14];
	t[11] = a[ 8] * b[3] + a[ 9] * b[7] + a[10] * b[11] + a[11] * b[15];
	t[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[ 8] + a[15] * b[12];
	t[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[ 9] + a[15] * b[13];
	t[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
	t[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];
	vec_eq(r,t);

	mat4_stack.index--;
}

function mat4_determinant(m)
{
	var a0 = m[ 0] * m[ 5] - m[ 1] * m[ 4];
	var a1 = m[ 0] * m[ 6] - m[ 2] * m[ 4];
	var a2 = m[ 0] * m[ 7] - m[ 3] * m[ 4];
	var a3 = m[ 1] * m[ 6] - m[ 2] * m[ 5];
	var a4 = m[ 1] * m[ 7] - m[ 3] * m[ 5];
	var a5 = m[ 2] * m[ 7] - m[ 3] * m[ 6];
	var b0 = m[ 8] * m[13] - m[ 9] * m[12];
	var b1 = m[ 8] * m[14] - m[10] * m[12];
	var b2 = m[ 8] * m[15] - m[11] * m[12];
	var b3 = m[ 9] * m[14] - m[10] * m[13];
	var b4 = m[ 9] * m[15] - m[11] * m[13];
	var b5 = m[10] * m[15] - m[11] * m[14];
	return a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;
}

function mat4_transposed(r, m)
{
	var t = _Mat4();
	t[ 0] = m[ 0]
	t[ 1] = m[ 4]; 
	t[ 2] = m[ 8]; 
	t[ 3] = m[12];
	t[ 4] = m[ 1];
	t[ 5] = m[ 5];
	t[ 6] = m[ 9]; 
	t[ 7] = m[13];
	t[ 8] = m[ 2]; 
	t[ 9] = m[ 6];
	t[10] = m[10]; 
	t[11] = m[14];
	t[12] = m[ 3]; 
	t[13] = m[ 7]; 
	t[14] = m[11];
	t[15] = m[15];
	vec_eq(r,t);
	mat4_stack.index--; 	
}

function mat4_inverse(r, m)
{
	var v0 = m[ 2] * m[ 7] - m[ 6] * m[ 3];
	var v1 = m[ 2] * m[11] - m[10] * m[ 3];
	var v2 = m[ 2] * m[15] - m[14] * m[ 3];
	var v3 = m[ 6] * m[11] - m[10] * m[ 7];
	var v4 = m[ 6] * m[15] - m[14] * m[ 7];
	var v5 = m[10] * m[15] - m[14] * m[11];

	var t0 =   v5 * m[5] - v4 * m[9] + v3 * m[13];
	var t1 = -(v5 * m[1] - v2 * m[9] + v1 * m[13]);
	var t2 =   v4 * m[1] - v2 * m[5] + v0 * m[13];
	var t3 = -(v3 * m[1] - v1 * m[5] + v0 * m[ 9]);

	var idet = 1.0 / (t0 * m[0] + t1 * m[4] + t2 * m[8] + t3 * m[12]);

	r[0] = t0 * idet;
	r[1] = t1 * idet;
	r[2] = t2 * idet;
	r[3] = t3 * idet;

	r[4] = -(v5 * m[4] - v4 * m[8] + v3 * m[12]) * idet;
	r[5] =  (v5 * m[0] - v2 * m[8] + v1 * m[12]) * idet;
	r[6] = -(v4 * m[0] - v2 * m[4] + v0 * m[12]) * idet;
	r[7] =  (v3 * m[0] - v1 * m[4] + v0 * m[ 8]) * idet;

	v0 = m[1] * m[ 7] - m[ 5] * m[3];
	v1 = m[1] * m[11] - m[ 9] * m[3];
	v2 = m[1] * m[15] - m[13] * m[3];
	v3 = m[5] * m[11] - m[ 9] * m[7];
	v4 = m[5] * m[15] - m[13] * m[7];
	v5 = m[9] * m[15] - m[13] * m[11];

	r[ 8] =  (v5 * m[4] - v4 * m[8] + v3 * m[12]) * idet;
	r[ 9] = -(v5 * m[0] - v2 * m[8] + v1 * m[12]) * idet;
	r[10] =  (v4 * m[0] - v2 * m[4] + v0 * m[12]) * idet;
	r[11] = -(v3 * m[0] - v1 * m[4] + v0 * m[ 8]) * idet;

	v0 = m[ 6] * m[1] - m[ 2] * m[ 5];
	v1 = m[10] * m[1] - m[ 2] * m[ 9];
	v2 = m[14] * m[1] - m[ 2] * m[13];
	v3 = m[10] * m[5] - m[ 6] * m[ 9];
	v4 = m[14] * m[5] - m[ 6] * m[13];
	v5 = m[14] * m[9] - m[10] * m[13];

	r[12] = -(v5 * m[4] - v4 * m[8] + v3 * m[12]) * idet;
	r[13] =  (v5 * m[0] - v2 * m[8] + v1 * m[12]) * idet;
	r[14] = -(v4 * m[0] - v2 * m[4] + v0 * m[12]) * idet;
	r[15] =  (v3 * m[0] - v1 * m[4] + v0 * m[ 8]) * idet;
}

function mat4_inverse_affine(r, m)
{
	var t0 = m[10] * m[5] - m[ 6] * m[9];
	var t1 = m[ 2] * m[9] - m[10] * m[1];
	var t2 = m[ 6] * m[1] - m[ 2] * m[5];

	var idet = 1.0 / (m[0] * t0 + m[4] * t1 + m[8] * t2);

	var v0 = m[0] * idet;
	var v4 = m[4] * idet;
	var v8 = m[8] * idet;

	r[ 0] = t0 * idet; 
	r[ 1] = t1 * idet; 
	r[ 2] = t2 * idet;
	r[ 3] = 0;
	r[ 4] = v8 * m[ 6] - v4 * m[10];
	r[ 5] = v0 * m[10] - v8 * m[ 2];
	r[ 6] = v4 * m[ 2] - v0 * m[ 6];
	r[ 7] = 0;
	r[ 8] = v4 * m[9] - v8 * m[5];
	r[ 9] = v8 * m[1] - v0 * m[9];
	r[10] = v0 * m[5] - v4 * m[1];
	r[11] = 0;
	r[12] = -(r[0] * m[12] + r[4] * m[13] + r[ 8] * m[14]);
	r[13] = -(r[1] * m[12] + r[5] * m[13] + r[ 9] * m[14]);
	r[14] = -(r[2] * m[12] + r[6] * m[13] + r[10] * m[14]);		
	r[15] = 1;

	return r;
}

function mat4_translate(m,v)
{
	var t = _Mat4();
	vec_eq(t,m);

	m[12] = t[0] * v[0] + t[4] * v[1] + t[ 8] * v[2] + t[12];
    m[13] = t[1] * v[0] + t[5] * v[1] + t[ 9] * v[2] + t[13];
    m[14] = t[2] * v[0] + t[6] * v[1] + t[10] * v[2] + t[14];
    m[15] = t[3] * v[0] + t[7] * v[1] + t[11] * v[2] + t[15];

    mat4_stack.index--;
}

function mat4_set_position(m, p)
{
	m[12] = p[0]; 
	m[13] = p[1]; 
	m[14] = p[2];
}

function mat4_get_position(r, m)
{
	r[0] = m[12];
	r[1] = m[13];
	r[2] = m[14];
}

function mat4_set_scale(m, s)
{
	m[ 0] = s[0]; 
	m[ 5] = s[1]; 
	m[10] = s[2];
}

function mat4_scale(m, s)
{
	m[ 0] *= s[0]; 
	m[ 1] *= s[0]; 
	m[ 2] *= s[0];
	m[ 3] *= s[0];
	m[ 4] *= s[1];
	m[ 5] *= s[1];
	m[ 6] *= s[1];
	m[ 7] *= s[1];
	m[ 8] *= s[2];
	m[ 9] *= s[2];
	m[10] *= s[2];
	m[11] *= s[2];
}

function mat4_get_scale(r, m)
{
	r[0] = m[0];
	r[1] = m[5];
	r[2] = m[10];
}

function mat4_rotate_x(m, rad) 
{
	var t = _Mat4();
	vec_eq(t,m);

    var s = Math.sin(rad);
    var c = Math.cos(rad);

    m[ 4] = t[ 4] * c + t[ 8] * s;
    m[ 5] = t[ 5] * c + t[ 9] * s;
    m[ 6] = t[ 6] * c + t[10] * s;
    m[ 7] = t[ 7] * c + t[11] * s;
    m[ 8] = t[ 8] * c - t[ 4] * s;
    m[ 9] = t[ 9] * c - t[ 5] * s;
    m[10] = t[10] * c - t[ 6] * s;
    m[11] = t[11] * c - t[ 7] * s;

    mat4_stack.index--;

    return m;
}

function mat4_rotate_y(m, rad) 
{
	var t = _Mat4();
	vec_eq(t,m);

    var s = Math.sin(rad);
    var c = Math.cos(rad);

    m[ 0] = t[0] * c - t[ 8] * s;
    m[ 1] = t[1] * c - t[ 9] * s;
    m[ 2] = t[2] * c - t[10] * s;
    m[ 3] = t[3] * c - t[11] * s;
    m[ 8] = t[0] * s + t[ 8] * c;
    m[ 9] = t[1] * s + t[ 9] * c;
    m[10] = t[2] * s + t[10] * c;
    m[11] = t[3] * s + t[11] * c;

    mat4_stack.index--;

    return m;
}

function mat4_rotate_z(m, rad) 
{
	var t = _Mat4();
	vec_eq(t,m);

    var s = Math.sin(rad);
    var c = Math.cos(rad);
    
    m[0] = t[0] * c + t[4] * s;
    m[1] = t[1] * c + t[5] * s;
    m[2] = t[2] * c + t[6] * s;
    m[3] = t[3] * c + t[7] * s;
    m[4] = t[4] * c - t[0] * s;
    m[5] = t[5] * c - t[1] * s;
    m[6] = t[6] * c - t[2] * s;
    m[7] = t[7] * c - t[3] * s;

    mat4_stack.index--;

    return m;
}

function mat4_set_rotation(m, r)
{
	var x2 = 2 * r[0]; 
	var y2 = 2 * r[1]; 
	var z2 = 2 * r[2];
	var xx = r[0] * x2; 
	var xy = r[0] * y2; 
	var xz = r[0] * z2;
	var yy = r[1] * y2;
	var yz = r[1] * z2;
	var zz = r[2] * z2;
	var wx = r[3] * x2; 
	var wy = r[3] * y2;
	var wz = r[3] * z2;

	m[ 0] = 1 - (yy + zz);
	m[ 1] = xy + wz;
	m[ 2] = xz - wy;
	m[ 3] = 0;
	m[ 4] = xy - wz;
	m[ 5] = 1 - (xx + zz);
	m[ 6] = yz + wx;
	m[ 7] = 0;
	m[ 8] = xz + wy;
	m[ 9] = yz - wx;
	m[10] = 1 - (xx + yy);
	m[11] = 0;
	m[12] = 0;
	m[13] = 0;
	m[14] = 0;
	m[15] = 1;
}

function mat4_get_rotation(r, m)
{
	var t;
	if(m[10] < 0)
	{
		if(m[0] > m[5])
		{
			t = 1 + m[0] - m[5] - m[10];
			vec4_set(t, m[1] + m[4], m[8] + m[2], m[6] - m[9]);
		}
		else
		{
			t = 1 - m[0] + m[5] - m[10];
			vec4_set(m[1] + m[4], t, m[6] + m[9], m[8] - m[2]);
		}
	}
	else
	{
		if (m[0] < -m[5])
		{
			t = 1 - m[0] - m[5] + m[10];
			vec4_set(m[8] + m[2], m[6] + m[9], t, m[1] - m[4]);
		}
		else
		{
			t = 1 + m[0] + m[5] + m[10];
			vec4_set(m[6] - m[9], m[8] - m[2], m[1] - m[4], t);
		}
	}

	var rf = _Vec4();
	vec_mul_f(rf, r, 0.5);
	vec_div_f(r, rf, t);
}

function mat4_compose(m, p, s, r)
{
	mat4_set_rotation(m,r);
	mat4_scale(m,s);
	mat4_set_position(m,p);
}

function mat4_mul_point(r, m, p)
{
	var x = m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2] + m[12];
	var y = m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2] + m[13];
	var z = m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14];
	r[0] = x; r[1] = y; r[2] = z;
}

function mat4_mul_dir(r, m, p)
{
	var x = m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2];
	var y = m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2];
	var z = m[2] * p[0] + m[6] * p[1] + m[10] * p[2];
	r[0] = x; r[1] = y; r[2] = z;
}

function mat4_mul_projection(r, m, p)
{
	var d = 1 / (m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15]);
	var x = (m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2] + m[12]) * d;
	var y = (m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2] + m[13]) * d;
	var z = (m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]) * d;

	r[0] = x; r[1] = y; r[2] = z;
}function Curve(dimension, data)
{
	var r = {};
	r.data = data;
	r.dimension = dimension;
	r.stride = dimension * 3;
	return r;
}

function eval_time_curve(r, curve, t)
{
	var n = curve.dimension;
	var d = curve.data;
	var len = d.length;

	var t_start = d[n];
	var t_end = d[len-(n*2)];

	if(t < t_start) t = t_start;
	else if(t > t_end) t = t_end;

	//LOG(t_start);
	//LOG(t_end);

	for(var i = 0; i < len;)
	{
		var t_start = d[i+n];
		var t_end = d[i+(n*4)];
		if(t >= t_start && t <= t_end)
		{
			t = (t - t_start) / (t_end - t_start); 
			eval_curve(r, curve, t, i+n);
			return;
		}
		i += curve.stride;
	}
}

function eval_curve(r, curve, t, offset)
{
	var tt = t * t;
	var ttt = tt * t;

	var u = 1.0 - t;
	var uu = u * u;
	var uuu = uu * u;

	var n = curve.dimension;
	var d = curve.data;

	for(var i = 0; i < n; ++i)
	{
		var o = i + offset;
		r[i] = uuu * d[o] +
		   	   3 * uu * t * d[o+(n*1)] + 
		   	   3 * tt * u * d[o+(n*2)] + 
		   	   ttt * d[o+(n*3)];
	}
}

function eval_curve_f(curve, t)
{
	var r = _Vec3();
	eval_curve(r, curve, t, 0);
	vec3_stack.index--;
	return r[1];
}

function eval_curve_n(r, curve, t)
{
	var n = curve.dimension;
	var d = curve.data;
	var len = d.length;

	var t_start = d[n];
	var t_end = d[len-(n*2)];
	var tn = lerp(t_start, t_end, t);
	eval_time_curve(r, curve, tn);
}function perspective_projection(m, n,f,aspect,fov)
{
    mat4_identity(m);

    var h = 1.0 / Math.tan(fov * PI_OVER_360);
    var y = n - f;
    
    m[ 0] = h / aspect;
    m[ 5] = h;
    m[10] = (f + n) / y;
    m[11] = -1.0;
    m[14] = 2.0 * (n * f) / y;
    m[15] = 1.0;
}

function ortho_projection(m, w,h,n,f)
{
    mat4_identity(m);
    
    m[ 0] = 2.0 / w;
    m[ 5] = 2.0 / h;
    m[10] = -2.0 / (f - n);
    m[11] = -n / (f - n);
    m[15] = 1.0;
}

function cartesian_to_polar(r, c)
{
    var radius = vec_length(c);
    var theta = Math.atan2(c[1], c[0]);
    var phi = Math.acos(2 / radius);
    set_vec3(r, theta, phi, radius);
}

function polar_to_cartesian(r, a, b, radius)
{
    var ar = a * DEG2RAD;
    var br = b * DEG2RAD;

    var x = radius * Math.cos(br) * Math.cos(ar);
    var y = radius * Math.sin(br);
    var z = radius * Math.cos(br) * Math.sin(ar);
    set_vec3(r, x,y,z);
}

function polar_to_cartesian_v(r, v, radius)
{
    var ar = v[0] * DEG2RAD;
    var br = v[1] * DEG2RAD;

    var x = radius * Math.cos(br) * Math.cos(ar);
    var y = radius * Math.sin(br);
    var z = radius * Math.cos(br) * Math.sin(ar);
    set_vec3(r, x,y,z);
}

function lng_lat_to_cartesian(r, lng, lat, radius)
{
    polar_to_cartesian(r, -lng + 90, lat, radius);
}

function world_to_screen(r, projection, world, view)
{
    var wp = _Vec3(); 
    mat4_mul_projection(wp, projection, world);
    r[0] = ((wp[0] + 1.0) / 2.0) * view[2];// / app.res;
    r[1] = ((1.0 - wp[1]) / 2.0) * view[3];// / app.res;
    vec3_stack.index--;
}

function screen_to_view(r, point, view)
{
    r[0] = point[0] / view[2];
    r[1] = 1.0 - (point[1] / view[3]);
    r[2] = point[2];
}

function screen_to_world(r, projection, point, view)
{
    var t = _Vec3();
    t[0] =  2.0 * point[0] / view[2] - 1.0;
    t[1] = -2.0 * point[1] / view[3] + 1.0;
    t[2] = point[2];

    var inv = _Mat4();
    mat4_inverse(inv, projection);
    mat4_mul_point(r, inv, t);

    mat4_stack.index--;
    vec3_stack.index--;
}

function get_mouse_world_position(r, camera)
{
    var mp = _Vec3();
    vec_eq(mp, input.mouse.position);
    mp[0] *= app.res;
    mp[1] *= app.res;
    screen_to_world(r, camera.view_projection, mp, app.view);
}

function world_camera_rect(r, projection, view)
{
    var index = vec3_stack.index;

    var bl  = _Vec3();
    var tr  = _Vec3(view[2], view[3]);
    var blw = _Vec3();
    var trw = _Vec3();

    screen_to_world(blw, projection, bl, view);
    screen_to_world(trw, projection, tr, view);

    r[2] = trw[0] - blw[0];
    r[3] = trw[1] - blw[1];

    vec3_stack.index = index;
}function Shader(vs, fs)
{
    var s = {};
    s.id = null;
    s.attributes = {};
    s.uniforms = {};
    s.props = {};
    s.vertex_src = vs;
    s.fragment_src = fs;
    return s;
}

var MeshLayout = 
{
	TRIANGLES: 0,
	LINES: 1,
	STRIP: 2,
	POINTS: 3,
};

var BufferUpdateRate = 
{
	STATIC: 0,
	DYNAMIC: 1,
	STREAM: 2,
};

function VertexAttribute(size, norm)
{
	var r = {};
	r.size = size;
	r.normalized = norm || false;
	r.offset = 0;
	return r;
}

function PositionAttribute()
{
	return VertexAttribute(3, false);
}
function UVAttribute()
{
	return VertexAttribute(2, false);
}
function ColorAttribute()
{
	return VertexAttribute(4, true);
}

function VertexBuffer(data, attributes, rate)
{
	var r = {};
	r.id = null;
	r.data = data;
	r.stride = 0;
	for(var k in attributes)
	{
		var attr = attributes[k];
		attr.offset = r.stride;
		r.stride += attr.size;
	}
	r.attributes = attributes;

	r.offset = 0;
	//r.update_start = 0;
	r.count = 0;
	r.capacity = 0;
	r.update_rate = rate || BufferUpdateRate.STATIC;
	
	if(data)
	{
		r.count = (r.data.length / r.stride)|0;
		r.capacity = (r.data.length / r.stride)|0;
	}

	return r;
}

function alloc_vertex_buffer_memory(vb, count)
{
	vb.data = new Float32Array(count * vb.stride);
	vb.count = vb.data.length / vb.stride;
	vb.capacity = vb.data.length / vb.stride;
}

function resize_vertex_buffer(vb, count, copy)
{
	if(vb === null) alloc_vertex_buffer_memory(vb, count);
	else
	{
		ASSERT((vb.data.length / vb.stride) !== vertex_count, 'Buffer already correct size');

		var new_buffer = new Float32Array(vb.stride * count);
		if(copy) new_buffer.set(vb.data);
		vb.data = new_buffer;
		vb.count = vb.data.length / vb.stride;
		vb.capacity = vb.data.length / vb.stride;
	}
}

function copy_vertex_attribute(r, vb, attr, index)
{
	var n = vb.attributes[attr].size;
	var start = index * vb.stride;
	var end = start + n;
	for(var i = start; i < end; ++i) r[i] = vb.data[i];
}

function zero_buffer(b)
{
	var n = b.length;
	for(var i = 0; i < n; ++i) b[i] = 0;
}

function clear_mesh_buffers(mesh)
{
	mesh.vertex_buffer.offset = 0;
	zero_buffer(mesh.vertex_buffer.data);

	if(mesh.index_buffer !== null)
	{
		mesh.index_buffer.offset = 0;
		mesh.index_buffer.triangle_offset = 0;
		zero_buffer(mesh.index_buffer.data);
	}
}

function IndexBuffer(data, rate)
{
	var r = {};
	r.id = null;
	r.data = data;
	r.count = 0;
	r.offset = 0;
	r.triangle_offset = 0;
	if(data) r.count = r.data.length;
	r.update_rate = rate || BufferUpdateRate.STATIC;
	return r;
}
function alloc_index_buffer_memory(ib, count)
{
	ib.data = new Uint32Array(count);
	ib.count = count;
}

function resize_index_buffer(ib, count, copy)
{
	if(ib === null) alloc_index_buffer_memory(ib, count);
	else
	{
		var new_buffer = new Uint32Array(count);
		if(copy) new_buffer.set(ib.data);
		ib.data = new_buffer;
		ib.count = ib.data.length;
	}
}


function InstanceBuffer(count, attrs)
{
	var r = {};
	for(var a in attrs)
	{
		var attr = attrs[a];
		var buffer = {};
		buffer.id = null;
		buffer.data = new Float32Array(count * attr.size);
		buffer.stride = attr.size;
		buffer.count = count;
		buffer.normalized = attr.normalized;
		r[a] = buffer;
	}
	bind_instance_buffers(r);

	return r;
}

function Mesh(vb, ib, layout)
{
	var r = {};
	r.vertex_buffer = vb;
	r.index_buffer = ib;
	r.layout = layout || MeshLayout.TRIANGLES;
	return r;
}

function recalculate_normals(mesh)
{
	
}/*
Desktop:
BC1(DXT1) - opaque
BC3(DXT5) - transparent
iOS:
PVR2, PVR4 - opaque or transparent
Android:
ETC1 - opaque
ASTC_4x4, ASTC8x8 - transparent
*/

var TextureFormat = 
{
	RGB: 0,
	RGBA: 1,
	DEPTH: 2,
	GRAYSCALE: 3,

	RGB_PVRTC_2BPPV1: 4,
	RGBA_PVRTC_2BPPV1: 5,
	RGB_PVRTC_4BPPV1: 6,
	RGBA_PVRTC_4BPPV1: 7,

	RGB_S3TC_DXT1: 8,
	RGBA_S3TC_DXT1: 9,
	RGBA_S3TC_DXT3: 10,
	RGBA_S3TC_DXT5: 11,
	RGB_ETC1: 12,
};

function Sampler(s,t,up,down,anisotropy)
{
	var r = {};
	r.s = s;
	r.t = t;
	r.up = up;
	r.down = down;
	r.anisotropy = anisotropy;
	return r;
}

function default_sampler()
{
	return Sampler(GL.CLAMP_TO_EDGE, GL.CLAMP_TO_EDGE, GL.LINEAR, GL.LINEAR, 1);
}

function repeat_sampler()
{
	return Sampler(GL.REPEAT, GL.REPEAT, GL.LINEAR, GL.LINEAR, 1);
}

function Mipmap(width, height, data)
{
	var r = {};
	r.width = width;
	r.height = height;
	r.data = data;
	return r;
}

function Texture(width, height, data, sampler, format, bytes_per_pixel)
{
	var t = {};
	t.id = null;
	t.data = data;
	t.format = format;
	t.width = width;
	t.height = height;
	t.bytes_per_pixel = bytes_per_pixel;
	t.compressed = false;
	t.from_element = false;
	t.sampler = sampler;
	t.flip = false;
	t.num_mipmaps = 1;
	t.cubemap = false;
	t.loaded = false;
	t.gl_releasable = false;
	return t;
}

function empty_texture(sampler, format)
{
	format = format || TextureFormat.RGBA;
	sampler = sampler || app.sampler;
	return Texture(0, 0, null, sampler, format, 4);
}

function texture_from_dom(img, sampler, format, flip)
{
	format = format || TextureFormat.RGBA;
	var t = Texture(img.width, img.height, img, sampler, format, 4);
	t.from_element = true;
	t.flip = flip || false;
	return t;
}

function load_texture_group(base_path, urls)
{
	var path = '';
	for(var u in urls)
	{
		if(base_path) path = base_path + urls[u];
		load_texture_async(path);
	}
}

function load_texture_async(url, ag, compressed)
{
	var t = empty_texture();
	//t.loaded = false;
	t.from_element = true;
	t.flip = true;
	t.compressed = compressed || false;

	var img = new Image();
    img.onload = function(e)
    {
    	t.width = img.width;
    	t.height = img.height;
    	t.data = img;
    	//t.loaded = true;

    	ag.load_count--;
    	update_load_progress(ag);
    }
	img.src = url;
	return t;
}

function load_video_async(url, width, height, sampler, format, mute, autoplay)
{
	var t = empty_texture(sampler, format);
	t.from_element = true;
	t.flip = false;

    var video = document.createElement('video');
    video.setAttribute('width', width);
    video.setAttribute('height', height);
    video.style.display = 'none';
    video.preload = 'auto';
    if(mute) video.muted = 'true';
    document.body.append(video); //shuts warnings up

	var name = url.match(/[^\\/]+$/)[0];
	name = name.split(".")[0];
    app.assets.textures[name] = t;

    video.addEventListener('canplaythrough', function()
    {
        t.width = video.width;
        t.height = video.height;
        t.data = video;
        t.loaded = true;
        bind_texture(t);
        update_texture(t);
    });
    
    video.src = url;
    if(autoplay) video.play();
    return t;
}

function rgba_texture(width, height, pixels, sampler)
{
	var t = Texture(width, height, pixels, sampler, TextureFormat.RGBA, 4);
	bind_texture(t);
	update_texture(t);
	return t;
}
function depth_texture(width, height, sampler)
{
	var t = Texture(width, height, null, sampler, TextureFormat.DEPTH, 8);
	bind_texture(t);
	update_texture(t);
	return t;
}

function resize_texture(t, w, h)
{
	t.width = w;
	t.height = h;
	update_texture(t);
}

/*
function read_texture(type, ag)
{
    var name = read_string();
    var width = read_i32();
    var height = read_i32();
    var format = read_i32();
    var num_bytes = read_f64();
    var bytes = read_bytes(num_bytes);
    var encoding = 'data:image/' + type + ';base64,';

    var img = new Image();
    img.src = encoding + uint8_to_base64(bytes);

    var t = Texture(width, height, img, app.sampler, format, 4);
    
	t.from_element = true;
	t.use_mipmaps = false;
	t.flip = true;
	
	if(ag) ag.textures[name] = t;
    return t;
}
*/function read_pvr(ag) 
{
	var file_size = read_i32();
	var name = read_string();
	var header = read_u32(13);
	var reader_offset = get_reader_offset();

	var PVR_V3 = 0x03525650;
	var PVR_V2 = 0x21525650;
	var bpp;
	var format;
	var pixel_format;
	var height;
	var width;
	var num_surfs;
	var num_mipmaps;
	var data_offset;

	if(header[0] === PVR_V3) 
	{
		pixel_format = header[2];
		height = header[6];
		width = header[7];
		num_surfs = header[9];
		num_mipmaps = header[11];

		switch(pixel_format) 
		{
			case 0:
				bpp = 2;
				format = TextureFormat.RGB_PVRTC_2BPPV1;
			break;
			case 1:
				bpp = 2;
				format = TextureFormat.RGBA_PVRTC_2BPPV1;
			break;
			case 2:
				bpp = 4;
				format = TextureFormat.RGB_PVRTC_4BPPV1;
			break;
			case 3:
				bpp = 4;
				format = TextureFormat.RGBA_PVRTC_4BPPV1;
			break;
			default:
				console.error('Unsupported PVR format:', pixel_format);
		}

		data_offset = 52 + header[12];
	}
	else if(header[11] === PVR_V2) 
	{
		var flags = header[4];
		height = header[1];
		width = header[2];
		num_mipmaps = header[3];
		bpp = header[6];
		num_surfs = header[12];

		var PVRTC_2 = 24;
		var PVRTC_4 = 25;
		var format_flags = flags & 0xff;;

		var has_alpha = header[10] > 0;
		if(format_flags === PVRTC_4) 
		{
			bpp = 4;
			if(has_alpha) format = TextureFormat.RGBA_PVRTC_4BPPV1;
			else format = TextureFormat.RGB_PVRTC_4BPPV1;
		} 
		else if(format_flags === PVRTC_2) 
		{
			bpp = 2;
			if(has_alpha) format = TextureFormat.RGBA_PVRTC_2BPPV1;
			else format = TextureFormat.RGB_PVRTC_2BPPV1;
		}
		else console.error('Unknown PVRTC format');
		
		data_offset = header[0];
	}
	else console.error('Unknown PVR format');
	
	var data_size = 0;
	var block_width = 4;
	var block_height = 4;
	var width_blocks = 0;
	var height_blocks = 0;

	if(bpp === 2) block_width = 8;
	var block_size = (block_width * block_height) * bpp / 8;

	var mipmaps = new Array(num_mipmaps * num_surfs);
	var mip_level = 0;
	while(mip_level < num_mipmaps) 
	{
		var s_width = width >> mip_level;
		var s_height = height >> mip_level;
		var width_blocks = s_width / block_width;
		var height_blocks = s_height / block_height;

		if(width_blocks < 2) width_blocks = 2;
		if(height_blocks < 2) height_blocks = 2;

		data_size = width_blocks * height_blocks * block_size;
		for(var i = 0; i < num_surfs; ++i) 
		{
			reader_seek(reader_offset + data_offset);
			var data = read_bytes(data_size);
			var index = i * num_mipmaps + mip_level;
			mipmaps[index] = Mipmap(s_width, s_height, data);
			data_offset += data_size;
		}

		mip_level ++;
	}

	var sampler = default_sampler();
	var t = Texture(width, height, mipmaps, sampler, format, bpp);
	t.num_mipmaps = mipmap_count;
	t.compressed = true;
	ag.textures[name] = t;

	reader_seek(reader_offset + file_size);
};function read_dds(ag) 
{
	function four_CC_to_int32(v) 
	{
		return v.charCodeAt(0) + (v.charCodeAt(1) << 8) + (v.charCodeAt(2) << 16) + (v.charCodeAt(3) << 24); 
	}

	var file_size = read_i32();
	var name = read_string();
	var reader_offset = get_reader_offset();

	var header = read_i32(31);
	if(header[0] !== 0x20534444) console.error(' Invalid magic number in DDS header');
	if(!header[20] & 0x4) console.error('Unsupported format, must contain a FourCC code');
	
	var format;
	var bpp;
	var four_CC = header[21];

	var is_RGBA_uncompressed = false;
	switch(four_CC) 
	{
		case four_CC_to_int32("DXT1"):
			bpp = 8;
			format = TextureFormat.RGB_S3TC_DXT1;
		break;
		case four_CC_to_int32("DXT3"):
			bpp = 16;
			format = TextureFormat.RGBA_S3TC_DXT3;
		break;
		case four_CC_to_int32("DXT5"):
			bpp = 16;
			format = TextureFormat.RGBA_S3TC_DXT5;
		break;
		case four_CC_to_int32("ETC1"):
			bpp = 8;
			format = TextureFormat.RGB_ETC1;
		break;
		default:
			console.error('Unsupported DDS format');
		break;
	}

	var height = header[3];
	var width = header[4];
	var data;
	var data_size = 0;
	var data_offset = header[1] + 4;

	var mipmap_count = 1;
	if(header[2] & 0x20000) mipmap_count = Math.max(1, header[7]);
	var mipmaps = new Array(mipmap_count);
	
	var is_cubemap = false;
	var caps2 = header[28];
	if(caps2 & 0x200) is_cubemap = true;
	if(is_cubemap && (
		!(caps2 & 0x400) || !(caps2 & 0x800) || !(caps2 & 0x1000) || 
		!(caps2 & 0x2000) || !(caps2 & 0x4000) || !(caps2 & 0x8000)))
	{
		console.error('Incomplete cubemap faces');
	}

	var faces = 1;
	if(is_cubemap) faces = 6;
	for(var face = 0; face < faces; face++) 
	{
		var s_width = width;
		var s_height = height;
		for(var i = 0; i < mipmap_count; ++i) 
		{
			if(is_RGBA_uncompressed) data_size = s_width * s_height * 4;
			else data_size = Math.max(4, s_width) / 4 * Math.max(4, s_height) / 4 * bpp;
			
			reader_seek(reader_offset + data_offset);
			data = read_bytes(data_size)
			mipmaps[i] = Mipmap(s_width, s_height, data);

			data_offset += data_size;
			s_width = Math.max(s_width >> 1, 1);
			s_height = Math.max(s_height >> 1, 1);
		}
	}

	var sampler = default_sampler();
	var t = Texture(width, height, mipmaps, sampler, format, bpp);
	t.num_mipmaps = mipmap_count;
	t.compressed = true;
	t.flip = true;
	ag.textures[name] = t;

	reader_seek(reader_offset + file_size);
};var _ENTITY_COUNT = 0;

var Entity_Type = 
{
	EMPTY: 0,
	CAMERA: 1,
	OBJECT: 2,
	LAMP: 3,
	TEXT: 4,
};

function Entity(x,y,z, parent, draw_info)
{
	var e = {};
	e.name;
	e.entity_type = Entity_Type.EMPTY;
	e.id = _ENTITY_COUNT;
	_ENTITY_COUNT++;
	e.parent = null;
	e.children = [];
	e.active = true;
	e.dirty = true;
	e.position = Vec3(x,y,z);
	e.world_position = Vec3();
	e.scale = Vec3(1,1,1);
	e.rotation = Vec4(0,0,0,1);
	e.local_matrix = Mat4();
	e.world_matrix = Mat4();
	e.draw_info = draw_info ||
	{
		material: null,
		mesh: null,
		instance_mesh: null,
		instance_count: 0,
		transparent: false,
	};
	if(parent) set_parent(e, parent);
	return e;
}

function set_mvp(m, entity, camera)
{
	mat4_mul(m, entity.world_matrix, camera.view_projection);
}

function set_normal_matrix(m, entity, camera)
{
	var m4 = mat4_stack.index;

	var model_view = _Mat4();
    mat4_mul(model_view, entity.world_matrix, camera.view_matrix);

    var inv_model_view = _Mat4();
    mat4_inverse(inv_model_view, model_view);
    mat4_transposed(inv_model_view, inv_model_view);

    mat3_from_mat4(m, inv_model_view);

    mat4_stack.index = m4;
}

function set_active(e, val)
{
	e.active = val;
	var n = e.children.length;
	for(var i = 0; i < n; ++i) entity_set_active(e.children[i], val);
}
function set_parent(e, parent)
{
	if(e.parent === parent) return;
	if(e.parent !== null && parent === null) // clearing parent
	{
		parent.children.splice(parent.children.indexOf(e, 0), 1);
		e.parent = null;
	}
	else if(e.parent !== null && parent !== null) // swapping parent
	{
		e.parent.children.splice(e.parent.children.indexOf(e, 0), 1);
		e.parent = parent;
		parent.children.push(e);
	}
	else // setting new parent from null
	{
		e.parent = parent;
		parent.children.push(e);
	}
}

function get_position(r, e)
{
    mat4_get_position(r, e.world_matrix);
}
function get_scale(r, e)
{
    mat4_get_scale(r, e.world_matrix);
}
function get_rotation(r, e)
{
	mat4_get_rotation(r, e.world_matrix);
}

function rotate_entity(e, v)
{
	var rotation = _Vec4();
	quat_set_euler(rotation,v);
	quat_mul(e.rotation, rotation, e.rotation);
}

function update_entity(e)
{
	mat4_compose(e.local_matrix, e.position, e.scale, e.rotation);

	if(e.parent === null) vec_eq(e.world_matrix, e.local_matrix);
	else mat4_mul(e.world_matrix, e.local_matrix, e.parent.world_matrix);

	var n = e.children.length;
	for(var i = 0; i < n; ++i)
	{
		var index = mat4_stack.index;
		update_entity(e.children[i], true);
		mat4_stack.index = index;
	}

	e.dirty = false;
}function Camera(near, far, fov, view, ortho, ortho_size)
{
	var c = Entity(0,0,0);
	c.entity_type = Entity_Type.CAMERA;
	c.projection = Mat4();
	c.view_matrix = Mat4();
	c.view_projection = Mat4();
	c.view = view;
	c.mask = 0;
	c.aspect = view[2] / view[3];
	c.near = near;
	c.far = far;
	c.fov = fov;
	c.size = ortho_size || 1.0;
	c.ortho = ortho || false
	//update_camera_projection(c, view);
	return c;
}
function Perspective_Camera(view)
{
	return Camera(0.01,100,60,view,false,1.0);
}

function UI_Camera(view)
{
	var c = Camera(0.01,1,60, view, true, view[3]);
    set_vec3(c.position, view[2] / 2, view[3] / 2, 0);
    update_camera(c);
    return c;
}

function update_camera_projection(c, view)
{
	c.view = view;
	c.aspect = view[2] / view[3];
	if(c.ortho)
	{
		c.size = view[3];
		ortho_projection(c.projection, c.size * c.aspect,c.size,c.near,c.far);
	}
	else
	{
		perspective_projection(c.projection, c.near, c.far, c.aspect, c.fov);
	}
}

function update_camera(c)
{
	update_entity(c, true);
	mat4_inverse_affine(c.view_matrix, c.world_matrix);
	mat4_mul(c.view_projection, c.view_matrix, c.projection);
}function free_look(c, dt, vertical_limit)
{
	if(c.fly_mode === undefined) 
	{
		c.fly_mode = false;
		c.angle = Vec3();
		c.velocity = Vec3();
	}
	
	if(key_down(Keys.F)) c.fly_mode = !c.fly_mode;
	if(c.fly_mode === false) return;

	var v3_index = vec3_stack.index;
	var v4_index = vec4_stack.index;

	var ROTATE_SPEED = 3.0;

	c.angle[0] -= input.mouse.delta[1] * ROTATE_SPEED * dt;
	c.angle[1] -= input.mouse.delta[0] * ROTATE_SPEED * dt;
	
	if(c.angle[0] >  vertical_limit) c.angle[0] = vertical_limit;
	if(c.angle[0] < -vertical_limit) c.angle[0] = -vertical_limit;

	if(key_down(Keys.R))
	{
		c.angle[0] = 0;
		c.angle[1] = 0;
	}
	if(key_down(Keys.P))
	{
		LOG(c.angle)
		LOG(c.position)
	}

	var rot_x = _Vec4(0,0,0,1);
	var rot_y = _Vec4(0,0,0,1);
	var rot_lerp = _Vec4(0,0,0,1);

	var right = _Vec3(1,0,0);
	var up = _Vec3(0,1,0);

	quat_set_angle_axis(rot_x, c.angle[0], right);
	quat_set_angle_axis(rot_y, c.angle[1], up);

	quat_mul(rot_lerp, rot_y, rot_x);
	vec_lerp(c.rotation, c.rotation, rot_lerp, 0.1);

	var accel = _Vec3();
	var MOVE_SPEED = 0.5;
	if(key_held(Keys.SHIFT)) MOVE_SPEED *= 2;

	if(key_held(Keys.A)) accel[0] = -MOVE_SPEED * dt;
	else if(key_held(Keys.D)) accel[0] = MOVE_SPEED * dt;
	
	if(key_held(Keys.W)) accel[2] = -MOVE_SPEED * dt;
	else if(key_held(Keys.S)) accel[2] = MOVE_SPEED * dt;

	if(key_held(Keys.Q)) accel[1] = -MOVE_SPEED * dt;
	else if(key_held(Keys.E)) accel[1] = MOVE_SPEED * dt;

	mat4_mul_dir(accel, c.world_matrix, accel);

	vec_add(c.velocity, accel, c.velocity);
	vec_mul_f(c.velocity, c.velocity, 0.9);

	vec_add(c.position, c.velocity, c.position);
	c.dirty = true;

	vec3_stack.index = v3_index;
	vec4_stack.index = v4_index;
}function Canvas(container)
{
	var canvas = document.createElement('canvas');
    resize_canvas(canvas, container);
    container.appendChild(canvas);
    return canvas;
}

function resize_canvas(canvas, container)
{
    var container_width = container.clientWidth;
    var container_height = container.clientHeight;

    var width = container_width * app.res;
    var height = container_height * app.res;

    canvas.width = width;
    canvas.height = height;

    // SCALES TO DEVICE PIXEL RATIO
    
    var dw = -((width - container_width) / 2);
    var dh = -((height - container_height) / 2);
    canvas.style.transform = 'translateX(' + dw +'px) translateY('+dh+'px) scale(' + (1/app.res) + ')';
}function GLState()
{
	var r = {};

	r.shader = null;
	r.render_buffer = null;
	r.frame_buffer = null;
	r.array_buffer = null;
	r.index_buffer = null;
	r.texture = null;

	r.blending = null;
	r.blend_mode = null;
	r.depth_testing = null;
	r.depth_write = null;
	r.depth_mode = null;
	r.depth_min = null;
	r.depth_max = null;

	r.scissor = null;
	r.culling = null;
	r.winding_order = null;
	r.line_width = null;
	r.dither = null;

	return r;
}

var DepthMode =
{
	DEFAULT: 0,
	NEVER: 1,
	LESS: 2,
	LESS_OR_EQUAL: 3,
	EQUAL: 4,
	GREATER: 5,
	NOT_EQUAL: 6,
	GREATER_OR_EQUAL: 7,
	ALWAYS: 8,
};

var BlendMode =
{
	DEFAULT: 0,
	NONE: 1,
	DARKEN: 2,
	LIGHTEN: 3,
	DIFFERENCE: 4,
	MULTIPLY: 5,
	SCREEN: 6,
	INVERT: 7,
};


var GL = null;
function WebGL(canvas, options)
{
    GL = canvas.getContext('webgl', options) ||
    	 canvas.getContext('experimental-webgl', options);

   	GL.extensions = {};
    var supported_extensions = GL.getSupportedExtensions();
	for(var i = 0; i < supported_extensions.length; ++i)
	{
		var ext = supported_extensions[i];
		if(ext.indexOf('MOZ') === 0) continue;
	    GL.extensions[ext] = GL.getExtension(ext);
	}

    GL._parameters = {};
	GL._parameters.num_texture_units = GL.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS);

	GL._parameters.max_anisotropy = null;
	var anisotropic = GL.extensions.EXT_texture_filter_anisotropic;
	if(anisotropic !== undefined)
	{
		GL._parameters.max_anisotropy = GL.getParameter(anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
	}

	GL._state = GLState();
	reset_webgl_state();

	return GL;
}

function reset_webgl_state()
{
	var n = GL._parameters.num_texture_units;
	for(var i = 0; i < n; ++i)
	{
		GL.activeTexture(GL.TEXTURE0 + i);
		GL.bindTexture(GL.TEXTURE_2D, null);
		GL.bindTexture(GL.TEXTURE_CUBE_MAP, null);
	}

	set_render_target(null);

	enable_backface_culling();
	enable_scissor_testing();
	GL.cullFace(GL.BACK);
	GL.frontFace(GL.CCW);

	enable_depth_testing(GL.LEQUAL);
	set_blend_mode(BlendMode.DEFAULT);
}


function set_viewport(rect)
{
	GL.viewport(rect[0], rect[1], rect[2], rect[3]);
	GL.scissor(rect[0], rect[1], rect[2], rect[3]);
}

function set_clear_color(c)
{
	GL.clearColor(c[0],c[1],c[2],c[3]);
}
function set_clear_color_f(r,g,b,a)
{
	GL.clearColor(r,g,b,a);
}

function clear_screen(mode)
{
	mode = mode || (GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
	GL.clear(mode);
}

function enable_dithering()
{
	if(GL._state.dither === true) return;
	GL._state.dither = true;

	GL.enable(GL.DITHER);
}
function disable_dithering()
{
	if(GL._state.dither === false) return;
	GL._state.dither = false;

	GL.disable(GL.DITHER);
}

function enable_backface_culling()
{
	if(GL._state.culling === true) return;
	GL._state.culling = true;

	GL.enable(GL.CULL_FACE);
}
function disable_backface_culling()
{
	if(GL._state.culling === false) return;
	GL._state.culling = false;

	GL.disable(GL.CULL_FACE);
}

function enable_depth_testing(mode)
{
	if(GL._state.depth_testing === true) return;
	GL._state.depth_testing = true;

	GL.enable(GL.DEPTH_TEST);
	if(mode) GL.depthFunc(mode);
}

function disable_depth_testing()
{
	if(GL._state.depth_testing === false) return;
	GL._state.depth_testing = false;

	GL.disable(GL.DEPTH_TEST);
}

function enable_scissor_testing()
{
	if(GL._state.scissor_testing === true) return;
	GL._state.scissor_testing = true;

	GL.enable(GL.SCISSOR_TEST);
}

function disable_scissor_testing()
{
	if(GL._state.scissor_testing === false) return;
	GL._state.scissor_testing = false;

	GL.disable(GL.SCISSOR_TEST);
}

function enable_stencil_testing()
{
	if(GL._state.stencil_testing === true) return;
	GL._state.stencil_testing = true;
	GL.enable(GL.STENCIL_TEST);
}

function disable_stencil_testing()
{
	if(GL._state.stencil_testing === false) return;
	GL._state.stencil_testing = false;
	GL.disable(GL.STENCIL_TEST);
}

function enable_alpha_blending()
{
	if(GL._state.blending === true) return;
	GL._state.blending = true;
	GL.enable(GL.BLEND);
}

function disable_alpha_blending()
{
	if(GL._state.blending === false) return;
	GL._state.blending = false;
	GL.disable(GL.BLEND);
}

function set_depth_range(min, max)
{
	var state = GL._state;
	if(state.depth_min === min && state.depth_max === max) return;
	state.depth_min = min;
	state.depth_max = max;

	GL.depthRange(min, max);
}

function set_line_width(val)
{
	if(GL._state.line_width === val) return;
	GL._state.line_width = val;

	GL.lineWidth(val);
}

function set_texture(texture)
{
	var id = texture.id;
	//if(GL._state.texture === id) return;
	//GL._state.texture = id;
	GL.bindTexture(GL.TEXTURE_2D, id);
}

function set_array_buffer(buffer)
{
	if(buffer === GL._state.array_buffer) return;

	if(buffer === null)
	{
		GL.bindBuffer(GL.ARRAY_BUFFER, null);
		GL._state.array_buffer = null;
	}
	else
	{
		GL.bindBuffer(GL.ARRAY_BUFFER, buffer.id);
		GL._state.array_buffer = buffer.id;
	}
}

function set_index_buffer(buffer)
{
	if(buffer === GL._state.index_buffer) return;

	if(buffer === null)
	{
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
		GL._state.array_buffer = null;
	}
	else
	{
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, buffer.id);
		GL._state.array_buffer = buffer.id;
	}
}

function set_shader(shader)
{
	if(GL._state.shader === shader) return;
	GL._state.shader = shader;
    GL.useProgram(shader.id);
}

function set_render_target(target)
{
	var rb = null;
	var fb = null;

	if(target)
	{
		rb = target.render_buffer || null;
		fb = target.frame_buffer || null;
	}

	if(GL._state.frame_buffer !== fb)
	{
		GL.bindFramebuffer(GL.FRAMEBUFFER, fb);
	}

	if(GL._state.render_buffer !== rb)
	{
		GL.bindRenderbuffer(GL.RENDERBUFFER, rb);
	}

	GL._state.render_buffer = rb;
	GL._state.frame_buffer = fb;
}

function convert_update_rate(type)
{
	switch(type)
	{
		case BufferUpdateRate.STATIC:  return GL.STATIC_DRAW;
		case BufferUpdateRate.DYNAMIC: return GL.DYNAMIC_DRAW;
		case BufferUpdateRate.STREAM:  return GL.STREAM_DRAW;
		default: console.error('Invalid update rate');
	}
}
function convert_mesh_layout(type)
{
	switch(type)
	{
		case MeshLayout.TRIANGLES: return GL.TRIANGLES;
		case MeshLayout.LINES: 	   return GL.LINES;
		case MeshLayout.STRIP:	   return GL.TRIANGLE_STRIP;
		case MeshLayout.POINTS:     return GL.POINTS;

		default: console.error('Invalid mesh layout');
	}
}

function bind_mesh(mesh)
{
	if(mesh.vertex_buffer.id === null)
	{
		mesh.vertex_buffer.id = GL.createBuffer();
	}
	if(mesh.index_buffer !== null && mesh.index_buffer.id === null)
	{
		mesh.index_buffer.id = GL.createBuffer();
	}
}
/*
function unbind_mesh(mesh)
{
	var vb = mesh.vertex_buffer;
	var ib = mesh.index_buffer;

	set_array_buffer(vb);
	GL.bufferData(GL.ARRAY_BUFFER, 1, GL.STATIC_DRAW);
	GL.deleteBuffer(vb.id);

	if(ib !== null)
	{
		set_index_buffer(ib);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, 1, GL.STATIC_DRAW);
		GL.deleteBuffer(mesh.index_buffer.id);
	}

	vb.id = null;
	ib.id = null;
	set_array_buffer(null);
	set_index_buffer(null);
}
*/

function update_mesh(mesh)
{
	var vb = mesh.vertex_buffer;
	var ib = mesh.index_buffer;

	set_array_buffer(vb);
	GL.bufferData(GL.ARRAY_BUFFER, vb.data, convert_update_rate(vb.update_rate));
	set_array_buffer(null);

	if(ib !== null)
	{
		ib.byte_size = GL.UNSIGNED_INT;
		set_index_buffer(ib);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, ib.data, convert_update_rate(ib.update_rate));
		set_index_buffer(null);
	}
}

function update_mesh_range(mesh, start, end)
{
	var vb = mesh.vertex_buffer;
	//var start = vb.update_start * vb.stride;
	var view = vb.data.subarray(start, end);

	set_array_buffer(vb);
	GL.bufferSubData(GL.ARRAY_BUFFER, start * 4, view);
	set_array_buffer(null);
}


function convert_texture_size(t)
{
	/*
	GL.UNSIGNED_BYTE;
	GL.UNSIGNED_SHORT;
	GL.UNSIGNED_SHORT_4_4_4_4;
	GL.UNSIGNED_SHORT_5_5_5_1;
	GL.UNSIGNED_SHORT_5_6_5;
	GL.UNSIGNED_INT;
	*/

	switch(t.bytes_per_pixel)
	{
		case 4: return GL.UNSIGNED_BYTE;
		case 8: return GL.UNSIGNED_SHORT;
		case 16: return GL.UNSIGNED_INT;
		default: console.error('Invalid texture size');
	}
}
function convert_texture_format(format)
{
	//var bptc = GL.extensions.EXT_texture_compression_bptc;
	//var astc = GL.extensions.WEBGL_compressed_texture_astc;
	//var etc = GL.extensions.WEBGL_compressed_texture_etc;
	var dds = GL.extensions.WEBGL_compressed_texture_s3tc;
	var pvr = GL.extensions.WEBGL_compressed_texture_pvrtc; 

	switch(format)
	{
		// UNCOMPRESSED
		case TextureFormat.RGB: return GL.RGB;
		case TextureFormat.RGBA: return GL.RGBA;
		case TextureFormat.DEPTH: return GL.DEPTH_COMPONENT;
		case TextureFormat.GRAYSCALE: return GL.LUMINANCE;

		// PVR
		/*
		case TextureFormat.RGB_PVRTC_2BPPV1: 
		return pvr.;

		case TextureFormat.RGBA_PVRTC_2BPPV1: 
		return pvr.;

		case TextureFormat.RGB_PVRTC_4BPPV1: 
		return pvr.;

		case TextureFormat.RGBA_PVRTC_4BPPV1:
		return pvr.;
		*/

		// DDS
		case TextureFormat.RGB_S3TC_DXT1: return dds.COMPRESSED_RGB_S3TC_DXT1_EXT;
		case TextureFormat.RGBA_S3TC_DXT1: return dds.COMPRESSED_RGBA_S3TC_DXT1_EXT;
		case TextureFormat.RGBA_S3TC_DXT3: return dds.COMPRESSED_RGBA_S3TC_DXT3_EXT;
		case TextureFormat.RGBA_S3TC_DXT5: return dds.COMPRESSED_RGBA_S3TC_DXT5_EXT;

		//ETC
		case TextureFormat.RGB_ETC1: return GL.RGBA;

		//ASTC

		default: console.error('Invalid texture format');
	}
}

function bind_texture(texture)
{
	if(texture.id === null) texture.id = GL.createTexture();
}

function unbind_texture(texture)
{
	GL.deleteTexture(texture.id);
	texture.id = null;
}

function update_texture(t)
{
	set_texture(t);
	var size = convert_texture_size(t);
	var format = convert_texture_format(t.format);

	if(t.flip === true)
	{
		GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
	}

	if(t.compressed === true)
	{
		for(var i = 0; i < t.num_mipmaps; ++i)
		{
			var mm = t.data[i];
			GL.compressedTexImage2D(GL.TEXTURE_2D, i, format, mm.width, mm.height, 0, mm.data);
		}
	}
	else if(t.from_element === true)
	{
		GL.texImage2D(GL.TEXTURE_2D, 0, format, format, size, t.data);
		if(t.num_mipmaps > 1) GL.generateMipmap(GL.TEXTURE_2D);
	}
	else
	{
		GL.texImage2D(GL.TEXTURE_2D, 0, format, t.width, t.height, 0, format, size, t.data);
		if(t.num_mipmaps > 1) GL.generateMipmap(GL.TEXTURE_2D);
	}

	set_sampler(t.sampler);
}

function set_sampler(sampler)
{
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, sampler.s);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, sampler.t);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, sampler.up);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, sampler.down);

	var ext = GL.extensions.EXT_texture_filter_anisotropic;
	if(ext !== undefined)
	{
		var max_anisotropy = GL._parameters.max_anisotropy;
		var anisotropy = clamp(sampler.anisotropy, 0, max_anisotropy);

		GL.texParameterf
		(
			GL.TEXTURE_2D,
			ext.TEXTURE_MAX_ANISOTROPY_EXT,
			anisotropy
		);
	}
}

function bind_shader(s)
{
	if(s.id !== null) return;

	var vs = GL.createShader(GL.VERTEX_SHADER);
    GL.shaderSource(vs, s.vertex_src);
    GL.compileShader(vs);

    var success = GL.getShaderParameter(vs, GL.COMPILE_STATUS);
    if(success === false)
    {
    	console.error(s.name);
    	console.error("Shader Compile Error: " + GL.getShaderInfoLog(vs));
    }

    var fs = GL.createShader(GL.FRAGMENT_SHADER);
    GL.shaderSource(fs, s.fragment_src);
    GL.compileShader(fs);

    success = GL.getShaderParameter(fs, GL.COMPILE_STATUS);
    if(success === false)
    {
    	console.error(s.name);
    	console.error("Shader Compile Error: " + GL.getShaderInfoLog(fs));
    }

	s.id = GL.createProgram();
    GL.attachShader(s.id, vs);
    GL.attachShader(s.id, fs);
    GL.linkProgram(s.id);

    success = GL.getProgramParameter(s.id, GL.LINK_STATUS);
    if(success === false)
    {
    	console.error(s.name);
    	console.error("Shader Link Error: " + GL.getProgramInfoLog(s.id));
    }

    var n = GL.getProgramParameter(s.id, GL.ACTIVE_ATTRIBUTES);
    for(var i = 0; i < n; ++i)
    {
        var attr = GL.getActiveAttrib(s.id, i);
        s.attributes[attr.name] = GL.getAttribLocation(s.id, attr.name);
    }

    n =  GL.getProgramParameter(s.id, GL.ACTIVE_UNIFORMS);
    var sampler_index = 0;
    for(var i = 0; i < n; ++i)
    {
        var active_uniform = GL.getActiveUniform(s.id, i);
        var uniform = {};
        var name = active_uniform.name;
        uniform.location = GL.getUniformLocation(s.id, active_uniform.name);
        uniform.type = active_uniform.type;
        uniform.size = active_uniform.size;

        if(uniform.size > 1)
        {
	    	name = name.substring(0,name.indexOf('[0]'));
	    }
        if(uniform.type === GL.SAMPLER_2D)
        {
        	uniform.sampler_index = sampler_index;
        	sampler_index++;
        }
        s.uniforms[name] = uniform;
    }

    s.vertex_src = null;
    s.fragment_src = null;

    return s;
}

function set_uniform(name, value)
{
	var uniform = GL._state.shader.uniforms[name];

	//DEBUG
	if(uniform === null || uniform === undefined)
	{
		//console.warning('Uniform not found');
		return;
	}
	//END

	var loc = uniform.location;
	var size = uniform.size;

	switch(uniform.type)
	{
		case GL.FLOAT:
		{
			if(size > 1)
			{
				GL.uniform1fv(loc, value);
				return;
			}
			GL.uniform1f(loc, value);
			return;
		}
		case GL.FLOAT_VEC2:
		{
			if(size > 1)
			{
				GL.uniform2fv(loc, value);
				return;
			}
			GL.uniform2f(loc, value[0], value[1]);
			return;
		}
        case GL.FLOAT_VEC3:
        {
        	if(size > 1)
			{
				GL.uniform3fv(loc, value);
				return;
			}
        	GL.uniform3f(loc, value[0], value[1], value[2]);
        	return;
        }
        case GL.FLOAT_VEC4:
        {
        	if(size > 1)
			{
				GL.uniform4fv(loc, value);
				return;
			}
        	GL.uniform4f(loc, value[0], value[1], value[2], value[3]);
        	return;
        }
        case GL.BOOL:
        {
        	if(value === true) GL.uniform1i(loc, 1);
        	else GL.uniform1i(loc, 0);
        	return;
        }
        case GL.FLOAT_MAT2: GL.uniformMatrix2fv(loc, false, value); return;
        case GL.FLOAT_MAT3: GL.uniformMatrix3fv(loc, false, value); return;
        case GL.FLOAT_MAT4: GL.uniformMatrix4fv(loc, false, value); return;
        case GL.SAMPLER_2D:
        {
			GL.uniform1i(loc, uniform.sampler_index);
			GL.activeTexture(GL.TEXTURE0 + uniform.sampler_index);
			set_texture(value);
			return;
		}
		/*
        case GL.SAMPLER_CUBE:
        {
        	return;
        }
        */
        case GL.INT:
        {
        	if(size > 1)
			{
				GL.uniform1iv(loc, value);
				return;
			}
        	GL.uniform1i(loc, value);
        	return;
        }
        /*
		case GL.INT_VEC2:
		{
			if(size > 1)
			{
				GL.uniform2iv(loc, value);
			}
			GL.uniform2i(loc, value[0], value[1]);
			return;
		}
        case GL.INT_VEC3:
        {
        	if(size > 1)
			{
        		GL.uniform3iv(loc, value);
        	}
			GL.uniform3i(loc, value[0], value[1], value[2]);
        	return;
        }
        case GL.INT_VEC4:
        {
        	if(size > 1)
			{
        		GL.uniform4iv(loc, size, value);
        	}
			GL.uniform4i(loc, value[0], value[1], value[2], value[3]);
        	return;
        }
        */
        // DEBUG
		default:
		{
			console.error(uniform.type + ' is an unsupported uniform type');
		}
		// END
	}
}

function set_attributes(shader, mesh)
{
	var ext = GL.extensions.ANGLE_instanced_arrays;

	var vb = mesh.vertex_buffer;
	set_array_buffer(vb);

	for(var k in vb.attributes)
	{
		var sa = shader.attributes[k];
        var va = vb.attributes[k];
        //ASSERT(va !== undefined, 'Shader ' + shader.name + ' needs attribute ' + k + ' but mesh ' + mesh.name + ' does not have it');
        if(sa === undefined) continue;
        if(va === undefined) continue;
		GL.enableVertexAttribArray(sa);
		GL.vertexAttribPointer(sa, va.size, GL.FLOAT, va.normalized, vb.stride * 4, va.offset * 4);
		ext.vertexAttribDivisorANGLE(sa, 0);
	}
}

function bind_instance_buffers(buffers)
{
    for(var k in buffers)
    {
        var b = buffers[k];
        if(b.id === null) b.id = GL.createBuffer();
    }
    update_instance_buffers(buffers);
}


function update_instance_buffer(b, rate)
{
	set_array_buffer(b);
    GL.bufferData(GL.ARRAY_BUFFER, b.data, rate || GL.STATIC_DRAW);
}


function update_instance_buffers(buffers)
{
    for(var k in buffers)
    {
        var b = buffers[k];
        set_array_buffer(b);
        GL.bufferData(GL.ARRAY_BUFFER, b.data, GL.STATIC_DRAW);
    }
}

function set_instance_attributes(shader, buffers)
{
	var ext = GL.extensions.ANGLE_instanced_arrays;
    for(var k in buffers)
    {
        var b = buffers[k];
        var sa = shader.attributes[k];
        if(sa === undefined) continue;

        set_array_buffer(b);
        GL.enableVertexAttribArray(sa);
        GL.vertexAttribPointer(sa, b.stride, GL.FLOAT, b.normalized, b.stride * 4, 0);
        ext.vertexAttribDivisorANGLE(sa, 1);
    }
}

function draw_mesh(mesh)
{
	set_attributes(GL._state.shader, mesh);
	var layout = convert_mesh_layout(mesh.layout);

	if(mesh.index_buffer !== null)
	{
		set_index_buffer(mesh.index_buffer);
    	GL.drawElements(layout, mesh.index_buffer.count, GL.UNSIGNED_INT, 0);
	}
    else
    {
    	GL.drawArrays(layout, 0, mesh.vertex_buffer.count);
    }

    set_array_buffer(null);
    set_index_buffer(null);
}

function draw_mesh_instanced(mesh, instances, count)
{
	var ext = GL.extensions.ANGLE_instanced_arrays;

    set_attributes(GL._state.shader, mesh);
	set_instance_attributes(GL._state.shader, instances);

	var layout = convert_mesh_layout(mesh.layout);

	if(mesh.index_buffer !== null)
	{
		set_index_buffer(mesh.index_buffer);
    	ext.drawElementsInstancedANGLE(layout, mesh.index_buffer.count, GL.UNSIGNED_INT, 0, count);
	}
    else
    {
    	ext.drawArraysInstancedANGLE(layout, 0, mesh.vertex_buffer.count, count);
    }

    set_array_buffer(null);
    set_index_buffer(null);
}

function draw_call(shader, mesh, uniforms, instances, count)
{
	set_shader(shader);
	for(var u in uniforms) set_uniform(u, uniforms[u]);
	if(instances)
	{
		draw_mesh_instanced(mesh, instances, count);
	}
	else draw_mesh(mesh);
}

function set_blend_mode(mode)
{
	if(GL._state.blend_mode === mode) return;
	GL._state.blend_mode = mode;

	switch(mode)
	{
		case BlendMode.ADD:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFuncSeparate(GL.SRC_ALPHA, GL.ONE, GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
			break;
		}
		case BlendMode.DARKEN:
		{
			GL.blendEquation(GL.FUNC_SUBTRACT);
			GL.blendFunc(GL.ONE, GL.ONE);
			break;
		}
		case BlendMode.LIGHTEN:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.ONE, GL.ONE);
			break;
		}
		case BlendMode.DIFFERENCE:
		{
			GL.blendEquation(GL.FUNC_SUBTRACT);
			GL.blendFunc(GL.ONE, GL.ONE);
			break;
		}
		case BlendMode.MULTIPLY:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.DST_COLOR, GL.ZERO);
			break;
		}
		case BlendMode.SCREEN:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.MINUS_DST_COLOR, GL.ONE);
			break;
		}
		case BlendMode.INVERT:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.ONE_MINUS_DST_COLOR, GL.ZERO);
			break;
		}
		default:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
			break;
		}
	}
}


function set_depth_mode(mode)
{
	if(GL._state.depth_mode === mode) return;
	GL._state.depth_mode === mode;

	switch(mode)
	{
		case DepthMode.NEVER: GL.depthFunc(GL.NEVER); return;
		case DepthMode.LESS: GL.depthFunc(GL.LESS); return;
		case DepthMode.LESS_OR_EQUAL: GL.depthFunc(GL.LEQUAL); return;
		case DepthMode.EQUAL: GL.depthFunc(GL.EQUAL); return;
		case DepthMode.GREATER: GL.depthFunc(GL.GREATER); return;
		case DepthMode.NOT_EQUAL: GL.depthFunc(GL.NOTEQUAL); return;
		case DepthMode.GREATER_OR_EQUAL: GL.depthFunc(GL.GEQUAL); return;
		case DepthMode.ALWAYS: GL.depthFunc(GL.ALWAYS); return;
		default: GL.depthFunc(GL.LESS); return;
	}
}

function bind_render_target(t)
{
	if(t.frame_buffer !== null) return;
	t.frame_buffer = GL.createFramebuffer();
}

function set_render_target_color(texture)
{
	set_texture(texture);
	GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture.id, 0);
}

function set_render_target_depth(texture)
{
	set_texture(texture);
	GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.TEXTURE_2D, texture.id, 0);
}

function verify_webgl_context()
{
	if(GL.isContextLost && GL.isContextLost()) console.error('GL context lost');
}

function verify_frame_buffer()
{
	var status = GL.checkFramebufferStatus(GL.FRAMEBUFFER);
	if(status != GL.FRAMEBUFFER_COMPLETE)
	{
		console.error('Error creating framebuffer: ' +  status);
	}
}var KeyState =
{
	RELEASED: 0,
	UP: 1,
	DOWN: 2,
	HELD: 3,
};

var Keys =
{
	MOUSE_LEFT: 0,
	MOUSE_RIGHT: 1,
	BACKSPACE: 8,
	TAB: 9,
	ENTER: 13,
	SHIFT: 16,
	CTRL: 17,
	ALT: 18,
	CAPS: 20,
	ESC: 27,
	SPACE: 32,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	ZERO: 48,
	ONE: 49,
	TWO: 50,
	THREE: 51,
	FOUR: 52,
	FIVE: 53,
	SIX: 54,
	SEVEN: 55,
	EIGHT: 56,
	NINE: 57,
	A: 65,
	B: 66,
	C: 67,
	D: 68,
	E: 69,
	F: 70,
	G: 71,
	H: 72,
	I: 73,
	J: 74,
	K: 75,
	L: 76,
	M: 77,
	N: 78,
	O: 79,
	P: 80,
	Q: 81,
	R: 82,
	S: 83,
	T: 84,
	U: 85,
	V: 86,
	W: 87,
	X: 88,
	Y: 89,
	Z: 90,
};

function Mouse()
{
	var m = {};
	m.position = Vec3();
	m.initial = Vec3();
	m.last_position = Vec3();
	m.delta = Vec3();
	m.scroll = 0;
	m.has_scrolled = false;
	m.dy = 0;
	m.ldy = 0;
	return m;
}
/*
function Gyro()
{
	var g = {};
	g.acceleration = Vec3();
	g.angular_acceleration = Vec3();
	g.rotation = Vec4();
	g.euler = Vec3();
	g.updated = false;
	return g;
}
*/
function Touch ()
{
	var t = {};
	t.id = -1;
	t.is_touching = false;
	t.position = Vec3();
	t.initial = Vec3();
	t.last_position = Vec3();
	t.delta = Vec3();
	t.updated = false;
	t.state = KeyState.RELEASED;
	return t;
}
/*
function GamePad()
{
	var g = {};
	return g;
}
*/

var input;
function Input(root)
{
	var r = {};
	r.mouse = Mouse();
	r.keys = new Uint8Array(256);
	r.touches = new Array(5);
	r.touch_count = 0;
	//r.gyro = Gyro();
	r.is_touch_device = is_touch_device();
	r.scrolled = false;
	r.scroll_lock = true;

	if(!root) root = window;

	r.MAX_TOUCHES = 5;
	for(var i = 0; i < r.MAX_TOUCHES; ++i) r.touches[i] = Touch();

	root.addEventListener("touchstart",  on_touch_start, false);
  	root.addEventListener("touchmove", on_touch_move, false);
  	root.addEventListener("touchend", on_touch_end, false);

	//window.addEventListener('devicemotion', on_device_motion);
	//window.addEventListener('deviceorientation', on_device_rotation);

	window.addEventListener('keydown', on_key_down);
	window.addEventListener('keyup', on_key_up);
	root.addEventListener('mouseup', on_mouse_up);
	root.addEventListener('mousedown', on_mouse_down);
	root.addEventListener('mousemove', on_mouse_move);
	root.addEventListener('wheel', on_mouse_wheel);
	root.addEventListener('scroll', on_scroll);

	input = r;
	return r;
}

function is_touch_device()
{
	return (('ontouchstart' in window)
		|| (navigator.MaxTouchPoints > 0)
    	|| (navigator.msMaxTouchPoints > 0));
}

function update_input()
{
	var mouse = input.mouse;

	input.touch_count = 0;
	
	if(input.is_touch_device)
	{
		var t;
		for(var i = 0; i < input.MAX_TOUCHES; ++i)
		{
			t = input.touches[i];
			if(t.is_touching) input.touch_count++;
			vec_sub(t.delta, t.position, t.last_position);
			vec_eq(t.last_position, t.position);
		}

		t = input.touches[0];
		mouse.position[0] = t.position[0] * app.res;
		mouse.position[1] = t.position[1] * app.res;
		vec_eq(mouse.delta, t.delta);
	}
	else
	{
		vec_sub(mouse.delta, mouse.position, mouse.last_position);
	}

	mouse.scroll = 0;
	if(mouse.has_scrolled === true)
	{
		if(mouse.dy > 0) mouse.scroll = 1; 
		else if(mouse.dy < 0) mouse.scroll = -1;
		mouse.has_scrolled = false;
	}

	input.scrolled = false;

	vec_eq(mouse.last_position, mouse.position);
}

function update_key_states()
{
	if(input.is_touch_device)
	{
		for(var i = 0; i < input.MAX_TOUCHES; ++i)
		{
			var t = input.touches[i];
			if(t.state === KeyState.DOWN) t.state = KeyState.HELD;
			else if(t.state === KeyState.UP) t.state = KeyState.RELEASED;
		}
	}

	for(var i = 0; i < 256; ++i)
	{
		if(input.keys[i] === KeyState.DOWN) input.keys[i] = KeyState.HELD;
		else if(input.keys[i] === KeyState.UP) input.keys[i] = KeyState.RELEASED;
	}
}

function key_up(code)
{
	return input.keys[code] === KeyState.UP;
}
function key_down(code)
{
	return input.keys[code] === KeyState.DOWN;
}
function key_held(code)
{
	return input.keys[code] === KeyState.HELD || input.keys[code] === KeyState.DOWN;
}
function key_released(code)
{
	return input.keys[code] === KeyState.RELEASED || input.keys[code] === KeyState.UP;
}

function on_key_down(e)
{
	var kc = e.keyCode || e.button;
	if(input.keys[kc] != KeyState.HELD) input.keys[kc] = KeyState.DOWN;
}
function on_key_up(e)
{
	var kc = e.keyCode || e.button;
	if(input.keys[kc] != KeyState.RELEASED) input.keys[kc] = KeyState.UP;
}
function on_mouse_move(e)
{
	set_vec3(input.mouse.position, e.clientX * app.res, e.clientY * app.res, 0);
}
function on_mouse_down(e)
{
	var x = e.clientX * app.res;
	var y = e.clientY * app.res;
	set_vec3(input.mouse.position, x,y,0);
	set_vec3(input.mouse.initial, x,y,0);
	input.keys[Keys.MOUSE_LEFT] = KeyState.DOWN;
}
function on_mouse_up(e)
{
	var x = e.clientX * app.res;
	var y = e.clientY * app.res;
	set_vec3(input.mouse.position, x,y,0);
	input.keys[Keys.MOUSE_LEFT] = KeyState.UP;
}

function on_mouse_wheel(e)
{
	input.mouse.has_scrolled = true;
	var dy = e.wheelDeltaY || e.deltaY * -1;
	input.mouse.dy = dy;
	if(input.scroll_lock === true) e.preventDefault();
}
function on_scroll(e)
{
	input.scrolled = true;
}
/*
function on_device_motion(e)
{
	var l = e.acceleration;
	var a = e.rotationRate;
	set_vec3(input.gyro.acceleration, l.x, l.y, l.z);
	set_vec3(input.gyro.angular_acceleration, a.beta, a.gamma, a.alpha);
	input.gyro.updated = true;
}
function on_device_rotation(e)
{
	quat_set_euler_f(input.gyro.rotation, e.beta, e.gamma, e.alpha);
	set_vec3(input.gyro.euler, e.beta, e.gamma, e.alpha);

	input.gyro.updated = true;
}
*/
function on_touch_start(e)
{
	var n = e.changedTouches.length;
	for(var i = 0; i < n; ++i)
	{
		var it = e.changedTouches[i];

		for(var j = 0; j < input.MAX_TOUCHES; ++j)
		{
			var t = input.touches[j];
			if(t.is_touching === true) continue;
			t.state = KeyState.DOWN;
			var x = it.clientX;
			var y = it.clientY;
			set_vec3(t.position, x,y,0);
			set_vec3(t.last_position, x,y,0);
			set_vec3(t.delta, 0,0,0);
			set_vec3(t.initial, x,y,0);
			t.is_touching = true;
			t.id = it.identifier;
			t.updated = true;
			break;
		}
	}
	if(input.scroll_lock === true) e.preventDefault();
}

function on_touch_move(e)
{
	var n = e.changedTouches.length;

	for(var i = 0; i < n; ++i)
	{
		var it = e.changedTouches[i];

		for(var j = 0; j < input.MAX_TOUCHES; ++j)
		{
			var t = input.touches[j];
			if(it.identifier === t.id)
			{
				t.is_touching = true;
				var x = it.clientX;
				var y = it.clientY;
				set_vec3(t.position, x, y, 0);
				t.updated = true;
				break;
			}
		}
	}
	if(input.scroll_lock === true) e.preventDefault();
}

function on_touch_end(e)
{
	var n = e.changedTouches.length;
	for(var i = 0; i < n; ++i)
	{
		var id = e.changedTouches[i].identifier;
		for(var j = 0; j < input.MAX_TOUCHES; ++j)
		{
			var t = input.touches[j];
			if(id === t.id)
			{
				t.is_touching = false;
				t.id = -1;
				t.updated = true;
				t.state = KeyState.UP;
				var x = it.clientX;
				var y = it.clientY;
				set_vec3(t.position, x, y, 0);
				set_vec3(t.last_position, x,y,0);
				set_vec3(t.delta, 0,0,0);
				break;
			}
		}
	}
	if(input.scroll_lock === true) e.preventDefault();
}function quad_mesh(width, height, depth, x_offset, y_offset, z_offset)
{
    var w = width / 2;
    var h = height / 2;
    var d = depth / 2;
    var x = x_offset || 0;
    var y = y_offset || 0;
    var z = z_offset || 0;

    var attributes = 
    {
        position: VertexAttribute(3, false),
        uv: VertexAttribute(2, false)
    };
    var vertices = new Float32Array(
    [
        -w + x,-h + y, +d + z, 0,0,
         w + x,-h + y, +d + z, 1,0,
         w + x, h + y, -d + z, 1,1,
        -w + x,-h + y, +d + z, 0,0,
         w + x, h + y, -d + z, 1,1,
        -w + x, h + y, -d + z, 0,1
    ]);
    
    var vb = VertexBuffer(vertices, attributes);
    var mesh = Mesh(vb, null, MeshLayout.TRIANGLES);
    bind_mesh(mesh);
    update_mesh(mesh);
    return mesh;
}function Font()
{
    var r = {};
    r.name;
    r.atlas = null; //GL.LINEAR
    r.num_glyphs;
    r.glyhs;
    r.unicode_start;
    r.has_kerning;
    r.kerning;
    r.ascent;
    r.descent;
    r.space_advance;
    r.tab_advance;
    r.x_height;
    r.cap_height;
    return r;
}

function Glyph()
{
    var r = {};
    r.code_point = 0;
    r.uv;
    r.size;
    r.horizontal_bearing;
    r.vertical_bearing;
    r.advance;
    return r;
}

function Kerning_Table()
{
    var r = {};
    r.count;
    r.capacity;
    r.keys;
    r.values;
    r.max_tries;
    r.num_values;
    r.min_hash;
    r.max_hash;
    return r;
}

function Kern_Key()
{
    var r = {};
    r.code_point_a = 0;
    r.code_point_b = 0;
    r.key_index = 0;
    return r;
}

function get_glyph_metric(font, code_point)
{
    //str.codePointAt()
    //hash it
    //look it up
    //for now...
    
    var n = font.glyphs.length;
    for(var i = 0; i < n; ++i)
    {
        var g = font.glyphs[i];
        if(g.code_point === code_point) return g;
    }
    
    var character = String.fromCodePoint(code_point);
    console.warn('Could not find glyph: ' +  character + ' in ' + font.name);
}

function get_kerning(font, a,b)
{
    if(font.has_kerning === false) return 0;

    var result = 0;

    var h = 5381;
    h = ((h << 5) + h) + a;
    h = ((h << 5) + h) + b;
    h = h % font.kerning_table_size;
 
    var tries = font.num_tries;
    while(true)
    {
        if(tries === 0) break;
        tries--;

        var i = font.indices[h];
        if(i === -1) break; 

        if(font.a_keys[i] === a && font.b_keys[i] === b)
        {
            result = font.kerning[i];
            break;
        }

        h++;
    }

    return result;
}
var TextHorizontalAlignment = 
{
    LEFT: 0,
    CENTER: 1,
    RIGHT: 2
};

var TextVerticalAlignment = 
{
    TOP: 0,
    CENTER: 1,
    BOTTOM: 2,
};

function Text_Style(font)
{
    var r = {};
    r.font = font;
    r.color = Vec4(0.5,0.5,0.5,1);
    r.size = 0.008;
    r.letter_spacing = 0;
    r.line_height = 0.4;
    r.vertical_alignment = TextVerticalAlignment.TOP;
    r.horizontal_alignment = TextHorizontalAlignment.LEFT;
    return r;
}

function Text_Mesh(style, text, length)
{
    var r = Entity();
    r.entity_type = Entity_Type.TEXT;
    r.str = "";
    r.style = style;
    r.index = 0;
    r.index_start = 0;
    r.px = 0;
    r.py = 0;
    r.pz = 0;
    r.bounds = Vec4(0,0,4,0);
    r.last_white_space_index = 0;
    r.last_white_space_px = 0;
    r.last_white_space_advance = 0;
    r.last_line_index = 0;
    r.last_line_px = 0;

    var attributes = 
    {
        position: PositionAttribute(),
        uv: UVAttribute(),
        color: ColorAttribute(),
        index: VertexAttribute(1)
    };

    var vb = VertexBuffer(null, attributes);
    var ib = IndexBuffer(null);

    length = length || text.length;
    alloc_vertex_buffer_memory(vb, length * 4);
    alloc_index_buffer_memory(ib, length * 6);
    
    r.mesh = Mesh(vb, ib, MeshLayout.TRIANGLES);
    bind_mesh(r.mesh);

    if(text)
    {
        append_text(r, text);     
    }

    return r;
}

function is_whitespace(char_code)
{
    return char_code === 32;
}

function push_glyph_vertex(vb, x,y,z,u,v, color, index)
{
    var i = vb.offset;
    var d = vb.data;

    d[i  ] = x;
    d[i+1] = y;
    d[i+2] = z;
    d[i+3] = u;
    d[i+4] = v;
    d[i+5] = color[0];
    d[i+6] = color[1];
    d[i+7] = color[2];
    d[i+8] = color[3];
    d[i+9] = index;

    vb.offset += 10;
    vb.count = vb.offset;
}

function push_glyph_triangle(ib)
{
    var ti = ib.triangle_offset; 
    var d = ib.data;  
    var i = ib.offset;

    d[i  ] = ti + 0;
    d[i+1] = ti + 1;
    d[i+2] = ti + 3;
    d[i+3] = ti + 0;
    d[i+4] = ti + 3;
    d[i+5] = ti + 2;

    ib.offset += 6;
    ib.triangle_offset += 4;
    ib.count = ib.offset;
}

function add_glyph(tm, char_code, prev_code, is_last_glyph)
{
    var style = tm.style;
    var font = style.font;
    var scale = style.size;

    var glyph = get_glyph_metric(font, char_code);
    //var kerning = get_kerning(char_code, prev_code);
    var kerning = 0;

    //quad dimensions
    var hw = 16.0;
    var hh = hw;

    //console.log(glyph.horizontal_bearing[1])

    // uvs
    var px = glyph.uv[0];
    var py = glyph.uv[1];
    var pw = glyph.uv[2];
    var ph = glyph.uv[3];
    
    var cx = (tm.px + glyph.horizontal_bearing[0] + kerning + style.letter_spacing) + (glyph.size[0] / 2);
    var cy = (tm.py + glyph.horizontal_bearing[1]) - (glyph.size[1] / 2);
    var lft = cx - hw;
    var rht = cx + hw;
    var top = cy + hh;
    var btm = cy - hh;

    //var abs_btm = Math.abs(btm);
    //if(abs_btm > tm.height) tm.height = abs_btm;

    var vb = tm.mesh.vertex_buffer;
    push_glyph_vertex(vb, lft, btm, tm.pz, px,py, style.color, tm.index);
    push_glyph_vertex(vb, rht, btm, tm.pz, pw,py, style.color, tm.index);
    push_glyph_vertex(vb, lft, top, tm.pz, px,ph, style.color, tm.index);
    push_glyph_vertex(vb, rht, top, tm.pz, pw,ph, style.color, tm.index);
    push_glyph_triangle(tm.mesh.index_buffer);

    //var x_advance = glyph.advance[0]  style.letter_spacing;
    var x_advance = glyph.advance[0] + kerning + style.letter_spacing;

    /*
    if(is_whitespace(char_code)) 
    {
        tm.last_white_space_index = tm.index+1;
        tm.last_white_space_px = tm.px;
        tm.last_white_space_advance = x_advance;
    }
    */


    // if we are fixed bounds and we are outside those bounds with whitespace to break from
    /*
    if(tm.bounds[2] > 0 && 
       tm.px > tm.bounds[2] &&
       tm.last_white_space_index > tm.last_line_index)
    {
        tm.width = tm.bounds[2];

        // first go back and h align the previous line
        var line_width = tm.last_white_space_px - tm.bounds[0];
        var x_offset = -line_width;
        var h_align = style.horizontal_alignment;
        
        if(h_align === TextHorizontalAlignment.CENTER) x_offset /= 2;
        else if(h_align === TextHorizontalAlignment.LEFT) x_offset = 0;

        var start = tm.last_line_index * (vb.stride * 4);
        var end = tm.last_white_space_index * (vb.stride * 4);

        for(var i = start; i < end; i += vb.stride) vb.data[i] += x_offset;

        // drop everything from the last_line_index to here down a line and shove to the left

        x_offset = -((tm.last_white_space_px + tm.last_white_space_advance) - tm.bounds[0]);
        var y_offset = -style.line_height;

        start = tm.last_white_space_index * (vb.stride * 4);
        end = (tm.index+1) * (vb.stride * 4);

        for(var i = start; i < end; i += vb.stride)
        {
            vb.data[i  ] += x_offset;
            vb.data[i+1] -= style.line_height;
        }

        tm.px += x_offset + x_advance;
        tm.py -= style.line_height;
        tm.last_line_index = tm.last_white_space_index;
    }
    else
    {
        tm.px += x_advance;
    }
    */

    tm.px += x_advance;
    tm.index++;

    /*
    if(is_last_glyph === true)
    {
        var line_width = tm.px - tm.bounds[0];
        var x_offset = -line_width;
        var h_align = style.horizontal_alignment;
        
        if(h_align === TextHorizontalAlignment.CENTER) x_offset /= 2;
        else if(h_align === TextHorizontalAlignment.LEFT) x_offset = 0;

        var start = tm.last_line_index * (vb.stride * 4);
        var end = tm.index * (vb.stride * 4);

        for(var i = start; i < end; i += vb.stride)
        {
            vb.data[i] += x_offset;
        }

        var rhs = tm.px + x_advance;
        if(rhs > tm.width) tm.width = rhs;
        tm.width = Math.abs(tm.width - tm.bounds[0]);

        start = tm.index_start;
        var y_offset = tm.height;
        var v_align = style.vertical_alignment;

        if(v_align === TextVerticalAlignment.CENTER) y_offset /= 2;
        else if(v_align === TextVerticalAlignment.TOP) y_offset = 0;

        for(var i = start; i < end; i += vb.stride)
        {
            vb.data[i+1] += y_offset;
        }
    }
    */
}

function reset_text(tm)
{
    clear_mesh_buffers(tm.mesh);

    tm.px = 0;
    tm.py = 0;
    tm.pz = 0;
    tm.width = 0;
    tm.height = 0;
    tm.index = 0;
    tm.index_start = 0;
    tm.last_white_space_index = 0;
    tm.last_white_space_px = 0;
    tm.last_white_space_advance = 0;
    tm.last_line_index = 0;
    tm.last_line_px = 0;
    set_vec4(tm.bounds, 0,0,0,0);
    //tm.text = "";
}

function update_text_mesh(tm)
{
    update_mesh(tm.mesh);    
}


function set_text_mesh(tm, str)
{
    tm.str = str;
    reset_text(tm);
    append_text(tm, str);
    update_mesh(tm.mesh)
}

function append_text(tm, str)
{
    var n = str.length;
    var prev_code = -1;
    for(var i = 0; i < n-1; ++i)
    {
        var char_code = str.charCodeAt(i);
        add_glyph(tm, char_code, prev_code, false);
        prev_code = char_code;
    }
    add_glyph(tm, str.charCodeAt(n-1), prev_code, true);
}


function draw_text(text, shader, camera)
{
    set_shader(shader);

    var mvp = _Mat4();
    mat4_mul(mvp, text.world_matrix, camera.view_projection);
    set_uniform('mvp', mvp);
    set_uniform('texture', text.style.font.atlas);

    draw_mesh(text.mesh);

    mat4_stack.index--;
}var Material_Type = 
{
	PBR: 1,
};

function Material(name, type, inputs)
{
	var r = {};
	r.name = name;
	r.type = type;
	r.inputs = inputs;
	return r;
}

function PBR_Material(name)
{
	var inputs = 
	{
		albedo: 1.0,
		normal: 0.0,
		metallic: 0.0,
		specular: 0.5,
		roughness: 0.0,
		ior: 1.4,
		transmission: 0
	};
	return Material(name, Material_Type.PBR, inputs);
}
function Scene(name, max_entities)
{
	var r = {};
	r.root = Entity(0,0,0);
	r.name = name;
	r.MAX_ENTITIES = max_entities;
	r.entity_count = 0;
	r.entities = new Array(max_entities);
	return r;
}

function add_to_scene(scene, e)
{
	scene.entities[scene.entity_count] = e;
	e.entity_count++;
	if(e.parent === null)
	{
		set_parent(e, scene.root);
	}
}

function update_scene(scene, dt)
{
	
}

function render_scene(scene, camera)
{
	
}function RenderTarget(view)
{
	var r = {};
	r.frame_buffer = null;
	r.render_buffer = null;
	r.color = null;
	r.depth = null;
	r.view = view;
	return r;
}

function standard_render_target(view)
{
	var r = {};
	r.frame_buffer = null;
	r.render_buffer = null;
	r.color = rgba_texture(view[2], view[3], null, app.sampler);
	r.depth = depth_texture(view[2], view[3], app.sampler);
	r.view = view;
	bind_render_target(r);
	set_render_target(r);
	set_render_target_color(r.color);
	set_render_target_depth(r.depth);
	verify_frame_buffer();
	set_render_target(null);
	return r;
}

function depth_render_target(view)
{
	var r = {};
	r.frame_buffer = null;
	r.render_buffer = null;
	r.depth = depth_texture(view[2], view[3], app.sampler);
	r.view = view;
	bind_render_target(r);
	set_render_target(r);
	set_render_target_depth(r.depth);
	verify_frame_buffer();
	set_render_target(null);
	return r;
}

function resize_render_target(target, view)
{
	if(target.color) resize_texture(target.color, view[2], view[3]);
	if(target.depth) resize_texture(target.depth, view[2], view[3]);
}function GL_Draw(buffer_size)
{
	var r = {};
	r.color = Vec4(1,1,1,1);
	r.matrix = Mat4();

	var update_rate = BufferUpdateRate.DYNAMIC;

	// LINES

	var line_attributes =
	{
		position: PositionAttribute(),
		color: ColorAttribute()
	};

	var vb = VertexBuffer(null, line_attributes, update_rate);
	alloc_vertex_buffer_memory(vb, buffer_size);
    r.lines = Mesh(vb, null, MeshLayout.LINES);
    bind_mesh(r.lines);

    // TRIANGLES

 //    var tri_attributes =
 //    {
 //    	position: PositionAttribute(),
 //    	uv: UVAttribute(),
 //    	radius: VertexAttribute(1),
 //    	color: ColorAttribute()
 //    };

 //    vb = VertexBuffer(null, tri_attributes, update_rate);
	// alloc_vertex_buffer_memory(vb, buffer_size);

 //    var ib = IndexBuffer(new Uint32Array(buffer_size), update_rate);
 //    r.triangles = Mesh(vb, ib, MeshLayout.TRIANGLES);
 //    bind_mesh(r.triangles);

    // TEXT

    /*
    r.text_shader = app.assets.shaders.text;
    r.text_style = TextStyle(app.assets.fonts.space_mono);
    r.text = TextMesh(r.text_style, "", 2048);
    */

	return r;
}

function reset_gl_draw(ctx)
{
	mat4_identity(ctx.matrix);
	set_vec4(ctx.color, 1,1,1,1);
	clear_mesh_buffers(ctx.lines);
	//clear_mesh_buffers(ctx.triangles);
	//reset_text(ctx.text);
}

function render_gl_draw(ctx, camera)
{
	if(app.assets.loaded === false) return;

	update_mesh(ctx.lines);
	//update_mesh(ctx.triangles);

	set_shader(app.assets.shaders.basic);
	set_uniform('mvp', camera.view_projection);
	draw_mesh(ctx.lines);

	//use_shader(ctx.tri_shader);
	//set_uniform('mvp', camera.view_projection);
	//draw_mesh(ctx.triangles);

	//update_mesh(ctx.text.mesh);
	//draw_text(ctx.text, ctx.text_shader, camera);

	reset_gl_draw(ctx);
}

function gl_push_vertex(vertex, mesh, color, matrix)
{
	var index = vec3_stack.index;

	var o = mesh.vertex_buffer.offset;
	var d = mesh.vertex_buffer.data;
	var c = color;
	var v = _Vec3();

	mat4_mul_point(v, matrix, vertex);

	d[o]   = v[0];
	d[o+1] = v[1];
	d[o+2] = v[2];
	d[o+3] = c[0];
	d[o+4] = c[1];
	d[o+5] = c[2];
	d[o+6] = c[3];

	vec3_stack.index = index;

	mesh.vertex_buffer.offset += 7;
}

/*
function gl_push_line(start, end, mesh, color, matrix)
{
	var index = vec3_stack.index;

	var o = mesh.vertex_buffer.offset;
	var d = mesh.vertex_buffer.data;
	var c = color;
	var a = _Vec3();
	var b = _Vec3();

	mat4_mul_point(a, matrix, start);
	mat4_mul_point(b, matrix, end);

	d[o]   = a[0];
	d[o+1] = a[1];
	d[o+2] = a[2];

	d[o+3] = c[0];
	d[o+4] = c[1];
	d[o+5] = c[2];
	d[o+6] = c[3];

	d[o+7] = b[0];
	d[o+8] = b[1];
	d[o+9] = b[2];

	d[o+10] = c[0];
	d[o+11] = c[1];
	d[o+12] = c[2];
	d[o+13] = c[3];

	vec3_stack.index = index;

	mesh.vertex_buffer.offset += 14;
}
*/

function gl_push_line_segment(start,end,thickness,depth, mesh, color, matrix)
{
	var d = mesh.vertex_buffer.data;
	var o = mesh.vertex_buffer.offset;
	var c = color;
	var z = depth;

	var index = vec3_stack.index;
	var dir = _Vec3();
	vec_sub(dir, end, start);
	vec_normalized(dir, dir);
	var perp = _Vec3();
	vec_perp(perp, dir);
	vec_mul_f(perp, perp, thickness);

	 //bl
	d[o  ] = start[0] - perp[0];
	d[o+1] = start[1] - perp[1];
	d[o+2] = z;
	d[o+3] = c[0];
	d[o+4] = c[1];
	d[o+5] = c[2];
	d[o+6] = c[3];

	//br
	d[o+7] = end[0] - perp[0];
	d[o+8] = end[1] - perp[1];
	d[o+9] = z;
	d[o+10] = c[0];
	d[o+11] = c[1];
	d[o+12] = c[2];
	d[o+13] = c[3];

	//tl
	d[o+14] = start[0] + perp[0];
	d[o+15] = start[1] + perp[1];
	d[o+16] = z;
	d[o+17] = c[0];
	d[o+18] = c[1];
	d[o+19] = c[2];
	d[o+20] = c[3];

	//tr
	d[o+21] = end[0] + perp[0];
	d[o+22] = end[1] + perp[1];
	d[o+23] = z;
	d[o+24] = c[0];
	d[o+25] = c[1];
	d[o+26] = c[2];
	d[o+27] = c[3];

	mesh.vertex_buffer.offset += 28;

	//indices

	d = mesh.index_buffer.data;

	var i = mesh.index_buffer.offset;
	var ti = mesh.index_buffer.triangle_offset;

	d[i  ] = ti + 0;
	d[i+1] = ti + 1;
	d[i+2] = ti + 3;
	d[i+3] = ti + 0;
	d[i+4] = ti + 3;
	d[i+5] = ti + 2;

	mesh.index_buffer.triangle_offset += 4;
	mesh.index_buffer.offset += 6;

	vec3_stack.index = index;
}

function draw_quad(ctx, p,w,h,r)
{
	var hw = w / 2;
	var hh = h / 2;
	var rect = _Vec4(p[0]-hw,p[1]+hh,w,h);
	gl_push_rect(rect, p[2], r, ctx.triangles, ctx.color, ctx.matrix);
	vec4_stack.index--;
}

function draw_quad_f(ctx, x,y,w,h,r)
{
	var rect = _Vec4(x,y,w,h);
	gl_push_rect(rect, 0.0, r, ctx.triangles, ctx.color, ctx.matrix);
	vec4_stack.index--;
}

function draw_text_f(ctx, x,y, str)
{
	var t = ctx.text;
	t.width = 0;
	t.height = 0;
	t.bounds[0] = x;
    t.px = x;
    t.py = y;
    t.index_start = t.index;
    t.style.color = ctx.color;
    append_text(t, str);
}

function gl_push_rect(r, depth, radius, mesh, color, matrix)
{
	var d = mesh.vertex_buffer.data;
	var o = mesh.vertex_buffer.offset;
	var c = color;
	var z = depth;

	//TODO: mat4 mul

    //bl
	d[o  ] = r[0];
	d[o+1] = r[1] - r[3];
	d[o+2] = z;
	d[o+3] = 0;
	d[o+4] = 0;
	d[o+5] = radius;
	d[o+6] = c[0];
	d[o+7] = c[1];
	d[o+8] = c[2];
	d[o+9] = c[3];

	//br
	d[o+10] = r[0] + r[2];
	d[o+11] = r[1] - r[3];
	d[o+12] = z;
	d[o+13] = 1;
	d[o+14] = 0;
	d[o+15] = radius;
	d[o+16] = c[0];
	d[o+17] = c[1];
	d[o+18] = c[2];
	d[o+19] = c[3];

	//tl
	d[o+20] = r[0];
	d[o+21] = r[1];
	d[o+22] = z;
	d[o+23] = 0;
	d[o+24] = 1;
	d[o+25] = radius;
	d[o+26] = c[0];
	d[o+27] = c[1];
	d[o+28] = c[2];
	d[o+29] = c[3];

	//tr
	d[o+30] = r[0] + r[2];
	d[o+31] = r[1];
	d[o+32] = z;
	d[o+33] = 1;
	d[o+34] = 1;
	d[o+35] = radius;
	d[o+36] = c[0];
	d[o+37] = c[1];
	d[o+38] = c[2];
	d[o+39] = c[3];

	mesh.vertex_buffer.offset += 40;

	//indices

	d = mesh.index_buffer.data;

	var i = mesh.index_buffer.offset;
	var ti = mesh.index_buffer.triangle_offset;

	d[i  ] = ti + 0;
	d[i+1] = ti + 1;
	d[i+2] = ti + 3;
	d[i+3] = ti + 0;
	d[i+4] = ti + 3;
	d[i+5] = ti + 2;

	mesh.index_buffer.triangle_offset += 4;
	mesh.index_buffer.offset += 6;

}

function gl_push_line(ctx, a,b)
{
	gl_push_vertex(a, ctx.lines, ctx.color, ctx.matrix);
	gl_push_vertex(b, ctx.lines, ctx.color, ctx.matrix);
}

function draw_line(ctx, a,b)
{
	gl_push_line(ctx, a,b);
}

function draw_point(ctx, p, size)
{
	var index = vec3_stack.index;

	var a = _Vec3(p[0] - size, p[1], p[2]);
	var b = _Vec3(p[0] + size, p[1], p[2]);
	var c = _Vec3(p[0], p[1] - size, p[2]);
	var d = _Vec3(p[0], p[1] + size, p[2]);
	gl_push_line(ctx, a,b);
	gl_push_line(ctx, c,d);
	vec3_stack.index = index;
}

function draw_normal(ctx, origin, normal, length)
{
	var end = _Vec3();
	vec_mul_f(end, normal, length);
	vec_add(end, origin, end);
	draw_line(ctx, origin,end);
	vec3_stack.index--;
}
function draw_ray(ctx, r)
{
	var end = _Vec3();
	vec_mul_f(end, r.direction, r.length);
	vec_add(end, r.origin, end);
	draw_line(ctx, r.origin, end);
}

function draw_dir(ctx, origin, dir)
{
	var end = _Vec3();
	vec_add(end, origin, dir);
	draw_line(ctx, origin,end);
	vec3_stack.index--;
}

function draw_wire_rect(ctx, r)
{
	var index = vec3_stack.index;

	var bl = _Vec3(r[0], r[1]);
	var tl = _Vec3(r[0], r[1] + r[3]);
	var tr = _Vec3(r[0] + r[2], r[1] + r[3]);
	var br = _Vec3(r[0] + r[2], r[1]);

	gl_push_line(bl,tl, ctx.lines, ctx.color, ctx.matrix);
	gl_push_line(tl,tr, ctx.lines, ctx.color, ctx.matrix);
	gl_push_line(tr,br, ctx.lines, ctx.color, ctx.matrix);
	gl_push_line(br,bl, ctx.lines, ctx.color, ctx.matrix);

	vec3_stack.index = index;
}
function draw_wire_cube(ctx, width, height, depth)
{
	var x = width / 2.0;
	var y = height / 2.0;
	var z = depth / 2.0;
	var v = _Vec3;
	var l = gl_push_line;
	var o = ctx.lines;
	var c = ctx.color;
	var m = ctx.matrix;

	var index = vec3_stack.index;

	l(v(-x,-y,-z), v(-x, y,-z), o,c,m);
	l(v(-x, y,-z), v( x, y,-z), o,c,m);
	l(v( x, y,-z), v( x,-y,-z), o,c,m);
	l(v( x,-y,-z), v(-x,-y,-z), o,c,m);
	l(v(-x,-y, z), v(-x, y, z), o,c,m);
	l(v(-x, y, z), v( x, y, z), o,c,m);
	l(v( x, y, z), v( x,-y, z), o,c,m);
	l(v( x,-y, z), v(-x,-y, z), o,c,m);
	l(v(-x,-y,-z), v(-x,-y, z), o,c,m);
	l(v(-x, y,-z), v(-x, y, z), o,c,m);
	l(v( x, y,-z), v( x, y, z), o,c,m);
	l(v( x,-y,-z), v( x,-y, z), o,c,m);

	vec3_stack.index = index;
}
function draw_wire_circle(ctx, radius, segments)
{
	var theta = TAU / segments;
	var tanf = Math.tan(theta);
	var cosf = Math.cos(theta);

	var index = vec3_stack.index;

	var current = _Vec3(radius, 0, 0);
	var last = _Vec3(radius, 0, 0);

	for(var i = 0; i < segments + 1; ++i)
	{
		//gl_push_vertext(last,current, ctx.lines, ctx.color, ctx.matrix);
		gl_push_vertex(last, ctx.lines, ctx.color, ctx.matrix);
		gl_push_vertex(current, ctx.lines, ctx.color, ctx.matrix);

		vec_eq(last, current);
		var tx = -current[1];
		var ty = current[0];
		current[0] += tx * tanf;
		current[1] += ty * tanf;
		current[0] *= cosf;
		current[1] *= cosf;
	}

	vec3_stack.index = index;
}
function draw_wire_sphere(ctx, radius)
{
	var q = _Vec4();

	draw_wire_circle(radius, 32);
	quat_set_euler_f(q, 0,90,0);
	mat4_set_rotation(ctx.matrix, q);
	draw_wire_circle(ctx, radius, 32);

	quat_set_euler_f(q, 90,0,0);
	mat4_set_rotation(ctx.matrix, q);
	draw_wire_circle(ctx, radius, 32);
	mat4_identity(ctx.matrix);
}
function draw_transform(ctx, m)
{
	var index = vec3_stack.index;

	var o = _Vec3();
	var e = _Vec3();

	mat4_get_position(o, m);

	set_vec4(ctx.color, 1,0,0,1);
	mat4_mul_point(e, m, _Vec3(1,0,0));
	draw_line(ctx, o,e);

	set_vec4(ctx.color, 0,1,0,1);
	mat4_mul_point(e, m, _Vec3(0,1,0));
	draw_line(ctx, o,e);

	set_vec4(ctx.color, 0,0,1,1);
	mat4_mul_point(e, m, _Vec3(0,0,1));
	draw_line(ctx, o,e);

	vec3_stack.index = index;
}
function draw_bounds(ctx, b)
{
	mat4_identity(ctx.matrix);

	var center = _Vec3();
	aabb_center(center, b);

	mat4_set_position(ctx.matrix, center);

	var w = ab.width(b);
	var h = ab.height(b);
	var d = ab.depth(b);

	draw_wire_cube(ctx, w,h,d);
	mat4_identity(ctx.matrix);
}

function draw_wire_mesh(ctx, mesh, matrix)
{
//	mat4_eq(ctx.matrix, matrix);

	var vb = mesh.vertex_buffer.data;
	var stride = mesh.vertex_buffer.stride;

	var A = _Vec3();
	var B = _Vec3();
	var C = _Vec3();
	var n = 0;
	var c = 0;

	if(mesh.index_buffer)
	{
		var ib = mesh.index_buffer.data;
		n = mesh.index_buffer.count / 3;

		for(var i = 0; i < n; ++i)
		{
			var ta = ib[c  ] * stride;
			var tb = ib[c+1] * stride;
			var tc = ib[c+2] * stride;

			set_vec3(A, vb[ta], vb[ta+1], vb[ta+2]);
			set_vec3(B, vb[tb], vb[tb+1], vb[tb+2]);
			set_vec3(C, vb[tc], vb[tc+1], vb[tc+2]);

			gl_push_line(A,B, ctx.lines, ctx.color, ctx.matrix);
			gl_push_line(B,C, ctx.lines, ctx.color, ctx.matrix);
			gl_push_line(C,A, ctx.lines, ctx.color, ctx.matrix);

			c += 3;
		}
	}
	else
	{
		n = mesh.vertex_buffer.count;
		for(var i = 0; i < n; ++i)
		{
			var ta = vb[c  ];
			var tb = vb[c+1];
			var tc = vb[c+2];

			set_vec3(A, vb[ta], vb[ta+1], vb[ta+2]);
			set_vec3(B, vb[tb], vb[tb+1], vb[tb+2]);
			set_vec3(C, vb[tc], vb[tc+1], vb[tc+2]);

			gl_push_line(A,B, ctx.lines, ctx.color, ctx.matrix);
			gl_push_line(B,C, ctx.lines, ctx.color, ctx.matrix);
			gl_push_line(C,A, ctx.lines, ctx.color, ctx.matrix);

			c += stride;
		}
	}

	vec3_stack.index -= 3;
//	mat4_identity(ctx.matrix);
}

function draw_wire_camera(ctx, camera)
{
	var index = vec3_stack.index;
	vec_eq(ctx.matrix, camera.world_matrix);

	var hw = 1;
	var hh = 1;
	var z =  0;

	var zero = _Vec3(0,0,1);
	var tl = _Vec3(-hw, hh, z);
	var tr = _Vec3( hw, hh, z);
	var bl = _Vec3(-hw,-hh, z);
	var br = _Vec3( hw,-hh, z);

	var inv = _Mat4();
    mat4_inverse(inv, camera.projection);
    mat4_mul_point(tl, inv, tl);
    mat4_mul_point(tr, inv, tr);
    mat4_mul_point(bl, inv, bl);
    mat4_mul_point(br, inv, br);

	set_vec4(ctx.color, 0.5,0.5,0.5,1.0);
	draw_line(ctx, zero, tl);
	draw_line(ctx, zero, tr);
	draw_line(ctx, zero, bl);
	draw_line(ctx, zero, br);

	draw_line(ctx, tl, tr);
	draw_line(ctx, tr, br);
	draw_line(ctx, br, bl);
	draw_line(ctx, bl, tl);

	set_vec3(bl, -hw * 0.3, hh + 0.1, z);
	set_vec3(br,  hw * 0.3, hh + 0.1, z);
	set_vec3(tl,  0, hh + 0.5, z);
	mat4_mul_point(tl, inv, tl);
    mat4_mul_point(bl, inv, bl);
    mat4_mul_point(br, inv, br);

	draw_line(ctx, bl, tl);
	draw_line(ctx, tl, br);
	draw_line(ctx, br, bl);

	mat4_identity(ctx.matrix);
	vec3_stack.index = index;
}

function draw_bezier(ctx, b, segments)
{
	var index = vec3_stack.index;

	var last = _Vec3();
	bezier_eval(last, b, 0);
	var step = 1 / segments;
	var t = step;
	for(var i = 1; i < segments+1; ++i)
	{
		var point = _Vec3();
		bezier_eval(point, b, t);
		gl_push_line(last,point, ctx.lines, ctx.color, ctx.matrix);
		vec_eq(last, point);
		t += step;
	}

	vec3_stack.index = index;
}
function draw_rig(ctx, rig)
{
	var n = rig.joints.length;
	var a = _Vec3();
	var b = _Vec3();
	for(var i = 0; i < n; ++i)
	{
		var j = rig.joints[i];
		if(j.parent === -1 || j.parent === 0) continue;

		var parent = rig.joints[j.parent];
		mat4_get_position(a, parent.world_matrix);
		mat4_get_position(b, j.world_matrix);
		gl_push_line(a,b, ctx.lines, ctx.color, ctx.matrix);
	}
}
function draw_rig_transforms(ctx, rig)
{
	var n = rig.joints.length;
	for(var i = 0; i < n; ++i)
	{
		draw_transform(ctx, rig.joints[i].world_matrix);
	}
}function hex_to_rgb(hex, normalize) 
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if(!result) return null;

    var r = parseInt(result[1], 16);
    var g = parseInt(result[2], 16);
    var b = parseInt(result[3], 16);

    if(normalize)
    {
        r /= 255;
        g /= 255;
        b /= 255;
    }

    return [r,g,b,1];
}

function RGB_to_HSB(rgb, hsb)
{
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];

    var max = Math.max(Math.max(r,g),b);
    var min = Math.min(Math.min(r,g),b);

    var delta = max - min;

    if(delta !== 0.0)
    {
        var hue;
        if(r == max)
        {
            hue = (g - b) / delta;
        }
        else
        {
            if(g == max) hue = 2.0 + (b - r) / delta;
            else hue = 4.0 + (r - g) / delta;
        }
        hue *= 60.0;
        if (hue < 0) hue += 360.0;
        hsb[0] = hue;
    }
    else
    {
        hsb[0] = 0;
    }

    if(max === 0.0)
    {
        hsb[1] = 0.0;
    }
    else
    {
        hsb[1] = (max - min) / max;
    }
    hsb[2] = max;
}

function HSB_to_RGB(hsb, rgb)
{
    var h = hsb[0];
    var s = hsb[1];
    var v = hsb[2];

    var hh = h;
    if(hh > 360.0) hh = 0.0;
    if(hh === 360.0) hh = 359.9; //fix singularity
    hh /= 60.0;
    var i = Math.floor(hh);
    var ff = hh - i;
    var p = v * (1.0 - s);
    var q = v * (1.0 - (s * ff));
    var t = v * (1.0 - (s * (1.0 - ff)));

    switch(i) 
    {
        case 0:
        {
            rgb[0] = v;
            rgb[1] = t;
            rgb[2] = p;
            break;
        }
        case 1:
        {
            rgb[0] = q;
            rgb[1] = v;
            rgb[2] = p;
            break;
        }
        case 2:
        {
            rgb[0] = p;
            rgb[1] = v;
            rgb[2] = t;
            break;
        }
        case 3:
        {
            rgb[0] = p;
            rgb[1] = q;
            rgb[2] = v;
            break;
        }
        case 4:
        {
            rgb[0] = t;
            rgb[1] = p;
            rgb[2] = v;
            break;
        }
        default:
            rgb[0] = v;
            rgb[1] = p;
            rgb[2] = q;
            break;
    }
}

function datGUI_to_webgl_color(c)
{
    var r = _Vec3();
    vec_div_f(r, c, 255);
    return r;
}var app = {};

var AppState =
{
    DEBUG: -1,
    INIT: 0,
    LOADING: 1,
    INTRO: 2,
    RUNNING: 3,
};

function app_start(lang, gl_info)
{
    console.log('app start')
    console.log(gl_info)

    app.gl_info = gl_info;
    app.has_focus = true;
    app.resize = false;
    app.do_resize = false;
    app.auto_init = true;
    app.resize_timer = 0;
    app.res = window.devicePixelRatio;
    app.container = document.querySelector('.canvas-container');
    app.time = Timer();
    app.ticker = Ticker();
    app.canvas = Canvas(app.container);
    app.view = Vec4(0,0,app.canvas.width, app.canvas.height);
    app.input = Input(app.container);
    
    var aa = true;
    if(app.res > 1.5 || app.view[2] > 3000) aa = false;
    app.webgl = WebGL(app.canvas,
    {
        alpha: false,
        depth: true,
        stencil: false,
        antialias: aa,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        preferLowPowerToHighPerformance: false,
        failIfMajorPerformanceCaveat: false,
    });

    app.sampler = default_sampler();

    window.addEventListener('focus', function()
    {
        console.log('FOCUS');
        app.has_focus = true;
    });
    window.addEventListener('blur', function()
    {
        console.log('BLUR');
        app.has_focus = false;
    });
    window.addEventListener('resize', function()
    {
        app.resize = true;
        app.resize_timer = 0;
    });

    app.assets = AssetGroup('common');
    load_assets(app.assets,
    [
        'assets/common.txt',
        'img/noto_jp.png'
    ],
    function()
    {
        bind_assets(app.assets);
    });


    app.debug_tools = Debug_Tools();

    app.state = AppState.LOADING;

    requestAnimationFrame(update);
}

function update(t)
{
    requestAnimationFrame(update);

    var ticker = app.ticker;
    advance_ticker(ticker);

    if(app.resize === true)
    {
        app.resize_timer += ticker.dt;
        if(app.resize_timer > 0.5)
        {
            app.do_resize = true;
        }
    }
  
    if(app.has_focus)
    {
        switch(app.state)
        {
            case AppState.LOADING:

                if(app.auto_init && app.assets.loaded)
                {
                    app.state = AppState.INIT;
                }

            break;
            case AppState.INIT:
            
                app.state = AppState.RUNNING;

                app.screen_quad = quad_mesh(2,2,0);
                app.quad = quad_mesh(1,1,0);
                app.gl_draw = GL_Draw(16000);
                app.vector = Vector();

                set_viewport(app.view);
                set_clear_color_f(0,0,0,1);
                clear_screen();
                clear_stacks();


            break;
            case AppState.RUNNING:

                if(app.time.paused) break;

                if(app.do_resize)
                {
                    resize_canvas(app.canvas, app.container);
                    app.view[2] = app.canvas.width;
                    app.view[3] = app.canvas.height;
                }

                //console.log(ticker.frames_to_tick)
                for(var i = 0; i < ticker.frames_to_tick; ++i)
                {
                    update_input();
                    advance_timer(app.time, ticker.advance);
                    update_vector(app.vector, ticker.advance);
                    update_key_states();

                    if(app.do_resize)
                    {
                        console.log('resized');
                        app.do_resize = false;
                        app.resize = false;
                        app.resize_timer = 0;
                    }
                    clear_stacks();
                }

                if(ticker.frames_to_tick > 0)
                {
                    render_vector(app.vector);
                    clear_stacks();
                }
                
                update_debug_fps();

            break;
        }
    }

    clear_stacks();
}function Debug_Tools()
{
	var r = {};
	r.mode = 'console';
	r.menu_open = true;

	var container = div('div', 'debug-tools', document.body);
	container.innerHTML =
	`<div class='debug-icons'>
		<div data-option='menu' class='debug-option btn'>
		</div>
		<div data-option='console' class='debug-option btn'>
			<svg viewBox='0 0 40 40'><path d="M17.9,22.6l-1.2,1.2l-5-5l5-5l1.2,1.2L14,18.8L17.9,22.6z M22.1,22.6l3.9-3.8l-3.9-3.8l1.2-1.2l5,5l-5,5
		L22.1,22.6z"/></svg>
		</div>
	 	<div data-option='fps' class='debug-option btn'>
			<svg viewBox='0 0 40 40'><path d="M13.3,25.4v-6.7h3.4v6.7H13.3z M18.3,25.4V12.1h3.4v13.4H18.3z M23.3,16.3h3.4v9.2h-3.4V16.3z"/></svg>
	 	</div>
	 	<div data-option='sizes' class='debug-option btn'>
			<svg viewBox='0 0 40 40'><path d="M12.5,12.9c0-0.4,0.2-0.8,0.5-1.2c0.3-0.3,0.7-0.5,1.2-0.5h3.3v1.7h-3.3v3.3h-1.7V12.9z M14.2,21.3v3.3h3.3
			v1.7h-3.3c-0.4,0-0.8-0.2-1.2-0.5c-0.3-0.3-0.5-0.7-0.5-1.2v-3.3H14.2z M25.8,11.3c0.4,0,0.8,0.2,1.2,0.5c0.3,0.3,0.5,0.7,0.5,1.2
			v3.3h-1.7v-3.3h-3.3v-1.7H25.8z M25.8,24.6v-3.3h1.7v3.3c0,0.4-0.2,0.8-0.5,1.2c-0.3,0.3-0.7,0.5-1.2,0.5h-3.3v-1.7H25.8z"/></svg>
	 	</div>
	 	<div data-option='options' class='debug-option btn'>
			<svg viewBox='0 0 40 40'><path d="M26.2,19.9l1.8,1.4c0.2,0.1,0.2,0.3,0.1,0.5l-1.7,2.9c-0.1,0.2-0.3,0.2-0.5,0.2l-2.1-0.8
			c-0.5,0.4-1,0.7-1.4,0.8l-0.3,2.2c-0.1,0.2-0.2,0.4-0.4,0.4h-3.4c-0.2,0-0.3-0.1-0.4-0.4l-0.3-2.2c-0.5-0.2-1-0.5-1.4-0.8
			l-2.1,0.8c-0.2,0.1-0.4,0-0.5-0.2L12,21.9c-0.1-0.2-0.1-0.4,0.1-0.5l1.8-1.4c0-0.2,0-0.5,0-0.8c0-0.4,0-0.6,0-0.8L12,16.9
			c-0.2-0.1-0.2-0.3-0.1-0.5l1.7-2.9c0.1-0.2,0.3-0.2,0.5-0.2l2.1,0.8c0.5-0.4,1-0.7,1.4-0.8l0.3-2.2c0.1-0.2,0.2-0.4,0.4-0.4h3.4
			c0.2,0,0.3,0.1,0.4,0.4l0.3,2.2c0.5,0.2,1,0.5,1.4,0.8l2.1-0.8c0.2-0.1,0.4,0,0.5,0.2l1.7,2.9c0.1,0.2,0.1,0.4-0.1,0.5l-1.8,1.4
			c0,0.2,0,0.5,0,0.8C26.2,19.5,26.2,19.8,26.2,19.9z M17.9,21.2c0.6,0.6,1.3,0.9,2.1,0.9c0.8,0,1.5-0.3,2.1-0.9
			c0.6-0.6,0.9-1.3,0.9-2.1c0-0.8-0.3-1.5-0.9-2.1c-0.6-0.6-1.3-0.9-2.1-0.9c-0.8,0-1.5,0.3-2.1,0.9c-0.6,0.6-0.9,1.3-0.9,2.1
			C17.1,19.9,17.4,20.6,17.9,21.2z"/></svg>
	 	</div>
	 	<div data-option='info' class='debug-option btn'>
			<svg viewBox='0 0 40 40'><path d="M25.8,12.1c0.4,0,0.8,0.2,1.2,0.5c0.3,0.3,0.5,0.7,0.5,1.2v11.6c0,0.4-0.2,0.8-0.5,1.2
			c-0.3,0.3-0.7,0.5-1.2,0.5H14.2c-0.4,0-0.8-0.2-1.2-0.5c-0.3-0.3-0.5-0.7-0.5-1.2V13.7c0-0.4,0.2-0.8,0.5-1.2
			c0.3-0.3,0.7-0.5,1.2-0.5h3.5c0.2-0.5,0.5-0.9,0.9-1.2c0.4-0.3,0.9-0.5,1.4-0.5s1,0.2,1.4,0.5c0.4,0.3,0.7,0.7,0.9,1.2H25.8z
			 M24.2,17.1v-1.7h-8.4v1.7H24.2z M24.2,20.4v-1.6h-8.4v1.6H24.2z M21.7,23.7v-1.7h-5.9v1.7H21.7z M20.6,12.3
			c-0.2-0.2-0.4-0.2-0.6-0.2s-0.4,0.1-0.6,0.2s-0.2,0.4-0.2,0.6s0.1,0.4,0.2,0.6c0.2,0.2,0.4,0.3,0.6,0.3s0.4-0.1,0.6-0.3
			c0.2-0.2,0.2-0.4,0.2-0.6S20.7,12.4,20.6,12.3z"/></svg>
	 	</div>
	 </div>`;

	// Menu
	find('div[data-option=menu]').addEventListener('click', function()
	{
		if(r.menu_open === true)
		{
			dom_hide(r.screen_sizes.container);
			dom_hide(r.options.container);
			dom_hide(r.fps.container);
			dom_hide(r.info.container);
			dom_hide(r.console.container);
			r.menu_open = false;
			var options = find_all('.debug-option');
			for(var	i = 1; i < options.length; ++i)
				dom_hide(options[i]);
		}
		else
		{
			var options = find_all('.debug-option');
			for(var	i = 1; i < options.length; ++i)
				dom_show(options[i]);
			r.menu_open = true;
		}
	});

	// Console

	r.console = Debug_Console();
	container.appendChild(r.console.container);
	find('div[data-option=console]').addEventListener('click', function()
	{
		if(r.mode === 'console') 
		{
			dom_hide(r.console.container);
			return;
		}
		r.mode = 'console';
		dom_hide(r.screen_sizes.container);
		dom_hide(r.options.container);
		dom_hide(r.fps.container);
		dom_hide(r.info.container);

		dom_show(r.console.container);
	});

	// Fps

	r.fps = Debug_FPS();
	container.appendChild(r.fps.container);
	find('div[data-option=fps]').addEventListener('click', function()
	{
		if(r.mode === 'fps') 
		{
			dom_hide(r.fps.container);
			return;
		}
		r.mode = 'fps';
		dom_hide(r.screen_sizes.container);
		dom_hide(r.options.container);
		dom_hide(r.console.container);
		dom_hide(r.info.container);

		dom_show(r.fps.container);

	});

	// Screen sizes
	r.screen_sizes = Debug_Screen_Sizes();
	container.appendChild(r.screen_sizes.container);
	find('div[data-option=sizes]').addEventListener('click', function()
	{
		if(r.mode === 'sizes') 
		{
			dom_hide(r.screen_sizes.container);
			return;
		}
		r.mode = 'sizes';
		dom_hide(r.console.container);
		dom_hide(r.options.container);
		dom_hide(r.fps.container);
		dom_hide(r.info.container);
		
		dom_show(r.screen_sizes.container);
	});

	// Options

	r.options = Debug_Options();
	container.appendChild(r.options.container);
	find('div[data-option=options]').addEventListener('click', function()
	{
		if(r.mode === 'options') 
		{
			dom_hide(r.options.container);
			return;
		}
		r.mode = 'options';
		dom_hide(r.console.container);
		dom_hide(r.screen_sizes.container);
		dom_hide(r.fps.container);
		dom_hide(r.info.container);

		dom_show(r.options.container);
	});

	// Info

	r.info = Debug_GPU();
	container.appendChild(r.info.container);
	find('div[data-option=info]').addEventListener('click', function()
	{
		if(r.mode === 'info') 
		{
			dom_hide(r.info.container);
			return;
		}
		r.mode = 'info';
		dom_hide(r.console.container);
		dom_hide(r.screen_sizes.container);
		dom_hide(r.fps.container);
		dom_hide(r.options.container);

		dom_show(r.info.container);

	});

	return r;
}function Debug_Console()
{
	var r = {};
	r.log = console.log;
	r.warn = console.warn;
	r.error = console.error;
	r.slots = new Array(10);
	r.slot_index = 0;
	r.container = div('div', 'debug-console ns np hidden');

	for(var i = 0; i < r.slots.length; ++i)
	{
		var item = document.createElement('p');
		r.container.appendChild(item);
		r.slots[i] = item;
	}

	/*
	console.log = function(e)
	{
		var item = r.slots[r.slot_index];
		item.style.background = '#1a1a1a';
		item.style.color = 'white';
		item.innerHTML = e.toString();
		r.slot_index++;
		if(r.slot_index > 8)
		{
			r.slot_index = 0
		}
		r.log(e);
	}
	console.warn = function(e)
	{
		var item = r.slots[r.slot_index];
		item.style.background = 'rgba(255,255,0,0.5)';
		item.style.color = 'white';
		item.innerHTML = e.toString();
		r.slot_index++;
		if(r.slot_index > 8)
		{
			r.slot_index = 0
		}
		r.warn(e);
	}
	console.error = function(e)
	{
		var item = r.slots[r.slot_index];
		item.style.background = 'red';
		item.style.color = 'black';
		item.innerHTML = e.toString();
		r.slot_index++;
		if(r.slot_index > 8)
		{
			r.slot_index = 0
		}
		r.error(e);
	}
	*/
	
	return r;
}
function Debug_Screen_Sizes(sizes)
{
	var r = {};
	var sizes = 
	[
		0,0, 100,
		360,640, 17.69,
		375,667, 13.62,
		375,812, 5.79,
		360,740, 4.84,
		1920,1080, 4.75,
		412,846, 4.6,
		414,736, 4.33,
		1366,768, 4.3,
		360,720, 3.65,
		412,732, 2.4,
		320,568, 1.99,
		1440,900, 1.9,
		414,869, 1.57,
		1536,864, 1.48,
		412,869, 1.39,
		1280,800, 1.13,
		1600,900, 1.1,
		360,780, 1.0,
		360,760, 0.98,
		1280,720, 0.95,
		768,1024, 0.89,
		393,786, 0.83,
		1680,1050, 0.8,
		320,570, 0.68,
		412,823, 0.65,
		412,892, 0.65,
	];
	r.sizes = sizes;

	var container = div('div', 'debug-screen-list hidden');
	var n = sizes.length;
	for(var i = 0; i < n; i+=3)
	{
		var item = div('p', 'btn ns', container);
		item.setAttribute('data-w', sizes[i]);
		item.setAttribute('data-h', sizes[i+1]);
		item.innerHTML = sizes[i] + ' x ' + sizes[i+1];
		item.addEventListener('click', on_screen_size_click);
		item.addEventListener('mouseover', on_screen_size_hover);
		container.appendChild(item); 
	}

	r.container = container;
	return r;
}

function draw_screen_sizes(camera)
{
	set_viewport(camera.view)

	var ctx = app.gl_draw;
	var sizes = app.debug_tools.screen_sizes.sizes;

	var w = app.view[2];
	var h = app.view[3];
	var x = 0;
	var y = 0;
	var cx = w/2;
	var cy = h/2;

	var v3 = vec3_stack.index;
	var a = _Vec3();
	var b = _Vec3();
	var c = _Vec3();
	var d = _Vec3();

	var n = sizes.length-1;
	for(var i = n; i > 0; i-=3)
	{
		x = (sizes[i-2]) / 2;
		y = (sizes[i-1]) / 2;
		var t = (sizes[i] * 4) / 100;

		if(i === 2) set_vec4(ctx.color, 1,0,1,1);
		else set_vec4(ctx.color, 1,1,1,t);

		set_vec3(a, cx - x, cy - y, 0.0);
		set_vec3(b, cx + x, cy - y, 0.0);
		set_vec3(c, cx + x, cy + y, 0.0);
		set_vec3(d, cx - x, cy + y, 0.0);

		draw_line(ctx, a,b);
		draw_line(ctx, b,c);
		draw_line(ctx, c,d);
		draw_line(ctx, d,a);
	}

	render_gl_draw(ctx, camera);
	vec3_stack.index = v3;
}

function on_screen_size_click(e)
{
	var item = e.target;
	var w = item.getAttribute('data-w') / app.res;
	var h = item.getAttribute('data-h') / app.res;
	
	var container = find('.canvas-container');
	container.style.width = w + 'px';
	container.style.height = h + 'px';

	app.do_resize = true;
}

function on_screen_size_hover(e)
{
	var item = e.target;
	var w = item.getAttribute('data-w');
	var h = item.getAttribute('data-h');

	var sizes = app.debug_tools.screen_sizes.sizes;
	sizes[0] = w;
	sizes[1] = h;
}function Debug_FPS()
{
	var r = {};
	var container = div('div', 'debug-fps ns hidden');
	container.innerHTML =
	`
	<canvas></canvas>
 	<p>30 fps</p>
 	<div data-fps='default' class='btn'>rAF</div>
 	<div data-fps='60' class='btn'>60</div>
 	<div data-fps='30' class='btn'>30</div>
 	<div data-fps='24' class='btn'>24</div>
 	<div data-fps='15' class='btn'>15</div>
	`;
	r.container = container;

	r.frame_count = 150;
	var canvas = container.querySelector('canvas');
	canvas.width = r.frame_count;
	canvas.height = 75;
	r.canvas = canvas;

	var buttons = container.querySelectorAll('.btn');
	for(var i = 0; i < buttons.length; ++i)
	{
		buttons[i].addEventListener('click', on_fps_click);
	}

	r.ctx = canvas.getContext('2d');

	r.frames = new Int32Array(r.frame_count);
	r.fps = container.querySelector('p');

	return r;
}

function update_debug_fps()
{
	var r = app.debug_tools.fps;
	var fps = round_to(1/app.ticker.advance, 0);

	var f = r.frames;
	var n = r.frame_count - 1;
	for(var i = 0; i < n; ++i)
	{
		f[i] = f[i+1];
	}
	f[n] = fps;

	var ctx = r.ctx;
	var w = r.canvas.width;
	var h = r.canvas.height;
	ctx.fillStyle = '#000000';
	ctx.fillRect(0,0,w,h);

	var px = 0;
	var step = 1;//(w / r.frame_count) | 0;

	ctx.fillStyle = '#FFFFFF';

	for(var i = 0; i < r.frame_count; ++i)
	{
		var dt = (f[i] * 0.5) | 0;
		ctx.fillRect(px, h-dt, step, 1);
		px += step;
	}

	r.fps.innerHTML = fps + ' fps ';
}

function on_fps_click(e)
{
	var fps = e.target.getAttribute('data-fps');

	if(fps === 'default')
	{
		app.ticker.fixed_update = false;
	}
	else
	{
	 	fps = fps | 0;
		app.ticker.fixed_update = true;
		app.ticker.fixed_dt = 1/fps;
	}
}function Debug_Options()
{
    var r = {};

    var ops = 
    {
        ax: 1.0,
        ay: 0.50,
        bx: 1.0,
        by: 1.0,
        cx: 1.0,
        cy: 10.0,
        dx: 1.0,
        dy: 1.0,
    };

    var gui = new dat.GUI();
    gui.add(ops, 'ax', 0,1,0.001);
    gui.add(ops, 'ay', 0,1,0.001);
    gui.add(ops, 'bx', 0.0,1.0,0.01);
    gui.add(ops, 'by', 0.0,1.0,0.01);
    gui.add(ops, 'cx', 0.0,1.0,0.01);
    gui.add(ops, 'cy', 0.0,30.0,0.01);
    gui.add(ops, 'dx', 0.0,30.0,0.01);
    gui.add(ops, 'dy', 0.0,1.0,0.01);

    var cont = div('div', 'debug-options hidden');
    cont.appendChild(gui.domElement);
    document.body.appendChild(cont);

    r.options = ops;
    r.container = cont;
    return r;
}
function Debug_GPU()
{
	var info = app.gl_info;

	var r = {};
	var container = div('div', 'debug-info ns hidden');
	r.container = container;

	//extensions

	for(var k in info.extensions)
	{
		var item = div('p');
		item.innerHTML = k;
		if(info.extensions[k] === true)
		{
			item.setAttribute('class', 'enabled');
		}
		else
		{
			item.setAttribute('class', 'disabled');
		}
		container.appendChild(item);
	}

	//params

	for(var k in info.parameters)
	{
		var item = div('p');
		item.innerHTML = k + ': ' + info.parameters[k];
		container.appendChild(item);
	}

	//gpu

	for(var k in info.info)
	{
		var item = div('p');
		item.innerHTML = k + ': ' + info.info[k];
		container.appendChild(item);
	}

	return r;
}function set_language(lang)
{
    console.log('Setting language: ' + lang);
    app.language = lang;
}

function get_translated_text(key)
{
	if(!app.translations) return key;
	var result = app.translations[key]
	if(!result) return key;
	return result;
}function Vector()
{
	var r = {};

	r.camera = Perspective_Camera(app.view);
	r.ui_camera = UI_Camera(app.view);

	update_camera_projection(r.camera, app.view);
	update_camera_projection(r.ui_camera, app.view);

	r.root = Entity(0,0,-3);

	
	var font = app.assets.fonts.noto_jp;
	font.atlas = app.assets.textures.noto_jp;
	var style = Text_Style(font);
	r.japanese = Text_Mesh(style, 'こんにちはÇéâêîôûàèùëïü');
	r.japanese.position[2] = -10;
	r.japanese.position[1] = 5;
	set_vec3(r.japanese.scale, 0.1,0.1,1.0);
	update_mesh(r.japanese.mesh);

	return r;
}

function update_vector(r, dt)
{
	if(app.do_resize)
	{
		var view = app.view;
		set_vec3(r.ui_camera.position, view[2] / 2, view[3] / 2, 0);
		update_camera_projection(r.camera, view);
		update_camera_projection(r.ui_camera, view);
	}

	//rotate_entity(r.root, _Vec3(dt * 15, dt * 20, dt * 30));
	rotate_entity(r.root, _Vec3(0, 0, dt * 30));

	update_entity(r.root);
	update_entity(r.japanese);


	free_look(r.camera, dt, 80);
	update_camera(r.camera);
	update_camera(r.ui_camera);
}

function render_vector(r)
{
	var shaders = app.assets.shaders;
	var meshes = app.assets.meshes;
	var textures = app.assets.textures;
	var camera = r.camera;
	var m4 = _Mat4();
	var m3 = _Mat3();

	set_mvp(m4, r.root, camera);
	set_normal_matrix(m3, r.root, camera);

	set_viewport(camera.view);
	clear_screen();
	//disable_depth_testing();

	enable_alpha_blending();
	set_shader(shaders.normal);
	set_uniform('mvp', m4);
	set_uniform('normal_matrix', m3);
	//draw_mesh(meshes.cube);
	draw_mesh(meshes.pyramid);


	set_shader(shaders.text)
	mat4_mul(m4, r.japanese.world_matrix, camera.view_projection);
    set_uniform('mvp', m4);
    set_uniform('texture', r.japanese.style.font.atlas);
    draw_mesh(r.japanese.mesh);

    /*
    set_shader(shaders.texture);
    set_uniform('mvp', camera.view_projection);
    set_uniform('image', textures.boat);
    draw_mesh(meshes.pyramid);
    */

	if(app.debug_tools.mode === 'sizes')
	{
		draw_screen_sizes(r.ui_camera);
	}
}