import React from 'react'

import enzyme, { mount } from "enzyme";
import { ThemeProvider } from "styled-components";
import Adapter from "enzyme-adapter-react-16";

import { render, fireEvent, waitFor, screen, cleanup } from 'test-utils'

import { Back } from 'common/components'
import { Header } from "./Header"
import { Container } from './Header.style'

import { useResize } from 'common/helpers'
import { theme } from "core/styles/theme"

enzyme.configure({ adapter: new Adapter() });

jest.mock("common/helpers");

describe('render', () => {
    test("renders null if not mobile", () => {

        useResize.mockReturnValue(false);

        const { container } = render(<Header />);
        expect(container.firstChild).toBeNull();

    });

    test("renders Back if isBack", () => {

        useResize.mockReturnValue(true);

        const {container: container1, debug: debug1, unmount} = render(<Back />);
        const backHTML = container1.firstChild.outerHTML;

        unmount();

        const { getByRole, debug, container } = render(<Header isBack={true} />);

        expect(container.innerHTML).toEqual(expect.stringContaining(backHTML));

    });

    test("renders title", () => {

        useResize.mockReturnValue(true);
        const title = "Some title string";
        const { getByText} = render(<Header title={title} />);
        expect(getByText(title)).toBeInTheDocument();

    });
});


describe('pass props', () => {
    it("passes isBorder to container", () => {

        useResize.mockReturnValue(true);

        const isBorder = true;

        const wrapper = mount(
            <ThemeProvider theme={theme}>
                <Header isBorder={isBorder} />
            </ThemeProvider>
        );

        expect(wrapper.find(Container).props().isBorder).toBe(true);

        wrapper.unmount();
    });
});

