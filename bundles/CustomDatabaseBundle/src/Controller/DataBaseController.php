<?php

namespace CustomDatabaseBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Pimcore\Db\ConnectionInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

class DataBaseController extends AbstractController
{
    /**
     * @var ConnectionInterface
     */
    protected $db;

     /**
     * @Route("/database", name="database")
     */
    public function summaryAction(Request $request): Response
    {
        $this->db = \Pimcore\Db::get();
        $sql = "SHOW TABLES";
        $tables = $this->db->fetchAllAssociative($sql);

        return $this->render('@CustomDatabase/default/database.html.twig', [
            'tables' => $tables,
            'columns' => null,
        ]);
    }
      /**
       * @Route("/api-conn", name="api_conn")
       */
      public function apiConn(Request $request): Response
      {
          return $this->render('@CustomDatabase/default/api-connections.html.twig');
      }

  
      /**
       * @Route("/data-mapping", name="data_mapping")
       */
      public function dataMapping(Request $request): Response
      {
          return $this->render('@CustomDatabase/default/data-mapping.html.twig');
      }

     /**
    * @Route("/admin/test-connection", name="admin_test_connection")
    */
    public function testConnectionAction(Request $request)
    {
        // Get connection parameters from request
        $type = $request->get('type');
        $host = $request->get('host');
        $port = $request->get('port');
        $database = $request->get('database');
        $username = $request->get('username');
        $password = $request->get('password');

        try {
            // Try to establish a connection
            if ($type === 'mysql') {
                $connection = new \PDO("mysql:host=$host;port=$port;dbname=$database", $username, $password);
            }
            // Add other database types here
            return new JsonResponse(['success' => true, 'message' => 'Connection successful']);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    /**
     * @Route("/admin/get-database-table-data", name="get-database-table-data")
     */
    public function tableData(Request $request): Response
    {
        $this->db = \Pimcore\Db::get();
        $table = $request->query->get('table');
        $columns = $this->db->fetchAllAssociative(
            "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = :table",
            ['table' => $table]
        );

        // (Optional) Fetch all tables again for the dropdown
        $sql = "SHOW TABLES";
        $tables = $this->db->fetchAllAssociative($sql);
        return $this->json([
            'tables'        => $tables,
            'columns'       => $columns,
            'selectedTable' => $table,
        ]);
    }

    
    /**
    * @Route("/admin/get-database-search-value", name="get-database-search-value", methods={"GET"})
    */
    public function getSearchValue(Request $request): JsonResponse
    { 
        $this->db = \Pimcore\Db::get();
        $jsonString = $request->query->get('ruleSets');
        $table = $request->query->get('table');
        $filters = json_decode($jsonString, true);    

        // Handle advanced filters
        $condision = $this->generateQuery($filters);
        $sql = "SELECT * FROM {$table} WHERE {$condision}";
        $data = $this->db->fetchAllAssociative($sql);       
        return $this->json([
            'objects' => array_values($data),
            'count' => count($data)
        ]);
    }

     /**
    * @Route("/admin/get-database-select-table-data", name="get-database-select-table-data", methods={"GET"})
    */
    public function getPrepareForSfcc(Request $request): JsonResponse
    {
        $this->db = \Pimcore\Db::get();
        $table = $request->query->get('table');
        $page = $request->query->get('page', 1);
        $limit = $request->query->get('limit', 100);
        $offset = ($page - 1) * $limit;
        
        // Get total count
        $countSql = "SELECT COUNT(*) as count FROM {$table}";
        $countResult = $this->db->fetchAssociative($countSql);
        $totalCount = $countResult['count'];
        
        // Get paginated data
        $sql = "SELECT * FROM {$table} LIMIT {$limit} OFFSET {$offset}";
        $data = $this->db->fetchAllAssociative($sql);
        
        return $this->json([
            'objects' => array_values($data),
            'count' => $totalCount,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => ceil($totalCount / $limit)
        ]);
    }

     /**
    * @Route("/admin/get-database-select-table-attribute", name="get-database-select-table-attribute", methods={"GET"})
    */
    public function getPrepareForAttribute(Request $request): JsonResponse
    {
        $this->db = \Pimcore\Db::get();
        $table = $request->query->get('table');
       
        $sql = "SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = :table";
        $columns = $this->db->fetchAllAssociative($sql, ['table' => $table]);     
        return $this->json(array_map(fn($col) => $col['COLUMN_NAME'], $columns));

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

    
    /**
     * @Route("/admin/get-column-data-types", name="get-column-data-types", methods={"GET"})
     */
    public function getColumnDataTypes(Request $request): JsonResponse
    {
        $this->db = \Pimcore\Db::get();
        $table = $request->query->get('table');
        
        $sql = "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = :table";
        $columns = $this->db->fetchAllAssociative($sql, ['table' => $table]);
        
        return $this->json([
            'columns' => $columns
        ]);
    }
    
    /**
     * @Route("/admin/get-table-structure", name="get-table-structure", methods={"GET"})
     */
    public function getTableStructure(Request $request): JsonResponse
    {
        $this->db = \Pimcore\Db::get();
        $table = $request->query->get('table');
        
        // Get table structure (columns with details)
        $sql = "SELECT
                    COLUMN_NAME,
                    COLUMN_TYPE,
                    IS_NULLABLE,
                    COLUMN_DEFAULT,
                    COLUMN_KEY,
                    EXTRA
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table
                ORDER BY ORDINAL_POSITION";
        $columns = $this->db->fetchAllAssociative($sql, ['table' => $table]);
        
        // Get table indexes
        $indexSql = "SHOW INDEX FROM {$table}";
        $indexes = $this->db->fetchAllAssociative($indexSql);
        
        // Get table creation statement
        $createTableSql = "SHOW CREATE TABLE {$table}";
        $createTableResult = $this->db->fetchAssociative($createTableSql);
        $createTableStatement = $createTableResult['Create Table'] ?? '';
        
        return $this->json([
            'columns' => $columns,
            'indexes' => $indexes,
            'createTableStatement' => $createTableStatement
        ]);
    }

    //  /**
    // * @Route("/admin/get-table-data", name="get-table-data", methods={"GET"})
    // */
    // public function getTableData(Request $request): JsonResponse
    // { 
    //     $this->db = \Pimcore\Db::get();
    //     $objectId = $request->query->get('id');
    //     $object = Category::getById($objectId);
    //     $jsonData = $object->getRuleJson();
    //     $datas = json_decode($jsonData, true);

    //     if (json_last_error() === JSON_ERROR_NONE && !empty($datas)) {
    //         // JSON is valid and not empty
    //         $query = $this->generateQuery($datas);

    //         $sql = "SELECT * FROM vgl_products_index WHERE " . $query . " ORDER BY modification_date DESC";
    //         $data = $this->db->fetchAllAssociative($sql);    
      
    //         foreach ($data as &$row) {
    //             if (isset($row['modification_date'])) {
    //                 $row['modification_date'] = date('Y_m_d-H_i_s', $row['modification_date']);
    //             }
    //         }
      
    //         return $this->json([
    //             'count' => count($data),
    //             'objects' => array_values($data), // Return all rows as objects
    //             'query' => $sql // Include the executed query for debugging
    //         ]);
    //     } else {
    //         // Handle invalid or empty JSON
    //         if (json_last_error() !== JSON_ERROR_NONE) {
    //             throw new \Exception("Invalid JSON: " . json_last_error_msg());
    //         }
    //         if (empty($data)) {
    //             throw new \Exception("JSON is valid but contains no data.");
    //         }
    //         return $this->json([]);
    //     }
    // }

    /**
     * @Route("/job-automation", name="job_automation")
     */
    public function jobAutomation(Request $request): Response
    {
        return $this->render('@CustomDatabase/default/job-automation.html.twig');
    }

    /**
     * @Route("/data-importer", name="data_importer")
     */
    public function dataImporter(Request $request): Response
    {
        return $this->render('@CustomDatabase/default/data-importer.html.twig');
    }

    /**
     * @Route("/security-center", name="security_center")
     */
    public function securityCenter(Request $request): Response
    {
        return $this->render('@CustomDatabase/default/security-center.html.twig');
    }

    /**
     * @Route("/analytics", name="analytics")
     */
    public function analytics(Request $request): Response
    {
        return $this->render('@CustomDatabase/default/analytics.html.twig');
    }

    /**
     * @Route("/data-masking", name="data_masking")
     */
    public function dataMasking(Request $request): Response
    {
        return $this->render('@CustomDatabase/default/data-masking.html.twig');
    }

    /**
     * @Route("/audit-logs", name="audit_logs")
     */
    public function auditLogs(Request $request): Response
    {
        return $this->render('@CustomDatabase/default/audit-logs.html.twig');
    }

    /**
     * @Route("/backup-restore", name="backup_restore")
     */
    public function backupRestore(Request $request): Response
    {
        return $this->render('@CustomDatabase/default/backup-restore.html.twig');
    }

    /**
     * @Route("/settings", name="settings")
     */
    public function settings(Request $request): Response
    {
        return $this->render('@CustomDatabase/default/settings.html.twig');
    }

    /**
     * @Route("/user-management", name="user_management")
     */
    public function userManagement(Request $request): Response
    {
        return $this->render('@CustomDatabase/default/user-management.html.twig');
    }

    /**
     * @Route("/help-support", name="help_support")
     */
    public function helpSupport(Request $request): Response
    {
        return $this->render('@CustomDatabase/default/help-support.html.twig');
    }

    /**
     * @Route("/privacy-policy", name="privacy_policy")
     */
    public function privacyPolicy(Request $request): Response
    {
        return $this->render('@CustomDatabase/default/privacy-policy.html.twig');
    }

    /**
     * @Route("/data-protection", name="data_protection")
     */
    public function dataProtection(Request $request): Response
    {
        return $this->render('@CustomDatabase/default/data-protection.html.twig');
    }
}