import { useState, useEffect } from "react";

export type Screen =
    | "loading"
    | "welcome"
    | "signIn"
    | "createAccount"
    | "onboarding"
    | "home"
    | "generation"
    | "review"
    | "workout"
    | "summary"
    | "history"
    | "sessionDetail"
    | "settings"
    | "componentGallery";

export const useAppNavigation = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>("loading");

    // Allow direct access to Component Gallery via #gallery hash
    useEffect(() => {
        if (window.location.hash === '#gallery') {
            setCurrentScreen("componentGallery");
        }
    }, []);

    const navigateTo = (screen: Screen) => {
        setCurrentScreen(screen);
    };

    return {
        currentScreen,
        navigateTo,
        setCurrentScreen, // Exposing setter for flexibility during refactor, ideally use navigateTo
    };
};
