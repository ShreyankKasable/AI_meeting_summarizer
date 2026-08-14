import React from "react";
import styled from "styled-components";

export const BRAND_NAME = "EchoDesk AI";
export const BRAND_LOGO_SRC = "/brand/echodesk-ai-logo.png";
export const BRAND_MARK_SRC = "/brand/echodesk-ai-mark.png";

const LogoImage = styled.img`
    display: block;
    width: ${({ $width }) => $width};
    max-width: 100%;
    max-height: ${({ $maxHeight }) => $maxHeight};
    object-fit: contain;
`;

const BrandLogo = ({ width = "178px", maxHeight = "52px", alt = BRAND_NAME, ...props }) => (
    <LogoImage src={BRAND_LOGO_SRC} alt={alt} $width={width} $maxHeight={maxHeight} {...props} />
);

export default BrandLogo;
