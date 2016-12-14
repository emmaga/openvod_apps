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
                    self.loading = true;

                    var data = JSON.stringify({
                        username: self.userName,
                        password: md5.createHash(self.password)
                    })
                    $http({
                        method: 'POST',
                        url: util.getApiUrl('logon', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            util.setParams('token', msg.token);
                            self.getEditLangs();
                        } else if (msg.rescode == "401") {
                            alert('访问超时，请重新登录');
                            $state.go('login')
                        } else {
                            alert(msg.rescode + ' ' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function (value) {
                        self.loading = false;
                    });
                }
                /**
                 * 获取默认语言
                 */
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
                    self.loading = false;
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

                /**
                 * 添加 删除 弹窗，增加一个样式的class
                 * @param bool
                 * @param url
                 */
                self.showHideMask = function (bool, url) {
                    // bool 为true时，弹窗出现
                    if (bool) {
                        $scope.app.maskUrl = url;
                        $scope.app.showMaskClass = true;
                    } else {
                        $scope.app.maskUrl = '';
                        $scope.app.showMaskClass = false;
                    }

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
                self.init = function () {

                }

                /**
                 * 添加广告
                 */
                self.addAdv = function () {
                    $scope.app.maskParams = {'groupId': self.groupId};
                    $scope.app.showHideMask(true, 'pages/droupAdd.html');
                }
            }
        ])

        .controller('appsGroupInfoController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'NgTableParams', 'util',
            function ($http, $scope, $state, $filter, $stateParams, NgTableParams, util) {
                var self = this;
                self.init = function () {
                    self.lang = util.langStyle();
                    // self.defaultLangCode = util.getDefaultLangCode();
                    self.groupId = $stateParams.groupId;
                }

                /**
                 * 添加应用
                 */
                self.addApp = function () {
                    $scope.app.maskParams = {'groupId': self.groupId};
                    $scope.app.showHideMask(true, 'pages/appsImport.html');
                }

                /**
                 * 删除应用
                 * @param appId
                 */
                self.deleteApp = function (appId) {
                    if (confirm('确定删除该应用吗？')) {
                        self.deleting = true;
                        var data = JSON.stringify({
                            appId: appId
                        })
                        $http({
                            method: 'POST',
                            url: util.getApiUrl('logon', '', 'server'),
                            data: data
                        }).then(function successCallback(response) {
                            var msg = response.data;
                            if (msg.rescode == '200') {

                            } else if (msg.rescode == "401") {
                                alert('访问超时，请重新登录');
                                $state.go('login')
                            } else {
                                alert(msg.rescode + ' ' + msg.errInfo);
                            }
                        }, function errorCallback(response) {
                            alert(response.status + ' 服务器出错');
                        }).finally(function (value) {
                            self.deleting = false;
                        });
                    }
                }
            }
        ])

        .controller('appsImportController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'NgTableParams', 'util',
            function ($http, $scope, $state, $filter, $stateParams, NgTableParams, util) {
                var self = this;
                self.init = function () {
                    self.groupId = $scope.app.maskParams.groupId;
                }

                self.cancel = function () {
                    $scope.app.showHideMask(false);
                };
            }
        ])

        .controller('appsWarehouseController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'NgTableParams', 'util',
            function ($http, $scope, $state, $filter, $stateParams, NgTableParams, util) {
                var self = this;
                self.init = function () {
                    self.loading = false;
                    self.search()
                }

                /**
                 * 获取应用列表
                 */
                self.search = function () {
                    self.tableParams = new NgTableParams(
                        {
                            page: 1,
                            count: 15,
                            url: ''
                        },
                        {
                            counts: false,
                            getData: function (params) {
                                var paramsUrl = params.url();
                                var searchName = "";
                                if (self.searchName) {
                                    searchName = self.searchName;
                                }
                                var data = JSON.stringify({
                                    action: "getAppList",
                                    token: util.getParams('token'),
                                    page: Number(paramsUrl.page),
                                    count: Number(paramsUrl.count)
                                })
                                self.loading = true;
                                self.noData = false;

                                return $http({
                                    method: 'POST',
                                    url: util.getApiUrl('app', '', 'server'),
                                    data: data
                                }).then(function successCallback(response) {
                                    var msg = response.data;
                                    if (msg.rescode == '200') {
                                        params.total(msg.data.appTotal);
                                        self.apps = msg.data.appList;
                                        return msg.data.appList;
                                    } else if (msg.rescode == '401') {
                                        alert('访问超时，请重新登录');
                                        $location.path("pages/login.html");
                                    } else {
                                        alert('读取数据出错，' + msg.errInfo);
                                    }
                                }, function errorCallback(response) {
                                    alert(response.status + ' 服务器出错');
                                }).finally(function () {
                                    self.loading = false;
                                });
                            }
                        }
                    );
                }

                /**
                 * 添加应用
                 */
                self.goAppInfo = function (appId) {
                    $scope.app.maskParams = {'appID': self.appID};
                    $scope.app.showHideMask(true, 'pages/appEdit.html');
                }
            }
        ])

        .controller('appEditController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'NgTableParams', 'util',
            function ($http, $scope, $state, $filter, $stateParams, NgTableParams, util) {
                var self = this;
                self.init = function () {
                    self.appID = $scope.app.maskParams.appID;
                }

                self.cancel = function () {
                    $scope.app.showHideMask(false);
                };
            }
        ])

})();