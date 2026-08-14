import React from "react";
import styled from "styled-components";
import {
    ArrowRight,
    AudioLines,
    CheckCircle2,
    Cloud,
    Database,
    ListTodo,
    LockKeyhole,
    LogIn,
    MessageSquareText,
    ShieldCheck,
    Video,
} from "lucide-react";
import BrandLogo, { BRAND_NAME } from "common/components/BrandLogo";

const NAV_HEIGHT = "72px";

const capabilities = [
    {
        Icon: AudioLines,
        title: "Record and transcribe",
        body: "Capture browser audio and stream live transcription updates while the meeting is still in progress.",
    },
    {
        Icon: ListTodo,
        title: "Summaries and actions",
        body: "Turn long transcripts into concise summaries, decisions, and follow-up actions with token-aware AI workflows.",
    },
    {
        Icon: MessageSquareText,
        title: "Meeting-aware chat",
        body: "Ask grounded questions against the meeting record using transcript chunks, summary context, and chat history.",
    },
];

const audiences = [
    "Product teams reviewing roadmap decisions",
    "Engineering leads tracking technical follow-ups",
    "Founders and operators turning calls into execution notes",
];

const workflow = [
    {
        title: "Start a meeting",
        body: "Create a meeting record and begin browser-based audio capture.",
    },
    {
        title: "Transcribe live",
        body: "Audio chunks are sent for speech-to-text so the transcript appears during recording.",
    },
    {
        title: "Store the recording",
        body: "Final audio is compressed to MP3 and stored in cloud storage for durable playback.",
    },
    {
        title: "Index and ask",
        body: "Transcript content is indexed so AI chat can answer from the meeting record.",
    },
];

const trustSignals = [
    [
        LockKeyhole,
        "Protected records",
        "Meeting audio, transcript, summaries, action items, and chat history stay attached to the same workspace record.",
    ],
    [
        ShieldCheck,
        "Grounded answers",
        "AI responses are based on the selected meeting context, so teams can ask questions without losing the original source.",
    ],
    [
        Cloud,
        "Cloud playback",
        "Compressed recordings remain available for replay without keeping large audio files in the browser.",
    ],
    [
        Database,
        "Single source",
        "Every transcript, summary, action item, and follow-up conversation points back to one meeting record.",
    ],
];

const Page = styled.div`
    min-height: 100vh;
    position: relative;
    background: var(--Color-Background-Root);
    color: var(--Color-Text-Default);
    letter-spacing: 0;
    text-transform: none;

    &::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: 0.32;
        background:
            radial-gradient(circle at 1px 1px, rgba(120, 86, 0, 0.045) 1px, transparent 0);
        background-size: 18px 18px;
    }
`;

const Nav = styled.nav`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 50;
    background: rgba(249, 249, 247, 0.92);
    border-bottom: 1px solid var(--Color-Border-Subtle);
    backdrop-filter: blur(10px);
`;

const NavInner = styled.div`
    max-width: var(--layout-max);
    height: ${NAV_HEIGHT};
    margin: 0 auto;
    padding: 0 var(--Size-Padding-XL);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-XXL);

    @media (min-width: 768px) {
        padding: 0 var(--Size-Padding-4XL);
    }
`;

const BrandLink = styled.button`
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--Color-Text-Bold);
    font-family: var(--heading-font);
    font-size: var(--subtitle-1-d);
    font-weight: var(--bold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    white-space: nowrap;

    svg {
        color: var(--Color-Text-Action);
    }
`;

const BrandMark = styled.span`
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--Color-Border-Action);
    border-radius: var(--Size-CornerRadius-Full);
    background: var(--Color-Background-Action);
    color: var(--Color-Text-Inverse);
    font-size: var(--body-4-d);
    font-weight: var(--bold);

    svg {
        width: 17px;
        height: 17px;
        color: var(--Color-Icon-Inverse);
        stroke-width: 2;
    }
`;

const NavLinks = styled.div`
    display: none;
    align-items: center;
    gap: var(--Size-Gap-XXL);
    color: var(--Color-Text-Subtle);
    font-size: var(--body-3-d);
    font-weight: var(--semi-bold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;

    a {
        transition: color var(--transition-fast);
    }

    a:hover {
        color: var(--Color-Text-Action);
    }

    @media (min-width: 940px) {
        display: flex;
    }
`;

