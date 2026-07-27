import { createGlobalStyle } from "styled-components";

export const Breakpoints = {
    mobileXS: 480,
    mobile: 640,
    tablet: 768,
    laptop: 1024,
    desktop: 1280,
};

export const GlobalStyle = createGlobalStyle`
    :root {
        --heading-font: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        --body-font: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        --mono-font: "SFMono-Regular", "Cascadia Code", "JetBrains Mono", Consolas, monospace;

        --h1-d: 56px;
        --h1-m: 36px;
        --h2-d: 34px;
        --h2-m: 26px;
        --h3-d: 22px;
        --h3-m: 20px;
        --subtitle-1-d: 20px;
        --subtitle-2-d: 18px;
        --body-1-d: 17px;
        --body-2-d: 15px;
        --body-3-d: 14px;
        --body-4-d: 12px;
        --body-5-d: 11px;
        --caption-d: 10px;

        --bold: 720;
        --semi-bold: 640;
        --medium: 540;
        --regular: 400;

        --line-height-110: 1.1;
        --line-height-120: 1.2;
        --line-height-140: 1.45;
        --line-height-160: 1.6;

        --letter-spacing-tight: 0;
        --letter-spacing-wide: 0.04em;
        --letter-spacing-widest: 0.08em;

        --Color-Background-Default: #ffffff;
        --Color-Background-Subtle: #f6f7f9;
        --Color-Background-Subtle-2: #eef1f4;
        --Color-Background-Subtle-3: #e4e8ed;
        --Color-Background-Bold: #151618;
        --Color-Background-Bold-2: #262a2f;
        --Color-Background-Inverse: #151618;
        --Color-Background-Action: #0f766e;
        --Color-Background-Action-Hover: #0b5f59;
        --Color-Background-Action-Soft: #e7f7f4;
        --Color-Background-Disabled: #f0f2f5;
        --Color-Background-Accent-Action: #e7f7f4;
        --Color-Background-Accent-Success: #ebf8f1;
        --Color-Background-Accent-Warning: #fff4dc;
        --Color-Background-Accent-Danger: #fff0ee;
        --Color-Background-Accent-Info: #eef4ff;
        --Color-Background-Scrim: rgba(15, 17, 20, 0.54);
        --Color-Background-Glass: rgba(255, 255, 255, 0.72);

        --Color-Text-Default: #202328;
        --Color-Text-Bold: #111316;
        --Color-Text-Subtle: #565d69;
        --Color-Text-Subtlest: #7a8290;
        --Color-Text-Action: #0f766e;
        --Color-Text-Inverse: #ffffff;
        --Color-Text-Success: #147a4a;
        --Color-Text-Warning: #9a5b08;
        --Color-Text-Danger: #b42318;
        --Color-Text-Info: #285da8;

        --Color-Border-Default: #d5dae2;
        --Color-Border-Subtle: #e7ebf0;
        --Color-Border-Bold: #9aa3af;
        --Color-Border-Action: #0f766e;
        --Color-Border-Inverse: rgba(255, 255, 255, 0.18);
        --Color-Border-Accent-Action: #b8e2dc;
        --Color-Border-Accent-Success: #ccebd9;
        --Color-Border-Accent-Warning: #f7daa0;
        --Color-Border-Accent-Danger: #f6c7c2;
        --Color-Border-Accent-Info: #cadbff;

        --Color-Icon-Default: #4f5662;
        --Color-Icon-Subtle: #8a93a1;
        --Color-Icon-Action: #0f766e;
        --Color-Icon-Inverse: #ffffff;
        --Color-Icon-Success: #168452;
        --Color-Icon-Warning: #b26b08;
        --Color-Icon-Danger: #b42318;
        --Color-Icon-Info: #2f68b3;

        --Color-Shadow-Card: 0 1px 2px rgba(17, 19, 22, 0.04), 0 10px 28px rgba(17, 19, 22, 0.06);
        --Color-Shadow-1: 0 16px 40px rgba(17, 19, 22, 0.1);
        --Color-Shadow-2: 0 28px 70px rgba(17, 19, 22, 0.18);
        --Color-Shadow-Action: 0 14px 28px rgba(15, 118, 110, 0.24);
        --Color-Shadow-Focus: 0 0 0 4px rgba(15, 118, 110, 0.15);

        --Size-Gap-XS: 2px;
        --Size-Gap-S: 4px;
        --Size-Gap-M: 8px;
        --Size-Gap-L: 12px;
        --Size-Gap-XL: 16px;
        --Size-Gap-XXL: 24px;
        --Size-Gap-XXXL: 32px;
        --Size-Gap-4XL: 48px;
        --Size-Gap-5XL: 64px;

        --Size-Padding-XS: 2px;
        --Size-Padding-S: 4px;
        --Size-Padding-M: 8px;
        --Size-Padding-L: 12px;
        --Size-Padding-XL: 16px;
        --Size-Padding-XXL: 24px;
        --Size-Padding-XXXL: 32px;
        --Size-Padding-4XL: 48px;

        --Size-CornerRadius-XS: 3px;
        --Size-CornerRadius-S: 5px;
        --Size-CornerRadius-M: 8px;
        --Size-CornerRadius-L: 12px;
        --Size-CornerRadius-XL: 16px;
        --Size-CornerRadius-XXL: 22px;
        --Size-CornerRadius-XXXL: 28px;
        --Size-CornerRadius-Full: 9999px;

        --transition-fast: 140ms ease;
        --transition-med: 220ms ease;
    }

    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }

    html {
        min-height: 100%;
        scroll-behavior: smooth;
    }

    body,
    #root {
        min-height: 100%;
    }

    body {
        margin: 0;
        font-family: var(--body-font);
        color: var(--Color-Text-Default);
        background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(246, 247, 249, 0.96) 48%, #f6f7f9 100%);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
    }

    button,
    input,
    textarea,
    select {
        font: inherit;
    }

    button {
        cursor: pointer;
    }

    button:disabled {
        cursor: not-allowed;
    }

    a {
        color: inherit;
        text-decoration: none;
    }

    img,
    svg {
        display: block;
    }

    ::selection {
        background: var(--Color-Background-Accent-Action);
        color: var(--Color-Text-Action);
    }

    :focus-visible {
        outline: 2px solid var(--Color-Border-Action);
        outline-offset: 3px;
    }

    ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: #cbd2dc;
        border: 3px solid transparent;
        border-radius: var(--Size-CornerRadius-Full);
        background-clip: content-box;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #aeb7c4;
        border: 3px solid transparent;
        background-clip: content-box;
    }

    @keyframes meetai-fade-in {
        from {
            opacity: 0;
            transform: translateY(8px);
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
            transform: scale(1);
        }
        50% {
            opacity: 0.44;
            transform: scale(0.86);
        }
    }

    @keyframes meetai-shimmer {
        0% {
            background-position: 120% 0;
        }
        100% {
            background-position: -120% 0;
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
