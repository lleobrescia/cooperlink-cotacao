(function () {
  'use strict';
  //TODO:Checar se eh especial
  angular
    .module('app')
    .controller('SemPlacaController', SemPlacaController);

  SemPlacaController.$inject = ['$http', '$state', 'toaster', '$rootScope', 'fipeService', 'api', 'CheckConditionService'];

  function SemPlacaController($http, $state, toaster, $rootScope, fipeService, api, CheckConditionService) {
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
    vm.isTaxi = false;
    vm.isUber = false;
    vm.listaAnos = [];
    vm.listaCarros = [];
    vm.listaModelos = [];
    vm.listaMotos = [];
    vm.marcaEscolhida = '';
    vm.modeloEscolhido = '';
    vm.veiculo = '';
    vm.rejeitados = [];

    vm.GetAnos = GetAnos;
    vm.GetModelos = GetModelos;
    vm.GetPreco = GetPreco;

    Activate();

    ////////////////

    function Activate() {
      GetRejeitados();

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

    function GetModelos() {
      vm.carregando = true;
      //Pega o veiculo escolhido(moto ou carro) e o modelo escolhido (atraves da lista de um dos dois) e envia a requisicao 
      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos').then(function (resp) {
        vm.listaModelos = resp.modelos;

        if (vm.veiculo == 'carros') {
          $rootScope.usuario.veiculo = 'AUTOMÓVEL';
        } else {
          $rootScope.usuario.veiculo = 'MOTOCICLETA';
        }

        vm.fipePasso = 'passo3';
        vm.carregando = false;
      });
    }

    function GetPreco() {
      vm.carregando = true;
      var isValido = true;
      var testeAno = '';
      var testeModelo = '';

      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos/' + vm.modeloEscolhido + '/anos/' + vm.anoEscolhido).then(function (resp) {
        $rootScope.usuario.preco = resp.Valor;
        $rootScope.usuario.modelo = resp.Modelo;

        CheckConditionService.Activate(resp.Modelo, resp.Marca, resp.AnoModelo, vm.rejeitados);

        if ($rootScope.usuario.veiculo == 'AUTOMÓVEL') {
          testeAno = CheckConditionService.CarHasValidYear(); //Valida o ano
          testeModelo = CheckConditionService.CarHasValidModel(); //Valida o modelo

          if (!testeAno) {
            isValido = false;
          }

          if (!testeModelo) {
            isValido = false;
          }
        } else if ($rootScope.usuario.veiculo == 'MOTOCICLETA') {
          testeAno = CheckConditionService.MotoHasValidYear();
          testeModelo = CheckConditionService.MotoHasValidYear();

          if (!testeAno) {
            isValido = false;
          }
          if (!testeModelo) {
            isValido = false;
          }
        }

        if (vm.isUber || vm.isTaxi) {
          $rootScope.usuario.especial = true;
        } else {
          $http.get(api + 'importado?filter=nome,eq,' + resp.Marca).then(function (resp) {
            var retorno = php_crud_api_transform(resp.data).importado;

            if (retorno.length > 0) {
              $rootScope.usuario.especial = true;
            }
          });
        }

        vm.carregando = false;

        if (isValido) {
          $state.go('cotacao');
          
        } else {
          toaster.pop({
            type: 'error',
            title: 'Atenção!',
            body: 'Não é possível fazer cotação para esse veículo.',
            timeout: 50000
          });
        }
      });
    }

    function GetRejeitados() {
      $http.get(api + 'rejeitado').then(function (resp) {
        vm.rejeitados = php_crud_api_transform(resp.data).rejeitado;
      });
    }

  }
})();