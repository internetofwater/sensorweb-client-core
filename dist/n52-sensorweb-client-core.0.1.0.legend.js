angular.module('n52.core.exportTs', ['n52.core.timeseries', 'n52.core.time'])
        .factory('exportTsService', ['timeService', '$window', '$translate', 'timeseriesService',
            function (timeService, $window, $translate, timeseriesService) {

                function createCsvDownloadLink(tsId) {
                    var timespan = timeService.getCurrentTimespan();
                    var kvp = "?generalize=" + false; // TODO generalize???
                    kvp = kvp + "&timespan=" + encodeURIComponent(timespan);
                    kvp = kvp + "&locale=" + $translate.preferredLanguage();
                    kvp = kvp + "&zip=true";
                    kvp = kvp + "&bom=true";
                    var apiUrl = timeseriesService.getTimeseries(tsId).apiUrl;
                    return apiUrl + "/timeseries/" + tsId + "/getData.zip" + kvp;
                }

                function openInNewWindow(link) {
                    $window.open(link);
                }

                return {
                    openInNewWindow: openInNewWindow,
                    createCsvDownloadLink: createCsvDownloadLink
                };
            }]);

angular.module('n52.core.legend', ['n52.core.timeseries', 'n52.core.exportTs', 'n52.core.style'])
        .directive('swcLegend', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/legend/legend.html',
                controller: ['$scope', 'timeseriesService',
                    function ($scope, timeseriesService) {
                        $scope.timeseriesList = timeseriesService.timeseries;
                    }]
            };
        })
        .directive('swcLegendEntry', ['exportTsService', 'mapService', '$location', 'styleModalOpener',
            function (exportTsService, mapService, $location, styleModalOpener) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/legend/legend-entry.html',
                    scope: {
                        timeseries: "="
                    },
                    controller: ['$scope', 'timeseriesService', 'timeService', 'styleService',
                        function ($scope, timeseriesService, timeService, styleService) {
                            $scope.infoVisible = false;
                            $scope.toggleSelection = function (ts) {
                                styleService.toggleSelection(ts);
                            };
                            $scope.removeTs = function (ts) {
                                timeseriesService.removeTimeseries(ts.internalId);
                            };
                            $scope.toggleDiagram = function (ts) {
                                styleService.toggleTimeseriesVisibility(ts);
                            };
                            $scope.openStyling = function (ts) {
                                styleModalOpener(ts);
                            };
                            $scope.showInformation = function () {
                                $scope.infoVisible = !$scope.infoVisible;
                            };
                            $scope.showInMap = function (ts) {
                                mapService.showStation(ts);
                                $location.url('/map');
                            };
                            $scope.jumpToLastTimeStamp = function (lastValue) {
                                if (lastValue && lastValue.timestamp) {
                                    timeService.jumpToLastTimeStamp(lastValue.timestamp, true);
                                }
                            };
                            $scope.jumpToFirstTimeStamp = function (firstValue) {
                                if (firstValue && firstValue.timestamp) {
                                    timeService.jumpToLastTimeStamp(firstValue.timestamp, true);
                                }
                            };
                            $scope.selectRefValue = function (refValue, ts) {
                                timeseriesService.toggleReferenceValue(refValue, ts.internalId);
                            };
                            $scope.createExportCsv = function (id) {
                                exportTsService.openInNewWindow(exportTsService.createCsvDownloadLink(id));
                            };
                            // why apply manualy when selecting the y-axis in the chart?
                            $scope.$on('allTimeseriesChanged', function (evt) {
                                $scope.$apply();
                            });
                        }]
                };
            }])
        .controller('legendButtonController', ['$scope', 'statusService',
            function ($scope, statusService) {
                $scope.status = statusService.status;
                $scope.toggleLegend = function () {
                    statusService.status.showLegend = !statusService.status.showLegend;
                };
            }]);