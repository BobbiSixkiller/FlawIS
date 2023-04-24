import { Invoice } from "../graphql/generated/schema";
import {
  PDFDownloadLink,
  Image,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { Button } from "semantic-ui-react";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

Font.register({
  family: "UKsans",
  fontWeight: 400,
  src: "https://flawis-backend.flaw.uniba.sk/public/UKsans/UKSans-Regular.otf",
});

Font.register({
  family: "UKsans",
  fontWeight: 700,
  src: "https://flawis-backend.flaw.uniba.sk/public/UKsans/UKSans-Bold.otf",
});

const styles = StyleSheet.create({
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    paddingHorizontal: "5px",
    paddingVertical: "5px",
    fontFamily: "UKsans",
    fontSize: "12px",
  },
  header: {
    flexDirection: "row",
    padding: "10px",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#b46b7a",
    fontWeight: 700,
    fontSize: "24px",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  table: {
    border: "1px solid #dddddd",
  },
});

export default function InvoiceDownload({
  conferenceLogo,
  data,
}: {
  conferenceLogo: string;
  data: Invoice;
}) {
  const { t } = useTranslation("invoice");
  const [client, setClient] = useState(false);

  useEffect(() => setClient(true), []);

  if (!client) {
    return (
      <Button
        loading={true}
        disabled={true}
        content={t("download")}
        color="red"
        icon="file pdf outline"
        type="button"
      />
    );
  }

  return (
    <PDFDownloadLink
      document={
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Image
                src={conferenceLogo}
                style={{ maxHeight: "100px", maxWidth: "300px" }}
              />
              <View style={{ flexDirection: "column" }}>
                <Text style={{ alignSelf: "flex-end" }}>{t("subject")}</Text>
                <Text style={{ alignSelf: "flex-end" }}>
                  {data.issuer.variableSymbol}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View
                style={{ width: "50%", flexDirection: "column", gap: "5px" }}
              >
                <Text>{t("invoice.issuer")}</Text>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>{t("invoice.name")}</Text>
                  <Text style={{ width: "50%" }}>{data.issuer.name}</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    gap: "5px",
                  }}
                >
                  <Text style={{ width: "50%" }}>
                    {t("invoice.address.street")}
                  </Text>
                  <Text style={{ width: "50%" }}>
                    {data.issuer.address.street}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>
                    {t("invoice.address.city")}
                  </Text>
                  <Text style={{ width: "50%" }}>
                    {data.issuer.address.city}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>
                    {t("invoice.address.postal")}
                  </Text>
                  <Text style={{ width: "50%" }}>
                    {data.issuer.address.postal}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>
                    {t("invoice.address.country")}
                  </Text>
                  <Text style={{ width: "50%" }}>
                    {data.issuer.address.country}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>{t("invoice.ICO")}</Text>
                  <Text style={{ width: "50%" }}>{data.issuer.ICO}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>{t("invoice.DIC")}</Text>
                  <Text style={{ width: "50%" }}>{data.issuer.DIC}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>{t("invoice.ICDPH")}</Text>
                  <Text style={{ width: "50%" }}>{data.issuer.ICDPH}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>
                    {t("invoice.variableSymbol")}
                  </Text>
                  <Text style={{ width: "50%" }}>
                    {data.issuer.variableSymbol}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>IBAN</Text>
                  <Text style={{ width: "50%" }}>{data.issuer.IBAN}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>SWIFT</Text>
                  <Text style={{ width: "50%" }}>{data.issuer.SWIFT}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>{t("invoice.issueDate")}</Text>
                  <Text style={{ width: "50%" }}>
                    {new Date(data.body.issueDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>{t("invoice.vatDate")}</Text>
                  <Text style={{ width: "50%" }}>
                    {new Date(data.body.vatDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>{t("dueDate.dueDate")}</Text>
                  <Text style={{ width: "50%" }}>
                    {new Date(data.body.dueDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View
                style={{ width: "50%", flexDirection: "column", gap: "5px" }}
              >
                <Text style={{ width: "50%" }}>{t("invoice.payer")}</Text>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>{t("invoice.name")}</Text>
                  <Text style={{ width: "50%" }}>{data.payer.name}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>
                    {t("invoice.address.street")}
                  </Text>
                  <Text style={{ width: "50%" }}>
                    {data.payer.address.street}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>
                    {t("invoice.address.city")}
                  </Text>
                  <Text style={{ width: "50%" }}>
                    {data.payer.address.city}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>
                    {t("invoice.address.postal")}
                  </Text>
                  <Text style={{ width: "50%" }}>
                    {data.payer.address.postal}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>
                    {t("invoice.address.country")}
                  </Text>
                  <Text style={{ width: "50%" }}>
                    {data.payer.address.country}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>{t("invoice.ICO")}</Text>
                  <Text style={{ width: "50%" }}>{data.payer.ICO}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>{t("invoice.DIC")}</Text>
                  <Text style={{ width: "50%" }}>{data.payer.DIC}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: "5px" }}>
                  <Text style={{ width: "50%" }}>{t("invoice.ICDPH")}</Text>
                  <Text style={{ width: "50%" }}>{data.payer.ICDPH}</Text>
                </View>
              </View>
            </View>
            <View style={styles.table}>
              <View
                style={{
                  flexDirection: "row",
                  borderBottom: "1px solid #dddddd",
                }}
              >
                <Text
                  style={{
                    borderRight: "1px solid #dddddd",
                    width: "70%",
                    padding: "5px 4px 5px 4px",
                    fontWeight: 700,
                  }}
                >
                  {t("item")}
                </Text>
                <Text style={{ padding: "5px 4px 5px 4px", fontWeight: 700 }}>
                  {t("price")}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  borderBottom: "1px solid #dddddd",
                }}
              >
                <Text
                  style={{
                    borderRight: "1px solid #dddddd",
                    width: "70%",
                    padding: "5px 4px 5px 4px",
                  }}
                >
                  {t("fee")}
                </Text>
                <Text style={{ padding: "5px 4px 5px 4px" }}>
                  {data.body.price} €
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  borderBottom: "1px solid #dddddd",
                }}
              >
                <Text
                  style={{
                    borderRight: "1px solid #dddddd",
                    width: "70%",
                    padding: "5px 4px 5px 4px",
                  }}
                >
                  {t("vat")}
                </Text>
                <Text style={{ padding: "5px 4px 5px 4px" }}>
                  {data.body.vat} €
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    borderRight: "1px solid #dddddd",
                    width: "70%",
                    padding: "5px 4px 5px 4px",
                  }}
                >
                  {t("sum")}
                </Text>
                <Text style={{ padding: "5px 4px 5px 4px" }}>
                  {data.body.price + data.body.vat} €
                </Text>
              </View>
            </View>
            <Text style={{ textAlign: "center" }}>{data.body.body}</Text>
            <Text style={{ textAlign: "center" }}>{data.body.comment}</Text>
            <Image
              src={data.issuer.stampUrl}
              style={{
                maxHeight: "100px",
                maxWidth: "200px",
                alignSelf: "center",
              }}
            />
          </Page>
        </Document>
      }
      fileName="invoice.pdf"
    >
      {({ loading }) => (
        <Button
          loading={loading}
          disabled={loading}
          content={t("download")}
          color="red"
          icon="file pdf outline"
          type="button"
        />
      )}
    </PDFDownloadLink>
  );
}
