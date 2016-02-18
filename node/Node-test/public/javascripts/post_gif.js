$(function() {
    var player = jwplayer("video-frame");
    var $stitchJson = [];
    player.setup({
        file: "http://localhost:3000/videos/" + videoFile,//"/videos/test-video.mp4", //"http://vod.stream.vrt.be/ketnet_geo/_definst_/mp4:ketnet/2014%2F11%2FBUMBA_IN_AFRIKA_R1A1_20141107_230003_Ketnet2011_GEO_D10.mp4/playlist.m3u8",
        height: 320,
        width: '100%'
    });

    var prevStart = 0;
    var prevStop = 127;
    var screenshot = 63.5;
    var clicked = 0;

    $("#ex1").slider({});
    $("#ex2").slider({});
    $('#ex1').on('change', function(){
        screenshot = $(this).val();
        player.seek(screenshot);
        player.on('seeked', function(){
            player.pause(false);
        });
    });
    $('#ex2').on('change', function(){
        var values = $(this).val().split(',');
        if(prevStart != values[0] && prevStop == values[1]) {
            prevStart = values[0];
            player.seek(prevStart);
            player.onSeek(function(){
                player.pause(false);
            });
        } else if(prevStart == values[0] && prevStop != values[1]) {
            prevStop = values[1];
            player.seek(prevStop);
            player.onSeek(function(){
                player.pause(true);
            });
        }
    });

    $('#generate-btn').on('click', function(event) {
        event.preventDefault();
        var $data =
        {
            start: prevStart,
            stop: prevStop,
            path: videoFile //"test-video.mp4"
        };
        $.post("/gif", $data, function(data){
            $('#gif-container').append(
                '<div class="col-xs-12 col-sm-4 col-md-3 gif-holder">' +
                    '<img class="img-responsive gif-click" src="'+ data['URL'] +
                        '" data-fileName="' + data['fileName'] +
                        '" data-fileExtension="' + data['extension'] + '"/>' +
                    '<a href="#" class="btn btn-success add-gif center-block" data-fileName="' + data['fileName'] +
                        '" data-fileExtension="' + data['extension'] + '">Add for stitching</a>'+
                    '<a href="#" class="btn btn-danger delete-gif disabled center-block" data-fileName="' + data['fileName'] +
                        '" data-fileExtension="' + data['extension'] + '">Delete from stitching</a>'+
                '</div>'
            );
            console.log('success');
        });
    });

    $('#screenshot-btn').on('click', function(event) {
        event.preventDefault();
        var $data =
        {
            start: screenshot,
            path: "test-video.mp4"
        };
        $.post("/screenshot", $data, function(data){
            $('#screenshots-container').append(
                '<div class="col-xs-12 col-sm-4 col-md-3 gif-holder">' +
                    '<img class="img-responsive gif-click" src="'+ data['URL'] +
                        '" data-fileName="' + data['fileName'] +
                        '" data-fileExtension="' + data['extension'] + '"/>' +
                    '<input type="number" value="3" class="form-control duration"/>' +
                    '<a href="#" class="btn btn-success add-img center-block" data-fileName="' + data['fileName'] +
                        '" data-fileExtension="' + data['extension'] + '">Add for stitching</a>'+
                    '<a href="#" class="btn btn-danger delete-img disabled center-block" data-fileName="' + data['fileName'] +
                        '" data-fileExtension="' + data['extension'] + '">Delete from stitching</a>'+
                '</div>'
            );
            console.log('success');
        });
    });

    $.get("/gif", function(data){
        $('#gif-container');
        data.forEach(function(gif) {
            $('#gif-container').append(
                '<div class="col-xs-12 col-sm-4 col-md-3 gif-holder">' +
                    '<img class="img-responsive gif-click" src="' + gif['URL'] + '" ' +
                        'data-fileName="' + gif['fileName'] + '"/>' +
                        '<a href="#" class="btn btn-success add-gif center-block" data-fileName="' + gif['fileName'] +
                    '" data-fileExtension="' + gif['extension'] + '">Add for stitching</a>'+
                        '<a href="#" class="btn btn-danger delete-gif disabled center-block" data-fileName="' + gif['fileName'] +
                    '" data-fileExtension="' + gif['extension'] + '">Delete from stitching</a>'+
                '</div>'
            );
        });
    });

    $.get("/screenshot", function(data){
        $('#screenshots-container');
        data.forEach(function(screenshot) {
            $('#screenshots-container').append(
                '<div class="col-xs-12 col-sm-4 col-md-3 gif-holder">' +
                    '<img class="img-responsive gif-click" src="' + screenshot['URL'] +
                        '" data-fileName="' + screenshot['fileName'] +
                        '" data-fileExtension="' + screenshot['extension'] + '"/>' +
                    '<input type="number" value="3" class="form-control duration" />' +
                    '<a href="#" class="btn btn-success add-img center-block" data-fileName="' + screenshot['fileName'] +
                        '" data-fileExtension="' + screenshot['extension'] + '">Add for stitching</a>'+
                    '<a href="#" class="btn btn-danger delete-img disabled center-block" data-fileName="' + screenshot['fileName'] +
                        '" data-fileExtension="' + screenshot['extension'] + '">Delete from stitching</a>'+
                '</div>'
            );
        });
    });

    $('body').on('click','.add-img',function(e){
        e.preventDefault();
        clicked++;
        $(this).closest('.gif-holder').find('.btn-danger').removeClass('disabled');
        var duration = $(this).closest('.gif-holder').find(':input[type="number"]').val();
        $stitchJson.push(
            {fileName: $(this).data('filename'), fileExtension: $(this).data('fileextension'), duration: duration}
        );
        (clicked >= 2) ? $('#stitch-button').removeClass('disabled') : $('#stitch-button').addClass('disabled');
    });

     $('body').on('click','.add-gif', function(e){
        e.preventDefault();
         $(this).closest('.gif-holder').find('.btn-danger').removeClass('disabled');
        clicked++;
        $stitchJson.push(
            {fileName: $(this).data('filename'), fileExtension: $(this).data('fileextension')}
        );
        (clicked >= 2) ? $('#stitch-button').removeClass('disabled') : $('#stitch-button').addClass('disabled');
    });

    $('body').on('click', '.delete-img', function (e) {
        e.preventDefault();
        $(this).addClass('disabled');
        clicked--;
        (clicked <= 1) ? $('#stitch-button').addClass('disabled') : $('#stitch-button').removeClass('disabled');
        var fileName = $(this).data('filename');
        $stitchJson = $.grep($stitchJson, function( a ) {
            return a.fileName != fileName;
        });
    });

    $('body').on('click', '.delete-gif', function (e) {
        e.preventDefault();
        $(this).addClass('disabled');
        clicked--;
        (clicked <= 1) ? $('#stitch-button').addClass('disabled') : $('#stitch-button').removeClass('disabled');
        var fileName = $(this).data('filename');
        $stitchJson = $.grep($stitchJson, function( a ) {
            return a.fileName != fileName;
        });
    });

    $('#stitch-button').on('click', function(e){
        e.preventDefault();
        $.ajax({
            url: "/stitch",
            type: "POST",
            data: JSON.stringify($stitchJson),
            dataType: "json",
            contentType: "application/json",
            success: function (gif){
                $('#stitched-container').append(
                    '<div class="col-xs-12 col-sm-4 col-md-3 stitched-gif-holder">' +
                        '<img class="img-responsive gif-click" src="' + gif['URL'] +
                            '" data-fileName="' + gif['fileName'] +
                            '" data-fileExtension="' + gif['extension'] + '"/>' +
                        '<a href="#" class="btn btn-success add-gif center-block" data-fileName="' + gif['fileName'] +
                            '" data-fileExtension="' + gif['extension'] + '">Add for stitching</a>'+
                        '<a href="#" class="btn btn-danger delete-gif disabled center-block" data-fileName="' + gif['fileName'] +
                            '" data-fileExtension="' + gif['extension'] + '">Delete from stitching</a>'+
                    '</div>'
                );
                console.log('success');
            }
        });
    });
});