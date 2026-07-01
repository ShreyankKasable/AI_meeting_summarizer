import React, { useState } from "react";
import styled from "styled-components";
import Badge from "common/components/Badge";
import Input from "common/components/Input";
import { Body2, Body3 } from "common/global-styled-components";

const Section = styled.div`
    margin-bottom: var(--Size-Gap-XXXL);
`;

const SectionTitle = styled(Body2)`
    font-weight: var(--bold);
    margin-bottom: var(--Size-Gap-L);
`;

const ProviderCard = styled.div`
    padding: var(--Size-Padding-XL);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-L);
    margin-bottom: var(--Size-Gap-L);
`;

const ProviderHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--Size-Gap-L);
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--Size-Gap-L);

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

// One provider row: name, connected/not-configured badge, a model field
// (read-only display unless `modelField` is provided) and an API key input
// that saves on blur via `onSave(field, value)`.
const ProviderRow = ({ name, configured, model, modelField, apiKeyField = "api_key", onSave }) => {
    const [apiKey, setApiKey] = useState("");
    const [modelValue, setModelValue] = useState(model || "");

    return (
        <ProviderCard>
            <ProviderHeader>
                <Body2 style={{ fontWeight: "var(--bold)" }}>{name}</Body2>
                <Badge tone={configured ? "success" : "neutral"}>
                    {configured ? "Connected" : "Not Configured"}
                </Badge>
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
                    placeholder={configured ? "•••••••••••• (set)" : "Enter API key"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onBlur={() => apiKey && onSave(apiKeyField, apiKey)}
                />
            </Grid>
        </ProviderCard>
    );
};

// `status` is the GET /api/settings payload; `onSave(provider, field, value)`
// persists a single field.
const AiProvidersTab = ({ status, onSave }) => {
    if (!status) return null;
    const { transcription, chat } = status;

    return (
        <div>
            <Section>
                <SectionTitle>Speech-to-Text (Transcription)</SectionTitle>
                <Body3 style={{ marginBottom: "var(--Size-Gap-L)", color: "var(--Color-Text-Subtle)" }}>
                    Active provider: {transcription.active}
                </Body3>
                <ProviderRow
                    name="Deepgram"
                    configured={transcription.providers.deepgram.configured}
                    onSave={(field, value) => onSave("deepgram", field, value)}
                />
                <ProviderRow
                    name="AssemblyAI"
                    configured={transcription.providers.assemblyai.configured}
                    onSave={(field, value) => onSave("assemblyai", field, value)}
                />
                <ProviderRow
                    name="Hugging Face"
                    configured={transcription.providers.huggingface.configured}
                    model={transcription.providers.huggingface.model}
                    modelField="asr_model"
                    onSave={(field, value) => onSave("huggingface", field, value)}
                />
            </Section>

            <Section>
                <SectionTitle>LLM (Chat &amp; Summary)</SectionTitle>
                <ProviderRow
                    name="OpenAI"
                    configured={chat.providers.openai.configured}
                    onSave={(field, value) => onSave("openai", field, value)}
                />
                <ProviderRow
                    name="Anthropic"
                    configured={chat.providers.anthropic.configured}
                    onSave={(field, value) => onSave("anthropic", field, value)}
                />
                <ProviderRow
                    name="Euron"
                    configured={chat.providers.euron.configured}
                    model={chat.providers.euron.model}
                    modelField="model"
                    onSave={(field, value) => onSave("euron", field, value)}
                />
                <ProviderRow
                    name="Hugging Face"
                    configured={chat.providers.huggingface.configured}
                    model={chat.providers.huggingface.model}
                    modelField="chat_model"
                    onSave={(field, value) => onSave("huggingface", field, value)}
                />
            </Section>
        </div>
    );
};

export default AiProvidersTab;
