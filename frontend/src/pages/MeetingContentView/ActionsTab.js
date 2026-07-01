import React from "react";
import styled from "styled-components";
import Badge from "common/components/Badge";
import { Body2, Body3 } from "common/global-styled-components";
import { PRIORITY_BADGE_TONE } from "common/constants";

const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-L);
    padding: var(--Size-Padding-XL);
`;

const ItemCard = styled.div`
    display: flex;
    align-items: flex-start;
    gap: var(--Size-Gap-M);
    padding: var(--Size-Padding-L);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-M);
    opacity: ${({ completed }) => (completed ? 0.6 : 1)};

    &:hover {
        border-color: var(--Color-Border-Action);
    }
`;

const Checkbox = styled.input`
    margin-top: 2px;
    accent-color: var(--Color-Background-Action);
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    margin-top: var(--Size-Gap-S);
`;

const Placeholder = styled(Body2)`
    color: var(--Color-Text-Subtlest);
    padding: var(--Size-Padding-XL);
`;

// `readOnly` hides the checkbox interaction — used by the participant view.
const ActionsTab = ({ items = [], onToggle, readOnly = false }) => {
    if (!items.length) return <Placeholder>No action items yet.</Placeholder>;

    return (
        <List>
            {items.map((item) => (
                <ItemCard key={item.id} completed={item.completed}>
                    <Checkbox
                        type="checkbox"
                        checked={item.completed}
                        disabled={readOnly}
                        onChange={() => onToggle?.(item.id)}
                    />
                    <div>
                        <Body2 style={{ textDecoration: item.completed ? "line-through" : "none" }}>
                            {item.description}
                        </Body2>
                        <MetaRow>
                            <Badge tone={PRIORITY_BADGE_TONE[item.priority] || "neutral"}>{item.priority}</Badge>
                            {item.assignee && <Body3>{item.assignee}</Body3>}
                            {item.due_date && <Body3>Due {item.due_date}</Body3>}
                        </MetaRow>
                    </div>
                </ItemCard>
            ))}
        </List>
    );
};

export default ActionsTab;
