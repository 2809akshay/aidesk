<?php

namespace CustomDatabaseBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class DataProtectionController extends AbstractController
{
    /**
     * @Route("/data-protection", name="data_protection")
     */
    public function dataProtectionAction(Request $request): Response
    {
        return $this->render('@CustomDatabase/default/data-protection.html.twig', [
            'title' => 'Data Protection',
            'current_route' => 'data_protection'
        ]);
    }

    /**
     * @Route("/data-protection/export", name="data_protection_export", methods={"POST"})
     */
    public function exportDataAction(Request $request): JsonResponse
    {
        try {
            // Mock data export functionality
            $userData = [
                'personal_info' => [
                    'name' => 'John Doe',
                    'email' => 'john.doe@example.com',
                    'export_date' => date('Y-m-d H:i:s')
                ],
                'activity_data' => [
                    'last_login' => date('Y-m-d H:i:s', strtotime('-2 days')),
                    'total_sessions' => 45,
                    'data_points' => 1250
                ],
                'export_format' => 'JSON'
            ];

            return new JsonResponse([
                'success' => true,
                'message' => 'Data export initiated successfully',
                'data' => $userData,
                'download_url' => '/data-protection/download/' . uniqid()
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Error exporting data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @Route("/data-protection/delete", name="data_protection_delete", methods={"POST"})
     */
    public function deleteDataAction(Request $request): JsonResponse
    {
        try {
            // Mock data deletion functionality
            $confirmationCode = $request->request->get('confirmation_code');

            if (!$confirmationCode || $confirmationCode !== 'DELETE_MY_DATA') {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Invalid confirmation code. Please type "DELETE_MY_DATA" to confirm.'
                ], 400);
            }

            // Simulate data deletion process
            // In a real application, this would delete user data from database

            return new JsonResponse([
                'success' => true,
                'message' => 'Data deletion request processed successfully. You will receive a confirmation email within 24 hours.',
                'deletion_id' => uniqid('DEL_'),
                'estimated_completion' => date('Y-m-d H:i:s', strtotime('+24 hours'))
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Error processing deletion request: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @Route("/data-protection/consent", name="data_protection_consent", methods={"POST"})
     */
    public function updateConsentAction(Request $request): JsonResponse
    {
        try {
            $consentType = $request->request->get('consent_type');
            $consentValue = $request->request->get('consent_value') === 'true';

            $validConsentTypes = [
                'analytics',
                'marketing',
                'third_party',
                'data_sharing',
                'profiling'
            ];

            if (!in_array($consentType, $validConsentTypes)) {
                return new JsonResponse([
                    'success' => false,
                    'message' => 'Invalid consent type'
                ], 400);
            }

            // Mock consent update
            $consentData = [
                'type' => $consentType,
                'value' => $consentValue,
                'updated_at' => date('Y-m-d H:i:s'),
                'ip_address' => $request->getClientIp(),
                'user_agent' => $request->headers->get('User-Agent')
            ];

            return new JsonResponse([
                'success' => true,
                'message' => 'Consent updated successfully',
                'data' => $consentData
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Error updating consent: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @Route("/data-protection/report", name="data_protection_report", methods={"GET"})
     */
    public function privacyReportAction(Request $request): Response
    {
        // Mock privacy report data
        $reportData = [
            'data_collected' => [
                'personal_info' => ['name', 'email', 'phone', 'address'],
                'usage_data' => ['login_history', 'page_views', 'feature_usage'],
                'technical_data' => ['ip_address', 'browser_info', 'device_info']
            ],
            'data_sharing' => [
                'analytics_providers' => ['Google Analytics', 'Mixpanel'],
                'marketing_partners' => ['Mailchimp', 'HubSpot'],
                'service_providers' => ['AWS', 'Stripe', 'SendGrid']
            ],
            'retention_periods' => [
                'personal_data' => '2 years after last activity',
                'usage_data' => '1 year',
                'logs' => '90 days'
            ],
            'security_measures' => [
                'encryption' => 'AES-256',
                'access_control' => 'Role-based access control',
                'monitoring' => '24/7 security monitoring',
                'compliance' => 'GDPR, CCPA compliant'
            ],
            'generated_at' => date('Y-m-d H:i:s')
        ];

        return $this->render('@CustomDatabaseBundle/default/data-protection-report.html.twig', [
            'title' => 'Privacy Report',
            'report_data' => $reportData,
            'current_route' => 'data_protection_report'
        ]);
    }
}