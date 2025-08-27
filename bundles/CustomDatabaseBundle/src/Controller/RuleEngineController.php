<?php
namespace CustomDatabaseBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Pimcore\Db\ConnectionInterface;
use Symfony\Component\Routing\Annotation\Route;
use Pimcore\Model\DataObject\Category;
use Symfony\Component\HttpFoundation\JsonResponse;
use VglBundle\Api\RuleEngain\InsertTableHelper;

class RuleEngineController extends  AbstractController
{
    /**
     * @var ConnectionInterface
     */
    protected $db;

    /**
     * @Route("/admin/rule-engine", name="rule_engine")
     */
    public function summaryAction(Request $request): Response
    {
        $this->db = \Pimcore\Db::get();

        // Get all table names from the current database
        $tables = $this->db->fetchFirstColumn("SHOW TABLES");

        // Return only the table names
        return $this->render('@CustomDatabase/default/rule-engine.html.twig', [
            'tables' => $tables
        ]);
    }

    /**
     * @Route("/admin/rule-engine/refresh-tables", name="refresh_tables")
     */
    public function refreshTablesAction(): JsonResponse
    {
        $this->db = \Pimcore\Db::get();
        $tables = $this->db->fetchFirstColumn("SHOW TABLES");
        
        return $this->json([
            'tables' => $tables
        ]);
    }
       /**
         * @Route("/admin/get-product-attributes", name="get_product_attributes")
         */
        public function getProductAttributes(Request $request): JsonResponse
        {
            $tableName = $request->query->get('table');
            
            try {
                // Get database connection
                $db = \Pimcore\Db::get();
                
                // Fetch all columns from the specified table
                $columns = $db->fetchAllAssociative("SHOW COLUMNS FROM `$tableName`");
                
                // Extract just the column names
                $columnNames = array_map(fn($col) => $col['Field'], $columns);
                
                // Format the response
                $response = array_map(fn($name) => ['name' => $name], $columnNames);
                
                return new JsonResponse($response);
                
            } catch (\Exception $e) {
                return new JsonResponse([
                    'error' => 'Failed to fetch columns',
                    'message' => $e->getMessage()
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }
        

     /**
    * @Route("/admin/get-prepare-for-sfcc", name="get-prepare-for-sfcc", methods={"GET"})
    */
    public function getPrepareForSfcc(Request $request): JsonResponse
    {
        $this->db = \Pimcore\Db::get();
        $objectId = $request->query->get('id');
        $object = Category::getById($objectId);
        $object->setSyncedToSfcc(false);
        $object->save();
        $sql = "UPDATE vgl_category_assignement_audit_trail SET status_sfcc_sync = 0 WHERE final_assignment_status = 1";
        $this->db->executeStatement($sql);

        $sql = " SELECT * 
            FROM vgl_category_assignement_audit_trail 
            WHERE category_pim_id = :objectId 
            ORDER BY creation_date DESC
        ";
        $data = $this->db->fetchAllAssociative($sql, ['objectId' => $objectId]);   

        $sql1 = "SELECT 
            COUNT(*) AS total_count,
            SUM(CASE WHEN operation = 'ASSIGNMENT' THEN 1 ELSE 0 END) AS assignment_count,
            SUM(CASE WHEN operation = 'DEASSIGNMENT' THEN 1 ELSE 0 END) AS deassignment_count
        FROM 
            vgl_category_assignement_audit_trail
        WHERE category_pim_id = " . $objectId . " AND final_assignment_status = 1";

        $result = $this->db->fetchAllAssociative($sql1);       

        foreach ($data as &$row) {
                if (isset($row['creation_date'])) {
                    $row['creation_date'] = date('Y_m_d-H_i_s', $row['creation_date']);
                }
        }

        return $this->json([
            'count' => $result,
            'objects' => array_values($data), // Return all rows as objects
            'query' => $sql
        ]);
    }


    /**
    * @Route("/admin/get-status-data", name="get-status", methods={"GET"})
    */
    public function getStatus(Request $request): JsonResponse
    {
        $this->db = \Pimcore\Db::get();
        $objectId = $request->query->get('id');
        $status = $request->query->get('status');
        $object = Category::getById($objectId);
        $query = $object->getRuleJsonQuery();   
        $object->setStatus($status);
        $object->save();

        \Pimcore\Cache::clearAll();

        return $this->json([]);

    }
 
   /**
    * @Route("/admin/get-class-name", name="get-class-name", methods={"GET"})
    */
    public function getClassName(Request $request): JsonResponse
    {
        $className = "\\Pimcore\\Model\\DataObject\\" . ucfirst($request->query->get('class'));

        $this->db = \Pimcore\Db::get();
        $objectId = $request->query->get('id');
        $object = Category::getById($objectId);
        $jsonData = $object->getRuleJson();
        $data = json_decode($jsonData, true);

        if (json_last_error() === JSON_ERROR_NONE && !empty($data)) {
            // JSON is valid and not empty
            $query = $this->generateQuery($data);
                 
            // Validate class
            if (!class_exists($className)) {
                return $this->json(['error' => "Class $className does not exist"], 400);
            }

            $parts = explode('\\', $className); // Save the result of explode() to a variable
            $lastName = end($parts);

            $sql = "SELECT * FROM vgl_products_index WHERE " . $query . " ORDER BY modification_date DESC";
            $data = $this->db->fetchAllAssociative($sql);           

            foreach ($data as &$row) {
                if (isset($row['modification_date'])) {
                    $row['modification_date'] = date('Y_m_d-H_i_s', $row['modification_date']);
                }
            }

            return $this->json([
                'count' => count($data),
                'objects' => array_values(array_filter($data, function ($row) use ($lastName) {
                return ucfirst($row['class_name']) === $lastName;
            }, ARRAY_FILTER_USE_BOTH)),
                'query' => $sql // Send the query data as part of the response
            ]);
        } else {
            // Handle invalid or empty JSON
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("Invalid JSON: " . json_last_error_msg());
            }
            if (empty($data)) {
                throw new \Exception("JSON is valid but contains no data.");
            }
            return $this->json([]);
        }
    }

    /**
    * @Route("/admin/get-status-by-id", name="get-status-by-id", methods={"GET"})
    */
    public function getStatusData(Request $request): JsonResponse
    { 
        $objectId = $request->query->get('id');
        $object = Category::getById($objectId);
        $ruleJson = $object->getRuleJson();
        return $this->json([
           'ruleJson' => $ruleJson,
        ]);
    }

     /**
    * @Route("/admin/get-table-data", name="get-table-data", methods={"GET"})
    */
    public function getTableData(Request $request): JsonResponse
    { 
        $this->db = \Pimcore\Db::get();
        $objectId = $request->query->get('id');
        $object = Category::getById($objectId);
        $jsonData = $object->getRuleJson();
        $datas = json_decode($jsonData, true);

        if (json_last_error() === JSON_ERROR_NONE && !empty($datas)) {
            // JSON is valid and not empty
            $query = $this->generateQuery($datas);

            $sql = "SELECT * FROM vgl_products_index WHERE " . $query . " ORDER BY modification_date DESC";
            $data = $this->db->fetchAllAssociative($sql);    
      
            foreach ($data as &$row) {
                if (isset($row['modification_date'])) {
                    $row['modification_date'] = date('Y_m_d-H_i_s', $row['modification_date']);
                }
            }
      
            return $this->json([
                'count' => count($data),
                'objects' => array_values($data), // Return all rows as objects
                'query' => $sql // Include the executed query for debugging
            ]);
        } else {
            // Handle invalid or empty JSON
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("Invalid JSON: " . json_last_error_msg());
            }
            if (empty($data)) {
                throw new \Exception("JSON is valid but contains no data.");
            }
            return $this->json([]);
        }
    }

     /**
    * @Route("/admin/get-audit-table-data", name="get-audit-table-data", methods={"GET"})
    */
    public function getAuditTableData(Request $request): JsonResponse
    { 
        $this->db = \Pimcore\Db::get();
        $objectId = $request->query->get('id');
        $sql = " SELECT * 
            FROM vgl_category_assignement_audit_trail 
            WHERE category_pim_id = :objectId 
            ORDER BY creation_date DESC
        ";
        $data = $this->db->fetchAllAssociative($sql, ['objectId' => $objectId]);   

        $sql1 = "SELECT 
            COUNT(*) AS total_count,
            SUM(CASE WHEN operation = 'ASSIGNMENT' THEN 1 ELSE 0 END) AS assignment_count,
            SUM(CASE WHEN operation = 'DEASSIGNMENT' THEN 1 ELSE 0 END) AS deassignment_count
        FROM 
            vgl_category_assignement_audit_trail
        WHERE category_pim_id = " . $objectId . " AND final_assignment_status = 1";

        $result = $this->db->fetchAllAssociative($sql1);       

        foreach ($data as &$row) {
                if (isset($row['creation_date'])) {
                    $row['creation_date'] = date('Y_m_d-H_i_s', $row['creation_date']);
                }
        }

        return $this->json([
            'count' => $result,
            'objects' => array_values($data), // Return all rows as objects
            'query' => $sql
        ]);
    }
   
    /**
    * @Route("/admin/get-object-search-value", name="get-object-search-value", methods={"GET"})
    */
    public function getObjectSearchValue(Request $request): JsonResponse
    { 
        $this->db = \Pimcore\Db::get();
        $type = $request->query->get('type');
        $values = $request->query->get('value');
        $objectId = $request->query->get('id');
        
        if ($type === "creation_date") {
            // Split and format the date and time parts
            $formattedValue = str_replace('_', '-', substr($values, 0, 10)) . ' ' . str_replace('_', ':', substr($values, 11));
            
            // Convert to Unix timestamp
            $values = strtotime($formattedValue);

            // Check if conversion was successful
            if ($values === false) {
                return $this->json([
                    'error' => 'Invalid date format provided. Expected format: YYYY_MM_DD-HH_mm_ss',
                ]);
            }
        }

        $sql = "SELECT * FROM vgl_category_assignement_audit_trail WHERE {$type} IN ('$values') AND category_pim_id = " . $objectId . " ORDER BY creation_date DESC";

        $data = $this->db->fetchAllAssociative($sql);

        $sql1 = "SELECT 
            COUNT(*) AS total_count,
            SUM(CASE WHEN operation = 'ASSIGNMENT' THEN 1 ELSE 0 END) AS assignment_count,
            SUM(CASE WHEN operation = 'DEASSIGNMENT' THEN 1 ELSE 0 END) AS deassignment_count
        FROM 
            vgl_category_assignement_audit_trail
        WHERE 
            {$type} IN ('$values')
            AND category_pim_id = " . $objectId . " AND final_assignment_status = 1";

        $result = $this->db->fetchAllAssociative($sql1);

        foreach ($data as &$row) {
                if (isset($row['creation_date'])) {
                    $row['creation_date'] = date('Y_m_d-H_i_s', $row['creation_date']);
                }
        }

        return $this->json([
                'count' => $result,
                'objects' => array_values($data),
                'query' => $sql // Send the query data as part of the response
            ]);
    }

    /**
    * @Route("/admin/get-object-by-id", name="get-object-by-id", methods={"GET"})
    */
    public function getObjectById(Request $request): JsonResponse
    { 
        $this->db = \Pimcore\Db::get();
        $type = $request->query->get('type');
        $values = $request->query->get('value');
        $objectId = $request->query->get('id');
        $object = Category::getById($objectId);
        $jsonData = $object->getRuleJson();
        $data = json_decode($jsonData, true);

        if (json_last_error() === JSON_ERROR_NONE && !empty($data)) {
            // JSON is valid and not empty
            $query = $this->generateQuery($data);

            if ($type === 'id') {
                $sql = "SELECT * FROM vgl_products_index WHERE product_pim_id IN ($values) AND " . $query . " ORDER BY modification_date DESC";
            } elseif ($type === 'sku') {
                $sql = "SELECT * FROM vgl_products_index WHERE product_id IN ($values) AND" . $query . " ORDER BY modification_date DESC";
            } elseif ($type === 'master_sku') {
                $sql = "SELECT * FROM vgl_products_index WHERE master_sku IN ($values) AND" . $query . " ORDER BY modification_date DESC";
            } else {
                return $this->json(['error' => 'Invalid search type.']);
            }

            $data = $this->db->fetchAllAssociative($sql);           

            foreach ($data as &$row) {
                if (isset($row['modification_date'])) {
                    $row['modification_date'] = date('Y_m_d-H_i_s', $row['modification_date']);
                }
            }

            return $this->json([
                'count' => count($data),
                'objects' => array_values($data),
                'query' => $sql // Send the query data as part of the response
            ]);
        } else {
            // Handle invalid or empty JSON
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("Invalid JSON: " . json_last_error_msg());
            }
            if (empty($data)) {
                throw new \Exception("JSON is valid but contains no data.");
            }
            return $this->json([]);
        }
    }

