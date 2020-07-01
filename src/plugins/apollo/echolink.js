import {
    ApolloLink,
    Observable
} from 'apollo-link';
// eslint-disable-next-line
import Pusher from "pusher-js"
import Echo from "laravel-echo"
import config from './config';
import store from "../../store/index"

class EchoLink extends ApolloLink {
    constructor() {
        super();
        this.subscriptions = [];
        //this.initEcho();
    }

    initEcho() {
        try {
            const token = store.getters['auth/access_token'];
            //console.log(store);
            //const token = "eyJpdiI6IlI2T3ZWTjZ5dGppRlI4TEpzeEpCaUE9PSIsInZhbHVlIjoiOFhiaEpHdzZOU1M4MnVlQW52QXNPODhvWlwvVXhKSVF2R3pTVzRqSTFYRnBCUkxcL3A5cHRkc3hUcThoMHd3VVY5TjdFanBYZWFDY21Ydm0zQnlFV0wwVHN2MDVwQ2tIblp3ZWI4VGVvSFZQejlOajJZMzVad0w3cXM2XC9laVpRXC9TXC9OdFpQanM4QWVJTFNYQjRPdkdraURzTEs1bFVjeVZuT3ZlUTB2cnlrN0c2QlwvQkphRHg5ZnB3SitUVzdNWHMzSUY4bDB1OXl4c3RPN3ZUeDArR3lyVFRGYUdiOTR6eGpNSFMrS1JDdm42U3NLZWxqTTBlcVlzdDhsTnRDMmY1M2ZaTVMyK1FtS2hXdjMrUzFXMGt5a3J3SFI5YTZBaGRTb1wvTFBRNUc0UmxJR2VYY1NuTVQxSkgxdXJtVjQxd0lHRGxERGpMeEErak1wUTd0a2U3V2t1eHZxaEg1MTkzM3c3S0NqbVN5N1JkR21IMEdNTzd1MmdnR09HejFFbmh4VTZvRVZDNGR1Z2ZjS0liTzU2WFpmUkk5bHN3MDlBeTVmR0ZqTks1MEg5YnRcL0cwYzVvZTVUZGdOODViVk5ST0FnWUt6OU5vSG56YVByWHU5Y0RwS1U3RXpCRFlhYWUxVUJmVVV4NXNta05JTT0iLCJtYWMiOiIxNmExNzQ0MzMxNDFkMzBkNDg1NDUzYzgzNzI2ZTQxYzU4NmMyOThiZmM3OWYxZGFkZjdlMmM0ZmI3NzI0NDEwIn0%3D";
            this.echo = new Echo({
                broadcaster: 'pusher',
                key: 'devcore-pusher-app-key',
                cluster: 'us2',
                authEndpoint: `${config.graphqlEndpoint}/subscriptions/auth`,
                wsHost: config.wsEndpoint,
                wsPort: config.wsPort,
                disableStats: true,
                enabledTransports: ['ws', 'wss'],
                auth: {
                    headers: {
                        authorization: token ? `Bearer ${token}` : null,
                    },
                },
            });
        } catch (ex) {
            console.error(ex);
        }
    }

    request(operation, forward) {
        return new Observable(observer => {
            // Check the result of the operation
            forward(operation).subscribe({
                next: data => {
                    // If the operation has the subscription extension, it's a subscription
                    const subscriptionChannel = this._getChannel(data, operation);
                    if (subscriptionChannel && this.echo) {
                        this._createSubscription(subscriptionChannel, observer);
                    } else {
                        // No subscription found in the response, pipe data through
                        observer.next(data);
                        observer.complete();
                    }
                },
            });
        });
    }

    _getChannel(data, operation) {
        return !!data.extensions &&
            !!data.extensions.lighthouse_subscriptions &&
            !!data.extensions.lighthouse_subscriptions.channels ?
            data.extensions.lighthouse_subscriptions.channels[operation.operationName] :
            null;
    }

    _createSubscription(subscriptionChannel, observer) {
        const privateChannelName = subscriptionChannel.split('private-').pop();

        if (!this.subscriptions.find(s => s.channel === subscriptionChannel)) {
            this.subscriptions.push({
                channel: subscriptionChannel,
                observer: observer,
            });
        }

        this.echo.private(privateChannelName).listen('.lighthouse-subscription', payload => {
            if (!payload.more || observer._subscription._state === 'closed') {
                this._leaveSubscription(subscriptionChannel, observer);
                return;
            }
            const result = payload.result;
            if (result) {
                observer.next({
                    data: result.data,
                    extensions: result.extensions,
                });
            }
        });
    }

    _leaveSubscription(channel, observer) {
        const subscription = this.subscriptions.find(s => s.channel === channel);
        this.echo.leave(channel);
        observer.complete();
        this.subscriptions = this.subscriptions.slice(this.subscriptions.indexOf(subscription), 1);
    }
}

export default EchoLink;