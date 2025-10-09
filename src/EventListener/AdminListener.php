<?php

namespace App\EventListener;

use Pimcore\Event\AdminEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Pimcore\Event\BundleManager\PathsEvent;

class AdminListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
        return [
            AdminEvents::RESOURCES_JS_PATHS => 'addJs',
            AdminEvents::RESOURCES_CSS_PATHS => 'addCss',
        ];
    }

    public function addJs(PathsEvent $event)
    {
        $event->addPath('/bundles/customdatabase/static/bot/script.js');
    }

    public function addCss(PathsEvent $event)
    {
        $event->addPath('/bundles/customdatabase/static/bot/style.css');
    }
}
