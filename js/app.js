(function () {
  'use strict';

  /**
   * @ngdoc config
   * @scope {}
   * @name app
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Modulo principal da cotação.<br>
   * 
   * @param {module} ngMask     - Mascara para inputs {@link https://github.com/candreoliveira/ngMask}
   * @param {module} ngAnimate  - Animação no angular {@link https://docs.angularjs.org/api/ngAnimate}
   * @param {module} ui.router  - Rotas do Angular(troca de view) {@link https://github.com/angular-ui/ui-router}
   * @param {module} ngMessages - Alertas nos inputs {@link https://docs.angularjs.org/api/ngMessages/directive/ngMessages}
   * @param {module} toaster    - Popup de mensagem {@link https://github.com/jirikavi/AngularJS-Toaster}
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/module} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#startup-logic} Para melhores praticas
   */
  angular.module('app', [
    'ngMask',
    'ngAnimate',
    'ui.router',
    'ngMessages',
    'toaster',
    'angucomplete-alt'
  ]);
})();
(function () {
  'use strict';

  /**
   * @ngdoc config
   * @scope {}
   * @name constants
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Constantes do APP.<br>
   */
  angular
    .module('app')
    .constant('api', 'http://localhost/multiplicar/cotacao/api.php/')
    .constant('rastreadorCarro', 20000)
    .constant('rastreadorMoto', 7000);
})();
(function () {
  'use strict';

  angular
    .module('app')
    .config(RouteConfig);

  RouteConfig.$inject = ['$stateProvider', '$locationProvider', '$urlRouterProvider'];

  /**
   * @ngdoc config
   * @scope {}
   * @name RouteConfig
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Controla as rotas do dashboard.<br>
   * 
   * @param {service} $stateProvider
   * @param {service} $locationProvider
   * @param {service} $urlRouterProvider
   * 
   * @see Veja [Angular DOC]    {@link https://ui-router.github.io/ng1/} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#routing} Para melhores praticas
   */
  function RouteConfig($stateProvider, $locationProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('placa', {
        controller: 'PlacaController',
        controllerAs: 'placa',
        templateUrl: 'views/placa.html',
        url: '/'
      })
      .state('fipe', {
        controller: 'SemPlacaController',
        controllerAs: 'placa',
        templateUrl: 'views/fipe.html',
        url: '/placa-nao-encontrada'
      })
      .state('cotacao', {
        controller: 'CotacaoController',
        controllerAs: 'cotacao',
        templateUrl: 'views/cotacao.html',
        url: '/cotacao'
      });
  }
})();
(function () {
  'use strict';

  angular
    .module('app')
    .controller('CotacaoController', CotacaoController);

  CotacaoController.$inject = ['$rootScope', '$state', 'rastreadorCarro', 'rastreadorMoto'];

  function CotacaoController($rootScope, $state, rastreadorCarro, rastreadorMoto) {
    var vm = this;

    vm.carregando = true;
    vm.hasRastreador = false;
    vm.preco = {
      basico: 'R$29,90',
      bronze: undefined,
      ouro: undefined,
      prata: undefined
    };
    Activate();

    ////////////////

    function Activate() {
      if (!$rootScope.usuario) {
        $state.go('placa');
      }

      GetPrecos();
    }

    function GetPrecos() {
      var filtro = 'Carro';
      var valores = [];
      var valorFipe = $rootScope.usuario.preco.replace('/R$ ', '');
      valorFipe = valorFipe.replace('/,00', '');
      valorFipe = $filter('number')(valorFipe);

      if ($rootScope.usuario.veiculo === 'AUTOMOVEL') {

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

      $http.get(api + 'preco?filter=veiculo,eq,' + filtro).then(function (resp) {
        valores = php_crud_api_transform(resp.data).preco;

        angular.forEach(valores, function (value, key) {
          if (valorFipe >= $filter('number')(value.min) && valorFipe <= $filter('number')(value.max)) {
            switch (value.plano) {
              case 'Bronze':
                vm.preco.bronze = value.valor;
                break;

              case 'Prata':
                vm.preco.prata = value.valor;
                break;

              case 'Ouro':
                vm.preco.ouro = value.valor;
                break;

              default:
                break;
            }
          }
        });
        vm.carregando = false;
      });
    }
  }
})();
(function () {
  'use strict';

  angular
    .module('app')
    .controller('MainController', MainController);

  MainController.$inject = ['$location', '$anchorScroll'];

  /**
   * @ngdoc main
   * @scope {}
   * @name MainController
   * @memberof app
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @desc Controle principal da cotação.<br>
   * Não há necessidade de criação de mais de um.
   * 
   * @property {object} vm                   - A named variable for the `this` keyword representing the ViewModel
   * @property {json}   consulta             - Armazena os dados para a consulta ao serviço de consulta de placas
   * @property {bool}   vm.carregando        - Controla o display do loading
   * @property {json}   vm.listaCarros       - Lista dos modelos de carros da FIPE
   * @property {json}   vm.listaMotos        - Lista dos modelos de motos da FIPE
   * @property {string} vm.modeloEscolhido - Modelo selecionado (moto ou carro)
   * @property {string} vm.placa             - Armazena a placa do usurário que será consultada
   * @property {string} vm.telefone          - Telefone da multiplicar que aparecerá no html
   * @property {string} vm.usuario.data      - Armazena a data/hora da consulta
   * @property {string} vm.usuario.preco     - Armazena a preço da tabela FIPE
   * @property {string} vm.usuario.modelo    - Armazena o modelo do carro
   * 
   * @param {service} $http             - Usado para fazer requisições. Semelhante ao ajax
   * @param {service} conversorService  - Converte xml para json e json para xml
   * @param {service} $state            - Usado para troca de views
   * @param {service} fipeService       - Consulta na tabela FIPE
   * 
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/controller} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#controllers} Para melhores praticas
   */
  function MainController($location, $anchorScroll) {
    var vm = this;
    var consulta = {
      "xml": {
        "CONSULTA": {
          "ACESSO": {
            "USUARIO": null,
            "SENHA": null
          },
          "VEICULO": {
            "CHASSI": null,
            "UF": null,
            "PLACA": null,
            "RENAVAM": null,
            "MOTOR": null,
            "CRLV": null,
            "UF_CRLV": null
          },
          "DADOSPESSOAIS": {
            "TIPOPESSOARESTRICOES": null,
            "CPFCNPJRESTRICOES": null,
            "DDD1RESTRICOES": null,
            "TEL1RESTRICOES": null,
            "DDD2RESTRICOES": null,
            "TEL2RESTRICOES": null
          },
          "PERMISSOES": {
            "CONTRATOID": null,
            "PACOTEID": null,
            "OPCIONAIS": {
              "Precificador": null
            }
          },
          "CONSULTAID": null,
          "NRCONTROLECLIENTE": null
        }
      }
    };

    vm.adesao = undefined;
    vm.franquia = undefined;
    vm.hasRastreador = false;
    vm.telefone = '0800 000 000';

    //Atribuicao dos metodos no escopo
    vm.Scroll = Scroll;

    Activate();

    ////////////////

    /**
     * @function Activate
     * @desc Setup docontrolador. Exetuca assim que o controlador inicia
     * @memberof MainController
     */
    function Activate() {

    }

    function Scroll(scrollTo) {
      // set the location.hash to the id of
      // the element you wish to scroll to.
      $location.hash(scrollTo);

      // call $anchorScroll()
      $anchorScroll();
    }
  }
})();
(function () {
  'use strict';

  angular
    .module('app')
    .controller('PlacaController', PlacaController);

  PlacaController.$inject = ['$http', 'conversorService', '$state', 'toaster', '$rootScope', 'api'];

  function PlacaController($http, conversorService, $state, toaster, $rootScope, api) {
    var vm = this;
    var consulta = {
      "xml": {
        "CONSULTA": {
          "ACESSO": {
            "USUARIO": null,
            "SENHA": null
          },
          "VEICULO": {
            "CHASSI": null,
            "UF": null,
            "PLACA": null,
            "RENAVAM": null,
            "MOTOR": null,
            "CRLV": null,
            "UF_CRLV": null
          },
          "DADOSPESSOAIS": {
            "TIPOPESSOARESTRICOES": null,
            "CPFCNPJRESTRICOES": null,
            "DDD1RESTRICOES": null,
            "TEL1RESTRICOES": null,
            "DDD2RESTRICOES": null,
            "TEL2RESTRICOES": null
          },
          "PERMISSOES": {
            "CONTRATOID": null,
            "PACOTEID": null,
            "OPCIONAIS": {
              "Precificador": null
            }
          },
          "CONSULTAID": null,
          "NRCONTROLECLIENTE": null
        }
      }
    };

    $rootScope.preco = {
      basico: 'R$29,90',
      bronze: undefined,
      ouro: undefined,
      prata: undefined
    };
    $rootScope.usuario = {
      'data': '',
      'especial': false,
      'modelo': '',
      'preco': '',
      'veiculo': ''
    };

    vm.carregando = false;
    vm.isTaxi = false;
    vm.isUber = false;
    vm.placa = '';
    vm.rejeitados = [];

    vm.GetDadosRequisicao = GetDadosRequisicao;

    Activate();

    ////////////////

    function Activate() {
      GetRejeitados();
    }

    function GetRejeitados() {
      $http.get(api + 'rejeitado').then(function (resp) {
        vm.rejeitados = php_crud_api_transform(resp.data).rejeitado;
      });
    }

    /**
     * @function GetDadosRequisicao
     * @desc Pega os dados para a autorização da consulta, coloca-os no json consulta e depois executa PesquisarPlaca
     * @memberof MainController
     */
    function GetDadosRequisicao() {
      vm.carregando = true;

      /**
       * Pega os dados para fazer a requisição.
       * Eles ficam no PHP para dificultar a visualização de pessoas nao autorizadas.
       */
      $http({
        method: 'GET',
        url: 'php/dados.php'
      }).then(function (resp) {
        consulta.xml.CONSULTA.ACESSO.SENHA = resp.data.senha;
        consulta.xml.CONSULTA.ACESSO.USUARIO = resp.data.usuario;
        consulta.xml.CONSULTA.PERMISSOES.CONTRATOID = resp.data.contrato;
        consulta.xml.CONSULTA.PERMISSOES.PACOTEID = resp.data.pacote;

        PesquisarPlaca(resp.data.url);
      });
    }

    /**
     * @function PesquisarPlaca
     * @desc Armazena a plca do usuario no json consulta, converte json para xml, pois o serviço
     * só aceita xml e envia a requisição.
     * @memberof MainController
     */
    function PesquisarPlaca(url) {
      var xml = '';

      consulta.xml.CONSULTA.VEICULO.PLACA = vm.placa;
      xml = conversorService.Json2Xml(consulta);

      $.get(url + xml, function (data) {
        var codigoConsulta = '';
        var codigoRetornoFipe = '';
        var especieVeiculo = ''; //Usado para verificar se eh taxi
        var fabricante = '';
        var fipe = ''; //Armazena os dados da tabela fipe
        var retorno = $(data).find('string'); // Recebe a resposta do servico
        var veiculo = ''; // usado para ver qual o tipo de veiculo (moto ou carro) 

        retorno = $.parseXML(retorno[0].textContent); // Converte string xml para objeto xml
        codigoConsulta = $(retorno).find('ConsultaID')[0].textContent; //Confirmação que deu tudo ok

        console.log(retorno);

        //Se a consulta falhou envia o usuario para a preencher os dados do carro
        if (codigoConsulta !== '0001') {
          $state.go('fipe');
        }

        $rootScope.usuario.data = $(retorno).find('DataHoraConsulta')[0].textContent; //Armazena a data da consulta

        //Codigo de confirmação de retorno. Se for 1, ha retorno
        codigoRetornoFipe = $(retorno).find('Precificador').find('TabelaFipe').find('CodigoRetorno')[0].textContent;
        veiculo = $(retorno).find('RegistroFederal').find('TipoVeiculo')[0].textContent;
        $rootScope.usuario.veiculo = veiculo;
        especieVeiculo = $(retorno).find('RegistroFederal').find('EspecieVeiculo')[0].textContent;

        //Não da proseguimento se não for moto ou carro
        if (veiculo != 'AUTOMOVEL' && veiculo != 'MOTOCICLETA') {
          vm.carregando = false;
          toaster.pop({
            type: 'error',
            title: 'Atenção!',
            body: 'Tipo de veículo não aceito.',
            timeout: 50000
          });
          return;
        }

        //Verifica se o carro eh taxi
        if (especieVeiculo != 'PASSAGEIRO' && especieVeiculo != 'NAO INFORMADO') {
          vm.carregando = false;
          vm.isTaxi = true;
        }

        //Nao ha dados da tabela fipe. Entao envia o usuario para a preencher os dados do carro
        if (codigoRetornoFipe !== '1') {
          vm.carregando = false;
          $state.go('fipe');
        }

        //Armazena em uma variavel para ficar mais facil a consulta
        fipe = $(retorno).find('Precificador').find('TabelaFipe').find('Registro')[$(retorno).find('Precificador').find('TabelaFipe').find('Registro').length - 1];

        //Armazena os dados relevantes para dar continuidade a cotação
        $rootScope.usuario.modelo = $(fipe).find('Modelo')[0].textContent;
        fabricante = $(fipe).find('Fabricante')[0].textContent;
        $rootScope.usuario.preco = 'R$ ' + $(fipe).find('Valor')[0].textContent + ',00';

        //Verifica se o modelo eh rejeitado
        angular.forEach(vm.rejeitados, function (value, key) {
          var modeloTeste = $rootScope.usuario.modelo;
          var modeloRejeitado = value.Modelo;

          modeloTeste = modeloTeste.toUpperCase();
          modeloRejeitado = modeloRejeitado.toUpperCase();

          if (modeloTeste.includes(modeloRejeitado)) {
            toaster.pop({
              type: 'error',
              title: 'Atenção!',
              body: 'Não fazemos cotação para esse modelo.',
              timeout: 50000
            });
            return;
          }
        });

        if (vm.isUber || vm.isTaxi) {
          $rootScope.usuario.especial = true;
          vm.carregando = false;
          $state.go('cotacao');
        } else {
          $http.get(api + 'importado?filter=nome,eq,' + fabricante).then(function (resp) {
            var retorno = php_crud_api_transform(resp.data).importado;

            if (retorno.length > 0) {
              $rootScope.usuario.especial = true;
            }

            vm.carregando = false;
            $state.go('cotacao');
          });
        }
      });
    }
  }
})();
(function () {
  'use strict';

  angular
    .module('app')
    .controller('SemPlacaController', SemPlacaController);

  SemPlacaController.$inject = ['$http', '$state', 'toaster', '$rootScope', 'fipeService', 'api'];

  function SemPlacaController($http, $state, toaster, $rootScope, fipeService, api) {
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

        $rootScope.usuario.modelo = resp.Modelo;

        console.log(resp);
        $state.go('cotacao');
      });
    }

  }
})();
(function () {
  'use strict';

  angular
    .module('app')
    .service('conversorService', conversorService);

  /**
   * @ngdoc service
   * @scope {}
   * @name conversorService
   * @memberof app
   * @author  Stefan Goessner
   * @license Creative Commons GNU LGPL
   * @version 0.9
   * @desc Faz a transformaÃ§Ã£o entre xml e json
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/services} Para mais informaÃ§Ãµes
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#services} Para melhores praticas
   * @see License               {@link http://creativecommons.org/licenses/LGPL/2.1/}
   * @see Author site           {@link  http://goessner.net/}
   */
  function conversorService() {
    this.Json2Xml = Json2Xml;
    this.Xml2Json = Xml2Json;

    ////////////////

    /**
     * @function Json2Xml
     * @desc Consulta o cep fornecido e retorna os dados do local
     * @param {object} o - javascript object
     * @param {String} tab - tab or indent string for pretty output formatting.Omit or use empty string "" to supress.
     * @return {xml} xml string
     * @memberof conversorService
     */
    function Json2Xml(o, tab) {
      o = angular.fromJson(o);
      var toXml = function (v, name, ind) {
          var xml = "";
          if (v instanceof Array) {
            for (var i = 0, n = v.length; i < n; i++)
              xml += ind + toXml(v[i], name, ind + "\t") + "\n";
          } else if (typeof (v) == "object") {
            var hasChild = false;
            xml += ind + "<" + name;
            for (var m in v) {
              if (m.charAt(0) == "@")
                xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
              else
                hasChild = true;
            }
            xml += hasChild ? ">" : "/>";
            if (hasChild) {
              for (var m in v) {
                if (m == "#text")
                  xml += v[m];
                else if (m == "#cdata")
                  xml += "<![CDATA[" + v[m] + "]]>";
                else if (m.charAt(0) != "@")
                  xml += toXml(v[m], m, ind + "\t");
              }
              xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
            }
          } else {
            xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
          }
          return xml;
        },
        xml = "";
      for (var m in o)
        xml += toXml(o[m], m, "");
      return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
    }

    /**
     * @function String2Object
     * @desc transofrma um xml string em xml object
     * @param {String} xml - xml string
     * @return {xml}
     * @memberof conversorService
     */
    function String2Object(xml) {
      var parseXml;

      if (window.DOMParser) {
        parseXml = function (xmlStr) {
          return (new window.DOMParser()).parseFromString(xmlStr, 'text/xml');
        };
      } else if (typeof window.ActiveXObject != 'undefined' && new window.ActiveXObject('Microsoft.XMLDOM')) {
        parseXml = function (xmlStr) {
          var xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
          xmlDoc.async = 'false';
          xmlDoc.loadXML(xmlStr);
          return xmlDoc;
        };
      } else {
        parseXml = function () {
          return null;
        }
      }

      return parseXml(xml);
    }

    /**
     * @function Xml2Json
     * @desc Consulta o cep fornecido e retorna os dados do local
     * @param {xml} xml - element or document DOM node
     * @param {String} tab - tab or indent string for pretty output formatting.Omit or use empty string "" to supress.
     * @return {json} json string
     * @memberof conversorService
     */
    function Xml2Json(xml, tab) {
      xml = String2Object(xml); //converte de string para objeto
      var X = {
        toObj: function (xml) {
          var o = {};
          if (xml.nodeType == 1) { // element node ..
            if (xml.attributes.length) // element with attributes  ..
              for (var i = 0; i < xml.attributes.length; i++)
                o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
            if (xml.firstChild) { // element has child nodes ..
              var textChild = 0,
                cdataChild = 0,
                hasElementChild = false;
              for (var n = xml.firstChild; n; n = n.nextSibling) {
                if (n.nodeType == 1) hasElementChild = true;
                else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                else if (n.nodeType == 4) cdataChild++; // cdata section node
              }
              if (hasElementChild) {
                if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                  X.removeWhite(xml);
                  for (var n = xml.firstChild; n; n = n.nextSibling) {
                    if (n.nodeType == 3) // text node
                      o["#text"] = X.escape(n.nodeValue);
                    else if (n.nodeType == 4) // cdata node
                      o["#cdata"] = X.escape(n.nodeValue);
                    else if (o[n.nodeName]) { // multiple occurence of element ..
                      if (o[n.nodeName] instanceof Array)
                        o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                      else
                        o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                    } else // first occurence of element..
                      o[n.nodeName] = X.toObj(n);
                  }
                } else { // mixed content
                  if (!xml.attributes.length)
                    o = X.escape(X.innerXml(xml));
                  else
                    o["#text"] = X.escape(X.innerXml(xml));
                }
              } else if (textChild) { // pure text
                if (!xml.attributes.length)
                  o = X.escape(X.innerXml(xml));
                else
                  o["#text"] = X.escape(X.innerXml(xml));
              } else if (cdataChild) { // cdata
                if (cdataChild > 1)
                  o = X.escape(X.innerXml(xml));
                else
                  for (var n = xml.firstChild; n; n = n.nextSibling)
                    o["#cdata"] = X.escape(n.nodeValue);
              }
            }
            if (!xml.attributes.length && !xml.firstChild) o = null;
          } else if (xml.nodeType == 9) { // document.node
            o = X.toObj(xml.documentElement);
          } else
            alert("unhandled node type: " + xml.nodeType);
          return o;
        },
        toJson: function (o, name, ind) {
          var json = name ? ("\"" + name + "\"") : "";
          if (o instanceof Array) {
            for (var i = 0, n = o.length; i < n; i++)
              o[i] = X.toJson(o[i], "", ind + "\t");
            json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
          } else if (o == null)
            json += (name && ":") + "null";
          else if (typeof (o) == "object") {
            var arr = [];
            for (var m in o)
              arr[arr.length] = X.toJson(o[m], m, ind + "\t");
            json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
          } else if (typeof (o) == "string")
            json += (name && ":") + "\"" + o.toString() + "\"";
          else
            json += (name && ":") + o.toString();
          return json;
        },
        innerXml: function (node) {
          var s = ""
          if ("innerHTML" in node)
            s = node.innerHTML;
          else {
            var asXml = function (n) {
              var s = "";
              if (n.nodeType == 1) {
                s += "<" + n.nodeName;
                for (var i = 0; i < n.attributes.length; i++)
                  s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                if (n.firstChild) {
                  s += ">";
                  for (var c = n.firstChild; c; c = c.nextSibling)
                    s += asXml(c);
                  s += "</" + n.nodeName + ">";
                } else
                  s += "/>";
              } else if (n.nodeType == 3)
                s += n.nodeValue;
              else if (n.nodeType == 4)
                s += "<![CDATA[" + n.nodeValue + "]]>";
              return s;
            };
            for (var c = node.firstChild; c; c = c.nextSibling)
              s += asXml(c);
          }
          return s;
        },
        escape: function (txt) {
          return txt.replace(/[\\]/g, "\\\\")
            .replace(/[\"]/g, '\\"')
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r');
        },
        removeWhite: function (e) {
          e.normalize();
          for (var n = e.firstChild; n;) {
            if (n.nodeType == 3) { // text node
              if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                var nxt = n.nextSibling;
                e.removeChild(n);
                n = nxt;
              } else
                n = n.nextSibling;
            } else if (n.nodeType == 1) { // element node
              X.removeWhite(n);
              n = n.nextSibling;
            } else // any other node
              n = n.nextSibling;
          }
          return e;
        }
      };
      if (xml.nodeType == 9) // document node
        xml = xml.documentElement;
      var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
      return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
    }
  }
})();
(function () {
  'use strict';
  angular
    .module('app')
    .factory('fipeService', fipeService);

  fipeService.$inject = ['$q'];

  /**
   * @memberof app
   * @ngdoc factory
   * @name fipeService
   * @author Leo Brescia <leonardo@leobrescia.com.br>
   * @param {service} $q - promise
   * @desc Serviço de consulta da tabela fipe
   * @see Veja [Angular DOC]    {@link https://docs.angularjs.org/guide/providers#factory-recipe} Para mais informações
   * @see Veja [John Papa DOC]  {@link https://github.com/johnpapa/angular-styleguide/tree/master/a1#factories} Para melhores praticas
   */
  function fipeService($q) {
    var url = 'https://fipe-parallelum.rhcloud.com/api/v1/';

    return {
      Consultar: Consultar,
      GetCarros: GetCarros,
      GetMotos: GetMotos
    };

    /**
     * @function Consultar
     * @desc Consulta a tabela fipe
     * @see {@link https://fipeapi.appspot.com/}
     * @param {String} endpoint - final da consulta ao serviço
     * @memberof fipeService
     */
    function Consultar(endpoint) {
      var deferred = $q.defer();

      var call = $.ajax({
        url: url + endpoint
      });

      call.then(function successCallback(response) {
        deferred.resolve(response);
      }, function errorCallback(response) {
        deferred.reject(arguments);
      });

      return deferred.promise;
    }

    function GetCarros() {
      var deferred = $q.defer();

      var call = $.ajax({
        url: url + 'carros/marcas'
      });

      call.then(function successCallback(response) {
        deferred.resolve(response);
      }, function errorCallback(response) {
        deferred.reject(arguments);
      });

      return deferred.promise;
    }

    function GetMotos() {
      var deferred = $q.defer();

      var call = $.ajax({
        url: url + 'motos/marcas'
      });

      call.then(function successCallback(response) {
        deferred.resolve(response);
      }, function errorCallback(response) {
        deferred.reject(arguments);
      });

      return deferred.promise;
    }
  }
}());