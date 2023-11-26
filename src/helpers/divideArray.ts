export const divideArray = <TypeArrayItem>(
  arr: TypeArrayItem[],
  chunkSize: number
): TypeArrayItem[][] => {
  const result: TypeArrayItem[][] = [];

  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    result.push(chunk);
  }

  return result;
};
