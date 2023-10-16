import Nav from "@/components/Nav";
import DrawerProvider from "./providers/DrawerProvider";

export default function Home() {
  return (
    <DrawerProvider>
      <Nav />
      <div>content</div>
    </DrawerProvider>
  );
}
