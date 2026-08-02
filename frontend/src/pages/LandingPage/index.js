import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
    ArrowRight,
    AudioWaveform,
    BrainCircuit,
    CheckCircle2,
    ChevronDown,
    Clock3,
    LockKeyhole,
    Menu,
    Share2,
    Sparkles,
    X,
    Zap,
} from "lucide-react";
import Button from "common/components/Button";
import Badge from "common/components/Badge";
import { H1, H2, H3, Body1, Body2, Body3 } from "common/global-styled-components";

const Page = styled.div`
    min-height: 100vh;
    color: var(--Color-Text-Default);
    background: var(--Color-Background-Default);
`;

const Nav = styled.header`
    position: sticky;
    top: 0;
    z-index: 30;
    border-bottom: 1px solid rgba(231, 235, 240, 0.86);
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(18px);
`;

const NavInner = styled.div`
    width: min(1180px, calc(100% - 32px));
    min-height: 68px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
`;

const Brand = styled.button`
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--Color-Text-Bold);
    font-weight: var(--bold);
    font-size: var(--body-2-d);
`;

const BrandMark = styled.span`
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Bold);
    color: var(--Color-Text-Inverse);
    box-shadow: 0 10px 24px rgba(17, 19, 22, 0.16);
`;

const DesktopLinks = styled.nav`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-XXL);
    color: var(--Color-Text-Subtle);
    font-size: var(--body-3-d);
    font-weight: var(--medium);

    a:hover {
        color: var(--Color-Text-Bold);
    }

    @media (max-width: 900px) {
        display: none;
    }
`;

const DesktopActions = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);

    @media (max-width: 900px) {
        display: none;
    }
`;

const MobileToggle = styled.button`
    display: none;
    width: 38px;
    height: 38px;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Default);
    color: var(--Color-Icon-Default);

    @media (max-width: 900px) {
        display: inline-flex;
    }
`;

const MobileMenu = styled(motion.div)`
    display: none;

    @media (max-width: 900px) {
        display: grid;
        gap: var(--Size-Gap-M);
        padding: 0 var(--Size-Padding-XL) var(--Size-Padding-XL);
        background: rgba(255, 255, 255, 0.96);
        border-bottom: 1px solid var(--Color-Border-Subtle);

        a,
        button {
            justify-content: flex-start;
        }

        a {
            padding: var(--Size-Padding-M) 0;
            color: var(--Color-Text-Subtle);
            font-weight: var(--semi-bold);
        }
    }
`;

const Hero = styled.section`
    position: relative;
    min-height: 78vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    padding: var(--Size-Padding-4XL) 0;
    border-bottom: 1px solid var(--Color-Border-Subtle);
    background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.86) 0%, rgba(255, 255, 255, 0.68) 52%, #f6f7f9 100%),
        radial-gradient(circle at 50% 120%, rgba(15, 118, 110, 0.16), transparent 44%);

    @media (max-width: 760px) {
        min-height: auto;
        padding: var(--Size-Padding-XXXL) 0 var(--Size-Padding-4XL);
    }
`;

const HeroInner = styled.div`
    position: relative;
    z-index: 1;
    width: min(1180px, calc(100% - 32px));
    margin: 0 auto;
    display: grid;
    gap: var(--Size-Gap-XXXL);
`;

const HeroCopy = styled(motion.div)`
    max-width: 760px;
    margin: 0 auto;
    text-align: center;
`;

const HeroBadge = styled(Badge)`
    margin-bottom: var(--Size-Gap-XL);
`;

const HeroDescription = styled(Body1)`
    max-width: 680px;
    margin: var(--Size-Gap-XL) auto 0;
    color: var(--Color-Text-Subtle);
`;

const HeroActions = styled.div`
    display: flex;
    justify-content: center;
    gap: var(--Size-Gap-M);
    flex-wrap: wrap;
    margin-top: var(--Size-Gap-XXL);
