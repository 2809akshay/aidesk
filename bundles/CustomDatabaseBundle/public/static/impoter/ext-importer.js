Ext.onReady(function () {
    Ext.create('Ext.form.Panel', {
        renderTo: 'importer-app',
        title: 'CSV File Importer',
        width: 600,
        bodyPadding: 10,
        frame: true,
        items: [{
            xtype: 'filefield',
            name: 'file',
            fieldLabel: 'CSV File',
            labelWidth: 70,
            msgTarget: 'side',
            allowBlank: false,
            anchor: '100%',
            buttonText: 'Select File...'
        }],
        buttons: [{
            text: 'Upload',
            formBind: true,
            handler: function (btn) {
                const form = btn.up('form').getForm();
                if (form.isValid()) {
                    form.submit({
                        url: '/admin/impoter/upload',
                        waitMsg: 'Uploading your file...',
                        success: function (fp, o) {
                            const data = o.result.rows;
                            renderGrid(data);
                        },
                        failure: function (fp, o) {
                            Ext.Msg.alert('Error', 'File upload failed.');
                        }
                    });
                }
            }
        }]
    });

    function renderGrid(rows) {
        if (!rows || rows.length === 0) {
            Ext.Msg.alert('No Data', 'The uploaded CSV is empty.');
            return;
        }

        const headers = rows[0];
        const data = rows.slice(1).map(r => {
            let obj = {};
            headers.forEach((h, i) => {
                obj[h] = r[i] || '';
            });
            return obj;
        });

        const fields = headers.map(h => ({ name: h }));
        const columns = headers.map(h => ({ text: h, dataIndex: h, flex: 1 }));

        Ext.create('Ext.grid.Panel', {
            renderTo: 'importer-app',
            title: 'CSV Preview',
            width: 600,
            height: 400,
            store: {
                fields: fields,
                data: data
            },
            columns: columns
        });
    }
});
