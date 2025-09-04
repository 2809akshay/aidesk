<?php

namespace CustomDatabaseBundle\Model;

use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\ClassDefinition;
use Carbon\Carbon;

/**
 * @method static \Pimcore\Model\DataObject\Listing getList(array $config = [])
 * @method static DatabaseConn getByConnectionName($value, $limit = 0, $offset = 0)
 * @method static DatabaseConn getByHost($value, $limit = 0, $offset = 0)
 * @method static DatabaseConn getByPort($value, $limit = 0, $offset = 0)
 * @method static DatabaseConn getByDatabaseName($value, $limit = 0, $offset = 0)
 * @method static DatabaseConn getByUsername($value, $limit = 0, $offset = 0)
 * @method static DatabaseConn getByConnectionStatus($value, $limit = 0, $offset = 0)
 * @method static DatabaseConn getByLastTested($value, $limit = 0, $offset = 0)
 */
class DatabaseConn extends DataObject\Concrete
{
    protected $o_classId = "database_conn";
    protected $o_className = "DatabaseConn";

    /**
     * @var string
     */
    public $connectionName;

    /**
     * @var string
     */
    public $databaseType;

    /**
     * @var string
     */
    public $host;

    /**
     * @var int
     */
    public $port;

    /**
     * @var string
     */
    public $databaseName;

    /**
     * @var string
     */
    public $username;

    /**
     * @var string
     */
    public $password;

    /**
     * @var string
     */
    public $connectionStatus;

    /**
     * @var \Carbon\Carbon
     */
    public $lastTested;

    /**
     * @var string
     */
    public $connectionString;

    /**
     * @var string
     */
    public $sslMode;

    /**
     * @var string
     */
    public $charset;

    /**
     * @var array
     */
    public $connectionHistory;

    /**
     * @var string
     */
    public $description;

    /**
     * @var string
     */
    public $tags;

    /**
     * Get connection name
     * @return string
     */
    public function getConnectionName()
    {
        return $this->connectionName;
    }

    /**
     * Set connection name
     * @param string $connectionName
     * @return $this
     */
    public function setConnectionName($connectionName)
    {
        $this->connectionName = $connectionName;
        return $this;
    }

    /**
     * Get database type
     * @return string
     */
    public function getDatabaseType()
    {
        return $this->databaseType;
    }

    /**
     * Set database type
     * @param string $databaseType
     * @return $this
     */
    public function setDatabaseType($databaseType)
    {
        $this->databaseType = $databaseType;
        return $this;
    }

    /**
     * Get host
     * @return string
     */
    public function getHost()
    {
        return $this->host;
    }

    /**
     * Set host
     * @param string $host
     * @return $this
     */
    public function setHost($host)
    {
        $this->host = $host;
        return $this;
    }

    /**
     * Get port
     * @return int
     */
    public function getPort()
    {
        return $this->port;
    }

    /**
     * Set port
     * @param int $port
     * @return $this
     */
    public function setPort($port)
    {
        $this->port = $port;
        return $this;
    }

    /**
     * Get database name
     * @return string
     */
    public function getDatabaseName()
    {
        return $this->databaseName;
    }

    /**
     * Set database name
     * @param string $databaseName
     * @return $this
     */
    public function setDatabaseName($databaseName)
    {
        $this->databaseName = $databaseName;
        return $this;
    }

    /**
     * Get username
     * @return string
     */
    public function getUsername()
    {
        return $this->username;
    }

    /**
     * Set username
     * @param string $username
     * @return $this
     */
    public function setUsername($username)
    {
        $this->username = $username;
        return $this;
    }

    /**
     * Get password
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * Set password
     * @param string $password
     * @return $this
     */
    public function setPassword($password)
    {
        $this->password = $password;
        return $this;
    }

    /**
     * Get connection status
     * @return string
     */
    public function getConnectionStatus()
    {
        return $this->connectionStatus;
    }

    /**
     * Set connection status
     * @param string $connectionStatus
     * @return $this
     */
    public function setConnectionStatus($connectionStatus)
    {
        $this->connectionStatus = $connectionStatus;
        return $this;
    }

    /**
     * Get last tested
     * @return \Carbon\Carbon
     */
    public function getLastTested()
    {
        return $this->lastTested;
    }

    /**
     * Set last tested
     * @param \Carbon\Carbon $lastTested
     * @return $this
     */
    public function setLastTested($lastTested)
    {
        $this->lastTested = $lastTested;
        return $this;
    }

    /**
     * Get connection string
     * @return string
     */
    public function getConnectionString()
    {
        return $this->connectionString;
    }

    /**
     * Set connection string
     * @param string $connectionString
     * @return $this
     */
    public function setConnectionString($connectionString)
    {
        $this->connectionString = $connectionString;
        return $this;
    }

    /**
     * Get SSL mode
     * @return string
     */
    public function getSslMode()
    {
        return $this->sslMode;
    }

    /**
     * Set SSL mode
     * @param string $sslMode
     * @return $this
     */
    public function setSslMode($sslMode)
    {
        $this->sslMode = $sslMode;
        return $this;
    }

    /**
     * Get charset
     * @return string
     */
    public function getCharset()
    {
        return $this->charset;
    }

    /**
     * Set charset
     * @param string $charset
     * @return $this
     */
    public function setCharset($charset)
    {
        $this->charset = $charset;
        return $this;
    }

