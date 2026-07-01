import React, { useEffect } from "react";
import styled from "styled-components";
import { X } from "lucide-react";
import { H3 } from "common/global-styled-components";

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--Size-Padding-XL);
    background: var(--Color-Background-Scrim);
    animation: meetai-fade-in 0.2s ease;
`;

const Content = styled.div`
    position: relative;
    width: 100%;
    max-width: ${({ width }) => width || "440px"};
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--Color-Background-Default);
    border-radius: var(--Size-CornerRadius-XXL);
    box-shadow: var(--Color-Shadow-2);
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-L);
    padding: var(--Size-Padding-XXL) var(--Size-Padding-XXL) 0;
`;

const Body = styled.div`
    padding: ${({ bare }) => (bare ? "0" : "var(--Size-Padding-XXL)")};
    overflow-y: auto;
`;

const CloseButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--Size-Padding-S);
    border: none;
    border-radius: var(--Size-CornerRadius-M);
    background: transparent;
    color: var(--Color-Icon-Subtle);
    transition: all 0.2s ease;

    &:hover {
        background: var(--Color-Background-Subtle);
        color: var(--Color-Text-Default);
    }
`;

// Lightweight modal. Closes on overlay click and Escape, and locks body
// scroll while open.
const Modal = ({ title, onClose, width, bare = false, children, ...props }) => {
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <Overlay onClick={onClose} {...props}>
            <Content width={width} onClick={(e) => e.stopPropagation()}>
                {title && (
                    <Header>
                        <H3>{title}</H3>
                        <CloseButton type="button" onClick={onClose} title="Close">
                            <X size={20} />
                        </CloseButton>
                    </Header>
                )}
                <Body bare={bare}>{children}</Body>
            </Content>
        </Overlay>
    );
};

export default Modal;
