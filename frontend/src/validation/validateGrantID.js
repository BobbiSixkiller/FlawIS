export default function validateGrantID(values, step) {
    let errors = {};
    let valid = {};

    //name errors
    if (!values.name) {
      errors.name = 'Zadajte názov grantu';
    } else if (values.name.length > 500) {
        errors.name = 'Maximálna dĺžka názvu je 500 znakov';
    } else {
        valid.name = 'Názov grantu OK';
    }
    //idNumber errors
    if (!values.idNumber) {
    	errors.idNumber = 'Zadajte ID grantu';
    } else if (values.idNumber > 100) {
    	errors.idNumber = 'Maximálna dĺžka ID grantu je 100 znakov';
    } else {
        valid.idNumber = 'ID grantu OK';
    }
    //start date errors
    if (!values.start) {
    	errors.start = 'Zadajte začiatok grantu';
    } else if (values.start === values.end) {
        errors.start = 'Začiatok grantu sa zhoduje s koncom grantu';
    } else if (values.start > values.end) {
        errors.start = 'Začiatok grantu je neskôr ako koniec grantu';
    } else {
        valid.start = 'Začiatok grantu OK';
    }
    //end date errors
    if (!values.end) {
    	errors.end = 'Zadajte koniec grantu';
    } else if (values.end === values.start) {
        errors.end = 'Koniec grantu sa zhoduje so začiatkom grantu';
    } else if (values.end < values.start) {
        errors.end = 'Koniec grantu je skôr ako začiatok grantu';
    } else {
        valid.end = 'Koniec grantu OK';
    }
    
    return {errors, valid};
}