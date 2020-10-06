export default function validateUserUpdate(values) {
    let errors = {};
    let valid = {};

    //email errors
    if (!values.email) {
      errors.email = 'Zadajte emailovú adresu';
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
    ) {
      errors.email = 'Nesprávny formát adresy';
    } else {
        valid.email = 'Formát adresy OK';
    }
    //password errors
    if (!values.password) {
        valid.password = 'Heslo ostáva nezmenené';
    } else if (
        !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/i.test(values.password)
    ) {
        errors.password = 'Minimálna dĺžka 8 znakov, aspoň 1 písmeno a 1 číslo';
    } else {
        valid.password = 'Formát hesla OK';
    }
    //repeatPass errors
    if (values.password !== values.repeatPass) {
        errors.repeatPass = 'Zadané heslá sa nezhodujú';
    } else {
        valid.repeatPass = 'Zadané heslá sa zhodujú';
    }
    //firstName errors
    if (!values.firstName) {
        errors.firstName = 'Zadajte krstné meno';
    } else {
        valid.firstName ='Krstné meno OK';
    }
    //lastName errors
    if (!values.lastName) {
        errors.lastName = 'Zadajte priezvisko';
    } else {
        valid.lastName = 'Priezvisko OK';
    }
    
    return {errors, valid};
}