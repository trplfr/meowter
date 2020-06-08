import React from 'react';
import { Router } from 'react-router-dom';
import Adapter from 'enzyme-adapter-react-16';
import { ThemeProvider } from 'styled-components';
import enzyme, { mount  } from 'enzyme';
import { act } from "react-dom/test-utils";
import { Back } from "./Back";
import Arrow from 'assets/icons/arrow.svg'
import { Button } from 'common/components/Back/Back.style'
import { theme } from "core/styles/theme";
import { Anchor } from 'core/styles/typography';


enzyme.configure({ adapter: new Adapter() });

it("renders as arrow without children", () => {

    const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), goBack: jest.fn() };

    const wrapper = mount(
        <Router history={historyMock}>
            <Back />
        </Router>,
    );

    expect(wrapper.find(Back).contains(<Arrow />)).toBe(true);

    wrapper.unmount();

});

it("renders children content", () => {

    const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), goBack: jest.fn() };

    const childrenText = "some random string";

    let wrapper = mount(
        <Router history={historyMock}>
            <ThemeProvider theme={theme}>
                <Back>{childrenText}</Back>
            </ThemeProvider>
        </Router>
    );

    expect(wrapper.find(Back).childAt(0).text()).toBe(childrenText);

    wrapper.unmount();

    const childrenElement = <div>SomeElement</div>;

    wrapper = mount(
        <Router history={historyMock}>
            <ThemeProvider theme={theme} >
                <Back>{childrenElement}</Back>
            </ThemeProvider>
        </Router>
    );

    expect(wrapper.find(Back).childAt(0).contains(childrenElement)).toBe(true);

    wrapper.unmount();
});

it("calls goBack with children", () => {

    const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), goBack: jest.fn() };

    const childrenText = "some random string";

    let wrapper = mount(
        <Router history={historyMock}>
            <ThemeProvider theme={theme} >
                <Back children={childrenText} />
            </ThemeProvider>
        </Router>
    );

    act(() => {
        wrapper.find(Anchor).simulate('click');
    });

    act(() => {
        wrapper.find(Anchor).simulate('click');
    });

    expect(historyMock.goBack.mock.calls.length).toBe(2);

    wrapper.unmount();

});

it("calls goBack without children", () => {

    const historyMock = { push: jest.fn(), location: {}, listen: jest.fn(), goBack: jest.fn() };

    let wrapper = mount(
        <Router history={historyMock}>
            <ThemeProvider theme={theme} >
                <Back />
            </ThemeProvider>
        </Router>
    );

    act(() => {
        wrapper.find(Button).simulate('click');
    });

    act(() => {
        wrapper.find(Button).simulate('click');
    });

    expect(historyMock.goBack.mock.calls.length).toBe(2);

    wrapper.unmount();

});