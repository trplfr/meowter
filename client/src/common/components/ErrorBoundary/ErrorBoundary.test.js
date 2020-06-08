import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import enzyme, { mount } from 'enzyme';
import { Redirect } from 'react-router'
import { act } from "react-dom/test-utils";
import { ConnectedRouter as ConnectedRouterProvider } from 'connected-react-router'
import { configureStore, history } from 'store'
import { ErrorBoundary } from "./ErrorBoundary";
import {Provider as StoreProvider} from "react-redux";

enzyme.configure({ adapter: new Adapter() });

const store = configureStore();

it("redirects to /error pathname on error", () => {

    const errorPathname = '/error';

    const ErrorComponent = () => {
        return <div>any content</div>
    }

    let wrapper = mount(
        <StoreProvider store={store}>
            <ConnectedRouterProvider history={history}>
                <ErrorBoundary>
                    <div><ErrorComponent/></div>
                </ErrorBoundary>
            </ConnectedRouterProvider>
        </StoreProvider>
    );

    const error = new Error('test');

    act(()=> {
        wrapper.find(ErrorComponent).simulateError(error);
    });

    expect(wrapper.find('Router').prop('history').location.pathname).toBe(errorPathname);

    wrapper.unmount();
});

