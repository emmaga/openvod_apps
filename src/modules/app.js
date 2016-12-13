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
        'ngTable'
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
                .state('app.transcodingList', {
                    url: '/transcodingList',
                    templateUrl: 'pages/transcodingList.html'
                })
                .state('app.notEditedList', {
                    url: '/notEditedList',
                    templateUrl: 'pages/notEditedList.html'
                })
                .state('app.editedList', {
                    url: '/editedList',
                    templateUrl: 'pages/editedList.html'
                })
        }])

        .constant('CONFIG', {
            serverUrl: 'http://movies.clearidc.com/backend_movie/v1/',
            uploadImgUrl: 'http://mres.cleartv.cn/upload',
            uploadVideoUrl: 'http://movies.clearidc.com/upload',
            testUrl: 'test/',
            test: false
        })
})();