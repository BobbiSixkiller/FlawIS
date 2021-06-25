import React, { useState, useContext } from "react";
import { useHistory, Switch, Route } from "react-router-dom";
import api from "../api";

import PostApiSearch from "./post/PostApiSearch";
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

	const [isOpen, setIsOpen] = useState(false);

	const toggle = () => setIsOpen(!isOpen);

	async function logOut() {
		const res = await api.get("user/logout");
		context.logout(res.data);
		history.push("/");
	}

	function changePassword() {
		logOut();
		history.push("/forgotPassword");
	}

	return (
		<Navbar color="dark" dark expand="md" className="sticky-top">
			<NavbarBrand href="/">
				FLAW<span className="pink">IS</span>
			</NavbarBrand>
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
									</DropdownMenu>
								</UncontrolledDropdown>
								<NavItem>
									<Switch>
										<Route path="/dashboard/posts">
											<PostApiSearch />
										</Route>
										<Route exact path="/dashboard/grants">
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
										<Route path="/dashboard/mygrants">
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
										<Route exact path="/dashboard/users">
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
