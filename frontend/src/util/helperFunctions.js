export function IDtoName(memberID, members) {
	const member = members.find(member => member._id === memberID);
	return member.firstName + " " + member.lastName;
}