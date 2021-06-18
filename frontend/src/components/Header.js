import React, { useState, useContext } from "react";
import { useHistory, useLocation, Switch, Route } from "react-router-dom";
import api from "../api";

import ApiSearch from "./post/PostApiSearch";
import { AuthContext } from "../context/auth";

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
	NavItem,
} from "reactstrap";

function Header() {
	const context = useContext(AuthContext);
	const history = useHistory();
	const { pathname } = useLocation();

	const [isOpen, setIsOpen] = useState(false);

	const toggle = () => setIsOpen(!isOpen);

	async function logOut() {
		const res = await api.get("user/logout");
		context.logout(res.data);
	}

	function changePassword() {
		logOut();
		history.push("/forgotPassword");
	}

	let Brand;
	if (pathname.includes("/mywork")) {
		Brand = <NavbarBrand href="/mywork">eNástenka</NavbarBrand>;
	} else if (pathname.includes("/mygrants")) {
		Brand = <NavbarBrand href="/mygrants">Moje Granty</NavbarBrand>;
	} else if (pathname.includes("/posts")) {
		Brand = <NavbarBrand href="/posts">Nástenka</NavbarBrand>;
	} else {
		Brand = (
			<NavbarBrand href="/">
				FLAW<span className="pink">IS</span>
			</NavbarBrand>
		);
	}

	return (
		<Navbar color="dark" dark expand="md" className="sticky-top">
			{Brand}
			<NavbarToggler onClick={toggle} />
			<Collapse isOpen={isOpen} navbar>
				{context.user ? (
					<>
						{(context.user.role === "supervisor" ||
							context.user.role === "admin") && (
							<Nav className="mr-auto" navbar>
								<UncontrolledDropdown nav inNavbar>
									<DropdownToggle nav caret>
										Zdroje
									</DropdownToggle>
									<DropdownMenu>
										<DropdownItem onClick={() => history.push("/users")}>
											Používatelia
										</DropdownItem>
										<DropdownItem onClick={() => history.push("/grants")}>
											Granty
										</DropdownItem>
									</DropdownMenu>
								</UncontrolledDropdown>
								<NavItem>
									<Switch>
										<Route path="/posts">
											<ApiSearch />
										</Route>
										<Route exact path="/grants">
											<Input
												type="text"
												placeholder="Vyhľadávanie"
												name="search"
												value={context.search}
												onChange={(e) => context.setSearch(e.target.value)}
												autoComplete="off"
												className="mx-md-1"
											/>
										</Route>
										<Route path="/mygrants">
											<Input
												type="text"
												placeholder="Vyhľadávanie"
												name="search"
												value={context.search}
												onChange={(e) => context.setSearch(e.target.value)}
												autoComplete="off"
												className="mx-md-1"
											/>
										</Route>
										<Route exact path="/users">
											<Input
												type="text"
												placeholder="Vyhľadávanie"
												name="search"
												value={context.search}
												onChange={(e) => context.setSearch(e.target.value)}
												autoComplete="off"
												className="mx-md-1"
											/>
										</Route>
									</Switch>
								</NavItem>
							</Nav>
						)}
						<Nav className="ml-auto" navbar>
							<UncontrolledDropdown nav inNavbar>
								<DropdownToggle nav caret>
									Prihlásený {context.user.fullName}
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