const NavActions = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-L);
`;

const SignIn = styled.button`
    display: none;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--Color-Text-Bold);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    font-weight: var(--medium);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    transition: color var(--transition-fast);

    &:hover {
        color: var(--Color-Text-Action);
    }

    @media (min-width: 640px) {
        display: inline-flex;
    }
`;

const Button = styled.button`
    min-height: ${({ $large }) => ($large ? "48px" : "42px")};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--Size-Gap-M);
    padding: 0 ${({ $large }) => ($large ? "var(--Size-Padding-XXL)" : "var(--Size-Padding-XL)")};
    border: 1px solid ${({ $secondary }) => ($secondary ? "var(--Color-Border-Default)" : "var(--Color-Border-Action)")};
    border-radius: var(--Size-CornerRadius-M);
    background: ${({ $secondary }) => ($secondary ? "var(--Color-Background-Default)" : "var(--Color-Background-Action)")};
    color: ${({ $secondary }) => ($secondary ? "var(--Color-Text-Bold)" : "var(--Color-Text-Inverse)")};
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    font-weight: var(--semi-bold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    white-space: nowrap;
    box-shadow: ${({ $secondary }) => ($secondary ? "none" : "var(--Color-Shadow-Action)")};
    transition:
        background var(--transition-fast),
        border-color var(--transition-fast),
        color var(--transition-fast),
        transform var(--transition-fast);

    &:hover {
        transform: translateY(-1px);
        border-color: var(--Color-Border-Action);
        background: ${({ $secondary }) => ($secondary ? "var(--Color-Background-Accent-Action)" : "var(--Color-Background-Action-Hover)")};
    }

    svg {
        width: 16px;
        height: 16px;
        stroke-width: 2;
    }
`;

const Main = styled.main`
    position: relative;
    z-index: 1;
    padding-top: ${NAV_HEIGHT};
`;

const Hero = styled.section`
    max-width: var(--layout-max);
    margin: 0 auto;
    padding: 72px var(--Size-Padding-XL) var(--Size-Gap-5XL);
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--Size-Gap-XXXL);
    border-left: 1px solid var(--Color-Border-Subtle);
    border-right: 1px solid var(--Color-Border-Subtle);

    @media (min-width: 980px) {
        min-height: calc(100vh - ${NAV_HEIGHT});
        grid-template-columns: minmax(0, 0.92fr) minmax(460px, 0.86fr);
        align-items: center;
        padding: 88px var(--Size-Padding-4XL) 80px;
    }
`;

const HeroCopy = styled.div`
    max-width: 720px;
