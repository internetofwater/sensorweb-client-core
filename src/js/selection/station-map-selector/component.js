require('../selection');

angular.module('n52.core.selection')
    .component('swcStationMapSelector', {
        bindings: {
            mapId: '@',
            serviceUrl: '<',
            filter: '<',
            mapLayers: '<',
            cluster: '<',
            stationSelected: "&onStationSelected",
        },
        templateUrl: 'n52.core.selection.platform-map-selector',
        controller: ['seriesApiInterface', '$scope', 'leafletData',
            function(seriesApiInterface, $scope, leafletData) {

                var myIcon = L.icon({
                    iconUrl: require('leaflet/dist/images/marker-icon.png'),
                    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
                    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                this.markers = {};
                var layer;

                this.$onInit = () => {
                    setTimeout(() => {
                        leafletData.getMap(this.mapId).then((map) => {
                            map.invalidateSize();
                        });
                    }, 10);
                };

                this.$onChanges = () => {
                    this.noResultsFound = false;
                    this.loading = true;
                    leafletData.getMap(this.mapId).then((map) => {
                        // clear layer
                        if (layer) map.removeLayer(layer);
                        // add marker to layer
                        seriesApiInterface.getStations(null, this.serviceUrl, this.filter)
                            .then((res) => {
                                layer = L.markerClusterGroup({
                                    animate: false
                                });
                                if (res instanceof Array && res.length > 0) {
                                    res.forEach(entry => {
                                        var marker = L.marker([entry.geometry.coordinates[1], entry.geometry.coordinates[0]], {
                                            icon: myIcon
                                        });
                                        marker.on('click', () => {
                                            this.stationSelected({
                                                station: entry
                                            });
                                        });
                                        layer.addLayer(marker);
                                    });
                                    layer.addTo(map);
                                    map.fitBounds(layer.getBounds());
                                } else {
                                    this.noResultsFound = true;
                                }
                                map.invalidateSize();
                                this.loading = false;
                            });
                    });
                };
            }
        ]
    });
