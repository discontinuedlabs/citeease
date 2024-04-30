export const ACTIONS = {
    CHANGE_FONT: "Change font",
};

export default function settingsReducer(settings, action) {
    switch (action.type) {
        case ACTIONS.CHANGE_FONT:
            return { ...settings, font: action.payload.font };

        default:
            return settings;
    }
}
