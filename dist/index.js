(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash')) :
	typeof define === 'function' && define.amd ? define(['exports', 'lodash'], factory) :
	(factory((global.reduxrestfetcher = {}),global.lodash));
}(this, (function (exports,lodash) {

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};









var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/* import  */

/**
 * @description Error object containing error messages
 * @todo Implement proper error objects
 * @memberof Communicator
 */
var errors = {
  PREFETCH_NOT_A_FUNCTION: "Prefetch is expected to be a function. I dont know what I have here...",
  PARAMS_NOT_OBJECT: "Error with params. You shoud pass object as params.",
  PARAM_OBJECT_ERROR: "Error, your object, in params... There is something wrong with it."
};

/**
 * @description Merges 2 object recursavly, overriding values from second to first object.
 * @param {Obect} obj1 - firs object, will be overriden
 * @param {Obect} obj2 - second object
 */
var mergeTwo = function mergeTwo(obj1, obj2) {
  var _obj2 = obj2;
  var out = {};
  Object.keys(obj1).forEach(function (k) {
    if (_typeof(obj1[k]) === "object" && obj1[k].constructor !== Array) {
      if (obj2[k] && _typeof(obj2[k]) === "object") {
        out[k] = mergeTwo(obj1[k], obj2[k]);
      } else {
        out[k] = obj1[k];
      }
    } else if (obj1[k].constructor === Array) {
      out[k] = obj1[k];
      if (obj2[k] && obj2[k].constructor === Array) {
        out[k] = obj1[k].concat(obj2[k]);
      }
    } else if (obj2[k]) {
      out[k] = obj2[k];
    } else out[k] = obj1[k];
    delete _obj2[k];
  });
  out = Object.assign({}, out, _obj2);
  return out;
};
/**
 * @description Merges multiple objects recursevly
 * @param {Spread of objects} args
 */
var deepMerge = function deepMerge() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var out = {};
  args.forEach(function (e) {
    if (e.constructor === Object) out = mergeTwo(out, e);
  });
  return out;
};

var Communicator = function Communicator() {
  var baseUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "localhost:3000";
  var dispatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  classCallCheck(this, Communicator);

  _initialiseProps.call(this);

  this.baseUrl = baseUrl;
  this.dispatch = dispatch;
  this.fetch = fetch.bind(window);
  this.reducerPool = {};
  this.basePrefix = "api(.)(.)";
  this.baseOptions = {
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cache: "no-cache",
      credentials: "same-origin"
    }
  };
};

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.constructUrl = function (endPointUrl, request) {
    var url = endPointUrl;
    var excluded = ["body", "GET"];
    if (endPointUrl.indexOf("http") === -1) {
      url = "" + _this.baseUrl + endPointUrl;
    }
    if (lodash.isObject(request)) {
      Object.keys(request).forEach(function (key) {
        if (excluded.indexOf(key) === -1) {
          var regex = new RegExp(":" + key);
          if (regex.test(url)) {
            url = url.replace(regex, request[key]);
          }
        } else if (key === "GET") {
          url = url + _this.getGetParamsAsString(request[key]);
        }
      });
    }
    return url;
  };

  this.getGetParamsAsString = function (getObj) {
    var out = "?";
    Object.keys(getObj).forEach(function (k, i) {
      if (_typeof(getObj[k]) !== "object" && typeof getObj[k] !== "function") out = out + (i !== 0 ? "&" : "") + k + "=" + getObj[k];
    });
    return out;
  };

  this.getBody = function (request) {
    if (!request.body) return false;
    if (typeof request.body === "string" && lodash.isObject(JSON.parse(request.body))) return { body: request.body };
    if (lodash.isObject(request.body)) return { body: JSON.stringify(request.body) };
    return false;
  };

  this.processParams = function (params) {
    /* TODO - separate body and rest. add ability to pass new fetch options overrides */
    if (!lodash.isObject(params)) throw errors.PARAMS_NOT_OBJECT;
    var out = {};
    Object.keys(params).forEach(function (k) {
      switch (_typeof(params[k])) {
        case "object":
          out[k] = JSON.stringify(params[k]);
          break;
        case "string":
          if (!lodash.isObject(JSON.parse(params[k]))) {
            throw errors.PARAM_OBJECT_ERROR;
          } else out[k] = params[k];
          break;
        default:
          break;
      }
    });
    return out;
  };

  this.baseFetch = function (url) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var request = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var name = arguments[4];
    var useEmptyHeaders = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

    /* construct url */
    var endPointUrl = _this.constructUrl(url, request);
    /* set params */
    var _params = void 0;
    try {
      _params = _this.processParams(params);
    } catch (e) {
      console.log(e.message);
      return e;
    }
    /* merge (TODO deep) baseOptions<-options<-params options */
    /* let endOption = Object.assign({}, this.baseOptions, options, _params); */
    var endOption = deepMerge(_this.baseOptions, options, _params, _this.getBody(request));
    /* clear headers if needed */
    if (useEmptyHeaders) endOption = { headers: {} };
    /* if no dispatch return promise */
    if (!_this.dispatch || _this.dispatch === null) {
      console.log("no dispatch");
      return _this.fetch(endPointUrl, endOption);
    }
    /* dispatch action start */
    _this.dispatch(_this.actionStart(name, endPointUrl, endOption));
    /* fetch part */
    var res = void 0;
    _this.fetch(endPointUrl, endOption).then(function (response) {
      /* this object will be passes to second .then to be included in END dispatch */
      res = {
        ok: response.ok,
        redirected: response.redirected,
        status: response.status,
        type: response.type,
        url: response.url
      };
      if (response.status === 200 || response.ok) {
        return Promise.all([response.json(), Promise.resolve(res)]);
      }
      throw response;
    }).then(function (json) {
      _this.dispatch(_this.actionEnd(name, json[0], json[1]));
    }).catch(function (e) {
      _this.dispatch(_this.actionError(name, res, e.message));
    });
    return true;
  };

  this.setEndpoints = function (endpoints) {
    Object.keys(endpoints).forEach(function (k) {
      var _endpoints$k = endpoints[k],
          url = _endpoints$k.url,
          prefetch = _endpoints$k.prefetch,
          reducer = _endpoints$k.reducer,
          options = _endpoints$k.options,
          useEmptyHeaders = _endpoints$k.useEmptyHeaders;


      if (reducer) _this.reducerPool[k] = reducer;else _this.reducerPool[k] = _this.constructGenericReducer(k);

      _this[k] = function () {
        var request = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (prefetch && lodash.isFunction(prefetch)) {
          _this.resolvePrefetch(prefetch, url, request, params);
        } else {
          _this.baseFetch(url, options, request, params, k, useEmptyHeaders);
        }
      };
    });
  };

  this.reducer = function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.genererateInitialState();
    var action = arguments[1];

    if (action.type.indexOf(_this.basePrefix) === -1) return state;
    var name = action.type.substring(_this.basePrefix.length);
    if (name.indexOf("_success") !== -1) {
      name = name.replace("_success", "");
    }
    if (name.indexOf("_fail") !== -1) {
      name = name.replace("_fail", "");
    }
    return _this.reducerPool[name](state, action);
  };

  this.constructGenericReducer = function (k) {
    return function (state, action) {
      var newState = _extends({}, state);
      newState.isLoading = action.loading;
      if (action.type.indexOf("_success") !== -1) {
        newState[k].data = action.payload.data;
        newState[k].ok = action.payload.msg.ok;
        newState[k].redirected = action.payload.msg.redirected;
        newState[k].status = action.payload.msg.status;
        newState[k].type = action.payload.msg.type;
      } else if (action.type.indexOf("_fail") !== -1) {
        newState[k].ok = action.payload.msg.ok;
        newState[k].redirected = action.payload.msg.redirected;
        newState[k].status = action.payload.msg.status;
        newState[k].type = action.payload.msg.type;
        newState[k].error = action.payload.error;
      } else {
        newState[k].request = action.payload.request;
        newState[k].params = action.payload.params;
      }
      return newState;
    };
  };

  this.genererateInitialState = function () {
    var state = {};
    state.isLoading = false;
    Object.keys(_this.reducerPool).forEach(function (k) {
      state[k] = {
        request: "",
        params: "{}",
        data: undefined,
        ok: undefined,
        redirected: undefined,
        status: 0,
        type: ""
      };
    });
    return state;
  };

  this.actionStart = function (name, request, params) {
    return {
      type: "" + _this.basePrefix + name,
      /* name, */
      loading: true,
      payload: {
        request: request,
        params: params
      }
    };
  };

  this.actionEnd = function (name, data) {
    var msg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return {
      type: "" + _this.basePrefix + name + "_success",
      /* name, */
      loading: false,
      payload: {
        data: data,
        msg: msg
      }
    };
  };

  this.actionError = function (name) {
    var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var error = arguments[2];
    return {
      type: "" + _this.basePrefix + name + "_fail",
      loading: false,
      payload: {
        msg: msg,
        error: error
      }
    };
  };

  this.getReducer = function () {
    return _this.reducer;
  };

  this.setBaseUrl = function (url) {
    _this.baseUrl = url;
  };

  this.setDispatcher = function (dispatch) {
    _this.dispatch = dispatch;
  };

  this.setPrefix = function (prefix) {
    _this.basePrefix = prefix;
  };

  this.setFetch = function (_fetch) {
    _this.fetch = _fetch.bind(window);
  };

  this.setBaseOptions = function (options) {
    _this.baseOptions = options;
  };
};

var Communicator$1 = new Communicator();

exports['default'] = Communicator$1;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
