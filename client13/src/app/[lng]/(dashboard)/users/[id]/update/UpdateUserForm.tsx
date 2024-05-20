"use client";

import { Role, UserFragment } from "@/lib/graphql/generated/graphql";
import { useTranslation } from "@/lib/i18n/client";
import { useContext, useEffect } from "react";
import { ActionTypes, MessageContext } from "@/providers/MessageProvider";
import { useRouter } from "next/navigation";
import Select from "@/components/Select";
import Button from "@/components/Button";
import { PencilIcon } from "@heroicons/react/24/outline";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { updateUser } from "./actions";

export default function UpdateUserForm({
  lng,
  user,
}: {
  lng: string;
  user: UserFragment;
}) {
  const router = useRouter();
  const { t } = useTranslation(lng, ["profile", "common"]);

  const { dispatch } = useContext(MessageContext);

  const methods = useForm({
    resolver: yupResolver(
      object({
        name: string().required(t("required")),
        email: string().email().required(t("required")),
        organization: string().required(t("required")),
        telephone: string().required(t("required")),
        role: string<Role>(),
      }).required(t("required"))
    ),
    values: {
      email: user.email,
      name: user.name,
      organization: user.organization,
      role: user.role,
      telephone: user.telephone,
    },
  });

  const email = methods.watch("email");
  useEffect(() => {
    if (email.includes("uniba")) {
      methods.setValue(
        "organization",
        "Univerzita Komenského v Bratislave, Právnická fakulta"
      );
    }
  }, [email, lng]);

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 w-full sm:w-96"
        onSubmit={methods.handleSubmit(async (data) => {
          const state = await updateUser(user.id, data);

          if (state.message && !state.success) {
            dispatch({
              type: ActionTypes.SetFormMsg,
              payload: state,
            });
          }

          if (state.success) {
            dispatch({
              type: ActionTypes.SetAppMsg,
              payload: state,
            });
            router.back();
          }
        })}
      >
        <Input label="Meno" name="name" />
        <Input label="Email" name="email" />
        <Textarea label="Organizacia" name="organization" />
        <Input label="Telefon" name="telephone" />
        <Select
          label={t("role")}
          name="role"
          defaultSelected={user.role}
          options={[
            { name: "Admin", value: Role.Admin },
            { name: "Basic", value: Role.Basic },
          ]}
        />

        <Button
          color="primary"
          type="submit"
          fluid
          loadingText={t("submitting")}
          loading={methods.formState.isSubmitting}
          disabled={methods.formState.isSubmitting}
        >
          {t("submit")}
        </Button>
      </form>
    </FormProvider>
  );
}
