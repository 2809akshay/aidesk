pimcore.registerNS("pimcore.plugin.CustomToolbar");
alert("Custom Toolbar Plugin Loaded");
pimcore.plugin.CustomToolbar = Class.create(pimcore.plugin.admin, {
    getClassName: function () {
        return "pimcore.plugin.CustomToolbar";
    },

    initialize: function () {
        pimcore.plugin.broker.registerPlugin(this);
    },

    pimcoreReady: function () {
        // Pimcore admin UI is ready
        var toolbar = pimcore.globalmanager.get("layout_toolbar");

        if (toolbar) {
            toolbar.add({
                text: "My Custom Button",
                iconCls: "pimcore_icon_apply",
                scale: "medium",
                handler: function () {
                    Ext.Msg.alert("Hello", "Custom Button Clicked!");
                }
            });

            toolbar.doLayout();
        }
    }
});

new pimcore.plugin.CustomToolbar();
