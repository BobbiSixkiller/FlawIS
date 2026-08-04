import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import path from "path";

import { InvoiceFragment } from "@/lib/graphql/generated/graphql";
import { translate } from "@/lib/i18n";

const COLORS = {
  paper: "#FFFFFF",
  ink: "#15171A",
  muted: "#68707C",
  rule: "#D7DADF",
  panel: "#F3F4F6",
  accent: "#97357C",
};

Font.register({
  family: "UKsans",
  fonts: [
    {
      fontWeight: 400,
      src: path.resolve(
        process.cwd(),
        "public/UKsans/UKSans-Regular.otf",
      ),
    },
    {
      fontWeight: 500,
      src: path.resolve(
        process.cwd(),
        "public/UKsans/UKSans-Medium.otf",
      ),
    },
    {
      fontWeight: 700,
      src: path.resolve(process.cwd(), "public/UKsans/UKSans-Bold.otf"),
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.paper,
    color: COLORS.ink,
    fontFamily: "UKsans",
    fontSize: 9.5,
    paddingTop: 42,
    paddingHorizontal: 42,
    paddingBottom: 48,
  },
  accentRule: {
    backgroundColor: COLORS.accent,
    height: 3,
    marginBottom: 18,
    width: 52,
  },
  header: {
    alignItems: "flex-end",
    marginBottom: 36,
  },
  eyebrow: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: 500,
    letterSpacing: 1.2,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 23,
    fontWeight: 700,
    lineHeight: 1.05,
  },
  partyRow: {
    flexDirection: "row",
    gap: 34,
    marginBottom: 30,
  },
  party: {
    flex: 1,
  },
  sectionLabel: {
    borderBottomColor: COLORS.rule,
    borderBottomWidth: 1,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.7,
    marginBottom: 9,
    paddingBottom: 5,
    textTransform: "uppercase",
  },
  partyName: {
    fontSize: 11.5,
    fontWeight: 700,
    marginBottom: 3,
  },
  mutedText: {
    color: COLORS.muted,
  },
  identifiers: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  identifier: {
    flexDirection: "row",
    gap: 3,
  },
  identifierLabel: {
    color: COLORS.muted,
    fontSize: 8.5,
  },
  identifierValue: {
    fontSize: 8.5,
    fontWeight: 500,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 26,
    marginBottom: 32,
  },
  dates: {
    flex: 0.8,
    paddingTop: 9,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  detailLabel: {
    color: COLORS.muted,
    paddingRight: 12,
  },
  detailValue: {
    fontWeight: 500,
    textAlign: "right",
  },
  dueDate: {
    fontWeight: 700,
  },
  paymentPanel: {
    backgroundColor: COLORS.panel,
    borderLeftColor: COLORS.accent,
    borderLeftWidth: 3,
    flex: 1.2,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  paymentTitle: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.8,
    marginBottom: 9,
    textTransform: "uppercase",
  },
  paymentContent: {
    flexDirection: "row",
  },
  paymentCopy: {
    flex: 1,
  },
  amountDue: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 10,
  },
  paymentDetails: {
    flexDirection: "column",
  },
  table: {
    marginBottom: 22,
  },
  tableHeader: {
    borderBottomColor: COLORS.ink,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingBottom: 6,
  },
  tableRow: {
    borderBottomColor: COLORS.rule,
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingVertical: 10,
  },
  tableDescription: {
    flex: 1,
    paddingRight: 12,
  },
  tableAmount: {
    textAlign: "right",
    width: 90,
  },
  tableHeading: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  totals: {
    alignSelf: "flex-end",
    width: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  grandTotal: {
    backgroundColor: COLORS.panel,
    flexDirection: "row",
    fontSize: 12,
    fontWeight: 700,
    justifyContent: "space-between",
    marginTop: 3,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  notes: {
    borderTopColor: COLORS.rule,
    borderTopWidth: 1,
    marginTop: 24,
    paddingTop: 10,
  },
  noteLabel: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.6,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  footerLeft: {
    bottom: 20,
    color: COLORS.muted,
    fontSize: 7.5,
    left: 42,
    position: "absolute",
  },
  footerRight: {
    bottom: 20,
    color: COLORS.muted,
    fontSize: 7.5,
    left: 370,
    position: "absolute",
    textAlign: "right",
    width: 183,
  },
});

type BillingParty = InvoiceFragment["issuer"] | InvoiceFragment["payer"];

function Identifier({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null;

  return (
    <View style={styles.identifier}>
      <Text style={styles.identifierLabel}>{label}:</Text>
      <Text style={styles.identifierValue}>{value}</Text>
    </View>
  );
}

function PaymentDetail({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value?.trim()) return null;

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function Party({
  label,
  party,
  labels,
}: {
  label: string;
  party: BillingParty;
  labels: { ico: string; dic: string; icdph: string };
}) {
  return (
    <View style={styles.party} wrap={false}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={styles.partyName}>{party.name}</Text>
      <Text>{party.address.street}</Text>
      <Text>
        {party.address.postal} {party.address.city}
      </Text>
      <Text style={styles.mutedText}>{party.address.country}</Text>
      <View style={styles.identifiers}>
        <Identifier label={labels.ico} value={party.ICO} />
        <Identifier label={labels.dic} value={party.DIC} />
        <Identifier label={labels.icdph} value={party.ICDPH} />
      </View>
    </View>
  );
}

export default async function InvoiceDoc({
  invoice,
  lng,
}: {
  invoice: InvoiceFragment;
  lng: string;
}) {
  const locale = lng === "en" ? "en-GB" : "sk-SK";
  const { t } = await translate(lng, "invoice");
  const formatDate = (value: string | Date) =>
    new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  const formatMoney = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  const total = Number(invoice.body.price) + Number(invoice.body.vat);
  const number = invoice.issuer.variableSymbol;

  return (
    <Document
      author={invoice.issuer.name}
      language={lng}
      subject={invoice.body.body}
      title={`${invoice.body.type} ${number}`}
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.footerLeft} fixed>
          {`${invoice.body.type} ${number}`}
        </Text>
        <Text
          fixed
          style={styles.footerRight}
          render={({ pageNumber, totalPages }) =>
            `${t("page")} ${pageNumber}/${totalPages}`
          }
        />

        <View style={styles.accentRule} />
        <View style={styles.header} wrap={false}>
          <Text style={styles.eyebrow}>{t("documentNumber")}</Text>
          <Text style={styles.title}>
            {invoice.body.type} {number}
          </Text>
        </View>

        <View style={styles.partyRow}>
          <Party
            label={t("invoice.issuer")}
            party={invoice.issuer}
            labels={{
              ico: t("invoice.ICO"),
              dic: t("invoice.DIC"),
              icdph: t("invoice.ICDPH"),
            }}
          />
          <Party
            label={t("invoice.payer")}
            party={invoice.payer}
            labels={{
              ico: t("invoice.ICO"),
              dic: t("invoice.DIC"),
              icdph: t("invoice.ICDPH"),
            }}
          />
        </View>

        <View style={styles.summaryRow} wrap={false}>
          <View style={styles.dates}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("invoice.issueDate")}</Text>
              <Text style={styles.detailValue}>
                {formatDate(invoice.body.issueDate)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("invoice.vatDate")}</Text>
              <Text style={styles.detailValue}>
                {formatDate(invoice.body.vatDate)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("invoice.dueDate")}</Text>
              <Text style={[styles.detailValue, styles.dueDate]}>
                {formatDate(invoice.body.dueDate)}
              </Text>
            </View>
          </View>

          <View style={styles.paymentPanel}>
            <Text style={styles.paymentTitle}>{t("paymentDetails")}</Text>
            <View style={styles.paymentContent}>
              <View style={styles.paymentCopy}>
                <Text style={styles.amountDue}>{formatMoney(total)}</Text>
                <View style={styles.paymentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>
                      {t("invoice.variableSymbol")}
                    </Text>
                    <Text style={styles.detailValue}>{number}</Text>
                  </View>
                  <PaymentDetail
                    label={t("invoice.IBAN")}
                    value={invoice.issuer.IBAN}
                  />
                  <PaymentDetail
                    label={t("invoice.SWIFT")}
                    value={invoice.issuer.SWIFT}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableDescription, styles.tableHeading]}>
              {t("item")}
            </Text>
            <Text style={[styles.tableAmount, styles.tableHeading]}>
              {t("price")}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableDescription}>{invoice.body.body}</Text>
            <Text style={styles.tableAmount}>
              {formatMoney(Number(invoice.body.price))}
            </Text>
          </View>
        </View>

        <View style={styles.totals} wrap={false}>
          <View style={styles.totalRow}>
            <Text style={styles.mutedText}>{t("netPrice")}</Text>
            <Text>{formatMoney(Number(invoice.body.price))}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.mutedText}>{t("vat")}</Text>
            <Text>{formatMoney(Number(invoice.body.vat))}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>{t("sum")}</Text>
            <Text>{formatMoney(total)}</Text>
          </View>
        </View>

        <View style={styles.notes}>
          <Text style={styles.noteLabel}>{t("note")}</Text>
          <Text>{invoice.body.comment}</Text>
        </View>

      </Page>
    </Document>
  );
}
