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

export interface PaginationArgs {
  after?: string;
  first?: number;
}

interface ScrollProps<EdgeT, FilterT> {
  initialData: Connection<EdgeT>;
  filter: FilterT;
  getData: (vars: PaginationArgs & FilterT) => Promise<Connection<EdgeT>>;
  ListItem: ComponentType<{ data?: EdgeT }>;
  Placeholder: ComponentType<{ cardRef?: LegacyRef<HTMLDivElement> }>;
  Container: ComponentType<{ children: ReactNode }>;
}

export function withInfiniteScroll<EdgeT, FilterT>({
  Container,
  ListItem,
  filter,
  getData,
  Placeholder,
  initialData,
}: ScrollProps<EdgeT, FilterT>) {
  return function WithInfiniteScrollComponent() {
    const [data, setData] = useState(initialData);
    const { ref, inView } = useInView();

    // Memoize the filter object to avoid unnecessary re-renders
    const filterKey = JSON.stringify(filter);

    useEffect(() => {
      async function getMore() {
        const newData = await getData({
          ...filter,
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
    }, [inView, data, filterKey]);

    return (
      <Container>
        {data.edges
          .filter((edge) => edge?.node !== undefined && edge !== null)
          .map((edge, i) => (
            <ListItem key={edge?.cursor || i} data={edge?.node} />
          ))}
        {data.pageInfo.hasNextPage && <Placeholder cardRef={ref} />}
      </Container>
    );
  };
}
