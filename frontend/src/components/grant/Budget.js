import React, { useContext, useState, useEffect } from "react";
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
import { Trash2Fill, PencilFill } from "react-bootstrap-icons";

import { AuthContext } from "../../context/auth";

function Budget({ dispatch, grantId, budget, isCheckout }) {
  const { user } = useContext(AuthContext);
  const [fadeIn, setFadeIn] = useState(true);

  function tabNav(year) {
    setActiveTab(year);
    setFadeIn(false);
    setFadeIn(true);
  }

  const [activeTab, setActiveTab] = useState(
    new Date(budget[0].year).getFullYear()
  );

  useEffect(() => {
    const selectedBudget = budget.filter(
      (budget) =>
        new Date(budget.year).getFullYear() === new Date().getFullYear()
    );
    if (selectedBudget.length > 0) {
      setActiveTab(new Date(selectedBudget[0].year).getFullYear());
    }
  }, [budget]);

  return (
    <Container className="my-5">
      <h2 className="my-3">Rozpočet & Riešitelia:</h2>
      <Nav tabs>
        {budget.map((budget) => {
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
        {budget.map((budget) => {
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
                {user.role !== "basic" && !isCheckout && (
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
                        size="sm"
                        className="float-sm-right"
                        color="warning"
                        onClick={() =>
                          dispatch({
                            type: "ACTION",
                            name: "UPDATE_BUDGET",
                            payload: { grantId, budget },
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
                  {user.role !== "basic" && !isCheckout && (
                    <Col>
                      <Button
                        className="float-sm-right"
                        color="success"
                        onClick={() =>
                          dispatch({
                            type: "ACTION",
                            name: "ADD_MEMBER",
                            payload: { grantId, budget },
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
                      <th>Meno</th>
                      <th>Rola</th>
                      <th>Hodiny</th>
                      <th>Vytvorený</th>
                      <th>Upravený</th>
                      {user.role !== "basic" && !isCheckout && <th>Akcia</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {budget.members.map((member, i) => {
                      const created = new Date(
                        member.createdAt
                      ).toLocaleString();
                      const updated = new Date(
                        member.updatedAt
                      ).toLocaleString();
                      let role = "";
                      switch (member.role) {
                        case "deputy":
                          role = "Zástupca";
                          break;
                        case "leader":
                          role = "Vedúci";
                          break;

                        default:
                          role = "Riešiteľ";
                          break;
                      }

                      return (
                        <tr
                          className={member.active && "table-success"}
                          key={i}
                        >
                          <td>
                            {member.member ? member.member.fullName : "N/A"}
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
                          {user.role !== "basic" && !isCheckout && (
                            <td>
                              <ButtonGroup>
                                <Button
                                  outline
                                  size="sm"
                                  color="warning"
                                  onClick={() =>
                                    dispatch({
                                      type: "ACTION",
                                      name: "UPDATE_MEMBER",
                                      payload: { grantId, budget, member },
                                    })
                                  }
                                >
                                  <PencilFill />
                                </Button>
                                <Button
                                  outline
                                  size="sm"
                                  color="danger"
                                  onClick={() =>
                                    dispatch({
                                      type: "ACTION",
                                      name: "DELETE_MEMBER",
                                      payload: { grantId, budget, member },
                                    })
                                  }
                                >
                                  <Trash2Fill />
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
