import React from "react";
import styled, { css } from "styled-components";

const FieldWrapper = styled.label`
    display: block;
`;

const FieldLabel = styled.span`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-M);
    margin-bottom: var(--Size-Gap-S);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    font-weight: var(--medium);
    letter-spacing: var(--letter-spacing-widest);
    text-transform: uppercase;
    color: var(--Color-Text-Subtle);
`;

const Optional = styled.span`
    font-weight: var(--regular);
    letter-spacing: var(--app-letter-spacing);
    text-transform: var(--app-text-transform);
    color: var(--Color-Text-Subtlest);
`;

const InputWrapper = styled.div`
    position: relative;
`;

const fieldStyles = css`
    width: 100%;
    min-height: 44px;
    padding: var(--Size-Padding-L) ${({ $hasAddon }) => ($hasAddon ? "44px" : "var(--Size-Padding-XL)")}
        var(--Size-Padding-L) var(--Size-Padding-XL);
    font-family: var(--body-font);
    font-size: var(--body-2-d);
    letter-spacing: var(--app-letter-spacing);
    text-transform: var(--app-text-transform);
    color: var(--Color-Text-Default);
    background: var(--Color-Background-Subtle);
    border: 1px solid ${({ $hasError }) => ($hasError ? "var(--Color-Border-Accent-Danger)" : "var(--Color-Border-Default)")};
    border-radius: var(--Size-CornerRadius-M);
    transition:
        border-color var(--transition-fast),
        box-shadow var(--transition-fast),
        background var(--transition-fast);
    outline: none;
    ${({ $mono }) =>
        $mono &&
        "font-family: var(--mono-font); letter-spacing: var(--letter-spacing-wide); text-transform: uppercase;"};

    &::placeholder {
        color: var(--Color-Text-Subtlest);
    }

    &:hover:not(:disabled) {
        border-color: var(--Color-Border-Bold);
        background: var(--Color-Background-Default);
    }

    &:focus {
        border-color: var(--Color-Border-Action);
        box-shadow: var(--Color-Shadow-Focus);
        background: var(--Color-Background-Default);
    }

    &:disabled {
        background: var(--Color-Background-Disabled);
        color: var(--Color-Text-Subtlest);
    }
`;

const TextInput = styled.input`
    ${fieldStyles}
`;

const Addon = styled.div`
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
`;

const HelpText = styled.span`
    display: block;
    margin-top: var(--Size-Gap-S);
    font-size: var(--body-4-d);
    line-height: var(--line-height-140);
    color: ${({ error }) => (error ? "var(--Color-Text-Danger)" : "var(--Color-Text-Subtlest)")};
`;

const Input = ({ label, optional, addon, helpText, error, mono, ...props }) => {
    return (
        <FieldWrapper>
            {label && (
                <FieldLabel>
                    <span>{label}</span>
                    {optional && <Optional>Optional</Optional>}
                </FieldLabel>
            )}
            <InputWrapper>
                <TextInput $hasAddon={Boolean(addon)} $hasError={Boolean(error)} $mono={Boolean(mono)} {...props} />
                {addon && <Addon>{addon}</Addon>}
            </InputWrapper>
            {(error || helpText) && <HelpText error={Boolean(error)}>{error || helpText}</HelpText>}
        </FieldWrapper>
    );
};

export default Input;
