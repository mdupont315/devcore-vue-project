import router from "../router";

export default async ({ store, next, to }) => {
  let session = null;
  // always save the intented route
  await store.dispatch("app/setIntentedRoute", to);

  if (!store.getters["auth/checked"]) {
    return;
  }

  try {
    session = await store.dispatch("auth/getSession");
  } catch (ex) {
    console.log(ex);
  }
  if (!session) {
    return next({
      name: "login"
    });
  }
  if (session.user.mustChangePassword && to.name !== "change-password") {
    await router.replace(
      {
        name: "change-password",
        query: {
          i: new Date().getTime()
        }
      },
      () => {},
      () => {}
    );
    return;
    // return next({
    //     name: 'change-password'
    // })
  }
  if (!session.user.mustChangePassword && to.name === "change-password") {
    await router.replace(
      {
        name: "home"
      },
      () => {},
      () => {}
    );
    return;
  }
  if (to.meta.permissions) {
    const { permissions } = to.meta;
    if (session.user.can(permissions)) {
      return next();
    }
    await router.replace(
      {
        name: "home",
        query: {
          i: new Date().getTime()
        }
      },
      () => {},
      () => {}
    );
    return;
  }

  return next();
};