    /**
     * Get connection history
     * @return array
     */
    public function getConnectionHistory()
    {
        return $this->connectionHistory ?: [];
    }

    /**
     * Set connection history
     * @param array $connectionHistory
     * @return $this
     */
    public function setConnectionHistory($connectionHistory)
    {
        $this->connectionHistory = $connectionHistory;
        return $this;
    }

    /**
     * Get description
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Set description
     * @param string $description
     * @return $this
     */
    public function setDescription($description)
    {
        $this->description = $description;
        return $this;
    }

    /**
     * Get tags
     * @return string
     */
    public function getTags()
    {
        return $this->tags;
    }

    /**
     * Set tags
     * @param string $tags
     * @return $this
     */
    public function setTags($tags)
    {
        $this->tags = $tags;
        return $this;
    }

    /**
     * Test database connection
     * @return array
     */
    public function testConnection($object = null): array
    {
        $result = [
            'success' => false,
            'message' => '',
            'response_time' => 0,
            'error_details' => null
        ];

        $startTime = microtime(true);

        try {
            switch (strtolower($object->getDatabaseType())) {
                case 'mysql':
                case 'mariadb':
                    $dsn = "mysql:host={$object->gethost()};port={$object->getport()};dbname={$object->getdatabaseName()};charset={$object->getcharset()}";
                    $pdo = new \PDO($dsn, $object->getusername(), $object->getpassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                        \PDO::ATTR_EMULATE_PREPARES => false,
                    ]);

                    // Test query
                    $stmt = $pdo->query("SELECT 1 as test");
                    $stmt->fetch();

                    $result['success'] = true;
                    $result['message'] = 'MySQL/MariaDB connection successful';
                    break;

                case 'postgresql':
                case 'postgres':
                    $dsn = "pgsql:host={$object->gethost()};port={$object->getport()};dbname={$object->getdatabaseName()}";
                    $pdo = new \PDO($dsn, $object->getusername(), $object->getpassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    // Test query
                    $stmt = $pdo->query("SELECT 1 as test");
                    $stmt->fetch();

                    $result['success'] = true;
                    $result['message'] = 'PostgreSQL connection successful';
                    break;

                case 'sqlite':
                    $dsn = "sqlite:{$object->getdatabaseName()}";
                    $pdo = new \PDO($dsn, null, null, [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    // Test query
                    $stmt = $pdo->query("SELECT 1 as test");
                    $stmt->fetch();

                    $result['success'] = true;
                    $result['message'] = 'SQLite connection successful';
                    break;

                case 'sqlserver':
                case 'mssql':
                $dsn = "sqlsrv:Server={$object->gethost()},{$object->getport()};Database={$object->getdatabaseName()}";
                    $pdo = new \PDO($dsn, $object->getusername(), $object->getpassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    // Test query
                    $stmt = $pdo->query("SELECT 1 as test");
                    $stmt->fetch();

                    $result['success'] = true;
                    $result['message'] = 'SQL Server connection successful';
                    break;

                case 'oracle':
                    $dsn = "oci:dbname={$object->gethost()}:{$object->getport()}/{$object->getdatabaseName()}";
                    $pdo = new \PDO($dsn, $object->getusername(), $object->getpassword(), [
                        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    ]);

                    // Test query
                    $stmt = $pdo->query("SELECT 1 FROM dual");
                    $stmt->fetch();

                    $result['success'] = true;
                    $result['message'] = 'Oracle connection successful';
                    break;

                default:
                    $result['message'] = 'Unsupported database type: ' . $object->getdatabaseType();
                    break;
            }

        } catch (\PDOException $e) {
            $result['success'] = false;
            $result['message'] = 'Connection failed: ' . $e->getMessage();
            $result['error_details'] = [
                'code' => $e->getCode(),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ];
        } catch (\Exception $e) {
            $result['success'] = false;
            $result['message'] = 'Unexpected error: ' . $e->getMessage();
            $result['error_details'] = [
                'code' => $e->getCode(),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ];
        }

        $endTime = microtime(true);
        $result['response_time'] = round(($endTime - $startTime) * 1000, 2); // milliseconds

        // Update connection status and last tested
        $this->setConnectionStatus($result['success'] ? 'connected' : 'failed');
        $this->setLastTested(Carbon::now());

        // Add to connection history
        $history = $this->getConnectionHistory();
        $history[] = [
            'timestamp' => time(),
            'status' => $result['success'] ? 'success' : 'failed',
            'message' => $result['message'],
            'response_time' => $result['response_time']
        ];

        // Keep only last 50 entries
        if (count($history) > 50) {
            $history = array_slice($history, -50);
        }

        $this->setConnectionHistory($history);

        return $result;
    }

    /**
     * Get database connection info
     * @return array
     */
    public static function getConnectionInfo(): array
    {
        return [
            'id' => $this->getId(),
            'connectionName' => $this->getConnectionName(),
            'databaseType' => $this->getDatabaseType(),
            'host' => $this->getHost(),
            'port' => $this->getPort(),
            'databaseName' => $this->getDatabaseName(),
            'username' => $this->getUsername(),
            'connectionStatus' => $this->getConnectionStatus(),
            'lastTested' => $this->getLastTested() ? $this->getLastTested()->timestamp : null,
            'sslMode' => $this->getSslMode(),
            'charset' => $this->getCharset(),
            'description' => $this->getDescription(),
            'tags' => $this->getTags(),
            'connectionHistory' => $this->getConnectionHistory()
        ];
    }
}