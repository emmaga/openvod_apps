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
                self.goAppInfo = function (app) {
                    $scope.app.maskParams = {'app': app};
                    $scope.app.showHideMask(true, 'pages/appEdit.html');
                }
            }
        ])

        .controller('appEditController', ['$http', '$scope', '$state', '$filter', '$stateParams', 'NgTableParams', 'util', 'CONFIG',
            function ($http, $scope, $state, $filter, $stateParams, NgTableParams, util, CONFIG) {
                var self = this;
                self.init = function () {
                    self.saving = false;
                    self.App = $scope.app.maskParams.app;
                    if ($scope.app.maskParams.app == undefined) {
                        self.isAdd = true;
                        self.title = '新增素材';
                        self.appFile = new file([]);
                        self.logo = new file([]);
                        self.App = {
                            Name: '',
                            ApkStar: '',
                            LogoURL: '',
                            URL: '',
                            Size: '',
                            Apk: 1,
                            Description: '',
                            ApkPackageName: '',
                            ApkStartActivity: '',
                            ApkStartParam: ''};
                    } else {
                        self.isAdd = false;
                        self.title = '编辑素材';
                        self.initApp(self.App);
                        self.initLogo([{ImageURL: self.App.LogoURL}]);
                    }
                    self.isReadonly = false;
                }

                self.cancel = function () {
                    $scope.app.showHideMask(false);
                };
                
                self.save = function () {
                    if (self.App.Name == '') {
                        alert("请输入用户名")
                        return false;
                    }
                    if (self.App.ApkStar == '') {
                        alert("请评分")
                        return false;
                    }
                    if (self.App.URL == '') {
                        alert("请上传应用")
                        return false;
                    }
                    if (self.logo.data[0].src == '') {
                        alert("请上传应用logo")
                        return false;
                    }
                    self.saving = true;
                    var appData = {
                        Name: self.App.Name.trim(),
                        ApkStar: self.App.ApkStar.toString(),
                        LogoURL: self.logo.data[0].src,
                        URL: self.App.URL,
                        Size: self.App.Size,
                        Apk: 1,
                        Description: self.App.Description,
                        ApkPackageName: self.App.ApkPackageName,
                        ApkStartActivity: self.App.ApkStartActivity,
                        ApkStartParam: self.App.ApkStartParam
                    }
                    var action = "addApp"
                    if (!self.isAdd) {
                        action = "editApp"
                        appData.ID = self.App.ID;
                    }
                    var data = JSON.stringify({
                        action: action,
                        token: util.getParams('token'),
                        data: appData
                    })

                    $http({
                        method: 'POST',
                        url: util.getApiUrl('app', '', 'server'),
                        data: data
                    }).then(function successCallback(response) {
                        var msg = response.data;
                        if (msg.rescode == '200') {
                            alert('保存成功');
                            $state.reload();
                        } else if (msg.rescode == '401') {
                            alert('访问超时，请重新登录');
                            $state.go('login');
                        } else {
                            alert('保存错误，' + msg.errInfo);
                        }
                    }, function errorCallback(response) {
                        alert(response.status + ' 服务器出错');
                    }).finally(function () {
                        self.saving = false;
                    });
                }

                /**
                 * 评分
                 * @param value
                 */
                self.hoveringOver = function(value) {
                    self.overStar = value;
                    self.score = value;
                };

                self.initApp = function (app) {
                    self.appFile = new file(app, true);
                    self.appFile.initFiles();
                }

                self.initLogo = function (logoList) {
                    // 初始化LOGO
                    self.logo = new file(logoList, true);
                    self.logo.initLogo();
                }

                self.clickUpload = function (e) {
                    setTimeout(function () {
                        document.getElementById(e).click();
                    }, 0);
                }

                function file(fileList, single) {
                    this.initFileList = fileList;
                    this.data = [];
                    this.maxId = 0;
                    this.single = single ? true : false;
                }

                file.prototype = {
                    initFiles: function () {
                        var l = this.initFileList;
                        for (var i = 0; i < l.length; i++) {
                            this.data[i] = {
                                "src": l[i].URL,
                                "fileSize": l[i].Size,
                                "id": this.maxId++,
                                "progress": 100
                            };
                        }
                    },
                    initLogo: function () {
                        var l = this.initFileList;
                        for (var i = 0; i < l.length; i++) {
                            this.data[i] = {
                                "src": l[i].ImageURL,
                                "fileSize": l[i].ImageSize,
                                "id": this.maxId++,
                                "progress": 100
                            };
                        }
                    },
                    deleteById: function (id) {
                        var l = this.data;
                        for (var i = 0; i < l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                if (l[i].progress < 100 && l[i].progress != -1) {
                                    l[i].xhr.abort();
                                }
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },

                    add: function (xhr, fileName, fileSize) {
                        this.data.push({
                            "xhr": xhr,
                            "fileName": fileName,
                            "fileSize": fileSize,
                            "progress": 0,
                            "id": this.maxId
                        });
                        return this.maxId++;
                    },

                    update: function (id, progress, leftSize, fileSize) {
                        for (var i = 0; i < this.data.length; i++) {
                            var f = this.data[i];
                            if (f.id === id) {
                                f.progress = progress;
                                f.leftSize = leftSize;
                                f.fileSize = fileSize;
                                break;
                            }
                        }
                    },

                    setSrcSizeByXhr: function (xhr, src, size, name) {
                        for (var i = 0; i < this.data.length; i++) {
                            if (this.data[i].xhr == xhr) {
                                this.data[i].src = src;
                                this.data[i].fileSize = size;
                                if (self.isApp) {
                                    self.App.URL = src;
                                    self.App.Size = size;
                                    self.App.Name = name;
                                }
                                break;
                            }
                        }
                    },

                    uploadFile: function (e, o, isApp) {
                        self.isApp = isApp;
                        // 如果这个对象只允许上传一个文件
                        if (this.single) {
                            // 删除第二个以后的文件
                            for (var i = 1; i < this.data.length; i++) {
                                this.deleteById(this.data[i].id);
                            }
                        }

                        var file = $scope[e];
                        var uploadUrl = CONFIG.uploadUrl;
                        var xhr = new XMLHttpRequest();
                        var fileId = this.add(xhr, file.name, file.size, xhr);
                        // self.search();

                        util.uploadFileToUrl(xhr, file, uploadUrl, 'normal',
                            function (evt) {
                                $scope.$apply(function () {
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        o.update(fileId, percentComplete, evt.total - evt.loaded, evt.total);
                                        // console.log(percentComplete);
                                    }
                                });
                            },
                            function (xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                // console && console.log(ret);
                                $scope.$apply(function () {
                                    o.setSrcSizeByXhr(xhr, ret.upload_path, ret.size, file.name);
                                    // 如果这个对象只允许上传一个文件
                                    if (o.single) {
                                        // 删除第一个文件
                                        o.deleteById(o.data[0].id);
                                    }
                                });
                            },
                            function (xhr) {
                                $scope.$apply(function () {
                                    o.update(fileId, -1, '', '');
                                });
                                console.log('failure');
                                xhr.abort();
                            }
                        );
                    }
                }
            }
        ])

})();