    /**
    * Generate SQL-like query from JSON data.
    *
    * @param array $groups
    * @return string
    */
    public function generateQuery(array $groups): string {
        $queryParts = [];

        foreach ($groups as $group) {
            $groupParts = [];
            foreach ($group['group'] as $index => $rule) {

                $attribute = $rule['attribute'];
                $value = $rule['value'];
                $condition = $rule['condition'] ;
                $rowCondition = isset($rule['rowcondition']) ? $rule['rowcondition'] : "AND";

                // Escape or sanitize values to prevent SQL injection
                $attribute = addslashes($attribute);

                // Translate and build individual condition
                $ruleCondition = $this->buildCondition($attribute, $value, $condition);

                // Append rowcondition for all but the first row
                if ($index > 0 && $rowCondition) {
                    $ruleCondition = "{$rowCondition} {$ruleCondition}";
                }

                $groupParts[] = $ruleCondition;
            }

            // Combine all conditions within a group with rowcondition handling
            $groupCondition = implode(' ', $groupParts);

            // Wrap group conditions in parentheses
            $queryParts[] = "($groupCondition)";
        }

        // Combine all groups with their respective conditions
        $finalCondition = implode(
            ' ',
            array_map(function ($group, $index) use ($groups) {
                return ($index > 0 && isset($groups[$index]['condition']))
                    ? "{$groups[$index]['condition']} $group"
                    : $group;
            }, $queryParts, array_keys($queryParts))
        );

        return $finalCondition;
    }

