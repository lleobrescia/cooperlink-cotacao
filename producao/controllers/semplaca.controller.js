(function () {
  'use strict';

  angular
    .module('app')
    .controller('SemPlacaController', SemPlacaController);

  SemPlacaController.$inject = ['$http', '$state', 'toaster', '$filter', '$rootScope', 'fipeService', 'api'];

  function SemPlacaController($http, $state, toaster, $filter, $rootScope, fipeService, api) {
    var vm = this;

    $rootScope.usuario = {
      'data': '',
      'especial': false,
      'modelo': '',
      'preco': '',
      'veiculo': ''
    };

    vm.anoEscolhido = '';
    vm.carregando = true;
    vm.fipePasso = 'passo1';
    vm.franquia = undefined;
    vm.hasRastreador = false;
    vm.isTaxi = false;
    vm.isUber = false;
    vm.listaAnos = [];
    vm.listaCarros = [];
    vm.listaModelos = [];
    vm.listaMotos = [];
    vm.marcaEscolhida = '';
    vm.modeloEscolhido = '';
    vm.veiculo = '';

    vm.GetAnos = GetAnos;
    vm.GetModelos = GetModelos;
    vm.GetPreco = GetPreco;

    Activate();

    ////////////////

    function Activate() {
      fipeService.GetMotos().then(function (resp) {
        vm.listaMotos = resp;
      });
      fipeService.GetCarros().then(function (resp) {
        vm.listaCarros = resp;
        vm.carregando = false;
      });
    }

    function GetAnos() {
      vm.carregando = true;
      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos/' + vm.modeloEscolhido + '/anos').then(function (resp) {
        vm.fipePasso = 'passo4';
        vm.listaAnos = resp;
        vm.carregando = false;
      });
    }

    function GetPreco() {
      vm.carregando = true;
      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos/' + vm.modeloEscolhido + '/anos/' + vm.anoEscolhido).then(function (resp) {
        var yearsApart = new Date(new Date() - new Date(resp.AnoModelo + '-01-01')).getFullYear() - 1970;
        $rootScope.usuario.preco = resp.Valor;

        if (yearsApart > 20) {
          toaster.pop({
            type: 'error',
            title: 'Atenção!',
            body: 'Não fazemos cotações em veículos com mais de 20 anos.',
            timeout: 50000
          });
          vm.carregando = false;
          return;
        }

        vm.carregando = false;

        if (vm.isUber || vm.isTaxi) {
          $rootScope.usuario.especial = true;
        }

        console.log(resp);
        $state.go('cotacao');
      });
    }

    function GetModelos() {
      vm.carregando = true;
      //Pega o veiculo escolhido(moto ou carro) e o modelo escolhido (atraves da lista de um dos dois) e envia a requisicao 
      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos').then(function (resp) {
        vm.listaModelos = resp.modelos;
        vm.fipePasso = 'passo3';
        vm.carregando = false;

        if (vm.veiculo == 'carros') {
          $rootScope.usuario.veiculo = 'AUTOMOVEL';
        } else {
          $rootScope.usuario.veiculo = 'MOTOCICLETA';
        }
      });
    }
  }
})();