export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Login URL now points to the local login page (self-contained auth).
// When WAVV API auth becomes available, swap the backend validation only.
export const getLoginUrl = () => "/login";