`;

const ProductFrame = styled(motion.div)`
    width: min(1040px, 100%);
    margin: 0 auto;
    border: 1px solid rgba(255, 255, 255, 0.84);
    border-radius: var(--Size-CornerRadius-XXL);
    background: rgba(255, 255, 255, 0.82);
    box-shadow: 0 34px 90px rgba(17, 19, 22, 0.16);
    overflow: hidden;
`;

const ProductChrome = styled.div`
    height: 42px;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 0 var(--Size-Padding-XL);
    border-bottom: 1px solid var(--Color-Border-Subtle);
    background: #fbfcfd;
`;

const Dot = styled.span`
    width: 10px;
    height: 10px;
    border-radius: var(--Size-CornerRadius-Full);
    background: ${({ color }) => color};
`;

const ProductBody = styled.div`
    display: grid;
    grid-template-columns: 1.7fr 1fr;
    gap: var(--Size-Gap-XL);
    padding: var(--Size-Padding-XXL);
    background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.74), rgba(246, 247, 249, 0.98)),
        #f8fafc;

    @media (max-width: 760px) {
        grid-template-columns: 1fr;
        padding: var(--Size-Padding-XL);
    }
`;

const TranscriptMock = styled.div`
    min-height: 340px;
    padding: var(--Size-Padding-XXL);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XL);
    background: var(--Color-Background-Default);
`;

const MockHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
    margin-bottom: var(--Size-Gap-XXL);
`;

const MockLine = styled.div`
    width: ${({ width }) => width || "100%"};
    height: ${({ height }) => height || "12px"};
    border-radius: var(--Size-CornerRadius-Full);
    background: ${({ accent }) => (accent ? "var(--Color-Background-Action)" : "#e7ebf0")};
`;

const MockTurn = styled.div`
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: var(--Size-Gap-L);
    align-items: flex-start;

    & + & {
        margin-top: var(--Size-Gap-XL);
    }
`;

const MockAvatar = styled.div`
    width: 32px;
    height: 32px;
    border-radius: var(--Size-CornerRadius-Full);
    background: ${({ tone }) => tone || "var(--Color-Background-Action)"};
`;

const InsightPanel = styled.div`
    display: grid;
    gap: var(--Size-Gap-XL);
`;

const MiniCard = styled.div`
    padding: var(--Size-Padding-XL);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XL);
    background: var(--Color-Background-Default);
`;

const Section = styled.section`
    padding: var(--Size-Padding-5XL, 72px) 0;
`;

const SectionInner = styled.div`
    width: min(1180px, calc(100% - 32px));
    margin: 0 auto;
`;

const SectionHeader = styled.div`
    max-width: 660px;
    margin-bottom: var(--Size-Gap-XXXL);
`;

const CardsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--Size-Gap-XL);

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const FeatureCard = styled(motion.div)`
    padding: var(--Size-Padding-XXL);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XL);
    background: var(--Color-Background-Default);
    box-shadow: var(--Color-Shadow-Card);
`;

const IconBox = styled.div`
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--Size-Gap-XL);
    border-radius: var(--Size-CornerRadius-M);
    background: ${({ tone }) => tone || "var(--Color-Background-Accent-Action)"};
    color: ${({ color }) => color || "var(--Color-Icon-Action)"};
`;

const Steps = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--Size-Gap-XL);

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const Step = styled.div`
    padding: var(--Size-Padding-XXL);
    border-top: 1px solid var(--Color-Border-Bold);
`;

const StepNumber = styled.div`
    margin-bottom: var(--Size-Gap-XL);
    font-family: var(--mono-font);
    font-weight: var(--bold);
    color: var(--Color-Text-Action);
`;

const Testimonial = styled.div`
    padding: var(--Size-Padding-XXL);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XL);
    background: #fbfcfd;
`;

const FaqList = styled.div`
    display: grid;
    gap: var(--Size-Gap-M);
`;

