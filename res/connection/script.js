function verifyError() {
    var url = new URL(window.location.href);
    if(url.searchParams.get("error") !== null) {
        $("#error").html("Indentifiants incorrects");
    }
}

window.onload = verifyError;