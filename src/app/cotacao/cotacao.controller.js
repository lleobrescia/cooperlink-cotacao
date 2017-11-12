(function () {
  'use strict';

  angular
    .module('app')
    .controller('CotacaoController', CotacaoController);

  CotacaoController.$inject = ['$filter', '$http', '$rootScope', '$state', 'api', 'rastreadorCarro', 'rastreadorMoto', 'toaster', 'projectDir', 'projectDev', 'pipedrive'];

  /**
   * @ngdoc controller
   * @scope {}
   * @name CotacaoController
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Mostra o resultado da cotação
   *
   * @property {object} vm                - A named variable for the `this` keyword representing the ViewModel
   * @property {string} vm.adesao         - Valor da adesao
   * @property {string} vm.carregando     - Controla o loading
   * @property {string} vm.cotacao        - Dados da cotacao
   * @property {string} vm.email          - E-mail do usuario
   * @property {string} vm.envelope       - Dados para enviar por e-mail
   * @property {string} vm.franquia       - Valor da franquia
   * @property {string} vm.hasRastreador  - Controla se tem ou nao rastreador
   * @property {string} vm.planoEscolhido - Plano que o usuario escolheu
   * @property {string} vm.preco          - Precos dos planos
   * @property {string} vm.opcionais      - Opcionais do carro
   * @property {string} vm.opcionaisMoto  - Opcionais da moto
   * @property {string} vm.opcionaisPopup - Url do popup dos opcionais
   * @property {string} vm.valorFipe      - Valor na tabela fipe do veiculo
   * @property {string} vm.total          - Total da menalidade (valor do plano + opcionais)
   *
   * @param {service}  $filter          - Usado para formatação {@link https://docs.angularjs.org/api/ng/filter/filter}
   * @param {service}  $http            - Usado para comunicação HTTP {@link https://docs.angularjs.org/api/ng/service/$http}
   * @param {service}  $rootScope       - Escopo principal do angular {@link https://docs.angularjs.org/api/ng/service/$rootScope}
   * @param {service}  $state           - Status da transição {@link https://github.com/angular-ui/ui-router/wiki/Quick-Reference#state-1}
   * @param {constant} api              - Url do api
   * @param {constant} rastreadorCarro  - Valor minimo para ter rastreador obrigatorio no carro
   * @param {constant} rastreadorMoto   - Valor minimo para ter rastreador obrigatorio na moto
   * @param {service}  toaster          - Seviço para mostrar mensagens
   * @param {constant} projectDir       - Caminho para o diretorio de producao
   * @param {constant} projectDev       - Caminho para o diretorio de desenvolvimento
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/controller} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#controllers} Para melhores praticas
   */
  function CotacaoController($filter, $http, $rootScope, $state, api, rastreadorCarro, rastreadorMoto, toaster, projectDir, projectDev, pipedrive ) {
    var carro15   = 15.00;
    var carro30   = 20.00;
    var carro7    = 11.00;
    var dealID    = '';
    var moto15    = 12.00;
    var moto30    = 15.00;
    var moto7     = 9.00;
    var rastLocal = 75.00;
    var rastrador = 55.00;
    var vm        = this;

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
      basico: 29.90,
      bronze: undefined,
      ouro  : undefined,
      prata : undefined
    };
    vm.opcionais = {
      'carroReserva': 0.00,
      'rastreador'  : 0.00,
      'reboque'     : 0.00,
      'vidros'      : 0.00
    };
    vm.opcionaisMoto = {
      'hospital'   : 0.00,
      'motoReserva': 0.00,
      'rastreador' : 0.00,
      'reboque'    : 0.00,
      'vidros'     : 0.00
    };
    vm.opcionaisPopup = 'opcionais.html';
    vm.valorFipe      = undefined;
    vm.total          = 0.00;


    /**
     * Atribuição das funções no escopo
     */
    vm.Contratar       = Contratar;
    vm.EnviarEmail     = EnviarEmail;
    vm.LimparOpcionais = LimparOpcionais;
    vm.SomarTotal      = SomarTotal;

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
        dealID = $rootScope.usuario.deal;
        GetPrecos();
      }
    }

    /**
     * @function AdicionarOpcionais
     * @desc Adiciona os nomes dos opcionais na variavel que vai para o bd
     * @memberof CotacaoController
     */
    function AdicionarOpcionais(planoEscolhido) {
      //Moto reserva
      if (vm.opcionaisMoto.motoReserva === moto7) {
        planoEscolhido.opcionais += 'Moto reserva 7 dias, ';
      } else if (vm.opcionaisMoto.motoReserva === moto15) {
        planoEscolhido.opcionais += 'Moto reserva 15 dias, ';
      } else if (vm.opcionaisMoto.motoReserva === moto30) {
        planoEscolhido.opcionais += 'Moto reserva 30 dias, ';
      }

      //Moto vidros
      if (vm.opcionaisMoto.vidros !== 0.00) {
        planoEscolhido.opcionais += 'Vidros, fárois, lanternas e retrovisores, ';
      }

      //Reboque
      if (vm.opcionaisMoto.reboque !== 0.00) {
        planoEscolhido.opcionais += 'Reboque 1000Km, ';
      }

      //Hospital
      if (vm.opcionaisMoto.hospital !== 0.00) {
        planoEscolhido.opcionais += 'Auxilio hospitalar, ';
      }

      //Rastrador
      if (vm.opcionaisMoto.rastreador === rastrador) {
        planoEscolhido.opcionais += 'Rastreador, ';
      } else if (vm.opcionais.rastreador === rastLocal) {
        planoEscolhido.opcionais += 'Rastreador e localizador, ';
      }

      //Carro reserva
      if (vm.opcionais.carroReserva === carro7) {
        planoEscolhido.opcionais += 'Carro reserva 7 dias, ';
      } else if (vm.opcionais.carroReserva === carro15) {
        planoEscolhido.opcionais += 'Carro reserva 15 dias, ';
      } else if (vm.opcionais.carroReserva === carro30) {
        planoEscolhido.opcionais += 'Carro reserva 30 dias, ';
      }

      //Rastreador
      if (vm.opcionais.rastreador === rastrador) {
        planoEscolhido.opcionais += 'Rastreador, ';
      } else if (vm.opcionais.rastreador === rastLocal) {
        planoEscolhido.opcionais += 'Rastreador e localizador, ';
      }

      //Reboque
      if (vm.opcionais.reboque !== 0.00) {
        planoEscolhido.opcionais += 'Reboque 1000Km, ';
      }

      //Vidros
      if (vm.opcionais.vidros !== 0.00) {
        planoEscolhido.opcionais += 'Vidros, fárois, lanternas e retrovisores';
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
                vm.preco.bronze         = parseFloat(value.valor);
                vm.envelope.adesao      = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia    = value.franquia;
                vm.envelope.valorBronze = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Prata':
                vm.adesao              = value.adesao;
                vm.franquia            = value.franquia;
                vm.preco.prata         = parseFloat(value.valor);
                vm.envelope.adesao     = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia   = value.franquia;
                vm.envelope.valorPrata = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Ouro':
                vm.adesao             = value.adesao;
                vm.franquia           = value.franquia;
                vm.preco.ouro         = parseFloat(value.valor);
                vm.envelope.adesao    = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia  = value.franquia;
                vm.envelope.valorOuro = $filter('currency')(value.valor, 'R$ ');
                break;

              default:
                break;
            }
            UpdateDeal();
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
          title  : 'Erro #701',
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
                vm.preco.bronze         = parseFloat(value.valor);
                vm.envelope.adesao      = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia    = value.franquia;
                vm.envelope.valorBronze = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Prata':
                vm.adesao              = value.adesao;
                vm.franquia            = value.franquia;
                vm.preco.prata         = parseFloat(value.valor);
                vm.envelope.adesao     = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia   = value.franquia;
                vm.envelope.valorPrata = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Ouro':
                vm.adesao             = value.adesao;
                vm.franquia           = value.franquia;
                vm.preco.ouro         = parseFloat(value.valor);
                vm.envelope.adesao    = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia  = value.franquia;
                vm.envelope.valorOuro = $filter('currency')(value.valor, 'R$ ');
                break;

              default:
                break;
            }
            UpdateDeal();
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
          title  : 'Erro #701',
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
                vm.preco.bronze         = parseFloat(value.valor);
                vm.envelope.adesao      = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia    = value.franquia;
                vm.envelope.valorBronze = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Prata':
                vm.adesao              = value.adesao;
                vm.franquia            = value.franquia;
                vm.preco.prata         = parseFloat(value.valor);
                vm.envelope.adesao     = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia   = value.franquia;
                vm.envelope.valorPrata = $filter('currency')(parseFloat(value.valor), 'R$ ');
                break;

              case 'Ouro':
                vm.adesao             = value.adesao;
                vm.franquia           = value.franquia;
                vm.preco.ouro         = parseFloat(value.valor);
                vm.envelope.adesao    = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia  = value.franquia;
                vm.envelope.valorOuro = $filter('currency')(value.valor, 'R$ ');
                break;

              default:
                break;
            }
            UpdateDeal();
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
          title  : 'Erro #701',
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
                vm.preco.bronze         = parseFloat(value.valor);
                vm.envelope.adesao      = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia    = value.franquia;
                vm.envelope.valorBronze = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Prata':
                vm.adesao              = value.adesao;
                vm.franquia            = value.franquia;
                vm.preco.prata         = parseFloat(value.valor);
                vm.envelope.adesao     = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia   = value.franquia;
                vm.envelope.valorPrata = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Ouro':
                vm.adesao             = value.adesao;
                vm.franquia           = value.franquia;
                vm.preco.ouro         = parseFloat(value.valor);
                vm.envelope.adesao    = $filter('currency')(value.adesao, 'R$ ');
                vm.envelope.franquia  = value.franquia;
                vm.envelope.valorOuro = $filter('currency')(value.valor, 'R$ ');
                break;

              default:
                break;
            }
            UpdateDeal();
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
          title  : 'Erro #701',
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

    /**
     * @function Contratar
     * @desc Salva as informações da cotacao, o plano escolhido e os opcionais.
     * Depois envio o usuario para digitar os dados pessoais
     * @memberof CotacaoController
     */
    function Contratar() {
      vm.carregando = true;
      $('.bs-example-modal-lg').modal('hide');
      $('.modal-backdrop').css('display','none');
      $('body').removeClass('modal-open').css('padding-right','0');

      var planoEscolhido = {
        'adesao'     : $filter('currency')(vm.adesao, 'R$ '),
        'cotacao'    : $rootScope.usuario.idCotacao,
        'fipe'       : $rootScope.usuario.codigoTabelaFipe,
        'franquia'   : vm.franquia,
        'ip'         : vm.cotacao.ip,
        'mensalidade': $filter('currency')(vm.total, 'R$ '),
        'modelo'     : $rootScope.usuario.modelo,
        'opcionais'  : '',
        'plano'      : vm.planoEscolhido, 
        'tipoVeiculo': vm.cotacao.tipo,
        'veiculo'    : vm.cotacao.veiculo
      };

      AdicionarOpcionais(planoEscolhido);

      $rootScope.usuario.plano      = vm.planoEscolhido;
      $rootScope.usuario.vlorAdesao = vm.adesao;
      $rootScope.usuario.valorPlano = vm.total;

       $http.post(api + 'planoescolhido', planoEscolhido).then(function (resp) {
        console.info('Plano escolhido salvo ', planoEscolhido);
        $rootScope.usuario.idPlano = resp.data;

        vm.carregando = false;
        $state.go('dados');
      }).catch(function (error) {
        toaster.pop({
          type   : 'error',
          title  : 'Erro #701',
          body   : 'Por favor, tente mais tarde.',
          timeout: 50000
        });
        vm.carregando = false;
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

      toaster.pop({
        type   : 'success',
        body   : 'E-mail enviado.',
        timeout: 30000
      });

      vm.envelope.to = vm.email;
      vm.email = undefined;

      $http.post(projectDir + 'php/emailCotacao.php', vm.envelope).catch(function (error) {
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
     * @function LimparOpcionais
     * @desc Limpa as escolhas feitas nos opcionais quando troca de plano
     * @memberof CotacaoController
     */
    function LimparOpcionais() {
      vm.opcionais = {
        'carroReserva': 0.00,
        'rastreador'  : 0.00,
        'reboque'     : 0.00,
        'vidros'      : 0.00
      };
      vm.opcionaisMoto = {
        'hospital'   : 0.00,
        'motoReserva': 0.00,
        'rastreador' : 0.00,
        'reboque'    : 0.00,
        'vidros'     : 0.00
      };

      vm.total =  vm.preco[vm.planoEscolhido];
    }

    /**
     * @function SalvarCotacao
     * @desc Salva os dados da cotação no banco de dados
     * @memberof CotacaoController
     */
    function SalvarCotacao() {
      $http.get(projectDev + 'php/ipvisitor.php').then(function (resp) {

        // Salva as informacoes para enviar para o BD
        vm.cotacao.fipe     = $rootScope.usuario.codigoTabelaFipe;
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
          title  : 'Erro ao conectar com o servidor #702',
          body   : 'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Erro ao salvar cotacao = >' + error);
        $state.go('placa');
      });
    }

    /**
     * @function SomarTotal
     * @desc Soma o valor do plano escolhido com os opcionais escolhidos
     * @memberof CotacaoController
     */
    function SomarTotal() {
      /**
       * Reseta o valor do total baseado no plano
       * Evita erro quando o usuario troca de plano
       */
      vm.total =  vm.preco[vm.planoEscolhido];

      vm.total +=
        vm.opcionais.carroReserva +
        vm.opcionais.rastreador +
        vm.opcionais.reboque +
        vm.opcionais.vidros +
        vm.opcionaisMoto.hospital +
        vm.opcionaisMoto.motoReserva +
        vm.opcionaisMoto.rastreador +
        vm.opcionaisMoto.reboque +
        vm.opcionaisMoto.vidros ;

        console.log(vm.opcionaisMoto.hospital);
        console.log(vm.opcionaisMoto.motoReserva);
        console.log(vm.opcionaisMoto.rastreador);
        console.log(vm.opcionaisMoto.reboque);
        console.log(vm.opcionaisMoto.vidros);
        console.log(vm.opcionais.carroReserva);
        console.log(vm.opcionais.rastreador);
        console.log(vm.opcionais.reboque);
        console.log(vm.opcionais.vidros);
        console.log(vm.total);
    }

    function UpdateDeal() {
      var deal  = '';
      var token = '';
      switch ($rootScope.usuario.estado) {
        case 'Minas Gerais':
          token = 'd535ffdcda8a98f665d3a1a2159b7e332513775d';
          deal = {
            'value': vm.adesao,
            'ace9aa91c871c6d1529fa088bb2d4729c9ef81c4': 'R$ '+vm.adesao,
            '4b41594abadea4fb7ebb61fcec6a4a267c550af7': vm.preco.ouro,
            '7f5ce4fae3aa79fbf45adaac1a890fb68501f91c': vm.preco.prata,
            'c26428081cc46c0d68c77192f00b18513af4d824': vm.preco.bronze
          };
          break;

        default:
          token = '826f5328bd2a1aa1c10626f78d541f8f3172da26';
          deal = {
            'value': vm.adesao,
            'dda3c9403fddc931021bf44d2d6bb5394871ae8b': 'R$ '+vm.adesao,
            '67c549b193487171d0774dc6a0210afef18f72f1': vm.preco.ouro,
            '3a58eefc2f92efbafe850585055d0cd8fb884dd9': vm.preco.prata,
            'c87bbad265cbdf653658c09c6bbbc0768b8fb44a': vm.preco.bronze
          };
          break;
      }

      $http.put(pipedrive + 'deals/' + dealID + '/?api_token=' + token, deal).then(function (resp) {
        console.log('Pipedrive deal update', resp);
      });
    }

  }
})();