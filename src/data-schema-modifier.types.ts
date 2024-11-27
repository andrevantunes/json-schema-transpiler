export type Data = Record<string, any>;

export type Modifiers = Record<string, Modifier>;

export type ObjectSchema = Record<string, any>;

type Modifier = (value: any) => any;
