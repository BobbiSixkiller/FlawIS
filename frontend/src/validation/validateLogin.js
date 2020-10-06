export default function validateLogin(values) {
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
    	errors.password = 'Zadajte heslo';
    } else if (
        !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/i.test(values.password)
    ) {
    	errors.password = 'Minimálna dĺžka 8 znakov, aspoň 1 písmeno a 1 číslo';
    } else {
        valid.password = 'Formát hesla OK';
    }

    return {errors, valid};
}