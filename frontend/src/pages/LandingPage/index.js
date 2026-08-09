import React from "react";
import styled from "styled-components";

const Page = styled.div`
    min-height: 100vh;
    position: relative;
    background-color: var(--Color-Background-Root);
    color: var(--Color-Text-Default);

    &::before {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
        opacity: 0.36;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
        background-repeat: repeat;
    }
`;

const Nav = styled.nav`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 50;
    background: rgba(249, 249, 247, 0.9);
    border-bottom: 1px solid var(--Color-Background-Subtle-2);
    backdrop-filter: blur(8px);
`;

const NavInner = styled.div`
    max-width: var(--layout-max);
    height: 64px;
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
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--Color-Text-Action);
    font-family: var(--heading-font);
    font-size: var(--h3-d);
    font-weight: var(--semi-bold);
`;

const NavLinks = styled.div`
    display: none;
    align-items: center;
    gap: var(--Size-Gap-XXL);
    color: var(--Color-Text-Bold);
    font-size: var(--body-3-d);
    line-height: var(--line-height-160);

    a {
        transition: color var(--transition-fast);
    }

    a:hover {
        color: var(--Color-Text-Action);
    }

    @media (min-width: 768px) {
        display: flex;
    }
`;

const NavActions = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-XL);
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
    line-height: 16px;
    letter-spacing: var(--app-letter-spacing);
    text-transform: uppercase;
    transition: color var(--transition-fast);

    &:hover {
        color: var(--Color-Text-Action);
    }

    @media (min-width: 768px) {
        display: block;
    }
`;

const PrimaryLink = styled.button`
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--Size-Padding-XXL);
    border: 0;
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Action);
    color: var(--Color-Text-Inverse);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    font-weight: var(--medium);
    line-height: 16px;
    letter-spacing: var(--app-letter-spacing);
    text-transform: uppercase;
    transition: background var(--transition-fast);

    &:hover {
        background: var(--Color-Background-Action-Hover);
    }
`;

const HeroPrimary = styled(PrimaryLink)`
    width: 100%;
    height: 48px;

    @media (min-width: 640px) {
        width: auto;
        padding: 0 var(--Size-Padding-XXXL);
    }
`;

const SecondaryButton = styled.button`
    width: 100%;
    height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--Size-Padding-XXXL);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Default);
    color: var(--Color-Text-Bold);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    font-weight: var(--medium);
    line-height: 16px;
    letter-spacing: var(--app-letter-spacing);
    text-transform: uppercase;
    transition: border-color var(--transition-fast);

    &:hover {
        border-color: var(--Color-Border-Action);
    }

    @media (min-width: 640px) {
        width: auto;
    }
`;

const Main = styled.main`
    padding-top: 96px;
    padding-bottom: var(--Size-Gap-5XL);
`;

const Container = styled.div`
    max-width: var(--layout-max);
    margin: 0 auto;
    padding: 0 var(--Size-Padding-XL);

    @media (min-width: 768px) {
        padding: 0 var(--Size-Padding-4XL);
    }
`;

const HeroSection = styled.section`
    max-width: var(--layout-max);
    margin: 0 auto;
    padding: 64px var(--Size-Padding-XL) var(--Size-Gap-5XL);
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--Size-Gap-XXL);

    @media (min-width: 768px) {
        padding: 128px var(--Size-Padding-4XL) var(--Size-Gap-5XL);
        grid-template-columns: repeat(12, minmax(0, 1fr));
    }
`;

const HeroCopy = styled.div`
    grid-column: 1;
    max-width: 896px;
    margin: 0 auto 64px;
    text-align: center;
    position: relative;
    z-index: 1;

    @media (min-width: 768px) {
        grid-column: span 12;
    }
`;

const Label = styled.span`
    display: block;
    margin-bottom: var(--Size-Gap-XXL);
    color: var(--Color-Text-Action);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    font-weight: var(--medium);
    line-height: 16px;
    letter-spacing: var(--app-letter-spacing);
    text-transform: uppercase;
