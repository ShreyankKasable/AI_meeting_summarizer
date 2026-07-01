const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "";

const URLS = {
    // auth
    signup: `${BASE_URL}/api/auth/signup`,
    login: `${BASE_URL}/api/auth/login`,
    me: `${BASE_URL}/api/auth/me`,
    logout: `${BASE_URL}/api/auth/logout`,

    // meetings (host-authenticated)
    meetings: `${BASE_URL}/api/meetings`,
    meeting: (id) => `${BASE_URL}/api/meetings/${id}`,
    meetingActionItems: (id) => `${BASE_URL}/api/meetings/${id}/action-items`,
    actionItemComplete: (id) => `${BASE_URL}/api/action-items/${id}/complete`,
    meetingTitle: (id) => `${BASE_URL}/api/meetings/${id}/title`,
    meetingChat: (id) => `${BASE_URL}/api/meetings/${id}/chat`,
    meetingTranslate: (id) => `${BASE_URL}/api/meetings/${id}/translate`,
    meetingExportNotion: (id) => `${BASE_URL}/api/meetings/${id}/export-notion`,
    meetingShare: (id) => `${BASE_URL}/api/meetings/${id}/share`,
    meetingShareRevoke: (id) => `${BASE_URL}/api/meetings/${id}/share/revoke`,
    meetingShareRegenerate: (id) => `${BASE_URL}/api/meetings/${id}/share/regenerate`,

    // public (token-gated, unauthenticated)
    publicShare: (token) => `${BASE_URL}/api/public/share/${token}`,
    publicShareChat: (token) => `${BASE_URL}/api/public/share/${token}/chat`,
    publicShareTranslate: (token) => `${BASE_URL}/api/public/share/${token}/translate`,

    // settings
    settings: `${BASE_URL}/api/settings`,
};

export default URLS;
