import React from "react";
import styled from "styled-components";

const FieldWrapper = styled.label`
    display: block;
`;

const FieldLabel = styled.span`
    display: block;
    margin-bottom: var(--Size-Gap-S);
    font-size: var(--body-4-d);
    font-weight: var(--bold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    color: var(--Color-Text-Subtle);
`;

const Optional = styled.span`
    font-weight: var(--regular);
    text-transform: none;
    letter-spacing: 0;
    color: var(--Color-Text-Subtlest);
`;

const InputWrapper = styled.div`
    position: relative;
`;

const TextInput = styled.input`
    width: 100%;
    padding: var(--Size-Padding-L) var(--Size-Padding-XL);
    font-size: var(--body-2-d);
    color: var(--Color-Text-Default);
    background: var(--Color-Background-Subtle);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-L);
    transition: all 0.2s ease;
    outline: none;
    ${({ mono }) =>
        mono &&
        "font-family: var(--mono-font); letter-spacing: var(--letter-spacing-wide); text-transform: uppercase;"};

    &::placeholder {
        color: var(--Color-Text-Subtlest);
    }

    &:focus {
        border-color: var(--Color-Border-Action);
        background: var(--Color-Background-Default);
    }
`;

// Labelled text field. Pass `addon` to render an element (e.g. an icon button)
// absolutely positioned inside the input.
const Input = ({ label, optional, addon, ...props }) => {
    return (
        <FieldWrapper>
            {label && (
                <FieldLabel>
                    {label} {optional && <Optional>(Optional)</Optional>}
                </FieldLabel>
            )}
            <InputWrapper>
                <TextInput {...props} />
                {addon}
            </InputWrapper>
        </FieldWrapper>
    );
};

export default Input;
