<?php

namespace CustomDatabaseBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Pimcore\Model\DataObject\DatabaseConn;
use Pimcore\Db\ConnectionInterface;
use Pimcore\Tool;
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
     * @Route("/update-all-fields", name="update_all_fields", methods={"POST"})
     */
    public function updateAllFields(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (empty($data['id'])) {
                return new JsonResponse(['success' => false, 'message' => 'Missing object ID']);
            }

            $object = \Pimcore\Model\DataObject\DatabaseConn::getById($data['id']);
            if (!$object) {
                return new JsonResponse(['success' => false, 'message' => 'Object not found']);
            }

            // Update description if provided
            if (isset($data['description'])) {
                $object->setDescription($data['description']);
            }

            // Update localized fields if provided
            if (isset($data['localizedFields']) && is_array($data['localizedFields'])) {
                $localizedFields = $object->getLocalizedfields();
                foreach ($data['localizedFields'] as $lang => $fields) {
                    if (isset($fields['dataDescription'])) {
                        $localizedFields->setLocalizedValue('dataDescription', $fields['dataDescription'], $lang);
                    }
                    if (isset($fields['sortDescription'])) {
                        $localizedFields->setLocalizedValue('sortDescription', $fields['sortDescription'], $lang);
                    }
                }
            }

            $object->save();

            return new JsonResponse(['success' => true, 'message' => 'All fields updated successfully']);

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


    /**
     * @Route("/object-localizedfields", name="object_localizedfields")
     */
    public function objectLocalizedfields(Request $request): Response
    {
        $className = 'DatabaseConn';
        $listClass = "\\Pimcore\\Model\\DataObject\\{$className}\\Listing";

        $objects = [];
        $languages = Tool::getValidLanguages();

        if (class_exists($listClass)) {
            $list = new $listClass();
            $list->setLimit(100 ); // limit for performance

            foreach ($list as $object) {
                $objectData = [
                    'id' => $object->getId(),
                    'key' => $object->getKey(),
                    'connectionName' => $object->getConnectionName(),
                    'description' => $object->getDescription(),
                    'localizedFields' => []
                ];

                foreach ($languages as $lang) {
                    $objectData['localizedFields'][$lang] = [
                        'dataDescription' => $object->getLocalizedfields()->getLocalizedValue('dataDescription', $lang),
                        'sortDescription' => $object->getLocalizedfields()->getLocalizedValue('sortDescription', $lang)
                    ];
                }

                $objects[] = $objectData;
            }
        }

        return $this->render('@CustomDatabase/default/object-localizedfields.html.twig', [
            'objects' => $objects,
            'languages' => $languages
        ]);
    }
}