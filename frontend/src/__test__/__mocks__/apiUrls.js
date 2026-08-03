const BASE_URL = "";

const URLS = {
    signup: `${BASE_URL}/api/auth/signup`,
    login: `${BASE_URL}/api/auth/login`,
    me: `${BASE_URL}/api/auth/me`,
    refresh: `${BASE_URL}/api/auth/refresh`,
    logout: `${BASE_URL}/api/auth/logout`,

    meetings: `${BASE_URL}/api/meetings`,
    meeting: (id) => `${BASE_URL}/api/meetings/${id}`,
    meetingActionItems: (id) => `${BASE_URL}/api/meetings/${id}/action-items`,
    actionItemComplete: (id) => `${BASE_URL}/api/action-items/${id}/complete`,
    meetingTitle: (id) => `${BASE_URL}/api/meetings/${id}/title`,
    meetingChat: (id) => `${BASE_URL}/api/meetings/${id}/chat`,
    meetingTranslate: (id) => `${BASE_URL}/api/meetings/${id}/translate`,
    meetingExportNotion: (id) => `${BASE_URL}/api/meetings/${id}/export-notion`,
    meetingShare: (id) => `${BASE_URL}/api/meetings/${id}/share`,
    meetingShareAccess: (id) => `${BASE_URL}/api/meetings/${id}/share/access`,
    meetingShareAccessApprove: (id, userId) => `${BASE_URL}/api/meetings/${id}/share/access/${userId}/approve`,
    meetingShareAccessReject: (id, userId) => `${BASE_URL}/api/meetings/${id}/share/access/${userId}/reject`,
    meetingShareAccessUser: (id, userId) => `${BASE_URL}/api/meetings/${id}/share/access/${userId}`,
    meetingShareRevoke: (id) => `${BASE_URL}/api/meetings/${id}/share/revoke`,
    meetingShareRegenerate: (id) => `${BASE_URL}/api/meetings/${id}/share/regenerate`,

    publicShareMeetings: `${BASE_URL}/api/public/share/meetings`,
    publicShare: (token) => `${BASE_URL}/api/public/share/${token}`,
    publicShareAccess: (token) => `${BASE_URL}/api/public/share/${token}/access`,
    publicShareRequest: (token) => `${BASE_URL}/api/public/share/${token}/request`,
    publicShareChat: (token) => `${BASE_URL}/api/public/share/${token}/chat`,
    publicShareTranslate: (token) => `${BASE_URL}/api/public/share/${token}/translate`,

    settings: `${BASE_URL}/api/settings`,
};

export default URLS;
