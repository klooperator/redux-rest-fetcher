import { isObject, isFunction } from "lodash";

/* import  */

const errors = {
  PREFETCH_NOT_A_FUNCTION:
    "Prefetch is expected to be a function. I dont know what I have here...",
  PARAMS_NOT_OBJECT: "Error with params. You shoud pass object as params.",
  PARAM_OBJECT_ERROR:
    "Error, your object, in params... There is something wrong with it."
};

/**
 * Merges 2 object recursavly, overriding values from second to first object.
 * @param {Obect} obj1 - firs object, will be overriden
 * @param {Obect} obj2 - second object
 */
const mergeTwo = (obj1, obj2) => {
  const _obj2 = obj2;
  let out = {};
  Object.keys(obj1).forEach(k => {
    if (typeof obj1[k] === "object" && obj1[k].constructor !== Array) {
      if (obj2[k] && typeof obj2[k] === "object") {
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
 * Merges multiple objects recursevly
 * @param {Spread of objects} args
 */
const deepMerge = (...args) => {
  let out = {};
  args.forEach(e => {
    if (e.constructor === Object) out = mergeTwo(out, e);
  });
  return out;
};

class Communicator {
  constructor(baseUrl = "localhost:3000", dispatch = null) {
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
  }

  /**
   * Function used for constructing url and inserting parametars in to the
   * predefined holders.
   * @example
   * baseUrl = localhost
   * url = /url/:id
   * request = {id: '22'}
   * output = localhost/url/22
   * Function also accepts absolute url, in which case will skip adding base url.
   * Absoulute url must contain http:// or https://
   * @example
   * baseUrl = localhost
   * url = http://someurl.com/url/:id
   * request = {id: '22'}
   * output = someurl.com/url/22
   * @param {Object} - request object
   * @param {String} - original url
   * @return {String} - url with inserted request parametars
   * @memberof Communicator
   */
  constructUrl = (endPointUrl, request) => {
    let url = endPointUrl;
    if (endPointUrl.indexOf("http") === -1) {
      url = `${this.baseUrl}${endPointUrl}`;
    }
    if (isObject(request)) {
      Object.keys(request).forEach(key => {
        const regex = new RegExp(`:${key}`);
        if (regex.test(url)) {
          url = url.replace(regex, request[key]);
        }
        /* console.log(JSON.stringify(url)); */
      });
    }
    return url;
  };

  /**
   * Function that processes params of the request such as body.
   * You can send value either as object or as stringified object
   * @param {Object} - params object
   * @return {Object} - object containing keys and stringified values
   * @memberof Communicator
   */
  processParams = params => {
    /* TODO - separate body and rest. add ability to pass new fetch options overrides */
    if (!isObject(params)) throw errors.PARAMS_NOT_OBJECT;
    const out = {};
    Object.keys(params).forEach(k => {
      switch (typeof params[k]) {
        case "object":
          out[k] = JSON.stringify(params[k]);
          break;
        case "string":
          if (!isObject(JSON.parse(params[k]))) {
            throw errors.PARAM_OBJECT_ERROR;
          } else out[k] = params[k];
          break;
        default:
          break;
      }
    });
    return out;
  };

  /**
   * This is a main fetch function. This will resolve the action and return either a Promise if no
   *  dispatch is provided or it will dispatch
   * success/ failure action to redux.
   * @param {String} url - target url. This will be modified by request object if needed
   * @param {Object} options - options of the request. Options contains data like headers, method
   * type and other data you want to include to fetch request.
   * This will be merged with baseOptions ( globals you can set at creation, options that apply to
   *  all) and param options. Param options contains aditional
   * data like body or can modifiy request overriding baseOptions and setted request options.
   * @param {Object} request - object containing request data that will modify end URL. TODO -
   * maybe move body params here...
   * @param {String} name - Name of the api action. Based on name a appropriate action will be
   * dispatched.
   * @param {Boolean} useEmptyHeaders - if true, empty headers will be sent.
   */
  baseFetch = (
    url,
    options = {},
    request = {},
    params = {},
    name,
    useEmptyHeaders = false
  ) => {
    /* construct url */
    const endPointUrl = this.constructUrl(url, request);
    /* set params */
    let _params;
    try {
      _params = this.processParams(params);
    } catch (e) {
      console.log(e.message);
      return e;
    }
    /* merge (TODO deep) baseOptions<-options<-params options */
    /* let endOption = Object.assign({}, this.baseOptions, options, _params); */
    let endOption = deepMerge(this.baseOptions, options, _params);
    /* clear headers if needed */
    if (useEmptyHeaders) endOption = { headers: {} };
    /* if no dispatch return promise */
    if (!this.dispatch || this.dispatch === null) {
      console.log("no dispatch");
      return this.fetch(endPointUrl, endOption);
    }
    /* dispatch action start */
    this.dispatch(this.actionStart(name, endPointUrl, endOption));
    /* fetch part */
    let res;
    this.fetch(endPointUrl, endOption)
      .then(response => {
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
      })
      .then(json => {
        this.dispatch(this.actionEnd(name, json[0], json[1]));
      })
      .catch(e => {
        this.dispatch(this.actionError(name, res, e.message));
      });
    return true;
  };

  /**
   * Function that creates functions from objects
   * @param {Object} endpoints - object from witch function will be created.
   * Keys will be the function names.
   * @memberof Communicator
   */
  setEndpoints = endpoints => {
    Object.keys(endpoints).forEach(k => {
      const { url, prefetch, reducer, options, useEmptyHeaders } = endpoints[k];

      if (reducer) this.reducerPool[k] = reducer;
      else this.reducerPool[k] = this.constructGenericReducer(k);

      this[k] = (request = {}, params = {}) => {
        if (prefetch && isFunction(prefetch)) {
          this.resolvePrefetch(prefetch, url, request, params);
        } else {
          this.baseFetch(url, options, request, params, k, useEmptyHeaders);
        }
      };
    });
  };

  /**
   * Reducer you export to your store.
   * This will extract name of the function ( as it containes prefix and sufix).
   * Calls generic reducr set for given name.
   * @param {Object} state - state
   * @param {Object} action - action
   * @memberof Communicator
   */
  reducer = (state = this.genererateInitialState(), action) => {
    if (action.type.indexOf(this.basePrefix) === -1) return state;
    let name = action.type.substring(this.basePrefix.length);
    if (name.indexOf("_success") !== -1) {
      name = name.replace("_success", "");
    }
    if (name.indexOf("_fail") !== -1) {
      name = name.replace("_fail", "");
    }
    return this.reducerPool[name](state, action);
  };

  /**
   * reducer for specific function name
   * @param {String} k - name of the function
   * @param {Object} state - state
   * @param {Object} action - action
   * @memberof Communicator
   */
  constructGenericReducer = k => (state, action) => {
    const newState = { ...state };
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

  /**
   * Function that creates initial state for each api call for reducer.
   * @returns state for api reducer
   */
  genererateInitialState = () => {
    const state = {};
    state.isLoading = false;
    Object.keys(this.reducerPool).forEach(k => {
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

  /**
   * Function that creates redux action.
   * Adds pefix to type
   * @param {String} name - name of the action
   * @param {Object} request - payload item
   * @param {Object} params - payload item
   */
  actionStart = (name, request, params) => ({
    type: `${this.basePrefix}${name}`,
    /* name, */
    loading: true,
    payload: {
      request,
      params
    }
  });
  /**
   * Function that creates redux action.
   * Adds sufix to type
   * @param {String} name - name of the action
   * @param {Object} request - payload item
   * @param {Object} params - payload item
   */
  actionEnd = (name, data, msg = {}) => ({
    type: `${this.basePrefix}${name}_success`,
    /* name, */
    loading: false,
    payload: {
      data,
      msg
    }
  });
  /**
   * Function that creates redux action.
   * Adds sufix to type
   * @param {String} name - name of the action
   * @param {Object} request - payload item
   * @param {Object} params - payload item
   */
  actionError = (name, msg = {}, error) => ({
    type: `${this.basePrefix}${name}_fail`,
    loading: false,
    payload: {
      msg,
      error
    }
  });

  /* TODO prefetch */
  /* resolvePrefetch = (prefetch, url, request, params) => {
    if (!prefetch || !_.isFunction(prefetch)) {
      console.log(errors.PREFETCH_NOT_A_FUNCTION);
      return false;
    }
    this.baseFetch();
  }; */

  getReducer = () => this.reducer;
  setBaseUrl = url => {
    this.baseUrl = url;
  };
  setDispatcher = dispatch => {
    this.dispatch = dispatch;
  };
  setPrefix = prefix => {
    this.basePrefix = prefix;
  };
  setFetch = _fetch => {
    this.fetch = _fetch;
  };
}

export default new Communicator();
