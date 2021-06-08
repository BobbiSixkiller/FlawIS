import React, { useState } from "react";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
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
		Brand = <NavbarBrand href="/">FlawIS</NavbarBrand>;
	}

	let Search;
	if (pathname.includes("/posts")) {
		Search = <ApiSearch />;
	} else if (pathname.includes("/grants")) {
		Search = (
			<Input
				type="text"
				placeholder="Vyhľadávanie"
				name="search"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				autoComplete="off"
				className="mx-md-1"
			/>
		);
	} else if (pathname.includes("/users")) {
		Search = (
			<Input
				type="text"
				placeholder="Vyhľadávanie"
				name="search"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				autoComplete="off"
				className="mx-md-1"
			/>
		);
	} else if (pathname.includes("/mygrants")) {
		Search = (
			<Input
				type="text"
				placeholder="Vyhľadávanie"
				name="search"
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				autoComplete="off"
				className="mx-md-1"
			/>
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
				<NavItem>{Search}</NavItem>
			</Nav>
		);
	} else {
		leftNav = (
			<Nav className="mr-auto" navbar>
				<NavItem>{Search}</NavItem>
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
