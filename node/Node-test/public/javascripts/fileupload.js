$(function(){
    $(document.body).on('focus', '.add-on-click' , function () {
        $(this).removeClass('add-on-click');
        var id = parseInt($(this).attr('id'))+1;
        console.log('parse int:',id);
        $('.input-wrapper').append('<input type="text" placeholder="https://www.youtube.com/watch?v=EIyixC9NsLI" id="'+id+'" name="'+id+'" class="form-control center-block add-on-click" />');
    });
});