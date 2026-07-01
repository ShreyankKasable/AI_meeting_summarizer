import React from "react";
import styled from "styled-components";
import { Body2 } from "common/global-styled-components";

const InfoBox = styled(Body2)`
    padding: var(--Size-Padding-XL);
    background: var(--Color-Background-Subtle-2);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-L);
    color: var(--Color-Text-Subtle);
`;

// No backend notification system exists yet — a placeholder rather than a
// fabricated working feature.
const NotificationsTab = () => <InfoBox>Notification preferences are coming soon.</InfoBox>;

export default NotificationsTab;
