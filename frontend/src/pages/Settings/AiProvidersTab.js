import React, { useState } from "react";
import styled from "styled-components";
import { Bot, BrainCircuit, KeyRound, Mic2 } from "lucide-react";
import Badge from "common/components/Badge";
import Input from "common/components/Input";
import { H3, Body2, Body3 } from "common/global-styled-components";

const Wrapper = styled.div`
    display: grid;
    gap: var(--Size-Gap-XXXL);
`;

const Section = styled.section`
    display: grid;
    gap: var(--Size-Gap-XL);
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
    flex-wrap: wrap;
`;

const ProviderCard = styled.div`
    padding: var(--Size-Padding-XXL);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XL);
    box-shadow: var(--Color-Shadow-Card);
`;

const ProviderHeader = styled.div`
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--Size-Gap-L);
    margin-bottom: var(--Size-Gap-XL);

    @media (max-width: 560px) {
        grid-template-columns: auto 1fr;

        > span:last-child {
            grid-column: 1 / -1;
            width: fit-content;
        }
    }
`;

const ProviderIcon = styled.div`
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--Size-CornerRadius-M);
    background: ${({ tone }) => tone || "var(--Color-Background-Accent-Action)"};
    color: ${({ color }) => color || "var(--Color-Icon-Action)"};
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--Size-Gap-L);

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

const IconAddon = styled.span`
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--Color-Icon-Subtle);
`;

const ProviderRow = ({
    name,
    configured,
    model,
    modelField,
    apiKeyField = "api_key",
    onSave,
    icon: Icon = Bot,
    tone,
    color,
}) => {
    const [apiKey, setApiKey] = useState("");
    const [modelValue, setModelValue] = useState(model || "");

    return (
        <ProviderCard>
            <ProviderHeader>
                <ProviderIcon tone={tone} color={color}>
                    <Icon size={19} />
                </ProviderIcon>
                <div>
                    <Body2 style={{ fontWeight: "var(--bold)", color: "var(--Color-Text-Bold)" }}>{name}</Body2>
                    <Body3>{model || "API key based provider"}</Body3>
                </div>
                <Badge tone={configured ? "success" : "neutral"}>{configured ? "Connected" : "Not configured"}</Badge>
            </ProviderHeader>
            <Grid>
                {modelField && (
                    <Input
                        label="Model"
                        value={modelValue}
                        onChange={(e) => setModelValue(e.target.value)}
                        onBlur={() => modelValue !== model && onSave(modelField, modelValue)}
                    />
                )}
                <Input
                    label="API Key"
                    type="password"
                    placeholder={configured ? "Key is already set" : "Enter API key"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onBlur={() => apiKey && onSave(apiKeyField, apiKey)}
                    addon={
                        <IconAddon>
                            <KeyRound size={15} />
                        </IconAddon>
                    }
                />
            </Grid>
        </ProviderCard>
    );
};

const AiProvidersTab = ({ status, onSave }) => {
    if (!status) return null;
    const { transcription, chat } = status;

    return (
        <Wrapper>
            <Section>
                <SectionHeader>
                    <div>
                        <H3>Speech-to-Text</H3>
                        <Body3 style={{ marginTop: "var(--Size-Gap-S)" }}>Active provider: {transcription.active}</Body3>
                    </div>
                    <Badge tone="action">
                        <Mic2 size={13} />
                        Transcription
                    </Badge>
                </SectionHeader>
                <ProviderRow
                    name="Deepgram"
                    configured={transcription.providers.deepgram.configured}
                    onSave={(field, value) => onSave("deepgram", field, value)}
                    icon={Mic2}
                />
                <ProviderRow
                    name="AssemblyAI"
                    configured={transcription.providers.assemblyai.configured}
                    onSave={(field, value) => onSave("assemblyai", field, value)}
                    icon={Mic2}
                    tone="var(--Color-Background-Accent-Info)"
                    color="var(--Color-Icon-Info)"
                />
                <ProviderRow
                    name="Hugging Face"
                    configured={transcription.providers.huggingface.configured}
                    model={transcription.providers.huggingface.model}
                    modelField="asr_model"
                    onSave={(field, value) => onSave("huggingface", field, value)}
                    icon={BrainCircuit}
                    tone="var(--Color-Background-Accent-Warning)"
                    color="var(--Color-Icon-Warning)"
                />
            </Section>

            <Section>
                <SectionHeader>
                    <div>
                        <H3>LLM</H3>
                        <Body3 style={{ marginTop: "var(--Size-Gap-S)" }}>Chat and summary generation</Body3>
                    </div>
                    <Badge tone="info">
                        <BrainCircuit size={13} />
                        Intelligence
                    </Badge>
                </SectionHeader>
                <ProviderRow
                    name="OpenAI"
                    configured={chat.providers.openai.configured}
                    onSave={(field, value) => onSave("openai", field, value)}
                    icon={BrainCircuit}
                />
                <ProviderRow
                    name="Anthropic"
                    configured={chat.providers.anthropic.configured}
                    onSave={(field, value) => onSave("anthropic", field, value)}
                    icon={Bot}
                    tone="var(--Color-Background-Accent-Info)"
                    color="var(--Color-Icon-Info)"
                />
                <ProviderRow
                    name="Euron"
                    configured={chat.providers.euron.configured}
                    model={chat.providers.euron.model}
                    modelField="model"
                    onSave={(field, value) => onSave("euron", field, value)}
                    icon={Bot}
                    tone="var(--Color-Background-Accent-Warning)"
                    color="var(--Color-Icon-Warning)"
                />
                <ProviderRow
                    name="Hugging Face"
                    configured={chat.providers.huggingface.configured}
                    model={chat.providers.huggingface.model}
                    modelField="chat_model"
                    onSave={(field, value) => onSave("huggingface", field, value)}
                    icon={BrainCircuit}
                />
            </Section>
        </Wrapper>
    );
};

export default AiProvidersTab;
