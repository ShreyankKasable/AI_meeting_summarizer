import React from "react";
import styled from "styled-components";

const SkeletonBlockBase = styled.div`
    width: ${({ $width }) => $width || "100%"};
    height: ${({ $height }) => $height || "16px"};
    border-radius: ${({ $radius }) => $radius || "var(--Size-CornerRadius-M)"};
    background: linear-gradient(90deg, #edf0f4 0%, #f8fafc 42%, #edf0f4 80%);
    background-size: 220% 100%;
    animation: meetai-shimmer 1.25s ease-in-out infinite;
`;

export const SkeletonBlock = ({ width, height, radius, ...props }) => (
    <SkeletonBlockBase $width={width} $height={height} $radius={radius} {...props} />
);

export const SkeletonCard = styled.div`
    padding: var(--Size-Padding-XXL);
    background: var(--Color-Background-Default);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-XL);
    box-shadow: var(--Color-Shadow-Card);
`;

export const SkeletonStack = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-L);
`;
