import React, { useState, useEffect, useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";
import api from "../api";

import { useUser } from '../hooks/useUser';

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
  Input
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
    const res = await api.post("user/logoutall", {}, {
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
                <UncontrolledButtonDropdown  inNavbar>
                  <DropdownToggle nav caret>
                    Zdroje
                  </DropdownToggle>
                  <DropdownMenu down="true">
                    <DropdownItem onClick={() => history.push("/users")}>
                      Používatelia
                    </DropdownItem>
                    <DropdownItem onClick={() => history.push("/grants")}>
                      Granty
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledButtonDropdown>
                <Input 
                  placeholder="Vyhľadávanie"
                  name="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoComplete="off"
                  className="mx-md-1"
                />
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
                  <UncontrolledButtonDropdown nav inNavbar>
                    <DropdownToggle nav caret>
                      Prihlásený {user.firstName + ' ' + user.lastName}
                    </DropdownToggle>
                    <DropdownMenu down="true">
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
                  </UncontrolledButtonDropdown>
                </Nav>
              </>
            ) 
              : 
            (
              <Nav className="ml-auto" navbar>
                <Button color="success" className="mx-md-2 my-2 my-md-0" onClick={login}>Prihlásiť sa</Button>
                <Button  onClick={register}>Registrácia</Button>
              </Nav>
            )
          } 
        </Collapse>
      </Navbar>
  );
}

export default Header;