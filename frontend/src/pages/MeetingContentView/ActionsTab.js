import React from "react";
import styled from "styled-components";
import { CheckCircle2, Circle, Clock3, ListTodo, UserRound } from "lucide-react";
import Badge from "common/components/Badge";
import { H3, Body2, Body3, MonoLabel } from "common/global-styled-components";
import { PRIORITY_BADGE_TONE } from "common/constants";

const List = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-XL);
    padding: var(--Size-Padding-XXL);
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const HeaderBlock = styled.div`
    display: grid;
    gap: var(--Size-Gap-L);
    padding-bottom: var(--Size-Padding-XL);
    border-bottom: 1px solid var(--Color-Border-Subtle);
`;

const StatusRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    flex-wrap: wrap;
`;

const ItemCard = styled.label`
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--Size-Gap-L);
    padding: var(--Size-Padding-XL);
    border: 1px solid ${({ $completed }) => ($completed ? "var(--Color-Border-Subtle)" : "var(--Color-Border-Default)")};
    border-radius: var(--Size-CornerRadius-M);
    background: ${({ $completed }) => ($completed ? "var(--Color-Background-Subtle)" : "var(--Color-Background-Default)")};
    opacity: ${({ $completed }) => ($completed ? 0.72 : 1)};
    transition: all var(--transition-fast);

    &:hover {
        border-color: var(--Color-Border-Action);
        box-shadow: var(--Color-Shadow-Card);
    }
`;

const CheckboxWrap = styled.span`
    position: relative;
    margin-top: 1px;
`;

const Checkbox = styled.input`
    position: absolute;
    opacity: 0;
    pointer-events: none;
`;

const CheckVisual = styled.span`
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: ${({ $checked }) => ($checked ? "var(--Color-Icon-Success)" : "var(--Color-Icon-Action)")};
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    flex-wrap: wrap;
    margin-top: var(--Size-Gap-M);
`;

const MetaItem = styled(Body3)`
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-S);
`;

const SourceNote = styled.div`
    margin-top: var(--Size-Gap-L);
    padding: var(--Size-Padding-M) var(--Size-Padding-L);
    border-left: 2px solid var(--Color-Border-Action);
    background: var(--Color-Background-Accent-Action);
    color: var(--Color-Text-Subtle);
    font-size: var(--body-3-d);
    line-height: var(--line-height-140);
`;

const EmptyState = styled.div`
    margin: var(--Size-Padding-XXL);
    min-height: 220px;
    display: grid;
    place-items: center;
    padding: var(--Size-Padding-XXL);
    border: 1px dashed var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Subtle);
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--Size-Gap-L);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Accent-Warning);
    color: var(--Color-Icon-Warning);
`;

const ActionsTab = ({ items = [], onToggle, readOnly = false }) => {
    if (!items.length) {
        return (
            <EmptyState>
                <div>
                    <EmptyIcon>
                        <ListTodo size={20} />
                    </EmptyIcon>
                    <H3 style={{ fontSize: "var(--subtitle-2-d)" }}>No action items</H3>
                    <Body3 style={{ marginTop: "var(--Size-Gap-S)" }}>Action items will appear after processing.</Body3>
                </div>
            </EmptyState>
        );
    }

    const openItems = items.filter((item) => !item.completed).length;
    const completedItems = items.length - openItems;

    return (
        <List>
            <HeaderBlock>
                <div>
                    <MonoLabel>Action register</MonoLabel>
                    <H3 style={{ fontSize: "var(--subtitle-2-d)", marginTop: "var(--Size-Gap-S)" }}>
                        Owners, dates, and evidence
                    </H3>
                </div>
                <StatusRow>
                    <Badge tone="warning">{openItems} Open</Badge>
                    <Badge tone="success">{completedItems} Done</Badge>
                </StatusRow>
            </HeaderBlock>
            {items.map((item) => (
                <ItemCard key={item.id} $completed={item.completed}>
                    <CheckboxWrap>
                        <Checkbox
                            type="checkbox"
                            checked={item.completed}
                            disabled={readOnly}
                            onChange={() => onToggle?.(item.id)}
                        />
                        <CheckVisual $checked={item.completed}>
                            {item.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </CheckVisual>
                    </CheckboxWrap>
                    <div>
                        <Body2 style={{ textDecoration: item.completed ? "line-through" : "none" }}>
                            {item.description}
                        </Body2>
                        <MetaRow>
                            <Badge tone={PRIORITY_BADGE_TONE[item.priority] || "neutral"}>{item.priority}</Badge>
                            {item.assignee && (
                                <MetaItem>
                                    <UserRound size={13} />
                                    {item.assignee}
                                </MetaItem>
                            )}
                            {item.due_date && (
                                <MetaItem>
                                    <Clock3 size={13} />
                                    Due {item.due_date}
                                </MetaItem>
                            )}
                        </MetaRow>
                        {(item.source || item.source_text || item.transcript_reference) && (
                            <SourceNote>
                                {item.source || item.source_text || item.transcript_reference}
                            </SourceNote>
                        )}
                    </div>
                </ItemCard>
            ))}
        </List>
    );
};

export default ActionsTab;
