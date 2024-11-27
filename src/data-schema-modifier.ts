import type { Data, Modifiers, ObjectSchema } from "./data-schema-modifier.types";
import { getValueByKey } from "./objects.helper";

const INTERPOLATED_REGEXP = /{{(.+?)}}/g;

export const dataSchemaModifier = (data?: any, schema?: any, modifiers?: Modifiers): any => {
  if (!isValidObjectFormat(data)) return schema;

  if (typeof schema === "string") {
    return stringInterpolation(data, schema, modifiers);
  }

  if (Array.isArray(schema)) {
    return arrayInterpolation(data, schema, modifiers);
  }

  if (isValidObjectFormat(schema)) {
    return objectInterpolation(data, schema, modifiers);
  }

  return schema;
};

const hasInterpolation = (schema: any) =>
  typeof schema === "string" && INTERPOLATED_REGEXP.test(schema);

const isValidObjectFormat = (value?: any) => {
  return typeof value === "object" && value !== null;
};

const getInterpolatedKeys = (schema: string) => {
  const values: { valueKey: string; modifiersKeys: string[] }[] = [];
  schema.replace(INTERPOLATED_REGEXP, (_s, match: string) => {
    const [valueKey, ...modifiersKeys] = match.split("|");
    values.push({
      valueKey: (valueKey as string).trim(),
      modifiersKeys: modifiersKeys.map((key) => key.trim()),
    });
    return "";
  });
  return values;
};

const isValidArraySchema = (schema: any, data: any) => {
  if (Array.isArray(schema) == false || schema.length !== 2) return false;
  if (typeof schema[0] !== "string" || typeof schema[1] !== "object") return false;

  const key = schema[0].replace(INTERPOLATED_REGEXP, "$1").trim();
  return Array.isArray(data[key]);
};

const objectInterpolation = (data: Data, schema: ObjectSchema, modifiers?: Modifiers) => {
  const result: ObjectSchema = {};
  for (const key in schema) {
    const subSchema = schema[key];
    if (typeof subSchema === "string") {
      result[key] = stringInterpolation(data, subSchema, modifiers);
    } else if (isValidObjectFormat(subSchema)) {
      result[key] = dataSchemaModifier(data, subSchema, modifiers);
    } else {
      result[key] = subSchema;
    }
  }
  return result;
};

const arrayInterpolation = (data: Data, schema: any[], modifiers?: Modifiers) => {
  if (isValidArraySchema(schema, data)) {
    const key = schema[0].replace(INTERPOLATED_REGEXP, "$1").trim();
    return data[key].map((row: any) => dataSchemaModifier(row, schema[1], modifiers));
  }

  const firstElement = schema[0];
  if (!hasInterpolation(firstElement)) {
    const result: any[] = [];
    schema.forEach((schemaItem) => {
      if (isValidArraySchema(schemaItem, data)) {
        const key = schemaItem[0].replace(INTERPOLATED_REGEXP, "$1").trim();
        return data[key].forEach((row: any) => {
          result.push(dataSchemaModifier(row, schemaItem[1], modifiers));
        });
      }
      result.push(dataSchemaModifier(data, schemaItem, modifiers));
    });
    return result;
  }

  const subSchema = schema[1];
  const subKey = firstElement.replace(INTERPOLATED_REGEXP, "$1").trim();
  const subData = getValueByKey(data, subKey);
  const result = getArrayValue(subData, subSchema, modifiers);
  if (result.length > 0) return result;
  const defaultValue = schema[2];
  return defaultValue ? [].concat(defaultValue) : result;
};

const getArrayValue = (subData: any, subSchema: any, modifiers?: Modifiers) => {
  if (!Array.isArray(subData)) return [];
  return subData.map((data) => dataSchemaModifier(data, subSchema, modifiers));
};

const stringInterpolation = (data: Data, schema: string, modifiers?: Modifiers) => {
  const interpolatedKeys = getInterpolatedKeys(schema);
  let item = schema;
  for (const { valueKey, modifiersKeys } of interpolatedKeys) {
    const value = getValue(data, valueKey, modifiersKeys, modifiers);
    if (typeof value === "undefined") return schema;
    const hasInterpolation = Boolean(schema.replace(INTERPOLATED_REGEXP, ""));
    if (typeof value !== "string" && !hasInterpolation) return value;
    item = replaceValue(item, valueKey, String(value));
  }

  return item;
};

const replaceValue = (schema: string, key: string, value: string) => {
  const escapedKey = key.replace(/(\[|\])/g, "\\$1"); // escape colchetes
  const reg = new RegExp(`{{.*?${escapedKey}.*?}}`, "g");
  return schema.replace(reg, value);
};

const getValue = (data: Data, valueKey: string, modifiersKeys: string[], modifiers?: Modifiers) => {
  const value = getValueByKey(data, valueKey);
  if (!modifiers) return value;
  return applyModifiers(value, modifiersKeys, modifiers);
};

const applyModifiers = (value: any, modifierKeys: string[], modifiers: Modifiers) => {
  return modifierKeys.reduce((result: any, key: string) => {
    if (modifiers[key]) {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return modifiers[key](result);
      } catch (error) {
        return result;
      }
    }
    return result;
  }, value);
};
