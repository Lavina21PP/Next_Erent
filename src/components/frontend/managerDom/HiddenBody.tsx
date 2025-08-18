const hiddenBody = (status: boolean) => {
  if (status) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
};
export default hiddenBody;
