<?php

namespace CustomDatabaseBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Pimcore\Model\DataObject\DatabaseConn;
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

         // Get database connections
         $connections = DatabaseConn::getList()->load();

         return $this->render('@CustomDatabase/default/database.html.twig', [
             'tables' => $tables,
             'connections' => $connections,
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

    /**
     * @Route("/database/api/get-external-tables/{connectionId}", name="get_external_tables", methods={"GET"})
     */
    public function getExternalTablesAction($connectionId): JsonResponse
    {
        try {
            $connection = DatabaseConn::getById($connectionId);

            if (!$connection) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Connection not found'
                ], 404);
            }

            // Test the connection first
            $conn = new \CustomDatabaseBundle\Model\DatabaseConn();
            $testResult = $conn->testConnection($connection);

            if (!$testResult['success']) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Connection failed: ' . $testResult['message']
                ], 500);
            }

            // Get tables from the external database
            $tables = $this->getTablesFromConnection($connection);

            return new JsonResponse([
                'success' => true,
                'tables' => $tables,
                'connection_name' => $connection->getConnectionName()
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Failed to fetch tables: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @Route("/database/api/get-external-table-data/{connectionId}/{tableName}", name="get_external_table_data", methods={"GET"})
     */
    public function getExternalTableDataAction($connectionId, $tableName, Request $request): JsonResponse
    {
        try {
            $connection = DatabaseConn::getById($connectionId);

            if (!$connection) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Connection not found'
                ], 404);
            }

            $searchTerm = $request->query->get('search', '');
            $limit = (int) $request->query->get('limit', 100);

            // Get table data from the external database
            $data = $this->getTableDataFromConnection($connection, $tableName, $searchTerm, $limit);

            return new JsonResponse([
                'success' => true,
                'data' => $data,
                'table_name' => $tableName,
                'total_rows' => count($data),
                'search_term' => $searchTerm
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Failed to fetch table data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get tables from external database connection
     */
    private function getTablesFromConnection($connection): array
    {
        $tables = [];

        try {
            switch (strtolower($connection->getDatabaseType())) {
                case 'mysql':
                case 'mariadb':
                    $dsn = "mysql:host={$connection->getHost()};port={$connection->getPort()};dbname={$connection->getDatabaseName()};charset={$connection->getCharset()}";
                    $pdo = new \PDO($dsn, $connection->getUsername(), $connection->getPassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    $stmt = $pdo->query("SHOW TABLES");
                    $result = $stmt->fetchAll();

                    foreach ($result as $row) {
                        $tables[] = array_values($row)[0];
                    }
                    break;

                case 'postgresql':
                case 'postgres':
                    $dsn = "pgsql:host={$connection->getHost()};port={$connection->getPort()};dbname={$connection->getDatabaseName()}";
                    $pdo = new \PDO($dsn, $connection->getUsername(), $connection->getPassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    $stmt = $pdo->query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
                    $result = $stmt->fetchAll();

                    foreach ($result as $row) {
                        $tables[] = $row['tablename'];
                    }
                    break;

                case 'sqlite':
                    $dsn = "sqlite:{$connection->getDatabaseName()}";
                    $pdo = new \PDO($dsn, null, null, [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'");
                    $result = $stmt->fetchAll();

                    foreach ($result as $row) {
                        $tables[] = $row['name'];
                    }
                    break;

                case 'sqlserver':
                case 'mssql':
                    $dsn = "sqlsrv:Server={$connection->getHost()},{$connection->getPort()};Database={$connection->getDatabaseName()}";
                    $pdo = new \PDO($dsn, $connection->getUsername(), $connection->getPassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    $stmt = $pdo->query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
                    $result = $stmt->fetchAll();

                    foreach ($result as $row) {
                        $tables[] = $row['TABLE_NAME'];
                    }
                    break;

                case 'oracle':
                    $dsn = "oci:dbname={$connection->getHost()}:{$connection->getPort()}/{$connection->getDatabaseName()}";
                    $pdo = new \PDO($dsn, $connection->getUsername(), $connection->getPassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    $stmt = $pdo->query("SELECT table_name FROM all_tables WHERE owner = UPPER('{$connection->getUsername()}')");
                    $result = $stmt->fetchAll();

                    foreach ($result as $row) {
                        $tables[] = $row['table_name'];
                    }
                    break;

                default:
                    throw new \Exception('Unsupported database type: ' . $connection->getDatabaseType());
            }

        } catch (\PDOException $e) {
            throw new \Exception('Database query failed: ' . $e->getMessage());
        }

        return $tables;
    }

    /**
     * Get table data from external database connection
     */
    private function getTableDataFromConnection($connection, $tableName, $searchTerm = '', $limit = 100): array
    {
        $data = [];

        try {
            switch (strtolower($connection->getDatabaseType())) {
                case 'mysql':
                case 'mariadb':
                    $dsn = "mysql:host={$connection->getHost()};port={$connection->getPort()};dbname={$connection->getDatabaseName()};charset={$connection->getCharset()}";
                    $pdo = new \PDO($dsn, $connection->getUsername(), $connection->getPassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    if ($searchTerm) {
                        // Get column names first
                        $columnsStmt = $pdo->prepare("DESCRIBE `{$tableName}`");
                        $columnsStmt->execute();
                        $columns = $columnsStmt->fetchAll();

                        // Build search query
                        $searchConditions = [];
                        foreach ($columns as $column) {
                            $searchConditions[] = "`{$column['Field']}` LIKE ?";
                        }
                        $whereClause = implode(' OR ', $searchConditions);
                        $searchValues = array_fill(0, count($columns), "%{$searchTerm}%");

                        $stmt = $pdo->prepare("SELECT * FROM `{$tableName}` WHERE {$whereClause} LIMIT {$limit}");
                        $stmt->execute($searchValues);
                    } else {
                        $stmt = $pdo->prepare("SELECT * FROM `{$tableName}` LIMIT {$limit}");
                        $stmt->execute();
                    }
                    $data = $stmt->fetchAll();
                    break;

                case 'postgresql':
                case 'postgres':
                    $dsn = "pgsql:host={$connection->getHost()};port={$connection->getPort()};dbname={$connection->getDatabaseName()}";
                    $pdo = new \PDO($dsn, $connection->getUsername(), $connection->getPassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    if ($searchTerm) {
                        // Get column names first
                        $columnsStmt = $pdo->prepare("SELECT column_name FROM information_schema.columns WHERE table_name = ? AND table_schema = 'public'");
                        $columnsStmt->execute([$tableName]);
                        $columns = $columnsStmt->fetchAll();

                        // Build search query
                        $searchConditions = [];
                        foreach ($columns as $column) {
                            $searchConditions[] = "\"{$column['column_name']}\" ILIKE ?";
                        }
                        $whereClause = implode(' OR ', $searchConditions);
                        $searchValues = array_fill(0, count($columns), "%{$searchTerm}%");

                        $stmt = $pdo->prepare("SELECT * FROM \"{$tableName}\" WHERE {$whereClause} LIMIT {$limit}");
                        $stmt->execute($searchValues);
                    } else {
                        $stmt = $pdo->prepare("SELECT * FROM \"{$tableName}\" LIMIT {$limit}");
                        $stmt->execute();
                    }
                    $data = $stmt->fetchAll();
                    break;

                case 'sqlite':
                    $dsn = "sqlite:{$connection->getDatabaseName()}";
                    $pdo = new \PDO($dsn, null, null, [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    if ($searchTerm) {
                        // Get column names first
                        $columnsStmt = $pdo->prepare("PRAGMA table_info(\"{$tableName}\")");
                        $columnsStmt->execute();
                        $columns = $columnsStmt->fetchAll();

                        // Build search query
                        $searchConditions = [];
                        foreach ($columns as $column) {
                            $searchConditions[] = "\"{$column['name']}\" LIKE ?";
                        }
                        $whereClause = implode(' OR ', $searchConditions);
                        $searchValues = array_fill(0, count($columns), "%{$searchTerm}%");

                        $stmt = $pdo->prepare("SELECT * FROM \"{$tableName}\" WHERE {$whereClause} LIMIT {$limit}");
                        $stmt->execute($searchValues);
                    } else {
                        $stmt = $pdo->prepare("SELECT * FROM \"{$tableName}\" LIMIT {$limit}");
                        $stmt->execute();
                    }
                    $data = $stmt->fetchAll();
                    break;

                case 'sqlserver':
                case 'mssql':
                    $dsn = "sqlsrv:Server={$connection->getHost()},{$connection->getPort()};Database={$connection->getDatabaseName()}";
                    $pdo = new \PDO($dsn, $connection->getUsername(), $connection->getPassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    if ($searchTerm) {
                        // Get column names first
                        $columnsStmt = $pdo->prepare("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ?");
                        $columnsStmt->execute([$tableName]);
                        $columns = $columnsStmt->fetchAll();

                        // Build search query
                        $searchConditions = [];
                        foreach ($columns as $column) {
                            $searchConditions[] = "[{$column['COLUMN_NAME']}] LIKE ?";
                        }
                        $whereClause = implode(' OR ', $searchConditions);
                        $searchValues = array_fill(0, count($columns), "%{$searchTerm}%");

                        $stmt = $pdo->prepare("SELECT TOP {$limit} * FROM [{$tableName}] WHERE {$whereClause}");
                        $stmt->execute($searchValues);
                    } else {
                        $stmt = $pdo->prepare("SELECT TOP {$limit} * FROM [{$tableName}]");
                        $stmt->execute();
                    }
                    $data = $stmt->fetchAll();
                    break;

                case 'oracle':
                    $dsn = "oci:dbname={$connection->getHost()}:{$connection->getPort()}/{$connection->getDatabaseName()}";
                    $pdo = new \PDO($dsn, $connection->getUsername(), $connection->getPassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    if ($searchTerm) {
                        // Get column names first
                        $columnsStmt = $pdo->prepare("SELECT COLUMN_NAME FROM ALL_TAB_COLUMNS WHERE TABLE_NAME = UPPER(?)");
                        $columnsStmt->execute([$tableName]);
                        $columns = $columnsStmt->fetchAll();

                        // Build search query
                        $searchConditions = [];
                        foreach ($columns as $column) {
                            $searchConditions[] = "\"{$column['COLUMN_NAME']}\" LIKE ?";
                        }
                        $whereClause = implode(' OR ', $searchConditions);
                        $searchValues = array_fill(0, count($columns), "%{$searchTerm}%");

                        $stmt = $pdo->prepare("SELECT * FROM \"{$tableName}\" WHERE {$whereClause} AND ROWNUM <= {$limit}");
                        $stmt->execute($searchValues);
                    } else {
                        $stmt = $pdo->prepare("SELECT * FROM \"{$tableName}\" WHERE ROWNUM <= {$limit}");
                        $stmt->execute();
                    }
                    $data = $stmt->fetchAll();
                    break;

                default:
                    throw new \Exception('Unsupported database type: ' . $connection->getDatabaseType());
            }

        } catch (\PDOException $e) {
            throw new \Exception('Database query failed: ' . $e->getMessage());
        }

        return $data;
    }

    /**
     * @Route("/database/api/get-table-columns/{connectionId}/{tableName}", name="get_table_columns", methods={"GET"})
     */
    public function getTableColumnsAction($connectionId, $tableName): JsonResponse
    {
        try {
            $connection = DatabaseConn::getById($connectionId);

            if (!$connection) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Connection not found'
                ], 404);
            }

            // Get table columns from the database
            $columns = $this->getTableColumnsFromConnection($connection, $tableName);

            return new JsonResponse([
                'success' => true,
                'columns' => $columns,
                'table_name' => $tableName
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Failed to fetch table columns: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @Route("/database/api/execute-data-transfer", name="execute_data_transfer", methods={"POST"})
     */
    public function executeDataTransferAction(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!$data) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Invalid JSON data'
                ], 400);
            }

            $sourceConnectionId = $data['sourceConnectionId'] ?? null;
            $targetConnectionId = $data['targetConnectionId'] ?? null;
            $sourceTable = $data['sourceTable'] ?? null;
            $targetTable = $data['targetTable'] ?? null;
            $columnMappings = $data['columnMappings'] ?? [];
            $transformations = $data['transformations'] ?? [];
            $batchSize = $data['batchSize'] ?? 100;
            $errorHandling = $data['errorHandling'] ?? 'stop';

            if (!$sourceConnectionId || !$targetConnectionId || !$sourceTable || !$targetTable) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Missing required parameters'
                ], 400);
            }

            // Get connections
            $sourceConnection = DatabaseConn::getById($sourceConnectionId);
            $targetConnection = DatabaseConn::getById($targetConnectionId);

            if (!$sourceConnection || !$targetConnection) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Connection not found'
                ], 404);
            }

            // Execute data transfer
            $result = $this->executeDataTransfer(
                $sourceConnection,
                $targetConnection,
                $sourceTable,
                $targetTable,
                $columnMappings,
                $transformations,
                $batchSize,
                $errorHandling
            );

            return new JsonResponse([
                'success' => true,
                'message' => 'Data transfer completed successfully',
                'result' => $result
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Data transfer failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @Route("/database/api/save-mapping", name="save_mapping", methods={"POST"})
     */
    public function saveMappingAction(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!$data) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Invalid JSON data'
                ], 400);
            }

            $mappingName = $data['name'] ?? 'Untitled Mapping';
            $mappingData = $data['mapping'] ?? [];

            // Save to database or file system
            $mappingId = $this->saveMappingToStorage($mappingName, $mappingData);

            return new JsonResponse([
                'success' => true,
                'message' => 'Mapping saved successfully',
                'mappingId' => $mappingId
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Failed to save mapping: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @Route("/database/api/load-mapping/{mappingId}", name="load_mapping", methods={"GET"})
     */
    public function loadMappingAction($mappingId): JsonResponse
    {
        try {
            $mapping = $this->loadMappingFromStorage($mappingId);

            if (!$mapping) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Mapping not found'
                ], 404);
            }

            return new JsonResponse([
                'success' => true,
                'mapping' => $mapping
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Failed to load mapping: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get table columns from database connection
     */
    private function getTableColumnsFromConnection($connection, $tableName): array
    {
        $columns = [];

        try {
            switch (strtolower($connection->getDatabaseType())) {
                case 'mysql':
                case 'mariadb':
                    $dsn = "mysql:host={$connection->getHost()};port={$connection->getPort()};dbname={$connection->getDatabaseName()};charset={$connection->getCharset()}";
                    $pdo = new \PDO($dsn, $connection->getUsername(), $connection->getPassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    $stmt = $pdo->prepare("DESCRIBE `{$tableName}`");
                    $stmt->execute();
                    $columns = $stmt->fetchAll();
                    break;

                case 'postgresql':
                case 'postgres':
                    $dsn = "pgsql:host={$connection->getHost()};port={$connection->getPort()};dbname={$connection->getDatabaseName()}";
                    $pdo = new \PDO($dsn, $connection->getUsername(), $connection->getPassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    $stmt = $pdo->prepare("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = ? AND table_schema = 'public' ORDER BY ordinal_position");
                    $stmt->execute([$tableName]);
                    $columns = $stmt->fetchAll();
                    break;

                case 'sqlite':
                    $dsn = "sqlite:{$connection->getDatabaseName()}";
                    $pdo = new \PDO($dsn, null, null, [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    $stmt = $pdo->prepare("PRAGMA table_info(\"{$tableName}\")");
                    $stmt->execute();
                    $columns = $stmt->fetchAll();
                    break;

                case 'sqlserver':
                case 'mssql':
                    $dsn = "sqlsrv:Server={$connection->getHost()},{$connection->getPort()};Database={$connection->getDatabaseName()}";
                    $pdo = new \PDO($dsn, $connection->getUsername(), $connection->getPassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    $stmt = $pdo->prepare("SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? ORDER BY ORDINAL_POSITION");
                    $stmt->execute([$tableName]);
                    $columns = $stmt->fetchAll();
                    break;

                case 'oracle':
                    $dsn = "oci:dbname={$connection->getHost()}:{$connection->getPort()}/{$connection->getDatabaseName()}";
                    $pdo = new \PDO($dsn, $connection->getUsername(), $connection->getPassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    $stmt = $pdo->prepare("SELECT COLUMN_NAME, DATA_TYPE, NULLABLE, DATA_DEFAULT FROM ALL_TAB_COLUMNS WHERE TABLE_NAME = UPPER(?) ORDER BY COLUMN_ID");
                    $stmt->execute([$tableName]);
                    $columns = $stmt->fetchAll();
                    break;

                default:
                    throw new \Exception('Unsupported database type: ' . $connection->getDatabaseType());
            }

        } catch (\PDOException $e) {
            throw new \Exception('Database query failed: ' . $e->getMessage());
        }

        return $columns;
    }

    /**
     * Execute data transfer between databases
     */
    private function executeDataTransfer($sourceConnection, $targetConnection, $sourceTable, $targetTable, $columnMappings, $transformations, $batchSize, $errorHandling)
    {
        $result = [
            'totalRecords' => 0,
            'transferredRecords' => 0,
            'failedRecords' => 0,
            'errors' => []
        ];

        try {
            // Get source data
            $sourceData = $this->getTableDataFromConnection($sourceConnection, $sourceTable, '', 10000); // Limit for demo
            $result['totalRecords'] = count($sourceData);

            if (empty($sourceData)) {
                return $result;
            }

            // Process data in batches
            $batches = array_chunk($sourceData, $batchSize);

            foreach ($batches as $batch) {
                $processedBatch = $this->processBatchData($batch, $columnMappings, $transformations);

                try {
                    $inserted = $this->insertBatchToTarget($targetConnection, $targetTable, $processedBatch);
                    $result['transferredRecords'] += $inserted;
                } catch (\Exception $e) {
                    $result['failedRecords'] += count($processedBatch);
                    $result['errors'][] = 'Batch insert failed: ' . $e->getMessage();

                    if ($errorHandling === 'stop') {
                        break;
                    }
                }
            }

        } catch (\Exception $e) {
            $result['errors'][] = 'Data transfer failed: ' . $e->getMessage();
        }

        return $result;
    }

    /**
     * Process batch data with mappings and transformations
     */
    private function processBatchData($batch, $columnMappings, $transformations)
    {
        $processedData = [];

        foreach ($batch as $row) {
            $processedRow = [];

            foreach ($columnMappings as $mapping) {
                $sourceColumn = $mapping['source'];
                $targetColumn = $mapping['target'];

                if (isset($row[$sourceColumn])) {
                    $value = $row[$sourceColumn];

                    // Apply transformations
                    if (isset($transformations[$sourceColumn])) {
                        $value = $this->applyTransformations($value, $transformations[$sourceColumn]);
                    }

                    $processedRow[$targetColumn] = $value;
                }
            }

            if (!empty($processedRow)) {
                $processedData[] = $processedRow;
            }
        }

        return $processedData;
    }

    /**
     * Apply transformations to a value
     */
    private function applyTransformations($value, $transformations)
    {
        foreach ($transformations as $transformation) {
            $type = $transformation['type'] ?? '';
            $params = $transformation['params'] ?? [];

            switch ($type) {
                case 'uppercase':
                    $value = strtoupper($value);
                    break;
                case 'lowercase':
                    $value = strtolower($value);
                    break;
                case 'trim':
                    $value = trim($value);
                    break;
                case 'substring':
                    $start = $params['start'] ?? 0;
                    $length = $params['length'] ?? null;
                    $value = $length ? substr($value, $start, $length) : substr($value, $start);
                    break;
                case 'replace':
                    $search = $params['search'] ?? '';
                    $replace = $params['replace'] ?? '';
                    $value = str_replace($search, $replace, $value);
                    break;
                case 'date_format':
                    if ($value) {
                        $fromFormat = $params['from_format'] ?? 'Y-m-d H:i:s';
                        $toFormat = $params['to_format'] ?? 'Y-m-d';
                        $date = \DateTime::createFromFormat($fromFormat, $value);
                        $value = $date ? $date->format($toFormat) : $value;
                    }
                    break;
                // Add more transformation types as needed
            }
        }

        return $value;
    }

    /**
     * Insert batch data to target database
     */
    private function insertBatchToTarget($targetConnection, $targetTable, $data)
    {
        if (empty($data)) {
            return 0;
        }

        $inserted = 0;

        try {
            switch (strtolower($targetConnection->getDatabaseType())) {
                case 'mysql':
                case 'mariadb':
                    $dsn = "mysql:host={$targetConnection->getHost()};port={$targetConnection->getPort()};dbname={$targetConnection->getDatabaseName()};charset={$targetConnection->getCharset()}";
                    $pdo = new \PDO($dsn, $targetConnection->getUsername(), $targetConnection->getPassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    // Prepare insert statement
                    $columns = array_keys($data[0]);
                    $placeholders = str_repeat('?,', count($columns) - 1) . '?';
                    $columnsStr = '`' . implode('`,`', $columns) . '`';

                    $stmt = $pdo->prepare("INSERT INTO `{$targetTable}` ({$columnsStr}) VALUES ({$placeholders})");

                    // Insert each row
                    foreach ($data as $row) {
                        $values = array_values($row);
                        $stmt->execute($values);
                        $inserted++;
                    }
                    break;

                case 'postgresql':
                case 'postgres':
                    $dsn = "pgsql:host={$targetConnection->getHost()};port={$targetConnection->getPort()};dbname={$targetConnection->getDatabaseName()}";
                    $pdo = new \PDO($dsn, $targetConnection->getUsername(), $targetConnection->getPassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    // Prepare insert statement
                    $columns = array_keys($data[0]);
                    $placeholders = str_repeat('?,', count($columns) - 1) . '?';
                    $columnsStr = '"' . implode('","', $columns) . '"';

                    $stmt = $pdo->prepare("INSERT INTO \"{$targetTable}\" ({$columnsStr}) VALUES ({$placeholders})");

                    // Insert each row
                    foreach ($data as $row) {
                        $values = array_values($row);
                        $stmt->execute($values);
                        $inserted++;
                    }
                    break;

                // Add other database types as needed
                default:
                    throw new \Exception('Batch insert not implemented for: ' . $targetConnection->getDatabaseType());
            }

        } catch (\PDOException $e) {
            throw new \Exception('Batch insert failed: ' . $e->getMessage());
        }

        return $inserted;
    }

    /**
     * Save mapping to storage
     */
    private function saveMappingToStorage($name, $data)
    {
        // For now, save to local file system
        $mappingId = uniqid('mapping_', true);
        $filePath = PIMCORE_PRIVATE_VAR . '/data-mappings/' . $mappingId . '.json';

        // Ensure directory exists
        $dir = dirname($filePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $mappingData = [
            'id' => $mappingId,
            'name' => $name,
            'data' => $data,
            'created_at' => date('Y-m-d H:i:s')
        ];

        file_put_contents($filePath, json_encode($mappingData, JSON_PRETTY_PRINT));

        return $mappingId;
    }

    /**
     * Load mapping from storage
     */
    private function loadMappingFromStorage($mappingId)
    {
        $filePath = PIMCORE_PRIVATE_VAR . '/data-mappings/' . $mappingId . '.json';

        if (!file_exists($filePath)) {
            return null;
        }

        $content = file_get_contents($filePath);
        return json_decode($content, true);
    }
}