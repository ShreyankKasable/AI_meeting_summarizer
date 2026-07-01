import styled from "styled-components";

// Shared typography primitives. Components compose / extend these instead of
// declaring font-size / weight / colour by hand.

export const H1 = styled.h1`
    margin: 0;
    font-family: var(--heading-font);
    font-weight: var(--bold);
    font-size: var(--h1-d);
    line-height: var(--line-height-110);
    letter-spacing: var(--letter-spacing-tight);
    color: var(--Color-Text-Bold);

    @media (max-width: 640px) {
        font-size: var(--h1-m);
    }
`;

export const H2 = styled.h2`
    margin: 0;
    font-family: var(--heading-font);
    font-weight: var(--bold);
    font-size: var(--h2-d);
    line-height: var(--line-height-110);
    letter-spacing: var(--letter-spacing-tight);
    color: var(--Color-Text-Bold);

    @media (max-width: 640px) {
        font-size: var(--h2-m);
    }
`;

export const H3 = styled.h3`
    margin: 0;
    font-family: var(--heading-font);
    font-weight: var(--bold);
    font-size: var(--h3-d);
    line-height: var(--line-height-120);
    letter-spacing: var(--letter-spacing-tight);
    color: var(--Color-Text-Default);

    @media (max-width: 640px) {
        font-size: var(--h3-m);
    }
`;

export const SubTitle1 = styled.div`
    font-family: var(--heading-font);
    font-weight: var(--semi-bold);
    font-size: var(--subtitle-1-d);
    line-height: var(--line-height-140);
    color: var(--Color-Text-Default);
`;

export const SubTitle2 = styled.div`
    font-family: var(--heading-font);
    font-weight: var(--semi-bold);
    font-size: var(--subtitle-2-d);
    line-height: var(--line-height-140);
    color: var(--Color-Text-Default);
`;

export const Body1 = styled.div`
    font-family: var(--body-font);
    font-weight: var(--regular);
    font-size: var(--body-1-d);
    line-height: var(--line-height-140);
    color: var(--Color-Text-Default);
`;

export const Body2 = styled.div`
    font-family: var(--body-font);
    font-weight: var(--regular);
    font-size: var(--body-2-d);
    line-height: var(--line-height-140);
    color: var(--Color-Text-Default);
`;

export const Body2_Med = styled(Body2)`
    font-weight: var(--medium);
`;

export const Body2_Bold = styled(Body2)`
    font-weight: var(--semi-bold);
`;

export const Body3 = styled.div`
    font-family: var(--body-font);
    font-weight: var(--regular);
    font-size: var(--body-3-d);
    line-height: var(--line-height-140);
    color: var(--Color-Text-Subtle);
`;

export const Body3_Med = styled(Body3)`
    font-weight: var(--medium);
`;

export const Body3_Bold = styled(Body3)`
    font-weight: var(--semi-bold);
    color: var(--Color-Text-Default);
`;

// Small uppercase eyebrow / label text used across cards and form fields.
export const Eyebrow = styled.span`
    display: block;
    font-family: var(--body-font);
    font-weight: var(--bold);
    font-size: var(--body-4-d);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    color: var(--Color-Text-Subtle);
`;

// Monospaced "code"-style accent (tokens, timestamps).
export const MonoLabel = styled.span`
    font-family: var(--mono-font);
    font-weight: var(--bold);
    font-size: var(--body-5-d);
    letter-spacing: var(--letter-spacing-widest);
    text-transform: uppercase;
    color: var(--Color-Text-Action);
`;
