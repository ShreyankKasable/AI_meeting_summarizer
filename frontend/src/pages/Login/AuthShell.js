import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { ArrowLeft, AudioWaveform, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import Button from "common/components/Button";
import Badge from "common/components/Badge";
import { H2, H3, Body2, Body3 } from "common/global-styled-components";

const Screen = styled.div`
    min-height: 100vh;
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(420px, 1.05fr);
    background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(246, 247, 249, 0.96)),
        var(--Color-Background-Subtle);

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

const FormSide = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--Size-Padding-4XL) var(--Size-Padding-XXL);

    @media (max-width: 640px) {
        padding: var(--Size-Padding-XXXL) var(--Size-Padding-XL);
    }
`;

const Panel = styled(motion.div)`
    width: min(100%, 440px);
`;

const Brand = styled.button`
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    padding: 0;
    margin-bottom: var(--Size-Gap-XXXL);
    border: none;
    background: transparent;
    color: var(--Color-Text-Bold);
    font-weight: var(--bold);
`;

const BrandMark = styled.span`
    width: 42px;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--Color-Text-Inverse);
    background: var(--Color-Background-Bold);
    border-radius: var(--Size-CornerRadius-M);
    box-shadow: 0 12px 26px rgba(17, 19, 22, 0.18);
`;

const HeaderText = styled.div`
    margin-bottom: var(--Size-Gap-XXL);
`;

const Subtitle = styled(Body2)`
    margin-top: var(--Size-Gap-M);
    color: var(--Color-Text-Subtle);
`;

const FormCard = styled.div`
    padding: var(--Size-Padding-XXL);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XXL);
    box-shadow: var(--Color-Shadow-Card);
`;

const VisualSide = styled.div`
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: var(--Size-Padding-4XL);
    background:
        linear-gradient(135deg, rgba(21, 22, 24, 0.98), rgba(38, 42, 47, 0.94)),
        var(--Color-Background-Bold);
    color: var(--Color-Text-Inverse);

    @media (max-width: 980px) {
        display: none;
    }
`;

const VisualContent = styled(motion.div)`
    position: relative;
    width: min(100%, 520px);
`;

const VisualCard = styled.div`
    padding: var(--Size-Padding-XXL);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: var(--Size-CornerRadius-XXL);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(18px);
`;

const WaveGrid = styled.div`
    height: 180px;
    display: flex;
    align-items: end;
    gap: 7px;
    margin: var(--Size-Gap-XXL) 0;
    padding: var(--Size-Padding-XL);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: var(--Size-CornerRadius-XL);
    background: rgba(255, 255, 255, 0.06);
`;

const Bar = styled.span`
    flex: 1;
    min-width: 6px;
    height: ${({ height }) => height}%;
    border-radius: var(--Size-CornerRadius-Full);
    background: ${({ active }) => (active ? "#54d1c4" : "rgba(255, 255, 255, 0.34)")};
`;

const TrustList = styled.div`
    display: grid;
    gap: var(--Size-Gap-L);
`;

const TrustItem = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    color: rgba(255, 255, 255, 0.74);
    font-size: var(--body-3-d);
`;

const BackButton = styled(Button)`
    margin-bottom: var(--Size-Gap-XXL);
`;

const AuthShell = ({ title, subtitle, eyebrow, children, onBackToLanding }) => {
    return (
        <Screen>
            <FormSide>
                <Panel initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
                    {onBackToLanding && (
                        <BackButton mode="ghost" size="small" onClick={onBackToLanding}>
                            <ArrowLeft size={15} />
                            Home
                        </BackButton>
                    )}
                    <Brand type="button" onClick={onBackToLanding}>
                        <BrandMark>
                            <AudioWaveform size={20} />
                        </BrandMark>
                        MeetAI
                    </Brand>
                    <HeaderText>
                        {eyebrow && <Badge tone="neutral">{eyebrow}</Badge>}
                        <H2 style={{ marginTop: eyebrow ? "var(--Size-Gap-L)" : 0 }}>{title}</H2>
                        <Subtitle>{subtitle}</Subtitle>
                    </HeaderText>
                    <FormCard>{children}</FormCard>
                </Panel>
            </FormSide>

            <VisualSide aria-hidden="true">
                <VisualContent initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }}>
                    <Badge tone="solidDark">
                        <Sparkles size={14} />
                        Meeting intelligence
                    </Badge>
                    <H3 style={{ color: "inherit", marginTop: "var(--Size-Gap-XL)" }}>
                        From transcript to decisions in one focused workspace.
                    </H3>
                    <VisualCard style={{ marginTop: "var(--Size-Gap-XXL)" }}>
                        <Badge tone="solidAction">
                            <ShieldCheck size={14} />
                            Secure host access
                        </Badge>
                        <WaveGrid>
                            {[34, 58, 46, 72, 88, 52, 66, 42, 78, 54, 36, 62].map((height, index) => (
                                <Bar key={height + index} height={height} active={index > 3 && index < 9} />
                            ))}
                        </WaveGrid>
                        <TrustList>
                            <TrustItem>
                                <CheckCircle2 size={16} />
                                Live transcription updates
                            </TrustItem>
                            <TrustItem>
                                <CheckCircle2 size={16} />
                                AI summaries and action items
                            </TrustItem>
                            <TrustItem>
                                <CheckCircle2 size={16} />
                                Share links for participants
                            </TrustItem>
                        </TrustList>
                    </VisualCard>
                    <Body3 style={{ color: "rgba(255, 255, 255, 0.62)", marginTop: "var(--Size-Gap-XL)" }}>
                        Built for teams that need durable meeting context without turning every call into admin work.
                    </Body3>
                </VisualContent>
            </VisualSide>
        </Screen>
    );
};

export default AuthShell;
