import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { AudioWaveform, LayoutDashboard, Mic, Settings as SettingsIcon, LogOut, HelpCircle, Menu, X } from "lucide-react";
import { HOST_VIEWS } from "common/constants";
import { setHostView, logout } from "common/redux/actions/sessionActions";

const Sidebar = styled.aside`
    width: 240px;
    flex-shrink: 0;
    height: 100vh;
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    background: var(--Color-Background-Subtle-2);
    border-right: 1px solid var(--Color-Border-Subtle);
    padding: var(--Size-Padding-XXL) var(--Size-Padding-XL);

    @media (max-width: 1024px) {
        display: none;
    }
`;

const Brand = styled.div`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    margin-bottom: var(--Size-Gap-XXXL);
`;

const BrandMark = styled.div`
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--Color-Text-Inverse);
    background: var(--Color-Background-Action);
    border-radius: var(--Size-CornerRadius-L);
`;

const BrandText = styled.div`
    line-height: 1.2;
`;

const BrandName = styled.div`
    font-family: var(--heading-font);
    font-weight: var(--bold);
    font-size: var(--body-2-d);
    color: var(--Color-Text-Bold);
`;

const BrandTag = styled.div`
    font-size: var(--body-5-d);
    font-weight: var(--bold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    color: var(--Color-Text-Subtlest);
`;

const NavList = styled.nav`
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-S);
`;

const NavItem = styled.button`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    padding: var(--Size-Padding-M) var(--Size-Padding-L);
    border: none;
    border-radius: var(--Size-CornerRadius-M);
    background: ${({ active }) => (active ? "var(--Color-Background-Accent-Action)" : "transparent")};
    color: ${({ active }) => (active ? "var(--Color-Text-Action)" : "var(--Color-Text-Subtle)")};
    font-size: var(--body-3-d);
    font-weight: var(--semi-bold);
    text-align: left;
    transition: all 0.15s ease;

    &:hover {
        background: var(--Color-Background-Accent-Action);
        color: var(--Color-Text-Action);
    }
`;

const Spacer = styled.div`
    flex: 1;
`;

const Footer = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-S);
    padding-top: var(--Size-Padding-XL);
    border-top: 1px solid var(--Color-Border-Subtle);
`;

// Only visible under 1024px, where the fixed Sidebar hides itself — without
// this, navigation (including Sign Out) would be completely unreachable on
// narrow viewports.
const MobileBar = styled.div`
    display: none;

    @media (max-width: 1024px) {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--Size-Padding-M) var(--Size-Padding-XL);
        background: var(--Color-Background-Subtle-2);
        border-bottom: 1px solid var(--Color-Border-Subtle);
        position: sticky;
        top: 0;
        z-index: 40;
    }
`;

const MenuButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--Size-Padding-S);
    border: none;
    border-radius: var(--Size-CornerRadius-M);
    background: transparent;
    color: var(--Color-Icon-Default);
`;

const MobileMenu = styled.div`
    display: flex;
    flex-direction: column;
    padding: var(--Size-Padding-L) var(--Size-Padding-XL) var(--Size-Padding-XL);
    background: var(--Color-Background-Subtle-2);
    border-bottom: 1px solid var(--Color-Border-Subtle);
    gap: var(--Size-Gap-S);
`;

const NAV_ITEMS = [
    { view: HOST_VIEWS.Dashboard, label: "Dashboard", icon: LayoutDashboard },
    { view: HOST_VIEWS.Record, label: "Record", icon: Mic },
    { view: HOST_VIEWS.Settings, label: "Settings", icon: SettingsIcon },
];

const NavItems = ({ hostView, onSelect }) => (
    <NavList>
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
            <NavItem key={view} type="button" active={hostView === view} onClick={() => onSelect(view)}>
                <Icon size={18} />
                {label}
            </NavItem>
        ))}
    </NavList>
);

// Persistent left sidebar on wide viewports; a top bar + dropdown menu on
// narrow ones (mobile, or DevTools eating half the window) so navigation and
// Sign Out are never completely unreachable.
const Navbar = () => {
    const dispatch = useDispatch();
    const hostView = useSelector((state) => state.sessionDetails.hostView);
    const [menuOpen, setMenuOpen] = useState(false);

    const selectView = (view) => {
        dispatch(setHostView(view));
        setMenuOpen(false);
    };

    return (
        <>
            <Sidebar>
                <Brand>
                    <BrandMark>
                        <AudioWaveform size={20} />
                    </BrandMark>
                    <BrandText>
                        <BrandName>MeetAI</BrandName>
                        <BrandTag>Host Workspace</BrandTag>
                    </BrandText>
                </Brand>

                <NavItems hostView={hostView} onSelect={selectView} />

                <Spacer />

                <Footer>
                    <NavItem type="button">
                        <HelpCircle size={18} />
                        Help
                    </NavItem>
                    <NavItem type="button" onClick={() => dispatch(logout())} id="sign-out-btn-desktop">
                        <LogOut size={18} />
                        Sign Out
                    </NavItem>
                </Footer>
            </Sidebar>

            <MobileBar>
                <Brand style={{ marginBottom: 0 }}>
                    <BrandMark style={{ width: 32, height: 32 }}>
                        <AudioWaveform size={16} />
                    </BrandMark>
                    <BrandName>MeetAI</BrandName>
                </Brand>
                <MenuButton type="button" onClick={() => setMenuOpen((v) => !v)} id="mobile-menu-toggle">
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </MenuButton>
            </MobileBar>
            {menuOpen && (
                <MobileMenu>
                    <NavItems hostView={hostView} onSelect={selectView} />
                    <NavItem type="button" onClick={() => dispatch(logout())} id="sign-out-btn-mobile">
                        <LogOut size={18} />
                        Sign Out
                    </NavItem>
                </MobileMenu>
            )}
        </>
    );
};

export default Navbar;
