import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
    AudioWaveform,
    HelpCircle,
    LogIn,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings as SettingsIcon,
    X,
} from "lucide-react";
import Avatar from "common/components/Avatar";
import Badge from "common/components/Badge";
import { HOST_VIEWS } from "common/constants";
import { setHostView, logout } from "common/redux/actions/sessionActions";

const Sidebar = styled.aside`
    width: 264px;
    flex-shrink: 0;
    height: 100vh;
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    gap: var(--Size-Gap-XXL);
    background: rgba(255, 255, 255, 0.86);
    border-right: 1px solid var(--Color-Border-Subtle);
    padding: var(--Size-Padding-XXL) var(--Size-Padding-XL);
    backdrop-filter: blur(16px);

    @media (max-width: 1024px) {
        display: none;
    }
`;

const Brand = styled.button`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    width: 100%;
    padding: 0;
    border: none;
    background: transparent;
    text-align: left;
`;

const BrandMark = styled.span`
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--Color-Text-Inverse);
    background: var(--Color-Background-Bold);
    border-radius: var(--Size-CornerRadius-M);
    box-shadow: 0 12px 26px rgba(17, 19, 22, 0.16);
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
    margin-top: 2px;
    font-size: var(--body-5-d);
    font-weight: var(--semi-bold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    color: var(--Color-Text-Subtlest);
`;

const WorkspaceBadge = styled(Badge)`
    width: fit-content;
`;

const NavGroup = styled.div`
    display: grid;
    gap: var(--Size-Gap-S);
`;

const NavLabel = styled.div`
    padding: 0 var(--Size-Padding-L);
    margin-bottom: var(--Size-Gap-S);
    font-size: var(--body-5-d);
    font-weight: var(--bold);
    letter-spacing: var(--letter-spacing-wide);
    text-transform: uppercase;
    color: var(--Color-Text-Subtlest);
`;

const NavItem = styled.button`
    display: flex;
    align-items: center;
    gap: var(--Size-Gap-M);
    width: 100%;
    min-height: 40px;
    padding: 0 var(--Size-Padding-L);
    border: 1px solid ${({ $active }) => ($active ? "var(--Color-Border-Subtle)" : "transparent")};
    border-radius: var(--Size-CornerRadius-M);
    background: ${({ $active }) => ($active ? "var(--Color-Background-Default)" : "transparent")};
    color: ${({ $active }) => ($active ? "var(--Color-Text-Bold)" : "var(--Color-Text-Subtle)")};
    box-shadow: ${({ $active }) => ($active ? "0 1px 2px rgba(17, 19, 22, 0.06)" : "none")};
    font-size: var(--body-3-d);
    font-weight: var(--semi-bold);
    text-align: left;
    transition: all var(--transition-fast);

    svg {
        color: ${({ $active }) => ($active ? "var(--Color-Icon-Action)" : "var(--Color-Icon-Subtle)")};
    }

    &:hover {
        background: var(--Color-Background-Default);
        color: var(--Color-Text-Bold);
        border-color: var(--Color-Border-Subtle);
    }
`;

const Spacer = styled.div`
    flex: 1;
`;

const ProfileArea = styled.div`
    position: relative;
    display: grid;
    gap: var(--Size-Gap-S);
    padding-top: var(--Size-Padding-XL);
    border-top: 1px solid var(--Color-Border-Subtle);
`;

const ProfileButton = styled.button`
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: var(--Size-Gap-M);
    width: 100%;
    padding: var(--Size-Padding-M);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-L);
    background: var(--Color-Background-Default);
    text-align: left;
    transition: all var(--transition-fast);

    &:hover {
        box-shadow: var(--Color-Shadow-Card);
        transform: translateY(-1px);
    }
`;

const ProfileText = styled.div`
    min-width: 0;
`;

const ProfileName = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--Color-Text-Bold);
    font-size: var(--body-3-d);
    font-weight: var(--semi-bold);
`;

const ProfileRole = styled.div`
    margin-top: 1px;
    color: var(--Color-Text-Subtlest);
    font-size: var(--body-5-d);
`;

const ProfileMenu = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(100% + 8px);
    padding: var(--Size-Padding-S);
    border: 1px solid var(--Color-Border-Subtle);
    border-radius: var(--Size-CornerRadius-L);
    background: var(--Color-Background-Default);
    box-shadow: var(--Color-Shadow-1);
`;

