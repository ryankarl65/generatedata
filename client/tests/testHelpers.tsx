import React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { getInitialState } from '~store/generator/generator.reducer';
import { initialState as initialMainState } from '~store/main/main.reducer';
import { initialState as initialPacketState } from '~store/packets/packets.reducer';
import * as langUtils from '~utils/langUtils';
import { setLocaleFileLoaded } from '~store/main/main.actions';
import generatorReducer from '~store/generator/generator.reducer';
import mainReducer from '~store/main/main.reducer';
import packetsReducer from '~store/packets/packets.reducer';

const i18n = require('../src/i18n/en.json');
const jsonI18n = require('../src/plugins/exportTypes/JSON/i18n/en.json');

const rootReducer = combineReducers({
	generator: generatorReducer,
	main: mainReducer,
	packets: packetsReducer
});

export const renderWithStoreAndRouter = (
	component: any,
	{
		initialState = getTestState(),
		store = createStore(rootReducer, initialState),
		route = '/',
		history = createMemoryHistory({ initialEntries: [route] }),
	}: any = {}
) => {

	langUtils.setLocale('en', {
		core: i18n,
		dataTypes: {},
		exportTypes: {
			JSON: jsonI18n
		},
		countries: {}
	});
	store.dispatch(setLocaleFileLoaded('en'));

	return {
		...render(
			<Provider store={store}>
				<Router history={history}>{component}</Router>
			</Provider>
		),
		history
	};
};

export const getTestState = () => ({
	generator: getInitialState(),
	main: initialMainState,
	packets: initialPacketState
});
