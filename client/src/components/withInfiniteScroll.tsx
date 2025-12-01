"use client";

import { ComponentType, ReactNode, Ref, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string | null;
}

export interface Edge<TEdge> {
  cursor: string;
  node: TEdge;
}

export interface Connection<TEdge> extends Record<string, any> {
  edges: (Edge<TEdge> | null)[];
  pageInfo: PageInfo;
}

export interface PaginationArgs {
  after?: string | null;
  first?: number;
}

interface ScrollProps<TEdge, TGqlVars> {
  initialData: Connection<TEdge>;
  vars: TGqlVars;
  getData: (vars: TGqlVars & PaginationArgs) => Promise<Connection<TEdge>>;
  ListItem: ComponentType<{ data?: TEdge }>;
  Placeholder: ComponentType<{ cardRef?: Ref<HTMLDivElement> }>;
  Container: ComponentType<{ children: ReactNode }>;
  customSort?: (a: Edge<TEdge> | null, b: Edge<TEdge> | null) => number;
}

export function withInfiniteScroll<TEdge, TGqlVars>({
  Container,
  ListItem,
  vars,
  getData,
  Placeholder,
  initialData,
  customSort,
}: ScrollProps<TEdge, TGqlVars>) {
  return function WithInfiniteScrollComponent() {
    const [data, setData] = useState(initialData);
    const { ref, inView } = useInView();

    // Memoize the vars object to avoid unnecessary re-renders
    const varsStr = JSON.stringify(vars);

    useEffect(() => {
      async function getMore() {
        const newData = await getData({
          ...vars,
          after: data.pageInfo.endCursor, // Update with the latest cursor
        });

        setData((prevData) => {
          const edges = [...prevData.edges, ...newData.edges]; // Append new edges

          return {
            edges: customSort ? edges.sort(customSort) : edges,
            pageInfo: newData.pageInfo, // Update pageInfo
          };
        });
      }

      if (inView && data.pageInfo.hasNextPage) {
        getMore();
      }
    }, [inView, data, varsStr]);

    return (
      <Container>
        {data.edges.map((edge) => (
          <ListItem key={edge?.cursor} data={edge?.node} />
        ))}
        {data.pageInfo.hasNextPage && <Placeholder cardRef={ref} />}
      </Container>
    );
  };
}
