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
    console.log("session: ");
    console.log(session);
  } catch (ex) {
    console.log(ex);
  }
  if (!session || session.user == null) {
    console.log(session);
    console.log("NO SESSION");
    /*   return next({
      name: "login"
    }); */
    await router.replace(
      {
        name: "login"
      },
      () => {},
      () => {}
    );
    return;

    /*     await router.replace(
      {
        name: "home"
      },
      () => {},
      () => {}
    );
    return; */
  }

  if (!session.user?.mustChangePassword && to.name === "change-password") {
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
    if (session.user?.can(permissions)) {
      console.log(session.user);
      console.log(to.meta.permissions);

      return next();
    }
    /*    await router.replace(
      {
        name: "home",
        query: {
          i: new Date().getTime()
        }
      },
      () => {},
      () => {}
    ); */

    return next({
      name: "home"
    });
    //return;
  }

  return next();
};
