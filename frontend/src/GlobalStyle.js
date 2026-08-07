import { createGlobalStyle } from "styled-components";

export const Breakpoints = {
    mobileXS: 480,
    mobile: 640,
    tablet: 768,
    authSplit: 980,
    laptop: 1024,
    desktop: 1280,
};

export const GlobalStyle = createGlobalStyle`
    @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Playfair+Display:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap");
    @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");

    :root {
        --heading-font: "Playfair Display", Georgia, "Times New Roman", serif;
        --body-font: "Source Sans 3", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        --mono-font: "IBM Plex Mono", "Cascadia Code", Consolas, monospace;

        --h1-d: 48px;
        --h1-m: 32px;
        --h2-d: 32px;
        --h2-m: 26px;
        --h3-d: 24px;
        --h3-m: 21px;
        --subtitle-1-d: 20px;
        --subtitle-2-d: 18px;
        --body-1-d: 18px;
        --body-2-d: 16px;
        --body-3-d: 14px;
        --body-4-d: 12px;
        --body-5-d: 11px;
        --caption-d: 10px;

        --bold: 700;
        --semi-bold: 600;
        --medium: 500;
        --regular: 400;

        --line-height-110: 1.16;
        --line-height-120: 1.25;
        --line-height-140: 1.45;
        --line-height-160: 1.65;

        --letter-spacing-tight: 0;
        --letter-spacing-wide: 0.08em;
        --letter-spacing-widest: 0.12em;

        --Color-Background-Root: #f9f9f7;
        --Color-Background-Default: #ffffff;
        --Color-Background-Subtle: #f4f4f2;
        --Color-Background-Subtle-2: #eeeeec;
        --Color-Background-Subtle-3: #e8e8e6;
        --Color-Background-Bold: #1a1c1b;
        --Color-Background-Bold-2: #2f3130;
        --Color-Background-Inverse: #2f3130;
        --Color-Background-Action: #785600;
        --Color-Background-Action-Hover: #986d00;
        --Color-Background-Action-Soft: #ffdea6;
        --Color-Background-Disabled: #e2e3e1;
        --Color-Background-Accent-Action: #fff6df;
        --Color-Background-Accent-Success: #eaf4e8;
        --Color-Background-Accent-Warning: #fff2d2;
        --Color-Background-Accent-Danger: #ffdad6;
        --Color-Background-Accent-Info: #e9eef2;
        --Color-Background-Scrim: rgba(26, 28, 27, 0.42);
        --Color-Background-Glass: rgba(255, 255, 255, 0.84);

        --Color-Text-Default: #1a1c1b;
        --Color-Text-Bold: #1a1c1b;
        --Color-Text-Subtle: #4f4535;
        --Color-Text-Subtlest: #817563;
        --Color-Text-Action: #785600;
        --Color-Text-Inverse: #ffffff;
        --Color-Text-Success: #356b3a;
        --Color-Text-Warning: #7b5800;
        --Color-Text-Danger: #93000a;
        --Color-Text-Info: #425466;

        --Color-Border-Default: #d3c4af;
        --Color-Border-Subtle: #e2d8ca;
        --Color-Border-Bold: #817563;
        --Color-Border-Action: #b8860b;
        --Color-Border-Inverse: rgba(255, 255, 255, 0.18);
        --Color-Border-Accent-Action: #d9a52f;
        --Color-Border-Accent-Success: #a8c6a8;
        --Color-Border-Accent-Warning: #f7bd48;
        --Color-Border-Accent-Danger: #ba1a1a;
        --Color-Border-Accent-Info: #b8c3cb;

        --Color-Icon-Default: #4f4535;
        --Color-Icon-Subtle: #817563;
        --Color-Icon-Action: #785600;
        --Color-Icon-Inverse: #ffffff;
        --Color-Icon-Success: #356b3a;
        --Color-Icon-Warning: #7b5800;
        --Color-Icon-Danger: #93000a;
        --Color-Icon-Info: #425466;

        --Color-Shadow-Card: 0 14px 36px rgba(68, 50, 26, 0.06);
        --Color-Shadow-1: 0 20px 50px rgba(68, 50, 26, 0.08);
        --Color-Shadow-2: 0 30px 80px rgba(68, 50, 26, 0.12);
        --Color-Shadow-Action: 0 12px 24px rgba(120, 86, 0, 0.18);
        --Color-Shadow-Focus: 0 0 0 3px rgba(184, 134, 11, 0.18);

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

        --Size-CornerRadius-XS: 2px;
        --Size-CornerRadius-S: 3px;
        --Size-CornerRadius-M: 4px;
        --Size-CornerRadius-L: 6px;
        --Size-CornerRadius-XL: 8px;
        --Size-CornerRadius-XXL: 12px;
        --Size-CornerRadius-XXXL: 16px;
        --Size-CornerRadius-Full: 9999px;

        --layout-max: 1280px;
        --transition-fast: 140ms ease;
        --transition-med: 220ms ease;

        --Auth-Color-Background: var(--Color-Background-Root);
        --Auth-Color-Surface: var(--Color-Background-Default);
        --Auth-Color-Surface-Subtle: var(--Color-Background-Subtle);
        --Auth-Color-Control-Background: #f5f3f0;
        --Auth-Color-Control-Placeholder: #c8c6c3;
        --Auth-Color-Text: var(--Color-Text-Bold);
        --Auth-Color-Text-Secondary: #5f5e5e;
        --Auth-Color-Text-Tertiary: #5c5c5a;
        --Auth-Color-Label: var(--Color-Text-Subtle);
        --Auth-Color-Border: var(--Color-Border-Default);
        --Auth-Color-Border-Accent: rgba(211, 196, 175, 0.5);
        --Auth-Color-Primary: var(--Color-Background-Action);
        --Auth-Color-Primary-Hover: #7b5800;
        --Auth-Color-Primary-Strong: var(--Color-Background-Action-Hover);
        --Auth-Color-Danger: var(--Color-Text-Danger);
        --Auth-Color-Danger-Border: var(--Color-Border-Accent-Danger);
        --Auth-Color-Visual-Overlay-Start: rgba(255, 255, 255, 0.8);
        --Auth-Color-Visual-Overlay-End: rgba(255, 255, 255, 0);
        --Auth-Color-Google-Blue: #4285f4;
        --Auth-Color-Google-Green: #34a853;
        --Auth-Color-Google-Yellow: #fbbc05;
        --Auth-Color-Google-Red: #ea4335;
        --Auth-Visual-Image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuC7tyiCbnyapR-vopPg78P7kTXW79R8UHjH40A2osVjHVoywGxjib95PAAN_E4dA3lf8Z_jnYKRgdmit4QCOJKqjdgf100MECN69inXk7W8oz--gPGLkShJv7TCgV45yYHwz7AoEx6GDyj6WV-FZbR1vETIsfTIaL8ZtYZZds0vmrC-d2Gfi1vv7fByNZmzqMGhIkLOsXjZEM-dvYSNV29NVX2rQQdrELeBGCIfTVzJs4j2fp7zW9Cz");
        --Auth-Shadow-Card: 0 8px 32px rgba(120, 86, 0, 0.04), 0 2px 8px rgba(120, 86, 0, 0.02);

        --Auth-Form-Basis: 55%;
        --Auth-Visual-Basis: 45%;
        --Auth-Panel-Max-Width: 448px;
        --Auth-Visual-Copy-Max-Width: 380px;
        --Auth-Canvas-Padding-Y: 80px;
        --Auth-Canvas-Padding-X: var(--Size-Padding-4XL);
        --Auth-Canvas-Padding-X-Mobile: var(--Size-Padding-XL);
        --Auth-Canvas-Padding-Bottom-Mobile: var(--Size-Padding-4XL);
        --Auth-Back-Offset: var(--Size-Gap-XXXL);
        --Auth-Card-Padding: var(--Size-Padding-XXXL);
        --Auth-Card-Padding-Mobile: var(--Size-Padding-XXL);
        --Auth-Card-Radius: var(--Size-CornerRadius-XS);
        --Auth-Control-Height: 44px;
        --Auth-Control-Padding-X: var(--Size-Padding-XL);
        --Auth-Control-Addon-Padding-X: var(--Size-Padding-4XL);
        --Auth-Control-Radius: var(--Size-CornerRadius-XS);
        --Auth-Border-Width: 1px;
        --Auth-Accent-Border-Width: 2px;
        --Auth-Header-Gap: var(--Size-Gap-4XL);
        --Auth-Brand-Gap: var(--Size-Gap-L);
        --Auth-Brand-Bottom-Gap: var(--Size-Gap-XXL);
        --Auth-Field-Gap: var(--Size-Gap-M);
        --Auth-Form-Gap: var(--Size-Gap-XXL);
        --Auth-Action-Top-Gap: var(--Size-Gap-XL);
        --Auth-Divider-Top-Gap: var(--Size-Gap-XXXL);
        --Auth-Divider-Bottom-Gap: var(--Size-Gap-XXL);
        --Auth-Footer-Top-Gap: var(--Size-Gap-XXXL);
        --Auth-Icon-Gap: var(--Size-Gap-M);
        --Auth-Button-Gap: var(--Size-Gap-L);
        --Auth-Link-Gap: var(--Size-Gap-S);
        --Auth-Visual-Copy-Inset: var(--Size-Gap-4XL);
        --Auth-Visual-Copy-Padding-X: var(--Size-Padding-XL);
        --Auth-Visual-Copy-Padding-Y: var(--Size-Padding-S);
        --Auth-Back-Icon-Size: 14px;
        --Auth-Brand-Icon-Size: 24px;
        --Auth-Control-Icon-Size: 17px;
        --Auth-Link-Icon-Size: 13px;
        --Auth-Google-Icon-Size: var(--Size-Gap-XL);
        --Auth-Icon-Stroke: 1.8;
        --Auth-Back-Nudge: -4px;
        --Auth-Disabled-Opacity: 0.62;
        --Auth-Transition: 160ms ease;
        --Auth-Label-Tracking: 0.1em;
        --Auth-Small-Label-Tracking: 0.12em;
        --Auth-Forgot-Font-Size: 10px;
        --Auth-Forgot-Line-Height: 14px;
        --Auth-Label-Line-Height: 16px;
        --Auth-Control-Line-Height: 28px;
        --Auth-Help-Line-Height: 18px;
        --Auth-Footer-Line-Height: 24px;
        --Auth-Brand-Font-Size: var(--h2-d);
        --Auth-Brand-Line-Height: 40px;
        --Auth-Title-Font-Size: var(--h3-d);
        --Auth-Title-Line-Height: 32px;
        --Auth-Subtitle-Font-Size: var(--body-2-d);
        --Auth-Subtitle-Line-Height: 28px;
        --Auth-Visual-Copy-Font-Size: var(--h3-d);
        --Auth-Visual-Copy-Line-Height: 32px;

        --Sidebar-Width: 256px;
        --Sidebar-Padding-Y: var(--Size-Padding-4XL);
        --Sidebar-Padding-X: var(--Size-Padding-M);
        --Sidebar-Brand-Padding-X: var(--Size-Padding-L);
        --Sidebar-Brand-Gap: var(--Size-Gap-L);
        --Sidebar-Brand-Avatar-Size: 40px;
        --Sidebar-Section-Gap: var(--Size-Gap-XXXL);
        --Sidebar-Item-Height: 40px;
        --Sidebar-Item-Padding-X: var(--Size-Padding-L);
        --Sidebar-Item-Padding-Y: var(--Size-Padding-M);
        --Sidebar-Active-Border-Width: var(--Auth-Accent-Border-Width);
        --Sidebar-Active-Opacity: 0.8;
        --Sidebar-Cta-Hover-Opacity: 0.9;
        --Sidebar-Support-Top-Gap: var(--Size-Gap-S);
        --Sidebar-Mobile-Height: 64px;

        --Dashboard-Content-Max-Width: var(--layout-max);
        --Dashboard-Content-Padding-X: var(--Size-Padding-4XL);
        --Dashboard-Content-Padding-Y: 80px;
        --Dashboard-Header-Bottom-Gap: var(--Size-Gap-4XL);
        --Dashboard-Header-Padding-Bottom: var(--Size-Padding-XXXL);
        --Dashboard-Header-Copy-Max-Width: 672px;
        --Dashboard-Toolbar-Bottom-Gap: var(--Size-Gap-XXXL);
        --Dashboard-Search-Max-Width: 448px;
        --Dashboard-Search-Icon-Offset: var(--Size-Padding-L);
        --Dashboard-Search-Padding-Left: 40px;
        --Dashboard-Row-Padding-Y: var(--Size-Padding-XXXL);
        --Dashboard-Row-Padding-X: var(--Size-Padding-XL);
        --Dashboard-Row-Margin-X: calc(var(--Dashboard-Row-Padding-X) * -1);
        --Dashboard-Date-Column-Width: 128px;
        --Dashboard-Row-Gap: var(--Size-Gap-XXXL);
        --Dashboard-Title-Action-Gap: var(--Size-Gap-XL);
        --Dashboard-Summary-Max-Width: 768px;
        --Dashboard-Avatar-Size: 32px;
        --Dashboard-Avatar-Overlap: -8px;
        --Dashboard-Badge-Font-Size: var(--Auth-Forgot-Font-Size);
        --Dashboard-Badge-Line-Height: var(--Auth-Forgot-Line-Height);
        --Dashboard-Menu-Width: 190px;
        --Dashboard-Delete-Modal-Width: 480px;
        --Dashboard-Empty-State-Min-Height: 280px;
        --Dashboard-Skeleton-Badge-Width: 104px;
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
            radial-gradient(circle at 1px 1px, rgba(120, 86, 0, 0.035) 1px, transparent 0),
            linear-gradient(180deg, #f9f9f7 0%, #f4f4f2 100%);
        background-size: 18px 18px, auto;
        background-attachment: fixed;
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
        background: rgba(247, 189, 72, 0.32);
        color: var(--Color-Text-Bold);
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
        background: rgba(129, 117, 99, 0.35);
        border: 3px solid transparent;
        border-radius: var(--Size-CornerRadius-Full);
        background-clip: content-box;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: rgba(129, 117, 99, 0.55);
        border: 3px solid transparent;
        background-clip: content-box;
    }

    .material-symbols-outlined {
        display: inline-block;
        font-family: "Material Symbols Outlined";
        font-weight: normal;
        font-style: normal;
        font-size: 24px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        -webkit-font-feature-settings: "liga";
        -webkit-font-smoothing: antialiased;
        font-variation-settings: "FILL" 0, "wght" 300, "GRAD" 0, "opsz" 24;
    }

    .fill-icon {
        font-variation-settings: "FILL" 1, "wght" 300, "GRAD" 0, "opsz" 24;
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
