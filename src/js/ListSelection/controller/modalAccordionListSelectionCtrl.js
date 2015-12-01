angular.module('n52.core.listSelection')
        .controller('SwcModalListSelectionCtrl', ['$scope', '$controller', '$location',
            function ($scope, $controller, $location) {
                var ctrl = $controller('SwcListSelectionCtrl', {$scope: $scope});
                var oldAddToDiagram = $scope.addToDiagram;
                angular.extend(this, ctrl);
                $scope.addToDiagram = function(params) {
                    oldAddToDiagram(params);
                    $location.url('/diagram');
                    $scope.$parent.close();
                };
            }]);