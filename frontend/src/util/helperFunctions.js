export function IDtoName(memberID, members) {
  const member = members.find((member) => member._id === memberID);
  return member.firstName + " " + member.lastName;
}

export function normalizeErrors(errors) {
  return errors.reduce((acc, val) => {
    acc[val.path] = val.message;
    return acc;
  }, {});
}
