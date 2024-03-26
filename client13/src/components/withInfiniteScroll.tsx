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

interface ScrollProps<T> {
  lng: string;
  initialData: Connection<T>;
  getData: (after?: string, first?: number) => Promise<Connection<T>>;
  ListItem: ComponentType<{ data?: T; lng: string }>;
  Placeholder: ComponentType<{ cardRef?: LegacyRef<HTMLDivElement> }>;
  Container: ComponentType<{ children: ReactNode }>;
}

export function withInfiniteScroll<T>({
  lng,
  Container,
  ListItem,
  getData,
  Placeholder,
  initialData,
}: ScrollProps<T>) {
  return function WithInfiniteScrollComponent() {
    const [data, setData] = useState(initialData);
    const { ref, inView } = useInView();

    useEffect(() => {
      async function getMore() {
        const newData = await getData(data.pageInfo.endCursor);
        setData((prevData) => ({
          edges: [...prevData.edges, ...newData.edges],
          pageInfo: newData.pageInfo,
        }));
      }

      if (inView && data.pageInfo.hasNextPage) {
        getMore();
      }
    }, [inView, data]);

    return (
      <Container>
        {data.edges.map((edge) => (
          <ListItem key={edge?.cursor} data={edge?.node} lng={lng} />
        ))}
        {data.pageInfo.hasNextPage && <Placeholder cardRef={ref} />}
      </Container>
    );
  };
}
