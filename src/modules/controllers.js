'use strict';

(function () {
    var app = angular.module('app.controllers', [])

        .controller('indexController', ['$scope',
            function ($scope) {
                var self = this;
                self.init = function () {
                    this.maskUrl = '';
                }
            }
        ])

        .controller('loginController', ['$scope', '$http', '$state', '$filter', 'md5', 'util',
            function ($scope, $http, $state, $filter, md5, util) {
                var self = this;
                self.init = function () {
                    self.loading = false;
                }

                self.login = function () {
                    $state.go('app');
                    self.loading = true;

                    var data = JSON.stringify({
                        username: self.userName,
                        password: md5.createHash(self.password)
                    })
                    // $http({
                    //     method: 'POST',
                    //     url: util.getApiUrl('logon', '', 'server'),
                    //     data: data
                    // }).then(function successCallback(response) {
                    //     var msg = response.data;
                    //     if (msg.rescode == '200') {
                    //         util.setParams('token', msg.token);
                    //         self.getEditLangs();
                    //     } else if (msg.rescode == "401") {
                    //         alert('访问超时，请重新登录');
                    //         $state.go('login')
                    //     } else {
                    //         alert(msg.rescode + ' ' + msg.errInfo);
                    //     }
                    // }, function errorCallback(response) {
                    //     alert(response.status + ' 服务器出错');
                    // }).finally(function (value) {
                    //     self.loading = false;
                    // });
                }
                //
                self.getEditLangs = function () {
                    $http({
                        method: 'GET',
                        url: util.getApiUrl('', 'editLangs.json', 'local')
                    }).then(function successCallback(response) {
                        util.setParams('editLangs', response.data.editLangs);
                        $state.go('app');
                    }, function errorCallback(response) {

                    });
                }

            }
        ])

        .controller('appController', ['$http', '$scope', '$state', '$stateParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.isNavCollapsed = true;
                    $state.go('app.appsGroup')
                }

                self.logout = function (event) {
                    util.setParams('token', '');
                    $state.go('login');
                }
                
                self.goAppsGroup = function () {
                    $state.go('app.appsGroup');
                }

                self.goAppsWarehouse = function () {
                    $state.go('app.appsWarehouse');
                }
            }
        ])

        .controller('appsGroupController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'util',
            function ($http, $scope, $state, $filter, $stateParams, util) {
                var self = this;
                self.groups = [
                    {"groupId": 0, "groupName": "test_group1"},
                    {"groupId": 1, "groupName": "test_group2"},
                    {"groupId": 2, "groupName": "test_group3"}
                ];
                self.init = function() {

                }
            }
        ])

        .controller('appsGroupInfoController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'NgTableParams', 'util',
            function ($http, $scope, $state, $filter, $stateParams, NgTableParams, util) {
                var self = this;
                self.init = function() {
                }
            }
        ])

        .controller('appsWarehouseController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'NgTableParams', 'util',
            function ($http, $scope, $state, $filter, $stateParams, NgTableParams, util) {
                var self = this;
                self.init = function() {

                }
            }
        ])

})();