import { useState } from "react";
import { Submission, useConferenceQuery } from "../graphql/generated/schema";
import Validation from "../util/validation";
import { useRouter } from "next/router";
import { InferType } from "yup";

export default function SubmissionComponent({
  submissionData,
}: {
  submissionData: Submission;
}) {
  const [update, setUpdate] = useState(false);
  const router = useRouter();

  const { submissionInputSchema } = Validation();

  type Values = InferType<typeof submissionInputSchema>;

  const { data } = useConferenceQuery({
    variables: { slug: router.query.slug as string },
  });

  return (
    <div>seub</div>
    // <Formik
    //   initialValues={{
    //     submission: {
    //       conferenceId: "",
    //       sectionId: submissionData.section.id,
    //       name: submissionData.name,
    //       abstract: submissionData.abstract,
    //       keywords: submissionData.keywords,
    //       authors: [],
    //       translations: submissionData.translations,
    //     } as SubmissionInput,
    //   }}
    //   validationSchema={submissionInputSchema}
    //   onSubmit={async (values, actions) => {
    //     try {
    //     } catch (err: any) {
    //       actions.setStatus(
    //         parseErrors(
    //           err.graphQLErrors[0].extensions.exception.validationErrors
    //         )
    //       );
    //     }
    //   }}
    // >
    //   {({ handleSubmit, isSubmitting, resetForm }: FormikProps<Values>) => (
    //     <Form onSubmit={handleSubmit}>
    //       <Segment>
    //         <RegisterSubmission sections={data?.conference.sections} />

    //         {update ? (
    //           <Button.Group>
    //             <Button
    //               type="reset"
    //               onClick={() => {
    //                 resetForm();
    //                 setUpdate(false);
    //               }}
    //             >
    //               Cancel
    //             </Button>
    //             <Button.Or />
    //             <Button
    //               type="submit"
    //               positive
    //               disabled={isSubmitting}
    //               loading={isSubmitting}
    //             >
    //               Save
    //             </Button>
    //           </Button.Group>
    //         ) : (
    //           <Button
    //             primary
    //             type="button"
    //             content="Click to update"
    //             onClick={() => setUpdate(true)}
    //           />
    //         )}
    //       </Segment>
    //     </Form>
    //   )}
    // </Formik>
  );
}
