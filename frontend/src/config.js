import {
    BACKEND_URL,
    HOURS_CLOSE_TICKETS_AUTO,
    PRIMARY_COLOR,
    PRIMARY_DARK,
    NUMBER_SUPPORT
} from "./config/env";

export function getBackendUrl() {
    // If inside a docker container, use window.ENV
    if (window.ENV !== undefined) {
        return window.ENV.REACT_APP_BACKEND_URL || BACKEND_URL;
    }
    return BACKEND_URL;
}

export function getHoursCloseTicketsAuto() {
    if (window.ENV !== undefined) {
        return window.ENV.REACT_APP_HOURS_CLOSE_TICKETS_AUTO || HOURS_CLOSE_TICKETS_AUTO;
    }
    return HOURS_CLOSE_TICKETS_AUTO;
}

export function getFrontendPort() {
    // SERVER_PORT não deve ser usado no browser
    if (window.ENV !== undefined) {
        return window.ENV.SERVER_PORT || null;
    }
    return null;
}

export function getPrimaryColor() {
    if (window.ENV !== undefined) {
        return window.ENV.REACT_APP_PRIMARY_COLOR || PRIMARY_COLOR;
    }
    return PRIMARY_COLOR;
}

export function getPrimaryDark() {
    if (window.ENV !== undefined) {
        return window.ENV.REACT_APP_PRIMARY_DARK || PRIMARY_DARK;
    }
    return PRIMARY_DARK;
}

export function getNumberSupport() {
    if (window.ENV !== undefined) {
        return window.ENV.REACT_APP_NUMBER_SUPPORT || NUMBER_SUPPORT;
    }
    return NUMBER_SUPPORT;
}