    /**
    * Build the condition string for a given attribute, value, and condition type.
    *
    * @param string $attribute
    * @param mixed $value
    * @param string $condition
    * @return string
    */
    private function buildCondition(string $attribute, $value, string $condition): string {
        // Translate condition keywords to SQL-like operators
        $operator = $this->translateCondition($condition);

        // Handle specific conditions
        switch ($condition) {
            case 'CONTAINS':
            case 'START WITH':
            case 'END WITH':
                $value = addslashes($value);
                $value = $condition === 'CONTAINS' ? "%{$value}%" : ($condition === 'START WITH' ? "{$value}%" : "%{$value}");
                return "`$attribute` LIKE '$value'";

            case 'IS ONE OF':
            case 'NOT ONE OF':
                $valueList = is_array($value) ? $value : explode(',', $value);
                $valueList = array_map(fn($v) => "'" . addslashes(trim($v)) . "'", $valueList);
                $operator = $condition === 'IS ONE OF' ? 'IN' : 'NOT IN';
                return "`$attribute` $operator (" . implode(',', $valueList) . ")";

            case 'BETWEEN':
                if (is_array($value) && count($value) === 2) {
                    $start = addslashes($value[0]);
                    $end = addslashes($value[1]);
                    return "`$attribute` BETWEEN '$start' AND '$end'";
                }
                throw new \InvalidArgumentException("Invalid value for BETWEEN condition. Expected an array with two elements.");

            default:
                $value = addslashes($value);
                return "`$attribute` $operator '$value'";
        }
    }

    /**
    * Translate condition keywords to SQL-like operators.
    *
    * @param string $condition
    * @return string
    */
    private function translateCondition(string $condition): string {
        $operators = [
            'EQUALS' => '=',
            'NOT EQUALS' => '!=',
            'CONTAINS' => 'LIKE',
            'START WITH' => 'LIKE',
            'END WITH' => 'LIKE',
            'IS ONE OF' => 'IN',
            'NOT ONE OF' => 'NOT IN',
            'GREATER THAN' => '>',
            'LESS THAN' => '<',
            'BETWEEN' => 'BETWEEN'
        ];

        return $operators[$condition] ?? $condition;
    }

}
