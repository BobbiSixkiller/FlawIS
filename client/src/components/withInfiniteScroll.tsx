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

interface InfiniteScrollProps<TEdge, TGqlVars> {
  initialData: Connection<TEdge>;
  vars: TGqlVars;
  getData: (vars: TGqlVars & PaginationArgs) => Promise<Connection<TEdge>>;
  ListItem: ComponentType<{ data?: TEdge }>;
  Placeholder: ComponentType<{ cardRef?: Ref<HTMLDivElement> }>;
  Container: ComponentType<{ children: ReactNode }>;
  customSort?: (a: Edge<TEdge> | null, b: Edge<TEdge> | null) => number;
}

export function InfiniteScroll<TEdge, TGqlVars>({
  Container,
  ListItem,
  vars,
  getData,
  Placeholder,
  initialData,
  customSort,
}: InfiniteScrollProps<TEdge, TGqlVars>) {
  const [data, setData] = useState(initialData);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (!inView || !data.pageInfo.hasNextPage) return;

    let cancelled = false;

    async function getMore() {
      const newData = await getData({
        ...vars,
        after: data.pageInfo.endCursor,
      });

      if (cancelled) return;

      setData((previousData) => {
        const edges = [...previousData.edges, ...newData.edges];

        return {
          edges: customSort ? edges.sort(customSort) : edges,
          pageInfo: newData.pageInfo,
        };
      });
    }

    void getMore();

    return () => {
      cancelled = true;
    };
  }, [customSort, data.pageInfo, getData, inView, vars]);

  return (
    <Container>
      {data.edges.map((edge) => (
        <ListItem key={edge?.cursor} data={edge?.node} />
      ))}
      {data.pageInfo.hasNextPage && <Placeholder cardRef={ref} />}
    </Container>
  );
}
