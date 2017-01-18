angular.module('n52.core.interface', [])
    .service('seriesApiInterface', ['$http', '$q', 'interfaceUtils', 'utils',
        function($http, $q, interfaceUtils, utils) {

            isNewApi = function(apiUrl) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl, interfaceUtils.createRequestConfigs()).then(response => {
                        if (response && response.data && !isNaN(response.data.length)) {
                            response.data.forEach(entry => {
                                if (entry.id === 'platforms') {
                                    resolve(true);
                                }
                            });
                        }
                        resolve(false);
                    });
                });
            };

            addAllPlatformTypes = function(params) {
                if (params && !params.platformTypes)
                    params.platformTypes = 'all';
                return params;
            };

            this.getPlatforms = function(id, apiUrl, params) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'platforms/' + interfaceUtils.createIdString(id), interfaceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getStationaryPlatforms = function(id, apiUrl, params) {
                params = interfaceUtils.extendParams(params, {
                    platformTypes: 'stationary'
                });
                return this.getPlatforms(id, apiUrl, params);
            };

            this.getServices = function(apiUrl, id, params) {
                params = interfaceUtils.extendParams(params, {
                    expanded: true
                });
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'services/' + interfaceUtils.createIdString(id), interfaceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getStations = function(id, apiUrl, params) {
                return $q((resolve, reject) => {
                    isNewApi(apiUrl).then(isNew => {
                        if (isNew) {
                            params = interfaceUtils.extendParams(params, {
                                expanded: true
                            });
                            this.getStationaryPlatforms(id, apiUrl, params)
                                .then(response => {
                                    if (isNaN(response.length)) {
                                        response.properties = {
                                            id: response.id,
                                            timeseries: response.datasets
                                        };
                                    } else {
                                        response.forEach(entry => {
                                            entry.properties = {
                                                id: entry.id,
                                                timeseries: entry.datasets
                                            };
                                        });
                                    }
                                    resolve(response);
                                });
                        } else {
                            $http.get(apiUrl + 'stations/' + interfaceUtils.createIdString(id), interfaceUtils.createRequestConfigs(params))
                                .then(response => {
                                    resolve(response.data);
                                }, error => {
                                    interfaceUtils.errorCallback(error, reject);
                                });
                        }
                    });
                });
            };

            this.getPhenomena = function(id, apiUrl, params) {
                addAllPlatformTypes(params);
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'phenomena/' + interfaceUtils.createIdString(id), interfaceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getCategories = function(id, apiUrl, params) {
                addAllPlatformTypes(params);
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'categories/' + interfaceUtils.createIdString(id), interfaceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getFeatures = function(id, apiUrl, params) {
                addAllPlatformTypes(params);
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'features/' + interfaceUtils.createIdString(id), interfaceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getProcedures = function(id, apiUrl, params) {
                addAllPlatformTypes(params);
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'procedures/' + interfaceUtils.createIdString(id), interfaceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getOfferings = function(id, apiUrl, params) {
                addAllPlatformTypes(params);
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'offerings/' + interfaceUtils.createIdString(id), interfaceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.search = function(apiUrl, arrayParams) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'search', interfaceUtils.createRequestConfigs({
                            q: arrayParams.join(',')
                        }))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getTimeseries = function(id, apiUrl, params) {
                if (!params) params = {};
                params.expanded = true;
                params.force_latest_values = true;
                params.status_intervals = true;
                params.rendering_hints = true;
                return $q((resolve, reject) => {
                    isNewApi(apiUrl).then(isNew => {
                        if (isNew) {
                            this.getDatasets(id, apiUrl, params)
                                .then(response => {
                                    if (isNaN(response.length)) {
                                        interfaceUtils.adjustTs(response, apiUrl);
                                    } else {
                                        response.forEach(entry => {
                                            interfaceUtils.adjustTs(entry, apiUrl);
                                        });
                                    }
                                    resolve(response);
                                });
                        } else {
                            $http.get(apiUrl + 'timeseries/' + interfaceUtils.createIdString(id), interfaceUtils.createRequestConfigs(params))
                                .then(response => {
                                    if (angular.isArray(response.data)) {
                                        var array = [];
                                        angular.forEach(response.data, ts => {
                                            array.push(interfaceUtils.pimpTs(ts, apiUrl));
                                        });
                                        resolve(array);
                                    } else {
                                        resolve(interfaceUtils.pimpTs(response.data, apiUrl));
                                    }
                                }, error => {
                                    interfaceUtils.errorCallback(error, reject);
                                });
                        }
                    });
                });
            };

            this.getExtras = function(tsId, apiUrl, params) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'timeseries/' + interfaceUtils.createIdString(tsId) + '/extras', interfaceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getTsData = function(id, apiUrl, timespan, extendedData, generalizeData) {
                var params = {
                    timespan: utils.createRequestTimespan(timespan.start, timespan.end),
                    generalize: generalizeData || false,
                    expanded: true,
                    format: 'flot'
                };
                if (extendedData) {
                    angular.extend(params, extendedData);
                }
                return $q((resolve, reject) => {
                    isNewApi(apiUrl).then(isNew => {
                        if (isNew) {
                            this.getDatasetData(id, apiUrl, timespan, params)
                                .then(response => {
                                    resolve(response);
                                });
                        } else {
                            $http.get(apiUrl + 'timeseries/' + interfaceUtils.createIdString(id) + "/getData", interfaceUtils.createRequestConfigs(params))
                                .then(response => {
                                    interfaceUtils.revampTimeseriesData(response.data, id);
                                    resolve(response.data);
                                }, error => {
                                    interfaceUtils.errorCallback(error, reject);
                                });
                        }
                    });
                });
            };

            this.getDatasets = function(id, apiUrl, params) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'datasets/' + interfaceUtils.createIdString(id), interfaceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getDatasetData = function(id, apiUrl, timespan, extendedParams) {
                var params = {
                    timespan: utils.createRequestTimespan(timespan.start, timespan.end)
                };
                if (extendedParams) {
                    angular.extend(params, extendedParams);
                }
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'datasets/' + interfaceUtils.createIdString(id) + '/data', interfaceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceUtils.errorCallback(error, reject);
                        });
                });
            };
        }
    ])
    .service('interfaceUtils', ['settingsService', 'utils', '$log',
        function(settingsService, utils, $log) {

            this.extendParams = function(params, extendParams) {
                if (!params) {
                    return extendParams;
                } else {
                    return angular.extend(params, extendParams);
                }
            };

            this.createRequestConfigs = function(params) {
                if (angular.isUndefined(params)) {
                    params = settingsService.additionalParameters;
                } else {
                    angular.extend(params, settingsService.additionalParameters);
                }
                return {
                    params: params,
                    cache: true
                };
            };

            this.errorCallback = function(error, reject) {
                if (error.data && error.data.userMessage)
                    $log.error(error.data.userMessage);
                reject(error);
            };

            this.createIdString = function(id) {
                return (id === null || angular.isUndefined(id) ? "" : id);
            };

            this.pimpTs = function(ts, url) {
                ts.apiUrl = url;
                ts.internalId = utils.createInternalId(ts.id, url);
                if (ts.uom === settingsService.undefinedUomString) {
                    delete ts.uom;
                }
                return ts;
            };

            this.adjustTs = function(ts, url) {
                ts.properties = {
                    id: ts.id
                };
                ts.parameters = ts.seriesParameters;
                ts = this.pimpTs(ts, url);
            };

            this.revampTimeseriesData = function(data, id) {
                if (data[id].values.length > 0 && data[id].values[0].timestamp) {
                    var temp = [];
                    angular.forEach(data[id].values, entry => {
                        temp.push([entry.timestamp, entry.value]);
                    });
                    data[id].values = temp;
                }
            };

        }
    ]);
