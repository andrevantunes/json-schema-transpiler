const ARRAY_REGEXP = /\[\d+\]/;
const ARRAY_STAR_REGEXP = /\[\*\]/;

export const getValueByKey = (data: any, key: string): unknown => {
  if (typeof data !== "object" || data === null) return undefined;

  const [k, ...keys] = key.split(".");
  const subKey = keys.join(".");

  const subData = getSubData(data, k as string);
  if (keys.length === 0) return subData;
  if (Array.isArray(subData)) return getArrayData(subData, subKey);
  return getValueByKey(subData, subKey);
};

const getArrayData = (data: any[], key: string): unknown[] => {
  const value = data.map((dataItem) => getValueByKey(dataItem, key));
  if (value.every((item) => typeof item === "undefined")) return [];
  return value;
};

const getSubData = (data: any, key: string): any => {
  if (ARRAY_STAR_REGEXP.test(key)) return getArrayByStarKey(data, key);
  if (ARRAY_REGEXP.test(key)) return getArrayItemByKey(data, key);
  return data[key];
};

const getArrayByStarKey = (data: any, key: string): unknown[] => {
  const k = key.replace(ARRAY_STAR_REGEXP, "");
  return data[k];
};

const getArrayItemByKey = (data: any, key: string): unknown => {
  const index = Number(key.replace(/\D/g, ""));
  const k = key.replace(ARRAY_REGEXP, "");
  const value = data[k];
  if (typeof value === "undefined") return undefined;
  return value[index];
};
