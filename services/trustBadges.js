// Trust Badge Service
// This service handles trust badge operations using the centralized API infrastructure

import { apiGet, apiPost, apiPut, apiDelete } from "../lib/api";

class TrustBadgeService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  }

  // Generate a new trust badge (requires authentication)
  async generateBadge(data) {
    try {
      const response = await apiPost("/trust-badges", data);

      return {
        success: true,
        badgeId: response.badgeId,
        embedCode: `<script src="${this.baseUrl}/api/trust-badges/${response.badgeId}.js"></script>`,
        previewUrl: `${this.baseUrl}/api/trust-badges/${response.badgeId}/preview`,
        message: "Trust badge generated successfully",
        data: response,
      };
    } catch (error) {
      console.error("Error generating badge:", error);
      throw new Error(
        error.message || "Failed to generate badge. Please try again."
      );
    }
  }

  // Get badge by ID (requires authentication)
  async getBadge(badgeId) {
    try {
      const response = await apiGet(`/trust-badges/${badgeId}`);

      return {
        success: true,
        badge: response.badge || response,
      };
    } catch (error) {
      console.error("Error getting badge:", error);
      throw new Error(error.message || "Failed to get badge.");
    }
  }

  // Update badge (requires authentication)
  async updateBadge(badgeId, data) {
    try {
      const response = await apiPut(`/trust-badges/${badgeId}`, data);

      return {
        success: true,
        message: "Trust badge updated successfully",
        data: response,
      };
    } catch (error) {
      console.error("Error updating badge:", error);
      throw new Error(error.message || "Failed to update badge.");
    }
  }

  // Delete badge (requires authentication)
  async deleteBadge(badgeId) {
    try {
      const response = await apiDelete(`/trust-badges/${badgeId}`);

      return {
        success: true,
        message: "Trust badge deleted successfully",
        data: response,
      };
    } catch (error) {
      console.error("Error deleting badge:", error);
      throw new Error(error.message || "Failed to delete badge.");
    }
  }

  // Get user badges (requires authentication, supports pagination)
  async getUserBadges(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const params = {
        page: page.toString(),
        limit: limit.toString(),
        search,
        sortBy,
        sortOrder,
      };

      const response = await apiGet("/trust-badges", params);

      return {
        success: true,
        badges: response.badges || [],
        pagination: response.pagination || {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0,
        },
      };
    } catch (error) {
      console.error("Error getting user badges:", error);
      throw new Error(error.message || "Failed to get user badges.");
    }
  }

  // Get badge JavaScript code (public endpoint - no authentication required)
  async getBadgeJavaScript(badgeId) {
    try {
      // For public endpoints, we need to use fetch directly since apiGet requires auth
      const response = await fetch(
        `${this.baseUrl}/api/trust-badges/${badgeId}.js`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return response.text(); // Return as text for JavaScript code
    } catch (error) {
      console.error("Error getting badge JavaScript:", error);
      throw new Error(error.message || "Failed to get badge JavaScript.");
    }
  }

  // Get badge preview (public endpoint - no authentication required)
  async getBadgePreview(badgeId) {
    try {
      // For public endpoints, we need to use fetch directly since apiGet requires auth
      const response = await fetch(
        `${this.baseUrl}/api/trust-badges/${badgeId}/preview`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error("Error getting badge preview:", error);
      throw new Error(error.message || "Failed to get badge preview.");
    }
  }

  // Generate the JavaScript code for the badge (fallback method)
  generateBadgeJS(websites, badgeId) {
    const websiteData = websites.map((website) => ({
      name: website.website_name,
      url: website.published_url,
      logo: this.getLogoUrl(website.website_name),
    }));

    return `(function() {
  'use strict';
  
  // CSS Styles for the trust badge
  const styles = \`
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
    }
    
         .trust-badge-logo {
       width: 80px;
       height: 40px;
       object-fit: contain;
       margin-bottom: 8px;
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
    }
    
    .trust-badge-top-line,
    .trust-badge-bottom-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 4px;
      background: #60a5fa;
      border-radius: 2px;
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
    
    @media (max-width: 480px) {
      .trust-badge-card {
        padding: 16px;
        transform: none;
      }
      
      .trust-badge-logos {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .trust-badge-logo-grid {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  \`;
  
  // Inject CSS
  if (!document.getElementById('trust-badge-styles-\${badgeId}')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'trust-badge-styles-\${badgeId}';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
  
  // Generate HTML
  const container = document.createElement('div');
  container.className = 'trust-badge-container';
  
  const badgeCard = document.createElement('div');
  badgeCard.className = 'trust-badge-card';
  
  // Add top and bottom lines
  const topLine = document.createElement('div');
  topLine.className = 'trust-badge-top-line';
  badgeCard.appendChild(topLine);
  
  const bottomLine = document.createElement('div');
  bottomLine.className = 'trust-badge-bottom-line';
  badgeCard.appendChild(bottomLine);
  
  // Header
  const header = document.createElement('div');
  header.className = 'trust-badge-header';
  header.innerHTML = '<h3 class="trust-badge-title">AS SEEN ON</h3>';
  badgeCard.appendChild(header);
  
  // Logos section
  const logosSection = document.createElement('div');
  logosSection.className = 'trust-badge-logos';
  
  // Left laurel
  const leftLaurel = document.createElement('div');
  leftLaurel.className = 'trust-badge-laurel';
  leftLaurel.innerHTML = \`
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
    </svg>
  \`;
  logosSection.appendChild(leftLaurel);
  
  // Center logos
  const logoGrid = document.createElement('div');
  logoGrid.className = 'trust-badge-logo-grid';
  
  const websites = ${JSON.stringify(websiteData)};
  websites.forEach(website => {
    const logoItem = document.createElement('div');
    logoItem.className = 'trust-badge-logo-item';
    
    if (website.logo) {
      const logo = document.createElement('img');
      logo.src = website.logo;
      logo.alt = website.name;
      logo.className = 'trust-badge-logo';
      logoItem.appendChild(logo);
    } else {
      const fallback = document.createElement('div');
      fallback.className = 'trust-badge-logo-fallback';
      fallback.textContent = website.name.charAt(0).toUpperCase();
      logoItem.appendChild(fallback);
    }
    
    const logoText = document.createElement('div');
    logoText.className = 'trust-badge-logo-text';
    logoText.textContent = website.name.toUpperCase();
    logoItem.appendChild(logoText);
    
    logoGrid.appendChild(logoItem);
  });
  
  logosSection.appendChild(logoGrid);
  
  // Right laurel
  const rightLaurel = document.createElement('div');
  rightLaurel.className = 'trust-badge-laurel';
  rightLaurel.innerHTML = \`
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
    </svg>
  \`;
  logosSection.appendChild(rightLaurel);
  
  badgeCard.appendChild(logosSection);
  
  // Subtitle
  const subtitle = document.createElement('div');
  subtitle.className = 'trust-badge-subtitle';
  subtitle.innerHTML = \`<p class="trust-badge-subtitle-text">AND OVER \${Math.max(200, websites.length * 50)} NEWS SITES</p>\`;
  badgeCard.appendChild(subtitle);
  
  // Footer
  const footer = document.createElement('div');
  footer.className = 'trust-badge-footer';
  footer.innerHTML = \`
    <svg class="trust-badge-checkmark" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
    </svg>
    <span class="trust-badge-verified">Verified by BrandPush.co</span>
  \`;
  badgeCard.appendChild(footer);
  
  container.appendChild(badgeCard);
  
  // Insert into page
  const targetElement = document.currentScript.parentNode;
  targetElement.appendChild(container);
})();`;
  }

  // Helper method to get logo URL
  getLogoUrl(websiteName) {
    // Import logo mapping from utils
    try {
      // This would typically come from your logo mapping
      // For now, we'll use a simple mapping approach
      // In production, this would be imported from your logoMapping utility
      const logoMapping = {
        "Business Insider": "/logos/business-insider.png",
        "Yahoo Finance": "/logos/yahoo.png",
        Marketwatch: "/logos/marketwatch.png",
        "Associated Press": "/logos/ap-news.png",
        "Digital Journal": "/logos/digital-journal.jpg",
        Reuters: "/logos/reuters.png",
        Bloomberg: "/logos/bloomberg.jpg",
        WSJ: "/logos/wsj.jpg",
        Fox: "/logos/fox47.png",
        Benzinga: "/logos/benzinga.png",
        "Barchart.com": "/logos/barchart.png",
        "Central Charts": "/logos/central-charts.png",
      };

      return logoMapping[websiteName] || null;
    } catch (error) {
      console.error("Error getting logo URL:", error);
      return null;
    }
  }
}

// Create singleton instance
const trustBadgeService = new TrustBadgeService();

export { trustBadgeService };
export default trustBadgeService;
