import { isObject, isArray, toPlainObject, toArray } from 'lodash';

const object = (data = {}) => {
  if (isObject(data)) return data;
  return toPlainObject(data);
};
const array = (data = []) => {
  if (isArray) return data;
  return toArray(data);
};

const cumulativeArray = check => (data = [], oldData = []) => {
  if (!data) return oldData;
  if (!check) return oldData.concat(isArray(data) ? data : toArray(data));
  const newData = [...oldData];
  data.forEach((d) => {
    let doesExist = false;
    oldData.forEach((o, i) => {
      if (d[check] === o[check]) {
        newData[i] = d;
        doesExist = true;
      }
    });
    if (!doesExist)newData.push(d);
  });
  return newData;
};

export default {
  object,
  array,
  cumulativeArray,
};
