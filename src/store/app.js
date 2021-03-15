import {
    toggleClass
} from "../lib/utils";

const initialState = () => {
    return {
        show_navbar: false,
        show_overlay: false,
        show_inner_overlay: false,
        show_inner_overlay_on_top: false,
        on_overlay_click: null,
        show_top_nav_on_top: false,
        loaded: false,
        show_back: false,
        container_class: 'default-layout',
        intented_route: null,
        route: null,
        page_meta: {
            title: process.env.VUE_APP_NAME,
        },
        ws_update_found: false,
        ws_updated: false,
        current_layer: null,
    }
};

const state = initialState();


const getters = {
    route: state => state.route,
    show_navbar: state => state.show_navbar,
    container_class: state => state.route && state.route.meta ? state.route.meta.layout || 'default-layout' : 'default-layout',
    show_back: state => state.show_back,
    intented_route: state => state.intented_route,
    loaded: state => state.loaded,
    page_meta: state => state.page_meta,
    show_overlay: state => state.show_overlay,
    show_inner_overlay: state => state.show_inner_overlay,
    show_inner_overlay_on_top: state => state.show_inner_overlay_on_top,
    ws_update_found: state => state.ws_update_found,
    ws_updated: state => state.ws_updated,
    current_layer: state => state.current_layer,
    show_top_nav_on_top: state => state.show_top_nav_on_top,
}



const actions = {
    async loaded(context, loaded = true) {
        context.commit('SET_LOADED', loaded);
    },
    async showNavbar(context, show) {
        context.commit('SHOW_NAVBAR', show);
    },
    async showBack(context, show) {
        context.commit('SHOW_BACK', show);
    },
    async setIntentedRoute(context, route) {
      ("INTENDED ROUTE");
        context.commit('SET_INTENTED_ROUTE', route);
    },
    async setRouteMeta(context, route) {
        context.commit('SET_ROUTE_META', route);
    },
    async toggleNav(context) {
        toggleClass(document.body, 'navbar-toggled');
        context.commit('SHOW_NAVBAR', !context.state.show_navbar);
    },
    async showOverlay(context, {
        show,
        onClick = null
    }) {
        context.commit('SHOW_OVERLAY', {
            show,
            onClick
        });
    },
    async toggleOverlay(context, {
        onClick = null
    }) {
        context.commit('TOGGLE_OVERLAY', {
            onClick
        });
    },
    async overlayClicked(context, event) {
        if (typeof context.state.on_overlay_click === 'function') {
            context.state.on_overlay_click(event);
        }
    },
    async toggleInnerOverlay(context) {
        context.commit('TOGGLE_INNER_OVERLAY');
    },
    async showInnerOverlay(context, value = true) {
        context.commit('SHOW_INNER_OVERLAY', value);
    },
    async showInnerOverlayOnTop(context, value) {
        context.commit('SHOW_INNER_OVERLAY_ON_TOP', value);
    },
    async wsUpdateFound(context, value = true) {
        context.commit('WS_UPDATE_FOUND', value);
    },
    async wsUpdated(context, value = true) {
        context.commit('WS_UPDATED', value);
    },
    async setCurrentLayer(context, value) {
        context.commit('CURRENT_LAYER', value);
    },
    async showTopNavOnTop(context, value) {
        context.commit('SHOW_TOP_NAV_ON_TOP', value);
    },
    async load(context) {
        try {
            await Promise.all([
                context.dispatch("currency/findAll", {}, {
                    root: true
                }),
                context.dispatch("companyRole/findAll", {}, {
                    root: true
                }),
                context.dispatch("process/findAll", {}, {
                    root: true
                }),
                context.dispatch("process/refreshCurrent", {}, {
                    root: true
                }),
            ]);
        } catch (e) {
            console.log(e);
        }
    },
    async asyncLoad() {
        console.log("loadAsync")
    }
}


const mutations = {
    RESET_STATE(state) {
        Object.assign(state, initialState());
        return state;
    },
    SET_LOADED(state, loaded) {
        state.loaded = loaded;
    },
    SHOW_NAVBAR(state, show) {
        state.show_navbar = show;

    },
    SHOW_BACK(state, show) {
        state.show_back = show;

    },
    SET_ROUTE_META(state, route) {
      console.log("route");
      console.log(route);
        state.route = route;
        console.log(state)
        state.page_meta = route.meta || {
            title: process.env.VUE_APP_NAME
        };
    },
    SET_INTENTED_ROUTE(state, route) {
      console.log(route);
        state.intented_route = route;
    },
    SHOW_OVERLAY(state, {
        show,
        onClick
    }) {
        state.show_overlay = show;
        state.on_overlay_click = onClick;
    },
    TOGGLE_OVERLAY(state, {
        onClick
    }) {
        state.show_overlay = !state.show_overlay;
        if (state.show_overlay) {
            state.on_overlay_click = onClick;
        } else {
            state.on_overlay_click = null;
        }
    },
    TOGGLE_INNER_OVERLAY(state) {
        state.show_inner_overlay = !state.show_inner_overlay;
        state.show_inner_overlay_on_top = false;
    },
    SHOW_INNER_OVERLAY(state, value) {
        state.show_inner_overlay = value;
        if (!value) {
            state.show_inner_overlay_on_top = false;
        }
    },
    SHOW_INNER_OVERLAY_ON_TOP(state, value) {
        state.show_inner_overlay_on_top = value;
    },
    WS_UPDATE_FOUND(state, value = true) {
        state.ws_update_found = value;
    },
    WS_UPDATED(state, value = true) {
        state.ws_updated = value;
        state.ws_update_found = false;
    },
    CURRENT_LAYER(state, value) {
        state.current_layer = value;
    },
    SHOW_TOP_NAV_ON_TOP(STATE, value) {
        state.show_top_nav_on_top = value;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
