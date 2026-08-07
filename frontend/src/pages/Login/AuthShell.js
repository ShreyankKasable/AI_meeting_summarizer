import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Breakpoints } from "GlobalStyle";

const Screen = styled.div`
    min-height: 100vh;
    position: relative;
    background: var(--Auth-Color-Background);
    color: var(--Auth-Color-Text);
    overflow: hidden;

    &::after {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 5;
        pointer-events: none;
        mix-blend-mode: multiply;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
    }
`;

const Layout = styled.div`
    min-height: 100vh;
    position: relative;
    z-index: 1;
    display: flex;
    width: 100%;

    @media (max-width: ${Breakpoints.authSplit}px) {
        display: block;
    }
`;

const AuthCanvas = styled.main`
    position: relative;
    flex: 1 1 var(--Auth-Form-Basis);
    max-width: var(--Auth-Form-Basis);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: var(--Auth-Canvas-Padding-Y) var(--Auth-Canvas-Padding-X);

    @media (max-width: ${Breakpoints.authSplit}px) {
        max-width: none;
        min-height: 100vh;
    }

    @media (max-width: ${Breakpoints.mobile}px) {
        padding: var(--Auth-Canvas-Padding-Y) var(--Auth-Canvas-Padding-X-Mobile)
            var(--Auth-Canvas-Padding-Bottom-Mobile);
    }
`;

const BackLink = styled.button`
    position: absolute;
    top: var(--Auth-Back-Offset);
    left: var(--Auth-Canvas-Padding-X);
    display: inline-flex;
    align-items: center;
    gap: var(--Auth-Icon-Gap);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--Auth-Color-Text-Secondary);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    line-height: var(--Auth-Label-Line-Height);
    font-weight: var(--medium);
    letter-spacing: var(--Auth-Label-Tracking);
    text-transform: uppercase;
    transition: color var(--Auth-Transition);

    svg {
        width: var(--Auth-Back-Icon-Size);
        height: var(--Auth-Back-Icon-Size);
        flex-shrink: 0;
        transition: transform var(--Auth-Transition);
    }

    &:hover {
        color: var(--Auth-Color-Primary);

        svg {
            transform: translateX(var(--Auth-Back-Nudge));
        }
    }

    @media (max-width: ${Breakpoints.mobile}px) {
        left: var(--Auth-Canvas-Padding-X-Mobile);
    }
`;

const Panel = styled(motion.div)`
    width: min(100%, var(--Auth-Panel-Max-Width));
    margin: 0 auto;
`;

const Header = styled.header`
    margin-bottom: var(--Auth-Header-Gap);

    @media (max-width: ${Breakpoints.authSplit}px) {
        text-align: center;
    }
`;

const Brand = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--Auth-Brand-Gap);
    margin: 0 0 var(--Auth-Brand-Bottom-Gap);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--Auth-Color-Primary);

    svg {
        width: var(--Auth-Brand-Icon-Size);
        height: var(--Auth-Brand-Icon-Size);
        flex-shrink: 0;
        stroke-width: var(--Auth-Icon-Stroke);
    }

    @media (max-width: ${Breakpoints.authSplit}px) {
        justify-content: center;
    }
`;

const BrandText = styled.h1`
    margin: 0;
    font-family: var(--heading-font);
    font-size: var(--Auth-Brand-Font-Size);
    line-height: var(--Auth-Brand-Line-Height);
    font-weight: var(--semi-bold);
    letter-spacing: 0;
`;

const Title = styled.h2`
    margin: 0 0 var(--Auth-Field-Gap);
    color: var(--Auth-Color-Text);
    font-family: var(--heading-font);
    font-size: var(--Auth-Title-Font-Size);
    line-height: var(--Auth-Title-Line-Height);
    font-weight: var(--semi-bold);
    letter-spacing: 0;
`;

const Subtitle = styled.p`
    margin: 0;
    color: var(--Auth-Color-Text-Secondary);
    font-family: var(--body-font);
    font-size: var(--Auth-Subtitle-Font-Size);
    line-height: var(--Auth-Subtitle-Line-Height);
    font-weight: var(--regular);
`;

const AuthCard = styled.div`
    position: relative;
    padding: var(--Auth-Card-Padding);
    background: var(--Auth-Color-Surface);
    border: var(--Auth-Border-Width) solid var(--Auth-Color-Border);
    border-radius: var(--Auth-Card-Radius);
    box-shadow: var(--Auth-Shadow-Card);

    &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: var(--Auth-Border-Width);
        background: var(--Auth-Color-Border-Accent);
    }

    @media (max-width: ${Breakpoints.mobileXS}px) {
        padding: var(--Auth-Card-Padding-Mobile);
    }
`;

const FooterSlot = styled.div`
    margin-top: var(--Auth-Footer-Top-Gap);
    text-align: center;
`;

const VisualPanel = styled.aside`
    position: relative;
    display: block;
    flex: 1 1 var(--Auth-Visual-Basis);
    min-height: 100vh;
    overflow: hidden;
    border-left: var(--Auth-Border-Width) solid var(--Auth-Color-Border);
    background: var(--Auth-Color-Surface);

    @media (max-width: ${Breakpoints.authSplit}px) {
        display: none;
    }
`;

const VisualImage = styled.div`
    position: absolute;
    inset: 0;
    background-image: var(--Auth-Visual-Image);
    background-size: cover;
    background-position: center;
`;

const VisualOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: linear-gradient(
        90deg,
        var(--Auth-Color-Visual-Overlay-Start),
        var(--Auth-Color-Visual-Overlay-End)
    );
    mix-blend-mode: overlay;
`;

const VisualCopy = styled.div`
    position: absolute;
    left: var(--Auth-Visual-Copy-Inset);
    bottom: var(--Auth-Visual-Copy-Inset);
    max-width: var(--Auth-Visual-Copy-Max-Width);
    padding: var(--Auth-Visual-Copy-Padding-Y) 0 var(--Auth-Visual-Copy-Padding-Y)
        var(--Auth-Visual-Copy-Padding-X);
    border-left: var(--Auth-Accent-Border-Width) solid var(--Auth-Color-Primary);
`;

const VisualText = styled.p`
    margin: 0;
    color: var(--Auth-Color-Primary-Strong);
    font-family: var(--heading-font);
    font-size: var(--Auth-Visual-Copy-Font-Size);
    line-height: var(--Auth-Visual-Copy-Line-Height);
    font-weight: var(--semi-bold);
`;

const AuthShell = ({ title, subtitle, children, footer, onBackToLanding }) => {
    return (
        <Screen>
            <Layout>
                <AuthCanvas>
                    {onBackToLanding && (
                        <BackLink type="button" onClick={onBackToLanding}>
                            <ArrowLeft aria-hidden="true" />
                            Back to landing
                        </BackLink>
                    )}

                    <Panel initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                        <Header>
                            <Brand type="button" onClick={onBackToLanding} aria-label="MeetAI home">
                                <Sparkles aria-hidden="true" />
                                <BrandText>MeetAI</BrandText>
                            </Brand>
                            <Title>{title}</Title>
                            <Subtitle>{subtitle}</Subtitle>
                        </Header>

                        <AuthCard>{children}</AuthCard>
                        {footer && <FooterSlot>{footer}</FooterSlot>}
                    </Panel>
                </AuthCanvas>

                <VisualPanel aria-hidden="true">
                    <VisualImage />
                    <VisualOverlay />
                    <VisualCopy>
                        <VisualText>Transform conversations into structured, enduring knowledge.</VisualText>
                    </VisualCopy>
                </VisualPanel>
            </Layout>
        </Screen>
    );
};

export default AuthShell;
