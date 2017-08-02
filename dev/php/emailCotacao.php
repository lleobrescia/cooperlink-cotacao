<?php
  $data     = json_decode(file_get_contents('php://input'), true); //Recebe JSON
  $stop_date = new DateTime();
  $stop_date->modify('+3 day');

  $valorAdesaAdesao = $data["adesao"];
  $check            = $data["check"];
  $franquia         = $data["franquia"];
  $modelo           = $data["modelo"];
  $valorBronze      = $data["valorBronze"];
  $valorCarro       = $data["valorCarro"];
  $valorOuro        = $data["valorOuro"];
  $valorPrata       = $data["valorPrata"];
  $to               = $data["to"];
  $subject          = "Sua Cotação [ Multiplicar Brasil ]";

  $headers  = 'MIME-Version: 1.0' . "\r\n";
  $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
  $headers .= "From: Moto Fest Oficina <contato@multiplicarbrasil.com.br>" . "\r\n";

  $corpo = '<div style="background-color: #f4f4f4; width: 100%; padding-top: 30px; padding-bottom: 30px;">
  <table cellpadding="0" cellspacing="0" style="width: 600px;padding-left: 20px;padding-right: 20px;padding-bottom: 50px;margin-left:auto;margin-right:auto;background-color: white;">
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" align="center" bgcolor="#1a4783" style="width: 600px">
          <tr>
            <td style="height: 104px;" align="center">
              <a href="http://multiplicarbrasil.com.br/" title="Multiplicar Brasil" target="_blank"> <img src="https://multiplicarbrasil.com.br/images/multiplicar-brasil.png" alt="Multiplicar Brasil"> </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px">
          <tr>
            <td align="center" style="height: 101px;font-size:16px; line-height: 2;color:#41434c "> Aqui está a sua cotação para seu '.$modelo.'  <br>Avaliado em <span style="color:#41c4ec;font-weight: 800;">'.$valorCarro.'</span>              segundo a tabela FIPE </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px; height: 94px;border: solid thin #dbdbdc;border-radius: 5px;margin-bottom: 20px;padding: 17px 0;">
          <tr>
            <td style="width: 91px; font-weight: bold; color:#41434c;font-size: 18px; padding-left: 20px;"> Plano <br>Básico </td>
            <td style="width: 250px;color:#41434c;border-left:dotted 1px #ddddde;padding-left: 20px;"> 13 Assistências </td>
            <td style="width: 160px; color:#41434c;font-weight: bold;border-left:dotted 1px #ddddde;padding-left: 20px;">
              Mensalidade <br><span style="color:#82ca70;font-size:24px;font-weight: bold">R$ 29,00</span> </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px; height: 94px;border: solid thin #dbdbdc;border-radius: 5px;margin-bottom: 20px;padding: 17px 0;">
          <tr>
            <td style="width: 91px; font-weight: bold; color:#41434c;font-size: 18px; padding-left: 20px;"> Plano <br>Bronze </td>
            <td style="width: 250px;color:#41434c; border-left:dotted 1px #ddddde;padding-left: 20px;">
              13 Assistências <br><br>6 Coberturas <br><br>300 Km Reboque </td>
            <td style="width: 160px; color:#41434c;font-weight: bold;border-left:dotted 1px #ddddde;padding-left: 20px;">
              Mensalidade <br><span style="color:#82ca70;font-size:24px;font-weight: bold">'.$valorBronze.'</span> </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px; height: 94px;border: solid thin #dbdbdc;border-radius: 5px;margin-bottom: 20px;padding: 17px 0;">
          <tr>
            <td style="width: 91px; font-weight: bold; color:#41434c;font-size: 18px; padding-left: 20px;"> Plano <br>Prata </td>
            <td style="width: 250px;color:#41434c;border-left:dotted 1px #ddddde;padding-left: 20px; "> 13 Assistências <br><br>6 Coberturas <br><br>1000 Km Reboque </td>
            <td style="width: 160px; color:#41434c;font-weight: bold;border-left:dotted 1px #ddddde;padding-left: 20px;">
              Mensalidade <br><span style="color:#82ca70;font-size:24px;font-weight: bold">'.$valorPrata.'</span> </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px; height: 94px;border: solid thin #dbdbdc;border-radius: 5px;margin-bottom: 20px;padding: 17px 0;">
          <tr>
            <td style="width: 91px; font-weight: bold; color:#41434c;font-size: 18px; padding-left: 20px;"> Plano <br>Ouro </td>
            <td style="width: 250px;color:#41434c; border-left:dotted 1px #ddddde;padding-left: 20px;"> 13 Assistências <br><br>6 Coberturas <br><br>1000 Km Reboque <br><br>7 dias de carro reserva <br><br>Faróis,
              lanternas, vidros e retrovisores <br><br></td>
            <td style="width: 160px; color:#41434c;font-weight: bold;border-left:dotted 1px #ddddde;padding-left: 20px;">
              Mensalidade <br><span style="color:#82ca70;font-size:24px;font-weight: bold">'.$valorOuro.'</span> </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px;height: 100px; ">
          <tr>
            <td valign="top"> Adesão <span style="font-weight:bold">R$'.$valorAdesaAdesao.',00</span> </td>
            '.$restreadorEmail.'
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px;height: 50px; ">
          <tr>
            <td align="center" valign="top">
              <h2 style="font-size:30px">6 Coberturas</h2>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px;">
          <tr style="height: 40px;">
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Colisões </td>
            <td align="right" style="border-bottom:dotted 1px #ddddde;"> <span style="color:#41c4ec; font-size:16px;">Indenização de 100% da tabela FIPE</span> </td>
          </tr>
          <tr style="height: 40px;">
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Perda total </td>
            <td align="right" style="border-bottom:dotted 1px #ddddde;"> <span style="color:#41c4ec; font-size:16px;">Indenização de 100% da tabela FIPE</span> </td>
          </tr>
          <tr style="height: 40px;">
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Roubo e furto </td>
            <td align="right" style="border-bottom:dotted 1px #ddddde;"> <span style="color:#41c4ec; font-size:16px;">Indenização de 100% da tabela FIPE</span> </td>
          </tr>
          <tr style="height: 40px;">
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Incêndio </td>
            <td align="right" style="border-bottom:dotted 1px #ddddde;"> <span style="color:#41c4ec; font-size:16px;">Indenização de 100% da tabela FIPE</span> </td>
          </tr>
          <tr style="height: 40px;">
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Alagamento e eventos da natureza </td>
            <td align="right" style="border-bottom:dotted 1px #ddddde;"> <span style="color:#41c4ec; font-size:16px;">Indenização de 100% da tabela FIPE</span> </td>
          </tr>
          <tr style="height: 40px;">
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Danos corporais a terceiros </td>
            <td align="right" style="border-bottom:dotted 1px #ddddde;"> <span style="color:#41c4ec; font-size:16px;">R$ 30.000,00</span> </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px;height: 100px; padding-top:20px">
          <tr>
            <td valign="top"> Franquia do carro '+$franquia+'  </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px;height: 50px; ">
          <tr>
            <td align="center" valign="top">
              <h2 style="font-size:30px">13 Assistências</h2>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px;">
          <tr style="height: 40px;">
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Assistência 24 horas </td>
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> 300 km de reboque </td>
          </tr>
          <tr style="height: 40px;">
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Atendimento em todo Brasil </td>
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Pane elétrica e mecânica </td>
          </tr>
          <tr style="height: 40px;">
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Auxílio combustível </td>
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Chaveiro auto </td>
          </tr>
          <tr style="height: 40px;">
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Troca de pneus furados </td>
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Taxi / Uber </td>
          </tr>
          <tr style="height: 40px;">
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Hospedagem em hotel </td>
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Guarda do veículo acidentado </td>
          </tr>
          <tr style="height: 40px;">
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Lavagem e higienização </td>
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Serviço de leva e traz </td>
          </tr>
          <tr style="height: 40px;">
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;"> Despachantes <span style="font-size:14px">(acidente, furto ou roubo)</span> </td>
            <td style="color:#41434c; font-size:16px;border-bottom:dotted 1px #ddddde;">
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px;height: 138px; ">
          <tr>
            <td align="center">
              <h2 style="font-size:30px">Como contratar</h2>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px;">
          <tr>
            <td> 1. Agende agora a vistoria do seu veículo com o consultor que te enviou essa cotação <br><br>2. Pague da adesão
              no ato da vistoria<br><br>3. Enviamos nosso vistoriador até você para realizar a vistoria do seu veículo<br><br>4.
              Assine o contrato com a Multiplicar e receba seus documentos<br><br>5. Pronto, seu veículo fica protegido imediatamente
              pela Multiplicar <br><br><br>
              <h3>Formas de pagamento e vencimento</h3><br><br>Pagamento através de Boleto Bancário, com vencimento todo dias
              05, 10, 15, 20, 25 e 30 de cada mês com tolerância de 5 dias após vencimento, ficando sem a proteção a partir
              do 1o dia.<br><br>
              <h3>Documentos necessários</h3><br><br>Xerox carteira habilitação; Xerox documentos do veículo; Xerox comprovante
              residência e último boleto da outra proteção.<br><br>Obs:. Os planos oferecidos acima tem como base o valor
              do veículo na tabela Fipe. <br>*A correção dos valores anuais é praticada de acordo com IGP. </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px;height: 110px; ">
          <tr>
            <td align="center">
              <h2 style="font-size:30px">Fale com um consultor</h2>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px;height: 55px;border: solid #82ca70;border-radius: 5px;padding-bottom: 20px;padding-top: 20px;">
          <tr style="font-size:35px;color:#82ca70">
            <td align="center"> 31 3351-4900 </td>
            <td align="center"> <img src="https://multiplicarbrasil.com.br/images/whatsapp.png" alt="ícone"> 97158-5861 </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td>
        <table cellpadding="0" cellspacing="0" style="width: 600px;height: 55px; ">
          <tr>
            <td align="center">Lembrando que é válida até o dia '.$stop_date->format('d/m/Y').' </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="    padding-top: 52px;">
        <table cellpadding="0" cellspacing="0" style="width: 600px;height: 55px;    border-top: solid thin #f4f4f4;">
          <tr>
            <td align="center"> multiplicarbrasil.com.br </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>';

if( $check == 'umapalavrarealmentemuitograndeparaserlembradafeitapormim'){
  if (mail($to, $subject, $corpo, $headers)) {
      echo 'true';
  } else {
      echo 'false';
  }
}

