import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { Mic, Users } from "lucide-react";
import Modal from "common/components/Modal";
import Input from "common/components/Input";
import Button from "common/components/Button";
import Badge from "common/components/Badge";
import { Body3 } from "common/global-styled-components";
import { setHostView } from "common/redux/actions/sessionActions";
import { HOST_VIEWS } from "common/constants";
import { emitStartRecording } from "services/socket.service";

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-XL);
`;

const Intro = styled.div`
    display: grid;
    gap: var(--Size-Gap-M);
    padding: var(--Size-Padding-XL);
    margin-bottom: var(--Size-Gap-XL);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XL);
    background: var(--Color-Background-Subtle);
`;

const IconLine = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
`;

const Actions = styled.div`
    display: flex;
    gap: var(--Size-Gap-M);

    @media (max-width: 480px) {
        flex-direction: column-reverse;
    }
`;

const NewMeetingModal = ({ onClose }) => {
    const dispatch = useDispatch();
    const [title, setTitle] = useState("");
    const [participants, setParticipants] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        emitStartRecording(title.trim() || "Untitled Meeting", participants);
        dispatch(setHostView(HOST_VIEWS.Record));
        onClose();
    };

    return (
        <Modal title="New Meeting" onClose={onClose} id="new-meeting-modal">
            <Intro>
                <Badge tone="action">
                    <Mic size={13} />
                    Recording setup
                </Badge>
                <IconLine>
                    <Users size={16} color="var(--Color-Icon-Subtle)" />
                    <Body3>Participant names can be added now or cleaned up after transcription.</Body3>
                </IconLine>
            </Intro>
            <Form onSubmit={handleSubmit}>
                <Input
                    label="Meeting Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Weekly product review"
                    id="new-meeting-title"
                    autoFocus
                />
                <Input
                    label="Participants"
                    optional
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    placeholder="Comma-separated names"
                    id="new-meeting-participants"
                />
                <Actions>
                    <Button type="button" mode="secondary" block onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" block id="start-recording-btn">
                        <Mic size={16} />
                        Start Recording
                    </Button>
                </Actions>
            </Form>
        </Modal>
    );
};

export default NewMeetingModal;
