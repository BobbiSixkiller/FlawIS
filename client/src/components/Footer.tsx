import Image from "next/image";
import logo from "public/images/PraF_logo_text_BP_horizontal_inverted.png";

import {
  Segment,
  Container,
  Grid,
  Header,
  List,
  Divider,
} from "semantic-ui-react";

export default function Footer() {
  return (
    <Segment
      inverted
      style={{
        padding: "5em 0em",
      }}
      vertical
    >
      <Container textAlign="center">
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <Header inverted as="h4" content="About Conference System" />
              <p>
                This system is being developed and maitained by Faculty of Law,
                Comenius University in Bratislava. If you encounter any
                problems, please do not hesitate to contact us!
              </p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider inverted section />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Image
            alt="flaw-logo-notext"
            src={logo}
            height={130}
            width={300}
            priority={true}
          />
        </div>

        <List horizontal inverted divided link size="small">
          <List.Item as="a" href="#">
            Site Map
          </List.Item>
          <List.Item as="a" href="#">
            Contact Us
          </List.Item>
          <List.Item as="a" href="#">
            Terms & Privacy
          </List.Item>
        </List>
      </Container>
    </Segment>
  );
}
