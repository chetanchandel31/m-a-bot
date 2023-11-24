export const prependHttp = (str: string) => {
  if (!str.startsWith("http")) {
    return `http:${str}`;
  } else {
    return str;
  }
};
