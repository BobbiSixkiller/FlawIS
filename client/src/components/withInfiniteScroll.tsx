"use client";

import {
  ComponentType,
  LegacyRef,
  ReactNode,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useInView } from "react-intersection-observer";

interface PageInfo {
  hasNextPage: boolean;
  endCursor?: string;
}

export interface Edge<EdgeT> {
  cursor: string;
  node: EdgeT;
}

export interface Connection<EdgeT> {
  edges: (Edge<EdgeT> | null)[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface GetDataFilter {
  after?: string;
  first?: number;
  [key: string]: any; // Allows additional properties
}

interface ScrollProps<EdgeT> {
  initialData: Connection<EdgeT>;
  filter: GetDataFilter;
  getData: (filter: GetDataFilter) => Promise<Connection<EdgeT>>;
  ListItem: ComponentType<{ data?: EdgeT }>;
  Placeholder: ComponentType<{ cardRef?: LegacyRef<HTMLDivElement> }>;
  Container: ComponentType<{ children: ReactNode }>;
}

export function withInfiniteScroll<EdgeT>({
  Container,
  ListItem,
  filter,
  getData,
  Placeholder,
  initialData,
}: ScrollProps<EdgeT>) {
  return function WithInfiniteScrollComponent() {
    const [data, setData] = useState(initialData);
    const { ref, inView } = useInView();

    // Memoize the filter object to avoid unnecessary re-renders
    const memoizedFilter = useMemo(() => filter, [JSON.stringify(filter)]);

    useEffect(() => {
      async function getMore() {
        if (!data.pageInfo.hasNextPage) return; // Avoid unnecessary calls

        const newData = await getData({
          ...memoizedFilter,
          after: data.pageInfo.endCursor, // Update with the latest cursor
        });

        setData((prevData) => ({
          edges: [...prevData.edges, ...newData.edges], // Append new edges
          pageInfo: newData.pageInfo, // Update pageInfo
          totalCount: newData.totalCount, // Update total count
        }));
      }

      if (inView && data.pageInfo.hasNextPage) {
        getMore();
      }
    }, [
      inView,
      data.pageInfo.hasNextPage,
      data.pageInfo.endCursor,
      memoizedFilter,
      getData,
    ]);

    return (
      <Container>
        {data.edges.map((edge, i) => (
          <ListItem key={edge?.cursor || i} data={edge?.node} />
        ))}
        {data.pageInfo.hasNextPage && <Placeholder cardRef={ref} />}
      </Container>
    );
  };
}
