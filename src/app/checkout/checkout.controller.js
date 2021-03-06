(function () {
  'use strict';

  angular
    .module('app')
    .controller('CheckoutController', CheckoutController);

  CheckoutController.$inject = ['$filter', '$http', '$rootScope', '$state', 'api', 'consultCEP', 'conversorService', 'PagSeguroDirectPayment', 'projectDev', 'toaster'];

  function CheckoutController($filter, $http, $rootScope, $state, api, consultCEP, conversorService, PagSeguroDirectPayment, projectDev, toaster) {
    var vm = this;
    var token = '';
    var requisicao = {
      'email': '',
      'token': '',
      'paymentMode': 'default',
      'paymentMethod': 'creditCard',
      'receiverEmail': '',
      'currency': 'BRL',
      'extraAmount': '',
      'itemId1': '',
      'itemDescription1': '',
      'itemAmount1': '',
      'itemQuantity1': '1',
      'notificationURL': '',
      'reference': '',
      'senderName': '',
      'senderCPF': '',
      'senderAreaCode': '',
      'senderPhone': '',
      'senderEmail': '',
      'senderHash': '',
      'shippingAddressStreet': '',
      'shippingAddressNumber': '',
      'shippingAddressComplement': '',
      'shippingAddressDistrict': '',
      'shippingAddressPostalCode': '',
      'shippingAddressCity': '',
      'shippingAddressState': '',
      'shippingAddressCountry': 'BRA',
      'shippingType': '',
      'shippingCost': '',
      'creditCardToken': '',
      'installmentQuantity': '1',
      'installmentValue': '',
      'creditCardHolderName': '',
      'creditCardHolderCPF': '',
      'creditCardHolderBirthDate': '',
      'creditCardHolderAreaCode': '',
      'creditCardHolderPhone': '',
      'billingAddressStreet': '',
      'billingAddressNumber': '',
      'billingAddressComplement': '',
      'billingAddressDistrict': '',
      'billingAddressPostalCode': '',
      'billingAddressCity': '',
      'billingAddressState': '',
      'billingAddressCountry': 'BRA'
    };
    var requisicaoBoleto = {
      'email': '',
      'token': '',
      'paymentMode': 'default',
      'paymentMethod': 'boleto',
      'receiverEmail': '',
      'currency': 'BRL',
      'extraAmount': '',
      'itemId1': '',
      'itemDescription1': '',
      'itemAmount1': '',
      'itemQuantity1': '1',
      'notificationURL': '',
      'reference': '',
      'senderName': '',
      'senderCPF': '',
      'senderAreaCode': '',
      'senderPhone': '',
      'senderEmail': '',
      'senderHash': '',
      'shippingAddressStreet': '',
      'shippingAddressNumber': '',
      'shippingAddressComplement': '',
      'shippingAddressDistrict': '',
      'shippingAddressPostalCode': '',
      'shippingAddressCity': '',
      'shippingAddressState': '',
      'shippingAddressCountry': 'BRA',
      'shippingType': '',
      'shippingCost': ''
    };

    vm.acceptedCreditCard = [];
    vm.aniversario = '';
    vm.carregando = true;
    vm.cardDados = {
      'cardNumber': '',
      'brand': '',
      'cvv': '',
      'expirationMonth': '',
      'expirationYear': '',
      'success': '',
      'error': ''
    };
    vm.cardToken = '';
    vm.expericaoCartao = '';
    vm.hasBrand = false;
    vm.hasPaid = false;
    vm.imgBrand = '';
    vm.usuario = {
      'bairro': '',
      'cep': '',
      'cidade': '',
      'complemento': '',
      'cpf': '',
      'email': '',
      'estado': '',
      'logradouro': '',
      'nome': '',
      'numero': '',
      'telefone': ''
    };
    vm.validador = undefined;

    vm.CreateCardToken = CreateCardToken;
    vm.GetBrand = GetBrand;
    vm.GetCep = GetCep;
    vm.PagarBoleto = PagarBoleto;

    Activate();

    ////////////////

    function Activate() {
      if (!$rootScope.usuario) {
        $state.go('placa');
      } else {
        GetDadosUsuario();
        console.log('Globais => ', $rootScope);

        $http.get(projectDev + 'php/getID.php').then(function (resp) {
          var retorno = $.parseXML(resp.data);
          token = $(retorno).find('id')[0].textContent || null;

          console.log('Retorno => ', retorno);
          console.log('ID =>', token);

          if (token) {
            vm.carregando = false;
            PagSeguroDirectPayment.setSessionId(token);
            GetMeiosPagamento();
          } else {
            console.warn('Pagseguro retornou null');

            toaster.pop({
              type: 'error',
              title: 'Erro #801',
              body: 'N??o foi poss??vel completar a requisi????o.',
              timeout: 50000
            });
          }
        }).catch(function (error) {
          toaster.pop({
            type: 'error',
            title: 'Erro #702',
            body: 'N??o foi poss??vel completar a requisi????o.',
            timeout: 50000
          });
          console.warn('Erro ao buscar dados do pagseguro = >' + error);
        });
      }

    }

    function CheckErros(erros) {
      var lista = [];
      erros = conversorService.Xml2Json(erros);
      erros = erros.replace('undefined', '');
      erros = JSON.parse(erros);

      angular.forEach(erros.errors.error, function (value, key) {
        if (!lista.includes(value.code)) {
          switch (value.code) {
            case '53019' || '53050':
              toaster.pop({
                type: 'error',
                title: 'Erro ao enviar os dados',
                body: 'DDD inv??lido.',
                timeout: 50000
              });
              lista.push('53019');
              lista.push('53050');
              break;
            case '53122':
              toaster.pop({
                type: 'error',
                title: 'Erro ao enviar os dados',
                body: 'E-mail inv??lido.',
                timeout: 50000
              });
              lista.push('53122');
              break;
            case '5003':
              toaster.pop({
                type: 'error',
                title: 'Erro ao enviar os dados',
                body: 'Falha de comunica????o com a institui????o financeira.',
                timeout: 50000
              });
              lista.push('5003');
              break;
            case '10001':
              toaster.pop({
                type: 'error',
                title: 'Erro ao enviar os dados',
                body: 'N??mero do cart??o de cr??dito inv??lido.',
                timeout: 50000
              });
              lista.push('10001');
              break;
            case '10002':
              toaster.pop({
                type: 'error',
                title: 'Erro ao enviar os dados',
                body: 'Data inv??lida',
                timeout: 50000
              });
              lista.push('10002');
              break;
            case '53010' || '53011' || '53012':
              toaster.pop({
                type: 'error',
                title: 'Erro ao enviar os dados',
                body: 'E-mail inv??lido',
                timeout: 50000
              });
              lista.push('53011');
              lista.push('53012');
              lista.push('53010');
              break;

            case '53034' || '53065':
              toaster.pop({
                type: 'error',
                title: 'Erro ao enviar os dados',
                body: 'Estado inv??lido.',
                timeout: 50000
              });
              lista.push('53034');
              lista.push('53065');
              break;
            case '53015' || '53044':
              toaster.pop({
                type: 'error',
                title: 'Erro ao enviar os dados',
                body: 'Por favor, digite o nome completo.',
                timeout: 50000
              });
              lista.push('53015');
              lista.push('53044');
              break;
            case '53046' || '53017':
              toaster.pop({
                type: 'error',
                title: 'Erro ao enviar os dados',
                body: 'Por favor, digite um CPF v??lido',
                timeout: 50000
              });
              lista.push('53046');
              lista.push('53017');
              break;
            default:
              toaster.pop({
                type: 'error',
                title: 'Erro ao enviar os dados',
                body: 'Verifique os dados e tente novamente. Em caso de d??vidas, por favor, entre em contato com a gente.',
                timeout: 50000
              });
              break;
          }
        }
      });
      vm.carregando = false;
    }

    function CreateCardToken() {
      vm.carregando = true;

      vm.cardDados.expirationMonth = $filter('date')(vm.expericaoCartao, 'MM');
      vm.cardDados.expirationYear = $filter('date')(vm.expericaoCartao, 'yyyy');

      console.log('Dados do cartao =>', vm.cardDados);

      vm.cardDados.success = function (resp) {
        console.log('CreateCardToken =>', resp);

        requisicao.creditCardToken = resp.card.token;
        PagarCreditCard();
      };
      vm.cardDados.error = function (resp) {
        vm.carregando = false;
        console.warn('CreateCardToken =>', resp);

        toaster.pop({
          type: 'error',
          title: 'Erro com o cart??o',
          body: 'Cart??o inv??lido.',
          timeout: 50000
        });
      };

      console.log('Dados do cartao =>', vm.cardDados);
      PagSeguroDirectPayment.createCardToken(vm.cardDados);
    }

    function EnviarEmail() {
      // TODO: Enviar email de confirmacao de pagamento
    }

    function GetBrand() {
      if (vm.cardDados.cardNumber.length >= 6) {
        PagSeguroDirectPayment.getBrand({
          cardBin: vm.cardDados.cardNumber,
          success: function (resp) {
            console.log('Brand => ', resp);

            /**
             * O nome do cartao eh importante para saber se ele eh aceitou ou nao
             * O nome do cartao na lista acceptedCreditCard esta em uppercase
             * Portanto eh preciso alterar o nome
             */
            var cartaoNome = resp.brand.name;
            cartaoNome = cartaoNome.toUpperCase();
            vm.cardDados.brand = resp.brand.name;

            console.log('Brand name => ', cartaoNome);

            // Verifica se essa cartao eh aceito pelo Pagseguro
            var cartaoValid = vm.acceptedCreditCard[cartaoNome].status;
            console.log(' Status Cartao  => ', cartaoValid);

            if (cartaoValid === 'AVAILABLE') {
              console.info('Cartao Valido');

              vm.hasBrand = true; // Mostra os campos restantes do cartao
              vm.imgBrand = {
                'background-image': 'url(https://stc.pagseguro.uol.com.br' + vm.acceptedCreditCard[cartaoNome].images.MEDIUM.path + ')'
              }; // Imagem do cartao
              vm.validador = resp.brand; // Configuracoes dos inputs de data e codigo de seguranca
            } else {
              vm.hasBrand = false;
            }
          },
          error: function (resp) {
            vm.hasBrand = false;
            toaster.pop({
              type: 'error',
              title: 'Erro #801',
              body: 'N??o foi poss??vel completar a requisi????o.',
              timeout: 50000
            });
            console.warn('Erro ao pegar o brand => ', resp);
          }
        });
      }
    }

    function GetCep() {
      if (vm.usuario.cep.length > 10) {
        consultCEP.consultar(vm.usuario.cep).then(function (resp) {
          console.log('CEP =>', resp);
          vm.usuario.bairro = resp.bairro;
          vm.usuario.cidade = resp.cidade;
          vm.usuario.estado = resp.estado;
          vm.usuario.logradouro = resp.logradouro;
        }).catch(function (error) {
          console.warn('Erro no cep = >', error);
        });
      }
    }

    function GetDadosUsuario() {
      vm.usuario = {
        'bairro': $rootScope.usuario.bairro,
        'cep': $rootScope.usuario.cep,
        'cidade': $rootScope.usuario.cidade,
        'complemento': $rootScope.usuario.complemento,
        'cpf': $rootScope.usuario.cpf,
        'email': $rootScope.usuario.email,
        'estado': $rootScope.usuario.estado,
        'logradouro': $rootScope.usuario.logradouro,
        'nome': $rootScope.usuario.nome,
        'numero': $rootScope.usuario.numero,
        'telefone': $rootScope.usuario.telefone
      };
    }

    function GetMeiosPagamento() {
      PagSeguroDirectPayment.getPaymentMethods({
        amount: 100,
        success: function (response) {
          //meios de pagamento dispon??veis  
          console.log('Meios de pagamento =>', response);
          vm.acceptedCreditCard = response.paymentMethods.CREDIT_CARD.options;
        },
        error: function (response) {
          console.warn('Erro ao pegar os meios de pagamento => ', response);
          toaster.pop({
            type: 'error',
            title: 'Erro #801',
            body: 'N??o foi poss??vel completar a requisi????o.',
            timeout: 50000
          });
        }
      });
    }

    function PagarBoleto() {
      var tel = vm.usuario.telefone;

      // Dados do plano
      requisicaoBoleto.itemId1 = $rootScope.usuario.idProduto;
      requisicaoBoleto.itemDescription1 = 'Ades??o do plano ' + $rootScope.usuario.plano + '. Para o modelo ' + $rootScope.usuario.modelo;
      requisicaoBoleto.itemAmount1 = ($filter('number')($rootScope.usuario.vlorAdesao, 2)).replace(',', '.');
      requisicaoBoleto.reference = $rootScope.usuario.idProduto;

      // Dados do comprador
      requisicaoBoleto.senderName = vm.usuario.nome;
      requisicaoBoleto.senderCPF = vm.usuario.cpf;
      requisicaoBoleto.senderAreaCode = tel.substring(0, 2);
      requisicaoBoleto.senderPhone = tel.slice(2);
      requisicaoBoleto.senderEmail = vm.usuario.email;
      requisicaoBoleto.senderHash = PagSeguroDirectPayment.getSenderHash();

      //Endereco
      requisicaoBoleto.shippingAddressStreet = vm.usuario.logradouro;
      requisicaoBoleto.shippingAddressNumber = vm.usuario.numero;
      requisicaoBoleto.shippingAddressComplement = vm.usuario.complemento;
      requisicaoBoleto.shippingAddressDistrict = vm.usuario.bairro;
      requisicaoBoleto.shippingAddressPostalCode = vm.usuario.cep;
      requisicaoBoleto.shippingAddressCity = vm.usuario.cidade;
      requisicaoBoleto.shippingAddressState = vm.usuario.estado.toUpperCase();

      console.log('Requisisao Boleto => ', requisicaoBoleto);

      $http({
        method: 'POST',
        headers: {
          'Content-Type': 'charset=ISO-8859-1'
        },
        data: requisicaoBoleto,
        url: projectDev + 'php/pagar.php'
      }).then(function (resp) {
        var retorno = $.parseXML(resp.data);
        console.log('Resposta pagamento boleto =>', resp);
        console.log(retorno);

        var transacao = {
          'idProduto': $rootScope.usuario.idProduto,
          'idRegiao': $rootScope.usuario.idRegiao,
          'idAfiliado': $rootScope.usuario.idAfiliado || null,
          'codigo': '',
          'cadastro': '',
          'pagamento': '',
          'status': ''
        };
        var erros = $(retorno).find('errors').find('error') || null;

        if (erros.length > 0) {
          console.warn('Erros => ', erros);
          CheckErros(resp.data);
        } else {
          var status = '';
          var hoje = new Date();
          var pagamento = '';

          switch ($(retorno).find('transaction').find('status')[0].textContent) {
            case '1':
              status = 'Aguardando pagamento';
              break;
            case '2':
              status = 'Em an??lise';
              break;
            case '3':
              status = 'Paga';
              $http.post('php/emailTransacao.php', {
                'id': $(retorno).find('transaction').find('reference')[0].textContent
              });
              break;
            case '4':
              status = 'Dispon??vel';
              break;
            case '5':
              status = 'Em disputa';
              break;
            case '6':
              status = 'Devolvida';
              break;
            case '7':
              status = 'Cancelada';
              break;
            case '8':
              status = 'Debitado';
              break;
            case '9':
              status = 'Reten????o tempor??ria';
              break;
            default:
              break;
          }

          switch ($(retorno).find('transaction').find('paymentMethod').find('type')[0].textContent) {
            case '1':
              pagamento = 'Cart??o de cr??dito';
              break;
            case '2':
              pagamento = 'Boleto';
              break;
            default:
              break;
          }

          transacao.codigo = $(retorno).find('transaction').find('code')[0].textContent || null;
          transacao.cadastro = $filter('date')(hoje, 'yyyy-MM-dd HH:mm:ss', '+0300');
          transacao.pagamento = pagamento;
          transacao.status = status;

          $http.post(api + 'transacao', transacao).then(function (resp) {
            vm.carregando = false;
            vm.hasPaid = true;
          }).catch(function (error) {
            vm.carregando = false;
            vm.hasPaid = true;
            //TODO: Enviar um email para o admin avisando
            console.warn('Erro ao salvar no BD = >' + error);
          });
        }
      }).catch(function (error) {
        vm.carregando = false;
        toaster.pop({
          type: 'error',
          title: 'Pagamento n??o realizado #801',
          body: 'Erro ao realizar o pagamento. Por favor,tente novamente mais tarde.',
          timeout: 50000
        });
        console.warn('Erro ao pagar = >' + error);
      });
    }

    function PagarCreditCard() {
      var tel = vm.usuario.telefone;

      // Dados do plano
      requisicao.itemId1 = $rootScope.usuario.idProduto;
      requisicao.itemDescription1 = 'Ades??o do plano ' + $rootScope.usuario.plano + '. Para o modelo ' + $rootScope.usuario.modelo;
      requisicao.itemAmount1 = requisicao.installmentValue = ($filter('number')($rootScope.usuario.vlorAdesao, 2)).replace(',', '.');
      requisicao.reference = $rootScope.usuario.idProduto;

      // Dados do comprador
      requisicao.senderName = requisicao.creditCardHolderName = vm.usuario.nome;
      requisicao.senderCPF = requisicao.creditCardHolderCPF = vm.usuario.cpf;
      requisicao.senderAreaCode = requisicao.creditCardHolderAreaCode = tel.substring(0, 2);
      requisicao.senderPhone = requisicao.creditCardHolderPhone = tel.slice(2);
      requisicao.senderEmail = vm.usuario.email;
      requisicao.senderHash = PagSeguroDirectPayment.getSenderHash();
      requisicao.creditCardHolderBirthDate = $filter('date')(vm.aniversario, 'dd/MM/yyyy');

      //Endereco
      requisicao.shippingAddressStreet = requisicao.billingAddressStreet = vm.usuario.logradouro;
      requisicao.shippingAddressNumber = requisicao.billingAddressNumber = vm.usuario.numero;
      requisicao.shippingAddressComplement = requisicao.billingAddressComplement = vm.usuario.complemento;
      requisicao.shippingAddressDistrict = requisicao.billingAddressDistrict = vm.usuario.bairro;
      requisicao.shippingAddressPostalCode = requisicao.billingAddressPostalCode = vm.usuario.cep;
      requisicao.shippingAddressCity = requisicao.billingAddressCity = vm.usuario.cidade;
      requisicao.shippingAddressState = requisicao.billingAddressState = vm.usuario.estado.toUpperCase();

      console.log('Requisisao => ', requisicao);

      $http({
        method: 'POST',
        headers: {
          'Content-Type': 'charset=ISO-8859-1'
        },
        data: requisicao,
        url: projectDev + 'php/pagar.php'
      }).then(function (resp) {
        var retorno = $.parseXML(resp.data);
        console.log('Resposta pagamento cartao =>', resp);
        console.log(retorno);

        var transacao = {
          'idProduto': $rootScope.usuario.idProduto,
          'idRegiao': $rootScope.usuario.idRegiao,
          'idAfiliado': $rootScope.usuario.idAfiliado || null,
          'codigo': '',
          'cadastro': '',
          'pagamento': '',
          'status': ''
        };
        var erros = $(retorno).find('errors').find('error') || null;

        if (erros.length > 0) {
          console.warn('Erros => ', erros);
          CheckErros(resp.data);
        } else {
          var status = '';
          var hoje = new Date();
          var pagamento = '';

          switch ($(retorno).find('transaction').find('status')[0].textContent) {
            case '1':
              status = 'Aguardando pagamento';
              break;
            case '2':
              status = 'Em an??lise';
              break;
            case '3':
              status = 'Paga';
              $http.post('php/emailTransacao.php', {
                'id': $(retorno).find('transaction').find('reference')[0].textContent
              });
              break;
            case '4':
              status = 'Dispon??vel';
              break;
            case '5':
              status = 'Em disputa';
              break;
            case '6':
              status = 'Devolvida';
              break;
            case '7':
              status = 'Cancelada';
              break;
            case '8':
              status = 'Debitado';
              break;
            case '9':
              status = 'Reten????o tempor??ria';
              break;
            default:
              break;
          }

          switch ($(retorno).find('transaction').find('paymentMethod').find('type')[0].textContent) {
            case '1':
              pagamento = 'Cart??o de cr??dito';
              break;
            case '2':
              pagamento = 'Boleto';
              break;
            default:
              break;
          }


          transacao.codigo = $(retorno).find('transaction').find('code')[0].textContent || null;
          transacao.criacao = $filter('date')(hoje, 'yyyy-MM-dd HH:mm:ss', '+0300');
          transacao.pagamento = pagamento;
          transacao.status = status;

          $http.post(api + 'transacao', transacao).then(function (resp) {
            vm.carregando = false;
            vm.hasPaid = true;
          }).catch(function (error) {
            vm.carregando = false;
            vm.hasPaid = true;
            //TODO: Enviar um email para o admin avisando
            console.warn('Erro ao salvar no BD = >' + error);
          });
        }
      }).catch(function (error) {
        vm.carregando = false;
        toaster.pop({
          type: 'error',
          title: 'Pagamento n??o realizado #801',
          body: 'Erro ao realizar o pagamento. Por favor,tente novamente mais tarde.',
          timeout: 50000
        });
        console.warn('Erro ao pagar = >' + error);
      });
    }
  }
})();