const MobileBar = styled.div`
    display: none;

    @media (max-width: 1024px) {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--Size-Padding-M) var(--Size-Padding-XL);
        background: rgba(255, 255, 255, 0.9);
        border-bottom: 1px solid var(--Color-Border-Subtle);
        position: sticky;
        top: 0;
        z-index: 40;
        backdrop-filter: blur(16px);
    }
`;

const MenuButton = styled.button`
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--Color-Border-Default);
    border-radius: var(--Size-CornerRadius-M);
    background: var(--Color-Background-Default);
    color: var(--Color-Icon-Default);
`;

const MobileMenu = styled.div`
    display: grid;
    gap: var(--Size-Gap-S);
    padding: var(--Size-Padding-L) var(--Size-Padding-XL) var(--Size-Padding-XL);
    background: rgba(255, 255, 255, 0.96);
    border-bottom: 1px solid var(--Color-Border-Subtle);
`;

const NAV_ITEMS = [
    { view: HOST_VIEWS.Dashboard, label: "Dashboard", icon: LayoutDashboard },
    { view: HOST_VIEWS.Join, label: "Join Meeting", icon: LogIn },
    { view: HOST_VIEWS.Settings, label: "Settings", icon: SettingsIcon },
];

const NavItems = ({ hostView, onSelect }) => (
    <NavGroup>
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
            <NavItem key={view} type="button" $active={hostView === view} onClick={() => onSelect(view)}>
                <Icon size={18} />
                {label}
            </NavItem>
        ))}
    </NavGroup>
);

const Navbar = () => {
    const dispatch = useDispatch();
    const hostView = useSelector((state) => state.sessionDetails.hostView);
    const user = useSelector((state) => state.sessionDetails.user);
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const displayName = useMemo(() => user?.name || user?.email || "Host", [user]);

    const selectView = (view) => {
        dispatch(setHostView(view));
        setMenuOpen(false);
    };

    const handleLogout = () => dispatch(logout());

    return (
        <>
            <Sidebar>
                <Brand type="button" onClick={() => selectView(HOST_VIEWS.Dashboard)}>
                    <BrandMark>
                        <AudioWaveform size={20} />
                    </BrandMark>
                    <BrandText>
                        <BrandName>MeetAI</BrandName>
                        <BrandTag>Host Workspace</BrandTag>
                    </BrandText>
                </Brand>

                <WorkspaceBadge tone="neutral">Production workspace</WorkspaceBadge>

                <NavGroup>
                    <NavLabel>Navigation</NavLabel>
                    <NavItems hostView={hostView} onSelect={selectView} />
                </NavGroup>

                <Spacer />

                <NavGroup>
                    <NavLabel>Support</NavLabel>
                    <NavItem type="button" onClick={() => window.location.assign("mailto:support@meetai.studio")}>
                        <HelpCircle size={18} />
                        Help
                    </NavItem>
                </NavGroup>

                <ProfileArea>
                    {profileOpen && (
                        <ProfileMenu>
                            <NavItem type="button" onClick={handleLogout} id="sign-out-btn-desktop">
                                <LogOut size={18} />
                                Sign Out
                            </NavItem>
                        </ProfileMenu>
                    )}
                    <ProfileButton type="button" onClick={() => setProfileOpen((value) => !value)} aria-haspopup="menu">
                        <Avatar name={displayName} />
                        <ProfileText>
                            <ProfileName>{displayName}</ProfileName>
                            <ProfileRole>Workspace admin</ProfileRole>
                        </ProfileText>
                    </ProfileButton>
                </ProfileArea>
            </Sidebar>

            <MobileBar>
                <Brand type="button" onClick={() => selectView(HOST_VIEWS.Dashboard)} style={{ width: "auto" }}>
                    <BrandMark style={{ width: 34, height: 34 }}>
                        <AudioWaveform size={16} />
                    </BrandMark>
                    <BrandName>MeetAI</BrandName>
                </Brand>
                <MenuButton type="button" onClick={() => setMenuOpen((value) => !value)} id="mobile-menu-toggle">
                    {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </MenuButton>
            </MobileBar>
            {menuOpen && (
                <MobileMenu>
                    <NavItems hostView={hostView} onSelect={selectView} />
                    <NavItem type="button" onClick={handleLogout} id="sign-out-btn-mobile">
                        <LogOut size={18} />
                        Sign Out
                    </NavItem>
                </MobileMenu>
            )}
        </>
    );
};

export default Navbar;
