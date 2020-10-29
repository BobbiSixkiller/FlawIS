export default function validateDocument(values) {
    let errors = {}
    let valid = {}

    if (Object.keys(values.files).length === 0) {
        errors.files = 'Nahrajte súbory dokumentu/ov!';
    } else if (Object.keys(values.files).length > 5) {
        errors.files = 'Presiahli ste maximálny počet súborov pri uploade!';
    } else {
        valid.files = 'Súbory dokumentov OK.';
    }

    return {errors, valid}
}