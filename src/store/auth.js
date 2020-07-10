import EventBus from '@/lib/eventbus';
import {
    blockUi,
    unblockUi
} from '@/lib/utils';
import {
    Session,
    User
} from '@/models'
import {
    apolloClient
} from '@/plugins/apollo/client';
import {
    AUTH
} from '@/graphql';
import {
    showMessageFromResponse
} from '../lib/utils';

//this channel is used to communicate between tabs
const {
    BroadcastChannel,
    createLeaderElection
} = require('broadcast-channel');
const channel = new BroadcastChannel('auth');
let leader = false;

const elector = createLeaderElection(channel);
elector.awaitLeadership().then(() => {
    console.log('this tab is now leader');
    leader = true;
})
channel.onmessage = (msg) => {
    if (!msg || !msg.type) {
        return;
    }
    location.reload();
};


const initialState = () => {
    return {
        session: null,
        checked: false,
        token: null,
        shouldAddAuthToken: false,
        loading: false,
    }
};

const state = initialState();



const getters = {
    loading: state => state.loading,
    session: state => state.session,
    user: state => state.session ? state.session.user : null,
    company: state => state.session && state.session.user.company ? state.session.user.company : null,
    checked: state => state.checked, //var to know if the session was already checked
    token: state => state.token,
    shouldAddAuthToken: state => state.shouldAddAuthToken,
    access_token: state => state.token ? state.token.token : null,
}



