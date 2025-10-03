import urllib.request
import urllib.parse
import json
import re
import sys

class GoogleImageExtractor:
    def __init__(self):
        self.opener = urllib.request.build_opener()
        self.opener.addheaders = [
            ('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        ]

    def extract_google_images_selenium(self, oem_number, count=20):
        """Extract images from Google using urllib"""
        images = []
        query = f"{oem_number} OEM part"
        url = f"https://www.google.com/search?q={urllib.parse.quote(query)}&udm=2&tbm=isch"

        print(f"🔍 Searching Google Images: {url}")

        try:
            with self.opener.open(url, timeout=10) as response:
                html_content = response.read().decode('utf-8', errors='ignore')

            # Method 1: Extract from img tags using regex
            img_pattern = r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>'
            img_matches = re.findall(img_pattern, html_content, re.IGNORECASE)

            for img_src in img_matches:
                if len(images) >= count:
                    break

                img_url = self.extract_image_url(img_src)
                if img_url and self.is_valid_image_url(img_url):
                    images.append({
                        'url': img_url,
                        'source': 'Google Images',
                        'part_number': oem_number,
                        'method': 'img_tag'
                    })

            # Method 2: Extract from JSON data in script tags
            if len(images) < count:
                script_pattern = r'<script[^>]*>(.*?)</script>'
                script_matches = re.findall(script_pattern, html_content, re.DOTALL | re.IGNORECASE)

                for script_content in script_matches:
                    if 'AF_initDataCallback' in script_content:
                        image_urls = self.extract_urls_from_script(script_content)
                        for url in image_urls:
                            if len(images) < count and self.is_valid_image_url(url):
                                images.append({
                                    'url': url,
                                    'source': 'Google Images JSON',
                                    'part_number': oem_number,
                                    'method': 'json_data'
                                })

            # Remove duplicates
            unique_images = []
            seen_urls = set()
            for img in images:
                if img['url'] not in seen_urls:
                    seen_urls.add(img['url'])
                    unique_images.append(img)

            print(f"✅ Total unique images extracted: {len(unique_images)}")
            return unique_images[:count]

        except Exception as e:
            print(f"❌ Extraction error: {e}")
            return []

    def extract_image_url(self, img_src):
        """Extract and clean image URL"""
        # Handle data-src attributes
        if img_src.startswith('data-src='):
            img_src = img_src[9:].strip('"\'')

        # Clean the URL
        img_src = img_src.strip('"\'')

        # Skip if it's a data URL or Google icon
        if img_src.startswith('data:') or 'google' in img_src.lower():
            return None

        # Ensure it's a full URL
        if img_src.startswith('//'):
            img_src = 'https:' + img_src
        elif not img_src.startswith('http'):
            return None

        return img_src

    def is_valid_image_url(self, url):
        """Check if URL is a valid image URL"""
        if not url or not url.startswith('http'):
            return False

        # Skip Google-related URLs that are not actual images
        skip_patterns = ['google', 'favicon', 'logo', 'icon', 'data:image', 'gstatic']
        url_lower = url.lower()
        for pattern in skip_patterns:
            if pattern in url_lower:
                return False

        # Check file extension or common image hosting patterns
        url_lower = url.lower()
        image_indicators = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', 'imgur', 'photobucket', 'imageshack']
        return any(indicator in url_lower for indicator in image_indicators)

    def extract_urls_from_script(self, script_content):
        """Extract image URLs from script content"""
        urls = []

        # Look for URL patterns in the script
        url_patterns = [
            r'"ou"\s*:\s*"([^"]+)"',
            r'"tu"\s*:\s*"([^"]+)"',
            r'"ru"\s*:\s*"([^"]+)"',
            r'"pu"\s*:\s*"([^"]+)"',
            r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|gif|webp|bmp)[^\s"\'<>]*'
        ]

        for pattern in url_patterns:
            matches = re.findall(pattern, script_content, re.IGNORECASE)
            for match in matches:
                if self.is_valid_image_url(match):
                    urls.append(match)

        return urls

    def close(self):
        """Close the opener"""
        pass

# Simple command-line functionality only

def main():
    import sys
    try:
        # Check for command line arguments
        if len(sys.argv) > 2 and sys.argv[1] == '--json':
            # Command line mode for JSON output
            part_number = sys.argv[2]
            extractor = GoogleImageExtractor()
            try:
                images = extractor.extract_google_images_selenium(part_number, 20)
                result = {
                    'success': True,
                    'images': images,
                    'total': len(images),
                    'part_number': part_number
                }
                print(json.dumps(result))
            except Exception as e:
                result = {
                    'success': False,
                    'error': str(e),
                    'part_number': part_number
                }
                print(json.dumps(result))
            finally:
                extractor.close()
        else:
            print("Usage: python image_extractor.py --json <part_number>")
            print("Example: python image_extractor.py --json BH-7101-01C")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()