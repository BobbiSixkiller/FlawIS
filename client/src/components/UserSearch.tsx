import { useRouter } from "next/router";
import { useState } from "react";
import { Search } from "semantic-ui-react";
import { useUserTextSearchLazyQuery } from "../graphql/generated/schema";

export default function GrantSearch() {
	const [value, setValue] = useState("");
	const [search, { loading, error, data }] = useUserTextSearchLazyQuery();
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
				setValue(value as string);
				await search({ variables: { text: value as string } });
			}}
			results={data?.userTextSearch.map((g) => ({
				title: g.name,
				id: g.id,
			}))}
			value={value}
		/>
	);
}
