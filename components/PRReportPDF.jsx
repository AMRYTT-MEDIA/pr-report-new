// import React from "react";
// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   Font,
//   Image,
// } from "@react-pdf/renderer";
// import { logoMapping } from "@/utils/logoMapping";

// // Define styles that match the UI
// const styles = StyleSheet.create({
//   page: {
//     flexDirection: "column",
//     backgroundColor: "#ffffff",
//     padding: 20,
//     fontFamily: "Helvetica",
//   },
//   header: {
//     marginBottom: 30,
//     textAlign: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#1f2937",
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#6b7280",
//     marginBottom: 20,
//   },
//   statsGrid: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 30,
//     gap: 20,
//   },
//   statCard: {
//     flex: 1,
//     border: "1px solid #e5e7eb",
//     borderRadius: 8,
//     padding: 16,
//     backgroundColor: "#ffffff",
//   },
//   statHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   statTitle: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#3b82f6",
//   },
//   statIcon: {
//     width: 24,
//     height: 24,
//     backgroundColor: "#eff6ff",
//     borderRadius: 6,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   statValue: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#111827",
//     marginBottom: 4,
//   },
//   statDescription: {
//     fontSize: 10,
//     color: "#6b7280",
//     marginTop: 3,
//   },
//   tableSection: {
//     marginTop: 20,
//   },
//   tableTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#111827",
//     marginBottom: 16,
//   },
//   table: {
//     border: "1px solid #e5e7eb",
//     borderRadius: 8,
//     overflow: "hidden",
//     break: false,
//     wrap: true,
//   },
//   tableHeader: {
//     backgroundColor: "#f9fafb",
//     flexDirection: "row",
//     borderBottom: "1px solid #e5e7eb",
//   },
//   tableHeaderCell: {
//     flex: 1,
//     padding: 12,
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#374151",
//     textAlign: "left",
//   },
//   tableRow: {
//     flexDirection: "row",
//     borderBottom: "1px solid #f3f4f6",
//     backgroundColor: "#ffffff",
//   },
//   tableCell: {
//     flex: 1,
//     padding: 12,
//     fontSize: 10,
//     color: "#374151",
//     textAlign: "left",
//     break: false,
//   },
//   outletCell: {
//     flex: 1,
//     padding: 12,
//     fontSize: 10,
//     color: "#374151",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   logoContainer: {
//     width: 120,
//     height: 38,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   logoImage: {
//     width: 120,
//     height: 38,
//     objectFit: "contain",
//   },
//   logoFallback: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     backgroundColor: "#3b82f6",
//     justifyContent: "center",
//     alignItems: "center",
//     border: "2px solid currentColor",
//     textAlign: "center",
//     display: "flex",
//     aspectRatio: "1 / 1",
//   },
//   logoFallbackText: {
//     color: "#ffffff",
//     fontSize: 12,
//     fontWeight: "bold",
//     textAlign: "center",
//     tracking: "wide",
//   },
//   websiteCell: {
//     flex: 1,
//     padding: 12,
//     fontSize: 10,
//     maxWidth: 300,
//     overflow: "hidden",
//   },
//   websiteName: {
//     color: "#374151",
//     marginBottom: 4,
//     fontWeight: "500",
//     fontSize: 10,
//   },
//   websiteUrl: {
//     color: "#3b82f6",
//     fontSize: 9,
//     maxWidth: 280,
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//     whiteSpace: "nowrap",
//     numberOfLines: 1,
//     wrap: false,
//   },
//   reachCell: {
//     flex: 1,
//     padding: 12,
//     fontSize: 10,
//     color: "#374151",
//     textAlign: "right",
//     fontWeight: "500",
//   },
//   badge: {
//     backgroundColor: "#10b981",
//     color: "#ffffff",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//     fontSize: 10,
//     fontWeight: "500",
//     textAlign: "center",
//     alignSelf: "flex-start",
//     marginBottom: 8,
//   },
//   badgeSecondary: {
//     backgroundColor: "#6b7280",
//     color: "#ffffff",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//     fontSize: 10,
//     fontWeight: "500",
//     textAlign: "center",
//     alignSelf: "flex-start",
//     marginBottom: 8,
//   },
// });

// const PRReportPDF = ({ report, formatData }) => {
//   const formatNumber = (num) => {
//     if (num === undefined || num === null || num === "") {
//       return "0";
//     }

//     let numValue;
//     if (typeof num === "string") {
//       numValue = parseFloat(num.replace(/,/g, ""));
//     } else {
//       numValue = Number(num);
//     }

//     if (isNaN(numValue)) {
//       return "0";
//     }

//     if (numValue >= 10000000) {
//       return `${(numValue / 1000000).toFixed(1)}M`;
//     } else if (numValue >= 1000000) {
//       return `${(numValue / 1000000).toFixed(2)}M`;
//     } else if (numValue >= 10000) {
//       return `${(numValue / 1000).toFixed(0)}K`;
//     } else if (numValue >= 1000) {
//       return `${(numValue / 1000).toFixed(1)}K`;
//     } else {
//       return numValue.toLocaleString();
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) {
//       return "Unknown date";
//     }

//     try {
//       return new Date(dateString).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       });
//     } catch {
//       return "Invalid date";
//     }
//   };

//   // Function to get logo URL for outlet and convert to base64 if needed
//   const getLogoUrl = (outletName) => {
//     // Check if we have a logo for this outlet
//     const logoPath = logoMapping[outletName];
//     if (logoPath) {
//       // Only return the path if it's a valid format and likely exists
//       if (logoPath.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
//         // For PDF, we need to convert the logo to base64 or use absolute URL
//         // Since we're in a browser environment, we can try to load the image
//         return logoPath;
//       }
//     }
//     return null;
//   };

//   // Function to convert image to base64 for PDF
//   const convertImageToBase64 = async (imagePath) => {
//     try {
//       // Create a canvas element
//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");

//       // Create an image element
//       const img = new Image();
//       img.crossOrigin = "anonymous";

//       return new Promise((resolve) => {
//         img.onload = () => {
//           canvas.width = img.width;
//           canvas.height = img.height;
//           ctx.drawImage(img, 0, 0);

//           // Convert to base64
//           const dataURL = canvas.toDataURL("image/png");
//           resolve(dataURL);
//         };

//         img.onerror = () => {
//           resolve(null);
//         };

//         // Set the source
//         img.src = imagePath;
//       });
//     } catch (error) {
//       console.error("Error converting image to base64:", error);
//       return null;
//     }
//   };

//   const outletsToUse = formatData || report.outlets || [];

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.title}>PR Report</Text>
//           {/* <Text style={styles.subtitle}>
//             Professional PR distribution and reporting platform
//           </Text> */}
//         </View>

