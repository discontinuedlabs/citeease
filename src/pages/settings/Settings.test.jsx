import { render, fireEvent, screen } from "@testing-library/react";
import { Provider as ReduxeProvider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import Settings from "./Settings";
import store from "../../data/store/store.ts";
import DialogProvider from "../../context/DialogContext.tsx";

describe("Settings", () => {
    it("renders settings buttons", () => {
        render(
            <Router basename="/citeease/">
                <ReduxeProvider store={store}>
                    <DialogProvider>
                        <Settings />
                    </DialogProvider>
                </ReduxeProvider>
            </Router>
        );

        const aboutButton = screen.getByText(/About CiteEase/i);
        expect(aboutButton).toBeInTheDocument();

        const privacyPolicyButton = screen.getByText(/Privacy Policy/i);
        expect(privacyPolicyButton).toBeInTheDocument();

        const termsOfUseButton = screen.getByText(/Terms of Use/i);
        expect(termsOfUseButton).toBeInTheDocument();
    });

    test("navigates to correct screens on button click", () => {
        render(
            <Router basename="/citeease/">
                <ReduxeProvider store={store}>
                    <DialogProvider>
                        <Settings />
                    </DialogProvider>
                </ReduxeProvider>
            </Router>
        );

        fireEvent.click(screen.getByText(/About CiteEase/i));
        expect(window.location.pathname).toBe("/about");
        expect(screen.getByText(/About CiteEase/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText(/Privacy Policy/i));
        expect(window.location.pathname).toBe("/privacy");
        expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText(/Terms of Use/i));
        expect(window.location.pathname).toBe("/terms");
        expect(screen.getByText(/Terms of Use/i)).toBeInTheDocument();
    });
});
