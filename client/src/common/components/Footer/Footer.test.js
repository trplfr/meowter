import React from 'react'

import { render, fireEvent, waitFor, screen } from 'test-utils'
import { Footer } from "./Footer";

import { useResize } from 'common/helpers'
jest.mock("common/helpers");


describe("conditional render", () => {
    test("renders body", () => {

        useResize.mockReturnValue(true);

        const text = "some body text";
        const body = <div>{text}</div>;

        const {getByText} = render(<Footer body={body} />);
        expect(getByText(text)).toBeInTheDocument();
    });

    test("renders null if not mobile", () => {

        useResize.mockReturnValue(false);

        const text = "some body text";
        const body = <div>{text}</div>;

        const {queryByText, container, debug} = render(<Footer body={body} />);
        expect(queryByText(text)).not.toBeInTheDocument();
        expect(container.firstChild).toBeNull();

    });

    test("renders null if mobile and isMenu", () => {

        useResize.mockReturnValue(true);

        const text = "some body text";
        const body = <div>{text}</div>;

        const {queryByText, container, debug} = render(<Footer body={body} isMenu={true} />);
        expect(queryByText(text)).not.toBeInTheDocument();
        expect(container.firstChild).toBeNull();

    });
});


