import { AttendeeFragment } from "@/lib/graphql/generated/graphql";
import { translate } from "@/lib/i18n";
import {
  Image,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

import path from "path";

Font.register({
  family: "UKsans",
  fonts: [
    {
      fontWeight: 400,
      src: path.resolve("/usr/app/public/UKsans/UKSans-Regular.otf"),
    },
    {
      fontWeight: 700,
      src: path.resolve("/usr/app/public/UKsans/UKSans-Bold.otf"),
    },
  ],
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

export default async function InvoiceDoc({
  data,
  lng,
}: {
  data: AttendeeFragment;
  lng: string;
}) {
  const { t } = await translate(lng, "invoice");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image
            src={data.conference.translations[lng as "sk" | "en"].logoUrl}
            style={{ maxHeight: "100px", maxWidth: "300px" }}
          />
          <View style={{ flexDirection: "column" }}>
            <Text style={{ alignSelf: "flex-end" }}>{t("subject")}</Text>
            <Text style={{ alignSelf: "flex-end" }}>
              {data.invoice.issuer.variableSymbol}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ width: "50%", flexDirection: "column", gap: "5px" }}>
            <Text>{t("invoice.issuer")}</Text>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>{t("invoice.name")}</Text>
              <Text style={{ width: "50%" }}>{data.invoice.issuer.name}</Text>
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
                {data.invoice.issuer.address.street}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>{t("invoice.address.city")}</Text>
              <Text style={{ width: "50%" }}>
                {data.invoice.issuer.address.city}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>
                {t("invoice.address.postal")}
              </Text>
              <Text style={{ width: "50%" }}>
                {data.invoice.issuer.address.postal}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>
                {t("invoice.address.country")}
              </Text>
              <Text style={{ width: "50%" }}>
                {data.invoice.issuer.address.country}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>{t("invoice.ICO")}</Text>
              <Text style={{ width: "50%" }}>{data.invoice.issuer.ICO}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>{t("invoice.DIC")}</Text>
              <Text style={{ width: "50%" }}>{data.invoice.issuer.DIC}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>{t("invoice.ICDPH")}</Text>
              <Text style={{ width: "50%" }}>{data.invoice.issuer.ICDPH}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>
                {t("invoice.variableSymbol")}
              </Text>
              <Text style={{ width: "50%" }}>
                {data.invoice.issuer.variableSymbol}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>IBAN</Text>
              <Text style={{ width: "50%" }}>{data.invoice.issuer.IBAN}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>SWIFT</Text>
              <Text style={{ width: "50%" }}>{data.invoice.issuer.SWIFT}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>{t("invoice.issueDate")}</Text>
              <Text style={{ width: "50%" }}>
                {new Date(data.invoice.body.issueDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>{t("invoice.vatDate")}</Text>
              <Text style={{ width: "50%" }}>
                {new Date(data.invoice.body.vatDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>{t("invoice.dueDate")}</Text>
              <Text style={{ width: "50%" }}>
                {new Date(data.invoice.body.dueDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={{ width: "50%", flexDirection: "column", gap: "5px" }}>
            <Text style={{ width: "50%" }}>{t("invoice.payer")}</Text>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>{t("invoice.name")}</Text>
              <Text style={{ width: "50%" }}>{data.invoice.payer.name}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>
                {t("invoice.address.street")}
              </Text>
              <Text style={{ width: "50%" }}>
                {data.invoice.payer.address.street}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>{t("invoice.address.city")}</Text>
              <Text style={{ width: "50%" }}>
                {data.invoice.payer.address.city}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>
                {t("invoice.address.postal")}
              </Text>
              <Text style={{ width: "50%" }}>
                {data.invoice.payer.address.postal}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>
                {t("invoice.address.country")}
              </Text>
              <Text style={{ width: "50%" }}>
                {data.invoice.payer.address.country}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>{t("invoice.ICO")}</Text>
              <Text style={{ width: "50%" }}>{data.invoice.payer.ICO}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>{t("invoice.DIC")}</Text>
              <Text style={{ width: "50%" }}>{data.invoice.payer.DIC}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: "5px" }}>
              <Text style={{ width: "50%" }}>{t("invoice.ICDPH")}</Text>
              <Text style={{ width: "50%" }}>{data.invoice.payer.ICDPH}</Text>
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
              {data.invoice.body.price} €
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
              {data.invoice.body.vat} €
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
              {data.invoice.body.price + data.invoice.body.vat} €
            </Text>
          </View>
        </View>
        <Text style={{ textAlign: "center" }}>{data.invoice.body.body}</Text>
        <Text style={{ textAlign: "center" }}>{data.invoice.body.comment}</Text>
        <Image
          src={"http://client:3000/images/peciatka.jpeg"}
          style={{
            maxHeight: "100px",
            maxWidth: "200px",
            alignSelf: "center",
          }}
        />
      </Page>
    </Document>
  );
}
