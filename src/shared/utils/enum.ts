export type EnumType<T extends Record<string, number | string>> = T[keyof T];
// const Bool = { TRUE: 1, FALSE: 0 } as const;
// type BoolEnum = EnumType<typeof Bool>;

export function getEnumNumbers<T extends Record<string, number | string>>(enumObj: T): number[] {
  return Object.values(enumObj).filter((value) => typeof value === 'number');
}

export function createEnumDescription<T extends Record<string | number, string>>(enumObj: T): string {
  return Object.entries(enumObj).map(([key, value]) => `${key}: ${value}`).join(',');
}
