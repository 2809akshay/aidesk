<?php

namespace CustomDatabaseBundle\Controller;

use Pimcore\Controller\FrontendController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController extends FrontendController
{
    /**
     * @Route("/admin/custom-database/test", name="custom_database_test")
     */
    public function test(): Response
    {
        return new Response('Custom Database Bundle is working!');
    }
}
