import React from "react";
import {
	Container,
	Col,
	Fade,
	Card,
	CardDeck,
	CardTitle,
	CardText,
	Table,
	Nav,
	NavItem,
	NavLink,
	TabContent,
	TabPane,
	Button,
	ButtonGroup,
	Label,
	Input,
	FormGroup,
} from "reactstrap";

import { IDtoName } from "../../util/helperFunctions";
import { useUser } from "../../hooks/useUser";

function Budget(props) {
	const { user } = useUser();
	const { setModal, grant } = props;
	const [fadeIn, setFadeIn] = React.useState(true);

	function tabNav(year) {
		setActiveTab(year);
		setFadeIn(false);
		setFadeIn(true);
	}

	const [activeTab, setActiveTab] = React.useState(
		new Date(props.budget[0].year).getFullYear()
	);

	React.useEffect(() => {
		const selectedBudget = props.budget.filter(
			(budget) =>
				new Date(budget.year).getFullYear() === new Date().getFullYear()
		);
		if (selectedBudget.length > 0) {
			setActiveTab(new Date(selectedBudget[0].year).getFullYear());
		}
	}, []);

	return (
		<Container className="my-5">
			<h2 className="my-3">Rozpočet & Riešitelia:</h2>
			<Nav tabs>
				{props.budget.map((budget) => {
					const budgetYear = new Date(budget.year).getFullYear();

					return (
						<NavItem key={budgetYear}>
							<NavLink
								className={activeTab === budgetYear ? "active" : ""}
								onClick={() => tabNav(budgetYear)}
							>
								{new Date(budget.year).getFullYear()}
							</NavLink>
						</NavItem>
					);
				})}
			</Nav>
			<TabContent activeTab={activeTab} className="my-3">
				{props.budget.map((budget) => {
					const budgetYear = new Date(budget.year).getFullYear();
					const currentYear = new Date().getFullYear();

					return (
						<TabPane tabId={budgetYear} key={budgetYear}>
							<Fade in={fadeIn}>
								<CardDeck>
									<Card
										body
										inverse={budgetYear === currentYear ? true : false}
										outline={budgetYear !== currentYear ? true : false}
										color="primary"
										className="text-center"
									>
										<CardTitle>Cestovné</CardTitle>
										<CardText className="font-weight-bold">
											{budget.travel + " €"}
										</CardText>
									</Card>
									<Card
										body
										inverse={budgetYear === currentYear ? true : false}
										outline={budgetYear !== currentYear ? true : false}
										color="primary"
										className="text-center"
									>
										<CardTitle>Služby</CardTitle>
										<CardText className="font-weight-bold">
											{budget.services + " €"}
										</CardText>
									</Card>
									<Card
										body
										inverse={budgetYear === currentYear ? true : false}
										outline={budgetYear !== currentYear ? true : false}
										color="primary"
										className="text-center"
									>
										<CardTitle>Materiál</CardTitle>
										<CardText className="font-weight-bold">
											{budget.material + " €"}
										</CardText>
									</Card>
									<Card
										body
										inverse={budgetYear === currentYear ? true : false}
										outline={budgetYear !== currentYear ? true : false}
										color="primary"
										className="text-center"
									>
										<CardTitle>Nepriame</CardTitle>
										<CardText className="font-weight-bold">
											{budget.indirect ? budget.indirect + " €" : "0 €"}
										</CardText>
									</Card>
									<Card
										body
										inverse={budgetYear === currentYear ? true : false}
										outline={budgetYear !== currentYear ? true : false}
										color="primary"
										className="text-center"
									>
										<CardTitle>Mzdy</CardTitle>
										<CardText className="font-weight-bold">
											{budget.salaries ? budget.salaries + " €" : "0 €"}
										</CardText>
									</Card>
								</CardDeck>
								{user.role !== "basic" && !props.checkout && (
									<FormGroup className="my-2" row>
										<Label sm={2} for={`${budgetYear}budgetCreated`}>
											Vytvorený:
										</Label>
										<Col sm={2}>
											<Input
												id={`${budgetYear}budgetCreated`}
												plaintext
												readOnly
												value={new Date(budget.createdAt).toLocaleString()}
											/>
										</Col>
										<Label sm={2} for={`${budgetYear}budgetModiffied`}>
											Upravený:
										</Label>
										<Col sm={2}>
											<Input
												id={`${budgetYear}budgetModiffied`}
												plaintext
												readOnly
												value={new Date(budget.updatedAt).toLocaleString()}
											/>
										</Col>
										<Col sm={4}>
											<Button
												className="float-sm-right"
												color="warning"
												onClick={() =>
													setModal({
														show: true,
														data: budget,
														grant: grant,
														action: "editBudget",
													})
												}
											>
												Upraviť budget {budgetYear}
											</Button>
										</Col>
									</FormGroup>
								)}
								<FormGroup row className="justify-content-between mt-5">
									<Col>
										<h3>Riešitelia v {budgetYear}:</h3>
									</Col>
									{user.role !== "basic" && !props.checkout && (
										<Col>
											<Button
												className="float-sm-right"
												outline
												color="success"
												onClick={() =>
													setModal({
														show: true,
														data: budget,
														grant: grant,
														action: "addMember",
													})
												}
											>
												Nový riešiteľ
											</Button>
										</Col>
									)}
								</FormGroup>
								<Table responsive hover>
									<thead>
										<tr>
											<th>#</th>
											<th>Meno</th>
											<th>Rola</th>
											<th>Hodiny</th>
											<th>Vytvorený</th>
											<th>Upravený</th>
											{user.role !== "basic" && !props.checkout && (
												<th>Akcia</th>
											)}
										</tr>
									</thead>
									<tbody>
										{props.users.length !== 0 &&
											budget.members.map((member, i) => {
												const created = new Date(
													member.createdAt
												).toLocaleString();
												const updated = new Date(
													member.updatedAt
												).toLocaleString();
												let role = "";
												switch (member.role) {
													case "basic":
														role = "Riešiteľ";
														break;
													case "deputy":
														role = "Zástupca";
														break;
													case "leader":
														role = "Hlavný";
														break;
												}

												return (
													<tr
														className={member.active && "table-success"}
														key={i}
													>
														<td>{i}</td>
														<td>
															{member.member
																? member.member.fullName ||
																  IDtoName(member.member, props.users)
																: "Používateľ bol zmazaný"}
														</td>
														<td>{role}</td>
														<td>{member.hours}</td>
														<td>
															{created !== "Invalid Date"
																? created
																: new Date().toLocaleString()}
														</td>
														<td>
															{updated !== "Invalid Date"
																? updated
																: new Date().toLocaleString()}
														</td>
														{user.role !== "basic" && !props.checkout && (
															<td>
																<ButtonGroup>
																	<Button
																		color="warning"
																		onClick={() =>
																			setModal({
																				show: true,
																				data: member,
																				grant: grant,
																				budget: budget,
																				action: "editMember",
																			})
																		}
																	>
																		Upraviť
																	</Button>
																	<Button
																		color="danger"
																		onClick={() =>
																			setModal({
																				show: true,
																				data: member,
																				grant: grant,
																				budget: budget,
																				action: "deleteMember",
																			})
																		}
																	>
																		Odobrať
																	</Button>
																</ButtonGroup>
															</td>
														)}
													</tr>
												);
											})}
									</tbody>
								</Table>
							</Fade>
						</TabPane>
					);
				})}
			</TabContent>
		</Container>
	);
}

export default Budget;
