import React from 'react';
import api from '../../api';
import { useHistory} from 'react-router-dom';

import { FormGroup, Col, Alert, Button } from 'reactstrap';

import getUsers from "../../hooks/useAPI";
import { useUser } from "../../hooks/useUser";

import ProgressBar from "../ProgressBar";
import GrantID from "./GrantMultistepForm/GrantID";
import GrantBudget from "./GrantMultistepForm/GrantBudget";
import GrantCheckOut from "./GrantMultistepForm/GrantCheckOut";

function AddGrant(props) {
  const { accessToken } = useUser();
  const history = useHistory();

  const [ form, setForm ] = React.useState({});
  const [ step, setStep ] = React.useState(0);
  const [ years, setYears ] = React.useState([]);
  const [ backendError, setBackendError ] = React.useState(null);

  async function addGrant(e) {
    e.preventDefault();
    try {
      await api.post(
        "grant/add",
        form,
        { 
          headers: {
            authToken: accessToken
          } 
        }
      );
      props.getData(accessToken);
      history.push("/grants");
    } catch(err) {
      console.log(err);
      err.response.data.error && setBackendError(err.response.data.error);
    }
  }

  const users = getUsers("http://localhost:5000/api/user/", "GET", accessToken);

  const renderBudgets = years.map((year, i) => {
    return (<GrantBudget 
              key={year}
              i={i} 
              year={year} 
              years={years}
              form={form}
              setForm={setForm}
              users={users}
              step={step}
              setStep={setStep}  
            />)
  });

  return(
      <>
        {step > years.length ? (<h1 className="text-center">Kontrola nového grantu</h1>) : (<h1 className="text-center">Pridať nový grant</h1>)}
        {step === 0 && <GrantID history={history} setYears={setYears} step={step} setStep={setStep} form={form} setForm={setForm} />}
        {step > 0 && renderBudgets[step - 1]}
        {step > years.length && <GrantCheckOut grant={form} users={users} addGrant={addGrant} step={step} setStep={setStep}/>}
        {backendError && 
          <FormGroup row className="justify-content-center my-3">
            <Col sm={6}>
              <Alert color="danger">{backendError}<Button close onClick={() => setBackendError(null)} /></Alert>
            </Col>
          </FormGroup>
        }
        <ProgressBar steps={years.length + 1} step={step} />        
      </>
  );
}

export default AddGrant;