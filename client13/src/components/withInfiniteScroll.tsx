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

export interface Edge<EdgeT> {
  cursor: string;
  node: EdgeT;
}

export interface Connection<EdgeT> {
  edges: (Edge<EdgeT> | null)[];
  pageInfo: PageInfo;
}

export interface GetDataFilter {
  after?: string;
  first?: number;
  [key: string]: any; // This allows for any other properties with any type.
}

interface ScrollProps<EdgeT> {
  lng: string;
  initialData: Connection<EdgeT>;
  filter: GetDataFilter;
  getData: (filter: GetDataFilter) => Promise<Connection<EdgeT>>;
  ListItem: ComponentType<{ data?: EdgeT; lng: string }>;
  Placeholder: ComponentType<{ cardRef?: LegacyRef<HTMLDivElement> }>;
  Container: ComponentType<{ children: ReactNode }>;
}

export function withInfiniteScroll<EdgeT>({
  lng,
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