//         {/* Stats Grid */}
//         <View style={styles.statsGrid}>
//           <View style={styles.statCard}>
//             <View style={styles.statHeader}>
//               <Text style={styles.statTitle}>Total Publications</Text>
//             </View>
//             <Text style={styles.statValue}>{report.total_outlets || 0}</Text>
//             <Text style={styles.statDescription}>Media outlets</Text>
//           </View>

//           <View style={styles.statCard}>
//             <View style={styles.statHeader}>
//               <Text style={styles.statTitle}>Total Reach</Text>
//             </View>
//             <Text style={styles.statValue}>
//               {formatNumber(report?.total_semrush_traffic)}
//             </Text>
//             <Text style={styles.statDescription}>Potential audience</Text>
//           </View>

//           <View style={styles.statCard}>
//             <View style={styles.statHeader}>
//               <Text style={styles.statTitle}>Report Status</Text>
//             </View>
//             <View
//               style={[
//                 report.status === "completed"
//                   ? styles.badge
//                   : styles.badgeSecondary,
//               ]}
//             >
//               <Text
//                 style={{ color: "#ffffff", fontSize: 10, fontWeight: "500" }}
//               >
//                 {report.status}
//               </Text>
//             </View>
//             <Text style={styles.statDescription}>
//               {report?.date_created
//                 ? `Created ${formatDate(report.date_created)}`
//                 : "Distribution complete"}
//             </Text>
//           </View>
//         </View>

//         {/* Media Outlets Table */}
//         <View style={styles.tableSection}>
//           <Text style={styles.tableTitle}>
//             PR Report : Media Outlets ({outletsToUse.length})
//           </Text>

//           <View style={styles.table}>
//             {/* Table Header */}
//             <View style={styles.tableHeader}>
//               <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>
//                 Outlet
//               </Text>
//               <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Website</Text>
//               <Text style={[styles.tableHeaderCell, { flex: 1 }]}>
//                 Potential Reach
//               </Text>
//             </View>

//             {/* Table Rows */}
//             {outletsToUse.map((outlet, index) => {
//               // Get logo URL for this outlet - now using base64 if available
//               const logoUrl =
//                 outlet.base64Logo ||
//                 getLogoUrl(outlet.original_website_name || outlet.website_name);
//               const firstChar = outlet.website_name.charAt(0).toUpperCase();

//               // Use the exact same color classes as PRReportViewer.jsx
//               const colorClasses = [
//                 "#1d4ed8", // text-blue-700
//                 "#047857", // text-green-700
//                 "#7c3aed", // text-purple-700
//                 "#d97706", // text-orange-700
//                 "#dc2626", // text-red-700
//                 "#4338ca", // text-indigo-700
//               ];
//               const fallbackColor = colorClasses[index % colorClasses.length];

//               return (
//                 <View key={index} style={styles.tableRow}>
//                   {/* Outlet Column */}
//                   <View style={[styles.outletCell, { flex: 1.5 }]}>
//                     <View style={styles.logoContainer}>
//                       {logoUrl ? (
//                         <Image
//                           src={logoUrl}
//                           style={styles.logoImage}
//                           cache={false}
//                         />
//                       ) : (
//                         <View
//                           style={[
//                             styles.logoFallback,
//                             {
//                               backgroundColor: fallbackColor,
//                               width: 38,
//                               height: 38,
//                               borderRadius: 19,
//                               justifyContent: "center",
//                               alignItems: "center",
//                               border: `2px solid ${fallbackColor}`,
//                               textAlign: "center",
//                               display: "flex",
//                               aspectRatio: "1 / 1",
//                             },
//                           ]}
//                         >
//                           <Text style={styles.logoFallbackText}>
//                             {firstChar}
//                           </Text>
//                         </View>
//                       )}
//                     </View>
//                   </View>

//                   {/* Website Column */}
//                   <View
//                     style={[
//                       styles.websiteCell,
//                       { flex: 2, overflow: "hidden" },
//                     ]}
//                   >
//                     <Text style={styles.websiteName}>
//                       {outlet.website_name}
//                     </Text>
//                     <Text
//                       style={[
//                         styles.websiteUrl,
//                         { maxWidth: 280, wrap: false },
//                       ]}
//                       numberOfLines={1}
//                     >
//                       {outlet.published_url}
//                     </Text>
//                   </View>

//                   {/* Potential Reach Column */}
//                   <View style={[styles.reachCell, { flex: 1 }]}>
//                     <Text>
//                       {formatNumber(
//                         outlet?.semrush_traffic || outlet?.potential_reach || 0
//                       )}
//                     </Text>
//                   </View>
//                 </View>
//               );
//             })}
//           </View>
//         </View>
//       </Page>
//     </Document>
//   );
// };

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
