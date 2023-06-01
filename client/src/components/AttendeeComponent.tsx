import { Button, Card, Grid, Header, List, Popup } from "semantic-ui-react";
import { useTranslation } from "next-i18next";
import {
  AttendeeFragmentFragment,
  FileInput,
  Invoice,
  Role,
  useDeleteSubmissionFileMutation,
  useDeleteSubmissionMutation,
} from "../graphql/generated/schema";
import useWidth from "../hooks/useWidth";
import AddSubmissionDialog from "./AddSubmissionDialog";
import UpdateSubmissionDialog from "./UpdateSubmissionDialog";
import { useContext } from "react";
import { AuthContext } from "../providers/Auth";
import UpdateInvoiceForm from "./UpdateInvoiceForm";
import dynamic from "next/dynamic";
import DeleteDialog from "./DeleteDialog";
import AddSubmissionFileDialog from "./AddSubmissionFileDialog";

const PDFGenerator = dynamic(() => import("./InvoiceDownload"), { ssr: false });

export default function AttendeeComponent({
  title,
  data,
}: {
  title?: string;
  data?: AttendeeFragmentFragment | null;
}) {
  const { t } = useTranslation("conference");
  const { user } = useContext(AuthContext);
  const width = useWidth();

  const [deleteSubmission] = useDeleteSubmissionMutation();
  const [deleteSubmissionFile, { loading }] = useDeleteSubmissionFileMutation();

  return (
    <Grid padded={width < 400 ? "vertically" : true}>
      <Grid.Row columns={2}>
        <Grid.Column>
          <Header>{title}</Header>
        </Grid.Column>
        {data?.ticket.withSubmission && (
          <Grid.Column>
            <AddSubmissionDialog
              userId={user?.role === Role.Admin && data.user.id}
            />
          </Grid.Column>
        )}
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          {user?.role === Role.Admin ? (
            <UpdateInvoiceForm
              data={data?.invoice}
              downloadLink={
                <PDFGenerator
                  data={data?.invoice as Invoice}
                  conferenceLogoPath={data?.conference.logo.path as string}
                />
              }
            />
          ) : (
            <PDFGenerator
              data={data?.invoice as Invoice}
              conferenceLogoPath={data?.conference.logo.path as string}
            />
          )}
        </Grid.Column>
      </Grid.Row>
      {data?.submissions?.length !== 0 && (
        <Grid.Row>
          <Grid.Column>
            <Header>{t("dashboard.attendee.submission")}</Header>
            {data?.submissions?.map((submission) => (
              <Card fluid key={submission.id}>
                <Card.Content>
                  <Card.Header> {submission.name}</Card.Header>
                  <Card.Meta>{submission.section.name}</Card.Meta>
                  <Card.Description>
                    <List bulleted horizontal>
                      {submission.authors.map((a) => (
                        <List.Item key={a.id}>{a.name}</List.Item>
                      ))}
                    </List>
                    <p>{submission.abstract}</p>
                    <List bulleted horizontal>
                      {submission.keywords.map((k, i) => (
                        <List.Item key={i}>{k}</List.Item>
                      ))}
                    </List>
                  </Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <DeleteDialog
                    confirmCb={async () =>
                      (await deleteSubmission({
                        variables: { id: submission.id },
                        update(cache) {
                          cache.evict({ id: `Submission:${submission.id}` });
                        },
                      })) as Promise<void>
                    }
                    header={t("deleteSubmission.header")}
                    content={<p>{t("deleteSubmission.text")}</p>}
                    cancelText={t("actions.cancel", {
                      ns: "common",
                    })}
                    confirmText={t("actions.confirm", {
                      ns: "common",
                    })}
                  />
                  <UpdateSubmissionDialog
                    id={submission.id}
                    input={{
                      conferenceId: data.conference.id,
                      authors: [],
                      abstract: submission.abstract,
                      keywords: submission.keywords,
                      name: submission.name,
                      sectionId: submission.section.id,
                      translations: submission.translations.map((t) => ({
                        language: t.language,
                        name: t.name,
                        abstract: t.abstract,
                        keywords: t.keywords,
                      })),
                    }}
                  />
                  {submission.file ? (
                    <>
                      <Popup
                        content={t("deleteSubmissionFile")}
                        trigger={
                          <Button
                            loading={loading}
                            icon
                            size="tiny"
                            floated="right"
                            basic
                            as="a"
                            content="Zmazať"
                            onClick={async () =>
                              await deleteSubmissionFile({
                                variables: {
                                  id: submission.id,
                                  file: {
                                    id: submission.file!.id,
                                    path: submission.file!.path,
                                  },
                                },
                              })
                            }
                          />
                        }
                      />

                      <Popup
                        content={t("downloadSubmissionFile")}
                        trigger={
                          <Button
                            size="tiny"
                            floated="right"
                            secondary
                            icon="file"
                            as="a"
                            href={submission.file.clientSideUrl}
                          />
                        }
                      />
                    </>
                  ) : (
                    <AddSubmissionFileDialog id={submission.id} />
                  )}
                </Card.Content>
              </Card>
            ))}
          </Grid.Column>
        </Grid.Row>
      )}
    </Grid>
  );
}