`;

const HeroTitle = styled.h1`
    margin: 0 0 var(--Size-Gap-XXXL);
    color: var(--Color-Text-Bold);
    font-family: var(--heading-font);
    font-size: var(--h1-m);
    font-weight: var(--bold);
    line-height: 40px;
    letter-spacing: var(--app-heading-letter-spacing);

    span {
        color: var(--Color-Text-Action);
        font-style: italic;
    }

    @media (min-width: 768px) {
        font-size: var(--h1-d);
        line-height: 56px;
        letter-spacing: var(--app-heading-letter-spacing);
    }
`;

const HeroText = styled.p`
    max-width: 672px;
    margin: 0 auto 40px;
    color: var(--Color-Text-Subtle);
    font-size: var(--body-1-d);
    line-height: 32px;
`;

const HeroActions = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--Size-Gap-XL);

    @media (min-width: 640px) {
        flex-direction: row;
    }
`;

const PreviewWrap = styled.div`
    grid-column: 1;
    position: relative;
    z-index: 1;

    @media (min-width: 768px) {
        grid-column: span 12;
    }
`;

const ProductPreview = styled.div`
    min-height: 500px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-XL);
    box-shadow: 0 4px 24px -4px rgba(120, 86, 0, 0.06);

    @media (min-width: 768px) {
        flex-direction: row;
    }
`;

const TranscriptMock = styled.div`
    width: 100%;
    min-height: 500px;
    position: relative;
    display: flex;
    flex-direction: column;
    padding: var(--Size-Padding-XXL);
    background: var(--Color-Background-Default);

    @media (min-width: 768px) {
        width: 60%;
        border-right: 1px solid var(--Color-Background-Subtle-2);
    }
`;

const PreviewHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
    padding-bottom: var(--Size-Padding-XL);
    margin-bottom: var(--Size-Padding-XL);
    border-bottom: 1px solid var(--Color-Background-Subtle-2);

    h3 {
        margin: 0;
        font-family: var(--heading-font);
        font-size: var(--h3-d);
        font-weight: var(--semi-bold);
        line-height: 32px;
    }

    span {
        color: var(--Color-Text-Subtle);
        font-family: var(--mono-font);
        font-size: var(--body-4-d);
        line-height: 16px;
        letter-spacing: var(--app-letter-spacing);
        text-transform: uppercase;
    }
`;

const Timeline = styled.div`
    flex: 1;
    position: relative;
    overflow: hidden;
    display: grid;
    gap: var(--Size-Gap-XXL);

    &::before {
        content: "";
        position: absolute;
        left: 16px;
        top: 8px;
        bottom: 0;
        width: 1px;
        background: var(--Color-Background-Subtle-2);
    }

    &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 96px;
        background: linear-gradient(to top, var(--Color-Background-Default), transparent);
        pointer-events: none;
    }
`;

const Turn = styled.div`
    position: relative;
    padding-left: 40px;

    &::before {
        content: "";
        position: absolute;
        left: 13px;
        top: 4px;
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: ${({ $active }) => ($active ? "var(--Color-Background-Action)" : "var(--Color-Background-Subtle-2)")};
        box-shadow: 0 0 0 4px var(--Color-Background-Default);
    }
`;

const TurnMeta = styled.div`
    display: flex;
    gap: var(--Size-Gap-M);
    margin-bottom: var(--Size-Gap-S);
    color: var(--Color-Text-Subtle);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    line-height: 16px;
    letter-spacing: var(--app-letter-spacing);
    text-transform: uppercase;

    strong {
        color: var(--Color-Text-Bold);
    }
`;

const TurnText = styled.p`
    margin: 0;
    color: var(--Color-Text-Subtle);
    font-size: var(--body-2-d);
    line-height: 28px;
`;

const InsightsPanel = styled.div`
    width: 100%;
    min-height: 500px;
    padding: var(--Size-Padding-XXL);
    background: var(--Color-Background-Root);

    @media (min-width: 768px) {
        width: 40%;
    }
