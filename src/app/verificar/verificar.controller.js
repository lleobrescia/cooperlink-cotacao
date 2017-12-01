(function () {
  'use strict';

  angular
    .module('app')
    .controller('VerificarController', VerificarController);

  VerificarController.$inject = ['$http', '$rootScope', '$state', 'api', 'toaster', 'CheckConditionService'];

  function VerificarController($http, $rootScope, $state, api, toaster, CheckConditionService) {
    var vm = this;

    var ano;
    var marca;
    var modelo;
    var rejeitados;


    Activate();

    ////////////////

    function Activate() {
      if (!$rootScope.usuario) {
        $state.go('placa');
      } else {
        ano = $rootScope.usuario.ano;
        marca = $rootScope.usuario.fabricante;
        modelo = $rootScope.usuario.modelo;

        GetRejeitados();
      }
    }

    function CheckVeiculo() {
      CheckConditionService.Activate(modelo, marca, ano, rejeitados);
      var testeAno;
      var testeModelo;

      if ($rootScope.usuario.veiculo === 'AUTOMOVEL') {
        testeAno = CheckConditionService.CarHasValidYear(); //Valida o ano
        testeModelo = CheckConditionService.CarHasValidModel(); //Valida o modelo

      } else if ($rootScope.usuario.veiculo === 'MOTOCICLETA') {
        testeAno = CheckConditionService.MotoHasValidYear();
        testeModelo = CheckConditionService.MotoHasValidYear();
      }

      console.log('Teste Ano =>', testeAno);
      console.log('Teste Modelo =>', testeModelo);

      if (!testeAno || !testeModelo) {
        console.warn('Veiculo Invalido');
        vm.carregando = false;
        toaster.pop({
          type: 'error',
          title: 'Atenção!',
          body: 'Não é possível fazer cotação para esse veículo.',
          timeout: 50000
        });
        $state.go('placa');
      } else {
        GetIdRegiao();
      }
    }

    function GetIdRegiao() {
      $http.get(api + 'cp_regiao?filter=nome,eq,' + $rootScope.usuario.estado).then(function (resp) {
        var resposta = php_crud_api_transform(resp.data).cp_regiao;

        console.log('Regiao ', resposta);

        if (resposta.length > 0) {
          console.log('Região Cadastrada');
          $rootScope.usuario.idRegiao = resposta[0].id;
        } else {
          $rootScope.usuario.idRegiao = 1;
        }

        $state.go('cotacao');

      });
    }

    function GetRejeitados() {
      $http.get(api + 'cp_rejeitado').then(function (resp) {
        rejeitados = php_crud_api_transform(resp.data).cp_rejeitado;
        CheckVeiculo();
      });
    }
  }
})();