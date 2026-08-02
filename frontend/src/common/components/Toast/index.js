import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { TOAST_DISMISS_EVENT, TOAST_EVENT, toast as toastApi } from "common/utils/toast";

const Viewport = styled.div`
    position: fixed;
    top: var(--Size-Gap-XXL);
    right: var(--Size-Gap-XXL);
    z-index: 9999;
    display: grid;
    gap: var(--Size-Gap-M);
    width: min(380px, calc(100vw - 32px));
    pointer-events: none;

    @media (max-width: 640px) {
        top: var(--Size-Gap-XL);
        right: var(--Size-Gap-XL);
        left: var(--Size-Gap-XL);
        width: auto;
    }
`;

const toneStyles = {
    success: css`
        border-color: var(--Color-Border-Accent-Success);
        background: var(--Color-Background-Default);

        svg[data-icon="tone"] {
            color: var(--Color-Icon-Success);
        }
    `,
    error: css`
        border-color: var(--Color-Border-Accent-Danger);
        background: var(--Color-Background-Default);

        svg[data-icon="tone"] {
            color: var(--Color-Icon-Danger);
        }
    `,
    warning: css`
        border-color: var(--Color-Border-Accent-Warning);
        background: var(--Color-Background-Default);

        svg[data-icon="tone"] {
            color: var(--Color-Icon-Warning);
        }
    `,
    info: css`
        border-color: var(--Color-Border-Accent-Info);
        background: var(--Color-Background-Default);

        svg[data-icon="tone"] {
            color: var(--Color-Icon-Info);
        }
    `,
};

const Card = styled.div`
    pointer-events: auto;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: var(--Size-Gap-M);
    align-items: flex-start;
    padding: var(--Size-Padding-L);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-L);
    box-shadow: var(--Color-Shadow-1);
    color: var(--Color-Text-Default);
    animation: meetai-toast-in 180ms ease both;
    ${({ $tone }) => toneStyles[$tone] || toneStyles.info}

    @keyframes meetai-toast-in {
        from {
            opacity: 0;
            transform: translateY(-8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const Content = styled.div`
    min-width: 0;
    display: grid;
    gap: var(--Size-Gap-XS);
`;

const Title = styled.div`
    color: var(--Color-Text-Bold);
    font-size: var(--body-3-d);
    font-weight: var(--bold);
    line-height: var(--line-height-140);
`;

const Message = styled.div`
    color: var(--Color-Text-Subtle);
    font-size: var(--body-4-d);
    line-height: var(--line-height-140);
`;

const CloseButton = styled.button`
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--Size-CornerRadius-S);
    background: transparent;
    color: var(--Color-Icon-Subtle);
    cursor: pointer;

    &:hover {
        background: var(--Color-Background-Subtle);
        color: var(--Color-Icon-Default);
    }
`;

const iconByTone = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
};

const ToastItem = ({ item, onDismiss }) => {
    const Icon = iconByTone[item.tone] || Info;
    const role = item.tone === "error" ? "alert" : "status";

    useEffect(() => {
        if (item.duration === 0) return undefined;
        const timer = window.setTimeout(() => onDismiss(item.id), item.duration);
        return () => window.clearTimeout(timer);
    }, [item.duration, item.id, onDismiss]);

    return (
        <Card $tone={item.tone} role={role}>
            <Icon data-icon="tone" size={18} />
            <Content>
                {item.title && <Title>{item.title}</Title>}
                {item.message && <Message>{item.message}</Message>}
            </Content>
            <CloseButton type="button" onClick={() => onDismiss(item.id)} aria-label="Dismiss notification">
                <X size={15} />
            </CloseButton>
        </Card>
    );
};

const ToastViewport = () => {
    const [items, setItems] = useState([]);

    const dismiss = useCallback((id) => {
        setItems((current) => current.filter((item) => item.id !== id));
    }, []);

    useEffect(() => {
        const handleAdd = (event) => {
            const incoming = event.detail;
            if (!incoming?.title && !incoming?.message) return;
            setItems((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)].slice(0, 5));
        };
        const handleDismiss = (event) => dismiss(event.detail?.id);

        window.addEventListener(TOAST_EVENT, handleAdd);
        window.addEventListener(TOAST_DISMISS_EVENT, handleDismiss);
        return () => {
            window.removeEventListener(TOAST_EVENT, handleAdd);
            window.removeEventListener(TOAST_DISMISS_EVENT, handleDismiss);
        };
    }, [dismiss]);

    const renderedItems = useMemo(() => items, [items]);

    return (
        <Viewport aria-live="polite" aria-relevant="additions">
            {renderedItems.map((item) => (
                <ToastItem key={item.id} item={item} onDismiss={dismiss} />
            ))}
        </Viewport>
    );
};

export { toastApi as toast };
export default ToastViewport;
