import { Formik, FormikConfig, FormikProps, FormikValues } from "formik";
import { Children, ReactElement, ReactNode, useState } from "react";
import {
  Button,
  Form,
  Grid,
  Icon,
  Segment,
  SemanticICONS,
  Step,
} from "semantic-ui-react";

interface WizzardStepProps
  extends Pick<FormikConfig<FormikValues>, "children" | "validationSchema"> {
  icon: SemanticICONS;
  title: string;
  description?: string;
}

export function WizzardStep({ children }: WizzardStepProps) {
  return <>{children}</>;
}

export function Wizzard({
  children,
  goBackCb,
  ...props
}: {
  children: ReactNode;
  goBackCb: () => void;
} & FormikConfig<FormikValues>) {
  const childrenArray = Children.toArray(
    children
  ) as ReactElement<WizzardStepProps>[];
  const [step, setStep] = useState(0);
  const currentChild = childrenArray[step];

  function isLastStep() {
    return step === childrenArray.length - 1;
  }

  function goBack() {
    if (step > 0) {
      setStep(step - 1);
    } else {
      goBackCb();
    }
  }

  return (
    <Formik
      {...props}
      validationSchema={currentChild.props.validationSchema}
      onSubmit={async (values, helpers) => {
        if (isLastStep()) {
          await props.onSubmit(values, helpers);
        } else {
          setStep((s) => s + 1);
        }
      }}
    >
      {({ handleSubmit, isSubmitting }: FormikProps<FormikValues>) => (
        <Form autoComplete="off" onSubmit={handleSubmit} loading={isSubmitting}>
          <Grid columns={2} stackable>
            <Grid.Column width={6}>
              <Step.Group fluid vertical>
                {childrenArray.map((s, i) => (
                  <Step key={i} active={i === step} completed={i < step}>
                    <Icon name={s.props.icon} />
                    <Step.Content>
                      <Step.Title>{s.props.title}</Step.Title>
                      <Step.Description>{s.props.description}</Step.Description>
                    </Step.Content>
                  </Step>
                ))}
              </Step.Group>
            </Grid.Column>
            <Grid.Column width={10}>
              <Segment>
                {currentChild}

                <Button
                  type="button"
                  onClick={() => goBack()}
                  content={step === 0 ? "Zrušiť" : "Back"}
                />
                <Button
                  positive
                  type="submit"
                  content={isLastStep() ? "Submit" : "Next"}
                  floated="right"
                />
              </Segment>
            </Grid.Column>
          </Grid>
        </Form>
      )}
    </Formik>
  );
}
