import { getOidcClient } from '@/oidc/oidc-client'
import router from '@/router/router'

const defaultState = {
    user: {},
    isOidcEventsHandled : false 
};

let oidcClient = getOidcClient();

const actions = {
    signin: () => {
        oidcClient.signinRedirect();
    },
    signinRedirectCallback: (context) => {
        context.commit('TOKEN_REQUEST_PENDING');
        oidcClient.signinRedirectCallback()
            .then((response) => {
                context.commit('TOKEN_REQUEST_SUCCESS');
                context.dispatch("setAuthenticationSuccess", response);
                router.push('/home');
            })
            .catch(function(error){
                context.commit('TOKEN_REQUEST_FAILURE', error);
            })
    },
    setAuthenticationSuccess: (context, user) => {
        // Check if library is suscribed to OIDC library events
        if(!context.state.isOidcEventsHandled) {
            oidcClient.events.addAccessTokenExpired(() => {
                // TODO: Handliing token expiration
            });
            context.commit('OIDC_LIBRARY_EVENTS_HANDLED');
        }
        context.commit("AUTHENTICATION_SUCCESS", user);
    },
    signOut: (context) => {
        context.commit('LOGOUT_REQUEST_PENDING')
        oidcClient.signoutRedirect()
            .then(() => {
                context.commit('LOGOUT_REQUEST_SUCCESS')
             })
             .catch(function(error){
                context.commit('LOGOUT_REQUEST_FAILURE', error);
            })
    },
    checkAccess: (context,requiresAuth) => {
        return new Promise(resolve => { 
                oidcClient = getOidcClient();
                if(!requiresAuth) return resolve("OK")
                // Check if we have a token in Session Storage 
                const getUserPromise = new Promise(resolve => {
                    oidcClient.getUser().then(user => {
                        resolve(user)
                    }).catch(() => {
                        resolve(null)
                    })
                })
                let statusCode = "UNAUTHORIZED";
                getUserPromise.then(user => {
                    // Check if we have token information and if token is not expired
                    if(user && !user.expired) {
                        statusCode = "OK";
                        context.dispatch("setAuthenticationSuccess", user);
                    }
                    resolve(statusCode)
                })
             })
        //})
    }
};
  
const mutations = {
    TOKEN_REQUEST_PENDING : (state) => {
        state.user = { loading : true };
    },
    TOKEN_REQUEST_SUCCESS : (state) => {
        state.user = { loading : false }
    },
    TOKEN_REQUEST_FAILURE : (state, error) => {
        state.user =  { error };
    },
    LOGOUT_REQUEST_PENDING : (state) => {
        state.user = { loading : true };
    },
    LOGOUT_REQUEST_SUCCESS : (state) =>{
        state.user = {};
    },
    LOGOUT_REQUEST_FAILURE : (state, error) => {
        state.user =  { error };
    },
    AUTHENTICATION_SUCCESS : (state, user) => {
        state.user = user;
    },
    OIDC_LIBRARY_EVENTS_HANDLED :  (state) => {
        state.isOidcEventsHandled = true;
    },
};  
  
const getters = {
    accessToken(state) {
        return state.user.access_token;
    },
    isLoading(state) {
        return (state.user != null && state.user.isLoading);
    },
    tokenResponse(state) {
        return (state.user) ? state.user : {};
    },
    userProfile(state) {
        return (state.user 
            && state.user.profile != null) ? state.user.profile : {};
    },
    userIsAuthenticated(state){
        return (state.user 
            && state.user.id_token != null);
    }
};
  
export default {
    namespaced: true,
    state: defaultState,
    getters,
    actions,
    mutations
};