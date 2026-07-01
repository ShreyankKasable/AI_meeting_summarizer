import { createGlobalStyle } from "styled-components";

export const Breakpoints = {
    mobileXS: 480,
    mobile: 640,
    tablet: 768,
    laptop: 1024,
    desktop: 1280,
};

// Design tokens (--Color-*, --Size-*) so no component ever hardcodes a
// colour, spacing, radius, or font size. Values come from the "Cognitive
// Clarity" light-theme design system.
export const GlobalStyle = createGlobalStyle`
    :root {
        /* ---- Fonts ---- */
        --heading-font: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        --body-font: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        --mono-font: "SFMono-Regular", ui-monospace, "JetBrains Mono", Menlo, monospace;

        /* ---- Typography sizes ---- */
        --h1-d: 48px;
        --h1-m: 32px;
        --h2-d: 32px;
        --h2-m: 24px;
        --h3-d: 22px;
        --h3-m: 20px;
        --subtitle-1-d: 20px;
        --subtitle-2-d: 18px;
        --body-1-d: 18px;
        --body-2-d: 16px;
        --body-3-d: 14px;
        --body-4-d: 12px;
        --body-5-d: 10px;
        --caption-d: 9px;

        /* ---- Font weight ---- */
        --bold: 700;
        --semi-bold: 600;
        --medium: 500;
        --regular: 400;

        /* ---- Line height ---- */
        --line-height-110: 110%;
        --line-height-120: 120%;
        --line-height-140: 140%;

        /* ---- Letter spacing ---- */
        --letter-spacing-tight: -0.02em;
        --letter-spacing-wide: 0.05em;
        --letter-spacing-widest: 0.12em;

        /* ---- Background colours ---- */
        --Color-Background-Default: #ffffff;
        --Color-Background-Subtle: #f7f9fb;
        --Color-Background-Subtle-2: #eceef0;
        --Color-Background-Bold: #191c1e;
        --Color-Background-Bold-2: #2d3133;
        --Color-Background-Inverse: #191c1e;
        --Color-Background-Action: #0058be;
        --Color-Background-Action-Hover: #004395;
        --Color-Background-Disabled: #f2f4f6;
        --Color-Background-Accent-Action: #e8f0fc;
        --Color-Background-Accent-Success: #ecfdf5;
        --Color-Background-Accent-Warning: #fffbeb;
        --Color-Background-Accent-Danger: #ffdad6;
        --Color-Background-Gradient-Action: linear-gradient(90deg, #0058be 0%, #4648d4 100%);
        --Color-Background-Scrim: rgba(25, 28, 30, 0.6);

        /* ---- Text colours ---- */
        --Color-Text-Default: #191c1e;
        --Color-Text-Bold: #191c1e;
        --Color-Text-Subtle: #424754;
        --Color-Text-Subtlest: #727785;
        --Color-Text-Action: #0058be;
        --Color-Text-Inverse: #ffffff;
        --Color-Text-Success: #047857;
        --Color-Text-Warning: #b45309;
        --Color-Text-Danger: #ba1a1a;

        /* ---- Border colours ---- */
        --Color-Border-Default: #c2c6d6;
        --Color-Border-Subtle: #e6e8ea;
        --Color-Border-Bold: #727785;
        --Color-Border-Action: #0058be;
        --Color-Border-Inverse: rgba(255, 255, 255, 0.2);
        --Color-Border-Accent-Action: #cfe0f7;
        --Color-Border-Accent-Success: #d1fae5;
        --Color-Border-Accent-Warning: #fde68a;
        --Color-Border-Accent-Danger: #ffdad6;

        /* ---- Icon colours ---- */
        --Color-Icon-Default: #424754;
        --Color-Icon-Subtle: #727785;
        --Color-Icon-Action: #0058be;
        --Color-Icon-Inverse: #ffffff;
        --Color-Icon-Success: #059669;
        --Color-Icon-Warning: #d97706;
        --Color-Icon-Danger: #ba1a1a;

        /* ---- Shadows (Level 1 / Level 2 per the design system) ---- */
        --Color-Shadow-Card: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
        --Color-Shadow-1: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
        --Color-Shadow-2: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        --Color-Shadow-Action: 0 12px 24px rgba(0, 88, 190, 0.25);

        /* ---- Spacing / gaps (4px baseline) ---- */
        --Size-Gap-XS: 2px;
        --Size-Gap-S: 4px;
        --Size-Gap-M: 8px;
        --Size-Gap-L: 12px;
        --Size-Gap-XL: 16px;
        --Size-Gap-XXL: 24px;
        --Size-Gap-XXXL: 32px;

        --Size-Padding-XS: 2px;
        --Size-Padding-S: 4px;
        --Size-Padding-M: 8px;
        --Size-Padding-L: 12px;
        --Size-Padding-XL: 16px;
        --Size-Padding-XXL: 24px;
        --Size-Padding-XXXL: 32px;

        /* ---- Corner radius ---- */
        --Size-CornerRadius-XS: 2px;
        --Size-CornerRadius-S: 4px;
        --Size-CornerRadius-M: 8px;
        --Size-CornerRadius-L: 12px;
        --Size-CornerRadius-XL: 16px;
        --Size-CornerRadius-XXL: 24px;
        --Size-CornerRadius-XXXL: 32px;
        --Size-CornerRadius-Full: 9999px;
    }

    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    html,
    body,
    #root {
        height: 100%;
    }

    body {
        margin: 0;
        font-family: var(--body-font);
        color: var(--Color-Text-Default);
        background: var(--Color-Background-Subtle);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
    }

    button {
        font-family: inherit;
        cursor: pointer;
    }

    input,
    textarea {
        font-family: inherit;
    }

    a {
        color: inherit;
        text-decoration: none;
    }

    ::selection {
        background: var(--Color-Background-Accent-Action);
        color: var(--Color-Text-Action);
    }

    /* ---- Shared keyframes ---- */
    @keyframes meetai-fade-in {
        from {
            opacity: 0;
            transform: translateY(6px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes meetai-spin {
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes meetai-pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }

    @keyframes meetai-scan {
        0% {
            top: 0;
        }
        100% {
            top: 100%;
        }
    }
`;

export default GlobalStyle;
