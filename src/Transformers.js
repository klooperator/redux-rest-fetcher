import { isObject, isArray, toPlainObject, toArray } from "lodash";

const object = (data = {}) => {
  if (isObject(data)) return data;
  return toPlainObject(data);
};
const array = (data = []) => {
  if (isArray) return data;
  return toArray(data);
};

const cumulativeArray = check => (data, oldData=[]) =>{
    if(!data)return oldData;
    if(!check)return oldData.concat(isArray(data) ? data : toArray(data));

}

export default {
  object,
  array
};
