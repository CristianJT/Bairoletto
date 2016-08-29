﻿(function () {
    'use strict';

    angular
        .module('app.fabrica')
        .controller('ReposicionController', ReposicionController);

    function ReposicionController($q, reposicionService) {
        var vm = this;

        vm.panel_nuevas = {
            loading: false,
            open: false,
            data: [],
            total: 0,
        };
        vm.panel_aprobadas = {
            loading: false,
            open: false,
            data: [],
            total: 0,
        };
        vm.panel_en_transito = {
            loading: false,
            open: false,
            data: [],
            total: 0,
        };
        vm.panel_finalizadas = {
            loading: false,
            open: false,
            data: [],
            total: 0,
        };

        vm.abrirPanel = abrirPanel;
        vm.reposicionDetalle = reposicionDetalle;

        activate();

        function activate() {
            promNuevas();
            promAprobadas();
            promEnTransito();
            promFinalizadas();
        }

        function promNuevas() {
            vm.panel_nuevas.loading = true;
            vm.prom_panel_nuevas = reposicionService.nuevas().then(function (data) {
                vm.panel_nuevas.total = data.length;
                vm.panel_nuevas.data = armarArrayPuntosVenta(data);
                vm.panel_nuevas.loading = false;           
            }, function () {
                vm.panel_nuevas.loading = false;
            })
        }
        function promAprobadas() {
            vm.panel_aprobadas.loading = true;
            vm.prom_panel_aprobadas = reposicionService.aprobadas().then(function (data) {
                vm.panel_aprobadas.total = data.length;
                vm.panel_aprobadas.data = armarArrayPuntosVenta(data);
                vm.panel_aprobadas.loading = false;
            }, function () {
                vm.panel_aprobadas.loading = false;
            })
        }
        function promEnTransito() {
            vm.panel_en_transito.loading = true;
            vm.prom_panel_en_transito = reposicionService.entransito().then(function (data) {
                vm.panel_en_transito.data = data;
                vm.panel_en_transito.total = data.length;
                vm.panel_en_transito.loading = false;
            }, function () {
                vm.panel_en_transito.loading = false;
            })
        }
        function promFinalizadas() {
            vm.panel_finalizadas.loading = true;
            vm.prom_panel_finalizadas = $q.all([
                reposicionService.entregadas(),
                reposicionService.canceladas()
            ]).then(function (data) {
                vm.panel_finalizadas.data = data[0].concat(data[1]);
                vm.panel_finalizadas.total = vm.panel_finalizadas.data.length;
                vm.panel_finalizadas.loading = false;
            }, function () {
                vm.panel_finalizadas.loading = false;
            })
        }

        function armarArrayPuntosVenta(data) {
            var puntos_venta = [];
            var aux = _.groupBy(data, function (x) {
                return x.punto_venta.id;
            })
            _.forIn(aux, function (value, key) {
                var pv = value[0].punto_venta;
                pv.reposiciones = value;
                puntos_venta.push(pv);
            })
            return puntos_venta;
        }

        function abrirPanel(panel) {
            switch (panel) {
                case 'nuevas':
                    vm.panel_nuevas.open = !vm.panel_nuevas.open;
                    vm.panel_aprobadas.open = false;
                    break;
                case 'aprobadas':
                    vm.panel_aprobadas.open = !vm.panel_aprobadas.open
                    vm.panel_nuevas.open = false;
                    break;
                case 'en_transito':
                    vm.panel_en_transito.open = !vm.panel_en_transito.open;
                    vm.panel_finalizadas.open = false;
                    break;
                case 'finalizadas':
                    vm.panel_finalizadas.open = !vm.panel_finalizadas.open;
                    vm.panel_en_transito.open = false;
                    break;
            }
        }

        function reposicionDetalle(r) {
            if (!r.all_data && !r.loading) {
                r.loading = true;
                reposicionService.getById(r.id).then(function (data) {
                    r.loading = false;
                    r.productos = data.productos;
                    r.all_data = true;
                }, function () {
                    r.loading = false;
                })
            }
        }
    }
})();
