(function () {
  'use strict';

  angular
    .module('app')
    .controller('CheckoutController', CheckoutController);

  CheckoutController.$inject = ['$http', 'projectDev', 'PagSeguroDirectPayment', 'toaster', 'conversorService', 'consultCEP'];

  function CheckoutController($http, projectDev, PagSeguroDirectPayment, toaster, conversorService, consultCEP) {
    var vm = this;
    var token = '';
    var requisicao = {
      'payment': {
        'mode': 'default',
        'method': 'creditCard',
        'sender': {
          'name': '',
          'email': '',
          'phone': {
            'areaCode': '',
            'number': ''
          },
          'documents': {
            'document': {
              'type': 'CPF',
              'value': ''
            },
            '#text': ''
          },
          'hash': 'abc1234'
        },
        'currency': 'BRL',
        'notificationURL': '',
        'items': {
          'item': {
            'id': '1',
            'description': 'Descricao do item a ser vendido',
            'quantity': '1',
            'amount': '1.00'
          }
        },
        'extraAmount': '0.00',
        'reference': 'R123456',
        'shipping': {
          'address': {
            'street': '',
            'number': '',
            'complement': '',
            'district': '',
            'city': '',
            'state': '',
            'country': 'BRA',
            'postalCode': ''
          },
          'type': '3',
          'cost': '0.00'
        },
        '#text': ' 1',
        'creditCard': {
          'token': '',
          'installment': {
            'quantity': '1',
            'value': '5.50'
          },
          'holder': {
            'name': '',
            'documents': {
              'document': {
                'type': 'CPF',
                'value': ''
              }
            },
            'birthDate': '',
            'phone': {
              'areaCode': '',
              'number': ''
            }
          },
          'billingAddress': {
            'street': '',
            'number': '',
            'complement': '',
            'district': '',
            'city': '',
            'state': '',
            'country': '',
            'postalCode': ''
          }
        }
      }
    };

    vm.acceptedCreditCard = [];
    vm.carregando = true;
    vm.cardDados = {
      'cardNumber': '',
      'brand': '',
      'cvv': '',
      'expirationMonth': '',
      'expirationYear': '',
      'success': function (resp) {
        console.log(resp);
      },
      'error': function (resp) {
        console.log(resp);
      }
    };
    vm.cartaoNumberMax = 10;
    vm.dataCartao = '';
    vm.expericaoCartao = '';
    vm.hasBrand = false;
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

    Activate();

    ////////////////

    function Activate() {
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
            title: 'Erro ao conectar com o servidor',
            body: 'Não foi possível completar a requisição.',
            timeout: 50000
          });
        }
      }).catch(function (error) {

        toaster.pop({
          type: 'error',
          title: 'Erro ao conectar com o servidor',
          body: 'Não foi possível completar a requisição.',
          timeout: 50000
        });
        console.warn('Erro ao buscar dados do pagseguro = >' + error);
      });

    }

    function CreateCardToken() {}

    function EnviarEmail() {
      // TODO: Enviar email de confirmacao de pagamento
    }

    function GetBrand() {
      if (vm.cardDados.cardNumber.length > 7) {
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

            console.log('Brand name => ', cartaoNome);

            // Verifica se essa cartao eh aceito pelo Pagseguro
            var cartaoValid = vm.acceptedCreditCard[cartaoNome].status;
            console.log(' Status Cartao  => ', cartaoValid);

            if (cartaoValid === 'AVAILABLE') {
              console.info('Cartao Valido');

              vm.cartaoNumberMax = resp.brand.config.acceptedLengths['0']; // Limita o numero de digitos do input do cartao
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

    function GetMeiosPagamento() {
      PagSeguroDirectPayment.getPaymentMethods({
        amount: 100,
        success: function (response) {
          //meios de pagamento disponíveis  
          console.log('Meios de pagamento =>', response);
          vm.acceptedCreditCard = response.paymentMethods.CREDIT_CARD.options;
        },
        error: function (response) {
          console.warn('Erro ao pegar os meios de pagamento => ', response);
          //tratamento do erro  
        }
      });
    }

    function PagarCreditCard() {

    }
  }
})();