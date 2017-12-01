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
  function CotacaoController($filter, $http, $rootScope, $state, api, rastreadorCarro, rastreadorMoto, toaster, projectDir, projectDev, pipedrive) {
    var carro15 = 15.00;
    var carro30 = 20.00;
    var carro7 = 11.00;
    var moto15 = 12.00;
    var moto30 = 15.00;
    var moto7 = 9.00;
    var rastLocal = 75.00;
    var rastrador = 55.00;
    var vm = this;

    vm.adesao = '';
    vm.carregando = true;
    vm.cotacao = {
      'adesao': '',
      'fabricante': '',
      'fipe': '',
      'franquia': '',
      'ip': '',
      'modelo': '',
      'tipo': 'Comum',
      'valor': '',
      'veiculo': ''
    };
    vm.email = undefined;
    vm.envelope = {
      'adesao': '',
      'check': 'umapalavrarealmentemuitograndeparaserlembradafeitapormim',
      'franquia': '',
      'modelo': '',
      'to': '',
      'valorBronze': '',
      'valorCarro': '',
      'valorOuro': '',
      'valorPrata': ''
    };
    vm.franquia = '';
    vm.hasRastreador = false;
    vm.planoEscolhido = 'basico';
    vm.preco = {
      basico: 29.90,
      bronze: undefined,
      ouro: undefined,
      prata: undefined
    };
    vm.opcionais = {
      'carroReserva': 0.00,
      'rastreador': 0.00,
      'reboque': 0.00,
      'vidros': 0.00
    };
    vm.opcionaisMoto = {
      'hospital': 0.00,
      'motoReserva': 0.00,
      'rastreador': 0.00,
      'reboque': 0.00,
      'vidros': 0.00
    };
    vm.opcionaisPopup = 'cotacao/opcionais.html';
    vm.valorFipe = undefined;
    vm.total = 0.00;


    /**
     * Atribuição das funções no escopo
     */
    vm.Contratar = Contratar;
    vm.EnviarEmail = EnviarEmail;
    vm.LimparOpcionais = LimparOpcionais;
    vm.SomarTotal = SomarTotal;

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
     * @function AdicionarOpcionais
     * @desc Adiciona os nomes dos opcionais na variavel que vai para o bd
     * @memberof CotacaoController
     */
    function AdicionarOpcionais() {
      //Moto reserva
      if (vm.opcionaisMoto.motoReserva === moto7) {
        $rootScope.usuario.opcionais += 'Moto reserva 7 dias, ';
      } else if (vm.opcionaisMoto.motoReserva === moto15) {
        $rootScope.usuario.opcionais += 'Moto reserva 15 dias, ';
      } else if (vm.opcionaisMoto.motoReserva === moto30) {
        $rootScope.usuario.opcionais += 'Moto reserva 30 dias, ';
      }

      //Moto vidros
      if (vm.opcionaisMoto.vidros !== 0.00) {
        $rootScope.usuario.opcionais += 'Vidros, fárois, lanternas e retrovisores, ';
      }

      //Reboque
      if (vm.opcionaisMoto.reboque !== 0.00) {
        $rootScope.usuario.opcionais += 'Reboque 1000Km, ';
      }

      //Hospital
      if (vm.opcionaisMoto.hospital !== 0.00) {
        $rootScope.usuario.opcionais += 'Auxilio hospitalar, ';
      }

      //Rastrador
      if (vm.opcionaisMoto.rastreador === rastrador) {
        $rootScope.usuario.opcionais += 'Rastreador, ';
      } else if (vm.opcionais.rastreador === rastLocal) {
        $rootScope.usuario.opcionais += 'Rastreador e localizador, ';
      }

      //Carro reserva
      if (vm.opcionais.carroReserva === carro7) {
        $rootScope.usuario.opcionais += 'Carro reserva 7 dias, ';
      } else if (vm.opcionais.carroReserva === carro15) {
        $rootScope.usuario.opcionais += 'Carro reserva 15 dias, ';
      } else if (vm.opcionais.carroReserva === carro30) {
        $rootScope.usuario.opcionais += 'Carro reserva 30 dias, ';
      }

      //Rastreador
      if (vm.opcionais.rastreador === rastrador) {
        $rootScope.usuario.opcionais += 'Rastreador, ';
      } else if (vm.opcionais.rastreador === rastLocal) {
        $rootScope.usuario.opcionais += 'Rastreador e localizador, ';
      }

      //Reboque
      if (vm.opcionais.reboque !== 0.00) {
        $rootScope.usuario.opcionais += 'Reboque 1000Km, ';
      }

      //Vidros
      if (vm.opcionais.vidros !== 0.00) {
        $rootScope.usuario.opcionais += 'Vidros, fárois, lanternas e retrovisores';
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
      $('.modal-backdrop').css('display', 'none');
      $('body').removeClass('modal-open').css('padding-right', '0');

      $rootScope.usuario.plano = vm.planoEscolhido;
      $rootScope.usuario.valorPlano = vm.total;

      AdicionarOpcionais();

      vm.carregando = false;
      $state.go('dados');
    }

    /**
     * @function EnviarEmail
     * @desc Envia a cotação para o e-mail fornecido
     * @memberof CotacaoController
     */
    function EnviarEmail() {
      console.info('Email enviado.');

      toaster.pop({
        type: 'success',
        body: 'E-mail enviado.',
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
      var idRegiao = $rootScope.usuario.idRegiao;
      var segmento = $rootScope.usuario.segmento;
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
      vm.envelope.modelo = $rootScope.usuario.modelo;

      if ($rootScope.usuario.veiculo === 'AUTOMOVEL' && vm.valorFipe > rastreadorCarro) {
        console.info('Rastreador');
        vm.hasRastreador = true;
      } else if ($rootScope.usuario.veiculo === 'MOTOCICLETA' && vm.valorFipe > rastreadorMoto) {
        console.info('Rastreador');
        vm.hasRastreador = true;
      }

      $http.get(api + 'cp_valor?filter[]=segmento,eq,' + segmento + '&filter[]=idRegiao,eq,' + idRegiao).then(function (resp) {
        var valores = php_crud_api_transform(resp.data).cp_valor;

        //Pega o valor de cada plano
        angular.forEach(valores, function (value, key) {
          if (vm.valorFipe >= parseInt(value.min) && vm.valorFipe <= parseInt(value.max)) {
            console.log(value);

            vm.adesao = $rootScope.usuario.vlorAdesao = value.adesao;
            vm.franquia = $rootScope.usuario.franquia = value.franquia;
            vm.envelope.adesao = $rootScope.usuario.adesao = $filter('currency')(value.adesao, 'R$ ');
            vm.envelope.franquia = value.franquia;

            switch (value.plano) {
              case 'Bronze':
                vm.preco.bronze = $rootScope.usuario.bronze = parseFloat(value.valor);
                vm.envelope.valorBronze = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Prata':
                vm.preco.prata = $rootScope.usuario.prata = parseFloat(value.valor);
                vm.envelope.valorPrata = $filter('currency')(value.valor, 'R$ ');
                break;

              case 'Ouro':
                vm.preco.ouro = $rootScope.usuario.ouro = parseFloat(value.valor);
                vm.envelope.valorOuro = $filter('currency')(value.valor, 'R$ ');
                break;

              default:
                break;
            }
          }
        });

        if (!vm.preco.ouro) {
          console.warn('Valor da tabela fipe acima do limite', vm.preco);

          toaster.pop({
            type: 'info',
            body: 'Não é possível fazer cotação para esse veículo.',
            timeout: 50000
          });

          $state.go('placa');
        } else {
          console.log('Usuario, ', $rootScope.usuario);
          RegisterLead();
        }

        console.log('Adesao => ', vm.adesao);
        console.log('Franquia => ', vm.franquia);
        console.log('Preco => ', vm.preco);
        console.log('Envelope => ', vm.envelope);

      }).catch(function (error) {
        toaster.pop({
          type: 'error',
          title: 'Erro #701',
          body: 'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Erro ao buscar preco = >' + error);
        $state.go('placa');
      });
    }

    /**
     * @function LimparOpcionais
     * @desc Limpa as escolhas feitas nos opcionais quando troca de plano
     * @memberof CotacaoController
     */
    function LimparOpcionais() {
      vm.opcionais = {
        'carroReserva': 0.00,
        'rastreador': 0.00,
        'reboque': 0.00,
        'vidros': 0.00
      };
      vm.opcionaisMoto = {
        'hospital': 0.00,
        'motoReserva': 0.00,
        'rastreador': 0.00,
        'reboque': 0.00,
        'vidros': 0.00
      };

      vm.total = vm.preco[vm.planoEscolhido];
    }

    function RegisterLead() {
      $http.get(api + 'cp_pipedrive?filter=idRegiao,eq,' + $rootScope.usuario.idRegiao).then(function (resp) {
        var resposta = php_crud_api_transform(resp.data).cp_pipedrive;
        resposta = resposta[0];

        var person = {
          'name': $rootScope.usuario.nome,
          'email': [$rootScope.usuario.email],
          'phone': [$rootScope.usuario.telefone]
        };

        var deal = {
          'title': $rootScope.usuario.nome,
          'person_id': '',
          'stage_id': 1
        };

        person[resposta.estado] = $rootScope.usuario.estado;
        deal[resposta.tipoVeiculo] = $rootScope.usuario.veiculo;
        deal[resposta.fabricante] = $rootScope.usuario.fabricante;
        deal[resposta.modelo] = $rootScope.usuario.modelo;
        deal[resposta.ano] = $rootScope.usuario.ano;
        deal[resposta.importado] = $rootScope.usuario.importado ? 'Sim' : 'Não';
        deal[resposta.taxi] = $rootScope.usuario.taxi ? 'Sim' : 'Não';
        deal[resposta.disel] = $rootScope.usuario.disel ? 'Sim' : 'Não';
        deal[resposta.codigo] = $rootScope.usuario.codigoTabelaFipe;
        deal[resposta.valor] = $rootScope.usuario.preco;
        deal[resposta.adesao] = $rootScope.usuario.adesao;
        deal[resposta.ouro] = $rootScope.usuario.ouro;
        deal[resposta.prata] = $rootScope.usuario.prata;
        deal[resposta.bronze] = $rootScope.usuario.bronze;

        $http.post(pipedrive + 'persons/?api_token=' + resposta.token, person).then(function (resp) {
          deal.person_id = resp.data.data.id;
          console.log('Pipedrive person ', resp);

          $http.post(pipedrive + 'deals/?api_token=' + resposta.token, deal).then(function (resp2) {
            $rootScope.usuario.deal = resp2.data.data.id;
            console.log('Pipedrive deal ', resp2);

            vm.carregando = false;
          });
        });
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
      vm.total = vm.preco[vm.planoEscolhido];

      vm.total +=
        vm.opcionais.carroReserva +
        vm.opcionais.rastreador +
        vm.opcionais.reboque +
        vm.opcionais.vidros +
        vm.opcionaisMoto.hospital +
        vm.opcionaisMoto.motoReserva +
        vm.opcionaisMoto.rastreador +
        vm.opcionaisMoto.reboque +
        vm.opcionaisMoto.vidros;

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
  }
})();