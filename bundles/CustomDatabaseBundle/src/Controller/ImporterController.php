<?php

namespace CustomDatabaseBundle\Controller;

use Pimcore\Controller\FrontendController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ImporterController extends FrontendController
{
    #[Route("/admin/impoter", name:"importer_index")]
    public function indexAction(): Response
    {
        return $this->render('@CustomDatabase/default/importer.html.twig');
    }

    #[Route("/admin/impoter/upload", name:"importer_upload", methods:["POST"])]
    public function uploadAction(Request $request): Response
    { dd('d');
        $file = $request->files->get('file');

        if (!$file) {
            return new Response('No file uploaded', 400);
        }

        $ext = $file->getClientOriginalExtension();
        $rows = [];

        if ($ext === 'csv') {
            $handle = fopen($file->getPathname(), "r");
            while (($data = fgetcsv($handle, 1000, ",")) !== false) {
                $rows[] = $data;
            }
            fclose($handle);
        }

        return $this->json(['rows' => $rows]);
    }
}
