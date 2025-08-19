# WordPress Integration Guide for PR Reporting System

## Overview
This guide provides code snippets and recommendations for integrating the PR reporting system with WordPress, including secure file upload, JSON parsing, and user access control.

## 1. Secure JSON File Upload

### Custom WordPress Function for File Upload
```php
// Add to your theme's functions.php or create a custom plugin

function handle_pr_report_upload() {
    // Verify nonce for security
    if (!wp_verify_nonce($_POST['pr_report_nonce'], 'upload_pr_report')) {
        wp_die('Security check failed');
    }
    
    // Check user permissions
    if (!current_user_can('edit_posts')) {
        wp_die('Insufficient permissions');
    }
    
    // Handle file upload
    if (!empty($_FILES['pr_report']['name'])) {
        $uploadedfile = $_FILES['pr_report'];
        
        // Validate file type
        $file_info = wp_check_filetype($uploadedfile['name']);
        if ($file_info['ext'] !== 'json') {
            wp_die('Only JSON files are allowed');
        }
        
        // Validate file size (max 10MB)
        if ($uploadedfile['size'] > 10485760) {
            wp_die('File size too large. Maximum 10MB allowed.');
        }
        
        // Upload file
        $upload_overrides = array('test_form' => false);
        $movefile = wp_handle_upload($uploadedfile, $upload_overrides);
        
        if ($movefile && !isset($movefile['error'])) {
            // Parse and store report data
            $report_data = parse_pr_report($movefile['file']);
            if ($report_data) {
                $report_id = store_pr_report($report_data);
                wp_redirect(site_url("/pr-report/{$report_id}"));
                exit;
            }
        } else {
            wp_die($movefile['error']);
        }
    }
}
add_action('wp_ajax_upload_pr_report', 'handle_pr_report_upload');
```

## 2. JSON Parsing Function

```php
function parse_pr_report($file_path) {
    // Read and decode JSON file
    $json_content = file_get_contents($file_path);
    $report_data = json_decode($json_content, true);
    
    // Validate required fields
    $required_fields = ['title', 'outlets', 'date_created'];
    foreach ($required_fields as $field) {
        if (!isset($report_data[$field])) {
            return false;
        }
    }
    
    // Sanitize and validate outlet data
    if (isset($report_data['outlets']) && is_array($report_data['outlets'])) {
        foreach ($report_data['outlets'] as &$outlet) {
            $outlet['website_name'] = sanitize_text_field($outlet['website_name']);
            $outlet['published_url'] = esc_url_raw($outlet['published_url']);
            $outlet['potential_reach'] = intval($outlet['potential_reach']);
        }
    }
    
    // Calculate totals
    $report_data['total_outlets'] = count($report_data['outlets']);
    $report_data['total_reach'] = array_sum(array_column($report_data['outlets'], 'potential_reach'));
    
    return $report_data;
}
```

## 3. Database Storage

### Create Custom Table
```php
function create_pr_reports_table() {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'pr_reports';
    
    $charset_collate = $wpdb->get_charset_collate();
    
    $sql = "CREATE TABLE $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        title varchar(255) NOT NULL,
        report_data longtext NOT NULL,
        total_outlets int(11) DEFAULT 0,
        total_reach bigint(20) DEFAULT 0,
        status varchar(20) DEFAULT 'completed',
        date_created datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}
register_activation_hook(__FILE__, 'create_pr_reports_table');
```

### Store Report Function
```php
function store_pr_report($report_data) {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'pr_reports';
    
    $result = $wpdb->insert(
        $table_name,
        array(
            'user_id' => get_current_user_id(),
            'title' => sanitize_text_field($report_data['title']),
            'report_data' => wp_json_encode($report_data),
            'total_outlets' => $report_data['total_outlets'],
            'total_reach' => $report_data['total_reach'],
            'status' => 'completed'
        ),
        array('%d', '%s', '%s', '%d', '%d', '%s')
    );
    
    return $wpdb->insert_id;
}
```

## 4. User Access Control

