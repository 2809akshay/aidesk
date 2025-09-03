<?php

namespace CustomDatabaseBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class DataImporterController extends AbstractController
{
    /**
     * @Route("/dataImpoter", name="data_importer")
     */
    public function indexAction(Request $request): Response
    {
        return $this->render('@CustomDatabase/default/data-importer.html.twig');
    }

    /**
     * @Route("/admin/data-importer/parse", name="data_importer_parse", methods={"GET"})
     */
    public function parseAction(Request $request): JsonResponse
    {
        try {
            // Get file content from request
            $content = $request->query->get('content');
            $extension = $request->query->get('type');
            
            if (!$content) {
                return $this->json([
                    'success' => false,
                    'message' => 'No content provided'
                ]);
            }

            // Validate file type
            $allowedExtensions = ['csv', 'xml', 'json'];
            if (!in_array($extension, $allowedExtensions)) {
                return $this->json([
                    'success' => false,
                    'message' => 'Invalid file type. Only CSV, XML, and JSON files are allowed.'
                ]);
            }
            
            // Parse data based on file type
            $data = $this->parseData($content, $extension);
            
            if ($data === false) {
                return $this->json([
                    'success' => false,
                    'message' => 'Failed to parse file data'
                ]);
            }

            return $this->json([
                'success' => true,
                'data' => $data,
                'message' => 'File parsed successfully'
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Error processing file: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Parse data based on file type
     */
    private function parseData(string $content, string $extension)
    {
        switch ($extension) {
            case 'csv':
                return $this->parseCsvData($content);
            case 'xml':
                return $this->parseXmlData($content);
            case 'json':
                return $this->parseJsonData($content);
            default:
                return false;
        }
    }

    /**
     * Parse CSV data
     */
    private function parseCsvData(string $content)
    {
        $lines = explode("\n", trim($content));
        if (empty($lines)) {
            return [];
        }

        // Get headers from first line
        $headers = str_getcsv($lines[0]);
        
        // Parse data rows
        $data = [];
        for ($i = 1; $i < count($lines); $i++) {
            if (trim($lines[$i]) === '') {
                continue;
            }
            
            $row = str_getcsv($lines[$i]);
            if (count($row) === count($headers)) {
                $data[] = array_combine($headers, $row);
            }
        }
        
        return $data;
    }

    /**
     * Parse XML data
     */
    private function parseXmlData(string $content)
    {
        try {
            $xml = simplexml_load_string($content);
            if ($xml === false) {
                return false;
            }
            
            $data = [];
            
            // Convert SimpleXML to array
            $json = json_encode($xml);
            $array = json_decode($json, true);
            
            // Handle different XML structures
            if (isset($array['row'])) {
                // If rows are directly under root
                if (isset($array['row'][0])) {
                    // Multiple rows
                    return $array['row'];
                } else {
                    // Single row
                    return [$array['row']];
                }
            } else {
                // Try to find a common array structure
                foreach ($array as $key => $value) {
                    if (is_array($value) && !empty($value)) {
                        if (isset($value[0])) {
                            // Multiple items
                            return $value;
                        } else {
                            // Single item
                            return [$value];
                        }
                    }
                }
            }
            
            // Fallback: return the whole array
            return [$array];
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Parse JSON data
     */
    private function parseJsonData(string $content)
    {
        try {
            $data = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return false;
            }
            
            // If it's an associative array (single object), wrap it in an array
            if (is_array($data) && !isset($data[0]) && !empty($data)) {
                return [$data];
            }
            
            // If it's already an array of objects
            if (is_array($data)) {
                return $data;
            }
            
            // Fallback
            return [];
        } catch (\Exception $e) {
            return false;
        }
    }
}