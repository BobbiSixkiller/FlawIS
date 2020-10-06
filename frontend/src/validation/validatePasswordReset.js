export default function validatePasswordReset(values) {
    let errors = {};
    let valid = {};

    //password errors
    if (!values.password) {
        errors.password = 'Zadajte nové heslo';
    } else if (
        !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/i.test(values.password)
    ) {
        errors.password = 'Minimálne 8 znakov, aspoň 1 písmeno a 1 číslo';
    } else {
        valid.password = 'Heslo OK';
    }
    //repeatPass errors
    if (!values.repeatPass) {
        errors.repeatPass = 'Pre potvrdenie zopakujte heslo';
    } else if (values.password !== values.repeatPass) {
        errors.repeatPass = 'Zadané heslá sa nezhodujú';
    } else {
        valid.repeatPass = 'Zadané heslá sa zhodujú';
    }
    
    return {errors, valid};
}