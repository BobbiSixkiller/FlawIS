"use client";

import {
  ComponentType,
  LegacyRef,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useInView } from "react-intersection-observer";

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string;
}

export interface Edge<T> {
  cursor: string;
  node: T;
}

export interface Connection<T> {
  edges: (Edge<T> | null)[];
  pageInfo: PageInfo;
}

export interface GetDataFilter {
  after?: string;
  first?: number;
  [key: string]: any; // This allows for any other properties with any type.
}

interface ScrollProps<T> {
  lng: string;
  initialData: Connection<T>;
  filter: GetDataFilter;
  getData: (filter: GetDataFilter) => Promise<Connection<T>>;
  ListItem: ComponentType<{ data?: T; lng: string }>;
  Placeholder: ComponentType<{ cardRef?: LegacyRef<HTMLDivElement> }>;
  Container: ComponentType<{ children: ReactNode }>;
}

export function withInfiniteScroll<T>({
  lng,
  Container,
  ListItem,
  filter,
  getData,
  Placeholder,
  initialData,
}: ScrollProps<T>) {
  return function WithInfiniteScrollComponent() {
    const [data, setData] = useState(initialData);
    const { ref, inView } = useInView();

    useEffect(() => {
      async function getMore() {
        const newData = await getData({
          ...filter,
          after: data.pageInfo.endCursor,
        });
        setData((prevData) => ({
          edges: [...prevData.edges, ...newData.edges],
          pageInfo: newData.pageInfo,
        }));
      }

      if (inView && data.pageInfo.hasNextPage) {
        getMore();
      }
    }, [inView, data, filter]);

    return (
      <Container>
        {data.edges.map((edge, i) => (
          <ListItem key={i} data={edge?.node} lng={lng} />
        ))}
        {data.pageInfo.hasNextPage && <Placeholder cardRef={ref} />}
      </Container>
    );
  };
}