const actions = {
    async init() {

    },
    //update profile
    async updateProfile(context, form) {
        try {
            const result = await form.mutate({
                mutation: AUTH.updateProfile,
            })
            const currentUser = context.getters['user'];
            const user = new User().deserialize(
                {
                    ...currentUser,
                ...result.data.updateProfile
            });
            await context.commit('SET_USER', user)
            channel.postMessage({
                type: 'SET_USER',
                data: user
            });
            return user;
        } catch (ex) {
            throw ex;
        }
    },

    //update company
    async updateCompany(context, form) {
        try {
            const result = await form.mutate({
                mutation: AUTH.upateMyCompany,
            })
            const currentUser = {
                ...context.getters['user']
            };
            currentUser.company = {
                ...result.data.upateMyCompany
            };
            const user = new User().deserialize(currentUser);
            await context.commit('SET_USER', user)
            channel.postMessage({
                type: 'SET_USER',
                data: user
            });
            return user;
        } catch (ex) {
            //throw ex;
        } finally {
            form.busy = false;
        }
    },

    //send verification email
    async sendVerificationEmail(context, form) {
        form.busy = true;
        try {
            await form.mutate({
                mutation: AUTH.sendVerificationEmail,

            }, {
                inputVar: false,
                onSuccess: () => {}
            })
            return true;
        } finally {
            form.busy = false;
        }
    },

    //verify account
    async verifyAccount(context, form) {
        form.busy = true;
        try {
            const {
                data
            } = await form.mutate({
                mutation: AUTH.verifyAccount,

            }, {
                inputVar: false,
                onSuccess: (response) => {
                    window.vm.$snotify.success(window.vm.$t('Welcome back') + ' ' + response.data.verifyAccount.user.firstName);
                    return response;
                }
            })
            const session = new Session().deserialize(data.verifyAccount);
            context.commit('SET_SESSION', session);
            channel.postMessage({
                type: 'SET_SESSION',
                data: session
            });
            context.commit('SET_CHECKED', true);
            EventBus.$emit('auth/LOGIN', {
                context: context,
                data: {
                    session: session,
                    fromLocal: false,
                }
            });
            return data;
        } finally {
            form.busy = false;
        }
    },
    //send request reset password
    async requestResetPassword(context, form) {
        form.busy = true;
        try {
            await form.mutate({
                mutation: AUTH.requestResetPassword,

            }, {
                inputVar: false,
                onSuccess: () => {}
            })
            return true;
        } finally {
            form.busy = false;
        }
    },

    //reset password
    async resetPassword(context, form) {
        form.busy = true;
        try {
            const {
                data
            } = await form.mutate({
                mutation: AUTH.resetPassword,

            }, {
                inputVar: false,
                onSuccess: (response) => {
                    window.vm.$snotify.success(window.vm.$t('Welcome back') + ' ' + response.data.resetPassword.user.firstName);
                    return response;
                }
            })
            const session = new Session().deserialize(data.resetPassword);
            context.commit('SET_SESSION', session);
            channel.postMessage({
                type: 'SET_SESSION',
                data: session
            });
            context.commit('SET_CHECKED', true);
            EventBus.$emit('auth/LOGIN', {
                context: context,
                data: {
                    session: session,
                    fromLocal: false,
                }
            });
            return data;
        } finally {
            form.busy = false;
        }
    },
    //login user
    async login(context, form) {
        context.commit('SET_CHECKED', false);
        context.commit('SET_SESSION', null);

        const {
            data
        } = await form.mutate({
            mutation: AUTH.login,
        }, {
            onSuccess: (response) => {
                window.vm.$snotify.success(window.vm.$t('Welcome back') + ' ' + response.data.login.user.firstName);
                return response;
            },
            onError: (response) => {
                showMessageFromResponse(response);
            }
        })
        const session = new Session().deserialize(data.login);
        context.commit('SET_SESSION', session);
        channel.postMessage({
            type: 'SET_SESSION',
            data: session
        });
        context.commit('SET_CHECKED', true);
        context.commit('SET_TOKEN', {
            token: data.login.accessToken
        }
        );
        
        EventBus.$emit('auth/LOGIN', {
            context: context,
            data: {
                session: session,
                fromLocal: false,
            }
        });
        return data;

    },
    async logout(context) {
        try {
            blockUi();
            EventBus.$emit('auth/LOGOUT', {
                context: context,
                data: {

                }
            });
            await apolloClient.mutate({
                mutation: AUTH.logout
            })


        } finally {
            await channel.postMessage({
                type: 'SET_SESSION',
                data: null
            });
            context.commit('SET_SESSION', null);
            context.commit('SET_CHECKED', true);
            //window.location.reload();
            unblockUi();
        }
    },
    async getSession(context) {
        if (!context.getters['checked']) {
            try {
                blockUi();
                const {
                    data
                } = await apolloClient.query({
                    query: AUTH.session,
                    fetchPolicy: 'network-only',
                });
                if (data && data.session) {
                    const session = new Session().deserialize(data.session);
                    context.commit('SET_SESSION', session);
                    if (leader) {
                        channel.postMessage({
                            type: 'SET_SESSION',
                            data: session
                        });
                    }
                    EventBus.$emit('auth/LOGIN', {
                        context: context,
                        data: session
                    });
                }
            } catch (ex) {
                context.commit('SET_SESSION', null);
                if (leader) {
                    channel.postMessage({
                        type: 'SET_SESSION',
                        data: null
                    });
                }
                throw ex;
            } finally {
                unblockUi();
                context.commit('SET_CHECKED', true);
            }
        }

        return context.getters['session'];
    },

    //check that the in memory user is the same as the request user
    async checkSameUser(context, userId) {
        if (context.getters['checked'] && userId) {
            const session = context.getters['session'];
            if (!session && !userId) {
                return;
            }
            if (!userId && session) {
                window.location.reload();
            }
            if ((!session && userId) || (!session.user && userId)) {
                window.location.reload();
            }
            if (session && session.user && session.user.id != userId) {
                window.location.reload();
            }
        }
    }
}


const mutations = {
    RESET_STATE(state) {
        Object.assign(state, initialState());
        return state;
    },
    SET_SESSION(state, session) {
        state.session = session;
    },
    SET_USER(state, user) {
        state.session.user = user;
    },
    SET_TOKEN(state, token) {
        state.token = token;
    },

    SET_LOADING(state, loading) {
        state.loading = loading;
    },
    SET_CHECKED(state, checked) {
        state.checked = checked;

    },
    SET_AUTH_CHECK(state, shouldAddAuthToken) {
        state.shouldAddAuthToken = shouldAddAuthToken;
    }
}

export default {
    namespaced: true,
    state: state,
    getters: getters,
    actions: actions,
    mutations: mutations
}