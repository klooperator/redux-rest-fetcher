!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("lodash")):"function"==typeof define&&define.amd?define(["exports","lodash"],e):e(t.reduxrestfetcher={},t.lodash)}(this,function(t,h){var i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},l={object:function object(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};return h.isObject(t)?t:h.toPlainObject(t)},array:function array(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:[];return h.isArray?t:h.toArray(t)},cumulativeArray:function cumulativeArray(i){return function(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:[],e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:[];if(!t)return e;if(!i)return e.concat(h.isArray(t)?t:h.toArray(t));var n=[].concat(function(t){if(Array.isArray(t)){for(var e=0,r=Array(t.length);e<t.length;e++)r[e]=t[e];return r}return Array.from(t)}(e));return t.forEach(function(r){var o=!1;e.forEach(function(t,e){r[i]===t[i]&&(n[e]=r,o=!0)}),o||n.push(r)}),n}}},n=["body","GET","expected"],p=[200,201,202,204,205],o="Error with params. You shoud pass object as params.",a="Error, your object, in params... There is something wrong with it.",y=function deepMerge(){for(var t=arguments.length,e=Array(t),r=0;r<t;r++)e[r]=arguments[r];var o={};return e.forEach(function(t){t.constructor===Object&&(o=function mergeTwo(e,r){var o=r,n={};return Object.keys(e).forEach(function(t){"object"===i(e[t])&&e[t].constructor!==Array?r[t]&&"object"===i(r[t])?n[t]=mergeTwo(e[t],r[t]):n[t]=e[t]:e[t].constructor===Array?(n[t]=e[t],r[t]&&r[t].constructor===Array&&(n[t]=e[t].concat(r[t]))):r[t]?n[t]=r[t]:n[t]=e[t],delete o[t]}),n=Object.assign({},n,o)}(o,t))}),o},r=function _initialiseProps(){var f=this;this.getHelpers=function(){return{deepMerge:y,actionEnd:f.actionEnd,actionError:f.actionError}},this.constructUrl=function(t,r){var o=t;return-1===t.indexOf("http")&&(o=""+f.baseUrl+t),h.isObject(r)&&Object.keys(r).forEach(function(t){if(-1===n.indexOf(t)){var e=new RegExp(":"+t);e.test(o)&&(o=o.replace(e,r[t]))}else"GET"===t&&(o+=f.getGetParamsAsString(r[t]))}),o},this.getGetParamsAsString=function(r){var o="?";return Object.keys(r).forEach(function(t,e){"object"!==i(r[t])&&"function"!=typeof r[t]&&(o=o+(0!==e?"&":"")+t+"="+r[t])}),o},this.getBody=function(t){return!!t.body&&("string"==typeof t.body&&h.isObject(JSON.parse(t.body))?{body:t.body}:!!h.isObject(t.body)&&{body:JSON.stringify(t.body)})},this.processParams=function(e){if(!h.isObject(e))throw o;var r={};return Object.keys(e).forEach(function(t){switch(i(e[t])){case"object":r[t]=JSON.stringify(e[t]);break;case"string":if(!h.isObject(JSON.parse(e[t])))throw a;r[t]=e[t]}}),r},this.baseFetch=function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},r=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{},o=3<arguments.length&&void 0!==arguments[3]?arguments[3]:{},n=arguments[4],i=5<arguments.length&&void 0!==arguments[5]&&arguments[5],a=r.expected||"json",s=y(f.baseOptions,e,o);i&&(s={headers:{}});var c={actions:f.actions,getState:f.getState,dispatch:f.dispatch,params:r,options:s,url:t,helpers:f.getHelpers()};f.prefetchPool[n]&&f.getState&&(h.isArray(f.prefetchPool[n])?f.prefetchPool[n]:[f.prefetchPool[n]]).forEach(function(t){var e=t(c);e&&(c=y(c,e))});s=y(c.options,f.getBody(c.params));var d=f.constructUrl(c.url,c.params);if(!f.dispatch||null===f.dispatch)return f.fetch(d,s);f.dispatch(f.actionStart(n,d,s));var u=void 0;return f.fetch(d,s).then(function(t){if(u={ok:t.ok,redirected:t.redirected,status:t.status,type:t.type,url:t.url},-1!==p.indexOf(t.status)||t.ok)return Promise.all([t[a](),Promise.resolve(u)]);throw t}).then(function(t){if(f.dispatch(f.actionEnd(n,t[0],t[1])),f.postfetchPool[n]){var r={actions:f.actions,getState:f.getState,dispatch:f.dispatch,data:t[0],helpers:f.getHelpers()};(h.isArray(f.postfetchPool[n])?f.postfetchPool[n]:[f.postfetchPool[n]]).forEach(function(t){var e=t(r);e&&(r=y(r,e))})}}).catch(function(t){f.dispatch(f.actionError(n,u,t.message))}),!0},this.setEndpoints=function(u){Object.keys(u).forEach(function(o){var t=u[o],n=t.url,e=t.prefetch,r=t.reducer,i=t.options,a=t.useEmptyHeaders,s=t.postfetch,c=t.transformer,d=void 0===c?l.object:c;f.reducerPool[o]=r||f.constructGenericReducer(o),e&&(h.isFunction(e)||h.isArray(e))&&(f.prefetchPool[o]=e),s&&(h.isFunction(s)||h.isArray(s))&&(f.postfetchPool[o]=s),d&&h.isFunction(d)&&(f.transformerPool[o]=d),f[o]=function(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},r=arguments[2];return f.baseFetch(n,i,t,e,o,r||a)},f.actions[o]=f[o]})},this.reducer=function(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:f.genererateInitialState(),e=arguments[1];if(-1===e.type.indexOf(f.basePrefix))return t;var r=e.type.substring(f.basePrefix.length);return-1!==r.indexOf("_success")&&(r=r.replace("_success","")),-1!==r.indexOf("_fail")&&(r=r.replace("_fail","")),f.reducerPool[r](t,e)},this.constructGenericReducer=function(o){return function(t,e){var r=Object.assign({},t);return r[o]=Object.assign({},t[o]),e.loading?(r.isLoading&&r.isLoading.length||(r.isLoading=[]),r.isLoading.push(o)):(r.isLoading&&r.isLoading.length&&-1!==r.isLoading.indexOf(o)&&r.isLoading.splice(r.isLoading.indexOf(o),1),r.isLoading&&0===r.isLoading.length&&(r.isLoading=!1)),-1!==e.type.indexOf("_success")?(r[o].loading=!1,r[o].data=f.transformerPool[o](e.payload.data),r[o].ok=e.payload.msg.ok,r[o].redirected=e.payload.msg.redirected,r[o].status=e.payload.msg.status,r[o].type=e.payload.msg.type):-1!==e.type.indexOf("_fail")?(r[o].loading=!1,r[o].ok=e.payload.msg.ok,r[o].redirected=e.payload.msg.redirected,r[o].status=e.payload.msg.status,r[o].type=e.payload.msg.type,r[o].error=e.payload.error):(r[o].loading=!0,r[o].request=e.payload.request,r[o].params=e.payload.params),r}},this.genererateInitialState=function(){var e={isLoading:!1};return Object.keys(f.reducerPool).forEach(function(t){e[t]={request:"",params:"{}",data:f.transformerPool[t](),ok:void 0,redirected:void 0,status:0,type:""}}),e},this.actionStart=function(t,e,r){return{type:""+f.basePrefix+t,loading:!0,payload:{request:e,params:r}}},this.actionEnd=function(t,e){var r=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{};return{type:""+f.basePrefix+t+"_success",loading:!1,payload:{data:e,msg:r}}},this.actionError=function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},r=arguments[2];return{type:""+f.basePrefix+t+"_fail",loading:!1,payload:{msg:e,error:r}}},this.getReducer=function(){return f.reducer},this.setBaseUrl=function(t){f.baseUrl=t},this.setDispatcher=function(t){f.dispatch=t},this.setPrefix=function(t){f.basePrefix=t},this.setFetch=function(t){f.fetch=t.bind(window)},this.setBaseOptions=function(t){f.baseOptions=t},this.setGetState=function(t){f.getState=t}},e=new function Communicator(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:"",e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,Communicator),r.call(this),this.baseUrl=t,this.dispatch=e,this.fetch=fetch.bind(window),this.reducerPool={},this.prefetchPool={},this.postfetchPool={},this.transformerPool={},this.actions={},this.getState=void 0,this.basePrefix="api(.)(.)",this.baseOptions={credentials:"include",headers:{Accept:"application/json","Content-Type":"application/json",Cache:"no-cache",credentials:"same-origin"}}};t.default=e,Object.defineProperty(t,"__esModule",{value:!0})});