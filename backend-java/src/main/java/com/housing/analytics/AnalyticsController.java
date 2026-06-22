package com.housing.analytics;

import org.springframework.web.bind.annotation.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    @Autowired
    private RestTemplate restTemplate;

    private static final String HOUSING_API_STATS = "http://housing-api:8000/data/stats";
    private static final String HOUSING_API_PREDICT = "http://housing-api:8000/predict";

    @GetMapping("/stats")
    @Cacheable("marketStats")
    public Map<String, Object> getMarketStats() {
        try {
            Map response = restTemplate.getForObject(HOUSING_API_STATS, Map.class);
            if (response != null) return response;
        } catch (Exception e) {
            // fallthrough to hardcoded mock fallback if ML container or DB is lagging
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("averagePrice", 452000.00);
        stats.put("totalPropertiesAnalyzed", 50);
        stats.put("averageSquareFootage", 1850.5);

        List<Map<String, Object>> segments = new ArrayList<>();
        segments.add(Map.of("segment", "Urban Center", "avgPrice", 580000));
        segments.add(Map.of("segment", "Suburban", "avgPrice", 410000));
        segments.add(Map.of("segment", "Rural", "avgPrice", 290000));

        stats.put("segments", segments);
        return stats;
    }

    @PostMapping(value = "/what-if", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> runWhatIfAnalysis(@RequestBody Map<String, Object> features) {
        try {
            // 1. Safely extract square footage variable from your UI payload input field
            Object sqftObj = features.get("square_footage");
            double sqft = sqftObj != null ? Double.parseDouble(sqftObj.toString()) : 1500.0;

            // 2. Fulfill Dataset Requirements: Enrich payload with stable feature baselines
            Map<String, Object> structuredFeatures = new HashMap<>();
            structuredFeatures.put("square_footage", sqft);
            structuredFeatures.put("bedrooms", 3);                 // Realistic dataset average
            structuredFeatures.put("bathrooms", 2.0);               // Realistic dataset average
            structuredFeatures.put("year_built", 2015);            // Anchor year context
            structuredFeatures.put("lot_size", 5000.0);            // Land area benchmark context
            structuredFeatures.put("distance_to_city_center", 5.5); // Distance anchor index
            structuredFeatures.put("school_rating", 7.0);          // Stable school area weight

            // 3. Post structured dictionary straight to Python ML container
            Map<?, ?> response = restTemplate.postForObject(HOUSING_API_PREDICT, structuredFeatures, Map.class);
            
            Map<String, Object> result = new HashMap<>();
            if (response != null && response.containsKey("predicted_price")) {
                Object priceObj = response.get("predicted_price");
                if (priceObj instanceof Number) {
                    result.put("predicted_price", ((Number) priceObj).doubleValue());
                } else {
                    result.put("predicted_price", Double.parseDouble(priceObj.toString()));
                }
            } else if (response != null && response.containsKey("predictions")) {
                List<?> preds = (List<?>) response.get("predictions");
                if (!preds.isEmpty()) {
                    Object firstPred = preds.get(0);
                    result.put("predicted_price", firstPred instanceof Number ? ((Number) firstPred).doubleValue() : Double.parseDouble(firstPred.toString()));
                } else {
                    result.put("predicted_price", 0.0);
                }
            } else {
                result.put("predicted_price", 0.0);
            }
            return result;
            
        } catch (Exception e) {
            System.err.println("Proxy link exception tracing: " + e.getMessage());
            return Map.of(
                "error", "Java Microservice Proxy Failed: " + e.getMessage(), 
                "predicted_price", 0.0
            );
        }
    }

    /* =========================================================================
       ADDITION: TASK 2 REQUIREMENT - DATA EXPORT UTIL MAPPINGS (CSV & PDF)
       ========================================================================= */

    @GetMapping("/export/csv")
    public void exportMarketDataAsCSV(jakarta.servlet.http.HttpServletResponse response) {
        try {
            response.setContentType("text/csv");
            response.setHeader("Content-Disposition", "attachment; filename=market_analysis_report.csv");
            
            Map<String, Object> stats = getMarketStats();
            List<Map<String, Object>> segments = (List<Map<String, Object>>) stats.get("segments");
            
            StringBuilder csvContent = new StringBuilder();
            csvContent.append("Market Segment,Average Price (USD)\n");
            for (Map<String, Object> segment : segments) {
                csvContent.append(segment.get("segment")).append(",")
                          .append(segment.get("avgPrice")).append("\n");
            }
            
            response.getWriter().write(csvContent.toString());
            response.getWriter().flush();
        } catch (Exception e) {
            System.err.println("CSV export runtime download exception: " + e.getMessage());
        }
    }

    @GetMapping("/export/pdf")
    public void exportMarketDataAsPDF(jakarta.servlet.http.HttpServletResponse response) {
        try {
            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=market_analysis_report.pdf");
            
            Map<String, Object> stats = getMarketStats();
            List<Map<String, Object>> segments = (List<Map<String, Object>>) stats.get("segments");

            com.lowagie.text.Document document = new com.lowagie.text.Document();
            com.lowagie.text.pdf.PdfWriter.getInstance(document, response.getOutputStream());
            
            document.open();
            
            // Layout Title
            com.lowagie.text.Font titleFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 16);
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("Housing Portal - Market Analysis Metrics", titleFont);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);
            
            // Global Overview Blocks
            document.add(new com.lowagie.text.Paragraph("Total Sample Size: " + stats.get("totalPropertiesAnalyzed")));
            document.add(new com.lowagie.text.Paragraph("Weighted Global Average Price: $" + stats.get("averagePrice")));
            document.add(new com.lowagie.text.Paragraph("Average Footprint Dimensions: " + stats.get("averageSquareFootage") + " sq ft\n\n"));
            
            // Tabular Presentation Grid
            com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(2);
            table.setWidthPercentage(100);
            table.addCell("Market Segments");
            table.addCell("Evaluated Average Price");
            
            for (Map<String, Object> segment : segments) {
                table.addCell(segment.get("segment").toString());
                table.addCell("$" + segment.get("avgPrice").toString());
            }
            
            document.add(table);
            document.close();
        } catch (Exception e) {
            System.err.println("PDF generation local compilation layer exception: " + e.getMessage());
        }
    }
}