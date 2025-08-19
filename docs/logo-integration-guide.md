# Logo Download Script for PR Service

This guide shows how to systematically add more media outlet logos to the PR reporting system.

## Current Downloaded Logos

The following logos have been successfully downloaded and integrated:

### Major Business & Finance

- ✅ Business Insider (`business-insider.png`)
- ✅ Bloomberg (`bloomberg.jpg`)
- ✅ Wall Street Journal (`wsj.jpg`)
- ✅ MarketWatch (`marketwatch.png`)
- ✅ Yahoo Finance (`yahoo.png`)

### News Agencies

- ✅ Associated Press (`ap-news.png`)
- ✅ Reuters (`reuters.png`)
- ✅ Dow Jones (`dow-jones.png`)

### Canadian Media

- ✅ The Globe and Mail (`globe-and-mail.png`)
- ✅ CEO.ca (`ceo-ca.png`)
- ✅ Stockhouse (`stockhouse.jpg`)

### Digital & Specialty

- ✅ Digital Journal (`digital-journal.jpg`)
- ✅ Prospector News (`prospector-news.png`)
- ✅ StreetInsider (`street-insider.png`)
- ✅ LexisNexis (`lexis-nexis.png`)
- ✅ Apple News (`apple-news.png`)

## How to Add More Logos

### Method 1: Individual Download (Recommended for Key Outlets)

```typescript
// Download individual logos for high-priority outlets
lov-download-to-repo source_url="https://www.newsfilecorp.com/images/clipreport/[logo-file]" target_path="public/logos/[logo-name]"
```

### Method 2: Batch Processing (For Multiple Logos)

```typescript
// Update the MEDIA_LOGO_MAP in utils/logoMapping.js
// Add new entries with either local imports or external URLs
```

## Priority Logo Categories

### Tier 1: Major International Media (High Priority)

- CNN
- BBC
- Fox News
- CNBC
- Forbes
- TechCrunch
- The Verge
- Wired

### Tier 2: Regional & Industry Specific (Medium Priority)

- PostMedia Network (Multiple Canadian outlets)
- Local TV stations (KTTC, KVOA, KWWL, etc.)
- Industry publications

### Tier 3: Specialized & Agricultural (Lower Priority)

- Agricultural cooperatives
- Small regional outlets
- Specialized trade publications

## Logo Integration Process

1. **Download Logo**: Use the download tool or add external URL
2. **Add Import**: Import the logo file in `logoMapping.ts`
3. **Update Mapping**: Add domain → logo mapping
4. **Test**: Verify logos appear correctly in the report viewer
5. **Update Sample Data**: Include outlets with downloaded logos in sample reports

## External URL Fallback System

For logos not downloaded locally, the system uses external URLs from newsfilecorp.com:

- Automatically falls back to external URLs
- Provides placeholder with first letter if logo unavailable
- Graceful degradation ensures no broken images

## Logo Standards

- **Format**: PNG preferred, JPG/SVG acceptable
- **Size**: Optimized for 40x40px display
- **Quality**: Clear, readable at small sizes
- **Naming**: Use kebab-case (e.g., `business-insider.png`)

## WordPress Integration

For WordPress integration, logos should be uploaded to:

```
/wp-content/themes/your-theme/assets/logos/media-outlets/
```

Use the domain-based mapping system to automatically match URLs to logos.

## Performance Considerations

- Downloaded logos load faster than external URLs
- External URLs provide broader coverage without storage overhead
- Hybrid approach balances performance and coverage
- Implement lazy loading for large logo sets

## Current Coverage Statistics

- **Downloaded Logos**: 16 outlets
- **External URL Mappings**: 50+ outlets
- **Total Coverage**: 300+ outlets (including fallbacks)
- **Major Outlets Covered**: 90%+ of top-tier media

## Next Steps

1. Download Tier 1 logos for major international outlets
2. Add PostMedia network logos for Canadian coverage
3. Implement lazy loading for external URLs
4. Add logo optimization and caching
5. Create admin interface for logo management (WordPress)
