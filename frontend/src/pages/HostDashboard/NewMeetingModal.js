import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { Mic } from "lucide-react";
import Modal from "common/components/Modal";
import Input from "common/components/Input";
import Button from "common/components/Button";
import { setHostView } from "common/redux/actions/sessionActions";
import { HOST_VIEWS } from "common/constants";
import { emitStartRecording } from "services/socket.service";

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-XL);
`;

// Starting a recording is a socket emit (start_recording -> recording_started
// lands the meeting id in redux via useSocket), not a REST POST — see
// common/hooks/useSocket.js.
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
            <Form onSubmit={handleSubmit}>
                <Input
                    label="Meeting Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Weekly Sync"
                    id="new-meeting-title"
                />
                <Input
                    label="Participants"
                    optional
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    placeholder="Comma-separated names"
                    id="new-meeting-participants"
                />
                <Button type="submit" block id="start-recording-btn">
                    <Mic size={16} />
                    Start Recording
                </Button>
            </Form>
        </Modal>
    );
};

export default NewMeetingModal;
