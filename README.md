# react-redux-fetcher

Small library for creating API endpoint calls and other fetch calls. Can be used in any project, but is meant to be used with redux to dispatch results to store.

Small, treeshaked lodash dependency.

Original at: [https://github.com/klooperator/redux-rest-fetcher](https://github.com/klooperator/redux-rest-fetcher)


## Description & example

This library is influenced by [redux-api](https://github.com/lexich/redux-api), but instead od using FLUX architecture it will put all its calls under one named reducer.

Once setup you can create your calls like this:

```javascript
    calls = {
         login:{
            url: "http://yoursite.com/api/login",
            method: 'post',
            headers:{
                Accept: 'application/json'
                }
         },
         getUser:{
            url: "http://yoursite.com/api/get-user:id",
           method: 'get',
           headers:{
                Accept: 'application/json'
                }
        },
    }
```

After that you just make a call like this:

```javascript
    Api.login({body: logindata});
    Api.getUser({id: userID})
```

## Configuration

To configure it properly you should call an instance of it in you app entry point, right before you create a global store instance.

```javascript
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import api from 'redux-rest-fetcher';
import apiCalls './src/api/calls';

//here you can setup basic configuration that will be valid for all calls.
api.setBaseUrl('http://your-restapi-adress.com');
//you can ommit this, but in case you use other fetch (ex. polyfill) you can set it here
api.setFetch(window.fetch);
//also can be ommited, default is '(.)(.)api'
api.setPrefix('@@api');
//and of course api calls
api.setEndpoints(apiCalls);
```
At this point redux-rest-fetcher is ready to be passed to your store. Extract reducer from it
```javascript
const api = api.getReducer()
```
and pass it to your store to be incorporated in your ```combineReducer()```
```javascript
const rootReducer = combineReducer({
	something,
	api,
	somethingElse
});
```
Once your store is created and populated with ```@@INIT```, pass a dispatcher to api.

```javascript
api.setDispatcher(store.dispatch)
```
Now any time you call you api calls, results will be placed to redux store.

## Creating calls

You create your calls as key value object pairs. Where key will be a name of the function you call and value the call options.
Yo can create multiple files, for ex. each for specific endpoint of your api

```javascript
// /calls/User.js
const enpoint = 'user';
export default {
    login:{
        url: `${endpoint}/login`,
        options: {
            method: 'post',
            headers:{
                accept: 'application/json',
                }
            },
    },
    getGender:{
        url: `${endpoint}/gender/:id`,
        options: {
            headers:{
                Accept: "text/html",
                "Content-Type": "text/html;charset=utf-8",
                }
            },
    }
}
...
// calls/server.js
const enpoint = 'server';
export default {
    refresh:{
        url: `${endpoint}/refresh`,
        options: {
            credentials: 'omit',
            headers:{
                accept: 'application/json',

                }
            },
    },
}
...
// calls/index.js
import User from './User';
import Srv from './Server';
const calls = Object.assign({}, User, Srv);
export default calls;
```

## Overrides and more overrides

There are 3 levels of constructing your request. Base options, options inside your calls and per call options.

Firstly you can set base options. If no other options are set this will be used for each call. In next example we will just implement default options ( this are already in there, if you skip this step, those will be your base options)

```javascript
api.setBaseOptions({
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cache: "no-cache",
        credentials: "same-origin"
      }
    })
```

Then you can override base options with options in call object.In example for ```refresh``` resulting options will be:
```javascript
{
      credentials: "include",
      headers: {
        Accept: "text/html",
        "Content-Type": "text/html;charset=utf-8",
        Cache: "no-cache",
      }
    }
```
In the end you can override request per call by passing second paramater object with desired vaue like this:
```javascript
api.refresh({},{
    headers:{
        Cache: 'force-cache'
        }
    });
//result:
{
      credentials: "include",
      headers: {
        Accept: "text/html",
        "Content-Type": "text/html;charset=utf-8",
        Cache: "force-cache",
      }
    }
```
