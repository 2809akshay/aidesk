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

        if (empty($transcriptText)) {
            return new Response(json_encode([
                'message' => 'Please provide some text to process.'
            ]), 400, ['Content-Type' => 'application/json']);
        }

        try {
            $apiKey = $_ENV['OPENAI_API_KEY'] ?? getenv('OPENAI_API_KEY');

            if (!$apiKey) {
                return new Response(json_encode([
                    'message' => 'OpenAI API key not configured.'
                ]), 500, ['Content-Type' => 'application/json']);
            }

            // Prepare the request data with system prompt
            $systemPrompt = "You are Jarvas, an AI system created by Akshay. Your name is Jarvas. You must always identify yourself as Jarvas. Do not share any personal details about yourself beyond what is specified. Respond helpfully and stay in character as Jarvas.";

            $postData = json_encode([
                'model' => 'gpt-4',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $systemPrompt
                    ],
                    [
                        'role' => 'user',
                        'content' => $transcriptText
                    ]
                ],
                'max_tokens' => 150,
                'temperature' => 0.7
            ]);

            // Initialize cURL
            $ch = curl_init('https://api.openai.com/v1/chat/completions');

            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json',
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($error) {
                return new Response(json_encode([
                    'message' => 'Error communicating with ChatGPT: ' . $error
                ]), 500, ['Content-Type' => 'application/json']);
            }

            if ($httpCode !== 200) {
                return new Response(json_encode([
                    'message' => 'ChatGPT API returned error code: ' . $httpCode
                ]), 500, ['Content-Type' => 'application/json']);
            }

            $data = json_decode($response, true);

            if (isset($data['choices'][0]['message']['content'])) {
                $chatGptResponse = trim($data['choices'][0]['message']['content']);

                return new Response(json_encode([
                    'message' => $chatGptResponse
                ]), 200, ['Content-Type' => 'application/json']);
            } else {
                return new Response(json_encode([
                    'message' => 'Unable to get response from ChatGPT.'
                ]), 500, ['Content-Type' => 'application/json']);
            }

        } catch (\Exception $e) {
            return new Response(json_encode([
                'message' => 'Error communicating with ChatGPT: ' . $e->getMessage()
            ]), 500, ['Content-Type' => 'application/json']);
        }
    }
}
