export const removeHtmlTags = (str: string): string => {
  if (!str) return "";
  else {
    // Regular expression to identify HTML tags in
    // the input string. Replacing the identified
    // HTML tag with a null string.
    return str.replace(/(<([^>]+)>)/gi, "");
  }
};