`;

const InsightsHeader = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    padding-bottom: var(--Size-Padding-XL);
    margin-bottom: var(--Size-Gap-XXL);
    border-bottom: 1px solid var(--Color-Background-Subtle-2);
    color: var(--Color-Text-Action);

    h4 {
        margin: 0;
        font-family: var(--mono-font);
        font-size: var(--body-4-d);
        font-weight: var(--medium);
        line-height: 16px;
        letter-spacing: var(--app-letter-spacing);
        text-transform: uppercase;
    }
`;

const InsightStack = styled.div`
    display: grid;
    gap: 32px;
`;

const InsightTitle = styled.h5`
    margin: 0 0 var(--Size-Gap-M);
    color: var(--Color-Text-Bold);
    font-family: var(--heading-font);
    font-size: 18px;
    font-weight: var(--semi-bold);
    line-height: 28px;
`;

const InsightText = styled.p`
    margin: 0;
    color: var(--Color-Text-Subtle);
    font-size: var(--body-3-d);
    line-height: 24px;
`;

const ActionList = styled.ul`
    display: grid;
    gap: var(--Size-Gap-L);
    margin: 0;
    padding: 0;
    list-style: none;
`;

const ActionItem = styled.li`
    display: flex;
    align-items: flex-start;
    gap: var(--Size-Gap-L);
    color: var(--Color-Text-Subtle);
    font-size: var(--body-3-d);
    line-height: 24px;
`;

const Checkbox = styled.span`
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 4px;
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-XS);
`;

const Rule = styled.div`
    max-width: var(--layout-max);
    margin: 0 auto;
    padding: 0 var(--Size-Padding-XL);

    @media (min-width: 768px) {
        padding: 0 var(--Size-Padding-4XL);
    }

    div {
        width: 100%;
        border-top: 1px solid var(--Color-Background-Subtle-2);
    }
`;

const Section = styled.section`
    max-width: var(--layout-max);
    margin: 0 auto;
    padding: var(--Size-Gap-5XL) var(--Size-Padding-XL);

    @media (min-width: 768px) {
        padding: var(--Size-Gap-5XL) var(--Size-Padding-4XL);
    }
`;

const SectionIntro = styled.div`
    margin-bottom: 48px;

    h2 {
        margin: 0;
        color: var(--Color-Text-Bold);
        font-family: var(--heading-font);
        font-size: var(--h1-m);
        font-weight: var(--bold);
        line-height: 40px;
        letter-spacing: var(--app-heading-letter-spacing);

        @media (min-width: 768px) {
            font-size: var(--h2-d);
            line-height: 40px;
            letter-spacing: var(--app-heading-letter-spacing);
        }
    }
`;

const BentoGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--Size-Gap-XXL);

    @media (min-width: 768px) {
        grid-template-columns: repeat(12, minmax(0, 1fr));
    }
`;

const FeatureCard = styled.div`
    position: relative;
    overflow: hidden;
    padding: var(--Size-Padding-XXXL);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-XL);
    background: ${({ $paper }) => ($paper ? "var(--Color-Background-Default)" : "var(--Color-Background-Root)")};
    box-shadow: ${({ $paper }) => ($paper ? "0 4px 24px -4px rgba(120, 86, 0, 0.06)" : "none")};

    @media (min-width: 768px) {
        grid-column: ${({ $span }) => `span ${$span || 4}`};
    }

    .material-symbols-outlined {
        display: block;
        margin-bottom: var(--Size-Gap-XL);
        color: ${({ $primary }) => ($primary ? "var(--Color-Text-Action)" : "var(--Color-Text-Bold)")};
        font-size: ${({ $largeIcon }) => ($largeIcon ? "200px" : "30px")};
    }

    h3 {
        margin: 0 0 var(--Size-Gap-L);
        color: var(--Color-Text-Bold);
        font-family: var(--heading-font);
        font-size: var(--h3-d);
        font-weight: var(--semi-bold);
        line-height: 32px;
    }

    p {
        margin: 0;
        color: var(--Color-Text-Subtle);
        font-size: var(--body-2-d);
        line-height: 28px;
    }
`;

const DecorativeIcon = styled.div`
    position: absolute;
    right: -40px;
    bottom: -40px;
    opacity: 0.1;
