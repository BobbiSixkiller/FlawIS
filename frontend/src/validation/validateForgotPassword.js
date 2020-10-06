export default function validateForgotPassword(values) {
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

    return {errors, valid};
}