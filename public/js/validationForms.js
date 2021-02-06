var passwordField = document.getElementById("password");
var passwordConfField = document.getElementById("passwordConf");
var form = document.getElementById("registerForm");
var notifications = document.getElementById("notifications");

function validationForm() {
    if (passwordField.value != passwordConfField.value) {
        notifications.style.visibility = 'visible';
    } else {
        form.submit();
    }
}