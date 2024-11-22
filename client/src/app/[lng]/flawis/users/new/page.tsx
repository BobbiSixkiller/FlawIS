import UserForm from "@/app/[lng]/(auth)/register/UserForm";

export default function NewUserPage({
  params: { lng },
}: {
  params: { lng: string };
}) {
  return <UserForm namespace="register" />;
}
