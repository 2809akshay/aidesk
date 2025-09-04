<?php

namespace CustomDatabaseBundle\Controller;

use Pimcore\Model\DataObject\DatabaseConn;
use Pimcore\Controller\FrontendController;
use Pimcore\Model\DataObject;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/database-connector")
 */
class DatabaseConnectorController extends FrontendController
{
    /**
     * @Route("", name="database_connector")
     */
    public function indexAction(Request $request)
    {
        return $this->render('@CustomDatabase/default/database-connector.html.twig', [
            'title' => 'Database Connector - Connect to Any Database'
        ]);
    }

   /**
 * @Route("/test-connection", name="database_connector_test", methods={"GET", "POST"})
 * @Route("/test-connection/{id}", name="database_connector_test_by_id", methods={"GET"})
 */
public function testConnectionAction(Request $request, $id = null): JsonResponse
{
    try {
        // Handle connection by ID
        if ($id) {
            $connection = DatabaseConn::getById($id);
            
            if (!$connection) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Connection not found'
                ], 404);
            }
            
            $conn = new \CustomDatabaseBundle\Model\DatabaseConn();
            $result = $conn->testConnection($connection);
            
            return new JsonResponse([
                'success' => $result['success'],
                'message' => $result['message'],
                'response_time' => $result['response_time'],
                'connection_status' => $result['success'] ? 'connected' : 'failed'
            ]);
        }
        
        // Handle form data (your existing code)
        $data = [];
        
        if ($request->isMethod('POST')) {
            $data = json_decode($request->getContent(), true);
            
            if (!$data) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Invalid JSON data provided'
                ], 400);
            }
        } else {
            // Handle GET request
            $data = [
                'databaseType' => $request->query->get('databaseType', 'mysql'),
                'host' => $request->query->get('host', 'localhost'),
                'port' => (int) $request->query->get('port', 3306),
                'databaseName' => $request->query->get('databaseName', ''),
                'username' => $request->query->get('username', ''),
                'password' => $request->query->get('password', ''),
                'charset' => $request->query->get('charset', 'utf8mb4'),
                'sslMode' => $request->query->get('sslMode', 'prefer'),
            ];
        }

           // Validate required fields
           if (empty($data['host']) || empty($data['username'])) {
               return new JsonResponse([
                   'success' => false,
                   'message' => 'Host and Username are required'
               ], 400);
           }

           // Build DSN based on database type
           $dsn = $this->buildDSN($data);

           // Try connection
           $pdo = new \PDO($dsn, $data['username'], $data['password']);   
           $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

           // Test the connection with a simple query
           $stmt = $pdo->query("SELECT 1 as test");
           $result = $stmt->fetch();

           return new JsonResponse([
               'success' => true,
               'message' => 'Connection successful',
               'connection' => [
                   'driver' => $data['databaseType'],
                   'host' => $data['host'],
                   'port' => $data['port'],
                   'database' => $data['databaseName'],
                   'charset' => $data['charset'],
                   'sslMode' => $data['sslMode'],
               ],
               'test_result' => $result
           ]);

       } catch (\PDOException $e) {
           return new JsonResponse([
               'success' => false,
               'message' => 'Database connection failed: ' . $e->getMessage(),
               'error' => [
                   'code' => $e->getCode(),
                   'file' => $e->getFile(),
                   'line' => $e->getLine(),
                   'dsn_used' => $dsn ?? 'DSN not built'
               ]
           ], 500);
       } catch (\Exception $e) {
           return new JsonResponse([
               'success' => false,
               'message' => 'Connection test failed: ' . $e->getMessage(),
               'error' => [
                   'code' => $e->getCode(),
                   'file' => $e->getFile(),
                   'line' => $e->getLine(),
               ]
           ], 500);
       }
   }

   /**
    * Build DSN string based on database type
    */
   private function buildDSN(array $data): string
   {
       $databaseType = strtolower($data['databaseType']);
       $host = $data['host'];
       $port = $data['port'];
       $databaseName = $data['databaseName'];
       $charset = $data['charset'];

       switch ($databaseType) {
           case 'mysql':
           case 'mariadb':
               if (empty($databaseName)) {
                   return "mysql:host={$host};port={$port};charset={$charset}";
               }
               return "mysql:host={$host};port={$port};dbname={$databaseName};charset={$charset}";

           case 'postgresql':
           case 'postgres':
               if (empty($databaseName)) {
                   return "pgsql:host={$host};port={$port}";
               }
               return "pgsql:host={$host};port={$port};dbname={$databaseName}";

           case 'sqlserver':
           case 'mssql':
               if (empty($databaseName)) {
                   return "sqlsrv:Server={$host},{$port}";
               }
               return "sqlsrv:Server={$host},{$port};Database={$databaseName}";

           case 'oracle':
               if (empty($databaseName)) {
                   return "oci:dbname={$host}:{$port}";
               }
               return "oci:dbname={$host}:{$port}/{$databaseName}";

           case 'sqlite':
               if (empty($databaseName)) {
                   return "sqlite::memory:";
               }
               return "sqlite:{$databaseName}";

           default:
               // Fallback to MySQL format
               if (empty($databaseName)) {
                   return "mysql:host={$host};port={$port};charset={$charset}";
               }
               return "mysql:host={$host};port={$port};dbname={$databaseName};charset={$charset}";
       }
   }

   /**
     * @Route("/save-connection", name="database_connector_save", methods={"POST"})
     */
    public function saveConnectionAction(Request $request): JsonResponse
    {
        try {
            // Get data from JSON body
            $data = json_decode($request->getContent(), true);

            if (empty($data)) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'No data provided in query parameters'
                ], 400);
            }

            // Check if connection with this name already exists
            $existingConnection = DatabaseConn::getByConnectionName($data['connectionName'], 1);
            if ($existingConnection && $existingConnection->getId() !== ($data['id'] ?? null)) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'A connection with this name already exists'
                ], 400);
            }

            // Create or update DatabaseConn object
            if (!empty($data['id'])) {
                $connection = DatabaseConn::getById($data['id']);
                if (!$connection) {
                    return new JsonResponse([
                        'success' => false,
                        'message' => 'Connection not found'
                    ], 404);
                }
            } else {
                $connection = new DatabaseConn();
                $connection->setParent(DataObject::getByPath('/'));
                $connection->setKey(\Pimcore\File::getValidFilename($data['connectionName']));
                $connection->setPublished(true);
            }

            // Set connection properties
            $connection->setConnectionName($data['connectionName']);
            $connection->setDatabaseType($data['databaseType']);
            $connection->setHost($data['host']);
            $connection->setPort($data['port']);
            $connection->setDatabaseName($data['databaseName']);
            $connection->setUsername($data['username']);
            $connection->setPassword($data['password']);
            $connection->setCharset($data['charset'] ?? 'utf8mb4');
            $connection->setSslMode($data['sslMode'] ?? 'prefer');
            $connection->setDescription($data['description'] ?? '');
            $connection->setTags($data['tags'] ?? '');
            $connection->setConnectionStatus('Active');

            // Save the connection
            $connection->save();

            return new JsonResponse([
                'success' => true,
                'message' => 'Database connection saved successfully',
                'connection_id' => $connection->getId(),
                'connection_info' => $this->getConnectionInfo($connection),
                // 'test_result' => $testResult
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Failed to save connection: ' . $e->getMessage(),
                'error_details' => [
                    'code' => $e->getCode(),
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ], 500);
        }
    }


    /**
     * @Route("/list-connections", name="database_connector_list", methods={"GET"})
     */
    public function listConnectionsAction(Request $request)
    {
        try {
            $connections = DatabaseConn::getList()->load();

            $connectionList = [];
            foreach ($connections as $object) {
                $connectionList[] = $this->getConnectionInfo($object);
            }

            return new JsonResponse([
                'success' => true,
                'connections' => $connectionList,
                'total' => count($connectionList)
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Failed to load connections: ' . $e->getMessage()
            ], 500);
        }
    }

     /**
     * Get database connection info
     * @return array
     */
    public function getConnectionInfo($object)
    {
        return [
            'id' => $object->getId(),
            'connectionName' => $object->getConnectionName(),
            'databaseType' => $object->getDatabaseType(),
            'host' => $object->getHost(),
            'port' => $object->getPort(),
            'databaseName' => $object->getDatabaseName(),
            'username' => $object->getUsername(),
            'connectionStatus' => $object->getConnectionStatus(),
            'lastTested' => $object->getLastTested() ? $object->getLastTested()->timestamp : null,
            'sslMode' => $object->getSslMode(),
            'charset' => $object->getCharset(),
            'description' => $object->getDescription(),
            'tags' => $object->getTags(),
            'connectionHistory' => $object->getConnectionHistory()
        ];
    }

    /**
     * @Route("/get-connection/{id}", name="database_connector_get", methods={"GET"})
     */
    public function getConnectionAction($id)
    {
        try {
            $connection = DatabaseConn::getById($id);

            if (!$connection) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Connection not found'
                ], 404);
            }

            return new JsonResponse([
                'success' => true,
                'connection' => $this->getConnectionInfo($connection)
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Failed to load connection: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @Route("/delete-connection/{id}", name="database_connector_delete", methods={"DELETE"})
     */
    public function deleteConnectionAction($id)
    {
        try {
            $connection = DatabaseConn::getById($id);

            if (!$connection) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Connection not found'
                ], 404);
            }

            $connection->delete();

            return new JsonResponse([
                'success' => true,
                'message' => 'Connection deleted successfully'
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Failed to delete connection: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @Route("/get-supported-types", name="database_connector_types", methods={"GET"})
     */
    public function getSupportedTypesAction()
    {
        try {
            return new JsonResponse([
                'success' => true,
                'database_types' => $this->getSupportedDatabaseTypes(),
                'default_ports' => $this->getDefaultPorts()
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Failed to load database types: ' . $e->getMessage()
            ], 500);
        }
    }

     /**
     * Get supported database types
     * @return array
     */
    public static function getSupportedDatabaseTypes()
    {
        return [
            'mysql' => 'MySQL',
            'mariadb' => 'MariaDB',
            'postgresql' => 'PostgreSQL',
            'sqlite' => 'SQLite',
            'sqlserver' => 'SQL Server',
            'oracle' => 'Oracle'
        ];
    }

    /**
     * Get default ports for database types
     * @return array
     */
    public static function getDefaultPorts()
    {
        return [
            'mysql' => 3306,
            'mariadb' => 3306,
            'postgresql' => 5432,
            'sqlite' => null,
            'sqlserver' => 1433,
            'oracle' => 1521
        ];
    }

    /**
     * @Route("/quick-connect", name="database_connector_quick", methods={"POST"})
     */
    public function quickConnectAction(Request $request)
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!$data) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Invalid JSON data provided'
                ], 400);
            }

            // Create a temporary connection for quick testing
            $tempConnection = new DatabaseConn();
            $tempConnection->setDatabaseType($data['databaseType'] ?? 'mysql');
            $tempConnection->setHost($data['host'] ?? 'localhost');
            $tempConnection->setPort($data['port'] ?? 3306);
            $tempConnection->setDatabaseName($data['databaseName'] ?? '');
            $tempConnection->setUsername($data['username'] ?? '');
            $tempConnection->setPassword($data['password'] ?? '');
            $tempConnection->setCharset($data['charset'] ?? 'utf8mb4');

            // Test the connection
            $conn = new \CustomDatabaseBundle\Model\DatabaseConn();
            $result = $conn->testConnection($tempConnection);

            return new JsonResponse($result);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Quick connect failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @Route("/get-connection-history/{id}", name="database_connector_history", methods={"GET"})
     */
    public function getConnectionHistoryAction($id)
    {
        try {
            $connection = DatabaseConn::getById($id);

            if (!$connection) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Connection not found'
                ], 404);
            }

            return new JsonResponse([
                'success' => true,
                'history' => $connection->getConnectionHistory()
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Failed to load connection history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @Route("/bulk-test", name="database_connector_bulk_test", methods={"GET"})
     */
    public function bulkTestAction(Request $request): JsonResponse
    {
        try {
            // Expecting connection_ids as a comma-separated query string, e.g.
            // /database-connector/bulk-test?connection_ids=1,2,3
            $connectionIdsParam = $request->query->get('connection_ids');

            if (!$connectionIdsParam) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'No connection IDs provided'
                ], 400);
            }

            $connectionIds = array_map('trim', explode(',', $connectionIdsParam));
            $results = [];

            foreach ($connectionIds as $connectionId) {
                $connection = DatabaseConn::getById($connectionId);
                if ($connection) {
                    $conn = new \CustomDatabaseBundle\Model\DatabaseConn();
                    $result = $conn->testConnection($connection);

                    $results[] = [
                        'id' => $connectionId,
                        'name' => $connection->getConnectionName(),
                        'result' => $result
                    ];
                }
            }

            return new JsonResponse([
                'success' => true,
                'results' => $results,
                'total_tested' => count($results)
            ]);

        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

}