`;

const Label = styled.span`
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    margin-bottom: var(--Size-Gap-XXL);
    padding: var(--Size-Padding-S) var(--Size-Padding-L);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-XS);
    background: var(--Color-Background-Accent-Action);
    color: var(--Color-Text-Action);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    font-weight: var(--semi-bold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;

    &::before {
        content: "";
        width: 7px;
        height: 7px;
        border-radius: var(--Size-CornerRadius-Full);
        background: var(--Color-Background-Action);
    }
`;

const HeroTitle = styled.h1`
    max-width: 720px;
    margin: 0;
    color: var(--Color-Text-Bold);
    font-family: var(--heading-font);
    font-size: 32px;
    font-weight: var(--bold);
    line-height: var(--line-height-110);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;

    span {
        color: var(--Color-Text-Action);
    }

    @media (min-width: 768px) {
        font-size: 48px;
    }
`;

const HeroText = styled.p`
    max-width: 640px;
    margin: var(--Size-Gap-XXL) 0 0;
    color: var(--Color-Text-Subtle);
    font-family: var(--mono-font);
    font-size: var(--body-1-d);
    line-height: var(--line-height-140);
`;

const HeroActions = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--Size-Gap-L);
    margin-top: var(--Size-Gap-XXXL);

    @media (min-width: 560px) {
        flex-direction: row;
        align-items: center;
    }
`;

const ProofGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    max-width: 720px;
    margin-top: var(--Size-Gap-XXXL);
    border: 1px solid var(--Color-Border-Subtle);
    background: rgba(255, 255, 255, 0.74);

    @media (min-width: 680px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
`;

const Proof = styled.div`
    padding: var(--Size-Padding-XL);
    border-bottom: 1px solid var(--Color-Border-Subtle);

    strong {
        display: block;
        color: var(--Color-Text-Bold);
        font-size: var(--body-3-d);
        letter-spacing: var(--letter-spacing-wide);
        text-transform: uppercase;
        margin-bottom: var(--Size-Gap-S);
    }

    span {
        display: block;
        color: var(--Color-Text-Subtle);
        font-family: var(--mono-font);
        font-size: var(--body-3-d);
        line-height: var(--line-height-140);
        text-transform: none;
    }

    @media (min-width: 680px) {
        border-bottom: 0;
        border-right: 1px solid var(--Color-Border-Subtle);

        &:last-child {
            border-right: 0;
        }
    }
`;

const HeroPreview = styled.figure`
    width: min(820px, 100%);
    margin: 0;
    justify-self: center;

    @media (min-width: 980px) {
        width: min(840px, 112%);
        transform: translate(18px, -136px);
    }
`;

const HeroPreviewImage = styled.img`
    display: block;
    width: 100%;
    height: 420px;
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-XL);
    box-shadow: 0 28px 70px rgba(120, 86, 0, 0.16);
`;

const Section = styled.section`
    scroll-margin-top: calc(${NAV_HEIGHT} + 8px);
    max-width: var(--layout-max);
    margin: 0 auto;
    padding: var(--Size-Gap-4XL) var(--Size-Padding-XL);
    border-top: 1px solid var(--Color-Border-Subtle);
    border-left: 1px solid var(--Color-Border-Subtle);
    border-right: 1px solid var(--Color-Border-Subtle);

    @media (min-width: 768px) {
        padding: 56px var(--Size-Padding-4XL) 78px;
    }
`;

const SectionHead = styled.div`
    max-width: 920px;
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--Size-Gap-XXL);
    align-items: center;
    margin-bottom: var(--Size-Gap-4XL);
    padding-bottom: var(--Size-Gap-XXXL);
    border-bottom: 1px solid var(--Color-Border-Subtle);

    @media (min-width: 860px) {
        max-width: none;
        grid-template-columns: auto 2px minmax(0, 1fr);
        gap: var(--Size-Gap-XXXL);
    }
