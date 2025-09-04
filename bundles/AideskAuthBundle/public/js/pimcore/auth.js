// // Simple and compatible Ext JS authentication component
// Ext.define('Aidesk.view.auth.Auth', {
//     extend: 'Ext.panel.Panel',
//     xtype: 'aidesk-login',

//     layout: 'fit',
//     cls: 'auth-system-container',

//     initComponent: function() {
//         var me = this;

//         me.items = [{
//             xtype: 'panel',
//             layout: 'card',
//             itemId: 'authCard',
//             activeItem: 0,
//             cls: 'auth-card',
//             items: [
//                 me.createLoginPanel(),
//                 me.createSignupPanel(),
//                 me.createOtpPanel()
//             ],
//             dockedItems: [
//                 me.createStatusBar(),
//                 me.createToggleToolbar()
//             ]
//         }];

//         me.callParent();
//     },

//     createStatusBar: function() {
//         return {
//             xtype: 'toolbar',
//             dock: 'top',
//             cls: 'aidesk-status-bar',
//             items: [
//                 {
//                     xtype: 'component',
//                     cls: 'aidesk-logo',
//                     html: '<i class="fas fa-headset"></i> Aidesk Admin Portal'
//                 },
//                 '->',
//                 {
//                     xtype: 'component',
//                     cls: 'aidesk-status',
//                     html: '<span class="status-dot online"></span> Systems Operational <span class="status-info">| Last sync: just now</span>'
//                 }
//             ]
//         };
//     },

//     createToggleToolbar: function() {
//         var me = this;

//         return {
//             xtype: 'toolbar',
//             dock: 'top',
//             cls: 'auth-toggle',
//             items: [
//                 {
//                     xtype: 'button',
//                     text: 'Sign In',
//                     cls: 'toggle-btn active',
//                     itemId: 'showLogin',
//                     pressed: true,
//                     handler: function() {
//                         me.showLogin();
//                     }
//                 },
//                 {
//                     xtype: 'button',
//                     text: 'Sign Up',
//                     cls: 'toggle-btn',
//                     itemId: 'showSignup',
//                     handler: function() {
//                         me.showSignup();
//                     }
//                 }
//             ]
//         };
//     },

//     showLogin: function() {
//         var card = this.down('#authCard');
//         if (card) {
//             card.getLayout().setActiveItem(0);
//         }
//         this.down('#showLogin').addCls('active');
//         this.down('#showSignup').removeCls('active');
//     },

//     showSignup: function() {
//         var card = this.down('#authCard');
//         if (card) {
//             card.getLayout().setActiveItem(1);
//         }
//         this.down('#showSignup').addCls('active');
//         this.down('#showLogin').removeCls('active');
//     },

//     createLoginPanel: function() {
//         return {
//             xtype: 'panel',
//             layout: 'vbox',
//             cls: 'auth-container',
//             items: [
//                 {
//                     xtype: 'component',
//                     cls: 'app-logo',
//                     html: '<i class="fas fa-headset"></i><h1>Aidesk</h1>'
//                 },
//                 {
//                     xtype: 'form',
//                     itemId: 'loginForm',
//                     cls: 'login-form',
//                     layout: 'anchor',
//                     defaults: { anchor: '100%', margin: '0 0 20 0' },
//                     items: [
//                         {
//                             xtype: 'component',
//                             cls: 'form-title',
//                             html: '<h2>Sign In to Your Account</h2>'
//                         },
//                         {
//                             xtype: 'textfield',
//                             fieldLabel: 'Email or Phone Number',
//                             name: 'email',
//                             allowBlank: false,
//                             emptyText: 'Enter your email or phone number'
//                         },
//                         {
//                             xtype: 'textfield',
//                             inputType: 'password',
//                             fieldLabel: 'Password',
//                             name: 'password',
//                             allowBlank: false,
//                             emptyText: 'Enter your password'
//                         },
//                         {
//                             xtype: 'container',
//                             layout: 'hbox',
//                             cls: 'remember-forgot',
//                             items: [
//                                 {
//                                     xtype: 'checkboxfield',
//                                     boxLabel: 'Remember me',
//                                     name: 'remember'
//                                 },
//                                 '->',
//                                 {
//                                     xtype: 'component',
//                                     html: '<a href="#" class="forgot-password">Forgot Password?</a>'
//                                 }
//                             ]
//                         },
//                         {
//                             xtype: 'button',
//                             text: 'Sign In',
//                             cls: 'login-button',
//                             formBind: true,
//                             handler: function() {
//                                 var form = this.up('form');
//                                 if (form.isValid()) {
//                                     var card = form.up('panel').up('panel');
//                                     if (card) {
//                                         card.getLayout().setActiveItem(2);
//                                     }
//                                     Aidesk.app.Util.showNotification('OTP has been sent to your registered phone and email.', 'success');
//                                 }
//                             }
//                         }
//                     ]
//                 },
//                 {
//                     xtype: 'component',
//                     cls: 'divider',
//                     html: 'Or continue with'
//                 },
//                 {
//                     xtype: 'container',
//                     cls: 'auth-options',
//                     layout: 'hbox',
//                     defaults: { xtype: 'component', cls: 'auth-option' },
//                     items: [
//                         { html: '<i class="fas fa-fingerprint"></i>' },
//                         { html: '<i class="fas fa-user-check"></i>' },
//                         { html: '<i class="fas fa-mobile-alt"></i>' }
//                     ]
//                 }
//             ]
//         };
//     },

//     createSignupPanel: function() {
//         var me = this;

