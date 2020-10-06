export default function validateBudget(values) {    
	let errors = {};
    let valid = {};

	//travel budget errors
    if (!values.travel) { 
        errors.travel = 'Zadajte položku: Cestovné';
    } else {
        valid.travel = 'Položka cestovné OK';
    }
    //material budget errors
    if (!values.material) {
        errors.material = 'Zadajte položku: Materiál';
    } else {
        valid.material = 'Položka materiál OK';
    } 
    //services budget errors
    if (!values.services) {
        errors.services = 'Zadajte položku: Služby';                
    } else {   
        valid.services = 'Položka služby OK';
    }
	
    return {errors, valid};
}