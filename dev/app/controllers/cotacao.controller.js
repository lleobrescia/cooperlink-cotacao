(function () {
  'use strict';

  angular
    .module('app')
    .controller('CotacaoController', CotacaoController);

  CotacaoController.$inject = ['$filter', '$http', '$rootScope', '$state', 'api', 'rastreadorCarro', 'rastreadorMoto', 'toaster', 'projectDir','projectDev'];

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
   * @property {string} vm.franquia       - Telefone da multiplicar que aparecerá no html
   * @property {string} vm.hasRastreador  - Telefone da multiplicar que aparecerá no html
   * @property {string} vm.planoEscolhido - Telefone da multiplicar que aparecerá no html
   * @property {string} vm.preco          - Telefone da multiplicar que aparecerá no html
   * @property {string} vm.opcionais      - Telefone da multiplicar que aparecerá no html
   * @property {string} vm.valorFipe      - Telefone da multiplicar que aparecerá no html
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
  function CotacaoController($filter, $http, $rootScope, $state, api, rastreadorCarro, rastreadorMoto, toaster, projectDir,projectDev) {
    var vm = this;

    vm.adesao     = '';
    vm.carregando = true;
    vm.cotacao    = {
      'adesao'    : '',
      'fabricante': '',
      'fipe'      : '',
      'franquia'  : '',
      'ip'        : '',
      'modelo'    : '',
      'tipo'      : 'Comum',
      'valor'     : '',
      'veiculo'   : ''
    };
    vm.email    = undefined;
    vm.envelope = {
      'adesao'     : '',
      'check'      : 'umapalavrarealmentemuitograndeparaserlembradafeitapormim',
      'franquia'   : '',
      'modelo'     : '',
      'to'         : '',
      'valorBronze': '',
      'valorCarro' : '',
      'valorOuro'  : '',
      'valorPrata' : ''
    };
    vm.franquia       = '';
    vm.hasRastreador  = false;
    vm.planoEscolhido = 'basico';
    vm.preco          = {
      basico: '29.90',
      bronze: undefined,
      ouro  : undefined,
      prata : undefined
    };
    vm.opcionais = {
      'carroReserva': '',
      'rastreador'  : '',
      'reboque'     : '',
      'vidros'      : ''
    };
    vm.opcionaisMoto = {
      'hospital'   : false,
      'motoReserva': '',
      'seguro'     : false,
      'vidros'     : ''
    };
    vm.opcionaisPopup = projectDir + 'views/opcionais.html';
    vm.valorFipe      = undefined;
    vm.valorPlano     = '';


    /**
     * Atribuição das funções no escopo
     */
    vm.Contratar   = Contratar;
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
      }
    }

    /**
     * @function BuscarPrecoCarro
     * @desc Busca os valores da cotação para carro
     * @memberof CotacaoController
     */
    function BuscarPrecoCarro() {
      //Busca os dados dos planos no BD
      $http.get(api + 'precocarro').then(function (resp) {
        var valores = php_crud_api_transform(resp.data).precocarro;

        //Pega o valor de cada plano
        angular.forEach(valores, function (value, key) {
          if (vm.valorFipe >= parseInt(value.min) && vm.valorFipe <= parseInt(value.max)) {
            console.log(value);
            switch (value.plano) {
              case 'Bronze':
                vm.adesao               = value.adesao;
                vm.franquia             = value.franquia;
                vm.preco.bronze         = value.valor;
                vm.envelope.adesao      = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia    = value.franquia;
                vm.envelope.valorBronze = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Prata':
                vm.adesao              = value.adesao;
                vm.franquia            = value.franquia;
                vm.preco.prata         = value.valor;
                vm.envelope.adesao     = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia   = value.franquia;
                vm.envelope.valorPrata = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Ouro':
                vm.adesao             = value.adesao;
                vm.franquia           = value.franquia;
                vm.preco.ouro         = value.valor;
                vm.envelope.adesao    = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia  = value.franquia;
                vm.envelope.valorOuro = $filter('currency')(value.valor, 'R$ ');
                break;

              default:
                break;
            }
          }
        });
        console.log('Adesao => ',   vm.adesao);
        console.log('Franquia => ', vm.franquia);
        console.log('Preco => ',    vm.preco);
        console.log('Envelope => ', vm.envelope);
        CotacaoLimite();
        vm.carregando = false;
      }).catch(function (error) {
         toaster.pop({
          type   : 'error',
          title  : 'Erro ao conectar com o servidor',
          body   : 'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Erro ao buscar preco do carro = >' + error);
        $state.go('placa');
      });
    }

    /**
     * @function BuscarPrecoEspecial
     * @desc Busca os valores da cotação para especial
     * @memberof CotacaoController
     */
    function BuscarPrecoEspecial() {
      //Busca os dados dos planos no BD
      $http.get(api + 'precoespecial').then(function (resp) {
        var valores = php_crud_api_transform(resp.data).precoespecial;

        //Pega o valor de cada plano
        angular.forEach(valores, function (value, key) {
          if (vm.valorFipe >= parseInt(value.min) && vm.valorFipe <= parseInt(value.max)) {
            console.log(value);
            switch (value.plano) {
              case 'Bronze':
                vm.adesao               = value.adesao;
                vm.franquia             = value.franquia;
                vm.preco.bronze         = value.valor;
                vm.envelope.adesao      = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia    = value.franquia;
                vm.envelope.valorBronze = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Prata':
                vm.adesao              = value.adesao;
                vm.franquia            = value.franquia;
                vm.preco.prata         = value.valor;
                vm.envelope.adesao     = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia   = value.franquia;
                vm.envelope.valorPrata = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Ouro':
                vm.adesao             = value.adesao;
                vm.franquia           = value.franquia;
                vm.preco.ouro         = value.valor;
                vm.envelope.adesao    = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia  = value.franquia;
                vm.envelope.valorOuro = $filter('currency')(value.valor, 'R$ ');
                break;

              default:
                break;
            }
          }

        });
        console.log('Adesao => ',   vm.adesao);
        console.log('Franquia => ', vm.franquia);
        console.log('Preco => ',    vm.preco);
        console.log('Envelope => ', vm.envelope);
        CotacaoLimite();
        vm.carregando = false;
      }).catch(function (error) {
         toaster.pop({
          type   : 'error',
          title  : 'Erro ao conectar com o servidor',
          body   : 'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Erro ao buscar preco do especial = >' + error);
        $state.go('placa');
      });
    }

    /**
     * @function BuscarPrecoMoto
     * @desc Busca os valores da cotação para moto
     * @memberof CotacaoController
     */
    function BuscarPrecoMoto() {
      //Busca os dados dos planos no BD
      $http.get(api + 'precomoto').then(function (resp) {
        var valores = php_crud_api_transform(resp.data).precomoto;

        //Pega o valor de cada plano
        angular.forEach(valores, function (value, key) {
          if (vm.valorFipe >= parseInt(value.min) && vm.valorFipe <= parseInt(value.max)) {
            console.log(value);
            switch (value.plano) {
              case 'Bronze':
                vm.adesao               = value.adesao;
                vm.franquia             = value.franquia;
                vm.preco.bronze         = value.valor;
                vm.envelope.adesao      = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia    = value.franquia;
                vm.envelope.valorBronze = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Prata':
                vm.adesao              = value.adesao;
                vm.franquia            = value.franquia;
                vm.preco.prata         = value.valor;
                vm.envelope.adesao     = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia   = value.franquia;
                vm.envelope.valorPrata = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Ouro':
                vm.adesao             = value.adesao;
                vm.franquia           = value.franquia;
                vm.preco.ouro         = value.valor;
                vm.envelope.adesao    = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia  = value.franquia;
                vm.envelope.valorOuro = $filter('currency')(value.valor, 'R$ ');
                break;

              default:
                break;
            }
          }

        });
        console.log('Adesao => ',   vm.adesao);
        console.log('Franquia => ', vm.franquia);
        console.log('Preco => ',    vm.preco);
        console.log('Envelope => ', vm.envelope);
        CotacaoLimite();
        vm.carregando = false;
      }).catch(function (error) {
         toaster.pop({
          type   : 'error',
          title  : 'Erro ao conectar com o servidor',
          body   : 'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Erro ao buscar preco da moto = >' + error);
        $state.go('placa');
      });
    }

    /**
     * @function BuscarPrecoTaxi
     * @descBusca os valores da cotação para taxi
     * @memberof CotacaoController
     */
    function BuscarPrecoTaxi() {
      //Busca os dados dos planos no BD
      $http.get(api + 'precotaxi').then(function (resp) {
        var valores = php_crud_api_transform(resp.data).precotaxi;

        //Pega o valor de cada plano
        angular.forEach(valores, function (value, key) {
          if (vm.valorFipe >= parseInt(value.min) && vm.valorFipe <= parseInt(value.max)) {
            console.log(value);
            switch (value.plano) {
              case 'Bronze':
                vm.adesao               = value.adesao;
                vm.franquia             = value.franquia;
                vm.preco.bronze         = value.valor;
                vm.envelope.adesao      = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia    = value.franquia;
                vm.envelope.valorBronze = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Prata':
                vm.adesao              = value.adesao;
                vm.franquia            = value.franquia;
                vm.preco.prata         = value.valor;
                vm.envelope.adesao     = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia   = value.franquia;
                vm.envelope.valorPrata = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Ouro':
                vm.adesao             = value.adesao;
                vm.franquia           = value.franquia;
                vm.preco.ouro         = value.valor;
                vm.envelope.adesao    = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia  = value.franquia;
                vm.envelope.valorOuro = $filter('currency')(value.valor, 'R$ ');
                break;

              default:
                break;
            }
          }
        });
        console.log('Adesao => ',   vm.adesao);
        console.log('Franquia => ', vm.franquia);
        console.log('Preco => ',    vm.preco);
        console.log('Envelope => ', vm.envelope);
        CotacaoLimite();
        vm.carregando = false;
      }).catch(function (error) {
         toaster.pop({
          type   : 'error',
          title  : 'Erro ao conectar com o servidor',
          body   : 'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Erro ao buscar preco do taxi = >' + error);
        $state.go('placa');
      });
    }

    /**
     * @function CotacaoLimite
     * @desc Executa quando o valor atinge o limite da tabela
     * @memberof CotacaoController
     */
    function CotacaoLimite() {
      if (!vm.preco.ouro) {
        console.warn('Valor da tabela fipe acima do limite', vm.preco);

        toaster.pop({
          type   : 'info',
          body   : 'Não é possível fazer cotação para esse veículo.',
          timeout: 50000
        });

        $state.go('placa');
      }
    }

    function Contratar() {
      vm.carregando = true;
      var planoEscolhido = {
        'adesao'     : $filter('currency')(vm.adesao, 'R$ '),
        'cotacao'    : $rootScope.usuario.idCotacao,
        'franquia'   : vm.franquia,
        'plano'      : vm.planoEscolhido,
        'opcionais'  : '', //TODO: Adicionar opcionais
        'tipoVeiculo': vm.cotacao.tipo,
        'veiculo'    : vm.cotacao.veiculo,
        'valor'      : $filter('currency')(vm.valorPlano, 'R$ ')
      };

      $rootScope.usuario.plano      = vm.adesao;
      $rootScope.usuario.vlorAdesao = vm.planoEscolhido;
      $rootScope.usuario.valorPlano = vm.valorPlano;

      //TODO: Calcular a adesao

       $http.post(api + 'planoescolhido', planoEscolhido).then(function (resp) {
        console.info('Plano escolhido salvo ', planoEscolhido);
        $rootScope.usuario.idPlano = resp.data;

        $state.go('dados');
      }).catch(function (error) {
        toaster.pop({
          type   : 'error',
          title  : 'Erro ao enviar a requisição.',
          body   : 'Por favor, tente mais tarde.',
          timeout: 50000
        });
        console.warn('Não foi possivel salvar o plano escolhido = >', error);
      });

    }

    /**
     * @function EnviarEmail
     * @desc Envia a cotação para o e-mail fornecido
     * @memberof CotacaoController
     */
    function EnviarEmail() {
      console.info('Email enviado.');

      vm.envelope.to = vm.email;
      vm.email = undefined;

      $http.post(projectDir + 'php/emailCotacao.php', vm.envelope).then(function (resp) {
        if (resp.data === 'false') {
          console.warn('Não foi possivel enviar e-mail = >', resp);
          toaster.pop({
            type   : 'error',
            title  : 'Erro ao enviar o e-mail',
            body   : 'Por favor, tente mais tarde.',
            timeout: 50000
          });
        } else if (resp.data === 'true') {
          console.log('Envelope =>', vm.envelope);

          toaster.pop({
            type   : 'success',
            body   : 'E-mail enviado.',
            timeout: 30000
          });
        }
      }).catch(function (error) {
        toaster.pop({
          type   : 'error',
          title  : 'Erro ao enviar o e-mail',
          body   : 'Por favor, tente mais tarde.',
          timeout: 50000
        });
        console.warn('Não foi possivel enviar e-mail = >', error);
      });
    }

    /**
     * @function GetPrecos
     * @desc Busca o valor dos planos no banco de dados baseado no valor da tabela fipe
     * @memberof CotacaoController
     */
    function GetPrecos() {
      /**
       * Retira o R$ e o ,00 do valor para ficar mais facil a verificação
       * abaixo
       */
      vm.valorFipe = $rootScope.usuario.preco.replace('R$ ', ' ');
      vm.valorFipe = vm.valorFipe.replace(',00', ' ');
      vm.valorFipe = parseInt(vm.valorFipe);

      //Formata o valor da tabela FIPE
      $rootScope.usuario.preco = $filter('currency')(vm.valorFipe, 'R$ ');

      //Armazena o valor da fipe e o modelo do carro na variavel para enviar pro email
      vm.envelope.valorCarro = $rootScope.usuario.preco;
      vm.envelope.modelo     = $rootScope.usuario.modelo;

      /**
       * Verifica se eh carro ou moto.
       * Se for carro verifica se eh taxi ou uber
       * Verfica se o rastredor eh obrigatorio ou nao
       */
      if ($rootScope.usuario.veiculo === 'AUTOMOVEL') {
        vm.cotacao.veiculo = 'Carro';

        //Rastreador
        if (vm.valorFipe > rastreadorCarro) {
          console.info('Rastreador');
          vm.hasRastreador = true;
        }

        if ($rootScope.usuario.taxi) {
          console.info('Taxi');

          vm.cotacao.tipo    = 'Taxi';

          BuscarPrecoTaxi();
        } else if ($rootScope.usuario.disel) {
          console.info('Disel');

          vm.cotacao.tipo    = 'Disel';

          BuscarPrecoEspecial();
        } else if ($rootScope.usuario.importado) {
          console.info('Importado');

          vm.cotacao.tipo    = 'Importado';

          BuscarPrecoEspecial();
        } else {
          console.info('Carro');

          BuscarPrecoCarro();
        }
      } else {
        console.info('Moto');

        vm.cotacao.veiculo = 'Moto';

        if (vm.valorFipe > rastreadorMoto) {
          console.info('Rastreador');
          vm.hasRastreador = true;
        }
        BuscarPrecoMoto();
      }

      SalvarCotacao();
    }

    /**
     * @function SalvarCotacao
     * @desc Salva os dados da cotação no banco de dados
     * @memberof CotacaoController
     */
    function SalvarCotacao() {
      $http.get(projectDev + 'php/ipvisitor.php').then(function (resp) {

        vm.cotacao.adesao   = $filter('currency')(vm.adesao, 'R$ ');
        vm.cotacao.fipe     = $rootScope.usuario.codigoTabelaFipe;
        vm.cotacao.franquia = vm.franquia;
        vm.cotacao.ip       = resp.data || null;
        vm.cotacao.modelo   = $rootScope.usuario.modelo;
        vm.cotacao.valor    = $rootScope.usuario.preco;

        console.log('Cotacao =>', vm.cotacao);
        console.log('Usuario =>', $rootScope.usuario);

        //Salva no Banco de dados
        $http.post(api + 'cotacao', vm.cotacao).then(function (resp) {
          console.info('Cotação salva');
          $rootScope.usuario.idCotacao = resp.data;
        }).catch(function (error) {
          console.warn('Erro ao pegar ip do usuario = >' + error);
        });
      }).catch(function (error) {
        toaster.pop({
          type   : 'error',
          title  : 'Erro ao conectar com o servidor',
          body   : 'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Erro ao salvar cotacao = >' + error);
        $state.go('placa');
      });
    }

    function SalvarPepidrive(){
      //TODO: Salvar no pepidrive
    }

  }
})();