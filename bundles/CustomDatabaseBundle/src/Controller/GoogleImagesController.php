<?php

namespace CustomDatabaseBundle\Controller;

use Pimcore\Controller\FrontendController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class GoogleImagesController extends FrontendController
{
    /**
     * @Route("/get-images-google", name="get_images_google")
     */
    public function indexAction(Request $request): Response
    {
        $partNumber = $request->query->get('part_number', 'BH-7101-01C');
        $partTitle = $request->query->get('part_title', '');
        $partDescription = $request->query->get('part_description', '');
        $images = [];
        $error = null;

        if ($request->isMethod('POST')) {
            $partNumber = $request->request->get('part_number', $partNumber);
            $partTitle = $request->request->get('part_title', $partTitle);
            $partDescription = $request->request->get('part_description', $partDescription);

            try {
                $images = $this->extractGoogleImages($partNumber, $partTitle, $partDescription);
            } catch (\Exception $e) {
                $error = $e->getMessage();
            }
        }

        return $this->render('@CustomDatabase/default/oem-Images.html.twig', [
            'part_number' => $partNumber,
            'part_title' => $partTitle,
            'part_description' => $partDescription,
            'images' => $images,
            'error' => $error,
            'total_images' => count($images)
        ]);
    }

    /**
     * @Route("/get-images-google/extract", name="extract_images_ajax")
     */
    public function extractImagesAction(Request $request): JsonResponse
    {
        $partNumber = $request->request->get('part_number', 'BH-7101-01C');
        $partTitle = $request->request->get('part_title', '');
        $partDescription = $request->request->get('part_description', '');

        try {
            $images = $this->extractGoogleImages($partNumber, $partTitle, $partDescription);

            return $this->json([
                'success' => true,
                'images' => $images,
                'total' => count($images),
                'part_number' => $partNumber,
                'part_title' => $partTitle,
                'part_description' => $partDescription
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'error' => $e->getMessage(),
                'part_number' => $partNumber,
                'part_title' => $partTitle,
                'part_description' => $partDescription
            ]);
        }
    }

    /**
     * @Route("/get-images-google/download", name="download_image_urls")
     */
    public function downloadUrlsAction(Request $request): Response
    {
        $partNumber = $request->query->get('part_number', 'BH-7101-01C');
        $images = $this->extractGoogleImages($partNumber);

        $content = "Google Images URLs for: {$partNumber}\n";
        $content .= "Generated: " . date('Y-m-d H:i:s') . "\n";
        $content .= "Total Images: " . count($images) . "\n";
        $content .= str_repeat("=", 50) . "\n\n";

        foreach ($images as $index => $image) {
            $content .= sprintf("%3d. %s\n", $index + 1, $image['url']);
        }

        $response = new Response($content);
        $response->headers->set('Content-Type', 'text/plain');
        $response->headers->set('Content-Disposition', 
            'attachment; filename="google_images_' . $partNumber . '.txt"');

        return $response;
    }

    private function extractGoogleImages(string $partNumber, string $partTitle = '', string $partDescription = ''): array
    {
        // Use PHP-based image extraction as fallback when Python is not available
        try {
            return $this->extractGoogleImagesWithPHP($partNumber, $partTitle, $partDescription);
        } catch (\Exception $e) {
            // If PHP extraction fails, try Python as backup
            try {
                return $this->extractGoogleImagesWithPython($partNumber, $partTitle, $partDescription);
            } catch (\Exception $pythonError) {
                throw new \Exception('Both PHP and Python extraction methods failed. PHP error: ' . $e->getMessage() . '. Python error: ' . $pythonError->getMessage());
            }
        }
    }

    private function extractGoogleImagesWithPHP(string $partNumber, string $partTitle = '', string $partDescription = ''): array
    {
        $images = [];

        // Build comprehensive search query using all available information
        $searchTerms = [$partNumber];

        if (!empty($partTitle)) {
            $searchTerms[] = $partTitle;
        }

        if (!empty($partDescription)) {
            // Extract key terms from description (first 50 characters or up to first sentence)
            $descSnippet = substr($partDescription, 0, 50);
            if (strpos($descSnippet, '.') !== false) {
                $descSnippet = substr($descSnippet, 0, strpos($descSnippet, '.'));
            }
            $searchTerms[] = $descSnippet;
        }

        // Add default automotive/OEM terms if not already present
        $defaultTerms = ['OEM', 'automotive', 'part'];
        foreach ($defaultTerms as $term) {
            if (!preg_match('/\b' . preg_quote($term, '/') . '\b/i', implode(' ', $searchTerms))) {
                $searchTerms[] = $term;
            }
        }

        $query = urlencode(implode(' ', $searchTerms));
        $url = "https://www.google.com/search?q={$query}&udm=2&tbm=isch&source=hp&biw=1920&bih=1001";

        // Enhanced headers to mimic real browser
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => [
                    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language: en-US,en;q=0.9',
                    'Accept-Encoding: identity', // Don't compress to avoid issues
                    'Connection: keep-alive',
                    'Upgrade-Insecure-Requests: 1',
                    'Sec-Fetch-Dest: document',
                    'Sec-Fetch-Mode: navigate',
                    'Sec-Fetch-Site: none',
                    'Sec-Fetch-User: ?1',
                    'Cache-Control: max-age=0',
                ],
                'timeout' => 10,
                'ignore_errors' => true,
            ]
        ]);

        $html = @file_get_contents($url, false, $context);
        if ($html === false) {
            // Return empty array instead of demo images
            return [];
        }

        // Extract images from various Google Images patterns
        $patterns = [
            // Direct image URLs from img tags
            '/<img[^>]+src=["\']([^"\']+\.(?:jpg|jpeg|png|gif|webp|bmp|svg))[^"\']*["\'][^>]*>/i',
            // Data-src attributes
            '/data-src=["\']([^"\']+\.(?:jpg|jpeg|png|gif|webp|bmp|svg))[^"\']*["\']/i',
            // Googleusercontent images
            '/["\']([^"\']*googleusercontent[^"\']+\.(?:jpg|jpeg|png|gif|webp|bmp))[^"\']*["\']/i',
            // Any image URL ending with common extensions
            '/["\']([^"\']+\.(?:jpg|jpeg|png|gif|webp|bmp|svg))[^"\']*["\']/i',
        ];

        $foundUrls = [];
        foreach ($patterns as $pattern) {
            if (preg_match_all($pattern, $html, $matches)) {
                $foundUrls = array_merge($foundUrls, $matches[1]);
            }
        }

        // Remove duplicates and clean URLs
        $foundUrls = array_unique($foundUrls);

        foreach ($foundUrls as $imgUrl) {
            if (count($images) >= 15) break; // Limit to 15 images for good balance of speed and quantity

            $cleanUrl = $this->cleanImageUrl($imgUrl);
            if ($cleanUrl && $this->isValidImageUrl($cleanUrl)) {
                // Get image dimensions
                $dimensions = $this->getImageDimensions($cleanUrl);

                // Generate title and description
                $title = $this->generateImageTitle($partNumber, $partTitle, $partDescription, $dimensions);
                $description = $this->generateImageDescription($partNumber, $partTitle, $partDescription, $dimensions);

                $images[] = [
                    'url' => $cleanUrl,
                    'source' => 'Google Images',
                    'part_number' => $partNumber,
                    'method' => 'php_scrape',
                    'dimensions' => $dimensions,
                    'title' => $title,
                    'description' => $description
                ];
            }
        }

        return $images;
    }

    private function tryGoogleExtraction(string $partNumber): array
    {
        $images = [];
        $query = urlencode($partNumber . ' OEM automotive part');
        $url = "https://www.google.com/search?q={$query}&udm=2&tbm=isch";

        // Set up context with user agent and shorter timeout
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => [
                    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language: en-US,en;q=0.5',
                    'Accept-Encoding: gzip, deflate',
                    'Connection: keep-alive',
                    'Upgrade-Insecure-Requests: 1',
                ],
                'timeout' => 15, // Shorter timeout
            ]
        ]);

        $html = @file_get_contents($url, false, $context);
        if ($html === false) {
            return []; // Return empty array instead of throwing exception
        }

        // Extract image URLs using multiple patterns
        $patterns = [
            // JSON data patterns (most reliable)
            '/"ou":"([^"]+\.(?:jpg|jpeg|png|gif|webp))"/i',
            '/"tu":"([^"]+\.(?:jpg|jpeg|png|gif|webp))"/i',
            '/"ru":"([^"]+\.(?:jpg|jpeg|png|gif|webp))"/i',
            '/"pu":"([^"]+\.(?:jpg|jpeg|png|gif|webp))"/i',
            // IMG tag patterns
            '/<img[^>]+src=["\']([^"\']+\.(?:jpg|jpeg|png|gif|webp))["\'][^>]*>/i',
            '/data-src=["\']([^"\']+\.(?:jpg|jpeg|png|gif|webp))["\']/i',
        ];

        $foundUrls = [];
        foreach ($patterns as $pattern) {
            if (preg_match_all($pattern, $html, $matches)) {
                $foundUrls = array_merge($foundUrls, $matches[1]);
            }
        }

        // Remove duplicates and process URLs
        $foundUrls = array_unique($foundUrls);

        foreach ($foundUrls as $imgUrl) {
            if (count($images) >= 20) break;

            $cleanUrl = $this->cleanImageUrl($imgUrl);
            if ($cleanUrl && $this->isValidImageUrl($cleanUrl)) {
                $images[] = [
                    'url' => $cleanUrl,
                    'source' => 'Google Images',
                    'part_number' => $partNumber,
                    'method' => 'php_regex'
                ];
            }
        }

        return $images;
    }

    private function extractGoogleImagesWithPython(string $partNumber): array
    {
        // Fallback to Python method
        $pythonScript = PIMCORE_WEB_ROOT . '/../bundles/CustomDatabaseBundle/public/static/python/image_extractor.py';

        if (!file_exists($pythonScript)) {
            throw new \Exception('Python script not found: ' . $pythonScript);
        }

        $pythonCmd = $this->findPythonExecutable();
        if (!$pythonCmd) {
            throw new \Exception('Python3 executable not found. Please ensure Python 3 is installed and accessible.');
        }

        $process = new Process([$pythonCmd, $pythonScript, '--json', $partNumber]);
        $process->setTimeout(120);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new \Exception('Image extraction failed: ' . $process->getErrorOutput());
        }

        $output = $process->getOutput();
        $data = json_decode($output, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Invalid response from image extractor: ' . $output);
        }

        return $data['images'] ?? [];
    }

    private function cleanImageUrl(string $url): ?string
    {
        // Handle relative URLs
        if (strpos($url, '//') === 0) {
            $url = 'https:' . $url;
        } elseif (strpos($url, '/') === 0) {
            $url = 'https://www.google.com' . $url;
        }

        // Remove URL fragments and query parameters that might cause issues
        $parsed = parse_url($url);
        if (!$parsed || !isset($parsed['scheme']) || !isset($parsed['host'])) {
            return null;
        }

        // Rebuild clean URL
        $cleanUrl = $parsed['scheme'] . '://' . $parsed['host'];
        if (isset($parsed['path'])) {
            $cleanUrl .= $parsed['path'];
        }
        if (isset($parsed['query'])) {
            $cleanUrl .= '?' . $parsed['query'];
        }

        return $cleanUrl;
    }

    private function isValidImageUrl(string $url): bool
    {
        if (empty($url) || strpos($url, 'http') !== 0) {
            return false;
        }

        // Skip Google-related URLs that are not actual images
        $skipPatterns = ['google', 'favicon', 'logo', 'icon', 'gstatic', 'data:image', 'svg'];
        $urlLower = strtolower($url);
        foreach ($skipPatterns as $pattern) {
            if (strpos($urlLower, $pattern) !== false) {
                return false;
            }
        }

        // Check for image file extensions
        $imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        $hasImageExtension = false;
        foreach ($imageExtensions as $ext) {
            if (strpos($urlLower, $ext) !== false) {
                $hasImageExtension = true;
                break;
            }
        }

        // Allow URLs from common image hosting sites even without extensions
        $imageHosts = ['imgur', 'photobucket', 'imageshack', 'imgbb', 'postimg'];
        $hasImageHost = false;
        foreach ($imageHosts as $host) {
            if (strpos($urlLower, $host) !== false) {
                $hasImageHost = true;
                break;
            }
        }

        return $hasImageExtension || $hasImageHost;
    }

    private function findPythonExecutable(): ?string
    {
        // Try common python3 locations - check file existence first
        $possiblePaths = [
            '/usr/bin/python3',
            '/usr/bin/python3.12',
            '/usr/local/bin/python3',
            '/bin/python3',
            'python3'
        ];

        foreach ($possiblePaths as $path) {
            // First check if file exists
            if (file_exists($path) && is_executable($path)) {
                // Try to execute it
                $testProcess = new Process([$path, '--version']);
                $testProcess->run();
                if ($testProcess->isSuccessful()) {
                    return $path;
                }
            }

            // Also try which command
            $process = new Process(['which', $path]);
            $process->run();
            if ($process->isSuccessful()) {
                $foundPath = trim($process->getOutput());
                if (file_exists($foundPath) && is_executable($foundPath)) {
                    return $foundPath;
                }
            }
        }

        return null;
    }

    private function createPythonScript(string $scriptPath): void
    {
        $pythonCode = <<<'PYTHON'
import sys
import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from urllib.parse import quote

def extract_google_images(part_number):
    """Extract images from Google using Selenium"""
    chrome_options = Options()
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    images = []
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        url = f"https://www.google.com/search?q={quote(part_number)}+OEM+part&udm=2&tbm=isch"
        driver.get(url)
        time.sleep(3)
        
        # Wait for images to load
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "img")))
        
        # Scroll to load more images
        for _ in range(3):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
        
        # Extract images
        img_elements = driver.find_elements(By.TAG_NAME, "img")
        
        for img in img_elements:
            if len(images) >= 20:
                break
                
            img_src = img.get_attribute('src')
            if img_src and img_src.startswith('http'):
                if 'google' not in img_src.lower() and 'icon' not in img_src.lower():
                    size = img.size
                    if size['width'] > 50 and size['height'] > 50:
                        images.append({
                            'url': img_src,
                            'source': 'Google Images',
                            'part_number': part_number
                        })
        
        driver.quit()
        return images
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return images

