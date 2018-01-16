https://stackedit.io/app

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
