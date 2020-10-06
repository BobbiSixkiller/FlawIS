export default function validateAnnouncement(values) {    
	let errors = {};
    let valid = {};

	if (!values.name) {
        errors.name = 'Zadajte názov oznamu!'
    } else {
        valid.name = 'Názov oznamu OK'
    }

    if (!values.content) { 
        errors.content = 'Zadajte text oznamu!';
    } else if (values.content.length > 3000) {
        errors.content = 'Text oznamu nesmie byť dlhší ako 3000 znakov!';
    } else {
        valid.content = 'Oznam OK';
    }
    
	
    return {errors, valid};
}