import React, { useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { H3 } from "common/global-styled-components";

const Overlay = styled(motion.div)`
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--Size-Padding-XL);
    background: var(--Color-Background-Scrim);
    backdrop-filter: blur(10px);
`;

const Content = styled(motion.div)`
    position: relative;
    width: 100%;
    max-width: ${({ $width }) => $width || "460px"};
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--Color-Background-Default);
    border: 1px solid rgba(255, 255, 255, 0.72);
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
    padding: ${({ $bare }) => ($bare ? "0" : "var(--Size-Padding-XXL)")};
    overflow-y: auto;
`;

const CloseButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid transparent;
    border-radius: var(--Size-CornerRadius-M);
    background: transparent;
    color: var(--Color-Icon-Subtle);
    transition: all var(--transition-fast);

    &:hover {
        background: var(--Color-Background-Subtle);
        color: var(--Color-Text-Bold);
    }
`;

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
        <Overlay
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...props}
        >
            <Content
                $width={width}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
            >
                {title && (
                    <Header>
                        <H3>{title}</H3>
                        <CloseButton type="button" onClick={onClose} title="Close" aria-label="Close dialog">
                            <X size={18} />
                        </CloseButton>
                    </Header>
                )}
                <Body $bare={bare}>{children}</Body>
            </Content>
        </Overlay>
    );
};

export default Modal;
