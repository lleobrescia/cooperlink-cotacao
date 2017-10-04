(function () {
  'use strict';

  angular
    .module('app')
    .controller('DadosPessoaisController', DadosPessoaisController);

  DadosPessoaisController.$inject = ['$http', '$rootScope', '$state', 'api', 'consultCEP', 'toaster'];

  /**
   * @ngdoc controller
   * @scope {}
   * @name CotacaoController
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Armazena os dados pessoais do cliente
   *
   * @property {object} vm            - A named variable for the `this` keyword representing the ViewModel
   * @property {string} vm.carregando - Controla o loading
   * @property {string} vm.passo      - Dados do veiculo da cotacao
   * @property {string} vm.usuario    - Dados do usuario
   *
   * @param {service}  $http      - Usado para comunicação HTTP {@link https://docs.angularjs.org/api/ng/service/$http}
   * @param {service}  $rootScope - Escopo principal do angular {@link https://docs.angularjs.org/api/ng/service/$rootScope}
   * @param {service}  $state     - Status da transição {@link https://github.com/angular-ui/ui-router/wiki/Quick-Reference#state-1}
   * @param {constant} api        - Url do api
   * @param {service}  consultCEP - Servico para consultar cep
   * @param {toaster}  toaster    - Serviço de mensagem popup

   *
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/controller} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#controllers} Para melhores praticas
   */
  function DadosPessoaisController($http, $rootScope, $state, api, consultCEP, toaster) {
    var vm = this;

    vm.carregando = false;
    vm.passo      = 'nome';
    vm.usuario = {
      'bairro':         '',
      'cep':            '',
      'cidade':         '',
      'complemento':    '',
      'cotacao':        '',
      'cpf':            '',
      'email':          '',
      'estado':         '',
      'logradouro':     '',
      'nome':           '',
      'numero':         '',
      'planoEscolhido': '',
      'telefone':       ''
    };

    /**
     * Atribuição das funções no escopo
     */
    vm.GetCep      = GetCep;
    vm.SalvarDados = SalvarDados;

    Activate();

    ////////////////

    function Activate() {
      if (!$rootScope.usuario) {
        $state.go('placa');
      }else{
        vm.usuario.cotacao        = $rootScope.usuario.idCotacao;
        vm.usuario.planoEscolhido = $rootScope.usuario.idPlano;
      }
    }

    function GetCep() {
      consultCEP.consultar(vm.usuario.cep).then(function (resp) {
        console.log('CEP =>', resp);
        vm.usuario.bairro     = resp.bairro;
        vm.usuario.cidade     = resp.cidade;
        vm.usuario.estado     = resp.estado;
        vm.usuario.logradouro = resp.logradouro;
      }).catch(function (error) {
        console.warn('Erro no cep = >', error);
      });
    }

    function SalvarDados() {
      $http.post(api + 'cliente', vm.usuario).then(function (resp) {
        $rootScope.usuario.idUsuario = resp.data;
        console.info('Dados salvos ',$rootScope.usuario);
        $state.go('contrato');

      }).catch(function (error) {
        toaster.pop({
          type   : 'error',
          title  : 'Erro #701',
          body   : 'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Erro ao salvar dados do usuario = >' + error);
        $state.go('placa');
      });
    }
  }
})();