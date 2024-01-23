import { useEffect, useState } from "react";
import { User } from "@/lib/graphql/generated/graphql";
import { getMe } from "@/app/[lng]/(auth)/actions";

export default function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function getLoggedIn() {
      const user = await getMe();

      if (user) {
        setUser(user);
      }
    }

    getLoggedIn();
  }, []);

  return user;
}
