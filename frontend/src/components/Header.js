import React, { useState, useContext } from "react";
import { useHistory, Switch, Route } from "react-router-dom";

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
  NavItem,
} from "reactstrap";

import { AuthContext } from "../context/auth";

import PostApiSearch from "./post/PostApiSearch";
import UserApiSearch from "./user/UserApiSearch";
import GrantApiSearch from "./grant/GrantApiSearch";
import AnnouncementApiSearch from "./announcement/AnnouncementApiSearch";

function Header() {
  const auth = useContext(AuthContext);
  const history = useHistory();

  const [isOpen, setIsOpen] = useState(false);

  async function logOut() {
    auth.logout();
    history.push("/");
  }

  function changePassword() {
    logOut();
    history.push("/forgotPassword");
  }

  let search;
  if (auth.user && auth.user.role === "basic") {
    search = (
      <NavItem>
        <Route path="/dashboard/posts">
          <PostApiSearch />
        </Route>
      </NavItem>
    );
  } else {
    search = (
      <NavItem>
        <Switch>
          <Route path="/dashboard/announcements">
            <AnnouncementApiSearch />
          </Route>
          <Route path="/dashboard/posts">
            <PostApiSearch />
          </Route>
          <Route path="/dashboard/grants">
            <GrantApiSearch />
          </Route>
          <Route path="/dashboard/users">
            <UserApiSearch />
          </Route>
        </Switch>
      </NavItem>
    );
  }

  return (
    <Navbar color="dark" dark expand="md" className="sticky-top">
      <NavbarBrand href="/">
        FLAW<span className="pink">IS</span>
      </NavbarBrand>
      <NavbarToggler onClick={() => setIsOpen(!isOpen)} />
      <Collapse isOpen={isOpen} navbar>
        {auth.user ? (
          <>
            <Nav className="mr-auto" navbar>
              {(auth.user.role === "supervisor" ||
                auth.user.role === "admin") && (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    Zdroje
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      onClick={() => history.push("/dashboard/users")}
                    >
                      Používatelia
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => history.push("/dashboard/grants")}
                    >
                      Granty
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => history.push("/dashboard/announcements")}
                    >
                      Oznamy
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}
              {search}
            </Nav>
            <Nav className="ml-auto" navbar>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Prihlásený {auth.user.fullName}
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
                  <DropdownItem onClick={logOut}>Odhlásiť</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </>
        ) : (
          <Nav className="ml-auto" navbar>
            <NavItem className="mx-md-2 my-2 my-md-0">
              <Button
                block
                color="success"
                onClick={() => history.push("/login")}
              >
                Prihlásiť sa
              </Button>
            </NavItem>
            <NavItem>
              <Button block onClick={() => history.push("/register")}>
                Registrácia
              </Button>
            </NavItem>
          </Nav>
        )}
      </Collapse>
    </Navbar>
  );
}

export default Header;
