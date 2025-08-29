"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  Copy,
  ExternalLink,
  Shield,
  Eye,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  Download,
  Share2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { logoMapping } from "@/utils/logoMapping";
import { trustBadgeService } from "@/services/trustBadges";
import api from "@/lib/api";

/**
 * TrustBadgeModal Component
 *
 * This component handles trust badge generation, preview, and management.
 *
 * Badge Loading Priority:
 * 1. directBadgeId - Direct badge ID (uses GET /trust-badges/:badgeId)
 * 2. existingBadgeId - Existing badge ID from props
 * 3. grid_id - Search for badge by grid ID
 *
 * Data sent to backend includes:
 * - badgeId: Unique identifier for the badge
 * - htmlContent: Complete HTML template with CSS and JavaScript
 * - htmlPreview: Same as htmlContent for consistency
 * - websites: Array of selected websites with metadata
 * - previewConfig: Complete configuration object with all styling options
 * - generatedAt: ISO timestamp of generation
 * - metadata: Additional badge information
 * - previewGenerated: Boolean flag indicating preview was generated
 * - previewGeneratedAt: ISO timestamp of preview generation
 */
const TrustBadgeModal = ({
  isOpen,
  onClose,
  outlets = [],
  grid_id, // Changed from reportId to grid_id
  existingBadgeId = null,
  directBadgeId = null, // New prop for direct badge ID
  reportId,
}) => {
  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const [activeTab, setActiveTab] = useState("select");
  const [badgeId, setBadgeId] = useState(existingBadgeId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBadge, setGeneratedBadge] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [badgeName, setBadgeName] = useState("");
  const [badgeDescription, setBadgeDescription] = useState("");
  const [userBadges, setUserBadges] = useState([]);
  const [showBadgeList, setShowBadgeList] = useState(false);

  // Filter outlets that have published URLs and website names
  const availableWebsites = outlets.filter(
    (outlet) => outlet.published_url && outlet.website_name
  );

  // Load existing badge if badgeId is provided
  useEffect(() => {
    if (existingBadgeId) {
      loadExistingBadge(existingBadgeId);
    }
  }, []);

  // Auto-detect existing badge when modal opens
  useEffect(() => {
    if (isOpen) {
      if (directBadgeId) {
        setBadgeId(directBadgeId);
        loadExistingBadge(directBadgeId);
      } else if (existingBadgeId) {
        setBadgeId(existingBadgeId);
        loadExistingBadge(existingBadgeId);
      } else if (grid_id) {
        checkForExistingBadge();
      }
    }
  }, [isOpen, directBadgeId, existingBadgeId, grid_id]);

  // Load badges when manage tab is opened
  useEffect(() => {
    if (activeTab === "manage" && grid_id) {
      loadAllBadges();
    }
  }, [activeTab, grid_id]);

  const checkForExistingBadge = async () => {
    try {
      setIsLoading(true);

      const response = await api.get(`/trust-badges/all-badges/${grid_id}`);
      const data = await response.json();

      if (response.ok && data.success && data.badge) {
        setBadgeId(data.badge.id);
        setBadgeName(data.badge.name || "");
        setBadgeDescription(data.badge.description || "");

        setGeneratedBadge({
          badgeId: data.badge.id,
          embedCode: `<script src="${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
          }/api/trust-badges/${data.badge.id}.js"></script>`,
          previewUrl: `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
          }/api/trust-badges/${data.badge.id}/preview`,
          message: "Badge loaded successfully",
          data: data.badge,
          htmlPreview: data.badge.htmlPreview || null,
          previewGenerated: data.badge.previewGenerated || false,
          previewGeneratedAt: data.badge.previewGeneratedAt || null,
        });

        if (data.badge.websites && data.badge.websites.length > 0) {
          setSelectedWebsites(data.badge.websites);
          toast.success(
            `Found existing badge: ${data.badge.name || "Untitled Badge"}`
          );
        }

        setIsEditing(true);
        setActiveTab("select");

        return data.badge;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing badge data
  const loadExistingBadge = async (badgeId) => {
    try {
      setIsLoading(true);
      const response = await trustBadgeService.getBadge(badgeId);
      if (response.success) {
        const badge = response.badge;

        // Set badge data
        setGeneratedBadge({
          badgeId: badge.id,
          embedCode: `<script src="${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
          }/api/trust-badges/${badge.id}.js"></script>`,
          previewUrl: `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
          }/api/trust-badges/${badge.id}/preview`,
          message: "Badge loaded successfully",
          data: badge,
          htmlPreview: badge.htmlPreview || null,
          previewGenerated: badge.previewGenerated || false,
          previewGeneratedAt: badge.previewGeneratedAt || null,
        });

        // Set badge details
        setBadgeName(badge.name || "");
        setBadgeDescription(badge.description || "");

        // Set editing mode since we're loading an existing badge
        setIsEditing(true);

        if (badge.websites && badge.websites.length > 0) {
          setSelectedWebsites(badge.websites);
          setActiveTab("select");
          toast.success(
            `Loaded ${badge.websites.length} previously selected websites`
          );
        } else {
          setSelectedWebsites([]);
          setActiveTab("select");
        }
      }
    } catch (error) {
      toast.error("Failed to load existing badge");
    } finally {
      setIsLoading(false);
    }
  };

  // Load all badges for the current grid
  const loadAllBadges = async () => {
    if (!grid_id) {
      toast.error("No grid ID available");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get(`/trust-badges/all-badges/${grid_id}`);
      const data = await response.json();

      if (response.ok && data.success && data.badges) {
        setUserBadges(data.badges);
      } else {
        setUserBadges([]);
      }
    } catch (error) {
      toast.error("Failed to load badges");
      setUserBadges([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get logo URL for a website
  const getLogoUrl = (websiteName) => {
    return logoMapping[websiteName] || null;
  };

  // Handle website selection
  const handleWebsiteToggle = (website) => {
    setSelectedWebsites((prev) => {
      const isSelected = prev.find((w) => w.id === website.id);

      if (isSelected) {
        // Remove from selection
        return prev.filter((w) => w.id !== website.id);
      } else if (prev.length < 6) {
        // Add to selection
        return [...prev, website];
      }
      return prev;
    });
  };

  // Clear all selections
  const handleClearAll = () => {
    setSelectedWebsites([]);
  };

  // Generate trust badge
  const generateBadge = async () => {
    if (selectedWebsites.length < 3) {
      toast.error("Please select at least 3 websites");
      return;
    }

    setIsGenerating(true);
    try {
      // Prepare badge data with enhanced information
      const badgeData = {
        grid_id: reportId,
        htmlPreview: generateHTMLTemplate(), // Generate HTML preview immediately
        websites: selectedWebsites.map((website) => ({
          id: website.id,
          website_name: website.website_name,
          published_url: website.published_url,
          logo_url: getLogoUrl(website.website_name),
          // Add any additional website metadata
          domain: website.published_url
            ? new URL(website.published_url).hostname
            : null,
          publication_date:
            website.publication_date || new Date().toISOString(),
        })),
        userId: "current_user", // This would come from auth context in production
        name: badgeName || `Trust Badge - ${new Date().toLocaleDateString()}`,
        description:
          badgeDescription || `Trust badge generated from grid ${grid_id}`,
        metadata: {
          totalWebsites: selectedWebsites.length,
          generatedAt: new Date().toISOString(),
          grid_id: grid_id, // Use grid_id consistently
          badgeType: "trust_badge",
          version: "1.0",
        },
        // Preview configuration with all available options
        previewConfig: {
          showLogos: true,
          showLaurels: true,
          showVerifiedBadge: true,
          customColors: {
            primary: "#60a5fa",
            secondary: "#fde68a",
            accent: "#3b82f6",
          },
          // Additional configuration options
          badgeStyle: "modern",
          animationSpeed: "normal",
          responsive: true,
          theme: "light",
          layout: "horizontal",
          maxLogos: 6,
          logoSize: "medium",
          spacing: "comfortable",
        },
        // Add preview generation timestamp
        previewGenerated: true,
        previewGeneratedAt: new Date().toISOString(),
      };

      let response;
      if (badgeId && isEditing) {
        // Update existing badge
        response = await trustBadgeService.updateBadge(badgeId, badgeData);
        if (response.success) {
          toast.success("Trust badge updated successfully!");
        }
      } else {
        // Generate new badge
        response = await trustBadgeService.generateBadge(badgeData);
        if (response.success) {
          setBadgeId(response.badgeId);
          setIsEditing(false);
          toast.success(
            response.message || "Trust badge generated successfully!"
          );
        }
      }

      if (response.success) {
        // Enhanced generated badge object - API response has data directly in root
        const enhancedBadge = {
          ...response,
          // Use the htmlPreview from the API response if available, otherwise fall back to generated one
          htmlPreview: response.htmlPreview || badgeData.htmlPreview,
          previewUrl:
            response.previewUrl ||
            `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
            }/api/trust-badges/${response.badgeId}/preview`,
          embedCode:
            response.embedCode ||
            `<script src="${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
            }/api/trust-badges/${response.badgeId}.js"></script>`,
          previewGenerated: true,
          previewGeneratedAt: new Date().toISOString(),
          // Add preview data for immediate use
          previewData: {
            badgeId: response.badgeId,
            websites: response.websites || badgeData.websites,
            config: badgeData.previewConfig,
            generatedAt: badgeData.metadata.generatedAt,
          },
        };

        setGeneratedBadge(enhancedBadge);
        setActiveTab("preview");
        setIsEditing(false);
      } else {
        throw new Error(response.error || "Failed to generate badge");
      }
    } catch (error) {
      toast.error(
        error.message || "Failed to generate badge. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to generate and send HTML preview to backend
  const generateAndSendPreview = async (badgeData) => {
    try {
      // Generate complete HTML template
      const htmlTemplate = generateHTMLTemplate();

      // Prepare preview data for backend
      const previewData = {
        badgeId: badgeId || generatedBadge?.badgeId,
        htmlContent: htmlTemplate,
        htmlPreview: htmlTemplate, // For consistency
        websites: selectedWebsites.map((website) => ({
          id: website.id,
          website_name: website.website_name,
          published_url: website.published_url,
          logo_url: getLogoUrl(website.website_name),
          domain: website.published_url
            ? new URL(website.published_url).hostname
            : null,
        })),
        previewConfig: badgeData.previewConfig,
        generatedAt: new Date().toISOString(),
        metadata: {
          totalWebsites: selectedWebsites.length,
          grid_id: grid_id, // Changed from reportId to grid_id
          userId: "current_user",
        },
      };

      // Send preview data to backend
      const previewResponse = await trustBadgeService.updateBadge(
        badgeId || generatedBadge?.badgeId,
        {
          ...previewData,
          previewGenerated: true,
          previewGeneratedAt: new Date().toISOString(),
        }
      );

      if (previewResponse.success) {
        setGeneratedBadge((prev) => ({
          ...prev,
          htmlPreview: htmlTemplate,
          previewGenerated: true,
          previewGeneratedAt: new Date().toISOString(),
        }));
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Delete badge
  const deleteBadge = async (badgeIdToDelete) => {
    if (!badgeIdToDelete) return;

    if (
      confirm(
        "Are you sure you want to delete this trust badge? This action cannot be undone."
      )
    ) {
      try {
        setIsLoading(true);
        const response = await trustBadgeService.deleteBadge(badgeIdToDelete);
        if (response.success) {
          toast.success("Trust badge deleted successfully");

          // If we're deleting the currently selected badge, reset the modal
          if (badgeIdToDelete === badgeId) {
            handleClose();
          } else {
            // Refresh the badges list
            loadAllBadges();
          }
        }
      } catch (error) {
        toast.error("Failed to delete badge");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Copy embed code to clipboard
  const copyEmbedCode = async () => {
    if (!generatedBadge) return;

    try {
      await navigator.clipboard.writeText(generatedBadge.embedCode);
      toast.success("Embed code copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy embed code");
    }
  };

  // Copy HTML preview to clipboard
  const copyHTMLPreview = async () => {
    if (!generatedBadge?.htmlPreview) return;

    try {
      await navigator.clipboard.writeText(generatedBadge.htmlPreview);
      toast.success("HTML preview copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy HTML preview");
    }
  };

  // Download badge as image (placeholder for future implementation)
  const downloadBadge = () => {
    toast.info("Download feature coming soon!");
  };

  // Generate complete HTML template for the trust badge
  const generateHTMLTemplate = () => {
    const websiteData = selectedWebsites.map((website) => ({
      name: website.website_name,
      url: website.published_url,
      logo: getLogoUrl(website.website_name),
      domain: website.published_url
        ? new URL(website.published_url).hostname
        : null,
    }));

    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trust Badge Preview - ${badgeName || "Generated Badge"}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .trust-badge-container {
            display: inline-block;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 20px 0;
        }
        
        .trust-badge-card {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #93c5fd;
            border-radius: 16px;
            padding: 24px;
            position: relative;
            transform: rotate(-1deg);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: rotate(-1deg) translateY(0px); }
            50% { transform: rotate(-1deg) translateY(-10px); }
        }
        
        .trust-badge-header {
            text-align: center;
            margin-bottom: 24px;
        }
        
        .trust-badge-title {
            font-size: 18px;
            font-weight: 700;
            color: #374151;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin: 0;
        }
        
        .trust-badge-logos {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
            margin-bottom: 24px;
        }
        
        .trust-badge-laurel {
            display: flex;
            justify-content: center;
            color: #60a5fa;
            animation: sparkle 2s ease-in-out infinite;
        }
        
        @keyframes sparkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        .trust-badge-laurel svg {
            width: 32px;
            height: 32px;
        }
        
        .trust-badge-logo-grid {
            display: flex;
            flex-direction: row;
            gap: 24px;
            align-items: center;
        }
        
        .trust-badge-logo-item {
            text-align: center;
            transition: transform 0.3s ease;
        }
        
        .trust-badge-logo-item:hover {
            transform: scale(1.05);
        }
        
        .trust-badge-logo {
            width: 80px;
            height: 40px;
            object-fit: contain;
            margin-bottom: 8px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .trust-badge-logo-fallback {
            width: 80px;
            height: 40px;
            background: #e5e7eb;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            font-weight: bold;
            color: #374151;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .trust-badge-logo-text {
            font-size: 12px;
            color: #374151;
            font-weight: 500;
            text-transform: uppercase;
            max-width: 80px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .trust-badge-subtitle {
            text-align: center;
            margin-bottom: 16px;
        }
        
        .trust-badge-subtitle-text {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
        }
        
        .trust-badge-footer {
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .trust-badge-verified {
            font-size: 12px;
            color: #3b82f6;
            font-weight: 500;
        }
        
        .trust-badge-checkmark {
            width: 16px;
            height: 16px;
            color: #3b82f6;
            animation: bounce 2s ease-in-out infinite;
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-5px); }
            60% { transform: translateY(-3px); }
        }
        
        .trust-badge-top-line,
        .trust-badge-bottom-line {
            position: absolute;
            left: 0;
            right: 0;
            height: 4px;
            background: #60a5fa;
            border-radius: 2px;
            animation: slideIn 1s ease-out;
        }
        
        @keyframes slideIn {
            from { width: 0; }
            to { width: 100%; }
        }
        
        .trust-badge-top-line {
            top: 0;
            border-top-left-radius: 14px;
            border-top-right-radius: 14px;
        }
        
        .trust-badge-bottom-line {
            bottom: 0;
            border-bottom-left-radius: 14px;
            border-bottom-right-radius: 14px;
        }
        
        .preview-header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }
        
        .preview-header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .preview-header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .badge-info {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            color: white;
            text-align: center;
        }
        
        .badge-info h3 {
            margin-bottom: 15px;
            font-size: 1.3rem;
        }
        
        .badge-info p {
            margin-bottom: 8px;
            opacity: 0.9;
        }
        
        @media (max-width: 480px) {
            .trust-badge-card {
                padding: 16px;
                transform: none;
            }
            
            .trust-badge-logos {
                gap: 12px;
            }
            
            .trust-badge-logo-grid {
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .preview-header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
   
   
    <div class="trust-badge-container">
        <div class="trust-badge-card">
            <div class="trust-badge-top-line"></div>
            <div class="trust-badge-bottom-line"></div>
            
            <div class="trust-badge-header">
                <h3 class="trust-badge-title">AS SEEN ON</h3>
            </div>
            
            <div class="trust-badge-logos">
                <div class="trust-badge-laurel">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                    </svg>
                </div>
                
                <div class="trust-badge-logo-grid">
                    ${websiteData
                      .slice(0, 3)
                      .map(
                        (website, index) => `
                        <div class="trust-badge-logo-item">
                            ${
                              website.logo
                                ? `<img src="${website.logo}" alt="${website.name}" class="trust-badge-logo">`
                                : `<div class="trust-badge-logo-fallback">${website.name
                                    .charAt(0)
                                    .toUpperCase()}</div>`
                            }
                        </div>
                    `
                      )
                      .join("")}
                </div>
                
                <div class="trust-badge-laurel">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                    </svg>
                </div>
            </div>
            
            ${
              selectedWebsites.length > 3
                ? `
                <div class="trust-badge-logos" style="margin-top: 20px;">
                    <div class="trust-badge-logo-grid">
                        ${websiteData
                          .slice(3)
                          .map(
                            (website, index) => `
                            <div class="trust-badge-logo-item">
                                ${
                                  website.logo
                                    ? `<img src="${website.logo}" alt="${website.name}" class="trust-badge-logo" style="width: 60px; height: 30px;">`
                                    : `<div class="trust-badge-logo-fallback" style="width: 60px; height: 30px;">${website.name
                                        .charAt(0)
                                        .toUpperCase()}</div>`
                                }
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
            `
                : ""
            }
            
            <div class="trust-badge-subtitle">
                <p class="trust-badge-subtitle-text">AND OVER ${Math.max(
                  300,
                  selectedWebsites.length * 50
                )} NEWS SITES</p>
            </div>
            
            <div class="trust-badge-footer">
                <svg class="trust-badge-checkmark" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
                <span class="trust-badge-verified">Verified by BrandPush.co</span>
            </div>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const badge = document.querySelector('.trust-badge-card');
            
            badge.addEventListener('click', function() {
                this.style.transform = 'rotate(-1deg) scale(1.02)';
                setTimeout(() => {
                    this.style.transform = 'rotate(-1deg) scale(1)';
                }, 200);
            });
            
            badge.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
            });
            
            badge.addEventListener('mouseleave', function() {
                this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
            });
        });
    </script>
</body>
</html>`;

    return htmlTemplate;
  };

  // Generate and send preview to backend
  const generatePreview = async () => {
    if (!generatedBadge || !badgeId) return;

    try {
      setIsLoading(true);

      // Generate complete HTML template
      const htmlTemplate = generateHTMLTemplate();

      // Prepare preview data for backend with complete previewConfig
      const previewData = {
        badgeId: badgeId,
        htmlPreview: htmlTemplate,
        grid_id: reportId,
        websites: selectedWebsites.map((website) => ({
          id: website.id,
          website_name: website.website_name,
          published_url: website.published_url,
          logo_url: getLogoUrl(website.website_name),
          domain: website.published_url
            ? new URL(website.published_url).hostname
            : null,
        })),
        // previewConfig: {
        //   showLogos: true,
        //   showLaurels: true,
        //   showVerifiedBadge: true,
        //   customColors: {
        //     primary: "#60a5fa",
        //     secondary: "#fde68a",
        //     accent: "#3b82f6",
        //   },
        //   // Additional configuration options
        //   badgeStyle: "modern",
        //   animationSpeed: "normal",
        //   responsive: true,
        //   theme: "light",
        //   layout: "horizontal",
        //   maxLogos: 6,
        //   logoSize: "medium",
        //   spacing: "comfortable",
        // },
        generatedAt: new Date().toISOString(),
        metadata: {
          totalWebsites: selectedWebsites.length,
          grid_id: grid_id, // Changed from reportId to grid_id
          userId: "current_user",
        },
      };

      // Send preview data to backend with HTML content
      const response = await trustBadgeService.updateBadge(badgeId, {
        ...previewData,
        previewGenerated: true,
        previewGeneratedAt: new Date().toISOString(),
        htmlPreview: htmlTemplate, // Send the complete HTML
      });

      if (response.success) {
        toast.success("Complete HTML preview generated and sent to backend!");

        // Update the generated badge with preview confirmation
        setGeneratedBadge((prev) => ({
          ...prev,
          previewGenerated: true,
          previewGeneratedAt: new Date().toISOString(),
          htmlPreview: htmlTemplate, // Store locally for immediate use
        }));
      }
    } catch (error) {
      toast.error("Failed to generate preview");
    } finally {
      setIsLoading(false);
    }
  };

  // Share badge
  const shareBadge = async () => {
    if (!generatedBadge) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Trust Badge",
          text: "Check out my trust badge!",
          url: generatedBadge.previewUrl,
        });
      } else {
        // Fallback: copy preview URL
        await navigator.clipboard.writeText(generatedBadge.previewUrl);
        toast.success("Preview URL copied to clipboard!");
      }
    } catch (error) {
      toast.error("Failed to share badge");
    }
  };

  // Reset modal state when closing
  const handleClose = () => {
    setSelectedWebsites([]);
    setActiveTab("select");
    setBadgeId(null);
    setGeneratedBadge(null);
    setIsEditing(false);
    setBadgeName("");
    setBadgeDescription("");
    setShowBadgeList(false);
    onClose();
  };

  // Validation messages
  const getValidationMessage = () => {
    if (selectedWebsites.length === 0) {
      return { type: "error", message: "Please select websites to continue" };
    } else if (selectedWebsites.length < 3) {
      return {
        type: "warning",
        message: `Please select ${3 - selectedWebsites.length} more website(s)`,
      };
    } else if (selectedWebsites.length > 6) {
      return { type: "error", message: "Maximum 6 websites allowed" };
    } else {
      return {
        type: "success",
        message: `${selectedWebsites.length} websites selected`,
      };
    }
  };

  const validation = getValidationMessage();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            {badgeId || isEditing ? "Edit Trust Badge" : "Generate Trust Badge"}
          </DialogTitle>
          {(badgeId || isEditing) && (
            <p className="text-sm text-muted-foreground mt-1">
              {badgeId ? `Badge ID: ${badgeId}` : "Editing existing badge"} •{" "}
              {selectedWebsites.length} websites selected
            </p>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="select">Select Websites</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          {/* Website Selection Tab */}
          <TabsContent value="select" className="space-y-4">
            <div className="space-y-4">
              {/* Loading State */}
              {isLoading && !badgeId && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {directBadgeId
                            ? "Loading badge..."
                            : "Checking for existing badges..."}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {directBadgeId
                            ? `Loading badge with ID: ${directBadgeId}`
                            : "Searching for badges related to this grid"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Existing Badge Status Banner */}
              {(badgeId || isEditing) && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-900">
                          {badgeId
                            ? "Existing Badge Loaded"
                            : "Editing Existing Badge"}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {badgeId ? `Badge ID: ${badgeId}` : "Badge found"} •{" "}
                          {selectedWebsites.length} websites selected
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          You can modify the website selection and update the
                          badge
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Select Websites</h3>
                  <p className="text-sm text-muted-foreground">
                    {badgeId || isEditing
                      ? "Modify your website selection (currently selected websites are highlighted)"
                      : "Choose 3-6 websites to showcase in your trust badge"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      validation.type === "error"
                        ? "destructive"
                        : validation.type === "warning"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {selectedWebsites.length} of 6
                  </Badge>
                  {selectedWebsites.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAll}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>

              {/* Badge Details Form */}
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="badgeName">Badge Name</Label>
                    <Input
                      id="badgeName"
                      placeholder="Enter badge name"
                      value={badgeName}
                      onChange={(e) => setBadgeName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="badgeDescription">Description</Label>
                    <Input
                      id="badgeDescription"
                      placeholder="Enter badge description"
                      value={badgeDescription}
                      onChange={(e) => setBadgeDescription(e.target.value)}
                    />
                  </div>
                </div>
              </Card>

              {/* Validation Message */}
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  validation.type === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : validation.type === "warning"
                    ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {validation.type === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : validation.type === "warning" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {validation.message}
                </span>
              </div>

              {/* Website Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 p-1 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {availableWebsites.map((outlet, index) => {
                  const isSelected = selectedWebsites.find(
                    (w) => w.id === outlet.id
                  );
                  const logoUrl = getLogoUrl(outlet.website_name);

                  return (
                    <Card
                      key={index}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                      } ${
                        (badgeId || isEditing) && isSelected
                          ? "border-2 border-green-300"
                          : ""
                      }`}
                      onClick={() => handleWebsiteToggle(outlet)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleWebsiteToggle(outlet)}
                            className="flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {logoUrl ? (
                                <Image
                                  src={logoUrl}
                                  alt={outlet.website_name}
                                  width={32}
                                  height={32}
                                  className="object-contain rounded"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                  <span className="text-xs font-bold text-gray-600">
                                    {outlet.website_name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium truncate">
                                    {outlet.website_name}
                                  </p>
                                  {(badgeId || isEditing) && isSelected && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Previously Selected
                                    </Badge>
                                  )}
                                </div>
                                {outlet.published_url && (
                                  <a
                                    href={outlet.published_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    View Article
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                {(badgeId || isEditing) && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset Changes
                  </Button>
                )}
                <Button
                  onClick={generateBadge}
                  disabled={selectedWebsites.length < 3 || isGenerating}
                  className="min-w-[120px]"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {badgeId || isEditing ? "Updating..." : "Generating..."}
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      {badgeId || isEditing ? "Update Badge" : "Generate Badge"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            {generatedBadge ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Badge Preview
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      This is how your trust badge will appear when embedded on
                      websites
                    </p>
                    {generatedBadge?.htmlPreview && (
                      <div className="flex items-center gap-2 mt-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          HTML Preview loaded from backend
                        </span>
                        {generatedBadge.previewGeneratedAt && (
                          <span className="text-xs text-gray-500">
                            at{" "}
                            {new Date(
                              generatedBadge.previewGeneratedAt
                            ).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {badgeId && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generatePreview}
                        disabled={isLoading}
                      >
                        <RefreshCw
                          className={`h-4 w-4 mr-2 ${
                            isLoading ? "animate-spin" : ""
                          }`}
                        />
                        Generate HTML
                      </Button>
                      {generatedBadge?.htmlPreview && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Create a new window with the HTML preview
                            const newWindow = window.open("", "_blank");
                            newWindow.document.write(
                              generatedBadge.htmlPreview
                            );
                            newWindow.document.close();
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View HTML
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(true);
                          setActiveTab("select");
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deleteBadge}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                {/* Badge Preview */}
                <Card className="p-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl relative overflow-hidden">
                    {/* Background texture effect */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                    </div>

                    {/* Main badge card */}
                    <div className="bg-gradient-to-b from-amber-50 to-amber-100 rounded-xl p-6 border-2 border-blue-200 relative transform -rotate-1 shadow-lg">
                      {/* Top and bottom blue lines */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 rounded-t-xl"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-b-xl"></div>

                      {/* "AS SEEN ON" header */}
                      <div className="text-center mb-6">
                        <h4 className="text-lg font-bold text-gray-700 tracking-wider uppercase">
                          AS SEEN ON
                        </h4>
                      </div>

                      {/* Logo layout with laurel decorations - matching reference image */}
                      <div className="flex items-center justify-center gap-6 mb-6">
                        {/* Left laurel decoration */}
                        <div className="flex items-center justify-center">
                          <div className="w-8 h-8 text-blue-400">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                            </svg>
                          </div>
                        </div>

                        {/* Center logos in horizontal flex layout */}
                        <div className="flex items-center gap-6">
                          {selectedWebsites
                            .slice(0, 3)
                            .map((website, index) => {
                              const logoUrl = getLogoUrl(website.website_name);
                              return (
                                <div key={index} className="text-center">
                                  {logoUrl ? (
                                    <Image
                                      src={logoUrl}
                                      alt={website.website_name}
                                      width={80}
                                      height={40}
                                      className="object-contain mb-2"
                                    />
                                  ) : (
                                    <div className="w-20 h-10 bg-gray-200 rounded flex items-center justify-center mb-2">
                                      <span className="text-sm font-bold text-gray-600">
                                        {website.website_name
                                          .charAt(0)
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>

                        {/* Right laurel decoration */}
                        <div className="flex items-center justify-center">
                          <div className="w-8 h-8 text-blue-400">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Additional logos if more than 3 selected - in horizontal row */}
                      {selectedWebsites.length > 3 && (
                        <div className="flex justify-center gap-4 mb-4">
                          {selectedWebsites.slice(3).map((website, index) => {
                            const logoUrl = getLogoUrl(website.website_name);
                            return (
                              <div key={index} className="text-center">
                                {logoUrl ? (
                                  <Image
                                    src={logoUrl}
                                    alt={website.website_name}
                                    width={60}
                                    height={30}
                                    className="object-contain mb-1"
                                  />
                                ) : (
                                  <div className="w-15 h-8 bg-gray-200 rounded flex items-center justify-center mb-1">
                                    <span className="text-xs font-bold text-gray-600">
                                      {website.website_name
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* "AND OVER X NEWS SITES" text */}
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-600 font-medium">
                          AND OVER {Math.max(200, selectedWebsites.length * 50)}{" "}
                          NEWS SITES
                        </p>
                      </div>

                      {/* "Verified by BrandPush.co" footer */}
                      <div className="text-center flex items-center justify-center gap-2">
                        <div className="w-4 h-4 text-blue-400">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        </div>
                        <span className="text-xs text-blue-500 font-medium">
                          Verified by BrandPush.co
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("select")}
                  >
                    Back to Selection
                  </Button>
                  <Button onClick={() => setActiveTab("embed")}>
                    Continue to Embed Code
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Please generate a badge first
                </p>
                <Button onClick={() => setActiveTab("select")} className="mt-2">
                  Go to Selection
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Embed Code Tab */}
          <TabsContent value="embed" className="space-y-4">
            {generatedBadge ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Embed Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Copy this code and paste it into your website to display the
                    trust badge
                  </p>
                </div>

                {/* Embed Code */}
                <Card className="p-4">
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">Embed Code:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyEmbedCode}
                        className="h-8 px-2 text-green-400 hover:text-green-300"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <code className="block break-all">
                      {generatedBadge.embedCode}
                    </code>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Preview Link */}
                  <Card className="p-4">
                    <div className="text-center space-y-2">
                      <Eye className="h-6 w-6 mx-auto text-blue-600" />
                      <h4 className="font-medium">Preview</h4>
                      <p className="text-sm text-muted-foreground">
                        See how it looks
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.open(generatedBadge.previewUrl, "_blank");
                          toast.success("Preview opened in new tab!");
                        }}
                      >
                        Open Preview
                      </Button>
                    </div>
                  </Card>

                  {/* HTML Preview */}
                  <Card className="p-4">
                    <div className="text-center space-y-2">
                      <Shield className="h-6 w-6 mx-auto text-green-600" />
                      <h4 className="font-medium">HTML Preview</h4>
                      <p className="text-sm text-muted-foreground">
                        View generated HTML
                      </p>
                      {generatedBadge?.htmlPreview ? (
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newWindow = window.open("", "_blank");
                              newWindow.document.write(
                                generatedBadge.htmlPreview
                              );
                              newWindow.document.close();
                            }}
                          >
                            View HTML
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyHTMLPreview}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy HTML
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generatePreview}
                          disabled={isLoading}
                        >
                          <RefreshCw
                            className={`h-4 w-4 mr-2 ${
                              isLoading ? "animate-spin" : ""
                            }`}
                          />
                          Generate HTML
                        </Button>
                      )}
                    </div>
                  </Card>

                  {/* Download */}
                  <Card className="p-4">
                    <div className="text-center space-y-2">
                      <Download className="h-6 w-6 mx-auto text-green-600" />
                      <h4 className="font-medium">Download</h4>
                      <p className="text-sm text-muted-foreground">
                        Save as image
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadBadge}
                      >
                        Download
                      </Button>
                    </div>
                  </Card>

                  {/* Share */}
                  <Card className="p-4">
                    <div className="text-center space-y-2">
                      <Share2 className="h-6 w-6 mx-auto text-purple-600" />
                      <h4 className="font-medium">Share</h4>
                      <p className="text-sm text-muted-foreground">
                        Share with others
                      </p>
                      <Button variant="outline" size="sm" onClick={shareBadge}>
                        Share
                      </Button>
                    </div>
                  </Card>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("preview")}
                  >
                    Back to Preview
                  </Button>
                  <Button onClick={handleClose}>Done</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Please generate a badge first
                </p>
                <Button onClick={() => setActiveTab("select")} className="mt-2">
                  Go to Selection
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Manage Your Badges</h3>
                  <p className="text-sm text-muted-foreground">
                    View, edit, and manage all badges for this grid
                  </p>
                  {grid_id && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Grid ID: {grid_id}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={loadAllBadges}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading badges...</p>
                </div>
              ) : userBadges.length > 0 ? (
                <div className="space-y-3">
                  {userBadges.map((badge) => (
                    <Card
                      key={badge.id || badge._id}
                      className="p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <h4 className="font-medium text-lg">
                              {badge.name ||
                                badge.title ||
                                `Badge ${badge.id || badge._id}`}
                            </h4>
                            {badge.isActive ? (
                              <Badge variant="default" className="text-xs">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {badge.description ||
                              badge.subtitle ||
                              "No description"}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              <strong>ID:</strong> {badge.id || badge._id}
                            </span>
                            <span>
                              <strong>Websites:</strong>{" "}
                              {badge.websites?.length || 0}
                            </span>
                            <span>
                              <strong>Created:</strong>{" "}
                              {badge.createdAt
                                ? new Date(badge.createdAt).toLocaleDateString()
                                : "Unknown"}
                            </span>
                            {badge.updatedAt && (
                              <span>
                                <strong>Updated:</strong>{" "}
                                {new Date(badge.updatedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setBadgeId(badge.id || badge._id);
                              loadExistingBadge(badge.id || badge._id);
                              setActiveTab("preview");
                            }}
                            className="hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setBadgeId(badge.id || badge._id);
                              setIsEditing(true);
                              setActiveTab("select");
                            }}
                            className="hover:bg-green-50"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this badge? This action cannot be undone."
                                )
                              ) {
                                deleteBadge(badge.id || badge._id);
                              }
                            }}
                            className="hover:bg-red-50 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No badges found for this grid
                  </p>
                  <Button onClick={() => setActiveTab("select")}>
                    Create Your First Badge
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default TrustBadgeModal;
