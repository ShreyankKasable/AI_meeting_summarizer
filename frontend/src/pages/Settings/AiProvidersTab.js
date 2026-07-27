import React from "react";
import styled from "styled-components";
import { BrainCircuit, ChevronDown, Mic2 } from "lucide-react";
import Badge from "common/components/Badge";
import { H3, Body3 } from "common/global-styled-components";

const Wrapper = styled.div`
    display: grid;
    gap: var(--Size-Gap-XL);
`;

const ConfigCard = styled.section`
    padding: var(--Size-Padding-XXL);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XL);
    box-shadow: var(--Color-Shadow-Card);
`;

const Header = styled.div`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
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

const IconBox = styled.div`
    width: 42px;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--Size-CornerRadius-M);
    background: ${({ $tone }) => $tone || "var(--Color-Background-Accent-Action)"};
    color: ${({ $color }) => $color || "var(--Color-Icon-Action)"};
`;

const ControlsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--Size-Gap-L);

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`;

const Field = styled.label`
    display: block;
    min-width: 0;
`;

const FieldLabel = styled.span`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-M);
    margin-bottom: var(--Size-Gap-S);
    font-size: var(--body-4-d);
    font-weight: var(--bold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    color: var(--Color-Text-Subtle);
`;

const SelectWrap = styled.div`
    position: relative;

    svg {
        position: absolute;
        right: 12px;
        top: 50%;
        color: var(--Color-Icon-Subtle);
        pointer-events: none;
        transform: translateY(-50%);
    }
`;

const Select = styled.select`
    width: 100%;
    min-height: 44px;
    padding: var(--Size-Padding-L) 44px var(--Size-Padding-L) var(--Size-Padding-XL);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Default);
    color: var(--Color-Text-Default);
    font-size: var(--body-2-d);
    font-family: var(--body-font);
    box-shadow: inset 0 1px 0 rgba(17, 19, 22, 0.02);
    appearance: none;
    outline: none;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast),
        background var(--transition-fast);

    &:hover:not(:disabled) {
        border-color: var(--Color-Border-Bold);
    }

    &:focus {
        border-color: var(--Color-Border-Action);
        box-shadow: var(--Color-Shadow-Focus);
        background: #ffffff;
    }

    &:disabled {
        background: var(--Color-Background-Disabled);
        color: var(--Color-Text-Subtlest);
    }
`;

const HelpText = styled(Body3)`
    margin-top: var(--Size-Gap-L);
`;

const FieldHelp = styled.span`
    display: block;
    margin-top: var(--Size-Gap-S);
    color: var(--Color-Text-Subtlest);
    font-size: var(--body-4-d);
    line-height: var(--line-height-140);
`;

const PROVIDER_LABELS = {
    whisper: "Whisper",
    deepgram: "Deepgram",
    assemblyai: "AssemblyAI",
    huggingface: "Hugging Face",
    openai: "OpenAI",
    anthropic: "Anthropic",
    euron: "Euron",
};

const engineCopy = {
    llm: {
        title: "LLM",
        description: "Controls chat, summaries, and action extraction.",
        badge: "Intelligence",
        icon: BrainCircuit,
        tone: "var(--Color-Background-Accent-Info)",
        color: "var(--Color-Icon-Info)",
        providerField: "llm_provider",
    },
    stt: {
        title: "STT",
        description: "Controls meeting audio transcription.",
        badge: "Transcription",
        icon: Mic2,
        tone: "var(--Color-Background-Accent-Action)",
        color: "var(--Color-Icon-Action)",
        providerField: "transcription_model",
    },
};

function getProviderEntries(providers = {}, active) {
    const entries = Object.entries(providers);
    const activeEntry = entries.find(([key]) => key === active);
    const configuredEntries = entries.filter(([, provider]) => provider.configured);

    if (activeEntry && !configuredEntries.some(([key]) => key === active)) {
        return [activeEntry, ...configuredEntries];
    }
    return configuredEntries.length ? configuredEntries : entries;
}

const EngineConfig = ({ type, activeProvider, providers, onSave }) => {
    const copy = engineCopy[type];
    const Icon = copy.icon;
    const providerEntries = getProviderEntries(providers, activeProvider);
    const selectedProvider = providers?.[activeProvider]
        ? activeProvider
        : providerEntries[0]?.[0] || "";
    const selectedConfig = providers?.[selectedProvider] || {};
    const modelOptions = selectedConfig.models?.length
        ? selectedConfig.models
        : selectedConfig.model
        ? [selectedConfig.model]
        : [];

    const handleProviderChange = (event) => {
        onSave("system", copy.providerField, event.target.value);
    };

    const handleModelChange = (event) => {
        if (!selectedConfig.model_field) return;
        onSave(selectedProvider, selectedConfig.model_field, event.target.value);
    };

    return (
        <ConfigCard>
            <Header>
                <IconBox $tone={copy.tone} $color={copy.color}>
                    <Icon size={19} />
                </IconBox>
                <div>
                    <H3>{copy.title}</H3>
                    <Body3 style={{ marginTop: "var(--Size-Gap-S)" }}>{copy.description}</Body3>
                </div>
                <Badge tone={selectedConfig.configured ? "success" : "neutral"}>
                    {selectedConfig.configured ? "Ready" : "Unavailable"}
                </Badge>
            </Header>

            <ControlsGrid>
                <Field>
                    <FieldLabel>Provider</FieldLabel>
                    <SelectWrap>
                        <Select value={selectedProvider} onChange={handleProviderChange}>
                            {providerEntries.map(([key, provider]) => (
                                <option key={key} value={key} disabled={!provider.configured}>
                                    {PROVIDER_LABELS[key] || key}
                                </option>
                            ))}
                        </Select>
                        <ChevronDown size={17} />
                    </SelectWrap>
                    <FieldHelp>
                        {selectedConfig.configured ? "Server key available" : "Server key missing"}
                    </FieldHelp>
                </Field>

                <Field>
                    <FieldLabel>Model</FieldLabel>
                    <SelectWrap>
                        <Select
                            value={selectedConfig.model || ""}
                            onChange={handleModelChange}
                            disabled={!selectedConfig.model_field || modelOptions.length === 0}
                        >
                            {modelOptions.length ? (
                                modelOptions.map((model) => (
                                    <option key={model} value={model}>
                                        {model}
                                    </option>
                                ))
                            ) : (
                                <option value="">Default model</option>
                            )}
                        </Select>
                        <ChevronDown size={17} />
                    </SelectWrap>
                    <FieldHelp>{selectedConfig.model || "Provider default"}</FieldHelp>
                </Field>
            </ControlsGrid>

            <HelpText>
                API keys are managed on the server. Users can only choose from configured providers
                and models.
            </HelpText>
        </ConfigCard>
    );
};

const AiProvidersTab = ({ status, onSave }) => {
    if (!status) return null;

    return (
        <Wrapper>
            <EngineConfig
                type="llm"
                activeProvider={status.chat.active}
                providers={status.chat.providers}
                onSave={onSave}
            />
            <EngineConfig
                type="stt"
                activeProvider={status.transcription.active}
                providers={status.transcription.providers}
                onSave={onSave}
            />
        </Wrapper>
    );
};

export default AiProvidersTab;
