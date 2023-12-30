import { useEffect, useState } from "react";
import { User } from "@/lib/graphql/generated/graphql";
import { getMe, logout } from "@/app/[lng]/(auth)/actions";

export default function useUser() {
  const [user, setUser] = useState<Omit<User, "grants"> | null>(null);

  useEffect(() => {
    async function getLoggedIn() {
      const user = await getMe();

      if (user) {
        setUser(user);
      } else {
        await logout();
      }
    }

    getLoggedIn();
  }, []);

  return user;
}
