import { Dispatch } from 'redux';
import { gql } from '@apollo/client';
import { AuthMethod, GDAction, GDLocale } from '~types/general';
import * as langUtils from '~utils/langUtils';
import { apolloClient } from '../../apolloClient';
import { getAuthMethod } from '~store/main/main.selectors';
import { logoutVendor, setAuthToken } from '~utils/authUtils';

export const LOCALE_FILE_LOADED = 'LOCALE_FILE_LOADED';
export const setLocaleFileLoaded = (locale: GDLocale): GDAction => ({
	type: LOCALE_FILE_LOADED,
	payload: {
		locale
	}
});

export const selectLocale = (locale: GDLocale) => (dispatch: Dispatch): any => {
	window.gd = {};
	window.gd.localeLoaded = (strings: any): void => {
		langUtils.setLocale(locale, strings);
		dispatch(setLocaleFileLoaded(locale));
	};
	const s = document.createElement('script');
	s.src = `./${locale}.js`;
	document.body.appendChild(s);
};

export const TOGGLE_INTRO_DIALOG = 'TOGGLE_INTRO_DIALOG';
export const toggleIntroDialog = (): GDAction => ({ type: TOGGLE_INTRO_DIALOG });

export const RESET_STORE = 'RESET_STORE';
export const resetStore = (): GDAction => ({ type: RESET_STORE });

export const TOGGLE_LOGIN_DIALOG = 'TOGGLE_LOGIN_DIALOG';
export const toggleLoginDialog = (): GDAction => ({ type: TOGGLE_LOGIN_DIALOG });

export const SET_AUTHENTICATION_DATA = 'SET_AUTHENTICATION_DATA';

export type AuthData = {
	authMethod: AuthMethod;
	firstName: string;
	profileImage?: string;
}
export const setAuthenticationData = (authData: AuthData): GDAction => ({
	type: SET_AUTHENTICATION_DATA,
	payload: authData
});

export const AUTHENTICATED = 'AUTHENTICATED';
export const setAuthenticated = (authenticated = true): GDAction => ({
	type: AUTHENTICATED,
	payload: {
		authenticated
	}
});

// default authentication
export const login = (email: string, password: string, onLoginError: Function): any => async (dispatch: Dispatch): Promise<any> => {
	const response = await apolloClient.mutate({
		mutation: gql`
            mutation LoginMutation($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                    token
					tokenExpiry
					success
					firstName
                }
            }
		`,
		variables: { email, password }
	});

	if (response.data.login.success) {
		const { token, tokenExpiry, firstName } = response.data.login;
		setAuthToken(token, tokenExpiry, (): any => refreshToken()(dispatch));

		dispatch(setAuthenticationData({ authMethod: 'default', firstName }));
		dispatch(toggleLoginDialog());
	} else {
		onLoginError();
	}
};

export const LOGOUT = 'LOGOUT';
export const logout = (): any => async (dispatch: Dispatch, getState: any): Promise<any> => {

	// if the user logged in with Google, Facebook etc. we need to also let them know
	logoutVendor(getAuthMethod(getState()));

	dispatch({ type: LOGOUT });

	// doesn't awfully matter if this fails. It's just for cleanup
	await apolloClient.mutate({
		mutation: gql`
            mutation Logout {
                logout {
                    success
                }
            }
		`
	});
};

export const REFRESHING_TOKEN = 'REFRESHING_TOKEN';
export const refreshToken = () => async (dispatch: Dispatch): Promise<any> => {
	dispatch({ type: REFRESHING_TOKEN });

	console.log('refreshing token.');

	const response = await apolloClient.mutate({
		mutation: gql`
			mutation RefreshToken {
                refreshToken {
					token
					tokenExpiry
					success
				}
			}
		`
	});

	const success = response.data.refreshToken.success;
	if (success) {
		const { token, tokenExpiry } = response.data.refreshToken;
		setAuthToken(token, tokenExpiry, (): any => refreshToken()(dispatch));

		console.log('refreshed! ', token);
	}

	dispatch(setAuthenticated(success));
};
