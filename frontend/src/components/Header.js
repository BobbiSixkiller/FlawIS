import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import api from "../api";

import { useUser } from '../hooks/useUser';

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
  Input,
  NavItem
} from 'reactstrap';

function Header() {
  const history = useHistory();
  const location = useLocation();

  const { user, setAccessToken, accessToken, search, setSearch } = useUser();
  const [ isOpen, setIsOpen ] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  //authentication handlers
  const register = () => history.push("/register");
  const login = () => history.push("/login");

  async function logOut() {
    await api.post("user/logout", {}, {
      headers: {
        authToken: accessToken
      }
    }).then(() => {
      setAccessToken(null);
    });   
  }

  async function logOutAll() {
    await api.post("user/logoutall", {}, {
      headers: {
        authToken: accessToken
      }
    }).then(() => {
      setAccessToken(null);
    });  
  }

  function changePassword() {
    logOut();
    history.push("/forgotPassword");
  }

  let Brand;
  if (location.pathname.includes("/mywork")) {
    Brand = <NavbarBrand href="/mywork">eNástenka</NavbarBrand>;
  } else if (location.pathname.includes("/mygrants")) {
    Brand = <NavbarBrand href="/mygrants">eGranty</NavbarBrand>; 
  } else {
    Brand = <NavbarBrand href="/">FlawIS</NavbarBrand>;
  }
  
  let adminNav;
  if (user.role === "supervisor" || user.role === "admin") {
    adminNav = <Nav className="mr-auto" navbar>
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    Zdroje
                  </DropdownToggle>
                  <DropdownMenu down>
                    <DropdownItem onClick={() => history.push("/users")}>
                      Používatelia
                    </DropdownItem>
                    <DropdownItem onClick={() => history.push("/grants")}>
                      Granty
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown >
                <NavItem>
                  <Input 
                    placeholder="Vyhľadávanie"
                    name="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoComplete="off"
                    className="mx-md-1"
                  />
                </NavItem>
              </Nav>
  } 

  return (
    <Navbar color="dark" dark expand="md" className="sticky-top">
        { Brand }
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar> 
          {user._id ? 
            (
              <>
                { adminNav }
                <Nav className="ml-auto" navbar>
                  <UncontrolledDropdown  nav inNavbar>
                    <DropdownToggle nav caret>
                      Prihlásený {user.firstName + ' ' + user.lastName}
                    </DropdownToggle>
                    <DropdownMenu right>
                      {/* dorobit upravit profil 
                      <DropdownItem>
                        Upraviť údaje
                      </DropdownItem> */}
                      <DropdownItem onClick={changePassword}>
                        Zmena hesla
                      </DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem onClick={logOut}>
                        Odhlásiť
                      </DropdownItem>
                      <DropdownItem onClick={logOutAll}>
                        Odhlásiť všetky
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown >
                </Nav>
              </>
            ) 
              : 
            (
              <Nav className="ml-auto" navbar>
                <NavItem className="mx-md-2 my-2 my-md-0">
                  <Button block color="success" onClick={login}>Prihlásiť sa</Button>
                </NavItem>
                <NavItem>
                  <Button block onClick={register}>Registrácia</Button>  
                </NavItem>
              </Nav>
            )
          } 
        </Collapse>
      </Navbar>
  );
}

export default Header;