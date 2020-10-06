export default function validateMember(values) {    
	let errors = {};
    let valid = {};

    //member error
    if (!values.member) {
        errors.member = "Zadajte riešiteľa grantu";
    } else {
        valid.member = "Riešiteľ zvolený";
    }
	//hours error
    if (!values.hours) {
        errors.hours = "Zadajte počet hodín";
    } else if (!/^[0-9]+$/i.test(values.hours)) {
        errors.hours = "Pole akceptuje iba číselnú hodnotu";
    } else {
        valid.hours = "Počet hodín zadaný";
    }
	
    return {errors, valid};
}