const FaqItem = styled.details`
    padding: var(--Size-Padding-XL);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XL);
    background: var(--Color-Background-Default);

    summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--Size-Gap-XL);
        cursor: pointer;
        font-weight: var(--semi-bold);
        color: var(--Color-Text-Bold);
        list-style: none;
    }

    summary::-webkit-details-marker {
        display: none;
    }

    &[open] svg {
        transform: rotate(180deg);
    }

    svg {
        color: var(--Color-Icon-Subtle);
        transition: transform var(--transition-fast);
    }
`;

const Footer = styled.footer`
    border-top: 1px solid var(--Color-Border-Subtle);
    padding: var(--Size-Padding-XXXL) 0;
    background: #fbfcfd;
`;

const FooterInner = styled.div`
    width: min(1180px, calc(100% - 32px));
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
    flex-wrap: wrap;
    color: var(--Color-Text-Subtle);
    font-size: var(--body-3-d);
`;

const cardMotion = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.36, ease: "easeOut" },
};

const features = [
    {
        icon: AudioWaveform,
        title: "Live capture",
        copy: "Record conversations and stream transcript updates while the meeting is still moving.",
        tone: "var(--Color-Background-Accent-Action)",
        color: "var(--Color-Icon-Action)",
    },
    {
        icon: BrainCircuit,
        title: "Meeting intelligence",
        copy: "Turn raw transcript data into summaries, speaker turns, action items, and searchable context.",
        tone: "var(--Color-Background-Accent-Info)",
        color: "var(--Color-Icon-Info)",
    },
    {
        icon: Share2,
        title: "Controlled sharing",
        copy: "Create expiring links for participants and keep the host workspace private.",
        tone: "var(--Color-Background-Accent-Warning)",
        color: "var(--Color-Icon-Warning)",
    },
];

const faqs = [
    ["Can participants view notes without an account?", "No. Participants sign in first, then use the meeting code shared by the host."],
    ["Does the app support AI chat?", "Yes. Hosts and invited participants can ask questions against the meeting content."],
    ["Can I export to Notion?", "Yes. The settings area includes Notion configuration and processed meetings can be exported."],
    ["Is pricing available?", "Pricing is a placeholder in this build and can be connected when plans are finalized."],
];

