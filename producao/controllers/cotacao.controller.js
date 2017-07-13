(function () {
  'use strict';

  angular
    .module('app')
    .controller('CotacaoController', CotacaoController);

  CotacaoController.$inject = ['$filter', '$http', '$rootScope', '$state', 'api', 'rastreadorCarro', 'rastreadorMoto', 'toaster'];

  /**
   * @ngdoc controller
   * @scope {}
   * @name CotacaoController
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Mostra o resultado da cotação
   * 
   * @property {object} vm                - A named variable for the `this` keyword representing the ViewModel
   * @property {string} vm.carregando     - Telefone da multiplicar que aparecerá no html
   * @property {string} vm.cotacao        - Telefone da multiplicar que aparecerá no html
   * @property {string} vm.email          - Telefone da multiplicar que aparecerá no html
   * @property {string} vm.envelope       - Telefone da multiplicar que aparecerá no html
   * @property {string} vm.hasRastreador  - Telefone da multiplicar que aparecerá no html
   * @property {string} vm.preco          - Telefone da multiplicar que aparecerá no html
   * 
   * @param {service}  $filter                 - Usado para formatação {@link https://docs.angularjs.org/api/ng/filter/filter}
   * @param {service}  $http                   - Usado para comunicação HTTP {@link https://docs.angularjs.org/api/ng/service/$http}
   * @param {service}  $rootScope              - Escopo principal do angular {@link https://docs.angularjs.org/api/ng/service/$rootScope}
   * @param {service}  $state                  - Status da transição {@link https://github.com/angular-ui/ui-router/wiki/Quick-Reference#state-1}
   * @param {service}  CheckConditionService   - Servico para velidação do veículo (Veja checkCondition.service.js)
   * @param {constant} api                     - url do api
   * @param {constant} rastreadorCarro         - Valor minimo para ter rastreador obrigatorio no carro
   * @param {constant} rastreadorMoto          - Valor minimo para ter rastreador obrigatorio na moto
   * @param {service}  toaster                 - Seviço para mostrar mensagens
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/controller} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#controllers} Para melhores praticas
   */
  function CotacaoController($filter, $http, $rootScope, $state, api, rastreadorCarro, rastreadorMoto, toaster) {
    var vm = this;

    vm.carregando = true;
    vm.cotacao    = {
      'fipe':    '',
      'ip':      '',
      'modelo':  '',
      'valor':   '',
      'veiculo': ''
    };
    vm.email    = undefined;
    vm.envelope = {
      'check':       'umapalavrarealmentemuitograndeparaserlembradafeitapormim',
      'modelo':      '',
      'to':          '',
      'valorBronze': '',
      'valorCarro':  '',
      'valorOuro':   '',
      'valorPrata':  ''
    };
    vm.hasRastreador = false;
    vm.preco         = {
      basico: 'R$29,90',
      bronze: undefined,
      ouro:   undefined,
      prata:  undefined
    };

    /**
     * Atribuição das funções no escopo
     */
    vm.EnviarEmail = EnviarEmail;

    Activate();

    ////////////////

    /**
     * @function Activate
     * @desc Setup docontrolador. Exetuca assim que o controlador inicia
     * @memberof CotacaoController
     */
    function Activate() {
      //Se nao houver dados do carro, envia de volta para a tela para digitar a placa
      if (!$rootScope.usuario) {
        $state.go('placa');
      } else {
        GetPrecos();
        SalvarCotacao();
      }
    }

    /**
     * @function EnviarEmail
     * @desc Envia a cotação para o e-mail fornecido
     * @memberof CotacaoController
     */
    function EnviarEmail() {
      vm.envelope.to = vm.email;
      vm.email       = undefined;

      $http.post('php/emailCotacao.php', vm.envelope);

      toaster.pop({
        type:    'error',
        body:    'E-mail enviado.',
        timeout: 30000
      });
    }

    /**
     * @function GetPrecos
     * @desc Busca o valor dos planos no banco de dados baseado no valor da tabela fipe
     * @memberof CotacaoController
     */
    function GetPrecos() {
      // Filtro para pegar os dados dos planos no BD
      var filtro  = 'Carro';
      var valores = []; // Valores dos planos
      /**
       * Retira o R$ e o ,00 do valor para ficar mais facil a verificação 
       * abaixo
       */
      var valorFipe = $rootScope.usuario.preco.replace('R$ ', ' ');
      valorFipe     = valorFipe.replace(',00', ' ');
      valorFipe     = parseInt(valorFipe);

      //Formata o valor da tabela FIPE
      $rootScope.usuario.preco = $filter('currency')(valorFipe, 'R$ ');

      //Armazena o valor da fipe e o modelo do carro na variavel para enviar pro email
      vm.envelope.valorCarro = $rootScope.usuario.preco;
      vm.envelope.modelo     = $rootScope.usuario.modelo;

      /**
       * Verifica se eh carro ou moto.
       * Se for carro verifica se eh taxi ou uber
       * Verfica se o rastredor eh obrigatorio ou nao
       */
      if ($rootScope.usuario.veiculo === 'AUTOMÓVEL') {

        if (valorFipe > rastreadorCarro) {
          vm.hasRastreador = true;
        }

        if ($rootScope.usuario.especial) {
          filtro = 'Especial';
        }
      } else {
        filtro = 'Moto';

        if (valorFipe > rastreadorMoto) {
          vm.hasRastreador = true;
        }
      }

      //Busca os dados dos planos no BD
      $http.get(api + 'preco?filter=veiculo,eq,' + filtro).then(function (resp) {
        valores = php_crud_api_transform(resp.data).preco;

        //Pega o valor de cada plano
        angular.forEach(valores, function (value, key) {
          if (valorFipe >= parseInt(value.min) && valorFipe <= parseInt(value.max)) {
            switch (value.plano) {
              case 'Bronze':
                vm.preco.bronze         = value.valor;
                vm.envelope.valorBronze = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Prata':
                vm.preco.prata         = value.valor;
                vm.envelope.valorPrata = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Ouro':
                vm.preco.ouro         = value.valor;
                vm.envelope.valorOuro = $filter('currency')(value.valor, 'R$ ');
                break;

              default:
                break;
            }
          }
        });
        vm.carregando = false;
      });
    }

    /**
     * @function SalvarCotacao
     * @desc Salva os dados da cotação no banco de dados
     * @memberof CotacaoController
     */
    function SalvarCotacao() {
      $http.get('php/ipvisitor.php').then(function (resp) {

        vm.cotacao.ip     = resp.data;
        vm.cotacao.fipe   = $rootScope.usuario.codigoTabelaFipe;
        vm.cotacao.modelo = $rootScope.usuario.modelo;
        vm.cotacao.valor  = $rootScope.usuario.preco;

        if ($rootScope.usuario.veiculo === 'AUTOMÓVEL') {
          vm.cotacao.veiculo = 'Carro';
        } else if ($rootScope.usuario.especial) {
          vm.cotacao.veiculo = 'Especial';
        } else {
          vm.cotacao.veiculo = 'Moto';
        }

        $http.post(api + 'cotacao', vm.cotacao).then(function (resp) {
          $rootScope.usuario.idCotacao = resp.data;
        });
      });

    }
  }
})();