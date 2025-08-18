const hiddenBody = (status: boolean) => {
  if (status) {
    document.body.style.overflow = "hidden";
    document.documentElement.style.scrollbarGutter = "auto";
  } else {
    document.body.style.overflow = "";
    document.documentElement.style.scrollbarGutter = "stable both-edges";
  }
};
export default hiddenBody;
