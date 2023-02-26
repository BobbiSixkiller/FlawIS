import { ApolloQueryResult } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
	Button,
	Card,
	Dropdown,
	DropdownItemProps,
	Grid,
	Icon,
	Label,
	Message,
	Placeholder,
	Segment,
} from "semantic-ui-react";
import {
	Exact,
	GrantInfoFragment,
	MeQuery,
	UserQuery,
} from "../graphql/generated/schema";

export default function UserGrants({
	onProfilePage,
	data,
	loading,
	error,
	refetch,
}: {
	onProfilePage: boolean;
	data?: GrantInfoFragment;
	loading: boolean;
	error: any;
	refetch: (
		variables?:
			| Partial<
					Exact<{
						id: any;
						year?: any;
					}>
			  >
			| undefined
	) => Promise<ApolloQueryResult<UserQuery | MeQuery>>;
}) {
	const router = useRouter();
	const [options, setOptions] = useState<DropdownItemProps[]>([]);

	useEffect(() => {
		if (data) {
			setOptions([
				{ key: 0, text: "Celkovo", value: "*" },
				...data.availableYears.map((y, i) => ({
					key: i + 1,
					text: new Date(y).getFullYear().toString(),
					value: y,
				})),
			]);
		}
	}, [data]);

	return (
		<Grid.Column>
			<Dropdown
				loading={loading}
				button
				basic
				floating
				options={options}
				value={options.find((o) => o.text === router.query.year)?.value || "*"}
				onChange={async (e, { value }) => {
					const year = new Date(value?.toString() || "")
						.getFullYear()
						.toString();
					if (year !== "NaN") {
						router.replace({
							pathname: onProfilePage
								? "/profile"
								: `/users/${router.query.id}`,
							query: { tab: router.query.tab, year },
						});
					} else {
						router.replace({
							pathname: onProfilePage
								? "/profile"
								: `/users/${router.query.id}`,
							query: { tab: router.query.tab },
						});
					}
					await refetch({ year: value === "*" ? null : value });
				}}
			/>
			<Label size="large" color="black">
				<Icon name="hourglass" /> {data?.hours}
				<Label.Detail>Hodín</Label.Detail>
			</Label>
			{error && <Message error content={error.message} />}
			{loading && (
				<>
					<Segment>
						<Placeholder>
							<Placeholder.Header image>
								<Placeholder.Line length="medium" />
								<Placeholder.Line length="full" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="full" />
								<Placeholder.Line length="medium" />
							</Placeholder.Paragraph>
						</Placeholder>
					</Segment>
					<Segment>
						<Placeholder>
							<Placeholder.Header image>
								<Placeholder.Line length="medium" />
								<Placeholder.Line length="full" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="full" />
								<Placeholder.Line length="medium" />
							</Placeholder.Paragraph>
						</Placeholder>
					</Segment>
					<Segment>
						<Placeholder>
							<Placeholder.Header image>
								<Placeholder.Line length="medium" />
								<Placeholder.Line length="full" />
							</Placeholder.Header>
							<Placeholder.Paragraph>
								<Placeholder.Line length="full" />
								<Placeholder.Line length="medium" />
							</Placeholder.Paragraph>
						</Placeholder>
					</Segment>
				</>
			)}
			{data?.grants?.map((g) => (
				<Card fluid key={g?.id}>
					<Card.Content>
						<Card.Header> {g?.name}</Card.Header>
						<Card.Meta>{g?.type}</Card.Meta>
						<Card.Description>
							<p>Začiatok: {new Date(g?.start).toLocaleDateString()}</p>
							<p>Koniec: {new Date(g?.end).toLocaleDateString()}</p>
						</Card.Description>
					</Card.Content>
					<Card.Content extra>
						<Button
							primary
							size="tiny"
							icon="info"
							onClick={() =>
								router.push({
									pathname: `/${g?.id}`,
									query: router.query.year ? { year: router.query.year } : null,
								})
							}
						/>
					</Card.Content>
				</Card>
			))}
		</Grid.Column>
	);
}