//         return {
//             xtype: 'panel',
//             layout: 'vbox',
//             cls: 'auth-container',
//             items: [
//                 {
//                     xtype: 'component',
//                     cls: 'app-logo',
//                     html: '<i class="fas fa-headset"></i><h1>Aidesk</h1>'
//                 },
//                 {
//                     xtype: 'form',
//                     itemId: 'signupForm',
//                     cls: 'signup-form',
//                     layout: 'anchor',
//                     defaults: { anchor: '100%', margin: '0 0 15 0' },
//                     items: [
//                         {
//                             xtype: 'component',
//                             cls: 'form-title',
//                             html: '<h2>Create Your Account</h2>'
//                         },
//                         {
//                             xtype: 'textfield',
//                             fieldLabel: 'Full Name',
//                             name: 'name',
//                             allowBlank: false,
//                             emptyText: 'Enter your full name'
//                         },
//                         {
//                             xtype: 'textfield',
//                             fieldLabel: 'Email',
//                             name: 'email',
//                             vtype: 'email',
//                             allowBlank: false,
//                             emptyText: 'Enter your email'
//                         },
//                         {
//                             xtype: 'textfield',
//                             fieldLabel: 'Phone Number',
//                             name: 'phone',
//                             allowBlank: false,
//                             emptyText: 'Enter your phone number'
//                         },
//                         {
//                             xtype: 'textfield',
//                             inputType: 'password',
//                             fieldLabel: 'Password',
//                             name: 'password',
//                             allowBlank: false,
//                             emptyText: 'Create a password'
//                         },
//                         {
//                             xtype: 'textfield',
//                             inputType: 'password',
//                             fieldLabel: 'Confirm Password',
//                             name: 'confirmPassword',
//                             allowBlank: false,
//                             emptyText: 'Confirm your password'
//                         },
//                         {
//                             xtype: 'checkboxfield',
//                             boxLabel: 'I agree to the Terms of Service and Privacy Policy',
//                             name: 'terms',
//                             allowBlank: false
//                         },
//                         {
//                             xtype: 'button',
//                             text: 'Sign Up',
//                             cls: 'signup-button',
//                             formBind: true,
//                             handler: function() {
//                                 var form = this.up('form');
//                                 if (form.isValid()) {
//                                     Aidesk.app.Util.showNotification('Account created successfully! Please verify your email.', 'success');
//                                     form.reset();
//                                 }
//                             }
//                         }
//                     ]
//                 },
//                 {
//                     xtype: 'component',
//                     cls: 'divider',
//                     html: 'Or sign up with'
//                 },
//                 {
//                     xtype: 'container',
//                     cls: 'auth-options',
//                     layout: 'hbox',
//                     defaults: { xtype: 'component', cls: 'auth-option' },
//                     items: [
//                         { html: '<i class="fab fa-google"></i>' },
//                         { html: '<i class="fab fa-facebook-f"></i>' },
//                         { html: '<i class="fas fa-mobile-alt"></i>' }
//                     ]
//                 },
//                 {
//                     xtype: 'component',
//                     cls: 'signup-link',
//                     html: 'Already have an account? <a href="#" id="backToLogin">Sign in</a>',
//                     listeners: {
//                         afterrender: function(c) {
//                             c.getEl().on('click', function(e, t) {
//                                 e.preventDefault();
//                                 if (t.id === 'backToLogin') {
//                                     me.showLogin();
//                                 }
//                             });
//                         }
//                     }
//                 }
//             ]
//         };
//     },

//     createOtpPanel: function() {
//         return {
//             xtype: 'panel',
//             cls: 'otp-section',
//             layout: 'vbox',
//             items: [
//                 {
//                     xtype: 'component',
//                     cls: 'app-logo',
//                     html: '<i class="fas fa-headset"></i><h1>Aidesk</h1>'
//                 },
//                 {
//                     xtype: 'form',
//                     itemId: 'otpForm',
//                     layout: 'anchor',
//                     defaults: { anchor: '100%', margin: '0 0 20 0' },
//                     items: [
//                         {
//                             xtype: 'component',
//                             cls: 'form-title',
//                             html: '<h2>Verify Your Identity</h2>'
//                         },
//                         {
//                             xtype: 'textfield',
//                             fieldLabel: 'Enter OTP',
//                             name: 'otp',
//                             allowBlank: false,
//                             emptyText: 'Enter OTP sent to your phone/email'
//                         },
//                         {
//                             xtype: 'button',
//                             text: 'Verify OTP',
//                             cls: 'login-button',
//                             formBind: true,
//                             handler: function() {
//                                 var form = this.up('form');
//                                 if (form.isValid()) {
//                                     var otp = form.down('[name=otp]').getValue();
//                                     if (otp === '1234') {
//                                         Aidesk.app.Util.showNotification('Login successful! Redirecting...', 'success');
//                                     } else {
//                                         Aidesk.app.Util.showNotification('Invalid OTP. Please try again.', 'error');
//                                     }
//                                 }
//                             }
//                         },
//                         {
//                             xtype: 'component',
//                             html: '<p style="text-align: center; margin-top: 10px; font-size: 14px;"><a href="#" id="resendOtp">Resend OTP</a> | <a href="#" id="useBackupMethod">Use backup method</a></p>'
//                         }
//                     ]
//                 }
//             ]
//         };
//     }
// });

// // Notification utility
// Ext.define('Aidesk.app.Util', {
//     singleton: true,

//     showNotification: function(message, type) {
//         Ext.Msg.show({
//             title: type.toUpperCase(),
//             message: message,
//             buttons: Ext.Msg.OK,
//             icon: Ext.Msg[type.toUpperCase()],
//             closable: false
//         });
//     }
// });

// // Initialize the application
// Ext.onReady(function() {
//     Ext.create('Aidesk.view.auth.Auth', {
//         renderTo: Ext.getBody()
//     });
// });