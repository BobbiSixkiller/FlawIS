import React, { useEffect, useState } from "react";
import { useRouteMatch, Link } from "react-router-dom";

import {
  Fade,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
  Alert,
  Table,
} from "reactstrap";

import { useDataFetch } from "../../hooks/useApi";

export default function User() {
  const {
    params: { id },
    url,
  } = useRouteMatch();

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const {
    state: { data, loading, error },
    setUrl,
  } = useDataFetch(`${url}/${year}`, []);

  useEffect(() => {
    setUrl(`user/${id}/${year}`);
  }, [id, year]);

  if (loading) {
    return (
      <Row className="justify-content-center">
        <Spinner />
      </Row>
    );
  }

  return (
    <Fade>
      <h2>Granty</h2>
      <Form form>
        <FormGroup row>
          <Label for="year" md={1}>
            Rok:
          </Label>
          <Col md={2}>
            <Input
              type="select"
              name="year"
              id="year"
              onChange={(e) => setYear(e.target.value)}
              value={year}
            >
              <option>{parseInt(currentYear)}</option>
              <option>{parseInt(currentYear) + 1}</option>
              <option>{parseInt(currentYear) + 2}</option>
              <option>{parseInt(currentYear) + 3}</option>
              <option>{parseInt(currentYear) + 4}</option>
            </Input>
          </Col>
          <Label for="hours" md={1}>
            Hodiny:
          </Label>
          <Col md={8}>
            <Input id="hours" plaintext readOnly value={data.hoursTotal || 0} />
          </Col>
        </FormGroup>
        <FormGroup></FormGroup>
      </Form>
      {error && (
        <Alert color="primary" className="text-center">
          {data.msg}
        </Alert>
      )}
      {!error && (
        <Table responsive hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Názov</th>
              <th>Hodiny</th>
              <th>Cestovné</th>
              <th>Materiál</th>
              <th>Služby</th>
              <th>Nepriame</th>
              <th>Platy</th>
              <th>Akcia</th>
            </tr>
          </thead>
          <tbody>
            {data.grants &&
              data.grants.map((grant, i) => (
                <tr key={grant._id}>
                  <td>{i}</td>
                  <td>{grant.name}</td>
                  <td>{grant.budget.members.hours}</td>
                  <td>{grant.budget.travel}</td>
                  <td>{grant.budget.material}</td>
                  <td>{grant.budget.services}</td>
                  <td>{grant.budget.indirect}</td>
                  <td>{grant.budget.salaries}</td>
                  <td>
                    <Button
                      tag={Link}
                      to={`${url}/${grant._id}`}
                      size="sm"
                      color="info"
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      )}
    </Fade>
  );
}
