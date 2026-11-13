import { getAuthorFeedback, getAuthorWorkspace } from "@/lib/reviews/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RevisionPortalView from "@/app/[lng]/conferences/_components/revision-portal";
import { label } from "@/lib/reviews/types";
export default async function AuthorReviewFeedback({
  submission,
  lng,
}: {
  submission: string;
  lng: string;
}) {
  const [releases, workspace] = await Promise.all([
    getAuthorFeedback(submission),
    getAuthorWorkspace(submission),
  ]);
  if (
    !releases.length &&
    !workspace.revisions.length &&
    workspace.decision === "PENDING"
  )
    return null;
  return (
    <div className="mt-5 flex flex-col gap-4">
      {workspace.decision !== "PENDING" && (
        <Card>
          <CardHeader>
            <CardTitle>{label(workspace.decision, lng)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{workspace.reason}</p>
          </CardContent>
        </Card>
      )}
      {workspace.revisions
        .filter((r) => r.status !== "CANCELLED")
        .map((request) => (
          <RevisionPortalView
            key={request.id}
            initial={request}
            submission={submission}
            lng={lng}
          />
        ))}
      {releases.map((release) => {
        const feedback = release.feedback as {
          round: number;
          reports: {
            reviewer: string;
            recommendation: string;
            fields: { label: string; value: string | string[] }[];
          }[];
        };
        return (
          <Card key={release.id}>
            <CardHeader>
              <CardTitle>
                {lng === "en" ? "Review feedback" : "Recenzné posudky"} ·{" "}
                {feedback.round}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {feedback.reports.map((report, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <p className="font-medium">
                    {lng === "en" ? "Reviewer" : "Recenzent"} {index + 1}
                  </p>
                  <Badge variant="secondary">
                    {label(report.recommendation, lng)}
                  </Badge>
                  {report.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex}>
                      <p className="text-sm font-medium">{field.label}</p>
                      <p className="whitespace-pre-line text-sm text-muted-foreground">
                        {Array.isArray(field.value)
                          ? field.value.join(", ")
                          : field.value}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
