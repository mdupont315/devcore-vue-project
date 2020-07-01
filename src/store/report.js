import {
    REPORTS
} from '@/graphql';
import {
    queryToPromise
} from '../lib/utils';
import {
    apolloClient
} from '../plugins/apollo/client';
import {
    IdeaReport,
    PeopleReport,
    UserProjectReport
} from '@/models';


const state = {};

const getters = {};

const actions = {
    async ideaReport(context, filter) {
        try {
            filter.busy = true;
            const query = apolloClient.watchQuery({
                query: REPORTS.ideaReport,
                variables: {
                    filter: filter.data
                }
            });
            const {
                result
            } = await queryToPromise(query);
            return new IdeaReport().deserialize(result.data.ideaReport);
        } finally {
            filter.busy = false;
        }
    },
    async userProjectReport(context, filter) {
        try {
            filter.busy = true;
            const query = apolloClient.watchQuery({
                query: REPORTS.userProjectReport,
                variables: {
                    filter: filter.data
                }
            });
            const {
                result
            } = await queryToPromise(query);
            return new UserProjectReport().deserialize(result.data.userProjectReport);
        } finally {
            filter.busy = false;
        }
    },
    async peopleReport(context, filter) {
        try {
            filter.busy = true;
            const query = apolloClient.watchQuery({
                query: REPORTS.peopleReport,
                variables: {
                    filter: filter.data
                }
            });
            const {
                result
            } = await queryToPromise(query);
            return new PeopleReport().deserialize(result.data.peopleReport);
        } finally {
            filter.busy = false;
        }
    }
};

const mutations = {};

export default {
    namespaced: true,
    state: state,
    getters: getters,
    actions: actions,
    mutations: mutations
}