### Check Report Access
```php
function user_can_access_report($report_id) {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'pr_reports';
    $user_id = get_current_user_id();
    
    // Admins can access all reports
    if (current_user_can('manage_options')) {
        return true;
    }
    
    // Users can only access their own reports
    $report = $wpdb->get_row($wpdb->prepare(
        "SELECT user_id FROM $table_name WHERE id = %d",
        $report_id
    ));
    
    return $report && $report->user_id == $user_id;
}
```

## 5. Frontend Integration

### Shortcode for Upload Form
```php
function pr_report_upload_form_shortcode() {
    if (!is_user_logged_in()) {
        return '<p>You must be logged in to upload reports.</p>';
    }
    
    ob_start();
    ?>
    <form method="post" enctype="multipart/form-data" action="<?php echo admin_url('admin-ajax.php'); ?>">
        <input type="hidden" name="action" value="upload_pr_report">
        <?php wp_nonce_field('upload_pr_report', 'pr_report_nonce'); ?>
        
        <div class="pr-upload-form">
            <label for="pr_report">Upload PR Report (JSON file):</label>
            <input type="file" name="pr_report" id="pr_report" accept=".json" required>
            <input type="submit" value="Upload Report" class="button button-primary">
        </div>
    </form>
    <?php
    return ob_get_clean();
}
add_shortcode('pr_upload_form', 'pr_report_upload_form_shortcode');
```

### API Endpoint for React App
```php
function get_pr_report_api() {
    $report_id = intval($_GET['report_id']);
    
    if (!user_can_access_report($report_id)) {
        wp_send_json_error('Access denied', 403);
    }
    
    global $wpdb;
    $table_name = $wpdb->prefix . 'pr_reports';
    
    $report = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table_name WHERE id = %d",
        $report_id
    ));
    
    if ($report) {
        $report_data = json_decode($report->report_data, true);
        wp_send_json_success($report_data);
    } else {
        wp_send_json_error('Report not found', 404);
    }
}
add_action('wp_ajax_get_pr_report', 'get_pr_report_api');
add_action('wp_ajax_nopriv_get_pr_report', 'get_pr_report_api');
```

## 6. Media Logo Management

### Logo Directory Structure
```
/wp-content/themes/your-theme/assets/logos/media-outlets/
├── cnn.png
├── fox-news.png
├── bbc.png
├── reuters.png
├── business-insider.png
├── forbes.png
└── default-outlet.png
```

### Logo Helper Function
```php
function get_media_outlet_logo($domain) {
    $logo_path = get_template_directory() . '/assets/logos/media-outlets/';
    $logo_url = get_template_directory_uri() . '/assets/logos/media-outlets/';
    
    // Clean domain
    $domain = str_replace('www.', '', $domain);
    $logo_filename = sanitize_file_name(str_replace('.', '-', $domain)) . '.png';
    
    // Check if specific logo exists
    if (file_exists($logo_path . $logo_filename)) {
        return $logo_url . $logo_filename;
    }
    
    // Return default logo
    return $logo_url . 'default-outlet.png';
}
```

## 7. Security Recommendations

1. **File Validation**: Always validate file type, size, and content
2. **User Permissions**: Implement proper role-based access control
3. **Nonce Verification**: Use WordPress nonces for form security
4. **Data Sanitization**: Sanitize all user inputs before storage
5. **Database Preparation**: Use prepared statements for database queries
6. **Rate Limiting**: Implement upload rate limiting to prevent abuse
7. **File Storage**: Store uploaded files outside web root when possible

## 8. Performance Optimization

1. **Database Indexing**: Add indexes on frequently queried columns
2. **Caching**: Implement object caching for report data
3. **CDN**: Use CDN for media outlet logos
4. **Lazy Loading**: Implement pagination for large reports
5. **Background Processing**: Process large JSON files in background

## Installation Steps

1. Add the functions to your theme's `functions.php` file or create a custom plugin
2. Run the table creation function
3. Upload media outlet logos to the assets directory
4. Configure user roles and permissions
5. Test the upload and viewing functionality
6. Implement additional security measures as needed

This integration provides a complete solution for handling PR reports in WordPress while maintaining security and performance standards.