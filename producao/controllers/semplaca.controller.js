(function () {
  'use strict';

  angular
    .module('app')
    .controller('SemPlacaController', SemPlacaController);

  SemPlacaController.$inject = ['$http', '$rootScope', '$state', 'CheckConditionService', 'api', 'fipeService', 'toaster'];

  /**
   * @ngdoc controller
   * @scope {}
   * @name SemPlacaController
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Force opções de veiculos para o usuario escolher a que se adequa a ele e retornar o valor na tabela Fipe
   * 
   * @property {object}   vm                  - A named variable for the `this` keyword representing the ViewModel
   * @property {json}     $rootScope.usuario  - Dados do veiculo do usuario
   * @property {string}   vm.anoEscolhido     - Ano do veiculo
   * @property {boolean}  vm.carregando       - Usado para controlar o loading
   * @property {string}   vm.fipePasso        - Usado para controlar as telas que aparecem
   * @property {boolean}  vm.isTaxi           - Usado para saber se o carro eh um taxi
   * @property {string}   vm.isUber           - Usado para saber se o carro eh uber
   * @property {json}     vm.listaAnos        - Lista dos anos do modelo escolhido
   * @property {json}     vm.listaCarros      - Lista de carros para escolher
   * @property {json}     vm.listaModelos     - Lista de modelos de veiculos
   * @property {json}     vm.listaMotos       - Lista de motos
   * @property {string}   vm.marcaEscolhida   - Fabricante do veiculo escolhido
   * @property {string}   vm.modeloEscolhido  - Modelo do fabricante escolhido
   * @property {string}   vm.veiculo          - Veiculo escolhido
   * @property {json}     vm.rejeitados       - Lista de carros rejeitados
   * 
   * @param {service}  $http                   - Usado para comunicação HTTP {@link https://docs.angularjs.org/api/ng/service/$http}
   * @param {service}  $rootScope              - Escopo principal do angular {@link https://docs.angularjs.org/api/ng/service/$rootScope}
   * @param {service}  $state                  - Status da transição {@link https://github.com/angular-ui/ui-router/wiki/Quick-Reference#state-1}
   * @param {service}  CheckConditionService   - Servico para velidação do veículo (Veja fipeService.service.js)
   * @param {constant} api                     - url do api
   * @param {service}  fipeService             - Serviço para consulta na tabela fipe
   * @param {service}  toaster                 - Seviço para mostrar mensagens
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/controller} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#controllers} Para melhores praticas
   */
  function SemPlacaController($http, $rootScope, $state, CheckConditionService, api, fipeService, toaster) {
    var vm = this;

    $rootScope.usuario = {
      'data':     '',
      'especial': false,
      'modelo':   '',
      'preco':    '',
      'veiculo':  ''
    };

    vm.anoEscolhido    = '';
    vm.carregando      = true;
    vm.fipePasso       = 'passo1';
    vm.isTaxi          = false;
    vm.isUber          = false;
    vm.listaAnos       = [];
    vm.listaCarros     = [];
    vm.listaModelos    = [];
    vm.listaMotos      = [];
    vm.marcaEscolhida  = '';
    vm.modeloEscolhido = '';
    vm.veiculo         = '';
    vm.rejeitados      = [];

    /**
     * Atribuição das funções no escopo
     */
    vm.GetAnos    = GetAnos;
    vm.GetModelos = GetModelos;
    vm.GetPreco   = GetPreco;

    Activate();

    ////////////////

    /**
     * @function Activate
     * @desc Setup docontrolador. Exetuca assim que o controlador inicia
     * @memberof SemPlacaController
     */
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

    /**
     * @function GetAnos
     * @desc Busca os anos do modelo escolhido. Sai do passo3 e vai para o passo4
     * @memberof SemPlacaController
     */
    function GetAnos() {
      vm.carregando = true;

      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos/' + vm.modeloEscolhido + '/anos').then(function (resp) {
        vm.listaAnos  = resp;
        vm.carregando = false;
        vm.fipePasso  = 'passo4';
      });

    }

    /**
     * @function GetModelos
     * @desc Busca os modelos baseado no veiculo e fabricante escolhidos. Sai do passo2 e vai para o passo3
     * @memberof SemPlacaController
     */
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

        vm.fipePasso  = 'passo3';
        vm.carregando = false;
      });
    }

    /**
     * @function GetPreco
     * @desc Ultimo passo antes de mostrar a cotação. Busca o valor na tabela fipe, verifica se o modelo é aceitavel
     * @memberof SemPlacaController
     */
    function GetPreco() {
      vm.carregando   = true;
      var isValido    = true;
      var testeAno    = '';
      var testeModelo = '';

      fipeService.Consultar(vm.veiculo + '/marcas/' + vm.marcaEscolhida + '/modelos/' + vm.modeloEscolhido + '/anos/' + vm.anoEscolhido).then(function (resp) {
        $rootScope.usuario.preco = resp.Valor;
        $rootScope.usuario.modelo = resp.Modelo;

        CheckConditionService.Activate(resp.Modelo, resp.Marca, resp.AnoModelo, vm.rejeitados);

        if ($rootScope.usuario.veiculo == 'AUTOMÓVEL') {
          testeAno    = CheckConditionService.CarHasValidYear(); //Valida o ano
          testeModelo = CheckConditionService.CarHasValidModel(); //Valida o modelo

          if (!testeAno) {
            isValido = false;
          }

          if (!testeModelo) {
            isValido = false;
          }
        } else if ($rootScope.usuario.veiculo == 'MOTOCICLETA') {
          testeAno    = CheckConditionService.MotoHasValidYear();
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
            type:    'error',
            title:   'Atenção!',
            body:    'Não é possível fazer cotação para esse veículo.',
            timeout: 50000
          });
        }
      });
    }

    /**
     * @function GetRejeitados
     * @desc Busca no banco de dados os veiculos rejeitados
     * @memberof SemPlacaController
     */
    function GetRejeitados() {
      $http.get(api + 'rejeitado').then(function (resp) {
        vm.rejeitados = php_crud_api_transform(resp.data).rejeitado;
      });
    }

  }
})();