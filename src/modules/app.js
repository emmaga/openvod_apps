'use strict';

(function () {
    var app = angular.module('openvod_apps', [
        'ui.router',
        'pascalprecht.translate',
        'app.controllers',
        'app.filters',
        'app.directives',
        'app.services',
        'angular-md5',
        'ngCookies',
        'ngTable',
        'ui.bootstrap'
    ])

        .config(['$translateProvider', function ($translateProvider) {
            var lang = navigator.language.indexOf('zh') > -1 ? 'zh-CN' : 'en-US';
            $translateProvider.preferredLanguage(lang);
            $translateProvider.useStaticFilesLoader({
                prefix: 'i18n/',
                suffix: '.json'
            });
        }])

        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('/login');
            $stateProvider
                .state('login', {
                    url: '/login',
                    templateUrl: 'pages/login.html'
                })
                .state('app', {
                    url: '/app',
                    templateUrl: 'pages/app.html'
                })
                .state('app.appsGroup', {
                    url: '/appsGroup',
                    templateUrl: 'pages/appsGroup.html'
                })
                // 应用组合 的 应用列表
                .state('app.appsGroup.groupAppList', {
                    url: '/groupAppList?ID',
                    templateUrl: 'pages/groupAppList.html'
                })
                .state('app.appsGroup.appsGroupInfo', {
                    url: '/appsGroupInfo?ID',
                    templateUrl: 'pages/appsGroupInfo.html'
                })
                .state('app.appsWarehouse', {
                    url: '/appsWarehouse',
                    templateUrl: 'pages/appsWarehouse.html'
                })

        }])

        .constant('CONFIG', {
            serverUrl: 'http://openvod.cleartv.cn/backend_app/v1/',
            uploadUrl: 'http://mres.cleartv.cn/upload',
            testUrl: 'test/',
            test: false
        })
})();