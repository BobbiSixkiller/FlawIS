import { Search } from "semantic-ui-react";

export default function SearchUser({ domain }: { domain?: string }) {
	return <Search placeholder="Používateľ..." fluid input={{ fluid: true }} />;
}
