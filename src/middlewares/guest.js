export default async ({
    store,
    next
}) => {

    let session = null;
    
    if (!store.getters['auth/checked']) {
      console.log("IT WAS CHECKED!")
        return next();
    }

        console.log("GUEST MIDDLEWARE");
    try {
        session = await store.dispatch('auth/getSession');
        console.log(session);

        console.log(await store.dispatch('auth/getSession'));
    } catch (ex) {
        console.log(ex);
    }
    if (session && session.user) {
        return next({
            name: 'home'
        })
    }
    return next();
}
