import React, { useState } from "react";
import { useHistory, useLocation, Switch, Route } from "react-router-dom";
import api from "../api";

import { useUser } from "../hooks/useUser";
import ApiSearch from "./post/PostApiSearch";

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
	const history = useHistory();
	const { pathname } = useLocation();

	const { user, setAccessToken, accessToken, setSearch, search } = useUser();
	const [isOpen, setIsOpen] = useState(false);

	const toggle = () => setIsOpen(!isOpen);

	async function logOut() {
		await api
			.post(
				"user/logout",
				{},
				{
					headers: {
						authorization: accessToken,
					},
				}
			)
			.then(() => {
				setAccessToken(null);
				history.push("/");
			});
	}

	async function logOutAll() {
		await api
			.post(
				"user/logoutall",
				{},
				{
					headers: {
						authorization: accessToken,
					},
				}
			)
			.then(() => {
				setAccessToken(null);
				history.push("/");
			});
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

	let leftNav;
	if (user.role === "supervisor" || user.role === "admin") {
		leftNav = (
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
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								autoComplete="off"
								className="mx-md-1"
							/>
						</Route>
						<Route path="/mygrants">
							<Input
								type="text"
								placeholder="Vyhľadávanie"
								name="search"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								autoComplete="off"
								className="mx-md-1"
							/>
						</Route>
						<Route exact path="/users">
							<Input
								type="text"
								placeholder="Vyhľadávanie"
								name="search"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								autoComplete="off"
								className="mx-md-1"
							/>
						</Route>
					</Switch>
				</NavItem>
			</Nav>
		);
	}

	return (
		<Navbar color="dark" dark expand="md" className="sticky-top">
			{Brand}
			<NavbarToggler onClick={toggle} />
			<Collapse isOpen={isOpen} navbar>
				{user._id ? (
					<>
						{leftNav}
						<Nav className="ml-auto" navbar>
							<UncontrolledDropdown nav inNavbar>
								<DropdownToggle nav caret>
									Prihlásený {user.firstName + " " + user.lastName}
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
									<DropdownItem onClick={logOutAll}>
										Odhlásiť všetky
									</DropdownItem>
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
