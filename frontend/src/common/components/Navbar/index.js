import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
    CircleUserRound,
    HelpCircle,
    LayoutDashboard,
    LogOut,
    Menu,
    Plus,
    Settings as SettingsIcon,
    Video,
    X,
} from "lucide-react";
import BrandLogo from "common/components/BrandLogo";
import { HOST_VIEWS, UI_EVENTS } from "common/constants";
import { setHostView, logout } from "common/redux/actions/sessionActions";
import { Breakpoints } from "GlobalStyle";

const Sidebar = styled.aside`
    width: var(--Sidebar-Width);
    flex-shrink: 0;
    height: 100vh;
    position: sticky;
    top: 0;
    z-index: 40;
    background: var(--Color-Background-Subtle);
    border-right: var(--Auth-Border-Width) solid var(--Color-Border-Default);

    @media (max-width: ${Breakpoints.laptop}px) {
        display: none;
    }
`;

const SidebarInner = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: var(--Sidebar-Padding-Y) var(--Sidebar-Padding-X);
`;

const Brand = styled.button`
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0 var(--Sidebar-Brand-Padding-X);
    margin-bottom: var(--Sidebar-Section-Gap);
    border: 0;
    background: transparent;
    text-align: left;
`;

const CtaWrap = styled.div`
    padding: 0 var(--Sidebar-Brand-Padding-X);
    margin-bottom: var(--Sidebar-Section-Gap);
`;

const NewMeetingButton = styled.button`
    width: 100%;
    height: var(--Auth-Control-Height);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--Auth-Icon-Gap);
    padding: 0 var(--Auth-Control-Padding-X);
    border: 0;
    border-radius: var(--Auth-Control-Radius);
    background: var(--Color-Background-Action);
    color: var(--Color-Text-Inverse);
    font-family: var(--body-font);
    font-size: var(--body-3-d);
    line-height: var(--Auth-Footer-Line-Height);
    font-weight: var(--regular);
    transition: opacity var(--Auth-Transition);

    &:hover {
        opacity: var(--Sidebar-Cta-Hover-Opacity);
    }

    svg {
        width: var(--Auth-Control-Icon-Size);
        height: var(--Auth-Control-Icon-Size);
        fill: currentColor;
    }
`;

const Nav = styled.nav`
    display: grid;
    gap: var(--Size-Gap-S);
`;

const NavItem = styled.button`
    width: 100%;
    min-height: var(--Sidebar-Item-Height);
    display: flex;
    align-items: center;
    gap: var(--Sidebar-Brand-Gap);
    padding: var(--Sidebar-Item-Padding-Y) var(--Sidebar-Item-Padding-X);
    border: 0;
    border-right: var(--Sidebar-Active-Border-Width) solid
        ${({ $active }) => ($active ? "var(--Color-Background-Action)" : "transparent")};
    border-radius: var(--Auth-Control-Radius);
    background: ${({ $active }) => ($active ? "var(--Color-Background-Subtle-3)" : "transparent")};
    color: ${({ $active }) => ($active ? "var(--Color-Text-Action)" : "var(--Color-Text-Secondary)")};
    font-family: var(--mono-font);
    font-size: var(--body-4-d);
    line-height: var(--Auth-Label-Line-Height);
    font-weight: ${({ $active }) => ($active ? "var(--bold)" : "var(--medium)")};
    letter-spacing: var(--Auth-Label-Tracking);
    text-transform: uppercase;
    text-align: left;
    opacity: ${({ $active }) => ($active ? "var(--Sidebar-Active-Opacity)" : "1")};
    transition:
        background var(--Auth-Transition),
        color var(--Auth-Transition),
        border-color var(--Auth-Transition);

    &:hover {
        background: var(--Color-Background-Subtle-3);
        color: var(--Color-Text-Action);
    }

    svg {
        width: var(--Auth-Brand-Icon-Size);
        height: var(--Auth-Brand-Icon-Size);
        flex-shrink: 0;
        stroke-width: var(--Auth-Icon-Stroke);
    }
`;

const FooterNav = styled.div`
    margin-top: auto;
    padding-top: var(--Size-Padding-XL);
    border-top: var(--Auth-Border-Width) solid var(--Color-Border-Default);
    position: relative;
`;

const SupportNav = styled(Nav)`
    margin-top: var(--Sidebar-Support-Top-Gap);
`;

const ProfileMenu = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(100% + var(--Size-Gap-M));
    padding: var(--Size-Padding-S);
    border: var(--Auth-Border-Width) solid var(--Color-Border-Default);
    border-radius: var(--Auth-Control-Radius);
    background: var(--Color-Background-Default);
    box-shadow: var(--Color-Shadow-1);
`;

