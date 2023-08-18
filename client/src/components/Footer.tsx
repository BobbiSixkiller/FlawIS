import { useTranslation } from "next-i18next";

import { Segment, Container, Grid, Header, List } from "semantic-ui-react";

export default function Footer() {
  const { t } = useTranslation("common");

  return (
    <Segment inverted vertical style={{ padding: "5em 0em" }}>
      <Container>
        <Grid divided inverted stackable>
          <Grid.Row>
            <Grid.Column width={3}>
              <Header inverted as="h4" content={t("footer.menu.socials")} />
              <List link inverted>
                <List.Item
                  as="a"
                  href="https://www.instagram.com/praf_uk/"
                  target="_blank"
                >
                  Instagram
                </List.Item>
                <List.Item
                  as="a"
                  href="https://www.facebook.com/Comenius.University"
                  target="_blank"
                >
                  Facebook
                </List.Item>
                <List.Item
                  as="a"
                  href="https://www.flaw.uniba.sk/"
                  target="_blank"
                >
                  Web
                </List.Item>
              </List>
            </Grid.Column>
            <Grid.Column width={3}>
              <Header inverted as="h4" content={t("footer.menu.map")} />
              <List link inverted>
                <List.Item
                  as="a"
                  href="https://www.google.com/maps/place/Pr%C3%A1vnick%C3%A1+fakulta+UK/@48.1412189,17.113555,17z/data=!3m1!4b1!4m6!3m5!1s0x476c89013359c04f:0x658c6d05ac1933ca!8m2!3d48.1412153!4d17.1157437!16s%2Fg%2F11rb4qrpmr?hl=sk"
                >
                  Univerzita Komenského v Bratislave, Právnická fakulta
                  <br />
                  Šafárikovo nám. č. 6<br />
                  P.O.BOX 313
                  <br /> 810 00 Bratislava, Slovensko
                </List.Item>
              </List>
            </Grid.Column>
            <Grid.Column width={7}>
              <Header inverted as="h4" content={t("footer.heading")} />
              <p>{t("footer.text")}</p>
              <List horizontal inverted divided link size="small">
                <List.Item as="a" href="mailto:matus.muransky@flaw.uniba.sk">
                  {t("footer.menu.contact")}
                </List.Item>
                <List.Item
                  as="a"
                  href="https://uniba.sk/ochrana-osobnych-udajov/"
                  target="_blank"
                >
                  {t("footer.menu.terms")}
                </List.Item>
              </List>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    </Segment>
  );
}