`;

const SectionKicker = styled.div`
    width: fit-content;
    min-height: 58px;
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-L);
    padding: var(--Size-Padding-S) var(--Size-Padding-XXL) var(--Size-Padding-S) var(--Size-Padding-S);
    border: 1px solid var(--Color-Border-Action);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Accent-Action);
    color: var(--Color-Text-Action);
    font-family: var(--mono-font);
    font-size: 32px;
    font-weight: var(--semi-bold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    box-shadow: 0 10px 24px rgba(120, 86, 0, 0.08);

    span {
        width: 50px;
        height: 50px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        border: 1px solid var(--Color-Border-Action);
        background: var(--Color-Background-Action);
        color: var(--Color-Text-Inverse);
        font-size: var(--body-3-d);
        font-weight: var(--bold);
    }

    strong {
        color: var(--Color-Text-Action);
        font: inherit;
        line-height: var(--line-height-110);
    }

    @media (min-width: 768px) {
        min-height: 70px;
        font-size: 46px;

        span {
            width: 62px;
            height: 62px;
            font-size: var(--subtitle-2-d);
        }
    }
`;

const SectionDivider = styled.div`
    width: 72px;
    height: 2px;
    background: var(--Color-Background-Action);

    @media (min-width: 860px) {
        width: 2px;
        min-height: 96px;
        align-self: stretch;
    }
`;

const SectionTitleGroup = styled.div`
    min-width: 0;
`;

const SectionLead = styled.p`
    max-width: 840px;
    margin: 0;
    color: var(--Color-Text-Bold);
    font-family: var(--mono-font);
    font-size: var(--subtitle-1-d);
    font-weight: var(--medium);
    line-height: var(--line-height-140);
    letter-spacing: 0;
    text-transform: none;
`;

const SectionCopy = styled.p`
    max-width: 760px;
    margin: var(--Size-Gap-M) 0 0;
    color: var(--Color-Text-Subtle);
    font-family: var(--mono-font);
    font-size: var(--body-2-d);
    line-height: var(--line-height-140);
    letter-spacing: 0;
    text-transform: none;
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    border: 1px solid var(--Color-Border-Default);
    background: var(--Color-Border-Subtle);
    gap: 1px;

    @media (min-width: 860px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
`;

const Card = styled.article`
    min-height: 252px;
    padding: var(--Size-Padding-XXXL);
    background: var(--Color-Background-Default);
    transition:
        background var(--transition-fast),
        transform var(--transition-fast);

    &:hover {
        background: var(--Color-Background-Accent-Action);
    }

    svg {
        margin-bottom: var(--Size-Gap-XXL);
        color: var(--Color-Icon-Action);
        width: 30px;
        height: 30px;
        stroke-width: 1.8;
    }

    h3 {
        margin: 0 0 var(--Size-Gap-L);
        color: var(--Color-Text-Bold);
        font-family: var(--heading-font);
        font-size: var(--subtitle-2-d);
        line-height: var(--line-height-120);
        letter-spacing: var(--letter-spacing-wide);
        text-transform: uppercase;
    }

    p {
        margin: 0;
        color: var(--Color-Text-Subtle);
        font-family: var(--mono-font);
        font-size: var(--body-2-d);
        line-height: var(--line-height-140);
        text-transform: none;
    }
`;

const AudienceGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--Size-Gap-L);

    @media (min-width: 820px) {
        grid-template-columns: 0.9fr 1.1fr;
        align-items: stretch;
    }
`;

const AudienceNote = styled.div`
    padding: var(--Size-Padding-XXL);
    border: 1px solid var(--Color-Border-Default);
    background: var(--Color-Background-Accent-Action);

    h3 {
        margin: 0 0 var(--Size-Gap-L);
        color: var(--Color-Text-Bold);
        font-family: var(--heading-font);
        font-size: var(--h3-m);
        letter-spacing: var(--letter-spacing-wide);
        text-transform: uppercase;
    }

    p {
        margin: 0;
        color: var(--Color-Text-Subtle);
        font-family: var(--mono-font);
        font-size: var(--body-2-d);
        line-height: var(--line-height-140);
        text-transform: none;
    }
`;

const AudienceList = styled.div`
    display: grid;
    border: 1px solid var(--Color-Border-Default);
    background: var(--Color-Background-Default);
`;

const AudienceItem = styled.div`
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr);
    gap: var(--Size-Gap-L);
    align-items: center;
    min-height: 76px;
    padding: var(--Size-Padding-L) var(--Size-Padding-XL);
    border-bottom: 1px solid var(--Color-Border-Subtle);
    color: var(--Color-Text-Bold);
    font-size: var(--body-3-d);
    font-weight: var(--semi-bold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;

    &:last-child {
        border-bottom: 0;
    }

    svg {
        color: var(--Color-Icon-Action);
        width: 18px;
        height: 18px;
        stroke-width: 2;
    }
`;

const WorkflowGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    border: 1px solid var(--Color-Border-Default);
    background: var(--Color-Border-Subtle);
    gap: 1px;

    @media (min-width: 960px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
`;

const Step = styled.article`
    min-height: 240px;
    padding: var(--Size-Padding-XXL);
    background: ${({ $active }) => ($active ? "var(--Color-Background-Default)" : "var(--Color-Background-Root)")};

    strong {
        width: 32px;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--Size-Gap-XXL);
        border: 1px solid var(--Color-Border-Default);
        background: ${({ $active }) => ($active ? "var(--Color-Background-Action)" : "var(--Color-Background-Default)")};
        color: ${({ $active }) => ($active ? "var(--Color-Text-Inverse)" : "var(--Color-Text-Action)")};
        font-size: var(--caption-d);
    }

    h3 {
        margin: 0 0 var(--Size-Gap-L);
        color: var(--Color-Text-Bold);
        font-family: var(--heading-font);
        font-size: var(--subtitle-2-d);
        letter-spacing: var(--letter-spacing-wide);
        text-transform: uppercase;
    }

    p {
        margin: 0;
        color: var(--Color-Text-Subtle);
        font-family: var(--mono-font);
        font-size: var(--body-2-d);
        line-height: var(--line-height-140);
        text-transform: none;
    }
`;

const OutcomeGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--Size-Gap-XXL);

    @media (min-width: 920px) {
        grid-template-columns: 1.15fr 0.85fr;
    }
`;

const OutcomePanel = styled.div`
    padding: var(--Size-Padding-XXL);
    border: 1px solid var(--Color-Border-Default);
    background: var(--Color-Background-Default);

    h3 {
        margin: 0 0 var(--Size-Gap-L);
        color: var(--Color-Text-Bold);
        font-family: var(--heading-font);
        font-size: var(--h3-m);
        letter-spacing: var(--letter-spacing-wide);
        text-transform: uppercase;
    }

    p {
        margin: 0;
        color: var(--Color-Text-Subtle);
        font-family: var(--mono-font);
        font-size: var(--body-2-d);
        line-height: var(--line-height-140);
        text-transform: none;
    }
`;

const MetricGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--Size-Gap-L);

    @media (min-width: 560px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
`;

const Metric = styled.div`
    padding: var(--Size-Padding-XL);
    border: 1px solid var(--Color-Border-Default);
    background: var(--Color-Background-Accent-Action);

    strong {
        display: block;
        margin-bottom: var(--Size-Gap-S);
        color: var(--Color-Text-Bold);
        font-size: var(--subtitle-2-d);
        letter-spacing: var(--letter-spacing-wide);
        text-transform: uppercase;
    }

    span {
        color: var(--Color-Text-Subtle);
        font-family: var(--mono-font);
        font-size: var(--body-3-d);
        line-height: var(--line-height-140);
        text-transform: none;
    }
`;

const TrustRows = styled.div`
    border: 1px solid var(--Color-Border-Default);
    background: var(--Color-Background-Default);
`;

const TrustRow = styled.div`
    display: grid;
    grid-template-columns: 32px 160px minmax(0, 1fr);
    gap: var(--Size-Gap-XL);
    align-items: start;
    padding: var(--Size-Padding-XL);
    border-bottom: 1px solid var(--Color-Border-Subtle);

    &:last-child {
        border-bottom: 0;
    }

    svg {
        width: 19px;
        height: 19px;
        color: var(--Color-Icon-Action);
        stroke-width: 1.8;
    }

    strong {
        color: var(--Color-Text-Bold);
        font-size: var(--body-3-d);
        letter-spacing: var(--letter-spacing-wide);
        text-transform: uppercase;
    }

    span {
        color: var(--Color-Text-Subtle);
        font-family: var(--mono-font);
        font-size: var(--body-2-d);
        line-height: var(--line-height-140);
        text-transform: none;
    }

    @media (max-width: 640px) {
        grid-template-columns: 24px minmax(0, 1fr);
        gap: var(--Size-Gap-S);

        span {
            grid-column: 2;
        }
    }
`;

const Cta = styled.section`
    max-width: var(--layout-max);
    margin: 0 auto;
    padding: var(--Size-Gap-5XL) var(--Size-Padding-XL);
    border: 1px solid var(--Color-Border-Subtle);
    border-bottom: 0;
    background: var(--Color-Background-Bold);
    color: var(--Color-Text-Inverse);
    text-align: center;

    @media (min-width: 768px) {
        padding: 88px var(--Size-Padding-4XL);
    }
`;

const CtaTitle = styled.h2`
    max-width: 760px;
    margin: 0 auto;
    color: inherit;
    font-family: var(--heading-font);
    font-size: 28px;
    line-height: var(--line-height-120);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;

    @media (min-width: 768px) {
        font-size: 34px;
    }
`;

const CtaText = styled.p`
    max-width: 640px;
    margin: var(--Size-Gap-XXL) auto 0;
    color: rgba(255, 255, 255, 0.74);
    font-family: var(--mono-font);
    font-size: var(--body-1-d);
    line-height: var(--line-height-140);
    text-transform: none;
`;

const Footer = styled.footer`
    position: relative;
    z-index: 1;
    max-width: var(--layout-max);
    margin: 0 auto;
    padding: var(--Size-Padding-XXL) var(--Size-Padding-XL);
    border: 1px solid var(--Color-Border-Subtle);
    background: var(--Color-Background-Subtle);

    @media (min-width: 768px) {
        padding: var(--Size-Padding-XXL) var(--Size-Padding-4XL);
    }
`;

const FooterInner = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
    color: var(--Color-Text-Subtle);
    font-size: var(--body-4-d);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
`;

const LandingPage = ({ onSignIn, onRegister, onJoin }) => {
    const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <Page>
            <Nav>
                <NavInner>
                    <BrandLink type="button" onClick={goTop}>
                        <BrandLogo width="190px" maxHeight="50px" />
                    </BrandLink>
                    <NavLinks aria-label="Primary navigation">
                        <a href="#product">Product</a>
                        <a href="#workflow">Workflow</a>
                        <a href="#outcomes">Outcomes</a>
                        <a href="#trust">Trust</a>
                    </NavLinks>
                    <NavActions>
                        <SignIn type="button" onClick={onSignIn}>
                            Sign In
                        </SignIn>
                        <Button type="button" onClick={onRegister}>
                            Start
                            <ArrowRight aria-hidden="true" />
                        </Button>
                    </NavActions>
                </NavInner>
            </Nav>

            <Main>
                <Hero>
                    <HeroCopy>
                        <Label>AI meeting workspace</Label>
                        <HeroTitle>
                            Record meetings. Summarize decisions. <span>Chat with the transcript.</span>
                        </HeroTitle>
                        <HeroText>
                            EchoDesk AI turns conversations into a searchable meeting record with live transcription,
                            compressed cloud audio, summaries, action items, and grounded AI chat.
                        </HeroText>
                        <HeroActions>
                            <Button type="button" $large onClick={onRegister}>
                                Create Workspace
                                <ArrowRight aria-hidden="true" />
                            </Button>
                            <Button type="button" $large $secondary onClick={onJoin}>
                                Join Shared Meeting
                                <Video aria-hidden="true" />
                            </Button>
                        </HeroActions>
                        <ProofGrid aria-label={`${BRAND_NAME} core signals`}>
                            <Proof>
                                <strong>Live Transcript</strong>
                                <span>Speech-to-text while recording</span>
                            </Proof>
                            <Proof>
                                <strong>Grounded Chat</strong>
                                <span>AI answers stay tied to the transcript</span>
                            </Proof>
                            <Proof>
                                <strong>Cloud Audio</strong>
                                <span>Compressed MP3 recordings stored in the cloud</span>
                            </Proof>
                        </ProofGrid>
                    </HeroCopy>

                    <HeroPreview aria-label={`${BRAND_NAME} product preview`}>
                        <HeroPreviewImage
                            src="/brand/echodesk-ai-product-preview.png"
                            alt="EchoDesk AI meeting workspace interface preview"
                        />
                    </HeroPreview>
                </Hero>

                <Section id="product">
                    <SectionHead>
                        <SectionKicker>
                            <span>01</span>
                            <strong>Product</strong>
                        </SectionKicker>
                        <SectionDivider aria-hidden="true" />
                        <SectionTitleGroup>
                            <SectionLead>One meeting workspace for audio, transcript, summary, actions, and AI chat.</SectionLead>
                            <SectionCopy>
                                Capture the conversation once, then reuse it as a complete meeting record instead of
                                scattered notes and disconnected recordings.
                            </SectionCopy>
                        </SectionTitleGroup>
                    </SectionHead>
                    <CardGrid>
                        {capabilities.map((item) => (
                            <Card key={item.title}>
                                <item.Icon aria-hidden="true" />
                                <h3>{item.title}</h3>
                                <p>{item.body}</p>
                            </Card>
                        ))}
                    </CardGrid>
                </Section>

                <Section id="audience">
                    <SectionHead>
                        <SectionKicker>
                            <span>02</span>
                            <strong>Audience</strong>
                        </SectionKicker>
                        <SectionDivider aria-hidden="true" />
                        <SectionTitleGroup>
                            <SectionLead>Built for teams that need decisions to survive beyond the call.</SectionLead>
                            <SectionCopy>
                                The workflow is focused on product, engineering, and operating conversations where
                                follow-up accuracy matters.
                            </SectionCopy>
                        </SectionTitleGroup>
                    </SectionHead>
                    <AudienceGrid>
                        <AudienceNote>
                            <h3>For product and engineering conversations</h3>
                            <p>
                                EchoDesk AI is strongest when meetings contain technical context, decisions, risks,
                                and follow-ups that need to be searched or revisited later.
                            </p>
                        </AudienceNote>
                        <AudienceList>
                            {audiences.map((item) => (
                                <AudienceItem key={item}>
                                    <CheckCircle2 aria-hidden="true" />
                                    <span>{item}</span>
                                </AudienceItem>
                            ))}
                        </AudienceList>
                    </AudienceGrid>
                </Section>

                <Section id="workflow">
                    <SectionHead>
                        <SectionKicker>
                            <span>03</span>
                            <strong>Workflow</strong>
                        </SectionKicker>
                        <SectionDivider aria-hidden="true" />
                        <SectionTitleGroup>
                            <SectionLead>From microphone input to grounded meeting intelligence.</SectionLead>
                            <SectionCopy>
                                Start recording, watch the transcript appear, save the meeting record, then ask
                                questions from the same source of truth.
                            </SectionCopy>
                        </SectionTitleGroup>
                    </SectionHead>
                    <WorkflowGrid>
                        {workflow.map((item, index) => (
                            <Step key={item.title} $active={index === 0}>
                                <strong>{String(index + 1).padStart(2, "0")}</strong>
                                <h3>{item.title}</h3>
                                <p>{item.body}</p>
                            </Step>
                        ))}
                    </WorkflowGrid>
                </Section>

                <Section id="outcomes">
                    <SectionHead>
                        <SectionKicker>
                            <span>04</span>
                            <strong>Outcomes</strong>
                        </SectionKicker>
                        <SectionDivider aria-hidden="true" />
                        <SectionTitleGroup>
                            <SectionLead>Less meeting drift, more reusable context.</SectionLead>
                            <SectionCopy>
                                Teams can search, replay, summarize, and ask questions from the same source of truth
                                after the meeting ends.
                            </SectionCopy>
                        </SectionTitleGroup>
                    </SectionHead>
                    <OutcomeGrid>
                        <OutcomePanel>
                            <h3>Every meeting becomes a source of truth</h3>
                            <p>
                                Instead of scattered notes and lost recordings, EchoDesk AI keeps the original transcript,
                                compressed audio, AI summary, action items, participant access, and chat history tied
                                to the same record.
                            </p>
                        </OutcomePanel>
                        <MetricGrid>
                            <Metric>
                                <strong>Search</strong>
                                <span>Ask specific questions instead of scanning full transcripts</span>
                            </Metric>
                            <Metric>
                                <strong>Share</strong>
                                <span>Give participants controlled access to meeting records</span>
                            </Metric>
                            <Metric>
                                <strong>Replay</strong>
                                <span>Stream cloud audio without storing recordings locally</span>
                            </Metric>
                        </MetricGrid>
                    </OutcomeGrid>
                </Section>

                <Section id="trust">
                    <SectionHead>
                        <SectionKicker>
                            <span>05</span>
                            <strong>Trust</strong>
                        </SectionKicker>
                        <SectionDivider aria-hidden="true" />
                        <SectionTitleGroup>
                            <SectionLead>Private meeting records your team can rely on.</SectionLead>
                            <SectionCopy>
                                Keep the conversation, replayable audio, AI summary, actions, and grounded chat in one
                                place after the meeting ends.
                            </SectionCopy>
                        </SectionTitleGroup>
                    </SectionHead>
                    <TrustRows>
                        {trustSignals.map(([Icon, label, value]) => (
                            <TrustRow key={label}>
                                <Icon aria-hidden="true" />
                                <strong>{label}</strong>
                                <span>{value}</span>
                            </TrustRow>
                        ))}
                    </TrustRows>
                </Section>

                <Cta>
                    <CtaTitle>Turn your next meeting into a searchable, summarized record.</CtaTitle>
                    <CtaText>
                        Create a workspace, record a meeting, and keep the transcript, summary, action items, and AI
                        chat connected.
                    </CtaText>
                    <HeroActions style={{ justifyContent: "center" }}>
                        <Button type="button" $large onClick={onRegister}>
                            Start Now
                            <ArrowRight aria-hidden="true" />
                        </Button>
                        <Button type="button" $large $secondary onClick={onSignIn}>
                            Sign In
                            <LogIn aria-hidden="true" />
                        </Button>
                    </HeroActions>
                </Cta>
            </Main>

            <Footer>
                <FooterInner>
                    <BrandLink type="button" onClick={goTop}>
                        <BrandLogo width="174px" maxHeight="46px" />
                    </BrandLink>
                    <span>Meeting records with transcript-aware AI chat</span>
                    <span>Audio + summary + actions in one workspace</span>
                </FooterInner>
            </Footer>
        </Page>
    );
};

export default LandingPage;
