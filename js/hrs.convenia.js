(function(){
    $(document).ready(function(){
        $('.btns.acao p').append('<div class="btn btn-success cp-import">Importar dados para CP</div>');

        $('.cp-import').on('click', function () {
            $('tr.ok').each(function(){
                var dia= $(this).find('td:first-child').text();
                dia = dia.substr(dia.indexOf(",") + 1);
                dia = dia.split("/");
                //converte dia para timestamp
                var date = new Date(dia[2], dia[1] - 1, dia[0]);
                var timestamp = date.getTime();
                var keyDia = timestamp;

                var horaentrada =  $(this).find('td:nth-child(2)').text();
                horaentrada = horaentrada.split(":");
                horaentrada =  convertToTimeStamp(dia[2], dia[1] - 1, dia[0], horaentrada[0], horaentrada[1], horaentrada[2]);

                var horadoalmoco = $(this).find('td:nth-child(3)').text();
                horadoalmoco = horadoalmoco.split(":");
                horadoalmoco = convertToTimeStamp(dia[2], dia[1] - 1, dia[0], horadoalmoco[0], horadoalmoco[1], horadoalmoco[2]);

                var voltadoalmoco = $(this).find('td:nth-child(4)').text();
                voltadoalmoco = voltadoalmoco.split(":");
                voltadoalmoco = convertToTimeStamp(dia[2], dia[1] - 1, dia[0], voltadoalmoco[0], voltadoalmoco[1], voltadoalmoco[2]);

                var horasaida = $(this).find('td:nth-child(5)').text();
                horasaida = horasaida.split(":");
                horasaida = convertToTimeStamp(dia[2], dia[1] - 1, dia[0], horasaida[0], horasaida[1], horasaida[2]);

                var dados = {
                    "entrada":horaentrada,
                    "ida_almoco":horadoalmoco,
                    "volta_almoco":voltadoalmoco,
                    "saida":horasaida,
                    "vpn":"",
                    "obs":"",
                    "ausent":false
                }
                chrome.runtime.sendMessage({ type: "UPDATE_FROM_CONVENIA", data: dados, dia:keyDia}, function(response) {
                    //console.log(response.import);
                });
            });
        });

        function convertToTimeStamp(year, month, day, hours, minutes, seconds) {
            var date = new Date(year, month, day, hours, minutes, seconds);
            var timestamp = date.getTime();
            return timestamp;
        }
    });
})();