const LandingPage = ({ onSignIn, onRegister, onJoin }) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const closeMobile = () => setMobileOpen(false);

    return (
        <Page>
            <Nav>
                <NavInner>
                    <Brand type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        <BrandMark>
                            <AudioWaveform size={18} />
                        </BrandMark>
                        MeetAI
                    </Brand>
                    <DesktopLinks aria-label="Primary navigation">
                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#about">About</a>
                        <a href="mailto:contact@meetai.studio">Contact</a>
                    </DesktopLinks>
                    <DesktopActions>
                        <Button mode="ghost" onClick={onSignIn}>
                            Sign In
                        </Button>
                        <Button onClick={onRegister}>
                            Get Started
                            <ArrowRight size={16} />
                        </Button>
                    </DesktopActions>
                    <MobileToggle
                        type="button"
                        onClick={() => setMobileOpen((value) => !value)}
                        aria-label="Toggle navigation"
                    >
                        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                    </MobileToggle>
                </NavInner>
                {mobileOpen && (
                    <MobileMenu initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                        <a href="#features" onClick={closeMobile}>
                            Features
                        </a>
                        <a href="#pricing" onClick={closeMobile}>
                            Pricing
                        </a>
                        <a href="#about" onClick={closeMobile}>
                            About
                        </a>
                        <a href="mailto:contact@meetai.studio" onClick={closeMobile}>
                            Contact
                        </a>
                        <Button mode="secondary" onClick={onSignIn}>
                            Sign In
                        </Button>
                        <Button onClick={onRegister}>
                            Get Started
                        </Button>
                    </MobileMenu>
                )}
            </Nav>

            <Hero>
                <HeroInner>
                    <HeroCopy initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                        <HeroBadge tone="neutral">
                            <Sparkles size={14} />
                            AI meeting workspace
                        </HeroBadge>
                        <H1>MeetAI</H1>
                        <HeroDescription>
                            A polished workspace for recording meetings, generating summaries, tracking action items,
                            and sharing searchable notes with the people who need them.
                        </HeroDescription>
                        <HeroActions>
                            <Button size="large" onClick={onRegister}>
                                Register / Get Started
                                <ArrowRight size={18} />
                            </Button>
                            <Button size="large" mode="secondary" onClick={onJoin}>
                                Join Meeting
                            </Button>
                        </HeroActions>
                    </HeroCopy>

                    <ProductFrame initial={{ opacity: 0, y: 28, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.12, duration: 0.5 }}>
                        <ProductChrome>
                            <Dot color="#ef6a5b" />
                            <Dot color="#f4bd4f" />
                            <Dot color="#5fc46b" />
                        </ProductChrome>
                        <ProductBody>
                            <TranscriptMock>
                                <MockHeader>
                                    <div>
                                        <MockLine width="132px" height="18px" accent />
                                        <MockLine width="220px" height="10px" style={{ marginTop: 10 }} />
                                    </div>
                                    <Badge tone="solidAction">Live</Badge>
                                </MockHeader>
                                {[0, 1, 2, 3].map((item) => (
                                    <MockTurn key={item}>
                                        <MockAvatar tone={item % 2 ? "#315f99" : "var(--Color-Background-Action)"} />
                                        <div>
                                            <MockLine width={item % 2 ? "118px" : "92px"} height="12px" accent={item === 0} />
                                            <MockLine width="94%" style={{ marginTop: 12 }} />
                                            <MockLine width={item % 2 ? "72%" : "84%"} style={{ marginTop: 8 }} />
                                        </div>
                                    </MockTurn>
                                ))}
                            </TranscriptMock>
                            <InsightPanel>
                                <MiniCard>
                                    <Badge tone="success">
                                        <CheckCircle2 size={13} />
                                        Summary ready
                                    </Badge>
                                    <H3 style={{ marginTop: "var(--Size-Gap-XL)" }}>Decision trail</H3>
                                    <Body3 style={{ marginTop: "var(--Size-Gap-M)" }}>
                                        Key topics, owners, and follow-ups stay connected to the source transcript.
                                    </Body3>
                                </MiniCard>
                                <MiniCard>
                                    <MockLine width="72px" height="12px" accent />
                                    <MockLine width="100%" style={{ marginTop: 14 }} />
                                    <MockLine width="82%" style={{ marginTop: 8 }} />
                                    <MockLine width="66%" style={{ marginTop: 8 }} />
                                </MiniCard>
                                <MiniCard>
                                    <Body3 style={{ fontWeight: "var(--semi-bold)", color: "var(--Color-Text-Bold)" }}>
                                        6 action items
                                    </Body3>
                                    <Body3 style={{ marginTop: "var(--Size-Gap-S)" }}>3 assigned today</Body3>
                                </MiniCard>
                            </InsightPanel>
                        </ProductBody>
                    </ProductFrame>
                </HeroInner>
            </Hero>

            <Section id="features">
                <SectionInner>
                    <SectionHeader>
                        <H2>Built for focused meeting workflows</H2>
                        <Body2 style={{ color: "var(--Color-Text-Subtle)", marginTop: "var(--Size-Gap-L)" }}>
                            Capture the conversation, understand the outcome, and distribute the right context from one
                            calm workspace.
                        </Body2>
                    </SectionHeader>
                    <CardsGrid>
                        {features.map(({ icon: Icon, title, copy, tone, color }) => (
                            <FeatureCard key={title} {...cardMotion}>
                                <IconBox tone={tone} color={color}>
                                    <Icon size={19} />
                                </IconBox>
                                <H3>{title}</H3>
                                <Body3 style={{ marginTop: "var(--Size-Gap-M)" }}>{copy}</Body3>
                            </FeatureCard>
                        ))}
                    </CardsGrid>
                </SectionInner>
            </Section>

            <Section id="about" style={{ background: "var(--Color-Background-Subtle)" }}>
                <SectionInner>
                    <CardsGrid>
                        <FeatureCard {...cardMotion}>
                            <IconBox>
                                <Clock3 size={19} />
                            </IconBox>
                            <H3>Reduce manual note work</H3>
                            <Body3 style={{ marginTop: "var(--Size-Gap-M)" }}>
                                Summaries and transcript search make follow-up work faster after every call.
                            </Body3>
                        </FeatureCard>
                        <FeatureCard {...cardMotion}>
                            <IconBox tone="var(--Color-Background-Accent-Warning)" color="var(--Color-Icon-Warning)">
                                <Zap size={19} />
                            </IconBox>
                            <H3>Move from talk to tasks</H3>
                            <Body3 style={{ marginTop: "var(--Size-Gap-M)" }}>
                                Action items stay visible with assignees, priority, due dates, and completion state.
                            </Body3>
                        </FeatureCard>
                        <FeatureCard {...cardMotion}>
                            <IconBox tone="var(--Color-Background-Accent-Info)" color="var(--Color-Icon-Info)">
                                <LockKeyhole size={19} />
                            </IconBox>
                            <H3>Share with control</H3>
                            <Body3 style={{ marginTop: "var(--Size-Gap-M)" }}>
                                Share links can be regenerated when access should change.
                            </Body3>
                        </FeatureCard>
                    </CardsGrid>
                </SectionInner>
            </Section>

            <Section>
                <SectionInner>
                    <SectionHeader>
                        <H2>How it works</H2>
                    </SectionHeader>
                    <Steps>
                        <Step>
                            <StepNumber>01</StepNumber>
                            <H3>Start a meeting</H3>
                            <Body3 style={{ marginTop: "var(--Size-Gap-M)" }}>Create a session and capture audio from the host workspace.</Body3>
                        </Step>
                        <Step>
                            <StepNumber>02</StepNumber>
                            <H3>Process the recording</H3>
                            <Body3 style={{ marginTop: "var(--Size-Gap-M)" }}>Transcript, summary, action items, and chat context are generated.</Body3>
                        </Step>
                        <Step>
                            <StepNumber>03</StepNumber>
                            <H3>Share the outcome</H3>
                            <Body3 style={{ marginTop: "var(--Size-Gap-M)" }}>Invite participants into a read-only meeting page or export to Notion.</Body3>
                        </Step>
                    </Steps>
                </SectionInner>
            </Section>

            <Section id="pricing" style={{ background: "var(--Color-Background-Subtle)" }}>
                <SectionInner>
                    <SectionHeader>
                        <H2>Pricing placeholder</H2>
                        <Body2 style={{ color: "var(--Color-Text-Subtle)", marginTop: "var(--Size-Gap-L)" }}>
                            Plan packaging can be added when billing is ready.
                        </Body2>
                    </SectionHeader>
                    <Testimonial>
                        <Body2 style={{ color: "var(--Color-Text-Bold)", fontWeight: "var(--semi-bold)" }}>
                            "MeetAI gives our team one place to find decisions, owners, and context after every customer
                            call."
                        </Body2>
                        <Body3 style={{ marginTop: "var(--Size-Gap-L)" }}>Customer testimonial placeholder</Body3>
                    </Testimonial>
                </SectionInner>
            </Section>

            <Section>
                <SectionInner>
                    <SectionHeader>
                        <H2>FAQ</H2>
                    </SectionHeader>
                    <FaqList>
                        {faqs.map(([question, answer]) => (
                            <FaqItem key={question}>
                                <summary>
                                    {question}
                                    <ChevronDown size={18} />
                                </summary>
                                <Body3 style={{ marginTop: "var(--Size-Gap-L)" }}>{answer}</Body3>
                            </FaqItem>
                        ))}
                    </FaqList>
                </SectionInner>
            </Section>

            <Footer>
                <FooterInner>
                    <Brand type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        <BrandMark>
                            <AudioWaveform size={18} />
                        </BrandMark>
                        MeetAI
                    </Brand>
                    <span>AI meeting summarizer for modern teams.</span>
                    <span>contact@meetai.studio</span>
                </FooterInner>
            </Footer>
        </Page>
    );
};

export default LandingPage;
