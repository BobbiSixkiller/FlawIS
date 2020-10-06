import React from "react";

import { Pagination, PaginationItem, PaginationLink, Spinner, Fade, Row, FormGroup, Col, Label, Input, CustomInput, FormFeedback, Button, Table, DropdownMenu, DropdownItem } from 'reactstrap';

import validateMember from "../../../validation/validateMember";
import useFormValidation from "../../../hooks/useFormValidation";
import { useUser } from "../../../hooks/useUser";
import getMembers from "../../../hooks/useAPI";

import { IDtoName } from "../../../util/helperFunctions";

import AutoInput from "../../AutoInput";

const INITIAL_STATE = {
	member: "",
	hours: "",
	role: "basic",
	active: true
}

function GrantBudgetMembers(props) {
	const [members, setMembers] = React.useState(props.budget.members);
	//pagination for members table
	const [pageSize, setPageSize] = React.useState(5);
	const [pagesCount, setPagesCount] = React.useState();
	const [currentPage, setCurrentPage] = React.useState(0);

	const { handleSubmit, handleChange, handleBlur, values, setValues, errors, valid, isSubmitting } = useFormValidation(INITIAL_STATE, validateMember, addMember);

	React.useEffect(() => {
		const budget = {...props.budget};
		budget.members = members;
		props.setValues(budget);
		//pagination of member records table
		setPagesCount(Math.ceil(members.length / pageSize));
	}, [members]);

	function addMember() {
		setMembers([...members, values]);
	}

	function removeMember(member) {
		setMembers(members.filter(i => i.member !== member));
	}

	function handlePageClick(e, index) {
		e.preventDefault();
		setCurrentPage(index);
	}

	function handlePrevClick(e) {
		e.preventDefault();
		setCurrentPage(currentPage - 1);
	}

	function handleNextClick(e) {
		e.preventDefault();
		setCurrentPage(currentPage + 1);
	}

	return(
		<FormGroup>
			<Row form className="justify-content-center">
		        <Col sm={4}>
		          	<AutoInput 
		          		users={props.users} 
		          		handleChange={handleChange} 
		          		handleBlur={handleBlur} 
		          		values={values} 
		          		setValues={setValues} 
		          		errors={errors} 
		          		valid={valid} 
		          	/>
		        </Col>
		        <Col sm={2}>
		          <FormGroup>
		            <Label for="hours">Hodiny:</Label>
		            <Input 
						id="hours" 
						name="hours" 
						placeholder="Hodiny" 
						value={values.hours} 
						onChange={handleChange} 
						onBlur={handleBlur}
						valid={valid.hours && true}
						invalid={errors.hours && true}
						autoComplete="off"
					/>
					<FormFeedback invalid>{errors.hours}</FormFeedback>
				    <FormFeedback valid>{valid.hours}</FormFeedback>
		          </FormGroup>
		        </Col>
	      	</Row>
			<Row form className="justify-content-center">
				<Col sm={4}>
					<CustomInput type="radio" id="basic" name="role" value="basic" label="Riešiteľ" inline defaultChecked onChange={handleChange}></CustomInput>
	            	<CustomInput type="radio" id="deputy" name="role" value="deputy" label="Zástupca" inline onChange={handleChange}></CustomInput>
	            	<CustomInput type="radio" id="leader" name="role" value="leader" label="Hlavný" inline onChange={handleChange}></CustomInput>
				</Col>
				<Col sm={2}>
					<FormGroup>
						<Button className="float-sm-right" id="addMember" color="primary" onClick={handleSubmit}>Pridať</Button>
					</FormGroup>  
				</Col>
			</Row>
			{members.length !== 0 && 
				<Fade>
					<Row form className="justify-content-center my-5">
						<Col sm={6}>
							<Label>Members:</Label>
							<Table responsive hover>
					        	<thead>
					        		<tr>
					        			<th>#</th>
					        			<th>Meno</th>
					        			<th>Rola</th>
					        			<th>Hodiny</th>
										<th>Akcia</th>
					        		</tr>
					        	</thead>
					        	<tbody>
					        		{props.users.length !== 0 && members
					        			.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
					        			.map((member, i) => {
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

		    								return(
		    									<tr key={i}>
							        				<td>{i}</td>
							        				<td>{IDtoName(member.member, props.users)}</td>
							        				<td>{role}</td>
							        				<td>{member.hours}</td>
							        				<td><Button onClick={() => removeMember(member.member)} type="button" className="close float-left" aria-label="Close"><span aria-hidden="true">&times;</span></Button></td>
							        			</tr>
		    								)
					        			}
					        		)}
					        	</tbody>
					        </Table>
						</Col>
					</Row>
					<Row form className="justify-content-center">
						<Pagination aria-label="members pagination nav">
							<PaginationItem disabled={currentPage <= 0}>
  								<PaginationLink onClick={handlePrevClick} previous href="#" />
  							</PaginationItem>
  							{[...Array(pagesCount)].map((page, i) => (
							 	<PaginationItem active={i === currentPage} key={i}>
							   		<PaginationLink onClick={e => handlePageClick(e, i)} href="#">
							     		{i + 1}
							   		</PaginationLink>
							 	</PaginationItem>
							))}
							<PaginationItem disabled={currentPage >= pagesCount - 1}>
  								<PaginationLink onClick={handleNextClick} next href="#" />
  							</PaginationItem>
  						</Pagination>
					</Row>
				</Fade>
			}
        </FormGroup>
	);	
}

export default GrantBudgetMembers;