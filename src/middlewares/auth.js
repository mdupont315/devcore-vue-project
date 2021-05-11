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
    console.log("session: ");
    console.log(session);
  } catch (ex) {
    console.log(ex);
  }

  if (!session || session.user == null) {
    console.log(session);
    console.log("NO SESSION");
    console.log(error);
    return next({
      name: "login"
    });
  } else {
    console.log("12 MY PROFILE!");
    console.log(session.user.mustChangePassword);
    console.log(to.name);
    console.log(router.route);

    console.log(to);
    if (session.user.mustChangePassword && to.name == "my-profile") {
      return next();
    } else if (
      session.user.mustChangePassword &&
      to.name !== "change-password"
    ) {
      console.log("::::::::::::::::::::::::::");
      console.log(session.user.mustChangePassword);
      console.log("change password");
      console.log(to);

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
      console.log("::::::::::::::::::::::::::");
      console.log(session.user.mustChangePassword);
      console.log("change password");
      console.log(to);
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
      console.log("::::::::::::::::::::::::::");
      console.log(to);
      console.log(session);
      console.log("1 MY PROFILE!");
      console.log("________");
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

      /*     if (
      !session.user?.mustChangePassword &&
      to.name === "change-password"
    ) {
      console.log("change-password");

      await router.replace(
        {
          name: "home"
        },
        () => {},
        () => {}
      );
      console.log(error);
      return;
    } */
      return next();
    } else if (to.meta.permissions) {
      console.log("::::::::::::::::::::::::::");
      console.log("to meta");
      console.log("to meta");
      const permissions = to.meta.permissions;
      if (session.user.can(permissions)) {
        return next();
      } else {
        console.log(to);
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
/*   console.log(next, to, error); */
  // return next();
};

/*   if (to.meta.permissions) {
    const { permissions } = to.meta;
    if (session.user?.can(permissions)) {
      console.log(session.user);
      console.log(to.meta.permissions);

      return next();
    }

    return next({
      name: "home"
    });
    //return;
  }

  return next();
}; */

/*  console.log("must change_________________");
  console.log(to.name);
  if (session.user && session.user.mustChangePassword && to.name === "ideas") {
    console.log("must change");
    console.log(to.name);
    await router.replace(
      {
        name: "my-profile",
        params: {
          i: new Date().getTime()
        }
      },
      () => {},
      () => {}
    );
    return;
  }
 */
/*   if (!session.user?.mustChangePassword && to.name === "change-password") {
    console.log("change-password");
    await router.replace(
      {
        name: "home"
      },
      () => {},
      () => {}
    );
    return;
  }

  if (session.user && to.name == "my-profile") {
    console.log(to.name);
    console.log(to.name);
  }

  console.log(session.user);
  console.log(to.name);
  if (session.user && to.name === "forgot-password") {
    /*   await router.replace(
      {
        name: "home"
      },
      () => {},
      () => {}
    );
    return; */
