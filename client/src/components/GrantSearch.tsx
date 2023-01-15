import { useRouter } from "next/router";
import { useState } from "react";
import { Search } from "semantic-ui-react";
import { useGrantTextSearchLazyQuery } from "../graphql/generated/schema";

export default function GrantSearch() {
	const [value, setValue] = useState("");
	const [search, { loading, error, data }] = useGrantTextSearchLazyQuery();
	const router = useRouter();

	return (
		<Search
			placeholder="Hľadať..."
			fluid
			input={{ fluid: true }}
			loading={loading}
			onResultSelect={(e, data) => {
				setValue("");
				router.push(`/${data.result.id}`);
			}}
			onSearchChange={async (e, { value }) => {
				setValue(value);
				await search({ variables: { text: value as string } });
			}}
			results={data?.grantTextSearch.map((g) => ({
				title: g.name,
				description: g.type,
				id: g.id,
			}))}
			value={value}
		/>
	);
}