const MobileBar = styled.div`
    display: none;

    @media (max-width: ${Breakpoints.laptop}px) {
        min-height: var(--Sidebar-Mobile-Height);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--Size-Padding-M) var(--Size-Padding-XL);
        background: var(--Color-Background-Subtle);
        border-bottom: var(--Auth-Border-Width) solid var(--Color-Border-Default);
        position: sticky;
        top: 0;
        z-index: 40;
    }
`;

const MobileBrand = styled.button`
    display: inline-flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--Color-Text-Action);
`;

const MenuButton = styled.button`
    width: var(--Auth-Control-Height);
    height: var(--Auth-Control-Height);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: var(--Auth-Border-Width) solid var(--Color-Border-Default);
    border-radius: var(--Auth-Control-Radius);
    background: var(--Color-Background-Default);
    color: var(--Color-Icon-Default);
`;

const MobileMenu = styled.div`
    display: grid;
    gap: var(--Size-Gap-S);
    padding: var(--Size-Padding-L) var(--Size-Padding-XL) var(--Size-Padding-XL);
    background: var(--Color-Background-Default);
    border-bottom: var(--Auth-Border-Width) solid var(--Color-Border-Default);
`;

const NAV_ITEMS = [
    { view: HOST_VIEWS.Dashboard, label: "Dashboard", icon: LayoutDashboard },
    { view: HOST_VIEWS.Join, label: "Join Meeting", icon: Video },
    { view: HOST_VIEWS.Settings, label: "Settings", icon: SettingsIcon },
];

const NavItems = ({ hostView, onSelect }) => (
    <Nav>
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
            <NavItem key={view} type="button" $active={hostView === view} onClick={() => onSelect(view)}>
                <Icon aria-hidden="true" />
                {label}
            </NavItem>
        ))}
    </Nav>
);

const Navbar = () => {
    const dispatch = useDispatch();
    const hostView = useSelector((state) => state.sessionDetails.hostView);
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const selectView = (view) => {
        dispatch(setHostView(view));
        setMenuOpen(false);
    };

    const requestNewMeeting = () => {
        selectView(HOST_VIEWS.Dashboard);
        window.setTimeout(() => {
            window.dispatchEvent(new CustomEvent(UI_EVENTS.OpenNewMeeting));
        }, 0);
    };

    const handleLogout = () => dispatch(logout());

    return (
        <>
            <Sidebar>
                <SidebarInner>
                    <Brand type="button" onClick={() => selectView(HOST_VIEWS.Dashboard)}>
                        <BrandLogo width="214px" maxHeight="60px" />
                    </Brand>

                    <CtaWrap>
                        <NewMeetingButton type="button" onClick={requestNewMeeting}>
                            <Plus aria-hidden="true" />
                            New Meeting
                        </NewMeetingButton>
                    </CtaWrap>

                    <NavItems hostView={hostView} onSelect={selectView} />

                    <SupportNav>
                        <NavItem
                            type="button"
                            onClick={() => window.location.assign("mailto:support@echodesk.ai")}
                        >
                            <HelpCircle aria-hidden="true" />
                            Help
                        </NavItem>
                    </SupportNav>

                    <FooterNav>
                        {profileOpen && (
                            <ProfileMenu>
                                <NavItem type="button" onClick={handleLogout} id="sign-out-btn-desktop">
                                    <LogOut aria-hidden="true" />
                                    Sign Out
                                </NavItem>
                            </ProfileMenu>
                        )}
                        <NavItem type="button" onClick={() => setProfileOpen((value) => !value)} aria-haspopup="menu">
                            <CircleUserRound aria-hidden="true" />
                            Profile
                        </NavItem>
                    </FooterNav>
                </SidebarInner>
            </Sidebar>

            <MobileBar>
                <MobileBrand type="button" onClick={() => selectView(HOST_VIEWS.Dashboard)}>
                    <BrandLogo width="156px" maxHeight="42px" />
                </MobileBrand>
                <MenuButton type="button" onClick={() => setMenuOpen((value) => !value)} id="mobile-menu-toggle">
                    {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </MenuButton>
            </MobileBar>
            {menuOpen && (
                <MobileMenu>
                    <NewMeetingButton type="button" onClick={requestNewMeeting}>
                        <Plus aria-hidden="true" />
                        New Meeting
                    </NewMeetingButton>
                    <NavItems hostView={hostView} onSelect={selectView} />
                    <NavItem type="button" onClick={handleLogout} id="sign-out-btn-mobile">
                        <LogOut aria-hidden="true" />
                        Sign Out
                    </NavItem>
                </MobileMenu>
            )}
        </>
    );
};

export default Navbar;
