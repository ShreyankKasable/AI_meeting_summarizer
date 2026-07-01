import styled from "styled-components";

// Centered, responsive page wrapper. `size` controls the max width.
const widths = {
    sm: "480px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
};

const PageContainer = styled.div`
    width: 100%;
    max-width: ${({ size }) => widths[size] || widths.xl};
    margin: 0 auto;
    padding: var(--Size-Padding-XXXL) var(--Size-Padding-XL);
    animation: meetai-fade-in 0.3s ease;

    @media (max-width: 640px) {
        padding: var(--Size-Padding-XXL) var(--Size-Padding-L);
    }
`;

export default PageContainer;
