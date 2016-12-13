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
            function($http, $scope, $state, $stateParams, util, CONFIG) {
                var self = this;
                self.init = function() {

                    // 上传页面加载页面url
                    self.uploadListUrl = '';

                    // 不显示上传页面
                    self.showUploadList = false;

                    // 显示上传页面
                    self.gotoPage('uploadList');

                    // 弹窗层
                    self.maskUrl = '';
                    self.maskParams = {};

                    // 初始化上传列表对象
                    self.uploadList = new UploadLists();


                }

                self.gotoPage = function(pageName) {
                    // 上传列表页
                    if(pageName == 'uploadList') {
                        // 上传页面不是第一次加载
                        if(self.uploadListUrl !== '') {

                        }
                        // 第一次加载上传页面
                        else {
                            self.uploadListUrl = 'pages/uploadList.html';
                        }
                        self.showUploadList = true;
                    }

                    //其他页
                    else {
                        self.showUploadList = false;
                        $state.go(pageName);
                    }


                }

                self.logout = function(event) {
                    util.setParams('token', '');
                    $state.go('login');
                }

                self.upload = function() {
                    self.maskUrl = "pages/addMovie.html";
                }

                function UploadLists() {
                    this.data = [
                        /*{
                         "id":0,
                         "video":{
                         "name": "星际迷航", "size": 1111, "percentComplete": 40, "xhr":"xhr", "src":"xx"
                         },
                         "subtitle":{
                         "name": "星际迷航－字幕", "size": 1111, "percentComplete": 40, "xhr":"xhr", "src":"xx"
                         }
                         }*/
                    ];
                    this.maxId = 0;
                }

                UploadLists.prototype = {
                    add: function(video, subtitle) {
                        this.data.push({"video": video, "subtitle": subtitle, "id": this.maxId});
                        return this.maxId++;
                    },
                    setPercentById: function(type, id, percentComplete) {
                        for(var i =0; i < this.data.length; i++) {
                            if(this.data[i].id == id) {
                                this.data[i][type].percentComplete = percentComplete;
                                break;
                            }
                        }
                    },
                    setSrcSizeById: function(type, id, src, size) {
                        for(var i =0; i < this.data.length; i++) {
                            if(this.data[i].id == id) {
                                this.data[i][type].src = src;
                                this.data[i][type].size = size;
                                break;
                            }
                        }
                    },
                    deleteById: function(id) {
                        var l = this.data;
                        for(var i = 0; i <l.length; i++) {
                            if (l[i].id == id) {
                                // 如果正在上传，取消上传
                                // 视频
                                if(l[i].video.percentComplete < 100 && l[i].video.percentComplete != '失败') {
                                    l[i].video.xhr.abort();
                                }
                                // 字幕
                                if(l[i].subtitle.percentComplete != undefined && l[i].subtitle.percentComplete < 100 && l[i].subtitle.percentComplete != '失败') {
                                    l[i].subtitle.xhr.abort();
                                }
                                // 删除data
                                l.splice(i, 1);
                                break;
                            }
                        }
                    },
                    judgeCompleted: function(id, o){
                        var l = this.data;
                        for(var i = 0; i <l.length; i++) {
                            if (l[i].id == id) {
                                // 如果视频和字幕都上传完毕
                                if((l[i].video.percentComplete >= 100 && l[i].subtitle.percentComplete == undefined) ||
                                    (l[i].video.percentComplete >= 100 && l[i].subtitle.percentComplete >= 100)) {
                                    o.transcode(id, o);
                                }
                                break;
                            }
                        }
                    },
                    transcode: function(id, o) {
                        var o = o;
                        var id = id;
                        var l = this.data;
                        var source = {};
                        for(var i = 0; i <l.length; i++) {
                            if (l[i].id == id) {
                                source = l[i];
                                break;
                            }
                        }
                        // 转码
                        var data = JSON.stringify({
                            "action": "submitTranscodeTask",
                            "token": util.getParams('token'),
                            "rescode": "200",
                            "data": {
                                "movie": {
                                    "oriFileName": source.video.name,
                                    "filePath": source.video.src
                                },
                                "subtitle": {
                                    "oriFileName": source.subtitle.name,
                                    "filePath": source.subtitle.src
                                }
                            }
                        })
                        console&&console.log(data);
                        $http({
                            method: 'POST',
                            url: util.getApiUrl('tanscodetask', '', 'server'),
                            data: data
                        }).then(function successCallback(response) {
                            var msg = response.data;
                            if (msg.rescode == '200') {
                                console&&console.log('转码 ' + id);
                                // 从列表中删除
                                o.deleteById(id);
                            }
                            else if(msg.rescode == '401') {
                                alert('访问超时，请重新登录');
                                $state.go('login');
                            }
                            else {
                                // 转码申请失败后再次调用
                                console&&console.log('转码申请失败后再次调用');
                                setTimeout(function() {
                                    o.transcode(id, o);
                                },5000);

                            }
                        }, function errorCallback(response) {
                            // 转码申请失败后再次调用
                            console&&console.log('转码申请失败后再次调用');
                            console&&console.log(response);
                            setTimeout(function() {
                                o.transcode(id, o);
                            },5000);
                        });
                    },
                    uploadFile: function(videoFile, subtitleFile, o) {
                        // 上传后台地址
                        var uploadUrl = CONFIG.uploadVideoUrl;

                        // 电影对象
                        var videoXhr = new XMLHttpRequest();
                        var video = {"name": videoFile.name, "size":videoFile.size, "percentComplete": 0, "xhr": videoXhr};

                        // 字幕对象
                        var subtitle = {};
                        if(subtitleFile) {
                            var subtitleXhr = new XMLHttpRequest();
                            subtitle = {"name": subtitleFile.name, "size":subtitleFile.size, "percentComplete": 0, "xhr": subtitleXhr};
                        }

                        // 添加data，并获取id
                        var id = this.add(video, subtitle);

                        // 上传视频
                        util.uploadFileToUrl(videoXhr, videoFile, uploadUrl, 'normal',
                            // 上传中
                            function(evt) {
                                $scope.$apply(function(){
                                    if (evt.lengthComputable) {
                                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                        // 更新上传进度
                                        o.setPercentById('video', id, percentComplete);
                                    }
                                });
                            },
                            // 上传成功
                            function(xhr) {
                                var ret = JSON.parse(xhr.responseText);
                                console && console.log(ret);
                                $scope.$apply(function(){
                                    o.setSrcSizeById('video', id, ret.filePath, ret.size);
                                    o.judgeCompleted(id, o);
                                });
                            },
                            // 上传失败
                            function(xhr) {
                                $scope.$apply(function(){
                                    o.setPercentById('video', id, '失败');
                                });
                                xhr.abort();
                            }
                        );

                        // 上传字幕
                        if(subtitle.percentComplete != undefined) {
                            util.uploadFileToUrl(subtitle.xhr, subtitleFile, uploadUrl, 'normal',
                                // 上传中
                                function(evt) {
                                    $scope.$apply(function(){
                                        if (evt.lengthComputable) {
                                            var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                            // 更新上传进度
                                            o.setPercentById('subtitle', id, percentComplete);
                                        }
                                    });
                                },
                                // 上传成功
                                function(xhr) {
                                    var ret = JSON.parse(xhr.responseText);
                                    console && console.log(ret);
                                    $scope.$apply(function(){
                                        o.setSrcSizeById('subtitle', id, ret.filePath, ret.size);
                                        o.judgeCompleted(id, o);
                                    });
                                },
                                // 上传失败
                                function(xhr) {
                                    $scope.$apply(function(){
                                        o.setPercentById('subtitle', id, '失败');
                                    });
                                    xhr.abort();
                                }
                            );
                        }
                    }
                }

            }
        ])
})();