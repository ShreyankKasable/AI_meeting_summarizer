import styled from "styled-components";

const widths = {
    sm: "520px",
    md: "820px",
    lg: "1080px",
    xl: "1280px",
    full: "none",
};

const PageContainer = styled.div`
    width: 100%;
    max-width: ${({ size }) => widths[size] || widths.xl};
    margin: 0 auto;
    padding: var(--Size-Padding-4XL) var(--Size-Padding-XXXL);
    animation: meetai-fade-in 0.28s ease;

    @media (max-width: 768px) {
        padding: var(--Size-Padding-XXL) var(--Size-Padding-XL);
    }

    @media (max-width: 480px) {
        padding: var(--Size-Padding-XL) var(--Size-Padding-L);
    }
`;

export default PageContainer;
