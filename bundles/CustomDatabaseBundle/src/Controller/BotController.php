<?php
// src/Controller/BotController.php

namespace CustomDatabaseBundle\Controller;

use Pimcore\Controller\FrontendController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class BotController extends FrontendController
{
    /**
     * @Route("/anlashis-data", name="anlashis_data", methods={"POST"})
     */
    public function anlashisDataAction(Request $request): Response
    {
        $transcriptText = $request->request->get('transcriptText', '');

        return new Response(json_encode([
            'message' => $transcriptText
        ]), 200, ['Content-Type' => 'application/json']);
    }
}
