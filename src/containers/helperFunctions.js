export function titleCase(str) {
  // to avoid words in uppercase take note of those indexes and after titlecase capitalise them
  let splitStr = str.toLowerCase().split(" ");
  let dont_ignore = ["av", "avs"];
  let ignore = ["a", "to", "of", "the", "or", "and"];

  for (let i = 0; i < splitStr.length; i++) {
    if (dont_ignore.includes(splitStr[i])) {
      if (splitStr[i] === "avs") splitStr[i] = "AVs";
      else splitStr[i] = splitStr[i].toUpperCase();
    } else if (!ignore.includes(splitStr[i])) {
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
  }
  return splitStr.join(" ");
}

export function alertMessage(message) {
  alert(titleCase(message));
}
