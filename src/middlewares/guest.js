export default async ({ store, next, to }) => {
  let session = null;

  if (!store.getters["auth/checked"]) {
    return next();
  }

  try {
    session = await store.dispatch("auth/getSession");
  } catch (ex) {
    console.log(ex);
  }


  if (session && session.user) {
    return next({
      name: "home"
    });
  }
  return next();
};