if __name__ == "__main__":
    if len(sys.argv) > 1:
        part_number = sys.argv[1]
    else:
        part_number = "BH-7101-01C"
    
    images = extract_google_images(part_number)
    result = {
        'success': True,
        'images': images,
        'total': len(images),
        'part_number': part_number
    }
    print(json.dumps(result))

PYTHON;

        file_put_contents($scriptPath, $pythonCode);
    }

    private function getImageDimensions(string $url): ?array
    {
        try {
            // Set a shorter timeout for image dimension fetching
            $context = stream_context_create([
                'http' => [
                    'timeout' => 5, // 5 second timeout for each image
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                ]
            ]);

            // Get image headers first to check content type
            $headers = @get_headers($url, 1, $context);
            if (!$headers || !isset($headers['Content-Type'])) {
                return null;
            }

            $contentType = is_array($headers['Content-Type']) ? $headers['Content-Type'][0] : $headers['Content-Type'];

            // Check if it's an image
            if (!preg_match('/^image\/(jpeg|jpg|png|gif|webp|bmp)/i', $contentType)) {
                return null;
            }

            // Get image dimensions with timeout
            $imageInfo = @getimagesize($url);
            if ($imageInfo && isset($imageInfo[0], $imageInfo[1])) {
                return [
                    'width' => $imageInfo[0],
                    'height' => $imageInfo[1],
                    'aspect_ratio' => round($imageInfo[0] / $imageInfo[1], 2),
                    'mime_type' => $imageInfo['mime'] ?? $contentType
                ];
            }
        } catch (\Exception $e) {
            // Ignore errors and return null
        }

        return null;
    }

    private function generateImageTitle(string $partNumber, string $partTitle, string $partDescription, ?array $dimensions): string
    {
        $title = "OEM Part {$partNumber}";

        if (!empty($partTitle)) {
            $title .= " - {$partTitle}";
        }

        if ($dimensions) {
            $title .= " ({$dimensions['width']}×{$dimensions['height']})";
        }

        return $title;
    }

    private function generateImageDescription(string $partNumber, string $partTitle, string $partDescription, ?array $dimensions): string
    {
        $description = "High-quality image of OEM part number {$partNumber}";

        if (!empty($partTitle)) {
            $description .= ", titled '{$partTitle}'";
        }

        if (!empty($partDescription)) {
            $descSnippet = strlen($partDescription) > 50 ? substr($partDescription, 0, 50) . '...' : $partDescription;
            $description .= ". Description: {$descSnippet}";
        }

        if ($dimensions) {
            $description .= ". Image dimensions: {$dimensions['width']}×{$dimensions['height']} pixels";
            if (isset($dimensions['aspect_ratio'])) {
                $description .= " (aspect ratio: " . number_format($dimensions['aspect_ratio'], 2) . ")";
            }
        }

        $description .= ". Perfect for automotive parts identification and cataloging.";

        return $description;
    }
}