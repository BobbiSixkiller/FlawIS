export function validateAnnouncement(values) {
  let errors = {};
  let valid = {};

  if (!values.name) {
    errors.name = "Zadajte názov oznamu!";
  } else {
    valid.name = "Názov oznamu OK";
  }

  if (!values.content) {
    errors.content = "Zadajte text oznamu!";
  } else if (values.content.length > 3000) {
    errors.content = "Text oznamu nesmie byť dlhší ako 3000 znakov!";
  } else {
    valid.content = "Oznam OK";
  }

  if (values.files && Object.keys(values.files).length > 5) {
    errors.files = "Presiahli ste maximálny počet súborov pri uploade!";
  } else {
    valid.files = "Súbory dokumentov OK.";
  }

  return { errors, valid };
}

export function validateBudget(values) {
  let errors = {};
  let valid = {};

  if (!values.travel) {
    errors.travel = "Zadajte položku: Cestovné";
  } else {
    valid.travel = "Položka cestovné OK";
  }

  if (!values.material) {
    errors.material = "Zadajte položku: Materiál";
  } else {
    valid.material = "Položka materiál OK";
  }

  if (!values.services) {
    errors.services = "Zadajte položku: Služby";
  } else {
    valid.services = "Položka služby OK";
  }

  if (!values.indirect) {
    errors.indirect = "Zadajte položku: Nepriame náklady";
  } else {
    valid.indirect = "Položka nepriame náklady OK";
  }

  if (!values.salaries) {
    errors.salaries = "Zadajte položku: Mzdové náklady";
  } else {
    valid.salaries = "Položka mzdové náklady OK";
  }

  return { errors, valid };
}

export function validateDocument(values) {
  let errors = {};
  let valid = {};

  if (Object.keys(values.files).length === 0) {
    errors.files = "Nahrajte súbory dokumentu/ov!";
  } else if (Object.keys(values.files).length > 5) {
    errors.files = "Presiahli ste maximálny počet súborov pri uploade!";
  } else {
    valid.files = "Súbory dokumentov OK.";
  }

  return { errors, valid };
}

export function validateForgotPassword(values) {
  let errors = {};
  let valid = {};

  if (!values.email) {
    errors.email = "Zadajte emailovú adresu";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = "Nesprávny formát adresy";
  } else {
    valid.email = "Formát adresy OK";
  }

  return { errors, valid };
}

export function validateGrantID(values, step) {
  let errors = {};
  let valid = {};

  if (!values.name) {
    errors.name = "Zadajte názov grantu";
  } else if (values.name.length > 500) {
    errors.name = "Maximálna dĺžka názvu je 500 znakov";
  } else {
    valid.name = "Názov grantu OK";
  }

  if (!values.idNumber) {
    errors.idNumber = "Zadajte ID grantu";
  } else if (values.idNumber > 100) {
    errors.idNumber = "Maximálna dĺžka ID grantu je 100 znakov";
  } else {
    valid.idNumber = "ID grantu OK";
  }

  if (!values.start) {
    errors.start = "Zadajte začiatok grantu";
  } else if (values.start === values.end) {
    errors.start = "Začiatok grantu sa zhoduje s koncom grantu";
  } else if (values.start > values.end) {
    errors.start = "Začiatok grantu je neskôr ako koniec grantu";
  } else {
    valid.start = "Začiatok grantu OK";
  }

  if (!values.end) {
    errors.end = "Zadajte koniec grantu";
  } else if (values.end === values.start) {
    errors.end = "Koniec grantu sa zhoduje so začiatkom grantu";
  } else if (values.end < values.start) {
    errors.end = "Koniec grantu je skôr ako začiatok grantu";
  } else {
    valid.end = "Koniec grantu OK";
  }

  return { errors, valid };
}

export function validateLogin(values) {
  let errors = {};
  let valid = {};

  if (!values.email) {
    errors.email = "Zadajte emailovú adresu";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = "Nesprávny formát adresy";
  } else {
    valid.email = "Formát adresy OK";
  }

  if (!values.password) {
    errors.password = "Zadajte heslo";
  } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/i.test(values.password)) {
    errors.password =
      "Minimálna dĺžka 8 znakov, aspoň 1 písmeno a 1 číslo, bez znakov!";
  } else {
    valid.password = "Formát hesla OK";
  }

  return { errors, valid };
}

export function validateMember(values) {
  let errors = {};
  let valid = {};

  if (!values.member) {
    errors.member = "Zadajte riešiteľa grantu";
  } else {
    valid.member = "Riešiteľ zvolený";
  }

  if (!values.hours) {
    errors.hours = "Zadajte počet hodín";
  } else if (!/^[0-9]+$/i.test(values.hours)) {
    errors.hours = "Pole akceptuje iba číselnú hodnotu";
  } else {
    valid.hours = "Počet hodín zadaný";
  }

  return { errors, valid };
}

export function validatePasswordReset(values) {
  let errors = {};
  let valid = {};

  if (!values.password) {
    errors.password = "Zadajte nové heslo";
  } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/i.test(values.password)) {
    errors.password = "Minimálne 8 znakov, aspoň 1 písmeno a 1 číslo";
  } else {
    valid.password = "Heslo OK";
  }

  if (!values.repeatPass) {
    errors.repeatPass = "Pre potvrdenie zopakujte heslo";
  } else if (values.password !== values.repeatPass) {
    errors.repeatPass = "Zadané heslá sa nezhodujú";
  } else {
    valid.repeatPass = "Zadané heslá sa zhodujú";
  }

  return { errors, valid };
}

export function validatePost(values) {
  let errors = {};
  let valid = {};

  if (!values.name) {
    errors.name = "Zadajte názov oznamu!";
  } else {
    valid.name = "Názov oznamu OK";
  }

  if (!values.body) {
    errors.body = "Zadajte text oznamu!";
  } else if (values.body.length > 3000) {
    errors.body = "Text oznamu nesmie byť dlhší ako 3000 znakov!";
  } else {
    valid.body = "Oznam OK";
  }

  if (values.tags.length === 0) {
    errors.tags = "Zadajte aspoň jednu oblasť príspevku!";
  } else {
    valid.tags = "Tagy OK";
  }

  return { errors, valid };
}

export function validateRegister(values) {
  let errors = {};
  let valid = {};

  if (!values.email) {
    errors.email = "Zadajte emailovú adresu";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = "Nesprávny formát adresy";
  } else {
    valid.email = "Formát adresy OK";
  }

  if (!values.password) {
    errors.password = "Zadajte heslo";
  } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/i.test(values.password)) {
    errors.password = "Minimálna dĺžka 8 znakov, aspoň 1 písmeno a 1 číslo";
  } else {
    valid.password = "Formát hesla OK";
  }

  if (!values.repeatPass) {
    errors.repeatPass = "Pre potvrdenie zopakujte heslo";
  } else if (values.password !== values.repeatPass) {
    errors.repeatPass = "Zadané heslá sa nezhodujú";
  } else {
    valid.repeatPass = "Zadané heslá sa zhodujú";
  }

  if (!values.firstName) {
    errors.firstName = "Zadajte krstné meno";
  } else {
    valid.firstName = "Krstné meno OK";
  }

  if (!values.lastName) {
    errors.lastName = "Zadajte priezvisko";
  } else {
    valid.lastName = "Priezvisko OK";
  }

  return { errors, valid };
}
