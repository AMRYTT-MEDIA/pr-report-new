// export default PRReportPDF;

// PRReportPDF.js
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { logoMapping } from "@/utils/logoMapping";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // Header (first page only)
  header: { textAlign: "center", marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 700, color: "#1f2937" },

  // Stats
  statsGrid: { marginTop: 16, flexDirection: "row" },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
  },
  statCardSpacer: { width: 20 },
  statTitle: { fontSize: 10, fontWeight: 600, color: "#3b82f6" },
  statValue: { fontSize: 16, fontWeight: 700, color: "#111827", marginTop: 6 },
  statDescription: { fontSize: 9, color: "#6b7280", marginTop: 4 },

  // Badges
  badge: {
    marginTop: 6,
    alignSelf: "flex-start",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "#10b981",
  },
  badgeSecondary: {
    marginTop: 6,
    alignSelf: "flex-start",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "#6b7280",
  },
  badgeText: { color: "#ffffff", fontSize: 9, fontWeight: 600 },

  // Table
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    marginTop: 20,
    marginBottom: 10,
  },
  tableOuter: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  th: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 10,
    fontWeight: 700,
    color: "#374151",
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#ffffff",
  },
  td: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 9,
    color: "#374151",
  },

  // Outlet col
  outletCell: { justifyContent: "center", alignItems: "center" },
  logoContainer: {
    width: 100,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: { width: 100, height: 24, objectFit: "contain" }, // smaller height

  logoFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  logoFallbackText: { color: "#ffffff", fontSize: 10, fontWeight: 700 },

  // Website col
  websiteName: {
    color: "#374151",
    fontWeight: 600,
    fontSize: 9,
    marginBottom: 2,
  },
  websiteUrl: { color: "#3b82f6", fontSize: 8, wrap: false },

  // Reach col
  reachCell: { textAlign: "right", fontWeight: 600 },
});

// Prevent row splitting
const Row = ({ children, style }) => (
  <View wrap={false} style={[styles.tr, style]}>
    {children}
  </View>
);

const formatNumber = (num) => {
  if (num === undefined || num === null || num === "") return "0";
  const n =
    typeof num === "string" ? parseFloat(num.replace(/,/g, "")) : Number(num);
  if (Number.isNaN(n)) return "0";
  if (n >= 10_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(0)}K`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

const formatDate = (dateString) => {
  if (!dateString) return "Unknown date";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid date";
  }
};

const getLogoUrl = (outletName) => {
  if (!outletName) return null;
  const src = logoMapping[outletName];
  return src || null;
};

const PRReportPDF = ({ report, formatData }) => {
  const outlets = formatData || report.outlets || [];
  const colorPalette = [
    "#1d4ed8",
    "#047857",
    "#7c3aed",
    "#d97706",
    "#dc2626",
    "#4338ca",
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header – only rendered once (not fixed) */}
        <View style={styles.header}>
          <Text style={styles.title}>PR Report</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Total Publications</Text>
            <Text style={styles.statValue}>{report.total_outlets || 0}</Text>
            <Text style={styles.statDescription}>Media outlets</Text>
          </View>
          <View style={styles.statCardSpacer} />
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Total Reach</Text>
            <Text style={styles.statValue}>
              {formatNumber(report?.total_semrush_traffic)}
            </Text>
            <Text style={styles.statDescription}>Potential audience</Text>
          </View>
          <View style={styles.statCardSpacer} />
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Report Status</Text>
            <View
              style={
                report.status === "completed"
                  ? styles.badge
                  : styles.badgeSecondary
              }
            >
              <Text style={styles.badgeText}>{report.status || "unknown"}</Text>
            </View>
            <Text style={styles.statDescription}>
              {report?.date_created
                ? `Created ${formatDate(report.date_created)}`
                : "Distribution complete"}
            </Text>
          </View>
        </View>

        {/* Table */}
        <Text style={styles.sectionTitle}>
          PR Report : Media Outlets ({outlets.length})
        </Text>

        <View style={styles.tableOuter}>
          {/* Table Header (only first page, not repeated) */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { flex: 1.5 }]}>Outlet</Text>
            <Text style={[styles.th, { flex: 2 }]}>Website</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>
              Potential Reach
            </Text>
          </View>

          {/* Table Body */}
          {outlets.map((outlet, idx) => {
            const logoUrl =
              outlet.base64Logo ||
              getLogoUrl(outlet.original_website_name || outlet.website_name);
            const firstChar = (outlet.website_name || "?")
              .charAt(0)
              .toUpperCase();
            const fallbackColor = colorPalette[idx % colorPalette.length];

            return (
              <Row key={`${outlet.website_name}-${idx}`}>
                {/* Outlet */}
                <View style={[styles.td, styles.outletCell, { flex: 1.5 }]}>
                  <View style={styles.logoContainer}>
                    {logoUrl ? (
                      <Image src={logoUrl} style={styles.logoImage} />
                    ) : (
                      <View
                        style={[
                          styles.logoFallback,
                          { backgroundColor: fallbackColor },
                        ]}
                      >
                        <Text style={styles.logoFallbackText}>{firstChar}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Website */}
                <View
                  style={{ flex: 2, paddingVertical: 8, paddingHorizontal: 8 }}
                >
                  <Text style={styles.websiteName}>{outlet.website_name}</Text>
                  <Text style={styles.websiteUrl} maxLines={1}>
                    {outlet.published_url || ""}
                  </Text>
                </View>

                {/* Reach */}
                <View
                  style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 8 }}
                >
                  <Text style={[styles.td, styles.reachCell]}>
                    {formatNumber(outlet?.semrush_traffic ?? 0)}
                  </Text>
                </View>
              </Row>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};

export default PRReportPDF;
