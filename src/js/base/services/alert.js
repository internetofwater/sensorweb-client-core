angular.module('n52.core.base')
    .factory('alertService', ['$translate', function($translate) {

        function error(message) {
            _createMessage($translate.instant('inform.error'), message);
        }

        function warn(message) {
            _createMessage($translate.instant('inform.warn'), message);
        }

        function _createMessage(level, message) {
            window.alert(level + "\n" + message);
        }
        return {
            error: error,
            warn: warn
        };
    }]);
