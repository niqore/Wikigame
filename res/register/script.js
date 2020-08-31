$(document).on('submit', function (e) {

    $.ajax({
        type: 'POST',
        url: "/register",
        dataType: "text",
        data: {
            login: $("#login")[0].value,
            password: $("#password")[0].value
        },
        success: function (result) {
            if (result === '') {
                window.location.replace("/");
            }
            else {
                $("#error").html(result);
            }
        }
    });

    e.preventDefault();
});