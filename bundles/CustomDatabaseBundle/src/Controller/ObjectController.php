<?php

namespace CustomDatabaseBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Pimcore\Model\DataObject\DatabaseConn;
use Pimcore\Db\ConnectionInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

class ObjectController extends AbstractController
{
    /**
     * @var ConnectionInterface
     */
    protected $db;

    /**
     * @Route("/object-selector", name="object_selector")
     */
    public function objectSelector(Request $request): Response
    {
        $className = 'DatabaseConn';
        $listClass = "\\Pimcore\\Model\\DataObject\\{$className}\\Listing";

        $products = [];

        if (class_exists($listClass)) {
            $list = new $listClass();
            $list->setLimit(100); // limit for performance
            
            foreach ($list as $product) {
                $data = [
                    'id' => $product->getId(),
                    'key' => $product->getKey(),
                    'path' => $product->getFullPath(),
                    'published' => $product->isPublished(),
                    'creationDate' => $product->getCreationDate(),
                    'modificationDate' => $product->getModificationDate()
                ];

                // get all field names from class definition
                $class = $product->getClass();
                foreach ($class->getFieldDefinitions() as $fieldName => $fieldDef) {
                    $getter = 'get' . ucfirst($fieldName);
                    if (method_exists($product, $getter)) {
                        $data[$fieldName] = $product->$getter();
                    } else {
                        $data[$fieldName] = null; // fallback if no getter exists
                    }
                }

                $products[] = $data;
            }
        }

        $classes = ['DatabaseConn']; // add other classes as needed
        return $this->render('@CustomDatabase/default/object-selector.html.twig', [
            'products' => $products,
            'classes' => $classes
        ]);
    }

    /**
     * @Route("/get-class-fields", name="get_class_fields")
     */
    public function getClassFields(Request $request): JsonResponse
    {
        $className = $request->query->get('class');
        $fields = [];

        if ($className) {
            $classDef = \Pimcore\Model\DataObject\ClassDefinition::getByName($className);
            if ($classDef) {
                foreach ($classDef->getFieldDefinitions() as $name => $def) {
                    $fields[] = [
                        'name' => $name,
                        'label' => $def->getTitle() ?: $name
                    ];
                }
            }
        }

        return new JsonResponse($fields);
    }

    /**
     * @Route("/create-object", name="create_object", methods={"GET"})
     */
    public function createObject(Request $request): JsonResponse
    {
        try {
            // Use query parameters instead of request body
            $data = $request->query->all();

            if (empty($data['class']) || empty($data['path']) || empty($data['key'])) {
                return new JsonResponse(['success' => false, 'message' => 'Missing required fields']);
            }

            $className = '\\Pimcore\\Model\\DataObject\\' . $data['class'];
            $newObject = new $className();
            $newObject->setKey($data['key']);
            $newObject->setParent(\Pimcore\Model\DataObject\Service::createFolderByPath($data['path']));

            foreach ($data as $field => $value) {
                if ($field === 'class' || $field === 'key' || $field === 'path') {
                    continue; // Skip these fields
                }
                if (method_exists($newObject, 'set' . ucfirst($field))) {
                    $newObject->{'set' . ucfirst($field)}($value);
                }
            }
  
            $newObject->setPublished(true);
            $newObject->save();
           

            return new JsonResponse([
                'success' => true,
                'object' => [
                    'id' => $newObject->getId(),
                    'path' => $newObject->getFullPath(),
                ]
            ]);

        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => $e->getMessage()]);
        }
    }


    /**
     * @Route("/object-multi-selector", name="object_multi_selector")
     */
    public function objectMultiSelector(Request $request): Response
    {
        $className = 'DatabaseConn';
        $listClass = "\\Pimcore\\Model\\DataObject\\{$className}\\Listing";

        $products = [];

        if (class_exists($listClass)) {
            $list = new $listClass();
            $list->setLimit(100); // limit for performance
            
            foreach ($list as $product) {
                $data = [
                    'id' => $product->getId(),
                    'key' => $product->getKey(),
                    'path' => $product->getFullPath(),
                    'published' => $product->isPublished(),
                    'creationDate' => $product->getCreationDate(),
                    'modificationDate' => $product->getModificationDate()
                ];

                // get all field names from class definition
                $class = $product->getClass();
                foreach ($class->getFieldDefinitions() as $fieldName => $fieldDef) {
                    $getter = 'get' . ucfirst($fieldName);
                    if (method_exists($product, $getter)) {
                        $data[$fieldName] = $product->$getter();
                    } else {
                        $data[$fieldName] = null; // fallback if no getter exists
                    }
                }

                $products[] = $data;
            }
        }

        $classes = ['DatabaseConn']; // add other classes as needed
        return $this->render('@CustomDatabase/default/object-multi-selector.html.twig', [
            'products' => $products,
            'classes' => $classes
        ]);
    }
}