`;

const SearchMock = styled.div`
    width: 100%;
    height: 128px;
    padding: var(--Size-Padding-XL);
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-M);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Root);

    @media (min-width: 768px) {
        width: 256px;
    }
`;

const SearchInputMock = styled.div`
    height: 32px;
    display: flex;
    align-items: center;
    padding: 0 var(--Size-Padding-L);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Default);
`;

const SkeletonLine = styled.div`
    width: ${({ $width }) => $width || "100%"};
    height: ${({ $height }) => $height || "8px"};
    border-radius: 999px;
    background: var(--Color-Background-Subtle-2);
`;

const ProcessSection = styled(Section)`
    text-align: center;
`;

const ProcessGrid = styled.div`
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--Size-Gap-XXXL);
    text-align: left;

    @media (min-width: 768px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--Size-Gap-XXL);

        &::before {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            top: calc(50% - 48px);
            height: 1px;
            background: var(--Color-Background-Subtle-2);
            z-index: 0;
        }
    }
`;

const Step = styled.div`
    position: relative;
    z-index: 1;
    padding: var(--Size-Padding-XXXL);
    border: 1px solid var(--Color-Border-Default);
    background: ${({ $active }) => ($active ? "var(--Color-Background-Default)" : "var(--Color-Background-Root)")};
    box-shadow: ${({ $active }) => ($active ? "0 4px 24px -4px rgba(120, 86, 0, 0.06)" : "none")};

    h3 {
        margin: var(--Size-Gap-XL) 0 var(--Size-Gap-L);
        color: var(--Color-Text-Bold);
        font-family: var(--heading-font);
        font-size: 20px;
        line-height: 28px;
        font-weight: var(--semi-bold);
    }

    p {
        margin: 0;
        color: var(--Color-Text-Subtle);
        font-size: var(--body-3-d);
        line-height: 24px;
    }
`;

const StepNumber = styled.div`
    position: absolute;
    top: -16px;
    left: 32px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    border: ${({ $active }) => ($active ? "none" : "1px solid var(--Color-Border-Default)")};
    background: ${({ $active }) => ($active ? "var(--Color-Background-Action)" : "var(--Color-Background-Default)")};
    color: ${({ $active }) => ($active ? "var(--Color-Text-Inverse)" : "var(--Color-Text-Action)")};
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    font-weight: var(--medium);
`;

const PricingHeader = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--Size-Gap-XL);
    margin-bottom: 48px;

    @media (min-width: 768px) {
        flex-direction: row;
        align-items: end;
    }
`;

const PricingGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    overflow: hidden;
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-XL);

    @media (min-width: 768px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
`;

const Plan = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 40px;
    background: ${({ $active }) => ($active ? "var(--Color-Background-Default)" : "var(--Color-Background-Root)")};
    border-bottom: 1px solid var(--Color-Border-Default);

    @media (min-width: 768px) {
        border-bottom: 0;
        border-right: ${({ $rightRule }) => ($rightRule ? "1px solid var(--Color-Border-Default)" : "none")};
    }

    h3 {
        margin: 0 0 var(--Size-Gap-M);
        color: var(--Color-Text-Bold);
        font-family: var(--heading-font);
        font-size: var(--h3-d);
        line-height: 32px;
        font-weight: var(--semi-bold);
    }
`;

const Price = styled.div`
    margin-bottom: var(--Size-Gap-XXL);

    strong {
        color: var(--Color-Text-Bold);
        font-family: var(--heading-font);
        font-size: var(--h2-d);
        line-height: 40px;
        font-weight: var(--semi-bold);
    }

    span {
        color: var(--Color-Text-Subtle);
        font-size: var(--body-3-d);
        line-height: 24px;
    }
`;

const PlanCopy = styled.p`
    height: 48px;
    margin: 0 0 var(--Size-Gap-XXXL);
    color: var(--Color-Text-Subtle);
    font-size: var(--body-3-d);
    line-height: 24px;
`;

const PlanList = styled.ul`
    flex: 1;
    display: grid;
    gap: var(--Size-Gap-XL);
    margin: 0 0 40px;
    padding: 0;
    list-style: none;
`;

const PlanFeature = styled.li`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-L);
    color: var(--Color-Text-Bold);
    font-size: var(--body-3-d);
    line-height: 24px;

    .material-symbols-outlined {
        color: var(--Color-Text-Action);
        font-size: 16px;
    }
`;

const PlanButton = styled.button`
    width: 100%;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: ${({ $primary }) => ($primary ? "0" : "1px solid var(--Color-Border-Default)")};
    border-radius: var(--Size-CornerRadius-M);
    background: ${({ $primary }) => ($primary ? "var(--Color-Background-Action)" : "transparent")};
    color: ${({ $primary }) => ($primary ? "var(--Color-Text-Inverse)" : "var(--Color-Text-Bold)")};
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    font-weight: var(--medium);
    line-height: 16px;
    letter-spacing: var(--app-letter-spacing);
    text-transform: uppercase;
    transition: all var(--transition-fast);

    &:hover {
        border-color: var(--Color-Border-Action);
        background: ${({ $primary }) => ($primary ? "var(--Color-Background-Action-Hover)" : "transparent")};
    }
`;

const Recommended = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    padding: 4px var(--Size-Padding-L);
    background: var(--Color-Background-Action);
    color: var(--Color-Text-Inverse);
    font-family: var(--mono-font);
    font-size: 10px;
    line-height: 16px;
    letter-spacing: var(--app-letter-spacing);
    text-transform: uppercase;
`;

const Footer = styled.footer`
    padding: var(--Size-Gap-XXL) 0;
    background: var(--Color-Background-Default);
    border-top: 1px solid var(--Color-Border-Default);
`;

const FooterInner = styled(Container)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
    color: var(--Color-Text-Subtle);
    font-size: var(--body-3-d);
    line-height: 24px;

    @media (min-width: 768px) {
        flex-direction: row;
    }
`;

const FooterBrand = styled.div`
    color: var(--Color-Text-Action);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    line-height: 16px;
    letter-spacing: var(--app-letter-spacing);
    text-transform: uppercase;
`;

const FooterLinks = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--Size-Gap-XXL);
`;

const LandingPage = ({ onSignIn, onRegister, onJoin }) => {
    const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <Page>
            <Nav>
                <NavInner>
                    <BrandLink type="button" onClick={goTop}>
                        <span className="material-symbols-outlined fill-icon">edit_document</span>
                        MeetAI
                    </BrandLink>
                    <NavLinks aria-label="Primary navigation">
                        <a href="#features">Features</a>
                        <a href="#how-it-works">Process</a>
                        <a href="#pricing">Pricing</a>
                    </NavLinks>
                    <NavActions>
                        <SignIn type="button" onClick={onSignIn}>
                            Sign In
                        </SignIn>
                        <PrimaryLink type="button" onClick={onRegister}>
                            Get Started
                        </PrimaryLink>
                    </NavActions>
                </NavInner>
            </Nav>

            <Main>
                <HeroSection>
                    <HeroCopy>
                        <Label>The editorial workspace for meetings</Label>
                        <HeroTitle>
                            Meeting Intelligence, <br />
                            <span>Refined.</span>
                        </HeroTitle>
                        <HeroText>
                            Transform ephemeral conversations into a structured, searchable memory. A
                            sophisticated AI utility designed for clarity, retaining the essence of your
                            meetings without the clutter.
                        </HeroText>
                        <HeroActions>
                            <HeroPrimary type="button" onClick={onRegister}>
                                Get Started
                            </HeroPrimary>
                            <SecondaryButton type="button" onClick={onJoin}>
                                Join Meeting
                            </SecondaryButton>
                        </HeroActions>
                    </HeroCopy>

                    <PreviewWrap>
                        <ProductPreview>
                            <TranscriptMock>
                                <PreviewHeader>
                                    <h3>Weekly Strategy Sync</h3>
                                    <span>10:00 AM - Oct 24</span>
                                </PreviewHeader>
                                <Timeline>
                                    <Turn $active>
                                        <TurnMeta>
                                            <strong>Sarah J.</strong>
                                            <span>10:04 AM</span>
                                        </TurnMeta>
                                        <TurnText>
                                            The Q4 metrics are showing a 15% uptick in engagement,
                                            specifically around the new editorial features. We need to
                                            capitalize on this momentum.
                                        </TurnText>
                                    </Turn>
                                    <Turn>
                                        <TurnMeta>
                                            <strong>David M.</strong>
                                            <span>10:06 AM</span>
                                        </TurnMeta>
                                        <TurnText>
                                            Agreed. I'll prioritize allocating more resources to the content
                                            team for the next sprint. We should also look at streamlining the
                                            publishing workflow.
                                        </TurnText>
                                    </Turn>
                                </Timeline>
                            </TranscriptMock>

                            <InsightsPanel>
                                <InsightsHeader>
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    <h4>AI Insights</h4>
                                </InsightsHeader>
                                <InsightStack>
                                    <div>
                                        <InsightTitle>Executive Summary</InsightTitle>
                                        <InsightText>
                                            The team recognized a significant 15% increase in user engagement
                                            driven by recent editorial features. Consensus reached to double
                                            down on this area for Q4.
                                        </InsightText>
                                    </div>
                                    <div>
                                        <InsightTitle>Action Items</InsightTitle>
                                        <ActionList>
                                            <ActionItem>
                                                <Checkbox />
                                                <span>Allocate resources to content team for next sprint (David M.)</span>
                                            </ActionItem>
                                            <ActionItem>
                                                <Checkbox />
                                                <span>Review and propose streamlined publishing workflow (Team)</span>
                                            </ActionItem>
                                        </ActionList>
                                    </div>
                                </InsightStack>
                            </InsightsPanel>
                        </ProductPreview>
                    </PreviewWrap>
                </HeroSection>

                <Rule>
                    <div />
                </Rule>

                <Section id="features">
                    <SectionIntro>
                        <Label>Capabilities</Label>
                        <h2>Designed for clarity, built for retention.</h2>
                    </SectionIntro>
                    <BentoGrid>
                        <FeatureCard $span={8} $paper $primary>
                            <div style={{ position: "relative", zIndex: 1, maxWidth: 660 }}>
                                <span className="material-symbols-outlined">record_voice_over</span>
                                <h3>Immaculate Transcription</h3>
                                <p>
                                    Our proprietary models capture every nuance, formatting conversation into
                                    readable, editorial-quality text. Speaker diarization and context-aware
                                    punctuation ensure absolute accuracy.
                                </p>
                            </div>
                            <DecorativeIcon>
                                <span className="material-symbols-outlined">description</span>
                            </DecorativeIcon>
                        </FeatureCard>
                        <FeatureCard $span={4}>
                            <span className="material-symbols-outlined">summarize</span>
                            <h3 style={{ fontSize: 20 }}>Intelligent Summaries</h3>
                            <p>Distill hour-long discussions into precise, actionable briefs tailored to your role.</p>
                        </FeatureCard>
                        <FeatureCard $span={4}>
                            <span className="material-symbols-outlined">forum</span>
                            <h3 style={{ fontSize: 20 }}>Interactive Chat</h3>
                            <p>
                                Query your meeting archives. Ask questions to past transcripts as if conversing
                                with a knowledgeable assistant.
                            </p>
                        </FeatureCard>
                        <FeatureCard $span={8} $paper $primary>
                            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                                <div style={{ flex: 1 }}>
                                    <span className="material-symbols-outlined">search</span>
                                    <h3>Universal Search</h3>
                                    <p>
                                        A robust indexing system that makes your entire organizational knowledge
                                        base instantly retrievable across all recorded sessions.
                                    </p>
                                </div>
                                <SearchMock>
                                    <SearchInputMock>
                                        <span
                                            className="material-symbols-outlined"
                                            style={{ fontSize: 14, color: "var(--Color-Text-Subtle)", marginRight: 8 }}
                                        >
                                            search
                                        </span>
                                        <SkeletonLine $width="64px" />
                                    </SearchInputMock>
                                    <SkeletonLine />
                                    <SkeletonLine $width="75%" />
                                </SearchMock>
                            </div>
                        </FeatureCard>
                    </BentoGrid>
                </Section>

                <Rule>
                    <div />
                </Rule>

                <ProcessSection id="how-it-works">
                    <SectionIntro style={{ marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
                        <Label>The process</Label>
                        <h2>From conversation to structured insight.</h2>
                    </SectionIntro>
                    <ProcessGrid>
                        <Step>
                            <StepNumber>01</StepNumber>
                            <h3>Connect</h3>
                            <p>
                                Integrate MeetAI with your calendar. The bot silently joins your scheduled
                                calls across Zoom, Meet, or Teams, observing without interruption.
                            </p>
                        </Step>
                        <Step $active>
                            <StepNumber $active>02</StepNumber>
                            <h3>Process</h3>
                            <p>
                                Audio is securely captured and instantly transcribed, applying context-aware
                                formatting to structure the raw dialogue into a readable script.
                            </p>
                        </Step>
                        <Step>
                            <StepNumber>03</StepNumber>
                            <h3>Insight</h3>
                            <p>
                                Within minutes of concluding, a polished executive summary, complete with
                                action items and key decisions, is delivered to your workspace.
                            </p>
                        </Step>
                    </ProcessGrid>
                </ProcessSection>

                <Rule>
                    <div />
                </Rule>

                <Section id="pricing">
                    <PricingHeader>
                        <div>
                            <Label>Membership</Label>
                            <SectionIntro style={{ marginBottom: 0 }}>
                                <h2>Transparent access.</h2>
                            </SectionIntro>
                        </div>
                        <InsightText>Billed annually.</InsightText>
                    </PricingHeader>
                    <PricingGrid>
                        <Plan $rightRule>
                            <h3>Standard Edition</h3>
                            <Price>
                                <strong>$15</strong>
                                <span>/mo</span>
                            </Price>
                            <PlanCopy>
                                Essential intelligence for individuals seeking to retain meeting context.
                            </PlanCopy>
                            <PlanList>
                                <PlanFeature>
                                    <span className="material-symbols-outlined">check</span>
                                    Unlimited transcriptions
                                </PlanFeature>
                                <PlanFeature>
                                    <span className="material-symbols-outlined">check</span>
                                    Basic AI Summaries
                                </PlanFeature>
                                <PlanFeature>
                                    <span className="material-symbols-outlined">check</span>
                                    30-day archive history
                                </PlanFeature>
                            </PlanList>
                            <PlanButton type="button" onClick={onRegister}>
                                Select Standard
                            </PlanButton>
                        </Plan>
                        <Plan $active>
                            <Recommended>Recommended</Recommended>
                            <h3>Editorial Workspace</h3>
                            <Price>
                                <strong>$29</strong>
                                <span>/mo</span>
                            </Price>
                            <PlanCopy>The complete suite with interactive chat and infinite retention.</PlanCopy>
                            <PlanList>
                                <PlanFeature>
                                    <span className="material-symbols-outlined">check</span>
                                    Everything in Standard
                                </PlanFeature>
                                <PlanFeature>
                                    <span className="material-symbols-outlined">check</span>
                                    Interactive Chat interface
                                </PlanFeature>
                                <PlanFeature>
                                    <span className="material-symbols-outlined">check</span>
                                    Customizable summary templates
                                </PlanFeature>
                                <PlanFeature>
                                    <span className="material-symbols-outlined">check</span>
                                    Infinite archive history
                                </PlanFeature>
                            </PlanList>
                            <PlanButton type="button" $primary onClick={onRegister}>
                                Select Workspace
                            </PlanButton>
                        </Plan>
                    </PricingGrid>
                </Section>
            </Main>

            <Footer>
                <FooterInner>
                    <FooterBrand>MeetAI</FooterBrand>
                    <FooterLinks>
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                        <a href="mailto:contact@meetai.studio">Contact Support</a>
                    </FooterLinks>
                    <span>© 2024 MeetAI Editorial. All rights reserved.</span>
                </FooterInner>
            </Footer>
        </Page>
    );
};

export default LandingPage;
