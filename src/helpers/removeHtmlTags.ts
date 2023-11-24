export const removeHtmlTags = (str: string) => {
  if (str === "") return "nothing found";
  else {
    // Regular expression to identify HTML tags in
    // the input string. Replacing the identified
    // HTML tag with a null string.
    return str.replace(/(<([^>]+)>)/gi, "");
  }
};
