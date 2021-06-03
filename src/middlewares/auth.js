import router from "../router";

export default async ({ store, next, to, error }) => {
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

  if (!session || session.user == null) {

    return next({
      name: "login"
    });
  } else {

    if (session.user.mustChangePassword && to.name == "my-profile") {
      return next();
    } else if (
      session.user.mustChangePassword &&
      to.name !== "change-password"
    ) {

      await router.replace(
        {
          name: "my-profile",
          query: {
            i: new Date().getTime()
          }
        },
        () => {},
        () => {}
      );
      return next();
    } else if (
      !session.user.mustChangePassword &&
      to.name === "change-password"
    ) {

      await router.replace(
        {
          name: "home"
        },
        () => {},
        () => {}
      );
      return next();
    } else if (
      session.user.mustChangePassword &&
      to.name === "change-password"
    ) {

      await router.replace(
        {
          name: "my-profile",
          query: {
            i: new Date().getTime()
          }
        },
        () => {},
        () => {}
      );
      window.vm.$snotify.error(window.vm.$t("pleaseChangePassword"));
      console.log(error);

      return next();
    } else if (to.meta.permissions) {

      const permissions = to.meta.permissions;
      if (session.user.can(permissions)) {
        return next();
      } else {
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
        return next();
      }
    } else {
      return next();
    }
  }

};
