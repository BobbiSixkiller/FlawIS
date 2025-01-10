"use client";

import {
  ComponentType,
  LegacyRef,
  ReactNode,
  useEffect,
  useMemo,
  useState,
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
  [key: string]: any; // This allows for any other properties with any type.
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

    const memoizedFilter = useMemo(() => filter, [JSON.stringify(filter)]);

    useEffect(() => {
      async function getMore() {
        const newData = await getData({
          ...memoizedFilter,
          after: data.pageInfo.endCursor,
        });
        setData((prevData) => ({
          edges: [...prevData.edges, ...newData.edges],
          pageInfo: newData.pageInfo,
          totalCount: newData.totalCount,
        }));
      }

      if (inView && data.pageInfo.hasNextPage) {
        getMore();
      }
    }, [inView, data, memoizedFilter]);

    return (
      <Container>
        {data.edges.map((edge, i) => (
          <ListItem key={i} data={edge?.node} />
        ))}
        {data.pageInfo.hasNextPage && <Placeholder cardRef={ref} />}
      </Container>
    );
  };
}
