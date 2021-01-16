import Cookies from "js-cookie";

export const API_ENDPOINT_BASE = `http://${window.location.hostname}:1234/api/`;

/**
 * Loads the auth token token from cookies.
 * @param {boolean} redirectIfNotPresent True to redirect to the auth page if cookie is not found.
 * @returns {string} The auth token if found, null otherwise.
 */
export function loadAuthFromCookies(redirectIfNotPresent){
    let token = Cookies.get("auth_token");
    if(token == null || token == undefined || token.length == 0){
        if(redirectIfNotPresent === true) {
            window.location = "/auth";
        }
        return null;
    }
    return token;
}