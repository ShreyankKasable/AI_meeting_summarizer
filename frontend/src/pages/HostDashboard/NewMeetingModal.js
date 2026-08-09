import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { Mic, Plus, UserPlus, X } from "lucide-react";
import Modal from "common/components/Modal";
import Button from "common/components/Button";
import { H3, Body3 } from "common/global-styled-components";
import { setHostView } from "common/redux/actions/sessionActions";
import { HOST_VIEWS } from "common/constants";
import { toast } from "common/utils/toast";
import { emitStartRecording } from "services/socket.service";

const Shell = styled.form`
    display: flex;
    flex-direction: column;
    background: var(--Color-Background-Default);
`;

const Header = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-XL);
    padding: var(--Size-Padding-XXL) var(--Size-Padding-XXXL);
    border-bottom: 1px solid var(--Color-Border-Subtle);
    background: var(--Color-Background-Default);
`;

const CloseButton = styled.button`
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--Size-CornerRadius-Full);
    background: transparent;
    color: var(--Color-Icon-Subtle);
    transition: all var(--transition-fast);

    &:hover {
        background: var(--Color-Background-Subtle);
        color: var(--Color-Text-Bold);
    }
`;

const Body = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-XXL);
    padding: var(--Size-Padding-XXXL);
    background: var(--Color-Background-Default);
`;

const Field = styled.label`
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-S);
`;

const FieldLabel = styled.span`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--Size-Gap-M);
    color: var(--Color-Text-Subtle);
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    line-height: var(--line-height-140);
    font-weight: var(--medium);
    letter-spacing: var(--app-letter-spacing);
    text-transform: var(--app-text-transform);
`;

const ControlWrap = styled.div`
    position: relative;
`;

const controlStyles = `
    width: 100%;
    min-height: 44px;
    padding: 0 var(--Size-Padding-XL);
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Subtle);
    color: var(--Color-Text-Default);
    font-family: var(--body-font);
    font-size: var(--body-3-d);
    line-height: var(--line-height-140);
    font-weight: var(--regular);
    letter-spacing: var(--app-letter-spacing);
    text-transform: var(--app-text-transform);
    outline: none;
    transition: all var(--transition-fast);

    &::placeholder {
        color: var(--Color-Text-Subtlest);
    }

    &:focus {
        border-color: var(--Color-Border-Action);
        box-shadow: var(--Color-Shadow-Focus);
        background: var(--Color-Background-Default);
    }
`;

const TextInput = styled.input`
    ${controlStyles}
`;

const TextArea = styled.textarea`
    ${controlStyles}
    min-height: 96px;
    resize: none;
    padding: var(--Size-Padding-L) 44px var(--Size-Padding-L) var(--Size-Padding-XL);
`;

const ParticipantIcon = styled.div`
    position: absolute;
    top: var(--Size-Padding-L);
    right: var(--Size-Padding-L);
    color: var(--Color-Icon-Subtle);
    pointer-events: none;
`;

const HelpText = styled(Body3)`
    margin-top: var(--Size-Gap-XS);
    font-size: var(--body-4-d);
    color: var(--Color-Text-Subtlest);
`;

const StatusCard = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    padding: var(--Size-Padding-L) var(--Size-Padding-XL);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Subtle);
    color: var(--Color-Text-Subtle);
`;

const StatusIcon = styled.span`
    display: inline-flex;
    color: var(--Color-Icon-Action);
`;

const Footer = styled.footer`
    display: flex;
    justify-content: flex-end;
    gap: var(--Size-Gap-M);
    padding: var(--Size-Padding-XXL) var(--Size-Padding-XXXL);
    border-top: 1px solid var(--Color-Border-Subtle);
    background: var(--Color-Background-Default);

    @media (max-width: 560px) {
        flex-direction: column-reverse;
    }
`;

const ActionButton = styled(Button)`
    min-width: 142px;
`;

const NewMeetingModal = ({ onClose }) => {
    const dispatch = useDispatch();
    const [title, setTitle] = useState("");
    const [participants, setParticipants] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const started = emitStartRecording(title.trim() || "Untitled Meeting", participants);
        if (!started) {
            toast.error("Could not start meeting", { message: "The realtime connection is not ready." });
            return;
        }
        dispatch(setHostView(HOST_VIEWS.Record));
        onClose();
    };

    return (
        <Modal
            title="Start a New Meeting"
            ariaLabel="Start a New Meeting"
            hideHeader
            bare
            width="560px"
            onClose={onClose}
            id="new-meeting-modal"
        >
            <Shell onSubmit={handleSubmit}>
                <Header>
                    <H3 style={{ fontSize: "var(--h2-d)" }}>Start a New Meeting</H3>
                    <CloseButton type="button" aria-label="Close dialog" title="Close" onClick={onClose}>
                        <X size={18} />
                    </CloseButton>
                </Header>
                <Body>
                    <Field htmlFor="new-meeting-title">
                        <FieldLabel>Meeting Title</FieldLabel>
                        <TextInput
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Weekly Editorial Sync"
                            id="new-meeting-title"
                            autoFocus
                        />
                    </Field>
                    <Field htmlFor="new-meeting-participants">
                        <FieldLabel>Participant Emails</FieldLabel>
                        <ControlWrap>
                            <TextArea
                                value={participants}
                                onChange={(e) => setParticipants(e.target.value)}
                                placeholder="Enter emails or names separated by commas..."
                                id="new-meeting-participants"
                                rows={3}
                            />
                            <ParticipantIcon>
                                <UserPlus size={16} />
                            </ParticipantIcon>
                        </ControlWrap>
                        <HelpText>Participants will be saved with this meeting.</HelpText>
                    </Field>
                    <StatusCard>
                        <StatusIcon>
                            <Mic size={16} />
                        </StatusIcon>
                        <Body3>AI recording and transcription ready to initialize.</Body3>
                    </StatusCard>
                </Body>
                <Footer>
                    <ActionButton type="button" mode="secondary" size="small" onClick={onClose}>
                        Cancel
                    </ActionButton>
                    <ActionButton type="submit" size="small" id="start-recording-btn">
                        <Plus size={14} />
                        Create Meeting
                    </ActionButton>
                </Footer>
            </Shell>
        </Modal>
    );
};

export default NewMeetingModal;
